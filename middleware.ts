import { NextResponse, type NextRequest } from "next/server"

// Middleware temporarily disabled per request
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  // Disable middleware matching so it doesn't run
  matcher: [],
}
