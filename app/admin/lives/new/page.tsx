import { supabase } from "@/lib/supabase";
import LiveForm from "../live-form";

export default async function NewLivePage() {
    const { data: venues } = await supabase
        .from("venues")
        .select("id,name")
        .order("name");

    return (
        <main className="space-y-6">
            <h1 className="text-3xl font-bold">
                ライブ追加
            </h1>

            <LiveForm
                venues={venues ?? []}
            />
        </main>
    );
}