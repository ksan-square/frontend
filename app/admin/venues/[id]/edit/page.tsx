import { supabase } from "@/lib/supabase";
import VenueForm from "../../venue-form";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditVenuePage({
    params,
}: Props) {
    const { id } = await params;

    const { data: venue, error } =
        await supabase
            .from("venues")
            .select(`
                id,
                name,
                area,
                address,
                google_map_url
            `)
            .eq("id", id)
            .single();

    if (error || !venue) {
        return (
            <main>
                会場が見つかりませんでした。
            </main>
        );
    }

    return (
        <main className="space-y-6">
            <h1 className="text-3xl font-bold">
                会場編集
            </h1>

            <VenueForm
                initialData={venue}
            />
        </main>
    );
}