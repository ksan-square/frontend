import Breadcrumbs from "@/app/_components/breadcrumbs";
import PageHero from "@/app/_components/page-hero";
import MemberForm from "../member-form";

export default function NewMemberPage() {
    return (
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/editor", label: "管理" },
                    { href: "/editor/members", label: "メンバー管理" },
                    { label: "メンバー追加" },
                ]}
            />

            <PageHero
                badge="Editor / Members"
                title="メンバー追加"
                description="名前・カラー・表示順を設定します。"
            />

            <MemberForm />
        </main>
    );
}
