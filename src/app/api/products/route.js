import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";



const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() { 
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const collection = searchParams.get("collection");

          const category = searchParams.get("category");
        const brand = searchParams.get("brand");

        let query = `
      SELECT DISTINCT
        p.id,
        p.product_number,
        p.name,
        p.description,
        p.price,
        p.discount_percentage,
        c.name AS category,
        b.name AS brand,
        pi.image_url
      FROM products p

      JOIN categories c
        ON p.category_id = c.id

      JOIN brands b
        ON p.brand_id = b.id

      LEFT JOIN product_images pi
        ON p.id = pi.product_id
        AND pi.is_primary = TRUE
    `;

        const values = [];

          const conditions = [];

        // Collection filter
    //     if (collection) {
    //         query += `
    //     JOIN product_collections pc
    //       ON p.id = pc.product_id

    //     JOIN collections col
    //       ON pc.collection_id = col.id

    //     WHERE col.slug = $1
    //   `;

    //         values.push(collection);
    //     }

      if (collection) {

            query += `
                JOIN product_collections pc
                    ON p.id = pc.product_id

                JOIN collections col
                    ON pc.collection_id = col.id
            `;

            conditions.push(`col.slug = $${values.length + 1}`);

            values.push(collection);
        }


                // Category filter
        if (category) {

            const categoryIds = category
                .split(",")
                .map(Number)
                .filter(Boolean);

            if (categoryIds.length > 0) {

                const placeholders = categoryIds.map(
                    (_, index) => `$${values.length + index + 1}`
                );

                conditions.push(
                    `c.id IN (${placeholders.join(", ")})`
                );

                values.push(...categoryIds);
            }
        }


        // Brand filter
        if (brand) {

            const brandIds = brand
                .split(",")
                .map(Number)
                .filter(Boolean);

            if (brandIds.length > 0) {

                const placeholders = brandIds.map(
                    (_, index) => `$${values.length + index + 1}`
                );

                conditions.push(
                    `b.id IN (${placeholders.join(", ")})`
                );

                values.push(...brandIds);
            }
        }


        // Add WHERE only when filters exist
        if (conditions.length > 0) {

            query += `
                WHERE ${conditions.join(" AND ")}
            `;
        }


        query += `
      ORDER BY p.id DESC
    `;

    console.log("Query:", query);
        console.log("Values:", values);


        const result = await pool.query(query, values);

        return NextResponse.json({
            success: true,
            products: result.rows,
        },
            {
                status: 200,
                headers: corsHeaders,
            }
        );

    } catch (error) {
        console.error("Products API Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch products",
            },
            { status: 500,
                headers: corsHeaders,
             }
        );
    }
}