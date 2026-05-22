import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import DeleteButton from "./delete-button";
import { getAdminVenues } from "@/lib/admin-server-api";

export const dynamic = "force-dynamic";

export default async function VenuesPage() {
    const payload = await getAdminVenues();
    const venues = payload.items;

    return (
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { label: "会場管理" },
                ]}
            />

            <section className="relative overflow-hidden bg-black p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 md:p-8">
                <div className="editorial-rule absolute inset-x-0 top-0 h-1" />

                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">
                            Admin / Venues
                        </p>

                        <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">
                            会場管理
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                            公開画面とライブ編集で使う会場情報をここで揃えます。
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/admin/venues/new"
                            className="w-fit rounded-md bg-violet-500 px-5 py-3 text-sm font-black text-white hover:bg-violet-400"
                        >
                            新規追加
                        </Link>

                        <Link
                            href="/admin/venues/import"
                            className="w-fit rounded-md bg-zinc-900 px-5 py-3 text-sm font-black text-white ring-1 ring-white/10 hover:bg-white hover:text-black"
                        >
                            一括インポート
                        </Link>
                    </div>
                </div>
            </section>

            <section className="grid gap-4">
                {venues.map((venue) => (
                    <div
                        key={venue.id}
                        className="group bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white"
                    >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-xl font-black text-white group-hover:text-black">
                                    {venue.name}
                                </h2>

                                {venue.area && (
                                    <p className="mt-2 text-sm text-zinc-400 group-hover:text-zinc-700">
                                        {venue.area}
                                    </p>
                                )}

                                {venue.address && (
                                    <p className="mt-1 text-sm text-zinc-500 group-hover:text-zinc-600">
                                        {venue.address}
                                    </p>
                                )}

                                {venue.google_map_url && (
                                    <a
                                        href={venue.google_map_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-block text-sm text-fuchsia-300 hover:underline group-hover:text-violet-700"
                                    >
                                        Google Map
                                    </a>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/venues/${venue.id}/edit`}
                                    className="rounded-sm bg-zinc-900 px-4 py-2 text-sm text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black"
                                >
                                    編集
                                </Link>

                                <DeleteButton id={venue.id} />
                            </div>
                        </div>
                    </div>
                ))}
            </section>
        </main>
    );
}
