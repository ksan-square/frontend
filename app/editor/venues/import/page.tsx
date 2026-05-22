import Breadcrumbs from "@/app/_components/breadcrumbs";
import Link from "next/link";
import VenueImportForm from "./venue-import-form";

export const dynamic = "force-dynamic";

export default function VenueImportPage() {
    return (
        <main className="space-y-8">
            <Breadcrumbs
                items={[
                    { href: "/editor", label: "管理" },
                    { href: "/editor/venues", label: "会場管理" },
                    { label: "会場インポート" },
                ]}
            />

            <Link href="/editor/venues" className="inline-block rounded-full bg-zinc-800 px-4 py-2">
                戻る
            </Link>

            <section className="space-y-4">
                <h1 className="text-3xl font-bold text-white">会場インポート</h1>
                <p className="max-w-3xl text-sm leading-7 text-zinc-400">
                    JSON 配列を貼り付けて会場を一括登録します。`name` は必須です。
                </p>
            </section>

            <VenueImportForm />
        </main>
    );
}
