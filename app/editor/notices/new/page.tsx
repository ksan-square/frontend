import Breadcrumbs from "@/app/_components/breadcrumbs";
import PageHero from "@/app/_components/page-hero";
import NoticeForm from "../notice-form";

export default function NewNoticePage() {
    return (
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/editor", label: "管理" },
                    { href: "/editor/notices", label: "お知らせ管理" },
                    { label: "お知らせ追加" },
                ]}
            />

            <PageHero
                badge="Editor / Notices"
                title="お知らせを追加"
                description="タイトル・公開日時・本文を入力します。"
            />

            <NoticeForm />
        </main>
    );
}
