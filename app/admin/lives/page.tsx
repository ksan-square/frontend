import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DeleteButton from "./delete-button";

export default async function AdminLivesPage() {
    const { data: lives, error } = await supabase
        .from("lives")
        .select(`
            id,
            live_date,
            same_day_order,
            event_name,
            memo,
            venues (
                name,
                area
            )
        `)
        .order("live_date", { ascending: false })
        .order("same_day_order", { ascending: true });

    if (error) {
        return <main>{error.message}</main>;
    }

    return (
        <main className="space-y-6">
            <div className="flex justify-between">
                <h1 className="text-3xl font-bold">
                    ライブ管理
                </h1>

                <Link
                    href="/admin/lives/new"
                    className="rounded-full bg-pink-500 px-4 py-2"
                >
                    新規追加
                </Link>
            </div>

            <section className="space-y-3">
                {lives?.map((live) => {
                    const venue = Array.isArray(live.venues)
                        ? live.venues[0]
                        : live.venues;

                    return (
                        <div
                            key={live.id}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                        >
                            <div className="flex justify-between gap-4">
                                <div>
                                    <p className="text-pink-300">
                                        {live.live_date}
                                    </p>

                                    <h2 className="text-xl font-bold">
                                        {live.event_name}
                                    </h2>

                                    <p className="text-zinc-400">
                                        {venue?.name}
                                        {venue?.area &&
                                            ` / ${venue.area}`}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/lives/${live.id}/edit`}
                                        className="rounded-full bg-zinc-800 px-4 py-2"
                                    >
                                        編集
                                    </Link>

                                    <DeleteButton id={live.id} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>
        </main>
    );
}