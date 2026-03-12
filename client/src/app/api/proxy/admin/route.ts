import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = await cookieStore.get("cbd_atkn_91f2a")?.value;
    console.log("Token", token)

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token found" },
        { status: 401 }
      );
    }

    const backendUrl = `https://mcq-analysis.vercel.app/api/v1/admin${req.url.split("/proxy/admin")[1]}`;

    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: token, 
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, message: "Proxy error" },
      { status: 500 }
    );
  }
}
