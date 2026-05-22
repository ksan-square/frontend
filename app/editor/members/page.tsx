import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import PageHero from "@/app/_components/page-hero";
import { getAdminMembers } from "@/lib/admin-server-api";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
    const payload = await getAdminMembers();
    const members = payload.items;

    return (
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/editor", label: "管理" },
                    { label: "メンバー管理" },
                ]}
            />

            <PageHero
                badge="Editor / Members"
                title="メンバー管理"
                description="表示順、カラー、活動ステータスを編集できます。"
                action={
                    <Link href="/editor/members/new" className="w-fit rounded-md bg-violet-500 px-5 py-3 text-sm font-black text-white hover:bg-violet-400">
                        新規追加
                    </Link>
                }
            />

            <div className="grid gap-4">
                {members.map((member) => (
                    <Link
                        key={member.id}
                        href={`/editor/members/${member.id}/edit`}
                        className="group block bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-black text-white group-hover:text-black">{member.name}</h2>
                                <p className="mt-1 text-sm text-zinc-400 group-hover:text-zinc-700">
                                    表示順: {member.sort_order}
                                </p>
                                <p className="mt-1 text-sm text-zinc-400 group-hover:text-zinc-700">
                                    {member.member_color_name ?? "カラー未設定"}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span
                                    className="rounded-sm px-3 py-1 text-xs font-semibold ring-1 ring-black/10"
                                    style={{
                                        backgroundColor:
                                            member.member_color_code ?? "#3f3f46",
                                        color:
                                            member.lyric_display_color_code ?? "#ffffff",
                                    }}
                                >
                                    プレビュー
                                </span>
                                <span className="rounded-sm bg-zinc-900 px-3 py-1 text-xs text-zinc-300 ring-1 ring-white/10 group-hover:bg-zinc-100 group-hover:text-zinc-700">
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
