// @deprecated UNUSED — 新規コードで使用禁止
//
// Status:     DEPRECATED — 現在どのファイルからも import されていない。
// Reason:     admin-api.ts / admin-server-api.ts への移行完了により不要になった。
// Replacement: Client Component → lib/admin-api.ts の adminFetch() を使う。
//              Server Component → lib/admin-server-api.ts を使う。
//              Auth session 取得 → createBrowserClient() (@supabase/ssr) を使う。
// TODO:       このファイルは削除候補。削除前に全 import を確認すること。

import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);