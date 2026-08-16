import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getProductBySlug } from "@/lib/data/store";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/stones/")) {
    return NextResponse.next();
  }

  const slug = pathname.slice("/stones/".length).split("/")[0];
  if (!slug) {
    return NextResponse.next();
  }

  const product = await getProductBySlug(slug);
  if (product) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL("/_not-found", request.url), {
    status: 404,
  });
}

export const config = {
  matcher: ["/stones/:path*"],
};
