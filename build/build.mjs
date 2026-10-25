/**
 * Builds the documentation site into docs/ (served by GitHub Pages).
 *
 * - Guides are Markdown files in content/<group>/<slug>.md with a small front matter block.
 * - Reference pages (sections, blocks, theme settings, templates, snippets, scripts, styles,
 *   metafields) are generated from the theme source, so they never drift from the code.
 * - Screenshots come from shots/ (npm run shots), copied as they are.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import * as theme from './theme.mjs';
import { escapeHtml as esc, inline, markdown, slugify } from './markdown.mjs';

const ROOT = process.cwd();
const OUT = join(ROOT, 'docs');
const SITE = {
  name: 'Hale & Okafor',
  tagline: 'Theme documentation',
  demo: 'https://hale-okafor-zjf5mtr1.myshopify.com',
  repo: 'https://github.com/R-jee/Hale-Okafor-Docs',
  version: theme.themeSettings().info?.theme_version || '1.0.0',
};

/* ------------------------------------------------------------------ pages */

/** @type {{ path: string, group: string, title: string, lead?: string, body: string, headings: any[], order?: number, nav?: string }[]} */
const pages = [];
const addPage = (page) => pages.push(page);

const GROUPS = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'getting-started', title: 'Getting started' },
  { id: 'guides', title: 'Guides' },
  { id: 'theme-settings', title: 'Theme settings' },
  { id: 'sections', title: 'Sections' },
  { id: 'blocks', title: 'Blocks' },
  { id: 'templates', title: 'Templates' },
  { id: 'developers', title: 'Developers' },
  { id: 'support', title: 'Support' },
];

/* Guides from content/ */
function frontMatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  const data = {};
  if (match) for (const line of match[1].split('\n')) {
    const [k, ...v] = line.split(':');
    data[k.trim()] = v.join(':').trim();
  }
  return { data, body: match ? source.slice(match[0].length) : source };
}

for (const group of GROUPS) {
  const dir = join(ROOT, 'content', group.id);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const { data, body } = frontMatter(readFileSync(join(dir, file), 'utf8').replace(/\r/g, ''));
    const { html, headings } = markdown(body);
    const slug = file.replace('.md', '');
    addPage({
      path: group.id === 'introduction' && slug === 'index' ? 'index.html' : `${group.id}/${slug}.html`,
      group: group.id,
      title: data.title || slug,
      lead: data.lead,
      order: Number(data.order || 50),
      body: html,
      headings,
    });
  }
}

/* ------------------------------------------------------------ settings UI */

const TYPE_NAMES = {
  text: 'Text',
  textarea: 'Text area',
  richtext: 'Rich text',
  inline_richtext: 'Inline rich text',
  html: 'HTML',
  liquid: 'Liquid',
  url: 'Link',
  checkbox: 'Checkbox',
  range: 'Range slider',
  number: 'Number',
  select: 'Select',
  radio: 'Choice',
  text_alignment: 'Alignment',
  color: 'Color',
  color_background: 'Gradient',
  color_scheme: 'Color scheme',
  color_scheme_group: 'Color schemes',
  font_picker: 'Font',
  image_picker: 'Image',
  video: 'Video',
  video_url: 'Video URL',
  product: 'Product',
  product_list: 'Products',
  collection: 'Collection',
  collection_list: 'Collections',
  blog: 'Blog',
  article: 'Article',
  page: 'Page',
  link_list: 'Menu',
  metaobject: 'Metaobject',
};

const plain = (s) => String(s ?? '').replace(/<[^>]+>/g, '');

function settingItem(s) {
  const bits = [];
  if (s.options.length)
    bits.push(
      `<ul class="setting__options">${s.options
        .map((o) => `<li><span class="record">${esc(o.label)}</span>${String(o.value) === String(s.default) ? ' <em class="setting__default-tag">default</em>' : ''}</li>`)
        .join('')}</ul>`,
    );
  const meta = [];
  if (s.min !== undefined) meta.push(`${s.min}–${s.max}${s.unit ? ' ' + esc(s.unit) : ''}${s.step && s.step !== 1 ? `, steps of ${s.step}` : ''}`);
  if (s.default !== undefined && !s.options.length && s.type !== 'color_scheme_group') {
    const value = s.type === 'checkbox' ? (s.default ? 'On' : 'Off') : plain(s.default);
    if (String(value).length) meta.push(`Default: <span class="record">${esc(String(value).slice(0, 120))}${s.unit && s.min !== undefined ? '' : ''}</span>`);
  }
  if (s.visible) meta.push(`Shown when <code>${esc(s.visible.replace(/^{{\s*|\s*}}$/g, ''))}</code>`);
  return `<li class="setting" id="setting-${esc(s.id || slugify(s.label))}">
    <div class="setting__head"><strong>${esc(s.label)}</strong><span class="setting__type">${TYPE_NAMES[s.type] || esc(s.type)}</span><code class="setting__id">${esc(s.id || '')}</code></div>
    ${s.info ? `<p class="setting__info">${inline(plain(s.info))}</p>` : ''}
    ${meta.length ? `<p class="setting__meta">${meta.join(' · ')}</p>` : ''}
    ${bits.join('')}
  </li>`;
}

/** Numbered setting groups, as on the reference pages: summary table then one block per group. */
function settingsHtml(groups, { numbered = true, headingLevel = 3, idPrefix = '' } = {}) {
  if (!groups.length) return '<p class="muted">No settings: this part is configured by the theme.</p>';
  const headings = [];
  const summary =
    groups.length > 1
      ? `<div class="table-wrap"><table class="summary"><thead><tr><th>Group</th><th>Settings</th></tr></thead><tbody>${groups
          .map((g, n) => `<tr><td><a href="#${idPrefix}${slugify(g.title)}">${numbered ? `${n + 1}. ` : ''}${esc(g.title)}</a></td><td>${g.settings.map((s) => esc(s.label)).join(', ') || '—'}</td></tr>`)
          .join('')}</tbody></table></div>`
      : '';
  const body = groups
    .map((g, n) => {
      const id = idPrefix + slugify(g.title);
      headings.push({ level: headingLevel, id, text: `${numbered ? `${n + 1}. ` : ''}${g.title}` });
      return `<h${headingLevel} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${numbered ? `<span class="num">${n + 1}</span>` : ''}${esc(g.title)}</h${headingLevel}>
      ${g.notes.map((note) => `<aside class="callout callout--note">${markdown(plain(note)).html}</aside>`).join('')}
      <ul class="settings">${g.settings.map(settingItem).join('')}</ul>`;
    })
    .join('\n');
  return { html: summary + body, headings };
}

/* ------------------------------------------------------ section metadata */

const SECTION_CATEGORIES = [
  {
    id: 'storytelling',
    title: 'Home and story sections',
    lead: 'The studio catalogue: openings, shelves, records, wall text and the rest of the sections a merchant arranges on the home page and content pages.',
  },
  { id: 'films', title: 'Film sections', lead: 'Five video sections, each with its own way of framing a film: an arch, a strip, a vitrine, a wheel and a window.' },
  { id: 'commerce', title: 'Sale room and commissions', lead: 'Sections that sell differently: sealed-bid lots, release records, commissions and studio visits.' },
  { id: 'header-footer', title: 'Header and footer', lead: 'The announcement bar, the label-strip header and the colophon footer, shared by every page.' },
  { id: 'templates', title: 'Template sections', lead: 'The main section of each template: product, collection, cart, search, blog, article, page, 404 and password.' },
  { id: 'utility', title: 'Utility sections', lead: 'Apps, custom Liquid and sections the theme renders on its own (quick view, cart drawer, search results).' },
];
const CATEGORY_OF = (type) => {
  if (type.startsWith('film-')) return 'films';
  if (['announcement-bar', 'header', 'footer'].includes(type)) return 'header-footer';
  if (['sale-room', 'release-record', 'commission-form', 'visit-booking', 'exhibition-cv'].includes(type)) return 'commerce';
  if (type.startsWith('main-') || type === 'collection-banner') return 'templates';
  if (
    ['apps', 'custom-liquid', 'custom-section', 'cart-drawer', 'cart-icon-bubble', 'predictive-search', 'product-card-fragment', 'quick-view', 'pickup-availability', 'product-recommendations', 'product-recommendations-compact'].includes(
      type,
    )
  )
    return 'utility';
  return 'storytelling';
};

/** Screenshot figures for a section or block, when shots/ has them. */
function shotsFor(kind, type, root) {
  const out = [];
  for (const [suffix, label] of [
    ['', 'Desktop'],
    ['-mobile', 'Mobile'],
  ]) {
    const rel = `shots/${kind}/${type}${suffix}.jpg`;
    if (existsSync(join(ROOT, rel))) out.push(`<figure class="shot shot--${suffix ? 'mobile' : 'desktop'}"><img src="${root}${rel}" alt="${esc(type)} on the demo store, ${label.toLowerCase()}" loading="lazy"><figcaption>${label}</figcaption></figure>`);
  }
  return out.length ? `<div class="shots">${out.join('')}</div>` : '';
}

/** Splits a file's header into a one-sentence lead and the rest, without developer asides. */
const describe = (text) => {
  let clean = text
    .replace(/\s+/g, ' ')
    .replace(/\s*\((?:ADR-\d+[^)]*|<[^)]*>[^)]*|[^)]*ADR-\d+[^)]*)\)/g, '')
    .replace(/\s*\(<[a-z-]+>\)/g, '')
    .trim();
  if (!clean) return { lead: '', rest: '' };
  // "Kiln stage: the home page's opening…" → drop the name prefix.
  const prefix = clean.match(/^([^.:]{2,40}):\s+(.*)$/);
  if (prefix) clean = prefix[2].charAt(0).toUpperCase() + prefix[2].slice(1);
  const first = clean.match(/^(.+?[.;])(\s|$)/);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  if (!first) return { lead: clean, rest: '' };
  return { lead: first[1].replace(/;$/, '.'), rest: cap(clean.slice(first[0].length).trim()) };
};

const clip = (s, n) => (s.length > n ? s.slice(0, s.lastIndexOf(' ', n)) + '…' : s);

const usedHtml = (used) =>
  used.length
    ? `<p class="where"><span class="record">Used on</span> ${used
        .map((u) => (u.startsWith('group: ') ? `<span class="chip">${esc(u.replace('group: ', '').replace('-group', ' group'))}</span>` : `<a class="chip" href="ROOT/templates/index.html#${slugify(u)}">${esc(u)}</a>`))
        .join(' ')}</p>`
    : '';

/* ----------------------------------------------------------- sections */

const allSections = theme.sections();
for (const s of allSections) {
  const { lead, rest } = describe(s.header.text);
  const settings = settingsHtml(s.groups);
  const blockList = s.blocks.length
    ? `<h2 id="blocks"><a class="anchor" href="#blocks" aria-hidden="true">#</a>Blocks</h2><p>${
        s.blocks.some((b) => b.type === '@theme') ? 'Accepts theme blocks (any block from the <a href="ROOT/blocks/index.html">Blocks</a> list that fits).' : 'Blocks you can add inside this section:'
      }</p>${s.blocks
        .filter((b) => b.type !== '@theme' && b.type !== '@app')
        .map((b) => `<details class="block-detail"><summary><strong>${esc(b.name)}</strong> <code>${esc(b.type)}</code></summary>${(settingsHtml(b.groups, { numbered: false, headingLevel: 4, idPrefix: b.type + '-' }).html) || ''}</details>`)
        .join('')}${s.blocks.some((b) => b.type === '@app') ? '<p class="muted">Also accepts app blocks.</p>' : ''}`
    : '';
  const headings = [{ level: 2, id: 'settings', text: 'Settings' }, ...(settings.headings || [])];
  if (blockList) headings.push({ level: 2, id: 'blocks', text: 'Blocks' });
  addPage({
    path: `sections/${s.type}.html`,
    group: 'sections',
    nav: CATEGORY_OF(s.type),
    title: s.name,
    lead,
    order: 50,
    body: `${shotsFor('sections', s.type, 'ROOT/')}
      ${rest ? `<div class="howitworks"><p class="record">How it works</p><p>${inline(rest)}</p></div>` : ''}
      <dl class="facts">
        <div><dt>File</dt><dd><code>${s.file}</code></dd></div>
        ${s.presets.length ? `<div><dt>Add it from</dt><dd>Add section → ${esc(s.presets[0])}</dd></div>` : '<div><dt>Add it from</dt><dd>Placed by the template; not in the Add section list</dd></div>'}
        ${s.enabledOn ? `<div><dt>Available in</dt><dd>${esc(JSON.stringify(s.enabledOn).replace(/[{}"[\]]/g, ' ').trim())}</dd></div>` : ''}
        ${s.maxBlocks ? `<div><dt>Max blocks</dt><dd>${s.maxBlocks}</dd></div>` : ''}
      </dl>
      ${usedHtml(s.used)}
      <h2 id="settings"><a class="anchor" href="#settings" aria-hidden="true">#</a>Settings</h2>
      ${typeof settings === 'string' ? settings : settings.html}
      ${blockList}`,
    headings,
  });
}

/* Sections overview */
addPage({
  path: 'sections/index.html',
  group: 'sections',
  title: 'Sections overview',
  lead: `Hale & Okafor has ${allSections.filter((s) => s.presets.length).length} sections you can add from the theme editor, plus the main sections of each template. None of them are Shopify's default sections: each was designed for the theme.`,
  order: 0,
  body: SECTION_CATEGORIES.map((c) => {
    const items = allSections.filter((s) => CATEGORY_OF(s.type) === c.id);
    return `<h2 id="${c.id}"><a class="anchor" href="#${c.id}" aria-hidden="true">#</a>${c.title}</h2><p>${c.lead}</p><div class="cards">${items
      .map((s) => {
        const thumb = existsSync(join(ROOT, `shots/sections/${s.type}.jpg`)) ? `<img src="ROOT/shots/sections/${s.type}.jpg" alt="" loading="lazy">` : '<span class="card__blank" aria-hidden="true"></span>';
        return `<a class="card" href="ROOT/sections/${s.type}.html">${thumb}<span class="card__title">${esc(s.name)}</span><span class="card__text">${esc(clip(describe(s.header.text).lead, 140))}</span></a>`;
      })
      .join('')}</div>`;
  }).join(''),
  headings: SECTION_CATEGORIES.map((c) => ({ level: 2, id: c.id, text: c.title })),
});

/* ------------------------------------------------------------- blocks */

const allBlocks = theme.blocks();
const BLOCK_CATEGORY = (b) => (b.isPrivate ? 'footer' : b.used.some((u) => u.startsWith('product')) ? 'product' : 'content');
const BLOCK_CATEGORIES = [
  { id: 'product', title: 'Product page blocks', lead: 'The object record: the blocks inside the product information section and the alternate product templates.' },
  { id: 'content', title: 'Content blocks', lead: 'Text, images, buttons, groups and spacers for sections that accept theme blocks.' },
  { id: 'footer', title: 'Footer blocks', lead: 'Blocks only the footer uses (their names start with an underscore).' },
];
for (const b of allBlocks) {
  const { lead, rest } = describe(b.header.text);
  const settings = settingsHtml(b.groups);
  addPage({
    path: `blocks/${b.type.replace(/^_/, '')}.html`,
    group: 'blocks',
    nav: BLOCK_CATEGORY(b),
    title: b.name,
    lead,
    order: 50,
    body: `${shotsFor('blocks', b.type, 'ROOT/')}
      ${rest ? `<div class="howitworks"><p class="record">How it works</p><p>${inline(rest)}</p></div>` : ''}
      <dl class="facts"><div><dt>File</dt><dd><code>${b.file}</code></dd></div>${b.accepts.length ? `<div><dt>Accepts</dt><dd>${b.accepts.map((a) => `<code>${esc(a)}</code>`).join(' ')}</dd></div>` : ''}</dl>
      ${usedHtml(b.used)}
      <h2 id="settings"><a class="anchor" href="#settings" aria-hidden="true">#</a>Settings</h2>
      ${typeof settings === 'string' ? settings : settings.html}`,
    headings: [{ level: 2, id: 'settings', text: 'Settings' }, ...(settings.headings || [])],
  });
}
addPage({
  path: 'blocks/index.html',
  group: 'blocks',
  title: 'Blocks overview',
  lead: `Blocks are the pieces inside a section. Hale & Okafor ships ${allBlocks.length} theme blocks: most make up the object record on the product page; the rest are content pieces and footer columns.`,
  order: 0,
  body: BLOCK_CATEGORIES.map(
    (c) =>
      `<h2 id="${c.id}"><a class="anchor" href="#${c.id}" aria-hidden="true">#</a>${c.title}</h2><p>${c.lead}</p><div class="table-wrap"><table><thead><tr><th>Block</th><th>What it does</th></tr></thead><tbody>${allBlocks
        .filter((b) => BLOCK_CATEGORY(b) === c.id)
        .map((b) => `<tr><td><a href="ROOT/blocks/${b.type.replace(/^_/, '')}.html">${esc(b.name)}</a><br><code>${esc(b.type)}</code></td><td>${inline(describe(b.header.text).lead)}</td></tr>`)
        .join('')}</tbody></table></div>`,
  ).join(''),
  headings: BLOCK_CATEGORIES.map((c) => ({ level: 2, id: c.id, text: c.title })),
});

/* ---------------------------------------------------- theme settings */

const ts = theme.themeSettings();
for (const [position, g] of ts.groups.entries()) {
  const settings = settingsHtml(g.groups);
  const intro = existsSync(join(ROOT, 'content', 'theme-settings-intros', `${g.slug}.md`))
    ? markdown(readFileSync(join(ROOT, 'content', 'theme-settings-intros', `${g.slug}.md`), 'utf8')).html
    : '';
  addPage({
    path: `theme-settings/${g.slug}.html`,
    group: 'theme-settings',
    title: g.name,
    lead: `Online Store → Themes → Customize → Theme settings → ${g.name}.`,
    order: 10 + position,
    body: `${intro}${typeof settings === 'string' ? settings : settings.html}`,
    headings: settings.headings || [],
  });
}
addPage({
  path: 'theme-settings/index.html',
  group: 'theme-settings',
  title: 'Theme settings overview',
  lead: 'Global settings apply to every page: logo, colors, type, buttons, the studio record (object numbers, measurements, sold objects), cart, delivery, search, social links, motion and accessibility.',
  order: 0,
  body: `<p>Open them from the theme editor: <strong>Online Store → Themes → Customize</strong>, then the brush icon (<strong>Theme settings</strong>) in the left bar. Changes are saved as a draft until you click <strong>Save</strong>.</p>
  <div class="table-wrap"><table><thead><tr><th>Group</th><th>Settings</th></tr></thead><tbody>${ts.groups
    .map((g) => `<tr><td><a href="ROOT/theme-settings/${g.slug}.html">${esc(g.name)}</a></td><td>${g.groups.flatMap((x) => x.settings.map((s) => esc(s.label))).join(', ')}</td></tr>`)
    .join('')}</tbody></table></div>`,
  headings: [],
});

/* --------------------------------------------------------- templates */

const allTemplates = theme.templates();
const TEMPLATE_URL = {
  index: '/',
  product: '/products/peony-jar',
  'product.lot': '/products/yixing-teapot-with-calligraphy',
  'product.edition': '/products/ash-glaze-bud-vase?view=edition',
  'product.commission': '/products/ash-glaze-bud-vase?view=commission',
  collection: '/collections/tea',
  'collection.archive': '/collections/archive',
  'list-collections': '/collections',
  cart: '/cart',
  search: '/search?q=tea',
  blog: '/blogs/journal',
  article: '/blogs/journal/opening-the-spring-wood-firing',
  page: '/pages/shipping',
  'page.contact': '/pages/contact',
  'page.commission': '/pages/commission',
  'page.studio': '/pages/studio',
  'page.sealed-bids': '/pages/sealed-bids',
  404: '/404-nope',
  password: '/password',
};
addPage({
  path: 'templates/index.html',
  group: 'templates',
  title: 'Templates',
  lead: 'A template decides which sections a kind of page starts with. Hale & Okafor has a template for every page type Shopify requires, plus alternate templates for lots, editions, commissions, the archive and the studio pages.',
  order: 0,
  body: `<p>To give a product, collection or page an alternate template, open it in the Shopify admin and choose the template under <strong>Theme template</strong>. To edit a template, pick it from the page list at the top of the theme editor.</p>
  ${allTemplates
    .map(
      (t) => `<h2 id="${slugify(t.name)}"><a class="anchor" href="#${slugify(t.name)}" aria-hidden="true">#</a>${esc(t.name)}</h2>
      <p><code>${t.file}</code>${TEMPLATE_URL[t.name] ? ` · <a href="${SITE.demo}${TEMPLATE_URL[t.name]}" target="_blank" rel="noopener">See it on the demo store</a>` : ''}${t.name.startsWith('customers/') ? ' · Used only with classic customer accounts; new customer accounts are hosted by Shopify.' : ''}</p>
      ${existsSync(join(ROOT, `shots/templates/${t.name.replace('/', '-')}.jpg`)) ? `<figure class="shot shot--page"><img src="ROOT/shots/templates/${t.name.replace('/', '-')}.jpg" alt="${esc(t.name)} template on the demo store" loading="lazy"></figure>` : ''}
      ${t.sections.length ? `<ol class="template-sections">${t.sections.map((s) => `<li><a href="ROOT/sections/${s.type}.html">${esc(allSections.find((x) => x.type === s.type)?.name || s.type)}</a>${s.disabled ? ' <span class="muted">(hidden)</span>' : ''}</li>`).join('')}</ol>` : '<p class="muted">A Liquid template.</p>'}`,
    )
    .join('')}`,
  headings: allTemplates.map((t) => ({ level: 2, id: slugify(t.name), text: t.name })),
});

/* -------------------------------------------------------- developers */

const allSnippets = theme.snippets();
addPage({
  path: 'developers/snippets.html',
  group: 'developers',
  title: 'Snippets reference',
  lead: `All ${allSnippets.length} snippets, from their {% doc %} headers: what each renders, its parameters and an example call.`,
  order: 30,
  body: allSnippets
    .map(
      (s) => `<h2 id="${s.name}"><a class="anchor" href="#${s.name}" aria-hidden="true">#</a><code>${s.name}</code></h2>
      ${markdown(s.header.text).html}
      ${s.header.params.length ? `<div class="table-wrap"><table class="params"><thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead><tbody>${s.header.params.map((p) => `<tr><td><code>${esc(p.name)}</code>${p.optional ? ' <span class="muted">optional</span>' : ''}</td><td><code>${esc(p.type)}</code></td><td>${inline(p.text)}</td></tr>`).join('')}</tbody></table></div>` : ''}
      ${s.header.example ? `<pre class="code" data-lang="liquid"><code>${esc(s.header.example)}</code></pre>` : ''}`,
    )
    .join(''),
  headings: allSnippets.map((s) => ({ level: 2, id: s.name, text: s.name })),
});

const js = theme.assets('.js');
const css = theme.assets('.css');
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
addPage({
  path: 'developers/javascript.html',
  group: 'developers',
  title: 'JavaScript components',
  lead: `${js.length} ES modules, no framework and no build step. Core modules load on every page; components load only when their element is on the page and needed.`,
  order: 40,
  body: js
    .map((a) => `<h2 id="${slugify(a.name)}"><a class="anchor" href="#${slugify(a.name)}" aria-hidden="true">#</a><code>${a.name}</code> <span class="muted size">${kb(a.bytes)}</span></h2>${markdown(a.text).html}`)
    .join(''),
  headings: js.map((a) => ({ level: 2, id: slugify(a.name), text: a.name })),
});
addPage({
  path: 'developers/stylesheets.html',
  group: 'developers',
  title: 'Stylesheets',
  lead: `${css.length} stylesheets in cascade layers (reset, base, components, sections, utilities). Each section links its own file, so a page loads only the CSS it shows.`,
  order: 50,
  body: `<div class="table-wrap"><table><thead><tr><th>File</th><th>Size</th><th>What it styles</th></tr></thead><tbody>${css
    .map((a) => `<tr><td><code>${a.name}</code></td><td class="record">${kb(a.bytes)}</td><td>${inline(a.text.split('\n')[0] || '')}</td></tr>`)
    .join('')}</tbody></table></div>`,
  headings: [],
});

const defs = theme.catalogDefinitions();
addPage({
  path: 'getting-started/metafields.html',
  group: 'getting-started',
  title: 'Product records: metafields and metaobjects',
  lead: 'The object record (number, dimensions, edition, lead time, materials, making log, maker, series) comes from native Shopify metafields and metaobjects. No app is needed.',
  order: 40,
  body: `${existsSync(join(ROOT, 'content', 'metafields-intro.md')) ? markdown(readFileSync(join(ROOT, 'content', 'metafields-intro.md'), 'utf8')).html : ''}
  <h2 id="metafields"><a class="anchor" href="#metafields" aria-hidden="true">#</a>Metafield definitions</h2>
  <p>Create these in <strong>Settings → Custom data</strong> (or run the demo seed, which creates them for you).</p>
  ${['PRODUCT', 'PRODUCTVARIANT', 'COLLECTION', 'ARTICLE', 'PAGE', 'SHOP']
    .map((owner) => {
      const rows = defs.metafields.filter((m) => m.owner === owner);
      if (!rows.length) return '';
      return `<h3 id="mf-${owner.toLowerCase()}"><a class="anchor" href="#mf-${owner.toLowerCase()}" aria-hidden="true">#</a>${owner.charAt(0) + owner.slice(1).toLowerCase().replace('variant', ' variant')}</h3><div class="table-wrap"><table><thead><tr><th>Name</th><th>Namespace and key</th><th>Type</th><th>Shown</th></tr></thead><tbody>${rows
        .map((m) => `<tr><td>${esc(m.name)}</td><td><code>${esc(m.namespace)}.${esc(m.key)}</code></td><td><code>${esc(m.type)}</code></td><td>${inline(m.description || '')}</td></tr>`)
        .join('')}</tbody></table></div>`;
    })
    .join('')}
  <h2 id="metaobjects"><a class="anchor" href="#metaobjects" aria-hidden="true">#</a>Metaobject definitions</h2>
  ${defs.metaobjects
    .map(
      (o) => `<h3 id="mo-${o.type}"><a class="anchor" href="#mo-${o.type}" aria-hidden="true">#</a>${esc(o.name)} <code>${esc(o.type)}</code></h3><div class="table-wrap"><table><thead><tr><th>Field</th><th>Key</th><th>Type</th></tr></thead><tbody>${o.fields
        .map((f) => `<tr><td>${esc(f.name)}${f.required ? ' <span class="muted">required</span>' : ''}</td><td><code>${esc(f.key)}</code></td><td><code>${esc(f.type)}</code></td></tr>`)
        .join('')}</tbody></table></div>`,
    )
    .join('')}`,
  headings: [
    { level: 2, id: 'metafields', text: 'Metafield definitions' },
    { level: 2, id: 'metaobjects', text: 'Metaobject definitions' },
  ],
});

/* Changelog from the theme */
if (theme.changelog) {
  const { html, headings } = markdown(theme.changelog.replace(/^# .*\n/, ''));
  addPage({ path: 'support/changelog.html', group: 'support', title: 'Changelog', lead: 'What changed in each version of the theme.', order: 90, body: html, headings });
}

/* ------------------------------------------------------------- layout */

const NAV_SUBGROUPS = {
  sections: SECTION_CATEGORIES.map((c) => ({ id: c.id, title: c.title })),
  blocks: BLOCK_CATEGORIES.map((c) => ({ id: c.id, title: c.title })),
};

const sorted = (group) =>
  pages.filter((p) => p.group === group).sort((a, b) => (a.order ?? 50) - (b.order ?? 50) || a.title.localeCompare(b.title));

/** Reading order, for previous/next links. */
const ORDER = GROUPS.flatMap((g) => {
  const list = sorted(g.id);
  if (!NAV_SUBGROUPS[g.id]) return list;
  return [...list.filter((p) => !p.nav), ...NAV_SUBGROUPS[g.id].flatMap((sub) => list.filter((p) => p.nav === sub.id))];
});

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

function nav(current, root) {
  return GROUPS.map((g, n) => {
    const list = sorted(g.id);
    if (!list.length) return '';
    const open = current.group === g.id;
    const link = (p) => `<li><a href="${root}${p.path}"${p === current ? ' aria-current="page"' : ''}>${esc(p.title)}</a></li>`;
    let inner;
    if (NAV_SUBGROUPS[g.id]) {
      inner =
        list.filter((p) => !p.nav).map(link).join('') +
        NAV_SUBGROUPS[g.id]
          .map((sub) => {
            const items = list.filter((p) => p.nav === sub.id);
            if (!items.length) return '';
            const subOpen = current.nav === sub.id;
            return `<li class="nav__sub"><details${subOpen ? ' open' : ''}><summary>${esc(sub.title)} <span class="nav__count">${items.length}</span></summary><ul>${items.map(link).join('')}</ul></details></li>`;
          })
          .join('');
    } else inner = list.map(link).join('');
    return `<details class="nav__group"${open ? ' open' : ''}><summary><span class="nav__numeral">${ROMAN[n]}</span>${esc(g.title)}</summary><ul>${inner}</ul></details>`;
  }).join('');
}

function toc(headings) {
  const items = headings.filter((h) => h.level === 2 || h.level === 3);
  if (items.length < 2) return '';
  return `<nav class="toc" aria-label="On this page"><p class="toc__title">On this page</p><ul>${items
    .map((h) => `<li class="toc__l${h.level}"><a href="#${h.id}">${esc(h.text)}</a></li>`)
    .join('')}</ul></nav>`;
}

function layout(page) {
  const depth = page.path.split('/').length - 1;
  const root = depth ? '../'.repeat(depth) : '';
  const index = ORDER.indexOf(page);
  const prev = ORDER[index - 1];
  const next = ORDER[index + 1];
  const group = GROUPS.find((g) => g.id === page.group);
  const crumbs = [`<a href="${root}index.html">Home</a>`, group && page.path !== 'index.html' ? `<a href="${root}${sorted(group.id)[0]?.path}">${esc(group.title)}</a>` : '', page.path !== 'index.html' ? `<span>${esc(page.title)}</span>` : '']
    .filter(Boolean)
    .join('<span class="crumbs__sep" aria-hidden="true">/</span>');
  const body = page.body.replace(/ROOT\//g, root);
  return `<!doctype html>
<html lang="en" data-theme="auto">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)} · ${esc(SITE.name)} ${SITE.tagline}</title>
<meta name="description" content="${esc(plain(page.lead || '').slice(0, 160))}">
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Space+Mono:wght@400;700&family=Work+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="${root}assets/docs.css">
<script>try{const t=localStorage.getItem('docs-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
<script src="${root}assets/docs.js" defer></script>
</head>
<body data-root="${root}">
<a class="skip" href="#content">Skip to content</a>
<header class="topbar">
  <button class="topbar__menu" type="button" aria-controls="sidebar" aria-expanded="false" data-menu><span class="visually-hidden">Menu</span><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="1.5"/></svg></button>
  <a class="brand" href="${root}index.html"><svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M10 6h12M12 6c0 6-5 8-5 15a9 5 0 0 0 18 0c0-7-5-9-5-15" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 28h24" stroke="currentColor" stroke-width="1.2"/></svg><span class="brand__name">${esc(SITE.name)}</span><span class="brand__tag record">${SITE.tagline}</span></a>
  <div class="search" role="search">
    <label class="visually-hidden" for="search">Search the docs</label>
    <input id="search" type="search" placeholder="Search sections, settings, guides…" autocomplete="off" data-search>
    <kbd class="search__key" aria-hidden="true">/</kbd>
    <div class="search__results" role="listbox" hidden data-results></div>
  </div>
  <a class="topbar__link record" href="${SITE.demo}" target="_blank" rel="noopener">Demo store</a>
  <button class="topbar__theme" type="button" data-theme-toggle aria-label="Switch light or dark"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="1.5"/></svg></button>
</header>
<div class="frame">
  <aside class="sidebar" id="sidebar"><nav class="nav" aria-label="Documentation">${nav(page, root)}</nav><p class="sidebar__version record">Theme version ${esc(SITE.version)}</p></aside>
  <main class="content" id="content">
    <nav class="crumbs record" aria-label="Breadcrumb">${crumbs}</nav>
    <article class="doc">
      <header class="doc__header">
        <p class="doc__group record">${esc(group?.title || '')}</p>
        <h1>${esc(page.title)}</h1>
        ${page.lead ? `<p class="doc__lead">${inline(plain(page.lead))}</p>` : ''}
      </header>
      ${body}
    </article>
    <nav class="pager" aria-label="Previous and next">
      ${prev ? `<a class="pager__link" href="${root}${prev.path}"><span class="record">Previous</span>${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a class="pager__link pager__link--next" href="${root}${next.path}"><span class="record">Next</span>${esc(next.title)}</a>` : ''}
    </nav>
    <footer class="foot record">© ${new Date().getFullYear()} ${esc(SITE.name)} theme · <a href="${root}support/support.html">Support</a> · <a href="https://forms.gle/GX1VWC5YcmNa83U46" target="_blank" rel="noopener">Contact form</a> · <a href="${SITE.repo}" target="_blank" rel="noopener">Source of these docs</a></footer>
  </main>
  ${toc(page.headings || [])}
</div>
</body>
</html>`;
}

/* ------------------------------------------------------------- write */

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const page of pages) {
  const file = join(OUT, page.path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, layout(page));
}

/* Search index: titles, leads, headings and setting labels. */
const index = pages.map((p) => ({
  t: p.title,
  u: p.path,
  g: GROUPS.find((g) => g.id === p.group)?.title || '',
  l: plain(p.lead || '').slice(0, 160),
  h: (p.headings || []).map((h) => plain(h.text)).join(' · ').slice(0, 600),
  x: plain(p.body)
    .replace(/\s+/g, ' ')
    .slice(0, 1600),
}));
writeFileSync(join(OUT, 'search-index.json'), JSON.stringify(index));

cpSync(join(ROOT, 'src'), join(OUT, 'assets'), { recursive: true });
if (existsSync(join(ROOT, 'shots'))) cpSync(join(ROOT, 'shots'), join(OUT, 'shots'), { recursive: true });
writeFileSync(join(OUT, '.nojekyll'), '');
writeFileSync(
  join(OUT, '404.html'),
  layout({ path: '404.html', group: '', title: 'Page not found', lead: 'That page isn’t in the docs. Try the search above, or start from the overview.', body: '<p><a class="button" href="index.html">Back to the overview</a></p>', headings: [] }),
);
console.log(`Built ${pages.length} pages into docs/`);
