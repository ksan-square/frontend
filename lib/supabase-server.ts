// @boundary SERVER ONLY
// Server Component 用 Supabase クライアント生成。next/headers の cookies() に依存。
//
// Boundary:   SERVER ONLY — cookies() は Next.js Server 専用 API。
//             Client Component から import すると実行時エラーになる。
// Auth:       anon key + セッション cookie (RLS が有効)。
//             service_role ではないため RLS を通過する。
// Safe in:    page.tsx, layout.tsx, Server Actions。
// Forbidden:  "use client" コンポーネントから import しない。
// Used by:    admin-server-api.ts, portal-server-api.ts, editor/layout.tsx。

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        try {
                            cookieStore.set(name, value, options);
                        } catch {
                            // Server Components cannot always write cookies.
                        }
                    });
                },
            },
        },
    );
}
