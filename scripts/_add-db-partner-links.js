// One-off script to insert "DB Partner" nav links (desktop, mobile, footer)
// right after the existing "Sobre a DB" links, across every page of the site.
// Run with: node scripts/_add-db-partner-links.js
// Delete this file after use.

const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'pages/atuacao.html',
  'pages/calculadora.html',
  'pages/capacidades.html',
  'pages/faq.html',
  'pages/perfis-de-servico.html',
  'pages/perfis-de-servico_sem-tabela-de-compartivos-de-perfils.html',
  'pages/sobre.html',
  'pages/produtos/db-board.html',
  'pages/produtos/db-hyper.html',
  'pages/produtos/db-noc.html',
  'pages/cases/case-nbs.html',
  'pages/cases/case-sisdev.html',
  'pages/politica/politica.html',
  'pages/politica/termos.html',
  'pages/db-partner.html',
];

const root = process.cwd();

function classify(tag) {
  if (tag.indexOf('class="nav-link"') !== -1) return 'desktop';
  if (tag.indexOf('class="nav-mobile-link"') !== -1) return 'mobile';
  if (tag.indexOf('class="ft-nav-link"') !== -1) return 'footer';
  return null;
}

function snippetFor(kind, href) {
  if (kind === 'desktop') return `<a href="${href}" class="nav-link" role="menuitem">DB Partner</a>`;
  if (kind === 'mobile') return `<a href="${href}" class="nav-mobile-link">DB Partner</a>`;
  if (kind === 'footer') return `<a href="${href}" class="ft-nav-link">DB Partner</a>`;
  return '';
}

files.forEach((rel) => {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${rel}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.indexOf('DB Partner</a>') !== -1) {
    console.log(`SKIP (already has DB Partner link): ${rel}`);
    return;
  }

  const needle = 'Sobre a DB</a';
  const insertions = [];
  let searchFrom = 0;

  while (true) {
    const idx = content.indexOf(needle, searchFrom);
    if (idx === -1) break;
    searchFrom = idx + needle.length;

    const tagStart = content.lastIndexOf('<a', idx);
    if (tagStart === -1) continue;
    const tag = content.slice(tagStart, idx);
    const kind = classify(tag);
    if (!kind) continue;

    const hrefMatch = tag.match(/href="([^"]+)"/);
    if (!hrefMatch) continue;
    const href = hrefMatch[1].replace('sobre.html', 'db-partner.html');

    // Find the end of the closing </a> (handles "</a>" and "</a\n  >" styles)
    const closeGt = content.indexOf('>', idx);
    if (closeGt === -1) continue;

    insertions.push({ pos: closeGt + 1, kind, href });
  }

  if (insertions.length === 0) {
    console.log(`NO MATCH: ${rel}`);
    return;
  }

  // Apply from the end backwards so earlier positions stay valid.
  insertions.sort((a, b) => b.pos - a.pos);
  insertions.forEach(({ pos, kind, href }) => {
    const snippet = snippetFor(kind, href);
    content = content.slice(0, pos) + snippet + content.slice(pos);
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`OK (${insertions.length} link(s) inserted): ${rel}`);
});
