import { pool } from "../../../../lib/db";

export async function GET() {
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

  try {
    const result = await pool.query("SELECT NOW()");

    return Response.json({
      success: true, 
      message: "Database connected!",
      time: result.rows[0].now,  
    });

  } catch (error) {
    console.error("Database error:", error);

    return Response.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}
