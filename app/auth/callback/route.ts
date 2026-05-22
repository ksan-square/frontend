import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase-route-handler";

function normalizeNextPath(path: string | null) {
    if (!path || !path.startsWith("/")) {
        return "/portal";
    }
    return path;
}

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const nextPath = normalizeNextPath(requestUrl.searchParams.get("next"));
    const redirectResponse = NextResponse.redirect(new URL(nextPath, requestUrl.origin));

    if (!code) {
        const loginUrl = new URL("/login", requestUrl.origin);
        loginUrl.searchParams.set("redirectedFrom", nextPath);
        loginUrl.searchParams.set("error", "missing_code");
        return NextResponse.redirect(loginUrl);
    }

    const supabase = await createSupabaseRouteHandlerClient(request, redirectResponse);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        const loginUrl = new URL("/login", requestUrl.origin);
        loginUrl.searchParams.set("redirectedFrom", nextPath);
        loginUrl.searchParams.set("error", "oauth_callback_failed");
        return NextResponse.redirect(loginUrl);
    }

    return redirectResponse;
}
