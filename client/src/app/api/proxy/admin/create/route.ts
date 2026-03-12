import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL="https://mcq-analysis.vercel.app/api/v1";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("cbd_atkn_91f2a")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token missing" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/admin/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token, // ⭐ auto token send
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error", err },
      { status: 500 }
    );
  }
}
