// Hale & Okafor docs: search, light/dark switch, mobile menu and the "on this page" highlight.
(() => {
  const root = document.body.dataset.root || '';

  /* Light / dark */
  const toggle = document.querySelector('[data-theme-toggle]');
  toggle?.addEventListener('click', () => {
    const html = document.documentElement;
    const dark = html.dataset.theme === 'dark' || (html.dataset.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    html.dataset.theme = dark ? 'light' : 'dark';
    try {
      localStorage.setItem('docs-theme', html.dataset.theme);
    } catch (e) {}
  });

  /* Mobile menu */
  const menu = document.querySelector('[data-menu]');
  const sidebar = document.getElementById('sidebar');
  menu?.addEventListener('click', () => {
    const open = sidebar.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar?.classList.contains('is-open')) {
      sidebar.classList.remove('is-open');
      menu.setAttribute('aria-expanded', 'false');
      menu.focus();
    }
  });
  sidebar?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'center' });

  /* Search */
  const input = document.querySelector('[data-search]');
  const results = document.querySelector('[data-results]');
  let index = null;
  let active = -1;
  const load = () => (index ??= fetch(root + 'search-index.json').then((r) => r.json()));
  const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function score(entry, terms) {
    let total = 0;
    for (const term of terms) {
      const t = entry.t.toLowerCase();
      if (t === term) total += 40;
      else if (t.startsWith(term)) total += 25;
      else if (t.includes(term)) total += 15;
      else if (entry.h.toLowerCase().includes(term)) total += 8;
      else if (entry.l.toLowerCase().includes(term)) total += 6;
      else if (entry.x.toLowerCase().includes(term)) total += 2;
      else return 0;
    }
    return total;
  }

  async function run() {
    const query = input.value.trim().toLowerCase();
    if (query.length < 2) {
      results.hidden = true;
      return;
    }
    const data = await load();
    const terms = query.split(/\s+/);
    const hits = data
      .map((entry) => ({ entry, s: score(entry, terms) }))
      .filter((h) => h.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12);
    active = -1;
    results.innerHTML = hits.length
      ? hits.map(({ entry }, i) => `<a class="search__result" role="option" id="sr-${i}" href="${root}${entry.u}"><strong>${escape(entry.t)}</strong><span>${escape(entry.g)}${entry.l ? ' · ' + escape(entry.l.slice(0, 90)) : ''}</span></a>`).join('')
      : `<p class="search__empty">Nothing found for “${escape(input.value)}”.</p>`;
    results.hidden = false;
  }

  input?.addEventListener('input', run);
  input?.addEventListener('focus', load);
  input?.addEventListener('keydown', (e) => {
    const items = [...results.querySelectorAll('.search__result')];
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((el, i) => el.setAttribute('aria-selected', String(i === active)));
      items[active].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && items.length) {
      e.preventDefault();
      location.href = items[Math.max(active, 0)].href;
    } else if (e.key === 'Escape') {
      results.hidden = true;
    }
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search')) results.hidden = true;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== input && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      input.focus();
    }
  });

  /* On this page */
  const links = [...document.querySelectorAll('.toc a')];
  if (links.length) {
    const targets = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          links.forEach((a) => a.classList.toggle('is-active', a.hash === '#' + entry.target.id));
        }
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );
    targets.forEach((t) => observer.observe(t));
  }
})();
