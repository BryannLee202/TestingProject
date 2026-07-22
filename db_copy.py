import sqlalchemy
from sqlalchemy import create_engine, MetaData

# Source DB (Clever Cloud)
source_url = "mysql+pymysql://***REMOVED_MYSQL_USER***:***REMOVED_MYSQL_PASSWORD***@bjf8ihu44kqfbqwzs1iv-mysql.services.clever-cloud.com:3306/bjf8ihu44kqfbqwzs1iv"

# Target DB (Railway)
target_url = "mysql+pymysql://root:GuiivobJTFPwYMQcfFGCEPTHzDZplejN@reseau.proxy.rlwy.net:19287/railway"

print("Connecting to databases...")
source_engine = create_engine(source_url)
target_engine = create_engine(target_url)

metadata = MetaData()

try:
    print("Reflecting source tables...")
    metadata.reflect(bind=source_engine)
    
    with target_engine.begin() as target_conn:
        print("Disabling foreign key checks on target...")
        target_conn.execute(sqlalchemy.text("SET FOREIGN_KEY_CHECKS=0;"))
        
        # Create tables on target
        print("Creating tables on target...")
        metadata.create_all(bind=target_conn)
        
        for table in metadata.sorted_tables:
            print(f"Copying data for table {table.name}...")
            # Truncate
            target_conn.execute(sqlalchemy.text(f"TRUNCATE TABLE {table.name};"))
            
            with source_engine.connect() as source_conn:
                result = source_conn.execute(table.select())
                rows = result.mappings().all()
                if rows:
                    target_conn.execute(table.insert(), rows)
                    print(f"Copied {len(rows)} rows for table {table.name}.")
                else:
                    print(f"Table {table.name} is empty.")
                    
        print("Re-enabling foreign key checks on target...")
        target_conn.execute(sqlalchemy.text("SET FOREIGN_KEY_CHECKS=1;"))
        
    print("Migration completed successfully!")
except Exception as e:
    print(f"An error occurred: {e}")
