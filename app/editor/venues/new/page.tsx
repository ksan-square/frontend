import Breadcrumbs from "@/app/_components/breadcrumbs";
import PageHero from "@/app/_components/page-hero";
import VenueForm from "../venue-form";

export default function NewVenuePage() {
    return (
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/editor", label: "管理" },
                    { href: "/editor/venues", label: "会場管理" },
                    { label: "会場追加" },
                ]}
            />

            <PageHero
                badge="Editor / Venues"
                title="会場を追加"
                description="会場名・エリア・住所・Google Map URLを入力します。"
            />

            <VenueForm />
        </main>
    );
}
