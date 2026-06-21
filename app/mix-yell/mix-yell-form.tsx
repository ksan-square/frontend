"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { createMixYell, type PublicMixYellCreateRequest } from "@/lib/public-api";
import { getTodayInTokyo } from "@/lib/date-time";

type SubmissionState =
  | {
      status: "idle" | "submitting" | "success";
      message: string | null;
      postedDate?: string;
      postedName?: string;
      postedImageName?: string;
    }
  | {
      status: "error";
      message: string;
      postedDate?: undefined;
      postedName?: undefined;
      postedImageName?: undefined;
    };

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_BASE64_LENGTH = 12000000;
const STORAGE_NAME_KEY = "mixYellName";

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("画像の読み込みに失敗しました。"));
        return;
      }

      const [, base64] = result.split(",", 2);
      resolve(base64 || "");
    };

    reader.onerror = () => {
      reject(new Error("画像の読み込みに失敗しました。"));
    };

    reader.readAsDataURL(file);
  });
}

export default function MixYellForm() {
  const [date, setDate] = useState(getTodayInTokyo());
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    status: "idle",
    message: null,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const savedName = window.localStorage.getItem(STORAGE_NAME_KEY);
    if (savedName) {
      setName(savedName);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
      }
    };
  }, []);

  function clearImage() {
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
    }

    imageUrlRef.current = null;
    setImageFile(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    const nextImage = event.currentTarget.files?.[0] ?? null;

    if (!nextImage) {
      clearImage();
      return;
    }

    if (!nextImage.type.startsWith("image/")) {
      setSubmissionState({
        status: "error",
        message: "画像形式を選択してください（jpg/png/gif/webp など）。",
      });
      clearImage();
      return;
    }

    if (nextImage.size > MAX_IMAGE_SIZE_BYTES) {
      setSubmissionState({
        status: "error",
        message: "画像サイズは8MB以下にしてください。",
      });
      clearImage();
      return;
    }

    const previewUrl = URL.createObjectURL(nextImage);
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
    }
    imageUrlRef.current = previewUrl;
    setImageFile(nextImage);
    setImagePreview(previewUrl);
    setSubmissionState((prev) => ({
      ...prev,
      status: prev.status === "error" ? "idle" : prev.status,
      message: prev.status === "error" ? null : prev.message,
    }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!date) {
      setSubmissionState({
        status: "error",
        message: "日付は必須です。",
      });
      return;
    }

    if (!normalizedName && !imageFile) {
      setSubmissionState({
        status: "error",
        message: "名前か投票スクショのどちらかを入力してください。",
      });
      return;
    }

    const payload: PublicMixYellCreateRequest = {
      date,
    };

    if (normalizedName) {
      payload.name = normalizedName;
    }

    if (imageFile) {
      const imageBase64 = await toBase64(imageFile);
      if (imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
        setSubmissionState({
          status: "error",
          message: "画像サイズが大きすぎます（base64変換後）。",
        });
        return;
      }
      payload.image_file_name = imageFile.name;
      payload.image_content_type = imageFile.type;
      payload.image_base64 = imageBase64;
    }

    setSubmissionState({
      status: "submitting",
      message: "送信中…",
    });

    try {
      await createMixYell(payload);
      window.localStorage.setItem(STORAGE_NAME_KEY, normalizedName);
      setSubmissionState({
        status: "success",
        message: "投稿を受け付けました。",
        postedDate: date,
        postedName: normalizedName || undefined,
        postedImageName: imageFile?.name,
      });
      clearImage();
      setDate(getTodayInTokyo());
    } catch (error) {
      setSubmissionState({
        status: "error",
        message: error instanceof Error ? error.message : "投稿に失敗しました。",
      });
    }

    return;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="surface-subtle space-y-4 p-5">
        <div className="border-b border-zinc-800 pb-4">
          <h2 className="text-lg font-black text-white">投票報告</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            名前または投票画面の画像を送信してください。
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-zinc-300" htmlFor="mix-yell-date">
            投票日
          </label>
          <input
            id="mix-yell-date"
            type="date"
            className="w-full rounded-sm bg-black p-3 text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-violet-400"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
          <p className="text-sm text-zinc-400">デフォルトは今日の日付です。</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-zinc-300" htmlFor="mix-yell-name">
            名前
          </label>
          <input
            id="mix-yell-name"
            type="text"
            className="w-full rounded-sm bg-black p-3 text-zinc-100 outline-none ring-1 ring-white/10 placeholder:text-zinc-600 focus:ring-violet-400"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              window.localStorage.setItem(STORAGE_NAME_KEY, event.target.value);
            }}
            placeholder="確認用の名前を入力"
            maxLength={80}
          />
        </div>

        <div className="space-y-3">
          <label
            className="block text-sm font-semibold text-zinc-300"
            htmlFor="mix-yell-image"
          >
            画像
          </label>
          <input
            id="mix-yell-image"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="w-full rounded-sm bg-black p-3 text-zinc-100 ring-1 ring-white/10 file:mr-3 file:rounded-sm file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-bold file:text-zinc-100 hover:file:bg-white hover:file:text-black"
            onChange={onImageChange}
          />
          <p className="text-sm text-zinc-400">名前か画像のどちらかがあれば投稿できます。</p>
        </div>

        {imagePreview ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-zinc-300">画像プレビュー</p>
            <div className="relative inline-block">
              <img src={imagePreview} alt="選択した画像" className="max-h-56 border border-zinc-700" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute right-2 top-2 rounded-sm bg-black/80 px-2 py-1 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white hover:text-black"
              >
                削除
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-violet-500 px-5 py-3 font-black text-white hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submissionState.status === "submitting"}
        >
          投稿する
        </button>
      </div>

      {submissionState.message ? (
        <p
          className={`rounded-sm px-4 py-3 text-sm ${
            submissionState.status === "error"
              ? "bg-red-900/40 text-red-200"
              : submissionState.status === "submitting"
                ? "bg-zinc-800 text-zinc-200"
                : "bg-emerald-900/40 text-emerald-100"
          }`}
        >
          {submissionState.message}
        </p>
      ) : null}

      {submissionState.status === "success" && submissionState.postedDate ? (
        <section className="surface-subtle p-4">
          <h2 className="text-sm font-black text-zinc-100">送信内容（確認）</h2>
          <ul className="mt-3 space-y-1 text-sm text-zinc-300">
            <li>投票日: {submissionState.postedDate}</li>
            <li>名前: {submissionState.postedName || "（未入力）"}</li>
            <li>画像: {submissionState.postedImageName || "（未入力）"}</li>
          </ul>
        </section>
      ) : null}
    </form>
  );
}
