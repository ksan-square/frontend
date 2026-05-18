"use client";

import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";

type Member = {
    id: string;
    name: string;
    member_color_code: string | null;
    lyric_display_color_code: string | null;
};

type DecorationRule = {
    pattern: RegExp;
    render: (
        match: RegExpMatchArray,
        children: React.ReactNode[],
        key: string,
        membersByName: Map<string, Member>,
    ) => React.ReactNode;
};

const colorNames = new Set([
    "white",
    "black",
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "gray",
]);

function createAnchorId(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-_ぁ-んァ-ヶ一-龠]/g, "");
}

function extractText(node: React.ReactNode): string {
    if (typeof node === "string") {
        return node;
    }

    if (Array.isArray(node)) {
        return node.map(extractText).join("");
    }

    return "";
}

function getSafeColor(value: string) {
    const color = value.trim();

    if (/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(color)) {
        return color;
    }

    if (colorNames.has(color)) {
        return color;
    }

    return undefined;
}

function parseMemberNames(rawValue: string) {
    return rawValue
        .split(/[\/,、&＆・]+/)
        .map((value) => value.trim())
        .filter(Boolean);
}

function getMemberLabel(names: string[]) {
    if (names.length === 0) {
        return "";
    }

    if (names.length === 1) {
        return names[0];
    }

    return names.join(" / ");
}

const rules: DecorationRule[] = [
    {
        pattern: /\[member:([^\]]+)\]([\s\S]*?)\[\/member\]/,
        render(match, children, key, membersByName) {
            const memberNames = parseMemberNames(match[1]);
            const matchedMembers = memberNames
                .map((name) => membersByName.get(name))
                .filter((member): member is Member => Boolean(member));
            const firstMember = matchedMembers[0];
            const memberLabel = getMemberLabel(
                matchedMembers.length > 0
                    ? matchedMembers.map((member) => member.name)
                    : memberNames,
            );

            return (
                <span
                    key={key}
                    className="inline-flex flex-col items-start gap-0.5 whitespace-pre-wrap align-top"
                    style={{
                        color:
                            firstMember?.lyric_display_color_code ??
                            firstMember?.member_color_code ??
                            undefined,
                    }}
                >
                    {memberLabel && (
                        <span className="block leading-none text-[11px] font-semibold opacity-70">
                            [{memberLabel}]
                        </span>
                    )}
                    <span className="block leading-snug">{children}</span>
                </span>
            );
        },
    },
    {
        pattern: /\[call\]([\s\S]*?)\[\/call\]/,
        render(match, children, key) {
            return (
                <span
                    key={key}
                    className="flex flex-col items-start gap-1 whitespace-pre-wrap rounded-xl border border-pink-500/30 bg-pink-500/10 px-3 py-2"
                >
                    <span className="block leading-none text-[11px] font-semibold text-pink-300">
                        CALL
                    </span>
                    <span className="block leading-snug font-bold text-pink-100">
                        {children}
                    </span>
                </span>
            );
        },
    },
    {
        pattern: /\[color:([^\]]+)\]([\s\S]*?)\[\/color\]/,
        render(match, children, key) {
            const color = getSafeColor(match[1]);

            return (
                <span key={key} style={color ? { color } : undefined}>
                    {children}
                </span>
            );
        },
    },
];

function decorateText(
    text: string,
    keyPrefix: string,
    membersByName: Map<string, Member>,
    ruleIndex = 0,
): React.ReactNode[] {
    if (ruleIndex >= rules.length) {
        return [text];
    }

    const rule = rules[ruleIndex];
    const match = text.match(rule.pattern);

    if (!match || match.index === undefined) {
        return decorateText(text, keyPrefix, membersByName, ruleIndex + 1);
    }

    const before = text.slice(0, match.index);
    const content =
        rule.pattern.source.startsWith("\\[call\\]") ? match[1] : match[2];
    const after = text.slice(match.index + match[0].length);

    return [
        ...decorateText(before, `${keyPrefix}-before`, membersByName, ruleIndex),
        rule.render(
            match,
            decorateText(content, `${keyPrefix}-content`, membersByName, 0),
            `${keyPrefix}-match-${match.index}`,
            membersByName,
        ),
        ...decorateText(after, `${keyPrefix}-after`, membersByName, ruleIndex),
    ];
}

function decorateNode(
    node: React.ReactNode,
    keyPrefix: string,
    membersByName: Map<string, Member>,
): React.ReactNode {
    if (typeof node === "string") {
        return decorateText(node, keyPrefix, membersByName);
    }

    if (Array.isArray(node)) {
        return node.map((child, index) =>
            decorateNode(child, `${keyPrefix}-${index}`, membersByName),
        );
    }

    return node;
}

export default function SongRichMarkdown({
    markdown,
    members,
}: {
    markdown: string;
    members: Member[];
}) {
    const membersByName = new Map(members.map((member) => [member.name, member]));

    const components: Components = {
        h1({ children }) {
            return (
                <h1 className="mt-8 text-3xl font-bold">
                    {decorateNode(children, "h1", membersByName)}
                </h1>
            );
        },
        h2({ children }) {
            const plainText = extractText(children);
            return (
                <h2
                    id={createAnchorId(plainText)}
                    className="mt-7 scroll-mt-52 text-2xl font-bold sm:scroll-mt-44"
                >
                    {decorateNode(children, "h2", membersByName)}
                </h2>
            );
        },
        h3({ children }) {
            return (
                <h3 className="mt-6 text-xl font-bold">
                    {decorateNode(children, "h3", membersByName)}
                </h3>
            );
        },
        p({ children }) {
            return (
                <p className="mt-4 whitespace-pre-wrap leading-8 text-zinc-200">
                    {decorateNode(children, "p", membersByName)}
                </p>
            );
        },
        ul({ children }) {
            return <ul className="mt-4 list-disc space-y-2 pl-6">{children}</ul>;
        },
        ol({ children }) {
            return <ol className="mt-4 list-decimal space-y-2 pl-6">{children}</ol>;
        },
        li({ children }) {
            return (
                <li className="whitespace-pre-wrap leading-7">
                    {decorateNode(children, "li", membersByName)}
                </li>
            );
        },
        code({ children }) {
            return (
                <code className="rounded bg-zinc-950 px-1.5 py-0.5 text-sm text-pink-200">
                    {children}
                </code>
            );
        },
        pre({ children }) {
            return (
                <pre className="mt-4 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-sm">
                    {children}
                </pre>
            );
        },
    };

    return (
        <div className="max-w-none">
            <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
        </div>
    );
}
