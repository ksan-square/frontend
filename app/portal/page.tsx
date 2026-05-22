import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import LogoutButton from "./logout-button";
import AccountLinkingPanel from "./account-linking-panel";
import { getPortalMe } from "@/lib/portal-server-api";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
    const me = await getPortalMe();
    const isAdminAreaVisible = me.profile.role === "admin" || me.profile.role === "editor";
    const roleLabelMap = {
        viewer: "一般ユーザー",
        member: "メンバー",
        editor: "編集担当",
        admin: "管理者",
    } as const;

    const cards = [
        {
            href: "/portal",
            title: "マイポータル",
            description: "近日公開予定です。。",
            symbol: "ME",
        },
        {
            href: "/portal",
            title: "連携アカウント",
            description: "いま紐づいているログイン手段を確認できます。",
            symbol: "ID",
        },
        ...(isAdminAreaVisible
            ? [
                {
                    href: "/portal/admin",
                    title: "管理機能",
                    description: "曲、ライブ、お知らせなどの編集機能です。",
                    symbol: "ADM",
                },
            ]
            : []),
    ];

    return (
        <main className="space-y-10">
            <Breadcrumbs items={[{ label: "ポータル" }]} />

            <section className="relative overflow-hidden bg-black p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 md:p-8">
                <div className="editorial-rule absolute inset-x-0 top-0 h-1" />

                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-4">
                        <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">
                            Portal
                        </p>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-white md:text-5xl">
                                {me.profile.display_name ?? "マイポータル"}
                            </h1>
                            <p className="text-sm leading-7 text-zinc-300 md:text-base">
                                ロール: {roleLabelMap[me.profile.role]}
                            </p>
                        </div>
                    </div>

                    <LogoutButton />
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                    <Link
                        key={card.title}
                        href={card.href}
                        className="group bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white"
                    >
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <span className="inline-grid h-10 min-w-10 place-items-center rounded-sm bg-zinc-950 px-2 text-xs font-black text-white ring-1 ring-white/10 group-hover:bg-black">
                                {card.symbol}
                            </span>
                        </div>

                        <h2 className="text-xl font-black text-white group-hover:text-black">
                            {card.title}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-zinc-400 group-hover:text-zinc-700">
                            {card.description}
                        </p>
                    </Link>
                ))}
            </section>

            <AccountLinkingPanel initialIdentities={me.identities} />
        </main>
    );
}
