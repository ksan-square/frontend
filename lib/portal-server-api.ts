// @boundary SERVER ONLY
// Portal API 呼び出しラッパー。GET /api/v1/portal/me のみ。
//
// Boundary:   SERVER ONLY — createSupabaseServerClient() が Next.js cookies() に依存。
//             Client Component から import すると実行時エラーになる。
// Auth:       JWT 必須。全 role 通過 (get_current_portal_actor)。
// Safe in:    page.tsx, layout.tsx, Server Actions。
// Forbidden:  "use client" コンポーネントから import しない。
// Used by:    app/editor/layout.tsx, app/portal/admin/page.tsx。

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getApiBaseUrl } from "@/lib/public-api";

export type PortalMeResponse = {
    profile: {
        id: string;
        auth_user_id: string;
        display_name: string | null;
        role: "viewer" | "member" | "editor" | "admin";
    };
    identities: {
        provider: string;
        provider_user_id: string | null;
        is_primary: boolean;
    }[];
};

export async function getPortalMe() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error("ログインが必要です。");
    }

    const response = await fetch(new URL("/api/v1/portal/me", getApiBaseUrl()), {
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
    });

    if (!response.ok) {
        const message = await readErrorMessage(response);
        throw new Error(message || `Request failed: ${response.status}`);
    }

    return response.json() as Promise<PortalMeResponse>;
}

async function readErrorMessage(response: Response) {
    const message = await response.text();
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("text/html") || message.trimStart().startsWith("<")) {
        return `Request failed: ${response.status}`;
    }

    return message;
}
