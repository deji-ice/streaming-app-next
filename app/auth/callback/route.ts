import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );
        const { data } = await supabase.auth.exchangeCodeForSession(code);

        // Create profile for OAuth user if it doesn't exist
        if (data.user) {
            console.log('[OAuth callback] Creating profile for user:', data.user.id);
            const email = data.user.email!;
            const fullName = data.user.user_metadata?.full_name || email.split('@')[0];
            const avatarUrl = data.user.user_metadata?.avatar_url || null;

            const { error } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        email,
                        full_name: fullName,
                        avatar_url: avatarUrl,
                    },
                ])
                .select();

            if (error?.code === '23505') {
                // Duplicate key - profile already exists
                console.log('[OAuth callback] Profile already exists');
            } else if (error) {
                console.error('[OAuth callback] Error creating profile:', error.message);
            } else {
                console.log('[OAuth callback] Profile created successfully');
            }
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL("/", requestUrl.origin));
}
