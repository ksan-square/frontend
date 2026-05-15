import Breadcrumbs from "@/app/_components/breadcrumbs";
import VenueForm from "../venue-form";

export default function NewVenuePage() {
    return (
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { href: "/admin/venues", label: "会場管理" },
                    { label: "会場追加" },
                ]}
            />

            <h1 className="text-3xl font-bold">
                会場を追加
            </h1>

            <VenueForm />
        </main>
    );
}
