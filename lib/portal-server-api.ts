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
        const message = await response.text();
        throw new Error(message || `Request failed: ${response.status}`);
    }

    return response.json() as Promise<PortalMeResponse>;
}
