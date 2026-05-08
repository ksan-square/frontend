import NoticeForm from "./notice-form";

export default function NewNoticePage() {
    return (
        <main className="space-y-6">
            <h1 className="text-3xl font-bold">お知らせを追加</h1>
            <NoticeForm />
        </main>
    );
}