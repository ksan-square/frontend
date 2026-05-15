import { supabase } from "@/lib/supabase";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import LiveForm from "./live-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewLivePage() {
    const { data: venues } = await supabase
        .from("venues")
        .select("id,name,area")
        .order("name");

    return (
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { href: "/admin/lives", label: "ライブ管理" },
                    { label: "ライブ追加" },
                ]}
            />

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
