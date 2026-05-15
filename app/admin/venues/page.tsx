import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DeleteButton from "./delete-button";

export const dynamic = "force-dynamic";

export default async function VenuesPage() {
    const { data: venues, error } = await supabase
        .from("venues")
        .select(`
            id,
            name,
            area,
            address,
            google_map_url
        `)
        .order("area")
        .order("name");

    if (error) {
        return (
            <main>
                会場取得失敗: {error.message}
            </main>
        );
    }

    return (
        <main className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-pink-300">
                        Admin / Venues
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        会場管理
                    </h1>
                </div>

                <Link
                    href="/admin/venues/new"
                    className="rounded-full bg-pink-500 px-4 py-2 font-bold text-white"
                >
                    新規追加
                </Link>
            </div>

            <section className="space-y-3">
                {venues?.map((venue) => (
                    <div
                        key={venue.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                    >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-xl font-bold">
                                    {venue.name}
                                </h2>

                                {venue.area && (
                                    <p className="mt-2 text-sm text-zinc-400">
                                        {venue.area}
                                    </p>
                                )}

                                {venue.address && (
                                    <p className="mt-1 text-sm text-zinc-500">
                                        {venue.address}
                                    </p>
                                )}

                                {venue.google_map_url && (
                                    <a
                                        href={venue.google_map_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-block text-sm text-pink-300 hover:underline"
                                    >
                                        Google Map
                                    </a>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/venues/${venue.id}/edit`}
                                    className="rounded-full bg-zinc-800 px-4 py-2 text-sm"
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