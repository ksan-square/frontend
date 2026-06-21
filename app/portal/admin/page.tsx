import Link from "next/link";
import { redirect } from "next/navigation";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import { getPortalMe } from "@/lib/portal-server-api";

export const dynamic = "force-dynamic";

export default async function PortalAdminPage() {
    const me = await getPortalMe();

    if (me.profile.role !== "admin" && me.profile.role !== "editor") {
        redirect("/portal");
    }

    const links = [
        {
            href: "/editor/members",
            title: "メンバー管理",
            description: "表示順、カラー、紹介文を整えます。",
            symbol: "MBR",
        },
        {
            href: "/editor/songs",
            title: "曲管理",
            description: "曲情報、歌詞、コールの編集を進めます。",
            symbol: "♪",
        },
        {
            href: "/editor/venues",
            title: "会場管理",
            description: "検索しやすい会場情報をまとめます。",
            symbol: "MAP",
        },
        {
            href: "/editor/lives",
            title: "ライブ管理",
            description: "予定、履歴、セトリをひとつの流れで管理します。",
            symbol: "LIVE",
        },
        {
            href: "/editor/notices",
            title: "お知らせ管理",
            description: "公開内容と掲載タイミングを調整します。",
            symbol: "NEWS",
        },
        {
            href: "/editor/mix-yell",
            title: "ミクチャエール管理",
            description: "日付ごとの票数と投稿画像を確認します。",
            symbol: "YELL",
        },
    ];

    return (
        <main className="space-y-10">
            <Breadcrumbs items={[{ label: "ポータル", href: "/portal" }, { label: "管理機能" }]} />

            <section className="relative overflow-hidden bg-black p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 md:p-8">
                <div className="editorial-rule absolute inset-x-0 top-0 h-1" />

                <div className="space-y-3">
                    <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">
                        Portal Admin
                    </p>
                    <h1 className="text-4xl font-black text-white md:text-5xl">
                        管理機能
                    </h1>
                    <p className="max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                        ポータルの中で編集系の導線をまとめています。既存の管理ページはそのまま活かしつつ、入口はここに寄せています。
                    </p>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="group bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white"
                    >
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <span className="inline-grid h-10 min-w-10 place-items-center rounded-sm bg-zinc-950 px-2 text-xs font-black text-white ring-1 ring-white/10 group-hover:bg-black">
                                {link.symbol}
                            </span>
                        </div>

                        <h2 className="text-xl font-black text-white group-hover:text-black">
                            {link.title}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-zinc-400 group-hover:text-zinc-700">
                            {link.description}
                        </p>
                    </Link>
                ))}
            </section>
        </main>
    );
}
