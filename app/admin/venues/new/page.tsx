import VenueForm from "../venue-form";

export default function NewVenuePage() {
    return (
        <main className="space-y-6">
            <h1 className="text-3xl font-bold">
                会場を追加
            </h1>

            <VenueForm />
        </main>
    );
}