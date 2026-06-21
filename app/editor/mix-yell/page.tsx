import Breadcrumbs from "@/app/_components/breadcrumbs";
import PageHero from "@/app/_components/page-hero";
import { getAdminMixYells, type AdminMixYellItem } from "@/lib/admin-server-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function imageDataUrl(item: AdminMixYellItem) {
    if (!item.image_base64) {
        return null;
    }

    return `data:${item.image_content_type || "image/jpeg"};base64,${item.image_base64}`;
}

export default async function AdminMixYellPage() {
    let payload;
    try {
        payload = await getAdminMixYells();
    } catch (error) {
        return <main>取得失敗: {error instanceof Error ? error.message : "unknown error"}</main>;
    }

    const latestDate = payload.daily_counts[0];

    return (
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/editor", label: "管理" },
                    { label: "ミクチャエール管理" },
                ]}
            />

            <PageHero
                badge="Editor / Mix Yell"
                title="ミクチャエール管理"
                description="投票報告の件数を日付ごとに確認し、投稿内容を一覧でチェックします。"
            />

            <section className="grid gap-4 md:grid-cols-3">
                <div className="surface-subtle p-5">
                    <p className="text-sm font-semibold text-zinc-400">合計票数</p>
                    <p className="mt-3 text-4xl font-black text-white">{payload.total_count}</p>
                </div>

                <div className="surface-subtle p-5">
                    <p className="text-sm font-semibold text-zinc-400">日別登録数</p>
                    <p className="mt-3 text-4xl font-black text-white">{payload.daily_counts.length}</p>
                </div>

                <div className="surface-subtle p-5">
                    <p className="text-sm font-semibold text-zinc-400">最新投票日</p>
                    <p className="mt-3 text-2xl font-black text-white">{latestDate?.date ?? "-"}</p>
                    <p className="mt-2 text-sm text-zinc-400">
                        {latestDate ? `${latestDate.count}票` : "投稿はまだありません"}
                    </p>
                </div>
            </section>

            <section className="space-y-4">
                <div>
                    <h2 className="text-2xl font-black text-white">日付ごとの票数</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        投票日として入力された日付ごとの投稿数です。
                    </p>
                </div>

                {payload.daily_counts.length === 0 ? (
                    <p className="surface p-6 text-zinc-400 ring-1 ring-white/10">
                        投票報告はまだありません。
                    </p>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {payload.daily_counts.map((daily) => (
                            <div key={daily.date} className="surface p-4 ring-1 ring-white/10">
                                <p className="text-sm font-semibold text-fuchsia-300">{daily.date}</p>
                                <p className="mt-2 text-3xl font-black text-white">{daily.count}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <div>
                    <h2 className="text-2xl font-black text-white">投稿一覧</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        投稿日時、投票日、名前、画像を確認できます。
                    </p>
                </div>

                <div className="overflow-x-auto ring-1 ring-white/10">
                    <table className="min-w-full border-collapse bg-[#111113] text-left text-sm">
                        <thead className="bg-black text-xs uppercase text-zinc-400">
                            <tr>
                                <th className="whitespace-nowrap px-4 py-3 font-black">投稿日時</th>
                                <th className="whitespace-nowrap px-4 py-3 font-black">投票日</th>
                                <th className="whitespace-nowrap px-4 py-3 font-black">名前</th>
                                <th className="whitespace-nowrap px-4 py-3 font-black">画像</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {payload.items.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-6 text-zinc-400" colSpan={4}>
                                        投稿はまだありません。
                                    </td>
                                </tr>
                            ) : (
                                payload.items.map((item) => {
                                    const src = imageDataUrl(item);

                                    return (
                                        <tr key={item.id} className="align-top hover:bg-white/[0.03]">
                                            <td className="whitespace-nowrap px-4 py-3 text-zinc-300">
                                                {formatDateTime(item.created_at)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 font-semibold text-white">
                                                {item.submission_date}
                                            </td>
                                            <td className="min-w-40 px-4 py-3 text-zinc-300">
                                                {item.name || "（未入力）"}
                                            </td>
                                            <td className="px-4 py-3">
                                                {src ? (
                                                    <a href={src} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-zinc-300 hover:text-white">
                                                        <img
                                                            src={src}
                                                            alt={item.image_file_name || "投稿画像"}
                                                            className="h-16 w-16 object-cover ring-1 ring-white/10"
                                                        />
                                                        <span className="max-w-52 truncate text-xs">
                                                            {item.image_file_name || "画像を開く"}
                                                        </span>
                                                    </a>
                                                ) : (
                                                    <span className="text-zinc-500">なし</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}
