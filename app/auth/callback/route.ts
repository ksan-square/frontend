import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function normalizeNextPath(path: string | null) {
    if (!path || !path.startsWith("/")) {
        return "/portal";
    }
    return path;
}

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const nextPath = normalizeNextPath(requestUrl.searchParams.get("next"));

    if (!code) {
        const loginUrl = new URL("/login", requestUrl.origin);
        loginUrl.searchParams.set("redirectedFrom", nextPath);
        loginUrl.searchParams.set("error", "missing_code");
        return NextResponse.redirect(loginUrl);
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        const loginUrl = new URL("/login", requestUrl.origin);
        loginUrl.searchParams.set("redirectedFrom", nextPath);
        loginUrl.searchParams.set("error", "oauth_callback_failed");
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
