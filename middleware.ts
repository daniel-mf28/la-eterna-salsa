import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If accessing admin routes (except login)
  if (request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/admin/login')) {

    // Check if user is authenticated
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    // Check if user's email is in the admin_emails table
    const { data: adminEmail } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', user.email)
      .single()

    if (!adminEmail) {
      // User is authenticated but not an admin
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // If accessing login page while authenticated, redirect to admin dashboard
  if (request.nextUrl.pathname === '/admin/login' && user) {
    const { data: adminEmail } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', user.email)
      .single()

    if (adminEmail) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
