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


export async function GET() {
    try{
        const result = await pool.query("select * from mens");
        return Response.json(
            {
                success: true,
                message: "Data fetched successfully",
                data: result.rows,
            },
                        {
                status: 200,
                headers: corsHeaders,
            }

        )
    }
    catch (error) {
        console.error("Error fetching data:", error);
        return Response.json(
            {
                success: false,
                message: "Error fetching data",
                error: error.message,
            },
                        {
                status: 500,
                headers: corsHeaders,
            }

        );
    }

}