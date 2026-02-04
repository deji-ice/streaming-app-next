import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * This endpoint is now optional - profiles are created client-side
 * It exists for verification and fallback purposes only
 */
export async function POST() {
    try {
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
                            // Ignore cookie set errors
                        }
                    },
                },
            }
        );

        // Try to get session from cookies
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.log('[/api/user/init] Session check failed:', sessionError.message);
        }

        if (!session?.user) {
        
            return NextResponse.json(
                { message: "No session - profile creation handled on client" },
                { status: 200 }
            );
        }



        // Verify profile exists (created by client-side code)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();

        if (profile) {
        return NextResponse.json({ message: "Profile exists" }, { status: 200 });
        }

        if (profileError) {
            console.error('[/api/user/init] Error checking profile:', profileError.message);
        } else {
            console.log('[/api/user/init] Profile not found - was created on client');
        }

        return NextResponse.json({ message: "OK" }, { status: 200 });
    } catch (error: any) {
        console.error('[/api/user/init] Server error:', error?.message);
        return NextResponse.json(
            { error: error?.message || "Server error" },
            { status: 500 }
        );
    }
}
