/**
 * A small Markdown renderer for the hand-written guides: headings (with anchors), paragraphs,
 * lists (nested by two spaces), tables, fenced code, block quotes as callouts ("> Note:",
 * "> Tip:", "> Warning:"), images, links, bold, italic and inline code.
 */
export const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function inline(text) {
  const codes = [];
  let out = escapeHtml(text).replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  out = out
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      const external = /^https?:/.test(href);
      return `<a href="${href}"${external ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/ — /g, ' – ');
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
}

/** @returns {{ html: string, headings: {level:number, id:string, text:string}[] }} */
export function markdown(source, { headingOffset = 0 } = {}) {
  const lines = source.replace(/\r/g, '').split('\n');
  const html = [];
  const headings = [];
  let i = 0;

  const isBlockStart = (l) => /^(#{1,4} |```|> |\| |\s*[-*] |\s*\d+\. )/.test(l) || l.trim() === '';

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Raw HTML blocks (a line starting with a tag) pass through until the next blank line.
    if (/^<[a-z]/i.test(line)) {
      const raw = [];
      while (i < lines.length && lines[i].trim()) raw.push(lines[i++]);
      html.push(raw.join('\n'));
      continue;
    }

    const heading = line.match(/^(#{1,4}) (.*)$/);
    if (heading) {
      const level = Math.min(heading[1].length + headingOffset, 6);
      const text = heading[2].trim();
      const id = slugify(text);
      headings.push({ level, id, text: inline(text).replace(/<[^>]+>/g, '') });
      html.push(`<h${level} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      i++;
      html.push(`<pre class="code"${lang ? ` data-lang="${lang}"` : ''}><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    if (line.startsWith('> ')) {
      const body = [];
      while (i < lines.length && lines[i].startsWith('>')) body.push(lines[i++].replace(/^> ?/, ''));
      const kind = (body[0].match(/^(Note|Tip|Warning|Good to know):/) || [])[1];
      if (kind) body[0] = body[0].replace(/^[^:]+:\s*/, '');
      const cls = kind ? kind.toLowerCase().replace(/\s+/g, '-') : 'note';
      html.push(
        `<aside class="callout callout--${cls}">${kind ? `<p class="callout__label">${kind}</p>` : ''}${markdown(body.join('\n')).html}</aside>`,
      );
      continue;
    }

    if (line.startsWith('| ')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const cells = (r) =>
        r
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split(/(?<!\\)\|/)
          .map((c) => c.trim().replace(/\\\|/g, '|'));
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      html.push(
        `<div class="table-wrap"><table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${body
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
          .join('')}</tbody></table></div>`,
      );
      continue;
    }

    if (/^\s*([-*]|\d+\.) /.test(line)) {
      const items = [];
      while (i < lines.length && (/^\s*([-*]|\d+\.) /.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) items.push(lines[i++]);
      html.push(renderList(items));
      continue;
    }

    const para = [];
    while (i < lines.length && !isBlockStart(lines[i])) para.push(lines[i++]);
    if (!para.length) para.push(lines[i++]);
    const text = para.join(' ');
    if (/^!\[[^\]]*\]\([^)]+\)$/.test(text.trim())) {
      const [, alt, src] = text.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      html.push(`<figure class="shot"><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy"><figcaption>${inline(alt)}</figcaption></figure>`);
    } else {
      html.push(`<p>${inline(text)}</p>`);
    }
  }
  return { html: html.join('\n'), headings };
}

function renderList(lines) {
  const indent = (l) => l.match(/^\s*/)[0].length;
  const base = indent(lines[0]);
  const ordered = /^\s*\d+\. /.test(lines[0]);
  const items = [];
  for (const l of lines) {
    if (indent(l) === base && /^\s*([-*]|\d+\.) /.test(l)) items.push({ text: l.replace(/^\s*([-*]|\d+\.) /, ''), children: [] });
    else items.at(-1)?.children.push(l);
  }
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items
    .map((it) => {
      const nested = it.children.filter((c) => /^\s*([-*]|\d+\.) /.test(c));
      const extra = it.children.filter((c) => !/^\s*([-*]|\d+\.) /.test(c)).map((c) => c.trim());
      return `<li>${inline([it.text, ...extra].join(' '))}${nested.length ? renderList(nested) : ''}</li>`;
    })
    .join('')}</${tag}>`;
}
