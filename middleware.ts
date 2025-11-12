import { NextResponse } from "next/server"

// Middleware temporarily disabled per request
export function middleware() {
  return NextResponse.next()
}

export const config = {
  // Disable middleware matching so it doesn't run
  matcher: [],
}
