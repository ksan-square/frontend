import { supabase } from "@/lib/supabase";
import LiveForm from "../../live-form";
import SetlistEditor from "../../setlist-editor";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditPage({
    params,
}: Props) {
    const { id } = await params;

    const { data: live } = await supabase
        .from("lives")
        .select("*")
        .eq("id", id)
        .single();

    const { data: venues } = await supabase
        .from("venues")
        .select("id,name")
        .order("name");

    const { data: songs } = await supabase
        .from("songs")
        .select("id,title")
        .order("title");

    if (!live) {
        return <main>Not found</main>;
    }

    return (
        <main className="space-y-8">
            <Link href="/admin/lives" className="inline-block rounded-full bg-zinc-800 px-4 py-2">
                戻る
            </Link>
            <h1 className="text-3xl font-bold">
                ライブ編集
            </h1>

            <LiveForm
                venues={venues ?? []}
                initialData={live}
            />

            <SetlistEditor
                liveId={id}
                songs={songs ?? []}
            />
        </main>
    );
}
