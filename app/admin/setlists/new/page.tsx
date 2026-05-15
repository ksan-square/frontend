import { supabase } from "@/lib/supabase";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import SetlistForm from "./setlist-form";

export default async function NewSetlistPage() {
    const { data: lives } = await supabase
        .from("lives")
        .select("id,live_date,event_name")
        .eq("is_delete", false)
        .order("live_date", { ascending: false });

    const { data: songs } = await supabase
        .from("songs")
        .select("id,title")
        .eq("is_delete", false)
        .order("order_no", { ascending: true });

    return (
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { label: "セトリ追加" },
                ]}
            />

            <h1 className="text-3xl font-bold">セトリを追加</h1>
            <SetlistForm lives={lives ?? []} songs={songs ?? []} />
        </main>
    );
}
