"use client";

import { useEffect, useState } from "react";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { supabaseClient } from "@/lib/supabase-client";

type Item = {
    id: string;
    order_no: number;
    note: string | null;
    songs: {
        id: string;
        title: string;
    } | null;
};

function SortableItem({
    item,
    onDelete,
}: {
    item: Item;
    onDelete: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: item.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
        >
            <div className="flex items-center justify-between gap-4">
                <div
                    className="flex cursor-grab items-center gap-4"
                    {...attributes}
                    {...listeners}
                >
                    <span className="rounded-full bg-pink-500 px-3 py-1 text-sm font-bold text-white">
                        {item.order_no}
                    </span>

                    <div>
                        <p className="font-bold">
                            {item.songs?.title ?? "不明な曲"}
                        </p>

                        {item.note && (
                            <p className="text-sm text-zinc-400">
                                {item.note}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => onDelete(item.id)}
                    className="rounded-full bg-red-500 px-4 py-2 text-sm"
                >
                    削除
                </button>
            </div>
        </li>
    );
}

export default function SortableSetlist({
    items,
    onDelete,
}: {
    items: Item[];
    onDelete: (id: string) => void;
}) {
    const [localItems, setLocalItems] =
        useState<Item[]>(items);

    useEffect(() => {
        setLocalItems(items);
    }, [items]);

    const sensors = useSensors(
        useSensor(PointerSensor)
    );

    async function handleDragEnd(event: any) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = localItems.findIndex(
            (v) => v.id === active.id
        );

        const newIndex = localItems.findIndex(
            (v) => v.id === over.id
        );

        const reordered = arrayMove(
            localItems,
            oldIndex,
            newIndex
        );

        setLocalItems(reordered);

        for (let i = 0; i < reordered.length; i++) {
            await supabaseClient
                .from("setlist_items")
                .update({
                    order_no: i + 1,
                })
                .eq("id", reordered[i].id);
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={localItems.map((v) => v.id)}
                strategy={verticalListSortingStrategy}
            >
                <ol className="space-y-3">
                    {localItems.map((item) => (
                        <SortableItem
                            key={item.id}
                            item={item}
                            onDelete={onDelete}
                        />
                    ))}
                </ol>
            </SortableContext>
        </DndContext>
    );
}