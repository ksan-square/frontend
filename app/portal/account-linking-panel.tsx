"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getClientSiteUrl } from "@/lib/site-url";
import { showToast } from "@/lib/toast";

type PortalIdentity = {
    provider: string;
    provider_user_id: string | null;
    is_primary: boolean;
};

type Props = {
    initialIdentities: PortalIdentity[];
};

type IdentitySummary = {
    provider: string;
    provider_user_id: string | null;
    is_primary: boolean;
};

const OAUTH_LINK_PROVIDERS = [
    { provider: "google", label: "Google を追加" },
    { provider: "github", label: "GitHub を追加" },
] as const;

const ENABLE_OAUTH_LINKING = false;

function formatProviderName(provider: string) {
    switch (provider) {
        case "x":
            return "X";
        case "google":
            return "Google";
        case "github":
            return "GitHub";
        case "email":
            return "Email";
        default:
            return provider;
    }
}

function normalizeIdentity(identity: Record<string, unknown>): IdentitySummary | null {
    const provider = identity.provider;
    const providerId =
        typeof identity.provider_id === "string"
            ? identity.provider_id
            : typeof identity.id === "string"
              ? identity.id
              : null;

    if (typeof provider !== "string" || !provider) {
        return null;
    }

    return {
        provider,
        provider_user_id: providerId,
        is_primary: false,
    };
}

export default function AccountLinkingPanel({ initialIdentities }: Props) {
    const router = useRouter();
    const supabase = useMemo(
        () =>
            createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
            ),
        [],
    );

    const [identities, setIdentities] = useState<IdentitySummary[]>(initialIdentities);
    const [currentEmail, setCurrentEmail] = useState<string>("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLinkingProvider, setIsLinkingProvider] = useState<string | null>(null);
    const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

    async function refreshIdentities(showSuccess = false) {
        setIsRefreshing(true);

        const [{ data: userData, error: userError }, { data, error }] = await Promise.all([
            supabase.auth.getUser(),
            supabase.auth.getUserIdentities(),
        ]);

        setIsRefreshing(false);

        if (userError || error) {
            showToast({
                kind: "error",
                text: "連携アカウント情報を更新できませんでした。",
            });
            return;
        }

        const appMetadata = userData.user?.app_metadata ?? {};
        const primaryProvider =
            typeof appMetadata.provider === "string" ? appMetadata.provider : null;

        const nextIdentities =
            data?.identities
                ?.map((identity) =>
                    normalizeIdentity(identity as unknown as Record<string, unknown>),
                )
                .filter((identity): identity is IdentitySummary => identity !== null)
                .map((identity) => ({
                    ...identity,
                    is_primary: identity.provider === primaryProvider,
                })) ?? [];

        setIdentities(nextIdentities);
        setCurrentEmail(userData.user?.email ?? "");
        if (!email && userData.user?.email) {
            setEmail(userData.user.email);
        }

        if (showSuccess) {
            showToast({
                text: "連携アカウント情報を更新しました。",
            });
        }

        router.refresh();
    }

    async function handleLinkProvider(provider: (typeof OAUTH_LINK_PROVIDERS)[number]["provider"]) {
        setIsLinkingProvider(provider);

        const redirectTo = new URL("/auth/callback", getClientSiteUrl());
        redirectTo.searchParams.set("next", "/portal");

        const { error } = await supabase.auth.linkIdentity({
            provider,
            options: {
                redirectTo: redirectTo.toString(),
            },
        });

        setIsLinkingProvider(null);

        if (error) {
            showToast({
                kind: "error",
                text: `追加連携を開始できませんでした: ${error.message}`,
            });
        }
    }

    async function handleAttachEmail(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (password.length < 8) {
            showToast({
                kind: "error",
                text: "パスワードは8文字以上で設定してください。",
            });
            return;
        }

        if (password !== passwordConfirm) {
            showToast({
                kind: "error",
                text: "確認用パスワードが一致していません。",
            });
            return;
        }

        setIsSubmittingEmail(true);

        const redirectTo = `${getClientSiteUrl()}/portal`;
        const { error } = await supabase.auth.updateUser(
            {
                email: email.trim(),
                password,
            },
            {
                emailRedirectTo: redirectTo,
            },
        );

        setIsSubmittingEmail(false);

        if (error) {
            showToast({
                kind: "error",
                text: `メール連携を設定できませんでした: ${error.message}`,
            });
            return;
        }

        showToast({
            text: "メール連携の設定を受け付けました。確認メールをご確認ください。",
        });

        setPassword("");
        setPasswordConfirm("");
        await refreshIdentities();
    }

    const linkedProviders = new Set(identities.map((identity) => identity.provider));

    return (
        <section className="space-y-6 bg-[#111113] p-5 ring-1 ring-white/10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                        Linked Identities
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-white">
                        連携アカウント
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                        現在は X を主導線にしています。ここから将来の login method 追加に備えた土台を置いています。
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void refreshIdentities(true)}
                    disabled={isRefreshing}
                    className="rounded-sm bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isRefreshing ? "更新中..." : "状態を更新"}
                </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                {identities.map((identity) => (
                    <div
                        key={`${identity.provider}-${identity.provider_user_id ?? "none"}`}
                        className="space-y-2 bg-black/60 p-4 ring-1 ring-white/10"
                    >
                        <p className="text-sm font-semibold text-white">
                            {formatProviderName(identity.provider)}
                        </p>
                        <p className="text-xs text-zinc-400">
                            {identity.is_primary ? "primary" : "linked"}
                        </p>
                    </div>
                ))}
            </div>

            <div className={ENABLE_OAUTH_LINKING ? "grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" : "grid gap-6"}>
                {ENABLE_OAUTH_LINKING ? (
                    <div className="space-y-4 bg-black/50 p-4 ring-1 ring-white/10">
                        <div>
                            <p className="text-sm font-semibold text-white">OAuth 追加連携</p>
                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                manual linking を有効化した provider だけが使えます。link 後は `/portal` に戻って identities が再同期されます。
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {OAUTH_LINK_PROVIDERS.map((item) => {
                                const alreadyLinked = linkedProviders.has(item.provider);
                                return (
                                    <button
                                        key={item.provider}
                                        type="button"
                                        onClick={() => void handleLinkProvider(item.provider)}
                                        disabled={alreadyLinked || isLinkingProvider !== null}
                                        className="rounded-sm bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {alreadyLinked
                                            ? `${formatProviderName(item.provider)} は連携済み`
                                            : isLinkingProvider === item.provider
                                              ? "接続中..."
                                              : item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : null}

                <form
                    onSubmit={handleAttachEmail}
                    className="space-y-4 bg-black/50 p-4 ring-1 ring-white/10"
                >
                    <div>
                        <p className="text-sm font-semibold text-white">Email / Password を追加</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                            OAuth アカウントに email/password ログインを追加する入口です。Supabase では `updateUser()` で扱います。
                        </p>
                    </div>

                    {currentEmail ? (
                        <p className="text-xs text-zinc-500">現在の auth email: {currentEmail}</p>
                    ) : null}

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-pink-400"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-pink-400"
                            placeholder="8文字以上"
                            minLength={8}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={passwordConfirm}
                            onChange={(event) => setPasswordConfirm(event.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-pink-400"
                            placeholder="確認用"
                            minLength={8}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmittingEmail}
                        className="rounded-sm bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmittingEmail ? "設定中..." : "Email / Password を追加"}
                    </button>
                </form>
            </div>
        </section>
    );
}
