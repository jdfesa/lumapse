#!/usr/bin/env python3
"""
Lumapse — Validador de Metadatos y Estándares Web
Analiza index.html para recomendaciones pasivas de SEO, a11y y PWA.
Uso: python3 scripts/check-seo-metadata.py
"""

import os
import re
import sys


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_HTML = os.path.join(PROJECT_ROOT, "index.html")


def read_index_html():
    try:
        with open(INDEX_HTML, "r", encoding="utf-8") as handle:
            return handle.read()
    except UnicodeDecodeError:
        with open(INDEX_HTML, "r", encoding="utf-8", errors="replace") as handle:
            return handle.read()


def find_lang(content):
    match = re.search(r"<html\b[^>]*\blang=[\"']([a-z]{2})(?:-[a-z]{2})?[\"']", content, re.IGNORECASE)
    return match.group(1) if match else None


def has_meta_charset(content):
    return re.search(r"<meta\b[^>]*\bcharset=[\"'][^\"']+[\"']", content, re.IGNORECASE) is not None


def has_meta_viewport(content):
    pattern = (
        r"<meta\b[^>]*\bname=[\"']viewport[\"'][^>]*"
        r"\bcontent=[\"'][^\"']*width=device-width[^\"']*initial-scale=1\.0[^\"']*[\"']"
    )
    return re.search(pattern, content, re.IGNORECASE) is not None


def has_meta_description(content):
    pattern = r"<meta\b[^>]*\bname=[\"']description[\"'][^>]*\bcontent=[\"']\s*[^\"']+\s*[\"']"
    return re.search(pattern, content, re.IGNORECASE) is not None


def has_meta_theme_color(content):
    return re.search(r"<meta\b[^>]*\bname=[\"']theme-color[\"']", content, re.IGNORECASE) is not None


def has_title(content):
    match = re.search(r"<title\b[^>]*>(.*?)</title>", content, re.IGNORECASE | re.DOTALL)
    return bool(match and match.group(1).strip())


def has_touch_or_icon(content):
    return re.search(r"<link\b[^>]*\brel=[\"'](?:apple-touch-icon|icon)[\"']", content, re.IGNORECASE) is not None


def print_check(ok, ok_message, warning_message):
    if ok:
        print("✅ {}".format(ok_message))
        return 0

    print("⚠️  {}".format(warning_message))
    return 1


def main():
    warnings = 0

    print("🌐 Lumapse — Validador de Metadatos y Estándares Web")
    print("==================================================")
    print("Escaneando index.html...")

    if not os.path.isfile(INDEX_HTML):
        print("⚠️  No se encontró index.html en la raíz del proyecto.")
        print("==================================================")
        print("📊 Resultado: 1 optimización(es) web recomendada(s).")
        return 0

    content = read_index_html()
    lang = find_lang(content)

    if lang:
        print("✅ Atributo lang presente ({}).".format(lang))
    else:
        print("⚠️  Falta atributo lang en <html>.")
        warnings += 1

    warnings += print_check(
        has_meta_charset(content),
        "Meta charset presente.",
        "Falta etiqueta <meta charset=\"...\">.",
    )
    warnings += print_check(
        has_meta_viewport(content),
        "Meta viewport presente.",
        "Falta meta viewport con width=device-width e initial-scale=1.0.",
    )
    warnings += print_check(
        has_meta_description(content),
        "Meta description presente.",
        "Falta meta description con content no vacío.",
    )
    warnings += print_check(
        has_meta_theme_color(content),
        "Meta theme-color presente.",
        "Falta meta theme-color.",
    )
    warnings += print_check(
        has_title(content),
        "Etiqueta title presente.",
        "Falta etiqueta <title> con texto.",
    )
    warnings += print_check(
        has_touch_or_icon(content),
        "Icono táctil o favicon presente.",
        "Falta etiqueta <link rel=\"apple-touch-icon\"> o <link rel=\"icon\">.",
    )

    print("==================================================")
    print("📊 Resultado: {} optimización(es) web recomendada(s).".format(warnings))
    return 0


if __name__ == "__main__":
    sys.exit(main())
