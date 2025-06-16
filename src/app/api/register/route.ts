import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import rateLimit from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
});

// Input validation schema
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

export async function POST(request: Request) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { isRateLimited } = limiter.check(ip, 5); // 5 requests per minute
  
  if (isRateLimited) {
    return new Response(
      JSON.stringify({ error: "Too many requests" }), 
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Validation failed", 
          details: validationResult.error.flatten() 
        }), 
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "E-Mail ist bereits registriert!" }), 
        { status: 409 }
      );
    }

    // Hash password with increased rounds for better security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with lowercase email
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name?.trim(),
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Return success response with proper headers
    return new Response(JSON.stringify({ 
      message: "Registration successful",
      user 
    }), { 
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    
    // Don't expose internal errors to client
    return new Response(
      JSON.stringify({ error: "Registrierung fehlgeschlagen!" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
