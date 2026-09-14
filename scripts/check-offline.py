#!/usr/bin/env python3
"""Auditoría estática offline; exceptúa tokens locales, nunca líneas completas."""

import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
URL = re.compile(r"https?://[^\s\"'<>`);,]*", re.IGNORECASE)
ATTRIBUTE = re.compile(r'''([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))''')
DEFENSIVE_PREFIX = re.compile(r'''\.(?:startsWith|includes)\(\s*(['"])(https?://)\1\s*\)''')


def mask_spans(text, spans):
    chars = list(text)
    for start, end in spans:
        for offset in range(start, end):
            if chars[offset] not in "\r\n":
                chars[offset] = " "
    return "".join(chars)


class LocalCspTokens(HTMLParser):
    """Ubica el atributo content de una meta CSP, conservando offsets y líneas."""

    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.line_starts = [0] + [match.end() for match in re.finditer("\n", text)]
        self.spans = []
        self.feed(text)
        self.close()

    def handle_starttag(self, tag, attrs):
        if tag != "meta":
            return
        attributes = dict(attrs)
        if (attributes.get("http-equiv") or "").lower() != "content-security-policy":
            return
        # HTML ambiguo: no conceder excepciones si se duplican los atributos.
        if len(attributes) != len(attrs):
            return
        line, column = self.getpos()
        start = self.line_starts[line - 1] + column
        for attribute in ATTRIBUTE.finditer(self.get_starttag_text()):
            if attribute.group(1).lower() != "content":
                continue
            group = next(index for index in (2, 3, 4) if attribute.group(index) is not None)
            value = attribute.group(group)
            base = start + attribute.start(group)
            for directive in re.finditer(r"[^;]+", value):
                tokens = list(re.finditer(r"\S+", directive.group()))
                if not tokens or tokens[0].group() not in {"default-src", "img-src"}:
                    continue
                for token in tokens[1:]:
                    if token.group() == "http://localhost":
                        offset = base + directive.start() + token.start()
                        self.spans.append((offset, offset + len(token.group())))


def source_files():
    files = set()
    for directory in (ROOT / "src", ROOT / "public"):
        for path in directory.rglob("*"):
            if path.is_file() and (directory.name == "public" or path.suffix in {".js", ".ts", ".css", ".html"}):
                files.add(path)
    if (ROOT / "index.html").is_file():
        files.add(ROOT / "index.html")
    return sorted(files)


def scan(path):
    raw = path.read_bytes()
    # Imágenes/WASM no son código textual. SVG y otros assets de texto sí se leen.
    if b"\x00" in raw:
        if path.suffix in {".js", ".ts", ".css", ".html", ".svg", ".json"}:
            return [f"{path.relative_to(ROOT)}: contenido NUL inesperado en un asset de texto"], 0
        return [], 0
    text = raw.decode("utf-8", errors="replace")
    if path.suffix == ".html":
        text = mask_spans(text, LocalCspTokens(text).spans)
    if path.suffix in {".js", ".ts"}:
        text = mask_spans(text, [match.span(2) for match in DEFENSIVE_PREFIX.finditer(text)])
    findings = []
    comments = 0
    for number, line in enumerate(text.splitlines(), 1):
        urls = URL.findall(line)
        if not urls:
            continue
        trimmed = line.lstrip()
        line_comment = path.suffix in {".js", ".ts"} and trimmed.startswith("//")
        block_comment = path.suffix in {".js", ".ts", ".css"} and (
            trimmed.startswith("/*") and trimmed.endswith("*/") and trimmed.count("*/") == 1
        )
        if line_comment or block_comment:
            comments += len(urls)
            continue
        findings.extend(f"{path.relative_to(ROOT)}:{number}: {url}" for url in urls)
    return findings, comments


def main():
    print("Lumapse — Auditoría Offline-First")
    files = source_files()
    findings = []
    comments = 0
    for path in files:
        try:
            current, count = scan(path)
            findings.extend(current)
            comments += count
        except (OSError, ValueError) as error:
            findings.append(f"{path.relative_to(ROOT)}: error de lectura/análisis: {error}")
    print(f"Archivos escaneados: {len(files)}; URLs documentales no bloqueantes: {comments}.")
    if findings:
        print("\n".join(findings))
        print(f"[FALLO] {len(findings)} referencia(s) externa(s) o error(es).")
        return 1
    print("[OK] Sin referencias externas bloqueantes; CSP local verificada por token.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
