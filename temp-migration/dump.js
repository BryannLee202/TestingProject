const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const sqlConfig = {
    user: 'bookstore_user',
    password: '123456',
    database: 'bookstore',
    server: 'localhost',
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: { encrypt: true, trustServerCertificate: true }
};

async function dumpData() {
    try {
        console.log("Connecting to SQL Server...");
        const pool = await sql.connect(sqlConfig);
        
        // Dump categories
        const catRes = await pool.request().query('SELECT * FROM categories');
        const categories = catRes.recordset;
        
        // Dump books
        const bookRes = await pool.request().query('SELECT * FROM books');
        const books = bookRes.recordset;

        // Dump banners
        const bannerRes = await pool.request().query('SELECT * FROM banners');
        const banners = bannerRes.recordset;

        const outDir = path.join(__dirname, '../backend/src/main/resources/seed_data');
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        fs.writeFileSync(path.join(outDir, 'categories.json'), JSON.stringify(categories, null, 2));
        fs.writeFileSync(path.join(outDir, 'books.json'), JSON.stringify(books, null, 2));
        fs.writeFileSync(path.join(outDir, 'banners.json'), JSON.stringify(banners, null, 2));

        console.log(`Dumped ${categories.length} categories, ${books.length} books, and ${banners.length} banners.`);
        pool.close();
    } catch (err) {
        console.error("Dump failed:", err);
    }
}

dumpData();
