// @deprecated UNUSED — 新規コードで使用禁止
//
// Status:     DEPRECATED — 現在どのファイルからも import されていない。
// Reason:     旧版のシングルトンクライアント。supabase-client.ts と重複。
// Replacement: Client Component → lib/admin-api.ts の adminFetch() を使う。
//              Server Component → lib/admin-server-api.ts を使う。
// TODO:       このファイルは削除候補。削除前に全 import を確認すること。

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);