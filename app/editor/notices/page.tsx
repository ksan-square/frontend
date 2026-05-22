import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import PageHero from "@/app/_components/page-hero";
import { formatDateTimeJa } from "@/lib/date-time";
import { getAdminNotices } from "@/lib/admin-server-api";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage() {
    const payload = await getAdminNotices();
    const notices = payload.items;

    return (
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/editor", label: "管理" },
                    { label: "お知らせ管理" },
                ]}
            />

            <PageHero
                badge="Editor / Notices"
                title="お知らせ管理"
                description="公開タイミングと掲載テキストを確認しながら更新します。"
                action={
                    <Link
                        href="/editor/notices/new"
                        className="w-fit rounded-md bg-violet-500 px-5 py-3 text-sm font-black text-white hover:bg-violet-400"
                    >
                        新規追加
                    </Link>
                }
            />

            <div className="grid gap-4">
                {notices.length === 0 && (
                    <p className="surface p-6 text-zinc-400 ring-1 ring-white/10">
                        お知らせはまだありません。
                    </p>
                )}

                {notices.map((notice) => (
                    <Link
                        key={notice.id}
                        href={`/editor/notices/${notice.id}/edit`}
                        className="group block bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-black text-white group-hover:text-black">{notice.title}</h2>
                                <p className="mt-1 text-sm text-zinc-400 group-hover:text-zinc-700">
                                    {notice.tag ?? "タグなし"}
                                </p>
                                <p className="mt-1 text-sm text-zinc-400 group-hover:text-zinc-700">
                                    公開日時: {formatDateTimeJa(notice.published_at)}
                                </p>
                            </div>

                            <span className="rounded-sm bg-zinc-900 px-3 py-1 text-xs text-zinc-300 ring-1 ring-white/10 group-hover:bg-zinc-100 group-hover:text-zinc-700">
                                {notice.is_published ? "公開" : "下書き"}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
