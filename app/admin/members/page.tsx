import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import { getAdminMembers } from "@/lib/admin-server-api";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
    const payload = await getAdminMembers();
    const members = payload.items;

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
                {members.map((member) => (
                    <Link
                        key={member.id}
                        href={`/admin/members/${member.id}/edit`}
                        className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-pink-400"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold">{member.name}</h2>
                                <p className="mt-1 text-sm text-zinc-400">
                                    表示順: {member.sort_order}
                                </p>
                                <p className="mt-1 text-sm text-zinc-400">
                                    {member.member_color_name ?? "カラー未設定"}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span
                                    className="rounded-full px-3 py-1 text-xs font-semibold"
                                    style={{
                                        backgroundColor:
                                            member.member_color_code ?? "#3f3f46",
                                        color:
                                            member.lyric_display_color_code ?? "#ffffff",
                                    }}
                                >
                                    プレビュー
                                </span>
                                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                                    {member.is_active ? "有効" : "無効"}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
