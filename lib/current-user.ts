// @boundary CLIENT ONLY
// ログイン中ユーザーの ID を取得する。"use client" ファイル。
//
// Boundary:   CLIENT ONLY — "use client" 宣言あり。createBrowserClient() を使用。
// Auth:       auth session が必要。未ログイン時は null を返す。
// Safe in:    "use client" コンポーネント内のみ。
// Forbidden:  Server Component から import しない (supabase-server.ts を使う)。
// Note:       wiki リファクタ後、このファイルの呼び出し元が存在しない可能性あり。削除検討可。

"use client";

import { createBrowserClient } from "@supabase/ssr";

export async function getCurrentUserId() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user.id;
}
