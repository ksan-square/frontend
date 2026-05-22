# frontend

こしあんスクエアのフロントエンドです。Next.js App Router で構成されており、公開画面、ポータル、管理画面を同じアプリで提供します。

## 主な画面

- 公開画面
  - `/`
  - `/songs`
  - `/songs/[slug]`
  - `/lives`
  - `/lives/[id]`
  - `/wiki`
  - `/wiki/[slug]`
- 認証・ポータル
  - `/login`
  - `/portal`
  - `/portal/admin`
- 管理画面
  - `/admin`
  - `/admin/songs`
  - `/admin/lives`
  - `/admin/members`
  - `/admin/venues`
  - `/admin/notices`

## セットアップ

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

開発サーバー:

```txt
http://localhost:3000
```

## 主な環境変数

フロントエンドは API と Supabase の両方を利用します。

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# API base URL は以下の優先順で解決される
API_URL=
FASTAPI_BASE_URL=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_FASTAPI_BASE_URL=
```

API base URL は `frontend/lib/public-api.ts` と `frontend/lib/admin-api.ts` で共通の優先順を使います。

1. `API_URL`
2. `FASTAPI_BASE_URL`
3. `NEXT_PUBLIC_API_URL`
4. `NEXT_PUBLIC_FASTAPI_BASE_URL`
5. 未設定時は `http://127.0.0.1:8000`

## 認証

- Supabase Auth を使用します
- ログイン導線は `/login`
- OAuth callback URL は `NEXT_PUBLIC_SITE_URL` を基準に組み立てます
- ポータル画面ではログイン済みユーザーのプロフィールと連携状態を表示します

## SEO / 構造化データ

公開画面にはページ単位の metadata を設定しています。

- title / description
- canonical
- OGP / Twitter card
- sitemap / robots
- JSON-LD

現時点での JSON-LD:

- 共通: `WebSite`, `Organization`
- トップ: `CollectionPage`
- 曲詳細: `MusicRecording`, `BreadcrumbList`
- ライブ詳細: `MusicEvent`, `BreadcrumbList`
- Wiki詳細: `Article`, `BreadcrumbList`

利用画像:

- OGP: `public/ksan-square-OPG.png`
- ロゴ: `public/koshian_square_logo.png`

## 歌割・コール表記

歌割・コール表示はモバイルでの読みやすさを優先し、以下の形で表示します。

```txt
[member]
歌詞

[CALL]
コール本文
```

描画ロジック:

- `app/_components/song-rich-markdown.tsx`
- `app/_components/song-content-blocks.tsx`

## よく使うコマンド

```bash
npm run dev
npm run lint
npx tsc --noEmit
```

## 関連ファイル

- metadata helper: `lib/seo.ts`
- public API client: `lib/public-api.ts`
- admin API client: `lib/admin-api.ts`
- login form: `app/login/login-form.tsx`
- portal page: `app/portal/page.tsx`
