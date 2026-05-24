#!/usr/bin/env python3
"""
generate-splash.py — Genera las splash screens de Lumapse para Android.

Crea 11 PNGs con el logo de Lumapse centrado + texto "Lumapse" debajo,
sobre fondo oscuro (#1a1d23), para todas las densidades y orientaciones.

Orientaciones:
  - drawable (base): 480×320
  - drawable-port-*: Portrait (ancho × alto)
  - drawable-land-*: Landscape (ancho × alto)

Densidades: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi

Uso:
  source .venv-icons/bin/activate
  python3 scripts/generate-splash.py

Dependencia: Pillow (pip install Pillow)
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# --- Configuración ---
ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "icons" / "icon-512x512.png"
RES_DIR = ROOT / "android" / "app" / "src" / "main" / "res"

BG_COLOR = (26, 29, 35)  # #1a1d23 — dark theme

# Tamaños de splash por variante
SPLASH_SIZES = {
    "drawable":            (480, 320),
    "drawable-port-mdpi":  (320, 480),
    "drawable-port-hdpi":  (480, 800),
    "drawable-port-xhdpi": (720, 1280),
    "drawable-port-xxhdpi": (1080, 1920),
    "drawable-port-xxxhdpi": (1440, 2560),
    "drawable-land-mdpi":  (480, 320),
    "drawable-land-hdpi":  (800, 480),
    "drawable-land-xhdpi": (1280, 720),
    "drawable-land-xxhdpi": (1920, 1080),
    "drawable-land-xxxhdpi": (2560, 1440),
}

# El logo ocupa ~25% de la dimensión más pequeña del canvas
LOGO_RATIO = 0.25

# Texto "Lumapse" debajo del logo
BRAND_TEXT = "Lumapse"
TEXT_COLOR = (255, 255, 255, 200)  # Blanco con ligera transparencia


def load_source():
    """Carga y valida la imagen fuente."""
    if not SOURCE.exists():
        print(f"❌ No se encontró la imagen fuente: {SOURCE}")
        sys.exit(1)
    img = Image.open(SOURCE).convert("RGBA")
    print(f"✅ Imagen fuente cargada: {SOURCE.name} ({img.width}×{img.height})")
    return img


def find_font(size):
    """Busca una fuente sans-serif disponible en macOS."""
    font_paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSText.ttf",
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/SFCompact.ttf",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    # Fallback: fuente por defecto de Pillow
    print("  ⚠️  No se encontró fuente del sistema, usando fuente por defecto")
    return ImageFont.load_default()


def make_splash(source, canvas_width, canvas_height):
    """Genera un splash screen con logo centrado + texto 'Lumapse'."""
    canvas = Image.new("RGBA", (canvas_width, canvas_height), BG_COLOR + (255,))
    draw = ImageDraw.Draw(canvas)

    # Calcular tamaño del logo (~25% de la dimensión más pequeña)
    min_dim = min(canvas_width, canvas_height)
    logo_size = int(min_dim * LOGO_RATIO)
    logo = source.resize((logo_size, logo_size), Image.LANCZOS)

    # Calcular tamaño del texto
    font_size = max(int(logo_size * 0.22), 12)  # Proporcional al logo, mínimo 12px
    font = find_font(font_size)

    # Obtener dimensiones del texto
    text_bbox = draw.textbbox((0, 0), BRAND_TEXT, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    # Espacio entre logo y texto
    gap = int(logo_size * 0.08)

    # Altura total del bloque (logo + gap + texto)
    total_height = logo_size + gap + text_height

    # Posicionar logo centrado verticalmente (considerando el bloque completo)
    logo_x = (canvas_width - logo_size) // 2
    logo_y = (canvas_height - total_height) // 2
    canvas.paste(logo, (logo_x, logo_y), logo)

    # Posicionar texto centrado debajo del logo
    text_x = (canvas_width - text_width) // 2
    text_y = logo_y + logo_size + gap
    draw.text((text_x, text_y), BRAND_TEXT, fill=TEXT_COLOR, font=font)

    return canvas.convert("RGB")


def save(img, folder, filename="splash.png"):
    """Guarda la imagen en la carpeta correspondiente."""
    output_dir = RES_DIR / folder
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / filename
    img.save(output_path, "PNG", optimize=True)
    size_kb = output_path.stat().st_size / 1024
    print(f"  📦 {folder}/{filename} ({img.width}×{img.height}, {size_kb:.1f} KB)")


def main():
    print("🎨 Lumapse — Generador de Splash Screens Android")
    print("=" * 55)

    source = load_source()
    generated = 0

    for folder, (w, h) in SPLASH_SIZES.items():
        orientation = "🔲 base" if "port" not in folder and "land" not in folder else (
            "📱 portrait" if "port" in folder else "🖥️  landscape"
        )
        print(f"\n{orientation}: {folder} ({w}×{h})")
        splash = make_splash(source, w, h)
        save(splash, folder)
        generated += 1

    print(f"\n{'=' * 55}")
    print(f"✅ {generated} splash screens generados exitosamente.")
    print(f"   Fondo: #1a1d23 (dark theme)")
    print(f"   Logo: ~{LOGO_RATIO:.0%} del lado menor")
    print(f"   Texto: '{BRAND_TEXT}' (pequeño, debajo del logo)")


if __name__ == "__main__":
    main()
