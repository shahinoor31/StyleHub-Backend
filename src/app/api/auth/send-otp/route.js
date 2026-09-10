

// export async function POST(request) {
//     try {
//         const body = await request.json();

//         console.log("Received body:", body);

//         return Response.json(
//             {
//                 success: true,
//                 message: "Backend received the phone number",
//                 phone: body.phone_number,
//             },
//             {
//                 status: 200,
//                 headers: corsHeaders,
//             }
//         );

//     } catch (error) {
//         console.error("Error:", error);

//         return Response.json(
//             {
//                 success: false,
//                 message: "Something went wrong",
//             },
//             {
//                 status: 500,
//                 headers: corsHeaders,
//             }
//         );
//     }
// }



import bcrypt from "bcrypt";
import { pool } from "../../../../../lib/db";

const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
}


export async function POST(request) {
    try {
        const body = await request.json();

        const phoneNumber = body.phone_number;

        if (!phoneNumber) {
            return Response.json(
                {
                    success: false,
                    message: "Phone number is required",
                },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // Generate 6-digit OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        console.log("OTP:", otp);
        console.log("DEV OTP:", otp);



        // Hash OTP
        const otpHash = await bcrypt.hash(otp, 10);

        // OTP expires in 5 minutes
        const expiresAt = new Date(
            Date.now() + 5 * 60 * 1000
        );

        // Store OTP
        await pool.query(
            `INSERT INTO otp_codes
            (phone_number, otp_hash, expires_at)
            VALUES ($1, $2, $3)`,
            [
                phoneNumber,
                otpHash,
                expiresAt,
            ]
        );

        return Response.json(
            {
                success: true,
                message: "OTP generated successfully",
                otp: otp, // For development only; remove in production
            },
            {
                status: 200,
                headers: corsHeaders,
            }
        );

    } catch (error) {
        console.error("Send OTP error:", error);

        return Response.json(
            {
                success: false,
                message: "Failed to generate OTP",
            },
            {
                status: 500,
                headers: corsHeaders,
            }
        );
    }
}

