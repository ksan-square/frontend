import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function formatDate(date: string) {
    return new Date(date).toLocaleString("ja-JP");
}

export default async function AdminNoticesPage() {
    const { data: notices, error } = await supabase
        .from("notices")
        .select("id,title,tag,is_published,published_at")
        .eq("is_delete", false)
        .order("published_at", { ascending: false });

    if (error) {
        return <main>お知らせの取得に失敗しました: {error.message}</main>;
    }

    return (
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { label: "お知らせ管理" },
                ]}
            />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">お知らせ管理</h1>
                <Link
                    href="/admin/notices/new"
                    className="rounded-full bg-pink-500 px-4 py-2 font-bold"
                >
                    新規追加
                </Link>
            </div>

            <div className="space-y-3">
                {notices?.length === 0 && (
                    <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-400">
                        お知らせはまだありません。
                    </p>
                )}

                {notices?.map((notice) => (
                    <Link
                        key={notice.id}
                        href={`/admin/notices/${notice.id}/edit`}
                        className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-pink-400"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold">{notice.title}</h2>
                                <p className="mt-1 text-sm text-zinc-400">
                                    {notice.tag ?? "タグなし"}
                                </p>
                                <p className="mt-1 text-sm text-zinc-400">
                                    公開日時: {formatDate(notice.published_at)}
                                </p>
                            </div>

                            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                                {notice.is_published ? "公開" : "下書き"}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
