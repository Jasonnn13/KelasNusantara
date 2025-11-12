import type { NextConfig } from "next"

const supabasePackages = [
  "@supabase/supabase-js",
  "@supabase/auth-js",
  "@supabase/functions-js",
  "@supabase/postgrest-js",
  "@supabase/realtime-js",
  "@supabase/storage-js",
  "@supabase/gotrue-js",
  "@supabase/ssr",
  "@supabase/node-fetch",
]

const turboResolveAlias = supabasePackages.reduce<Record<string, string>>((aliases, pkg) => {
  aliases[`${pkg}/src`] = `${pkg}/dist/module`
  aliases[`${pkg}/dist/src`] = `${pkg}/dist/module`
  return aliases
}, {})

const nextConfig: NextConfig = {
  transpilePackages: supabasePackages,
  turbopack: {
    resolveAlias: turboResolveAlias,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default nextConfig
