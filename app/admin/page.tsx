import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import LogoutButton from "./logout-button";

export const dynamic = "force-dynamic";

export default function AdminPage() {
    const links = [
        {
            href: "/admin/members",
            title: "メンバー管理",
            description: "表示順、カラーを編集できます。",
            symbol: "MBR",
        },
        {
            href: "/admin/songs",
            title: "曲管理",
            description: "曲情報、歌詞、コールを編集できます。",
            symbol: "♪",
        },
        {
            href: "/admin/venues",
            title: "会場管理",
            description: "ライブ会場と特典会会場の情報編集できます。",
            symbol: "MAP",
        },
        {
            href: "/admin/lives",
            title: "ライブ管理",
            description: "予定、履歴、セトリの流れをまとめます。",
            symbol: "LIVE",
        },
        {
            href: "/admin/notices",
            title: "お知らせ管理",
            description: "公開状態と掲載内容を編集できます。",
            symbol: "NEWS",
        },
    ];

    return (
        <main className="space-y-10">
            <Breadcrumbs items={[{ label: "管理" }]} />

            <section className="relative overflow-hidden bg-black p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 md:p-8">
                <div className="editorial-rule absolute inset-x-0 top-0 h-1" />

                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">
                            Admin Console
                        </p>
                        <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">
                            管理画面
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                            公開サイトに出る曲、ライブ、Wiki のまわりをここで整えます。
                        </p>
                    </div>

                    <LogoutButton />
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
