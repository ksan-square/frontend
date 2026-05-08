import Link from "next/link";

export default function AdminPage() {
    const links = [
        { href: "/admin/songs", title: "曲管理" },
        { href: "/admin/members", title: "メンバー管理" },
        { href: "/admin/song-parts", title: "歌割・コール管理" },
        { href: "/admin/song-part-members", title: "歌唱メンバー管理" },
        { href: "/admin/lives", title: "ライブ管理" },
        { href: "/admin/setlists", title: "セトリ管理" },
    ];

    return (
        <main className="space-y-8">
            <h1 className="text-3xl font-bold">管理画面</h1>

            <section className="grid gap-4 md:grid-cols-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:border-pink-400"
                    >
                        <h2 className="text-xl font-bold">{link.title}</h2>
                    </Link>
                ))}
            </section>
        </main>
    );
}