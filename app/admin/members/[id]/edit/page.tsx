import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import { supabase } from "@/lib/supabase";
import MemberForm from "../../member-form";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditMemberPage({ params }: Props) {
    const { id } = await params;

    const { data: member, error } = await supabase
        .from("members")
        .select(
            "id,name,member_color_name,member_color_code,lyric_display_color_code,profile,sort_order,is_active",
        )
        .eq("id", id)
        .eq("is_delete", false)
        .single();

    if (error || !member) {
        return <main>メンバーが見つかりませんでした。</main>;
    }

    return (
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { href: "/admin/members", label: "メンバー管理" },
                    { label: member.name },
                ]}
            />

            <Link
                href="/admin/members"
                className="inline-block rounded-full bg-zinc-800 px-4 py-2"
            >
                戻る
            </Link>

            <h1 className="text-3xl font-bold">メンバー編集</h1>
            <MemberForm initialData={member} />
        </main>
    );
}
