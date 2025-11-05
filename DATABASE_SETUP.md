# Database Setup for Orders

## Run this SQL file to create the orders tables

### Option 1: Using MySQL Command Line
```bash
mysql -u bouquetly -p bouquetly < create_orders_tables.sql
```

### Option 2: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open the file `create_orders_tables.sql`
4. Execute the script

### Option 3: From MySQL CLI
```sql
USE bouquetly;
SOURCE create_orders_tables.sql;
```

## Tables Created
- `orders` - Stores customer order information
- `order_items` - Stores individual items in each order

## Verify Tables
```sql
USE bouquetly;
SHOW TABLES;
DESCRIBE orders;
DESCRIBE order_items;
```
