import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
	if (!req.cookies.get("accessToken")) {
		return NextResponse.redirect(process.env.NEXT_PUBLIC_API_URL + "/login");
	}
}

export const config = {
	matcher: ["/templates/:path*", "/records/:path*"],
};
