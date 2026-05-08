import LoginForm from "./login-form";

export default function AdminLoginPage() {
    return (
        <main className="mx-auto max-w-md space-y-6">
            <div>
                <p className="text-sm font-semibold text-pink-300">Admin</p>
                <h1 className="mt-2 text-3xl font-bold">管理画面ログイン</h1>
                <p className="mt-3 text-sm text-zinc-400">
                    管理画面を利用するにはログインが必要である。
                </p>
            </div>

            <LoginForm />
        </main>
    );
}