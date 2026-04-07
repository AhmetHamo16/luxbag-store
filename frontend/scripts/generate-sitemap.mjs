import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const sitemapPath = path.join(publicDir, 'sitemap.xml');

const siteUrl = (process.env.VITE_SITE_URL || 'https://meloramoda.com').replace(/\/+$/, '');
const apiUrl = (process.env.VITE_API_URL || 'https://luxbag-store-production.up.railway.app/api').replace(/\/+$/, '');

const staticPages = [
  { loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' },
  { loc: `${siteUrl}/shop`, changefreq: 'daily', priority: '0.9' },
  { loc: `${siteUrl}/about`, changefreq: 'monthly', priority: '0.6' },
  { loc: `${siteUrl}/contact`, changefreq: 'monthly', priority: '0.6' },
];

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const fetchProducts = async () => {
  try {
    const response = await fetch(`${apiUrl}/products`);
    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    const payload = await response.json();
    const rows = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.products)
        ? payload.products
        : [];

    return rows
      .filter((product) => product?.slug || product?._id)
      .map((product) => ({
        loc: `${siteUrl}/product/${encodeURIComponent(product.slug || product._id)}`,
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : undefined,
      }));
  } catch (error) {
    console.warn(`[sitemap] Falling back to static pages only: ${error.message}`);
    return [];
  }
};

const buildEntry = (entry) => {
  const lines = [
    '  <url>',
    `    <loc>${escapeXml(entry.loc)}</loc>`,
  ];

  if (entry.lastmod) {
    lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
  }

  lines.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`);
  lines.push(`    <priority>${escapeXml(entry.priority)}</priority>`);
  lines.push('  </url>');
  return lines.join('\n');
};

const main = async () => {
  const productPages = await fetchProducts();
  const dedupedEntries = Array.from(
    new Map([...staticPages, ...productPages].map((entry) => [entry.loc, entry])).values()
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...dedupedEntries.map(buildEntry),
    '</urlset>',
    '',
  ].join('\n');

  await mkdir(publicDir, { recursive: true });
  await writeFile(sitemapPath, xml, 'utf8');
  console.log(`[sitemap] Wrote ${dedupedEntries.length} URLs to ${sitemapPath}`);
};

await main();
