import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";

type DecorationRule = {
    pattern: RegExp;
    render: (
        match: RegExpMatchArray,
        children: React.ReactNode[],
        key: string,
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

const sizeClassNames: Record<string, string> = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
};

const fontClassNames: Record<string, string> = {
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
};

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

const rules: DecorationRule[] = [
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
    {
        pattern: /\[size:([^\]]+)\]([\s\S]*?)\[\/size\]/,
        render(match, children, key) {
            const className = sizeClassNames[match[1].trim()];

            return (
                <span key={key} className={className}>
                    {children}
                </span>
            );
        },
    },
    {
        pattern: /\[font:([^\]]+)\]([\s\S]*?)\[\/font\]/,
        render(match, children, key) {
            const className = fontClassNames[match[1].trim()];

            return (
                <span key={key} className={className}>
                    {children}
                </span>
            );
        },
    },
];

function decorateText(
    text: string,
    keyPrefix: string,
    ruleIndex = 0,
): React.ReactNode[] {
    if (ruleIndex >= rules.length) {
        return [text];
    }

    const rule = rules[ruleIndex];
    const match = text.match(rule.pattern);

    if (!match || match.index === undefined) {
        return decorateText(text, keyPrefix, ruleIndex + 1);
    }

    const before = text.slice(0, match.index);
    const content = match[2];
    const after = text.slice(match.index + match[0].length);

    return [
        ...decorateText(before, `${keyPrefix}-before`, ruleIndex),
        rule.render(
            match,
            decorateText(content, `${keyPrefix}-content`, 0),
            `${keyPrefix}-match-${match.index}`,
        ),
        ...decorateText(after, `${keyPrefix}-after`, ruleIndex),
    ];
}

function decorateNode(node: React.ReactNode, keyPrefix: string): React.ReactNode {
    if (typeof node === "string") {
        return decorateText(node, keyPrefix);
    }

    if (Array.isArray(node)) {
        return node.map((child, index) =>
            decorateNode(child, `${keyPrefix}-${index}`),
        );
    }

    return node;
}

const components: Components = {
    h1({ children }) {
        return (
            <h1 className="mt-8 text-3xl font-black text-white">
                {decorateNode(children, "h1")}
            </h1>
        );
    },
    h2({ children }) {
        return (
            <h2 className="mt-7 border-l-4 border-violet-500 pl-3 text-2xl font-black text-white">
                {decorateNode(children, "h2")}
            </h2>
        );
    },
    h3({ children }) {
        return (
            <h3 className="mt-6 text-xl font-black text-white">
                {decorateNode(children, "h3")}
            </h3>
        );
    },
    p({ children }) {
        return (
            <p className="mt-4 leading-8 text-zinc-200">
                {decorateNode(children, "p")}
            </p>
        );
    },
    a({ href, children }) {
        return (
            <a
                href={href}
                className="font-semibold text-fuchsia-300 hover:underline"
                rel="noopener noreferrer"
                target={href?.startsWith("http") ? "_blank" : undefined}
            >
                {decorateNode(children, "a")}
            </a>
        );
    },
    ul({ children }) {
        return <ul className="mt-4 list-disc space-y-2 pl-6">{children}</ul>;
    },
    ol({ children }) {
        return <ol className="mt-4 list-decimal space-y-2 pl-6">{children}</ol>;
    },
    li({ children }) {
        return <li className="leading-7">{decorateNode(children, "li")}</li>;
    },
    blockquote({ children }) {
        return (
            <blockquote className="mt-4 border-l-4 border-violet-500 bg-black/35 px-4 py-2 text-zinc-300">
                {children}
            </blockquote>
        );
    },
    code({ children }) {
        return (
            <code className="rounded-sm bg-black px-1.5 py-0.5 text-sm text-fuchsia-200 ring-1 ring-white/10">
                {children}
            </code>
        );
    },
    pre({ children }) {
        return (
            <pre className="mt-4 overflow-x-auto bg-black p-4 text-sm ring-1 ring-white/10">
                {children}
            </pre>
        );
    },
};

export default function RichMarkdown({ markdown }: { markdown: string }) {
    return (
        <div className="max-w-none">
            <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
        </div>
    );
}
