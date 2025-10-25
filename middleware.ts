import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// Public routes that don't require authentication
const PUBLIC_PATHS = new Set<string>(["/", "/auth/sign-in", "/auth/sign-out", "/auth/register", "/favicon.ico", "/logo.png", "/icon.svg"]) 

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true
  // Allow anything under /auth (e.g., OAuth callbacks)
  if (pathname.startsWith("/auth/")) return true
  // Allow Next.js internals and assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname.startsWith("/public")) return true
  // Skip files with extensions (e.g., .js, .css, .png)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true
  return false
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  if (isPublicPath(pathname)) return NextResponse.next()

  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          res.cookies.set(name, "", { ...options, maxAge: 0 })
        },
      },
    }
  )

  const { data } = await supabase.auth.getUser()
  if (!data?.user) {
    const url = req.nextUrl.clone()
    url.pathname = "/auth/sign-in"
    url.search = `?next=${encodeURIComponent(pathname + (search || ""))}`
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  // Process all routes except Next.js internals and favicons
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|icon.svg).*)"],
}
