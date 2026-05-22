import Breadcrumbs from "@/app/_components/breadcrumbs";
import PageHero from "@/app/_components/page-hero";
import LiveForm from "./live-form";
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
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/editor", label: "管理" },
                    { href: "/editor/lives", label: "ライブ管理" },
                    { label: "ライブ追加" },
                ]}
            />

            <PageHero
                badge="Editor / Lives"
                title="ライブ追加"
                description="日付・会場・チケット情報を入力します。"
            />

            <LiveForm venues={venues} />
        </main>
    );
}
