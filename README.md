This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




//read file for query 
Create collections: 
CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO collections (name, slug)
VALUES
('Men', 'men'),
('Women', 'women'),
('New Arrivals', 'new-arrivals'),
('Trending', 'trending'),
('Sale', 'sale');


Create categories:
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO categories (name)
VALUES
('Jeans'),
('Shirts'),
('T-Shirts'),
('Jackets'),
('Dresses'),
('Tops'),
('Sweaters'),
('Hoodies'),
('Skirts'),
('Shorts'),
('Trousers');


Create brands:
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO brands (name)
VALUES
('Levi''s'),
('Zara'),
('H&M'),
('Nike'),
('Adidas');

Create products:
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    category_id INT NOT NULL,
    brand_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id)
        REFERENCES categories(id),

    FOREIGN KEY (brand_id)
        REFERENCES brands(id)
);

INSERT INTO products
(product_number, name, description, price, discount_percentage, category_id, brand_id)
VALUES
(
    'MEN-JN-001',
    'Slim Fit Jeans',
    'Classic slim fit denim jeans',
    2999,
    20,
    1,
    1
),
(
    'MEN-SH-001',
    'Casual Shirt',
    'Premium cotton casual shirt',
    1999,
    10,
    2,
    2
),
(
    'WOM-DR-001',
    'Summer Dress',
    'Elegant summer dress',
    3499,
    30,
    5,
    3
);

Create product_collections:

CREATE TABLE product_collections (
    product_id INT NOT NULL,
    collection_id INT NOT NULL,

    PRIMARY KEY (product_id, collection_id),

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    FOREIGN KEY (collection_id)
        REFERENCES collections(id)
        ON DELETE CASCADE
);
INSERT INTO product_collections (product_id, collection_id)
VALUES
-- Slim Fit Jeans
(1, 1), -- Men
(1, 3), -- New Arrivals
(1, 4), -- Trending
(1, 5), -- Sale

-- Casual Shirt
(2, 1), -- Men
(2, 4), -- Trending

-- Summer Dress
(3, 2), -- Women
(3, 3), -- New Arrivals
(3, 5); -- Sale


Create product_images:
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 1,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);


INSERT INTO product_images
(product_id, image_url, is_primary, display_order)
VALUES
(1, '/images/jeans-front.jpg', TRUE, 1),
(1, '/images/jeans-back.jpg', FALSE, 2),
(1, '/images/jeans-side.jpg', FALSE, 3),
(1, '/images/jeans-model.jpg', FALSE, 4);

CREATE UNIQUE INDEX one_primary_image_per_product
ON product_images (product_id)
WHERE is_primary = TRUE;


CREATE TABLE sizes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO sizes (name)
VALUES
('XS'),
('S'),
('M'),
('L'),
('XL'),
('XXL'),
('28'),
('30'),
('32'),
('34'),
('36'),
('38');

Create colors:
CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    hex_code VARCHAR(7)
);
INSERT INTO colors (name, hex_code)
VALUES
('Black', '#000000'),
('White', '#FFFFFF'),
('Blue', '#0000FF'),
('Red', '#FF0000'),
('Green', '#008000'),
('Grey', '#808080'),
('Navy Blue', '#000080'),
('Beige', '#F5F5DC');

Create product_variants:

CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    size_id INT NOT NULL,
    color_id INT NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    sku VARCHAR(100) NOT NULL UNIQUE,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    FOREIGN KEY (size_id)
        REFERENCES sizes(id),

    FOREIGN KEY (color_id)
        REFERENCES colors(id),

    UNIQUE (product_id, size_id, color_id)
);
INSERT INTO product_variants
(product_id, size_id, color_id, stock_quantity, sku)
VALUES
(1, 8, 3, 10, 'MEN-JN-001-BLU-30'),
(1, 9, 3, 15, 'MEN-JN-001-BLU-32'),
(1, 10, 3, 8, 'MEN-JN-001-BLU-34'),
(1, 8, 1, 5, 'MEN-JN-001-BLK-30'),
(1, 9, 1, 12, 'MEN-JN-001-BLK-32');
 