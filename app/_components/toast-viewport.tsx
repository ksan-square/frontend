"use client";

import { useEffect, useState } from "react";
import { subscribeToast, type AppToastPayload } from "@/lib/toast";

type ToastItem = AppToastPayload & {
    id: string;
};

export default function ToastViewport() {
    const [items, setItems] = useState<ToastItem[]>([]);

    useEffect(() => {
        return subscribeToast((payload) => {
            const item = {
                ...payload,
                kind: payload.kind ?? "success",
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            };
            setItems((current) => [...current, item]);
            window.setTimeout(() => {
                setItems((current) => current.filter((toast) => toast.id !== item.id));
            }, 2800);
        });
    }, []);

    return (
        <div className="pointer-events-none fixed right-6 top-6 z-[100] flex max-w-sm flex-col gap-3">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 shadow-2xl"
                >
                    <p className={item.kind === "error" ? "text-sm text-red-300" : "text-sm text-emerald-300"}>
                        {item.text}
                    </p>
                </div>
            ))}
        </div>
    );
}
