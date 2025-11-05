import mysql from 'mysql2/promise';

async function checkProducts() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'bouquetly',
    password: '@jwwjjh78',
    database: 'bouquetly'
  });

  console.log('📋 Checking products with image URLs...\n');

  const [products] = await connection.query('SELECT id, name, imageUrl FROM products');
  
  products.forEach(product => {
    console.log(`ID: ${product.id}, Name: ${product.name}, ImageURL: ${product.imageUrl}`);
  });

  await connection.end();
}

checkProducts().catch(console.error);
