import { NextRequest, NextResponse } from "next/server";

// Check if Supabase is configured
const hasSupabaseConfig = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

let supabase: any = null;

if (hasSupabaseConfig) {
  const supabaseModule = await import("@/lib/supabase");
  supabase = supabaseModule.supabase;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, role, useCase, consent } = body;

    // Validation
    if (!name || !email || !company || !consent) {
      return NextResponse.json(
        { error: "Name, email, company, and consent are required" },
        { status: 400 }
      );
    }

    if (!hasSupabaseConfig || !supabase) {
      // Log the registration locally (for development/demo purposes)
      console.log("=== New Registration ===");
      console.log(`Name: ${name}`);
      console.log(`Email: ${email}`);
      console.log(`Company: ${company}`);
      console.log(`Role: ${role || "Not specified"}`);
      console.log(`Use Case: ${useCase || "Not specified"}`);
      console.log("========================");

      return NextResponse.json({
        success: true,
        message: "Registration successful! Our team will reach out within 24 hours.",
        data: { name, email, company, role, useCase },
      });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          name,
          email,
          company,
          role: role || null,
          use_case: useCase || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save registration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful! Our team will reach out within 24 hours.",
      data,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
