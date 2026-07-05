const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const mysqlConfig = {
  host: 'bjf8ihu44kqfbqwzs1iv-mysql.services.clever-cloud.com',
  user: '***REMOVED_MYSQL_USER***',
  password: '***REMOVED_MYSQL_PASSWORD***',
  database: 'bjf8ihu44kqfbqwzs1iv'
};

const BASE_URL = 'https://yiyibook.store';
const SITEMAP_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

function formatURL(loc, priority, changefreq, lastmod = new Date().toISOString().split('T')[0]) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generateSitemap() {
  console.log('Starting sitemap generation...');
  let connection;
  try {
    connection = await mysql.createConnection(mysqlConfig);
    
    // 1. Fetch Categories
    console.log('Fetching categories from DB...');
    const [categories] = await connection.query('SELECT id FROM categories');
    console.log(`Found ${categories.length} categories.`);

    // 2. Fetch Books
    console.log('Fetching books from DB...');
    const [books] = await connection.query('SELECT id FROM books');
    console.log(`Found ${books.length} books.`);

    // 3. Define Static Pages
    const staticPages = [
      { path: '/', priority: '1.0', freq: 'daily' },
      { path: '/search', priority: '0.8', freq: 'daily' },
      { path: '/flash-sale', priority: '0.9', freq: 'daily' },
      { path: '/coupons', priority: '0.8', freq: 'weekly' },
      { path: '/about', priority: '0.8', freq: 'monthly' },
      { path: '/new-books', priority: '0.9', freq: 'daily' },
      { path: '/used-books', priority: '0.8', freq: 'daily' },
      { path: '/promotions', priority: '0.9', freq: 'daily' },
      { path: '/contact', priority: '0.7', freq: 'monthly' },
      { path: '/terms', priority: '0.5', freq: 'monthly' },
      { path: '/privacy', priority: '0.5', freq: 'monthly' },
      { path: '/payment-privacy', priority: '0.5', freq: 'monthly' },
      { path: '/returns', priority: '0.6', freq: 'monthly' },
      { path: '/warranty', priority: '0.6', freq: 'monthly' },
      { path: '/shipping', priority: '0.6', freq: 'monthly' },
      { path: '/faq', priority: '0.7', freq: 'monthly' },
    ];

    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    console.log('Adding static pages to sitemap...');
    staticPages.forEach(p => {
      xmlContent += formatURL(`${BASE_URL}${p.path}`, p.priority, p.freq) + '\n';
    });

    // Add categories
    console.log('Adding categories to sitemap...');
    categories.forEach(c => {
      xmlContent += formatURL(`${BASE_URL}/category/${c.id}`, '0.8', 'weekly') + '\n';
    });

    // Add books
    console.log('Adding book details to sitemap...');
    books.forEach(b => {
      xmlContent += formatURL(`${BASE_URL}/book/${b.id}`, '0.7', 'daily') + '\n';
    });

    xmlContent += '</urlset>\n';

    // Ensure public folder exists
    const publicDir = path.dirname(SITEMAP_PATH);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(SITEMAP_PATH, xmlContent, 'utf8');
    console.log(`Sitemap successfully written to: ${SITEMAP_PATH}`);

  } catch (error) {
    console.error('Failed to generate sitemap:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

generateSitemap();
