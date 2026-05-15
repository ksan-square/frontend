import { supabase } from "@/lib/supabase";
import LiveForm from "../live-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewLivePage() {
    const { data: venues } = await supabase
        .from("venues")
        .select("id,name")
        .order("name");

    return (
        <main className="space-y-6">
            <Link href="/admin/lives" className="inline-block rounded-full bg-zinc-800 px-4 py-2">
                戻る
            </Link>
            <h1 className="text-3xl font-bold">
                ライブ追加
            </h1>

            <LiveForm
                venues={venues ?? []}
            />
        </main>
    );
}
