#!/usr/bin/env python3
# /// script
# dependencies = [
#   "pillow",
#   "numpy",
# ]
# ///
"""
Splits a 6x6 grid image of D2 rune glyphs into 33 individual PNGs,
then traces each into a clean filled-shape SVG (40x40 viewBox).

Requirements:
    pip install pillow numpy --break-system-packages
    apt-get install -y potrace

Usage:
    python3 runes_to_svg.py input_grid.png output_dir/
"""

import sys
import re
import subprocess
from pathlib import Path

from PIL import Image
import numpy as np

# Standard Diablo II rune order, left-to-right / top-to-bottom in the
# reference grid image (rows of 6, last row has 3).
RUNE_ORDER = [
    "el", "eld", "tir", "nef", "eth", "ith",
    "tal", "ral", "ort", "thul", "amn", "sol",
    "shael", "dol", "hel", "io", "lum", "ko",
    "fal", "lem", "pul", "um", "mal", "ist",
    "gul", "vex", "ohm", "lo", "sur", "ber",
    "jah", "cham", "zod",
]

GRID_COLS = 6
GRID_ROWS = 6  # last row only has 3 entries (33 total)

# Margin (in px) to trim from each cell edge before locating the glyph,
# removing grid-line / border artifacts. Increase if traces still pick
# up thin border lines.
CELL_MARGIN = 10

# Extra padding (in px, at the cropped-cell resolution) around the
# detected glyph bounding box before upscaling/tracing.
GLYPH_PAD = 3

# Upscale factor applied before tracing (higher = smoother potrace curves).
UPSCALE = 1

# potrace tuning
POTRACE_OPTTOLERANCE = "20.0"
POTRACE_TURDSIZE = "100"  # suppresses speckles smaller than N px

# Output SVG viewBox is (0,0,TARGET,TARGET) with PAD px margin on each side.
TARGET = 40
TARGET_PAD = 2


def find_grid_bounds(arr):
    """Locate the dark grid-line separator positions along rows/cols."""
    row_means = arr.mean(axis=(1, 2))
    col_means = arr.mean(axis=(0, 2))

    def boundaries(means, n_lines):
        dark = np.where(means < 100)[0]
        # group consecutive indices into runs, take midpoint of each run
        groups = []
        for v in dark:
            if groups and v - groups[-1][-1] <= 2:
                groups[-1].append(v)
            else:
                groups.append([v])
        return [int(np.mean(g)) for g in groups]

    return boundaries(row_means, GRID_ROWS + 1), boundaries(col_means, GRID_COLS + 1)


def crop_cells(image_path, png_dir):
    img = Image.open(image_path).convert("RGB")
    arr = np.array(img)

    row_bounds, col_bounds = find_grid_bounds(arr)

    if len(row_bounds) < GRID_ROWS + 1 or len(col_bounds) < GRID_COLS + 1:
        print(f"WARNING: expected {GRID_ROWS+1} row lines and "
              f"{GRID_COLS+1} col lines, found {len(row_bounds)} / {len(col_bounds)}.")
        print("You may need to crop manually or adjust detection.")

    idx = 0
    for r in range(GRID_ROWS):
        for c in range(GRID_COLS):
            if idx >= len(RUNE_ORDER):
                break
            top = row_bounds[r] + 4
            bottom = row_bounds[r + 1] - 2
            left = col_bounds[c] + 4
            right = col_bounds[c + 1] - 2

            if bottom <= top or right <= left:
                continue

            crop = img.crop((left, top, right, bottom))
            name = RUNE_ORDER[idx]
            crop.save(png_dir / f"{name}.png")
            idx += 1

    print(f"Cropped {idx} rune PNGs into {png_dir}")
    return idx


def make_bitmap_for_trace(png_path, bmp_path):
    """Threshold, trim border margin, crop to glyph bbox, upscale -> BMP."""
    img = Image.open(png_path).convert("L")
    arr = np.array(img)
    h, w = arr.shape

    arr2 = arr[CELL_MARGIN:h - CELL_MARGIN, CELL_MARGIN:w - CELL_MARGIN]
    binary = (arr2 > 128).astype(np.uint8) * 255

    mask = binary < 128
    if not mask.any():
        return None

    ys, xs = np.where(mask)
    y0, y1 = ys.min(), ys.max()
    x0, x1 = xs.min(), xs.max()

    y0 = max(0, y0 - GLYPH_PAD)
    x0 = max(0, x0 - GLYPH_PAD)
    y1 = min(binary.shape[0] - 1, y1 + GLYPH_PAD)
    x1 = min(binary.shape[1] - 1, x1 + GLYPH_PAD)

    cropped = binary[y0:y1 + 1, x0:x1 + 1]
    out_img = Image.fromarray(cropped)
    out_img = out_img.resize(
        (out_img.width * UPSCALE, out_img.height * UPSCALE), Image.NEAREST
    )
    out_img.save(bmp_path)

    ch, cw = cropped.shape
    return cw, ch


def trace_to_svg(bmp_path, dims, svg_path, raw_svg_path):
    w, h = dims
    subprocess.run(
        [
            "potrace", str(bmp_path),
            "-s", "-o", str(raw_svg_path),
            "--opttolerance", POTRACE_OPTTOLERANCE,
            "-t", POTRACE_TURDSIZE,
        ],
        check=True, capture_output=True,
    )

    with open(raw_svg_path) as f:
        content = f.read()

    paths = re.findall(r'<path d="([^"]+)"/>', content)
    if not paths:
        print(f"  WARNING: no paths traced for {svg_path.name}")
        return False

    # potrace's upscaled bitmap is (w*UPSCALE) x (h*UPSCALE) px.
    # Its transform is translate(0, h*UPSCALE) scale(0.1,-0.1), and raw
    # path coordinates are in units of 1/10 of that pt-space, so the
    # final pt-space ranges over x in [0, w*UPSCALE], y in [0, h*UPSCALE].
    vb_w = w * UPSCALE
    vb_h = h * UPSCALE

    avail = TARGET - 2 * TARGET_PAD
    scale = min(avail / vb_w, avail / vb_h)
    new_w = vb_w * scale
    new_h = vb_h * scale
    off_x = (TARGET - new_w) / 2
    off_y = (TARGET - new_h) / 2

    k = 0.1 * scale  # raw -> pt (*0.1) -> target (*scale)

    paths_combined = "\n    ".join(
        f'<path d="{p.replace(chr(10), " ")}"/>' for p in paths
    )

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {TARGET} {TARGET}" stroke="#c8a84b" fill="#c8a84b">
  <g transform="translate({off_x:.4f},{off_y + new_h:.4f}) scale({k:.6f},{-k:.6f})" stroke="#c8a84b" fill="#c8a84b">
    {paths_combined}
  </g>
</svg>
'''
    svg_path.write_text(svg)
    return True


def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} input_grid.png output_dir/")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])

    png_dir = out_dir / "png"
    svg_dir = out_dir / "svg"
    tmp_dir = out_dir / "tmp"
    for d in (png_dir, svg_dir, tmp_dir):
        d.mkdir(parents=True, exist_ok=True)

    count = crop_cells(input_path, png_dir)

    ok, fail = 0, []
    for name in RUNE_ORDER[:count]:
        png_path = png_dir / f"{name}.png"
        bmp_path = tmp_dir / f"{name}.bmp"
        raw_svg_path = tmp_dir / f"{name}_raw.svg"
        svg_path = svg_dir / f"{name}.svg"

        dims = make_bitmap_for_trace(png_path, bmp_path)
        if dims is None:
            print(f"  WARNING: {name} produced an empty bitmap, skipping")
            fail.append(name)
            continue

        if trace_to_svg(bmp_path, dims, svg_path, raw_svg_path):
            ok += 1
        else:
            fail.append(name)

    print(f"\nDone: {ok}/{count} SVGs written to {svg_dir}")
    if fail:
        print(f"Failed/needs review: {', '.join(fail)}")


if __name__ == "__main__":
    main()