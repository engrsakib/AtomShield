import { NextResponse } from "next/server";
import { cookies } from "next/headers";






export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token =await cookieStore.get("cbd_atkn_91f2a")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token not found" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("id");

    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Admin ID missing" },
        { status: 400 }
      );
    }

    // CORRECT BACKEND API
    const backendUrl = `https://mcq-analysis.vercel.app/api/v1/admin/${adminId}`;

    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
}





// PATCH - Permission save
export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("cbd_atkn_91f2a")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token not found" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("Saving permissions:", body);

    const backendUrl = `https://mcq-analysis.vercel.app/api/v1/permissions`;

    const res = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("Save response:", data);

    return NextResponse.json(data);
  } catch (e) {
    console.error("Proxy error:", e);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
}