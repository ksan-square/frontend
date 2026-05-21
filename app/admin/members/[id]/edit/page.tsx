import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import MemberForm from "../../member-form";
import { getAdminMemberDetail } from "@/lib/admin-server-api";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditMemberPage({ params }: Props) {
    const { id } = await params;
    const payload = await getAdminMemberDetail(id);
    if (!payload.found || !payload.member) {
        return <main>メンバーが見つかりませんでした。</main>;
    }
    const member = payload.member;

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
