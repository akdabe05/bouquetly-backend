-- Clean up existing tables
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `customer_orders`;
DROP TABLE IF EXISTS `customer_order_items`;
SET FOREIGN_KEY_CHECKS = 1;

-- Create customer_orders table (renamed to avoid MySQL cache issues)
CREATE TABLE `customer_orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `delivery_address` TEXT NOT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `postal_code` VARCHAR(20) DEFAULT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `special_notes` TEXT DEFAULT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `order_status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `order_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Create customer_order_items table
CREATE TABLE `customer_order_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `fk_items_to_orders`
    FOREIGN KEY (`order_id`)
    REFERENCES `customer_orders` (`id`)
    ON DELETE CASCADE
);
