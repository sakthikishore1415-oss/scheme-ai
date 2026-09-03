#!/usr/bin/env python3
"""Crawl publicly available government scheme pages into reviewable NDJSON.

This collector is deliberately conservative: it honours robots.txt, rate-limits
requests, only follows explicitly allowed hosts, and stores source URLs and
retrieval timestamps alongside extracted content. It is not an eligibility
engine and its output must be verified against the official source before it is
shown to citizens.

Examples:
    python scripts/crawl_schemes.py --output data/schemes.ndjson --max-pages 80
    python scripts/crawl_schemes.py --seed https://www.tn.gov.in/ --allow-domain www.tn.gov.in \
        --output data/tamil-nadu-schemes.ndjson --max-pages 100
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from collections import deque
from datetime import UTC, datetime
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse, urlunparse
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser


DEFAULT_SEEDS = (
    "https://www.myscheme.gov.in/",
    "https://www.india.gov.in/",
)
DEFAULT_DOMAINS = ("www.myscheme.gov.in", "www.india.gov.in")
USER_AGENT = "ArivomThittamSchemeCrawler/1.0 (+https://github.com/arivom-thittam)"
SCHEME_TERMS = re.compile(
    r"\b(scheme|schemes|welfare|benefit|benefits|subsidy|scholarship|pension|"
    r"insurance|housing|employment|farmer|agriculture|livelihood|financial assistance|"
    r"government programme|government program|yojana)\b",
    re.IGNORECASE,
)


class PageParser(HTMLParser):
    """Extract readable text, metadata, JSON-LD, and candidate links."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title: list[str] = []
        self.text: list[str] = []
        self.links: list[str] = []
        self.meta: dict[str, str] = {}
        self.json_ld: list[str] = []
        self._ignored_depth = 0
        self._in_title = False
        self._in_json_ld = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag in {"script", "style", "noscript", "svg"}:
            self._ignored_depth += 1
        if tag == "title":
            self._in_title = True
        if tag == "script" and attributes.get("type", "").lower() == "application/ld+json":
            self._in_json_ld = True
        if tag == "a" and attributes.get("href"):
            self.links.append(attributes["href"] or "")
        if tag == "meta":
            key = attributes.get("name") or attributes.get("property")
            content = attributes.get("content")
            if key and content and key.lower() in {"description", "og:description", "keywords"}:
                self.meta[key.lower()] = content.strip()

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript", "svg"} and self._ignored_depth:
            self._ignored_depth -= 1
        if tag == "title":
            self._in_title = False
        if tag == "script":
            self._in_json_ld = False

    def handle_data(self, data: str) -> None:
        clean = " ".join(data.split())
        if not clean:
            return
        if self._in_title:
            self.title.append(clean)
        if self._in_json_ld:
            self.json_ld.append(data)
        elif not self._ignored_depth:
            self.text.append(clean)


def normalise_url(url: str) -> str | None:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return None
    # Fragments do not identify distinct crawlable documents.
    return urlunparse((parsed.scheme, parsed.netloc.lower(), parsed.path or "/", "", parsed.query, ""))


def extract_json_ld(raw_blocks: Iterable[str]) -> list[object]:
    items: list[object] = []
    for block in raw_blocks:
        try:
            items.append(json.loads(block))
        except json.JSONDecodeError:
            continue
    return items


class SchemeCrawler:
    def __init__(self, allowed_domains: set[str], delay_seconds: float, timeout: int) -> None:
        self.allowed_domains = {domain.lower() for domain in allowed_domains}
        self.delay_seconds = delay_seconds
        self.timeout = timeout
        self.robots: dict[str, RobotFileParser] = {}
        self.last_request_at: dict[str, float] = {}

    def allowed(self, url: str) -> bool:
        return urlparse(url).hostname in self.allowed_domains

    def can_fetch(self, url: str) -> bool:
        parsed = urlparse(url)
        origin = f"{parsed.scheme}://{parsed.netloc}"
        if origin not in self.robots:
            rules = RobotFileParser()
            rules.set_url(f"{origin}/robots.txt")
            try:
                rules.read()
            except (HTTPError, URLError, OSError):
                # Do not treat an unavailable robots.txt as permission to ignore it.
                # A human can explicitly inspect the site and retry later.
                return False
            self.robots[origin] = rules
        return self.robots[origin].can_fetch(USER_AGENT, url)

    def fetch(self, url: str) -> tuple[str, str] | None:
        host = urlparse(url).hostname or ""
        wait = self.delay_seconds - (time.monotonic() - self.last_request_at.get(host, 0))
        if wait > 0:
            time.sleep(wait)
        request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"})
        try:
            with urlopen(request, timeout=self.timeout) as response:
                content_type = response.headers.get_content_type()
                if content_type not in {"text/html", "application/xhtml+xml"}:
                    return None
                charset = response.headers.get_content_charset() or "utf-8"
                body = response.read(2_000_000).decode(charset, errors="replace")
                self.last_request_at[host] = time.monotonic()
                return response.geturl(), body
        except HTTPError as error:
            print(f"skip HTTP {error.code}: {url}", file=sys.stderr)
        except URLError as error:
            print(f"skip network error ({error.reason}): {url}", file=sys.stderr)
        return None


def make_record(url: str, parser: PageParser) -> dict[str, object] | None:
    title = " ".join(parser.title).strip()
    description = parser.meta.get("description") or parser.meta.get("og:description", "")
    content = " ".join(parser.text)
    # Store only pages likely to concern schemes; this avoids collecting unrelated portal pages.
    if not SCHEME_TERMS.search(" ".join((title, description, content))):
        return None
    return {
        "source_url": url,
        "retrieved_at": datetime.now(UTC).isoformat(),
        "title": title,
        "description": description,
        "content": content[:100_000],
        "structured_data": extract_json_ld(parser.json_ld),
        "verification_status": "UNVERIFIED_SOURCE_CONTENT",
    }


def crawl(seeds: Iterable[str], crawler: SchemeCrawler, max_pages: int, output_path: str) -> int:
    queue = deque(filter(None, (normalise_url(seed) for seed in seeds)))
    seen: set[str] = set()
    written = 0
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as output:
        while queue and len(seen) < max_pages:
            url = queue.popleft()
            if url in seen or not crawler.allowed(url):
                continue
            seen.add(url)
            if not crawler.can_fetch(url):
                print(f"skip robots.txt: {url}", file=sys.stderr)
                continue
            fetched = crawler.fetch(url)
            if not fetched:
                continue
            final_url, html = fetched
            parser = PageParser()
            parser.feed(html)
            record = make_record(final_url, parser)
            if record:
                output.write(json.dumps(record, ensure_ascii=False) + "\n")
                written += 1
                print(f"saved: {record['title'] or final_url}")
            for href in parser.links:
                candidate = normalise_url(urljoin(final_url, href))
                if candidate and candidate not in seen and crawler.allowed(candidate):
                    queue.append(candidate)
    return written


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Conservative crawler for official scheme-content review.")
    parser.add_argument("--seed", action="append", default=[], help="Starting page; repeat for more than one.")
    parser.add_argument("--allow-domain", action="append", default=[], help="Host to crawl; repeat for more than one.")
    parser.add_argument("--output", default="scheme-content.ndjson", help="NDJSON output path.")
    parser.add_argument("--max-pages", type=int, default=50, help="Maximum pages to request (default: 50).")
    parser.add_argument("--delay", type=float, default=1.5, help="Minimum seconds between requests per host.")
    parser.add_argument("--timeout", type=int, default=20, help="Request timeout in seconds.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.max_pages < 1 or args.delay < 0 or args.timeout < 1:
        raise SystemExit("--max-pages and --timeout must be positive; --delay cannot be negative.")
    seeds = args.seed or list(DEFAULT_SEEDS)
    domains = set(args.allow_domain or DEFAULT_DOMAINS)
    # Seed hosts must be deliberate: require --allow-domain when custom seeds are used.
    unknown_seed_hosts = {urlparse(seed).hostname for seed in seeds} - domains
    if unknown_seed_hosts:
        raise SystemExit(f"Add --allow-domain for: {', '.join(sorted(host for host in unknown_seed_hosts if host))}")
    crawler = SchemeCrawler(domains, args.delay, args.timeout)
    count = crawl(seeds, crawler, args.max_pages, args.output)
    print(f"Completed: {count} scheme-related pages saved to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
