import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, message } = body;

    if (!user_id || !message) {
      return NextResponse.json(
        { error: "user_id and message are required" },
        { status: 400 }
      );
    }

    // Proxy to backend chatbot endpoint
    const response = await fetch(`${BACKEND_URL}/api/chatbot/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id, message }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Backend error" }));
      return NextResponse.json(
        { error: errorData.detail || "Failed to process message" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    // Proxy to backend chatbot init endpoint
    const response = await fetch(`${BACKEND_URL}/api/chatbot/init?user_id=${encodeURIComponent(user_id)}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Backend error" }));
      return NextResponse.json(
        { error: errorData.detail || "Failed to initialize chatbot" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
