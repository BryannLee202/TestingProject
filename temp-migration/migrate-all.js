const sql = require('mssql');
const mysql = require('mysql2/promise');

const sqlConfig = {
    user: 'bookstore_user', password: '123456', database: 'bookstore', server: 'localhost',
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: { encrypt: true, trustServerCertificate: true }
};

const mysqlConfig = {
    host: 'bjf8ihu44kqfbqwzs1iv-mysql.services.clever-cloud.com', user: '***REMOVED_MYSQL_USER***',
    password: '***REMOVED_MYSQL_PASSWORD***', database: 'bjf8ihu44kqfbqwzs1iv', multipleStatements: true
};

async function migrate() {
    try {
        const mssqlPool = await sql.connect(sqlConfig);
        const mysqlPool = await mysql.createConnection(mysqlConfig);
        
        // 1. Get all tables from MySQL
        const [mysqlTables] = await mysqlPool.query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = 'bjf8ihu44kqfbqwzs1iv'");
        const tables = mysqlTables.map(t => t.TABLE_NAME);
        console.log("Tables in MySQL:", tables);

        await mysqlPool.query('SET FOREIGN_KEY_CHECKS = 0;');

        for (const table of tables) {
            console.log(`Migrating table: ${table}...`);
            
            // Get columns of MySQL table
            const [mysqlCols] = await mysqlPool.query(`SHOW COLUMNS FROM ${table}`);
            const colNames = mysqlCols.map(c => c.Field);
            
            // Get data from SQL Server (skip if table doesn't exist in SQL server)
            let rows;
            try {
                const res = await mssqlPool.request().query(`SELECT * FROM ${table}`);
                rows = res.recordset;
            } catch(e) {
                console.log(`Table ${table} not found in SQL Server or error. Skipping.`);
                continue;
            }

            if(rows.length === 0) {
                console.log(`Table ${table} is empty. Truncating in MySQL anyway.`);
                await mysqlPool.query(`TRUNCATE TABLE ${table}`);
                continue;
            }

            console.log(`Found ${rows.length} rows for ${table}. Truncating MySQL table...`);
            await mysqlPool.query(`TRUNCATE TABLE ${table}`);
            
            // Map keys
            const keysInSqlServer = Object.keys(rows[0]);
            
            for (let row of rows) {
                let insertCols = [];
                let placeholders = [];
                let values = [];
                for (let col of colNames) {
                    // find matching col in SQL server
                    let matchKey = keysInSqlServer.find(k => k.toLowerCase() === col.toLowerCase());
                    // fallback heuristics
                    if(!matchKey) {
                        if(col === 'is_featured') matchKey = keysInSqlServer.find(k => k.toLowerCase() === 'featured');
                        if(col === 'is_combo') matchKey = keysInSqlServer.find(k => k.toLowerCase() === 'combo');
                        // try replacing underscores
                        if(!matchKey) matchKey = keysInSqlServer.find(k => k.toLowerCase().replace(/_/g,'') === col.toLowerCase().replace(/_/g,''));
                    }

                    if(matchKey) {
                        insertCols.push(col);
                        placeholders.push('?');
                        let val = row[matchKey];
                        // convert boolean to tinyint
                        if (typeof val === 'boolean') val = val ? 1 : 0;
                        values.push(val);
                    }
                }
                
                const query = `INSERT INTO ${table} (${insertCols.join(', ')}) VALUES (${placeholders.join(', ')})`;
                try {
                    await mysqlPool.query(query, values);
                } catch(e) {
                    console.error(`Error inserting into ${table}:`, e.message);
                }
            }
            console.log(`Done migrating ${table}.`);
        }

        await mysqlPool.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log("ALL TABLES MIGRATED SUCCESSFULLY.");
        
        mssqlPool.close();
        mysqlPool.end();
    } catch(err) {
        console.error(err);
    }
}
migrate();
