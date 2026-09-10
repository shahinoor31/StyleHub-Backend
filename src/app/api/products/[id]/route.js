import { NextResponse } from "next/server";
import { pool } from "../../../../../lib/db";

const corsHeaders = {
    "Access-Control-Allow-Origin": 'https://style-hub-frontend-murex.vercel.app' || 'http://localhost:5173',
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
}

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Get product
        const productResult = await pool.query(
            `
            SELECT
                p.id,
                p.product_number,
                p.name,
                p.description,
                p.price,
                p.discount_percentage,

                c.id AS category_id,
                c.name AS category,

                b.id AS brand_id,
                b.name AS brand

            FROM products p

            JOIN categories c
                ON p.category_id = c.id

            JOIN brands b
                ON p.brand_id = b.id

            WHERE p.id = $1
            `,
            [id]
        );

        if (productResult.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Product not found",
                },
                {
                    status: 404,
                    headers: corsHeaders,
                }
            );
        }

        const product = productResult.rows[0];

        // Get images
        const imagesResult = await pool.query(
            `
            SELECT
                id,
                image_url,
                is_primary,
                display_order

            FROM product_images

            WHERE product_id = $1

            ORDER BY display_order ASC
            `,
            [id]
        );

        // Get variants
        const variantsResult = await pool.query(
            `
            SELECT
                pv.id,
                pv.sku,
                pv.stock_quantity,

                s.id AS size_id,
                s.name AS size,

                c.id AS color_id,
                c.name AS color,
                c.hex_code

            FROM product_variants pv

            JOIN sizes s
                ON pv.size_id = s.id

            JOIN colors c
                ON pv.color_id = c.id

            WHERE pv.product_id = $1

            ORDER BY pv.id ASC
            `,
            [id]
        );

        return NextResponse.json(
            {
                success: true,

                product: {
                    ...product,
                    images: imagesResult.rows,
                    variants: variantsResult.rows,
                },
            },
            {
                status: 200,
                headers: corsHeaders,
            }
        );

    } catch (error) {

        console.error("Product Detail API Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch product details",
                error: error.message,
            },
            {
                status: 500,
                headers: corsHeaders,
            }
        );
    }
}