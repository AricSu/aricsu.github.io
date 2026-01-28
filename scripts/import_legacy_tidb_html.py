#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import hashlib
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Iterable
from urllib.parse import unquote, urlparse
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup
from markdownify import MarkdownConverter


def slugify_segment(value: str) -> str:
    s = value.strip().lower()
    s = s.replace("&", " and ")
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[^a-z0-9._-]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "page"


def yaml_quote(value: str) -> str:
    # Always quote to avoid YAML edge cases (colon, pipes, etc).
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def first_nonempty_line(text: str) -> str:
    for line in (l.strip() for l in text.splitlines()):
        if line:
            if line.startswith("#"):
                continue
            if line.startswith("```"):
                continue
            if line.startswith("![") or line.startswith("<img"):
                continue
            return line
    return ""


@dataclass(frozen=True)
class Page:
    src_html: Path
    rel_html: PurePosixPath
    dst_mdx: Path
    route: str


class VitePressConverter(MarkdownConverter):
    def __init__(self, *, page: Page, href_map: dict[str, str], asset_map: dict[str, str]):
        super().__init__(heading_style="ATX", bullets="-")
        self._page = page
        self._href_map = href_map
        self._asset_map = asset_map

    def convert_pre(self, el, text, parent_tags):
        # Prefer fenced blocks with language if available.
        lang = ""
        parent = getattr(el, "parent", None)
        if parent is not None:
            classes = parent.get("class") or []
            for c in classes:
                if c.startswith("language-"):
                    lang = c.removeprefix("language-")
                    break

        code_text = el.get_text("\n", strip=False)
        code_text = code_text.strip("\n")
        fence = "```"
        return f"\n\n{fence}{lang}\n{code_text}\n{fence}\n\n"

    def convert_img(self, el, text, parent_tags):
        alt = (el.get("alt") or "").strip()
        src = (el.get("src") or "").strip()
        if not src:
            return ""

        src = self._rewrite_asset_src(src)
        if alt:
            return f"![{alt}]({src})"
        return f"![]({src})"

    def convert_a(self, el, text, parent_tags):
        href = (el.get("href") or "").strip()
        if not href:
            return text
        if href.startswith("#"):
            return f"[{text}]({href})" if text else href

        parsed = urlparse(href)
        if parsed.scheme in ("http", "https", "mailto", "tel"):
            return f"[{text}]({href})" if text else href

        href = self._rewrite_internal_href(href)
        return f"[{text}]({href})" if text else href

    def _rewrite_internal_href(self, href: str) -> str:
        parsed = urlparse(href)
        path = unquote(parsed.path)

        # Old site pages
        if path.endswith(".html") and (path.startswith("/en/work/tidb/") or path.startswith("/zh/work/tidb/")):
            mapped = self._href_map.get(path)
            if mapped:
                # mapped is a route like "legacy/xxx/yyy"
                current_route = PurePosixPath(self._page.route)
                target_route = PurePosixPath(mapped)
                rel = os.path.relpath(target_route, start=current_route.parent).replace(os.sep, "/")
                if not rel.startswith("."):
                    rel = f"./{rel}"
                if parsed.fragment:
                    rel = f"{rel}#{parsed.fragment}"
                return rel

        # Assets
        if path.startswith("/assets/"):
            return self._rewrite_asset_src(path)

        # Fallback: keep as-is (but drop origin-less absolute to avoid breaking).
        if path.startswith("/"):
            return path
        return href

    def _rewrite_asset_src(self, src: str) -> str:
        parsed = urlparse(src)
        path = parsed.path or src
        if path.startswith("/assets/"):
            mapped = self._asset_map.get(path)
            if mapped:
                return mapped
        return src


def iter_html_pages(src_root: Path) -> Iterable[Path]:
    for p in src_root.rglob("*.html"):
        yield p


def build_pages(src_root: Path, dst_docs_root: Path) -> list[Page]:
    pages: list[Page] = []
    for html_path in sorted(iter_html_pages(src_root)):
        rel_fs = html_path.relative_to(src_root)
        rel_posix = PurePosixPath(*rel_fs.parts)
        if rel_posix == PurePosixPath("index.html"):
            # We'll generate our own legacy index.
            continue

        slug_parts = [slugify_segment(p) for p in rel_posix.parts]
        slug_parts[-1] = slugify_segment(rel_posix.stem) + ".mdx"
        rel_mdx = PurePosixPath(*slug_parts).as_posix()
        dst_mdx = dst_docs_root / rel_mdx

        # Route is relative to content/docs/tidb-<lang> (no extension)
        route = PurePosixPath("legacy") / PurePosixPath(rel_mdx).with_suffix("")
        pages.append(
            Page(
                src_html=html_path,
                rel_html=rel_posix,
                dst_mdx=dst_mdx,
                route=route.as_posix(),
            )
        )
    return pages


def extract_vp_doc(soup: BeautifulSoup):
    # Prefer VitePress main doc container.
    for selector in ("div.vp-doc", ".VPDoc .vp-doc", "#VPContent .vp-doc"):
        el = soup.select_one(selector)
        if el is not None:
            return el
    return None


def strip_header_anchors(container) -> None:
    for a in container.select("a.header-anchor"):
        a.decompose()


def normalize_code_blocks(container) -> None:
    # Remove "copy" buttons and language badges.
    for btn in container.select("button.copy"):
        btn.decompose()
    for lang in container.select("span.lang"):
        lang.decompose()


def page_title(soup: BeautifulSoup, container=None, fallback_filename: str | None = None) -> str:
    raw = (soup.title.string if soup.title else "") or ""
    raw = raw.strip()
    if "|" in raw:
        raw = raw.split("|", 1)[0].strip()
    if not raw or raw.lower() == "askaric":
        if container is None:
            container = extract_vp_doc(soup)
        if container is not None:
            h1 = container.find("h1")
            if h1 is not None:
                h1_text = h1.get_text(" ", strip=True)
                if h1_text:
                    return h1_text
        if fallback_filename:
            return fallback_filename
    return raw or (fallback_filename or "Untitled")


def write_mdx(page: Page, *, title: str, body_md: str, last_updated: str) -> None:
    page.dst_mdx.parent.mkdir(parents=True, exist_ok=True)
    description = first_nonempty_line(body_md)
    if len(description) > 160:
        description = description[:157].rstrip() + "..."

    frontmatter = "\n".join(
        [
            "---",
            f"title: {yaml_quote(title)}",
            f"description: {yaml_quote(description)}" if description else 'description: ""',
            "type: note",
            "tags: [tidb, legacy]",
            f"last_updated: {last_updated}",
            "---",
            "",
        ]
    )

    page.dst_mdx.write_text(frontmatter + body_md.strip() + "\n", encoding="utf-8")


def escape_mdx_text(markdown: str) -> str:
    # MDX treats `{...}` as expressions and `<Tag />` as JSX. Legacy content may include
    # Prometheus examples like `{name="x"}` or placeholder `<metric ...>` that must render as text.
    out_lines: list[str] = []
    in_fence = False

    for raw_line in markdown.splitlines():
        line = raw_line
        if line.startswith("```"):
            in_fence = not in_fence
            out_lines.append(line)
            continue

        if in_fence:
            out_lines.append(line)
            continue

        parts = line.split("`")
        for i in range(0, len(parts), 2):
            parts[i] = (
                parts[i]
                .replace("{", "&#123;")
                .replace("}", "&#125;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
            )
        out_lines.append("`".join(parts))

    return "\n".join(out_lines)


def localize_remote_images(markdown: str, *, dst_dir: Path) -> tuple[str, int]:
    dst_dir.mkdir(parents=True, exist_ok=True)
    replaced = 0

    pattern = re.compile(r"!\[([^\]]*)\]\((https?://[^)\s]+)\)")

    def repl(match: re.Match[str]) -> str:
        nonlocal replaced
        alt = match.group(1)
        url = match.group(2)

        parsed = urlparse(url)
        base = Path(parsed.path).name
        ext = Path(base).suffix.lower()
        if ext not in {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}:
            ext = ".bin"

        digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:12]
        filename = f"{digest}{ext}"
        dst_file = dst_dir / filename

        if not dst_file.exists():
            try:
                req = Request(url, headers={"User-Agent": "askaric-legacy-import/1.0"})
                with urlopen(req, timeout=15) as resp, open(dst_file, "wb") as out:
                    out.write(resp.read())
            except Exception:
                # If we can't fetch it, avoid breaking builds by turning it into a normal link.
                label = alt or "image"
                return f"[{label}]({url})"

        replaced += 1
        return f"![{alt}](/images/tidb/legacy/remote/{filename})"

    return pattern.sub(repl, markdown), replaced


def main() -> int:
    parser = argparse.ArgumentParser(description="Import legacy VitePress-built TiDB HTML pages into MDX docs.")
    parser.add_argument("--src-root", default="/Users/aric/Database/aricsu.github.io/en/work/tidb")
    parser.add_argument("--assets-root", default="/Users/aric/Database/aricsu.github.io/assets")
    parser.add_argument("--dst-docs-root", default="content/docs/tidb-en/legacy")
    parser.add_argument("--dst-images-root", default="public/images/tidb/legacy")
    parser.add_argument("--last-updated", default="2026-01-28")
    parser.add_argument("--write-meta", default="content/docs/tidb-en/meta.json")
    args = parser.parse_args()

    src_root = Path(args.src_root)
    assets_root = Path(args.assets_root)
    dst_docs_root = Path(args.dst_docs_root)
    dst_images_root = Path(args.dst_images_root)

    if not src_root.exists():
        raise SystemExit(f"src-root not found: {src_root}")

    pages = build_pages(src_root, dst_docs_root)

    # Build href mapping for old site links.
    href_map: dict[str, str] = {}
    for p in pages:
        # The built site uses /en/work/tidb/<rel>.html
        href_map[f"/en/work/tidb/{p.rel_html.as_posix()}"] = p.route
        href_map[f"/zh/work/tidb/{p.rel_html.as_posix()}"] = p.route

    # First pass: collect referenced /assets/* across pages.
    asset_refs: set[str] = set()
    for p in pages:
        soup = BeautifulSoup(p.src_html.read_text(encoding="utf-8", errors="ignore"), "lxml")
        container = extract_vp_doc(soup)
        if container is None:
            continue
        for img in container.select("img[src]"):
            src = (img.get("src") or "").strip()
            if src.startswith("/assets/"):
                asset_refs.add(urlparse(src).path)

    # Copy assets and build mapping to repo-relative file paths (as used in existing docs).
    asset_map: dict[str, str] = {}
    dst_images_root.mkdir(parents=True, exist_ok=True)
    for asset_path in sorted(asset_refs):
        rel = asset_path.removeprefix("/assets/")
        src_file = assets_root / rel
        if not src_file.exists():
            # Keep mapping absent; doc will keep original src for visibility.
            continue
        dst_file = dst_images_root / rel
        dst_file.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src_file, dst_file)

        # Use site-absolute URLs to avoid per-page relative path issues.
        asset_map[asset_path] = f"/images/tidb/legacy/{rel}"

    # Second pass: convert pages.
    page_titles: dict[str, str] = {}
    remote_total = 0
    for p in pages:
        soup = BeautifulSoup(p.src_html.read_text(encoding="utf-8", errors="ignore"), "lxml")
        container = extract_vp_doc(soup)
        if container is None:
            continue

        strip_header_anchors(container)
        normalize_code_blocks(container)

        converter = VitePressConverter(page=p, href_map=href_map, asset_map=asset_map)
        body_md = converter.convert_soup(container).strip()
        body_md, remote_count = localize_remote_images(
            body_md, dst_dir=Path(args.dst_images_root) / "remote"
        )
        remote_total += remote_count
        body_md = escape_mdx_text(body_md)
        title = page_title(soup, container, p.rel_html.stem)
        page_titles[p.route] = title
        write_mdx(p, title=title, body_md=body_md, last_updated=args.last_updated)

    # Create legacy index.
    legacy_index = dst_docs_root / "index.mdx"
    legacy_index.parent.mkdir(parents=True, exist_ok=True)
    legacy_index.write_text(
        "\n".join(
            [
                "---",
                "title: \"Legacy TiDB Notes\"",
                "description: \"Migrated pages from legacy VitePress HTML build.\"",
                "type: note",
                "tags: [tidb, legacy]",
                f"last_updated: {args.last_updated}",
                "---",
                "",
                "This section contains legacy TiDB notes migrated from an older site build.",
                "",
                "## Pages",
                "",
                *[
                    f"- [{page_titles.get(p.route, p.route)}](./{os.path.relpath(p.route, start='legacy').replace(os.sep, '/')})"
                    for p in pages
                ],
                "",
            ]
        )
        + "\n",
        encoding="utf-8",
    )

    # Update root meta.json to include legacy pages.
    meta_path = Path(args.write_meta)
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    pages_list = meta.get("pages") or []
    legacy_routes = ["legacy/index", *sorted({p.route for p in pages})]
    for route in legacy_routes:
        if route not in pages_list:
            pages_list.append(route)
    meta["pages"] = pages_list
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Imported {len(pages)} pages into {dst_docs_root}")
    print(f"Copied {len(asset_map)} assets into {dst_images_root}")
    print(f"Localized {remote_total} remote images into {dst_images_root / 'remote'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
