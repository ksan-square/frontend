import Breadcrumbs from "@/app/_components/breadcrumbs";
import PageHero from "@/app/_components/page-hero";
import NoticeForm from "../../notice-form";
import { getAdminNoticeDetail } from "@/lib/admin-server-api";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditNoticePage({ params }: Props) {
    const { id } = await params;
    const payload = await getAdminNoticeDetail(id);
    if (!payload.found || !payload.notice) {
        return <main>お知らせが見つかりませんでした。</main>;
    }
    const notice = payload.notice;

    return (
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/editor", label: "管理" },
                    { href: "/editor/notices", label: "お知らせ管理" },
                    { label: notice.title },
                ]}
            />

            <PageHero
                badge="Editor / Notices"
                title={notice.title}
                description="タイトル・公開日時・本文を編集します。"
            />

            <NoticeForm initialData={notice} />
        </main>
    );
}
