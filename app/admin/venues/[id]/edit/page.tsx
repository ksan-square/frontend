import Breadcrumbs from "@/app/_components/breadcrumbs";
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
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { href: "/admin/venues", label: "会場管理" },
                    { label: venue.name },
                ]}
            />

            <h1 className="text-3xl font-bold">
                会場編集
            </h1>

            <VenueForm
                initialData={venue}
            />
        </main>
    );
}
