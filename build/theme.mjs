/**
 * Reads the Hale & Okafor theme source (schemas, locales, doc headers, templates) into plain data for
 * the docs pages. Nothing here is hand-maintained: settings tables always match the theme.
 *
 * THEME_DIR points at the theme repository (default: ../shopify-theme-solenne).
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

export const THEME_DIR = process.env.THEME_DIR || join(process.cwd(), '..', 'shopify-theme-solenne');

const read = (p) => readFileSync(join(THEME_DIR, p), 'utf8');
const json = (p) => JSON.parse(read(p).replace(/^﻿/, '').replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
const list = (dir, ext) =>
  existsSync(join(THEME_DIR, dir))
    ? readdirSync(join(THEME_DIR, dir))
        .filter((f) => f.endsWith(ext))
        .sort()
    : [];

const schemaLocale = json('locales/en.default.schema.json');
const storefrontLocale = json('locales/en.default.json');

/** Resolves a "t:path.to.key" string through the English schema locale. */
export function tr(value) {
  if (typeof value !== 'string' || !value.startsWith('t:')) return value;
  const found = value
    .slice(2)
    .split('.')
    .reduce((node, key) => (node && typeof node === 'object' ? node[key] : undefined), schemaLocale);
  return typeof found === 'string' ? found : value.slice(2);
}

/** Resolves a storefront translation key ("collections.filters.clear_all"). */
export function st(key) {
  const found = key.split('.').reduce((node, k) => (node && typeof node === 'object' ? node[k] : undefined), storefrontLocale);
  return typeof found === 'string' ? found : key;
}

/** The {% schema %} JSON of a Liquid file, or null. */
function schemaOf(source) {
  const match = source.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

/** The leading {% doc %} or {% comment %} block, as text (with @param/@example split out). */
function headerOf(source) {
  const match =
    source.match(/^\s*{%-?\s*doc\s*-?%}([\s\S]*?){%-?\s*enddoc\s*-?%}/) ||
    source.match(/^\s*{%-?\s*comment\s*-?%}([\s\S]*?){%-?\s*endcomment\s*-?%}/);
  if (!match) return { text: '', params: [], example: '' };
  const lines = match[1].split('\n').map((l) => l.replace(/^ {2}/, ''));
  const params = [];
  const text = [];
  let example = '';
  let inExample = false;
  for (const line of lines) {
    const param = line.match(/^\s*@param\s+\{([^}]+)\}\s+(\[?[\w.]+\]?)\s*-?\s*(.*)$/);
    if (param) {
      params.push({ type: param[1], name: param[2].replace(/[[\]]/g, ''), optional: param[2].startsWith('['), text: param[3] });
      inExample = false;
    } else if (/^\s*@example/.test(line)) {
      inExample = true;
    } else if (inExample) {
      example += line + '\n';
    } else {
      text.push(line);
    }
  }
  return { text: text.join('\n').trim(), params, example: example.trim() };
}

/** Settings grouped under their "header" settings: [{ title, note, settings: [...] }]. */
export function groupSettings(settings = []) {
  const groups = [{ title: 'General', notes: [], settings: [] }];
  for (const s of settings) {
    if (s.type === 'header') {
      groups.push({ title: tr(s.content), notes: s.info ? [tr(s.info)] : [], settings: [] });
    } else if (s.type === 'paragraph') {
      groups.at(-1).notes.push(tr(s.content));
    } else {
      groups.at(-1).settings.push({
        id: s.id,
        type: s.type,
        label: tr(s.label) || s.id,
        info: s.info ? tr(s.info) : '',
        default: s.default === undefined ? undefined : tr(s.default),
        options: (s.options || []).map((o) => ({ value: o.value, label: tr(o.label) })),
        min: s.min,
        max: s.max,
        step: s.step,
        unit: s.unit ? tr(s.unit) : '',
        visible: s.visible_if || '',
      });
    }
  }
  return groups.filter((g) => g.settings.length || g.notes.length);
}

/** Where each section/block type appears: { type: [template names] }. */
function usage() {
  const used = {};
  const add = (type, where) => {
    (used[type] ||= new Set()).add(where);
  };
  const walkBlocks = (blocks, where) => {
    for (const b of Object.values(blocks || {})) {
      if (b.type) add(b.type, where);
      walkBlocks(b.blocks, where);
    }
  };
  const templateFiles = [
    ...list('templates', '.json').map((f) => `templates/${f}`),
    ...list('templates/customers', '.json').map((f) => `templates/customers/${f}`),
    ...list('sections', '.json').map((f) => `sections/${f}`),
  ];
  for (const file of templateFiles) {
    const data = json(file);
    const where = file.replace(/^templates\//, '').replace(/^sections\//, 'group: ').replace('.json', '');
    for (const sec of Object.values(data.sections || {})) {
      add(sec.type, where);
      walkBlocks(sec.blocks, where);
    }
  }
  return Object.fromEntries(Object.entries(used).map(([k, v]) => [k, [...v]]));
}
export const USED = usage();

export function sections() {
  return list('sections', '.liquid').map((file) => {
    const source = read(`sections/${file}`);
    const schema = schemaOf(source) || {};
    const type = basename(file, '.liquid');
    return {
      type,
      file: `sections/${file}`,
      name: tr(schema.name) || type,
      header: headerOf(source),
      groups: groupSettings(schema.settings),
      blocks: (schema.blocks || []).map((b) => ({ type: b.type, name: tr(b.name) || b.type, groups: groupSettings(b.settings) })),
      presets: (schema.presets || []).map((p) => tr(p.name)),
      enabledOn: schema.enabled_on || null,
      disabledOn: schema.disabled_on || null,
      maxBlocks: schema.max_blocks,
      used: USED[type] || [],
      hasSchema: Boolean(schemaOf(source)),
    };
  });
}

export function blocks() {
  return list('blocks', '.liquid').map((file) => {
    const source = read(`blocks/${file}`);
    const schema = schemaOf(source) || {};
    const type = basename(file, '.liquid');
    return {
      type,
      file: `blocks/${file}`,
      name: tr(schema.name) || type,
      header: headerOf(source),
      groups: groupSettings(schema.settings),
      accepts: (schema.blocks || []).map((b) => b.type),
      isPrivate: type.startsWith('_'),
      used: USED[type] || [],
    };
  });
}

export function snippets() {
  return list('snippets', '.liquid').map((file) => {
    const source = read(`snippets/${file}`);
    return { name: basename(file, '.liquid'), file: `snippets/${file}`, header: headerOf(source) };
  });
}

export function themeSettings() {
  const schema = json('config/settings_schema.json');
  const info = schema.find((g) => g.name === 'theme_info');
  return {
    info,
    groups: schema
      .filter((g) => g.name !== 'theme_info')
      .map((g) => ({ name: tr(g.name), slug: tr(g.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'), groups: groupSettings(g.settings) })),
  };
}

export function templates() {
  const files = [
    ...list('templates', '.json').map((f) => `templates/${f}`),
    ...list('templates', '.liquid').map((f) => `templates/${f}`),
    ...list('templates/customers', '.json').map((f) => `templates/customers/${f}`),
  ];
  return files.map((file) => {
    const name = file.replace('templates/', '').replace(/\.(json|liquid)$/, '');
    if (file.endsWith('.liquid')) return { name, file, sections: [], liquid: true };
    const data = json(file);
    const order = data.order || Object.keys(data.sections || {});
    return {
      name,
      file,
      layout: data.layout,
      sections: order.map((key) => ({ key, type: data.sections[key]?.type, disabled: data.sections[key]?.disabled })),
    };
  });
}

/** The leading block comment of a JS or CSS asset. */
export function assets(ext) {
  return list('assets', ext).map((file) => {
    const source = read(`assets/${file}`);
    const match = source.match(/^\s*\/\*\*?([\s\S]*?)\*\//);
    const text = match ? match[1].replace(/^\s*\* ?/gm, '').trim() : '';
    return { file: `assets/${file}`, name: file, text, bytes: Buffer.byteLength(source) };
  });
}

export function catalogDefinitions() {
  const path = 'scripts/seed/catalogs/kiln.json';
  if (!existsSync(join(THEME_DIR, path))) return { metafields: [], metaobjects: [] };
  const catalog = json(path);
  return catalog.definitions || { metafields: [], metaobjects: [] };
}

export function locales() {
  return list('locales', '.json')
    .filter((f) => !f.includes('schema'))
    .map((f) => f.replace('.json', '').replace('.default', ''));
}

export const pkg = json('package.json');
export const changelog = existsSync(join(THEME_DIR, 'CHANGELOG.md')) ? read('CHANGELOG.md') : '';
