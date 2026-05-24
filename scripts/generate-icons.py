#!/usr/bin/env python3
"""
generate-icons.py — Genera los íconos del launcher Android para Lumapse.

Toma el ícono fuente (public/icons/icon-512x512.png) y genera:
  - 5 ic_launcher.png (legacy, con fondo oscuro y esquinas redondeadas)
  - 5 ic_launcher_round.png (legacy, recortados en círculo)
  - 5 ic_launcher_foreground.png (adaptive icon, logo centrado en safe zone)

Densidades: mdpi (48), hdpi (72), xhdpi (96), xxhdpi (144), xxxhdpi (192)
Foreground:  mdpi (108), hdpi (162), xhdpi (216), xxhdpi (324), xxxhdpi (432)

Uso:
  source .venv-icons/bin/activate
  python3 scripts/generate-icons.py

Dependencia: Pillow (pip install Pillow)
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw

# --- Configuración ---
ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "icons" / "icon-512x512.png"
RES_DIR = ROOT / "android" / "app" / "src" / "main" / "res"

BG_COLOR = (26, 29, 35)  # #1a1d23 — dark theme de Lumapse

# Tamaños por densidad (dp * factor)
LAUNCHER_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

# Foreground: 108dp base × factor de densidad
FOREGROUND_SIZES = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}

# Safe zone del foreground: el logo ocupa 66/108 = ~61% del canvas
SAFE_ZONE_RATIO = 66 / 108


def load_source():
    """Carga y valida la imagen fuente."""
    if not SOURCE.exists():
        print(f"❌ No se encontró la imagen fuente: {SOURCE}")
        sys.exit(1)
    img = Image.open(SOURCE).convert("RGBA")
    print(f"✅ Imagen fuente cargada: {SOURCE.name} ({img.width}×{img.height})")
    return img


def make_rounded_square(img, size, radius_ratio=0.18):
    """Crea un ícono cuadrado con esquinas redondeadas sobre fondo oscuro."""
    # Redimensionar logo
    logo = img.resize((size, size), Image.LANCZOS)

    # Crear canvas con fondo oscuro
    canvas = Image.new("RGBA", (size, size), BG_COLOR + (255,))
    canvas.paste(logo, (0, 0), logo)

    # Crear máscara de esquinas redondeadas
    radius = int(size * radius_ratio)
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), (size - 1, size - 1)], radius=radius, fill=255)

    # Aplicar máscara
    result = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    result.paste(canvas, (0, 0), mask)
    return result.convert("RGB")  # Android no usa alpha en ic_launcher


def make_circle(img, size):
    """Crea un ícono circular sobre fondo oscuro."""
    logo = img.resize((size, size), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), BG_COLOR + (255,))
    canvas.paste(logo, (0, 0), logo)

    # Máscara circular
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse([(0, 0), (size - 1, size - 1)], fill=255)

    result = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    result.paste(canvas, (0, 0), mask)
    return result.convert("RGB")


def make_foreground(img, canvas_size):
    """Crea el foreground del ícono adaptativo con el logo en la safe zone."""
    # El logo ocupa la safe zone (66/108 del canvas)
    logo_size = int(canvas_size * SAFE_ZONE_RATIO)
    logo = img.resize((logo_size, logo_size), Image.LANCZOS)

    # Canvas transparente
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))

    # Centrar el logo
    offset = (canvas_size - logo_size) // 2
    canvas.paste(logo, (offset, offset), logo)

    return canvas


def save(img, density_dir, filename):
    """Guarda la imagen en la carpeta de densidad correspondiente."""
    output_dir = RES_DIR / density_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / filename
    img.save(output_path, "PNG", optimize=True)
    size_kb = output_path.stat().st_size / 1024
    print(f"  📦 {density_dir}/{filename} ({img.width}×{img.height}, {size_kb:.1f} KB)")


def main():
    print("🎨 Lumapse — Generador de íconos del launcher Android")
    print("=" * 55)

    source = load_source()
    generated = 0

    # 1. ic_launcher.png (legacy, esquinas redondeadas)
    print("\n📱 Generando ic_launcher.png (legacy)...")
    for density, size in LAUNCHER_SIZES.items():
        icon = make_rounded_square(source, size)
        save(icon, density, "ic_launcher.png")
        generated += 1

    # 2. ic_launcher_round.png (legacy, circular)
    print("\n🔵 Generando ic_launcher_round.png (legacy round)...")
    for density, size in LAUNCHER_SIZES.items():
        icon = make_circle(source, size)
        save(icon, density, "ic_launcher_round.png")
        generated += 1

    # 3. ic_launcher_foreground.png (adaptive icon)
    print("\n🎯 Generando ic_launcher_foreground.png (adaptive foreground)...")
    for density, size in FOREGROUND_SIZES.items():
        fg = make_foreground(source, size)
        save(fg, density, "ic_launcher_foreground.png")
        generated += 1

    print(f"\n{'=' * 55}")
    print(f"✅ {generated} archivos generados exitosamente.")
    print(f"   Fondo del ícono adaptativo: #1a1d23 (dark theme)")
    print(f"   Safe zone: {SAFE_ZONE_RATIO:.0%} del canvas")


if __name__ == "__main__":
    main()
