import { getCollection } from 'astro:content';

export const prerender = true;

const getSiteUrl = () => {
  const site = import.meta.env.SITE;
  if (!site) {
    throw new Error('Missing SITE environment variable in Astro config');
  }
  return site.endsWith('/') ? site : `${site}/`;
};

const buildUrl = (path: string) => {
  const trimmedPath = path.replace(/^\/+/, '');
  return new URL(trimmedPath, getSiteUrl()).href;
};

const formatUrl = (path: string, lastmod?: string) => {
  return `  <url>\n    <loc>${buildUrl(path)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`;
};

const toIsoDate = (value?: string | Date) => {
  if (!value) return undefined;
  return new Date(value).toISOString();
};

export async function GET() {
  const blog = await getCollection('blog');
  const store = await getCollection('store');

  const tags = Array.from(
    new Set(blog.flatMap((post) => post.data.tags ?? []))
  );

  const urls = [
    '',
    'blog',
    'cv',
    'projects',
    'services',
    'store',
    'rss.xml',
    ...tags.map((tag) => `blog/tag/${tag}`),
    ...blog.map((post) => `blog/${post.slug}`),
    ...store.map((item) => `store/${item.slug}`),
  ];

  const urlset = urls
    .map((path) => {
      if (path.startsWith('blog/') && path !== 'blog') {
        const post = blog.find((item) => `blog/${item.slug}` === path);
        if (post) {
          return formatUrl(path, toIsoDate(post.data.updatedDate ?? post.data.pubDate));
        }
      }
      if (path.startsWith('store/') && path !== 'store') {
        const item = store.find((entry) => `store/${entry.slug}` === path);
        if (item) {
          return formatUrl(path, toIsoDate(item.data.updatedDate));
        }
      }
      return formatUrl(path);
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
