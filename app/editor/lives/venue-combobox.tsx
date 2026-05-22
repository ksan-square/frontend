"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createVenue, searchVenues } from "@/lib/admin-api";
import { showToast } from "@/lib/toast";

type VenueOption = {
    id: string;
    name: string;
    area: string | null;
    address?: string | null;
    google_map_url?: string | null;
};

type VenueComboboxProps = {
    onChange: (venue: VenueOption | null) => void;
    initialVenue?: VenueOption | null;
    initialOptions?: VenueOption[];
    name?: string;
    placeholder?: string;
    emptyLabel?: string;
};

const SEARCH_LIMIT = 20;

function formatVenueLabel(venue: VenueOption | null) {
    if (!venue) {
        return "";
    }
    return `${venue.name}${venue.area ? ` / ${venue.area}` : ""}`;
}

export default function VenueCombobox({
    onChange,
    initialVenue = null,
    initialOptions = [],
    name,
    placeholder = "会場を検索",
    emptyLabel = "基準会場を未設定",
}: VenueComboboxProps) {
    const baseId = useId();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState(initialVenue ? formatVenueLabel(initialVenue) : "");
    const [selectedVenue, setSelectedVenue] = useState<VenueOption | null>(initialVenue);
    const [results, setResults] = useState<VenueOption[]>(initialOptions.slice(0, SEARCH_LIMIT));
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [createName, setCreateName] = useState("");
    const [createArea, setCreateArea] = useState("");
    const [createAddress, setCreateAddress] = useState("");
    const [createGoogleMapUrl, setCreateGoogleMapUrl] = useState("");
    const [createError, setCreateError] = useState("");
    const [creating, setCreating] = useState(false);

    const showCreateAction = query.trim().length > 0 && !loading && results.length === 0;
    const actionCount = results.length + (showCreateAction ? 1 : 0);

    useEffect(() => {
        if (!open) {
            return;
        }

        const timer = window.setTimeout(async () => {
            setLoading(true);
            setErrorMessage("");
            try {
                const payload = await searchVenues({
                    q: query.trim() || null,
                    limit: SEARCH_LIMIT,
                });
                setResults(payload.items);
                setHighlightedIndex(0);
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : "会場検索に失敗しました。");
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 180);

        return () => window.clearTimeout(timer);
    }, [open, query]);

    useEffect(() => {
        function handlePointerDown(event: MouseEvent) {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setOpen(false);
                setQuery(selectedVenue ? formatVenueLabel(selectedVenue) : "");
            }
        }

        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, [selectedVenue]);

    function commitSelection(venue: VenueOption | null) {
        setSelectedVenue(venue);
        setQuery(venue ? formatVenueLabel(venue) : "");
        setOpen(false);
        onChange(venue);
    }

    function openCreateModal() {
        setCreateName(query.trim());
        setCreateArea("");
        setCreateAddress("");
        setCreateGoogleMapUrl("");
        setCreateError("");
        setCreateOpen(true);
        setOpen(false);
    }

    async function handleCreateVenue() {
        if (!createName.trim()) {
            const message = "会場名は必須です。";
            setCreateError(message);
            showToast({ kind: "error", text: message });
            return;
        }

        setCreating(true);
        setCreateError("");
        try {
            const payload = {
                name: createName.trim(),
                area: createArea.trim() || null,
                address: createAddress.trim() || null,
                google_map_url: createGoogleMapUrl.trim() || null,
            };
            const created = await createVenue(payload);
            const venue: VenueOption = {
                id: created.id,
                ...payload,
            };
            setResults((current) => [venue, ...current.filter((item) => item.id !== venue.id)].slice(0, SEARCH_LIMIT));
            commitSelection(venue);
            setCreateOpen(false);
            showToast({ kind: "success", text: "会場を作成しました。" });
        } catch (error) {
            const message = error instanceof Error ? error.message : "会場作成に失敗しました。";
            setCreateError(message);
            showToast({ kind: "error", text: message });
        } finally {
            setCreating(false);
        }
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
            setOpen(true);
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (actionCount === 0) {
                return;
            }
            setHighlightedIndex((current) => (current + 1) % actionCount);
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            if (actionCount === 0) {
                return;
            }
            setHighlightedIndex((current) => (current - 1 + actionCount) % actionCount);
            return;
        }

        if (event.key === "Escape") {
            setOpen(false);
            setQuery(selectedVenue ? formatVenueLabel(selectedVenue) : "");
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
            if (results[highlightedIndex]) {
                commitSelection(results[highlightedIndex]);
                return;
            }
            if (showCreateAction && highlightedIndex === results.length) {
                openCreateModal();
            }
        }
    }

    return (
        <>
            <div ref={wrapperRef} className="relative space-y-2">
                {name && (
                    <input type="hidden" name={name} value={selectedVenue?.id ?? ""} />
                )}

                <div className="rounded-xl border border-zinc-800 bg-zinc-950">
                    <div className="flex items-center gap-2 px-3">
                        <input
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setOpen(true);
                            }}
                            onFocus={() => setOpen(true)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="w-full bg-transparent py-3 outline-none"
                            aria-expanded={open}
                            aria-controls={`${baseId}-listbox`}
                            aria-autocomplete="list"
                            role="combobox"
                        />
                        {selectedVenue && (
                            <button
                                type="button"
                                onClick={() => commitSelection(null)}
                                className="rounded-sm px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-white"
                            >
                                解除
                            </button>
                        )}
                    </div>
                </div>

                {selectedVenue && (
                    <p className="text-xs text-zinc-500">
                        選択中: {formatVenueLabel(selectedVenue)}
                    </p>
                )}

                {open && (
                    <div
                        id={`${baseId}-listbox`}
                        role="listbox"
                        className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl"
                    >
                        <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => commitSelection(null)}
                            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${
                                highlightedIndex === 0 && !results[0]
                                    ? "bg-zinc-900 text-white"
                                    : "text-zinc-300 hover:bg-zinc-900"
                            }`}
                        >
                            <span>{emptyLabel}</span>
                        </button>

                        {loading && (
                            <div className="px-4 py-3 text-sm text-zinc-400">検索中...</div>
                        )}

                        {!loading && results.map((venue, index) => (
                            <button
                                key={venue.id}
                                type="button"
                                role="option"
                                aria-selected={selectedVenue?.id === venue.id}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => commitSelection(venue)}
                                className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left ${
                                    highlightedIndex === index
                                        ? "bg-zinc-900 text-white"
                                        : "text-zinc-200 hover:bg-zinc-900"
                                }`}
                            >
                                <div className="min-w-0">
                                    <div className="font-semibold">{venue.name}</div>
                                    {(venue.area || venue.address) && (
                                        <div className="text-xs text-zinc-400">
                                            {[venue.area, venue.address].filter(Boolean).join(" / ")}
                                        </div>
                                    )}
                                </div>
                                {selectedVenue?.id === venue.id && (
                                    <span className="text-xs text-pink-300">選択中</span>
                                )}
                            </button>
                        ))}

                        {!loading && errorMessage && (
                            <div className="px-4 py-3 text-sm text-red-400">{errorMessage}</div>
                        )}

                        {!loading && !errorMessage && showCreateAction && (
                            <button
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={openCreateModal}
                                className={`flex w-full items-center justify-between px-4 py-3 text-left ${
                                    highlightedIndex === results.length
                                        ? "bg-zinc-900 text-white"
                                        : "text-pink-300 hover:bg-zinc-900"
                                }`}
                            >
                                <span>会場を新規作成</span>
                                <span className="text-xs text-zinc-500">{query.trim()}</span>
                            </button>
                        )}

                        {!loading && !errorMessage && !showCreateAction && results.length === 0 && (
                            <div className="px-4 py-3 text-sm text-zinc-400">該当する会場はありません。</div>
                        )}
                    </div>
                )}
            </div>

            {createOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="text-lg font-bold text-white">会場を新規作成</h3>
                            <button
                                type="button"
                                onClick={() => setCreateOpen(false)}
                                className="rounded-sm px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
                            >
                                閉じる
                            </button>
                        </div>

                        <div
                            className="space-y-4"
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    void handleCreateVenue();
                                }
                            }}
                        >
                            <input
                                value={createName}
                                onChange={(event) => setCreateName(event.target.value)}
                                placeholder="会場名"
                                className="w-full rounded-xl bg-zinc-900 p-3"
                                required
                            />
                            <input
                                value={createArea}
                                onChange={(event) => setCreateArea(event.target.value)}
                                placeholder="エリア"
                                className="w-full rounded-xl bg-zinc-900 p-3"
                            />
                            <input
                                value={createAddress}
                                onChange={(event) => setCreateAddress(event.target.value)}
                                placeholder="住所"
                                className="w-full rounded-xl bg-zinc-900 p-3"
                            />
                            <input
                                value={createGoogleMapUrl}
                                onChange={(event) => setCreateGoogleMapUrl(event.target.value)}
                                placeholder="Google Map URL"
                                className="w-full rounded-xl bg-zinc-900 p-3"
                            />

                            {createError && <p className="text-sm text-red-400">{createError}</p>}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => void handleCreateVenue()}
                                    disabled={creating}
                                    className="rounded-full bg-pink-500 px-5 py-3 font-bold text-white disabled:opacity-60"
                                >
                                    {creating ? "作成中..." : "作成して選択"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCreateOpen(false)}
                                    className="rounded-full bg-zinc-800 px-5 py-3"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
