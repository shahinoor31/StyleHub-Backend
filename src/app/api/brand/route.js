import { pool } from "../../../../lib/db";

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

export async function GET() {
    try{
        const result = await pool.query("SELECT * FROM brands");
        return Response.json(
            {
                status: "success",
                message: "Brands fetched successfully",
                data: result.rows
            }
            ,
            {
                status: 200,
                headers: corsHeaders
            }
        )
    }
    catch(error){
        console.error("Error fetching brands:", error);
        return Response.json(
            {
                status: "error",
                message: "Failed to fetch brands",
            },
            {
                status: 500,
                headers: corsHeaders
            }
        );
    }
}