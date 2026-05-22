import Breadcrumbs from "@/app/_components/breadcrumbs";
import PageHero from "@/app/_components/page-hero";
import VenueForm from "../../venue-form";
import { getAdminVenueDetail } from "@/lib/admin-server-api";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditVenuePage({
    params,
}: Props) {
    const { id } = await params;
    const payload = await getAdminVenueDetail(id);
    if (!payload.found || !payload.venue) {
        return (
            <main>
                会場が見つかりませんでした。
            </main>
        );
    }
    const venue = payload.venue;

    return (
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/editor", label: "管理" },
                    { href: "/editor/venues", label: "会場管理" },
                    { label: venue.name },
                ]}
            />

            <PageHero
                badge="Editor / Venues"
                title={venue.name}
                description="会場名・エリア・住所・Google Map URLを編集します。"
            />

            <VenueForm
                initialData={venue}
            />
        </main>
    );
}
