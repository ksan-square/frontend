import Breadcrumbs from "@/app/_components/breadcrumbs";
import LiveForm from "./live-form";
import Link from "next/link";
import { getAdminVenues } from "@/lib/admin-server-api";

export const dynamic = "force-dynamic";

export default async function NewLivePage() {
    const venuePayload = await getAdminVenues();
    const venues = venuePayload.items.map((venue) => ({
        id: venue.id,
        name: venue.name,
        area: venue.area,
    }));
    return (
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { href: "/admin/lives", label: "ライブ管理" },
                    { label: "ライブ追加" },
                ]}
            />

            <Link href="/admin/lives" className="inline-block rounded-full bg-zinc-800 px-4 py-2">
                戻る
            </Link>
            <h1 className="text-3xl font-bold">
                ライブ追加
            </h1>

            <LiveForm venues={venues} />
        </main>
    );
}
