import express from 'express';
import db from '../db.js';

const router = express.Router();

router.post('/', (req, res) => {
  console.log('📦 Received order request');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  
  const { customer, items, total } = req.body;

  if (!customer || !items || !total) {
    console.error('❌ Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.error('❌ Transaction error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const orderQuery = `
      INSERT INTO customer_orders (
        customer_name, 
        customer_email, 
        customer_phone, 
        delivery_address, 
        city, 
        postal_code, 
        payment_method, 
        special_notes, 
        total_amount, 
        order_status,
        order_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;

    const orderValues = [
      customer.fullName,
      customer.email,
      customer.phone,
      customer.address,
      customer.city || '',
      customer.postalCode || '',
      customer.paymentMethod,
      customer.notes || '',
      total
    ];

    db.query(orderQuery, orderValues, (err, orderResult) => {
      if (err) {
        return db.rollback(() => {
          console.error('❌ Error inserting order:', err);
          res.status(500).json({ error: 'Failed to create order' });
        });
      }

      const orderId = orderResult.insertId;

      const itemQuery = `
        INSERT INTO customer_order_items (
          order_id, 
          product_id, 
          product_name, 
          quantity, 
          price,
          subtotal
        ) VALUES ?
      `;

      const itemValues = items.map(item => [
        orderId,
        item.id,
        item.name,
        item.quantity,
        item.price,
        item.quantity * item.price
      ]);

      db.query(itemQuery, [itemValues], (err) => {
        if (err) {
          return db.rollback(() => {
            console.error('❌ Error inserting order items:', err);
            res.status(500).json({ error: 'Failed to create order items' });
          });
        }

        const updateOrdersCountQuery = `
          UPDATE products 
          SET orders_count = orders_count + ? 
          WHERE id = ?
        `;

        let updatesCompleted = 0;
        const totalUpdates = items.length;

        items.forEach(item => {
          db.query(updateOrdersCountQuery, [item.quantity, item.id], (err) => {
            if (err) {
              console.error(`⚠️ Error updating orders count for product ${item.id}:`, err);
            } else {
              console.log(`✅ Updated orders count for product ${item.id} by ${item.quantity}`);
            }

            updatesCompleted++;

            if (updatesCompleted === totalUpdates) {
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error('❌ Error committing transaction:', err);
                    res.status(500).json({ error: 'Failed to complete order' });
                  });
                }

                console.log('✅ Order created successfully:', orderId);
                res.status(201).json({
                  success: true,
                  orderId: orderId,
                  message: 'Order placed successfully'
                });
              });
            }
          });
        });
      });
    });
  });
});

router.get('/', (req, res) => {
  const query = `
    SELECT 
      o.*,
      GROUP_CONCAT(
        JSON_OBJECT(
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id
    ORDER BY o.order_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching orders:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const orders = results.map(order => ({
      ...order,
      items: order.items ? JSON.parse(`[${order.items}]`) : []
    }));

    res.json(orders);
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      o.*,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = ?
    GROUP BY o.id
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error fetching order:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = {
      ...results[0],
      items: JSON.parse(results[0].items)
    };

    res.json(order);
  });
});

router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'confirmed', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const query = 'UPDATE orders SET order_status = ? WHERE id = ?';
  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('❌ Error updating order status:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, message: 'Order status updated' });
  });
});

export default router;
