import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import db from "./db.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(bodyParser.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
console.log('✅ Routes registered: /api/products, /api/orders');

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL');
});

app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM products';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching products:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(results);
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT id, name, price, description, imageUrl AS image FROM products WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error fetching product:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(results[0]);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
