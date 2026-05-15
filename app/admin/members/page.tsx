import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import { supabase } from "@/lib/supabase";

export default async function AdminMembersPage() {
    const { data: members } = await supabase
        .from("members")
        .select("id,name,member_color_name,member_color_code,is_active")
        .eq("is_delete", false)
        .order("sort_order");

    return (
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { label: "メンバー管理" },
                ]}
            />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">メンバー管理</h1>
                <Link href="/admin/members/new" className="rounded-full bg-pink-500 px-4 py-2 font-bold">
                    新規追加
                </Link>
            </div>

            <div className="space-y-3">
                {members?.map((member) => (
                    <Link
                        key={member.id}
                        href={`/admin/members/${member.id}/edit`}
                        className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                    >
                        <h2 className="text-xl font-bold">{member.name}</h2>
                        <p className="text-sm text-zinc-400">
                            {member.member_color_name ?? "カラー未設定"}
                        </p>
                    </Link>
                ))}
            </div>
        </main>
    );
}
