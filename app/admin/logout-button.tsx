"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    }

    return (
        <button
            onClick={handleLogout}
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold"
        >
            ログアウト
        </button>
    );
}