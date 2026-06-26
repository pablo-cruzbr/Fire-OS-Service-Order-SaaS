import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("session")?.value;

  if (!token) {
    const loginUrl = pathname.startsWith("/dashboard") ? "/" : "/AreadeUsuario";
    return NextResponse.redirect(new URL(loginUrl, req.url));
  }

  const isValid = await validateToken(token);

  if (!isValid) {
    const loginUrl = pathname.startsWith("/dashboard") ? "/" : "/AreadeUsuario";
    const response = NextResponse.redirect(new URL(loginUrl, req.url));
    
    response.cookies.delete("session");
    response.cookies.delete("role");
    return response;
  }

  return NextResponse.next();
}

async function validateToken(token: string): Promise<boolean> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3334";
    
    const res = await fetch(`${apiUrl}/users/detail`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(2500), 
    });

    if (!res.ok) return false;

    const data = await res.json();
    return !!data?.id; 
  } catch (err) {
    console.error("❌ Middleware Auth Error:", err);
    return false;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/AreadeUsuario/:path*"
  ], 
};