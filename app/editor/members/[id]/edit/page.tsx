import Breadcrumbs from "@/app/_components/breadcrumbs";
import PageHero from "@/app/_components/page-hero";
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
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/editor", label: "管理" },
                    { href: "/editor/members", label: "メンバー管理" },
                    { label: member.name },
                ]}
            />

            <PageHero
                badge="Editor / Members"
                title={member.name}
                description="名前・カラー・表示順・プロフィールを編集します。"
            />

            <MemberForm initialData={member} />
        </main>
    );
}
