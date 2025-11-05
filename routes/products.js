import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/top', (req, res) => {
  const query = `
SELECT 
  id,
  name,
  price,
  description,
  imageUrl,
  category,
  category_id,
  orders_count
FROM products

    ORDER BY orders_count DESC
    LIMIT 4
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching top products:', err);
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(results);
    }
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
SELECT 
  id,
  name,
  price,
  description,
  imageUrl,
  category,
  category_id,
  orders_count
FROM products

    WHERE id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching product by ID:', err);
      res.status(500).json({ error: 'Database error' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json(results[0]);
    }
  });
});

router.post('/:id/increment-orders', (req, res) => {
  const { id } = req.params;
  const query = `
    UPDATE products
    SET orders_count = orders_count + 1
    WHERE id = ?
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error updating orders_count:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Orders count updated successfully' });
  });
});



export default router;
