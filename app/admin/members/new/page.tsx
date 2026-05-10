import MemberForm from "./member-form";

export default function NewMemberPage() {
    return (
        <main className="space-y-6">
            <h1 className="text-3xl font-bold">メンバー追加</h1>
            <MemberForm />
        </main>
    );
}