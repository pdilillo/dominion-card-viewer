"use client";

import { Fragment, ReactNode, useState } from "react";

type SymbolKind = "coin" | "potion" | "vp" | "debt";

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, "\u00a0")
    .replace(/&ldquo;/g, "\u201c")
    .replace(/&rdquo;/g, "\u201d")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractTemplate(
  text: string,
  start: number,
): { inner: string; end: number } | null {
  if (text[start] !== "{" || text[start + 1] !== "{") return null;

  let depth = 0;
  for (let i = start; i < text.length - 1; i++) {
    if (text[i] === "{" && text[i + 1] === "{") {
      depth++;
      i++;
    } else if (text[i] === "}" && text[i + 1] === "}") {
      depth--;
      i++;
      if (depth === 0) {
        return { inner: text.slice(start + 2, i - 1), end: i + 1 };
      }
    }
  }
  return null;
}

function coinImageSrc(value: string, variant?: string): string | null {
  const upper = value.toUpperCase();
  if (upper === "P") return "/card-symbols/Potion.png";
  if (variant === "+") {
    const plusFile = `/card-symbols/Coin${value}plus.png`;
    // Coin1plus.png does not exist upstream; fall back to text rendering.
    if (value === "1") return null;
    return plusFile;
  }
  if (variant === "*") return `/card-symbols/Coin${value}star.png`;
  return `/card-symbols/Coin${value}.png`;
}

function coinFallbackLabel(value: string, variant?: string): string {
  const upper = value.toUpperCase();
  if (upper === "P") return "P";
  if (variant === "+") return `$${value}+`;
  if (variant === "*") return `$${value}*`;
  return `$${value}`;
}

function SymbolImage({
  kind,
  src,
  alt,
  fallback,
  className = "inline h-[1.1em] w-[1.1em] align-[-0.15em]",
}: {
  kind: SymbolKind;
  src: string;
  alt: string;
  fallback: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const potion = kind === "potion";
    return (
      <span
        className={`card-symbol-fallback ${potion ? "card-symbol-fallback--potion" : ""}`}
        title={alt}
      >
        {fallback}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

function renderTemplate(name: string, argStr: string): ReactNode {
  const key = name.toLowerCase();
  const args = argStr ? argStr.split("|") : [];

  if (key === "divline") {
    return <hr className="my-2 border-[var(--border)]" />;
  }

  if (key === "nowrap") {
    return (
      <span className="whitespace-nowrap">{parseBlockContent(argStr, "nowrap")}</span>
    );
  }

  if (key === "cost" || key === "coin" || key === "costplus") {
    const value = args[0] ?? "";
    const variant = key === "costplus" ? "+" : args[1];
    const src = coinImageSrc(value, variant);
    const alt = coinFallbackLabel(value, variant);
    const kind: SymbolKind = value.toUpperCase() === "P" ? "potion" : "coin";

    if (!src) {
      return (
        <span
          className={`card-symbol-fallback ${kind === "potion" ? "card-symbol-fallback--potion" : ""}`}
          title={alt}
        >
          {alt}
        </span>
      );
    }

    const sizeClass =
      args.includes("xl") || args.includes("2")
        ? "inline h-[1.35em] w-[1.35em] align-[-0.2em]"
        : undefined;

    return (
      <SymbolImage
        kind={kind}
        src={src}
        alt={alt}
        fallback={alt}
        className={sizeClass}
      />
    );
  }

  if (key === "vp") {
    const value = args[0];
    const label = value ? `${value} VP` : "VP";
    return (
      <span className="inline-flex items-center gap-0.5 whitespace-nowrap align-middle">
        <SymbolImage
          kind="vp"
          src="/card-symbols/VP.png"
          alt={label}
          fallback={value ? value : "VP"}
        />
        {value && (
          <span className="sr-only">{value} victory points</span>
        )}
      </span>
    );
  }

  if (key === "debt") {
    const value = args[0] ?? "";
    const label = value ? `${value} debt` : "Debt";
    return (
      <SymbolImage
        kind="debt"
        src={value ? `/card-symbols/Debt${value}.png` : "/card-symbols/Debt.png"}
        alt={label}
        fallback={value ? `${value} debt` : "debt"}
      />
    );
  }

  return null;
}

function parseBold(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let part = 0;

  while (i < text.length) {
    if (text.startsWith("'''", i)) {
      const end = text.indexOf("'''", i + 3);
      if (end === -1) {
        nodes.push(text.slice(i));
        break;
      }
      nodes.push(
        <strong key={`${keyPrefix}-b-${part++}`}>
          {parseInline(text.slice(i + 3, end), `${keyPrefix}-b${part}`)}
        </strong>,
      );
      i = end + 3;
      continue;
    }

    const nextBold = text.indexOf("'''", i);
    const chunk = nextBold === -1 ? text.slice(i) : text.slice(i, nextBold);
    nodes.push(...parseInline(chunk, `${keyPrefix}-t${part++}`));
    i = nextBold === -1 ? text.length : nextBold;
  }

  return nodes;
}

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let part = 0;

  while (i < text.length) {
    const template = extractTemplate(text, i);
    if (template) {
      const pipe = template.inner.indexOf("|");
      const name = pipe === -1 ? template.inner : template.inner.slice(0, pipe);
      const argStr = pipe === -1 ? "" : template.inner.slice(pipe + 1);
      const rendered = renderTemplate(name, argStr);
      if (rendered) {
        nodes.push(<Fragment key={`${keyPrefix}-tpl-${part++}`}>{rendered}</Fragment>);
      }
      i = template.end;
      continue;
    }

    const nextSpecial = (() => {
      const tpl = text.indexOf("{{", i);
      return tpl === -1 ? text.length : tpl;
    })();

    if (nextSpecial > i) {
      const chunk = decodeHtmlEntities(text.slice(i, nextSpecial));
      if (chunk) nodes.push(chunk);
      i = nextSpecial;
    } else {
      i += 2;
    }
  }

  return nodes;
}

function parseBlockContent(text: string, keyPrefix: string): ReactNode[] {
  return parseBold(text, keyPrefix);
}

function parseDescription(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let block = 0;

  while (i < text.length) {
    if (text.startsWith("<p>", i)) {
      const end = text.indexOf("</p>", i + 3);
      if (end === -1) {
        nodes.push(...parseBlockContent(text.slice(i), `p-${block}`));
        break;
      }
      const inner = text.slice(i + 3, end);
      nodes.push(
        <p key={`block-${block++}`} className="leading-relaxed">
          {parseBlockContent(inner, `p-${block}`)}
        </p>,
      );
      i = end + 4;
      continue;
    }

    if (text.startsWith("<br />", i) || text.startsWith("<br/>", i)) {
      nodes.push(<br key={`br-${block++}`} />);
      i += text.startsWith("<br />", i) ? 6 : 5;
      continue;
    }

    if (text.startsWith("<br>", i)) {
      nodes.push(<br key={`br-${block++}`} />);
      i += 4;
      continue;
    }

    const nextBreak = (() => {
      const candidates = [
        text.indexOf("<p>", i),
        text.indexOf("<br>", i),
        text.indexOf("<br/>", i),
        text.indexOf("<br />", i),
      ].filter((n) => n !== -1);
      return candidates.length ? Math.min(...candidates) : text.length;
    })();

    const chunk = text.slice(i, nextBreak);
    if (chunk.trim()) {
      nodes.push(
        <span key={`block-${block++}`} className="block leading-relaxed">
          {parseBlockContent(chunk, `span-${block}`)}
        </span>,
      );
    }
    i = nextBreak;
  }

  return nodes;
}

type Props = {
  description: string;
  className?: string;
};

export function CardDescription({ description, className }: Props) {
  if (!description) return null;

  return (
    <div className={className ?? "space-y-1 text-sm leading-relaxed text-[var(--text)]"}>
      {parseDescription(description)}
    </div>
  );
}
