import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
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
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { href: "/admin/notices", label: "お知らせ管理" },
                    { label: notice.title },
                ]}
            />

            <Link
                href="/admin/notices"
                className="inline-block rounded-full bg-zinc-800 px-4 py-2"
            >
                戻る
            </Link>

            <h1 className="text-3xl font-bold">お知らせ編集</h1>
            <NoticeForm initialData={notice} />
        </main>
    );
}
