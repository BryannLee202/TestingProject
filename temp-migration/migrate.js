const sql = require('mssql');
const mysql = require('mysql2/promise');

const sqlConfig = {
    user: 'bookstore_user',
    password: '123456',
    database: 'bookstore',
    server: 'localhost',
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: { encrypt: true, trustServerCertificate: true }
};

const mysqlConfig = {
    host: 'bjf8ihu44kqfbqwzs1iv-mysql.services.clever-cloud.com',
    user: '***REMOVED_MYSQL_USER***',
    password: '***REMOVED_MYSQL_PASSWORD***',
    database: 'bjf8ihu44kqfbqwzs1iv',
    multipleStatements: true
};

async function migrate() {
    try {
        console.log("Connecting to SQL Server...");
        const mssqlPool = await sql.connect(sqlConfig);
        console.log("Connected to SQL Server.");
        
        console.log("Connecting to MySQL...");
        const mysqlPool = await mysql.createConnection(mysqlConfig);
        console.log("Connected to MySQL.");

        // Fetch data
        const categories = (await mssqlPool.request().query('SELECT * FROM categories')).recordset;
        const books = (await mssqlPool.request().query('SELECT * FROM books')).recordset;
        const banners = (await mssqlPool.request().query('SELECT * FROM banners')).recordset;
        const additionalImages = (await mssqlPool.request().query('SELECT * FROM book_additional_images')).recordset;

        console.log(`Fetched ${categories.length} categories, ${books.length} books, ${banners.length} banners, ${additionalImages.length} additional images.`);

        // Disable FK checks and truncate
        console.log("Wiping existing data in MySQL...");
        await mysqlPool.query(`
            SET FOREIGN_KEY_CHECKS = 0;
            TRUNCATE TABLE book_additional_images;
            TRUNCATE TABLE books;
            TRUNCATE TABLE categories;
            TRUNCATE TABLE banners;
        `);

        // Insert categories
        console.log("Inserting categories...");
        for (const c of categories) {
            await mysqlPool.query(
                'INSERT INTO categories (id, name, description, image_url, is_featured) VALUES (?, ?, ?, ?, ?)',
                [c.id, c.name, c.description, c.image_url, c.is_featured ? 1 : 0]
            );
        }

        // Insert books
        console.log("Inserting books...");
        for (const b of books) {
            await mysqlPool.query(
                `INSERT INTO books (id, title, author, publisher, description, price, old_price, discount, 
                stock_quantity, image_url, average_rating, review_count, sales_count, is_combo, is_featured, category_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [b.id, b.title, b.author, b.publisher, b.description, b.price, b.old_price, b.discount,
                 b.stock_quantity, b.image_url, b.average_rating, b.review_count, b.sales_count, b.is_combo ? 1 : 0, b.is_featured ? 1 : 0, b.category_id]
            );
        }

        // Insert banners
        console.log("Inserting banners...");
        for (const b of banners) {
            await mysqlPool.query(
                'INSERT INTO banners (id, title, image_url, link_url, position) VALUES (?, ?, ?, ?, ?)',
                [b.id, b.title, b.image_url, b.link_url, b.position]
            );
        }

        // Insert additional images
        console.log("Inserting additional images...");
        for (const img of additionalImages) {
            await mysqlPool.query(
                'INSERT INTO book_additional_images (book_id, image_url) VALUES (?, ?)',
                [img.book_id, img.image_url]
            );
        }

        await mysqlPool.query('SET FOREIGN_KEY_CHECKS = 1;');

        console.log("Migration completed successfully!");
        mssqlPool.close();
        mysqlPool.end();
    } catch (err) {
        console.error("Migration failed:", err);
    }
}

migrate();
