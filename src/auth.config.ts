import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    providers: [],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnAuth = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';

            // Admin protection
            if (isOnAdmin) {
                // Allow admin login page
                if (nextUrl.pathname === '/admin/login') {
                    if (isLoggedIn && (auth.user as any).role === 'ADMIN') {
                        return Response.redirect(new URL('/admin', nextUrl));
                    }
                    return true;
                }

                // If not logged in, redirect to admin login specifically
                if (!isLoggedIn) {
                    return Response.redirect(new URL(`/admin/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl));
                }

                // If logged in but not admin
                if ((auth.user as any).role !== 'ADMIN') {
                    // Optionally redirect to user home or show 403. 
                    // Let's redirect to admin login to avoid confusion or maybe root?
                    // Prompt says: "direkt /admin/login sayfasına yönlendir"
                    return Response.redirect(new URL('/admin/login', nextUrl));
                }

                return true;
            }

            // Auth pages
            if (isOnAuth) {
                if (isLoggedIn) {
                    if ((auth.user as any).role === 'ADMIN') {
                        return Response.redirect(new URL('/admin', nextUrl));
                    }
                    return Response.redirect(new URL('/', nextUrl));
                }
                return true;
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
} satisfies NextAuthConfig;
