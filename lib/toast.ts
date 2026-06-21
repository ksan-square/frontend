// @boundary CLIENT ONLY (browser)
// カスタムイベント経由のトースト通知ユーティリティ。window に依存。
//
// Boundary:   BROWSER ONLY — window を参照。SSR 時は noop (window undefined チェックあり)。
// Safe in:    "use client" コンポーネント内のみ。
// Forbidden:  Server Component から呼び出さない (型 import は可)。

export type AppToastPayload = {
    kind?: "success" | "error";
    text: string;
};

const TOAST_EVENT = "ksan:toast";

export function showToast(payload: AppToastPayload) {
    if (typeof window === "undefined") {
        return;
    }
    window.dispatchEvent(new CustomEvent<AppToastPayload>(TOAST_EVENT, { detail: payload }));
}

export function subscribeToast(listener: (payload: AppToastPayload) => void) {
    if (typeof window === "undefined") {
        return () => undefined;
    }

    function handleEvent(event: Event) {
        const customEvent = event as CustomEvent<AppToastPayload>;
        listener(customEvent.detail);
    }

    window.addEventListener(TOAST_EVENT, handleEvent);
    return () => window.removeEventListener(TOAST_EVENT, handleEvent);
}
