import { supabase } from "@/lib/supabase";
import SetlistForm from "./setlist-form";

export default async function NewSetlistPage() {
    const { data: lives } = await supabase
        .from("lives")
        .select("id,live_date,event_name")
        .order("live_date", { ascending: false });

    const { data: songs } = await supabase
        .from("songs")
        .select("id,title")
        .order("title");

    return (
        <main className="space-y-6">
            <h1 className="text-3xl font-bold">セトリを追加</h1>
            <SetlistForm lives={lives ?? []} songs={songs ?? []} />
        </main>
    );
}