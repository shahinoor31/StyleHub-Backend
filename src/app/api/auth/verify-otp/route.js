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
        const otp = body.otp;

        // Check input
        if (!phoneNumber || !otp) {
            return Response.json(
                {
                    success: false,
                    message: "Phone number and OTP are required",
                },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // Find latest OTP for this phone number
        const result = await pool.query(
            `SELECT *
             FROM otp_codes
             WHERE phone_number = $1
             ORDER BY created_at DESC
             LIMIT 1`,
            [phoneNumber]
        );

        if (result.rows.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "OTP not found",
                },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        const otpRecord = result.rows[0];

        // Check expiration
        if (new Date() > new Date(otpRecord.expires_at)) {
            return Response.json(
                {
                    success: false,
                    message: "OTP has expired",
                },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // Check attempts
        if (otpRecord.attempts >= 5) {
            return Response.json(
                {
                    success: false,
                    message: "Too many attempts",
                },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // Compare entered OTP with stored hash
        const isValid = await bcrypt.compare(
            otp,
            otpRecord.otp_hash
        );

        if (!isValid) {
            // Increase attempts
            await pool.query(
                `UPDATE otp_codes
                 SET attempts = attempts + 1
                 WHERE id = $1`,
                [otpRecord.id]
            );

            return Response.json(
                {
                    success: false,
                    message: "Invalid OTP",
                },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // OTP is correct
        console.log("OTP verified successfully");

        // Check whether user already exists
        const userResult = await pool.query(
            `SELECT *
             FROM users
             WHERE phone_number = $1`,
            [phoneNumber]
        );

        let user;

        if (userResult.rows.length === 0) {

            // Create new user
            const newUserResult = await pool.query(
                `INSERT INTO users (phone_number)
                 VALUES ($1)
                 RETURNING *`,
                [phoneNumber]
            );

            user = newUserResult.rows[0];

        } else {

            // Existing user
            user = userResult.rows[0];
        }

        // Delete OTP after successful verification
        await pool.query(
            `DELETE FROM otp_codes
             WHERE id = $1`,
            [otpRecord.id]
        );

        return Response.json(
            {
                success: true,
                message: "Login successful",
                user: {
                    id: user.id,
                    phone_number: user.phone_number,
                },
            },
            {
                status: 200,
                headers: corsHeaders,
            }
        );

    } catch (error) {

        console.error("Verify OTP error:", error);

        return Response.json(
            {
                success: false,
                message: "Something went wrong",
            },
            {
                status: 500,
                headers: corsHeaders,
            }
        );
    }
}
