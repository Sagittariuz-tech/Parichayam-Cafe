from pathlib import Path
import argparse
from PIL import Image, ImageDraw

PROJECT = Path(__file__).resolve().parent.parent
MEDIA = PROJECT / "public" / "media"

def export_hero(path):
    with Image.open(path) as original:
        hero = original.convert("RGB")
        hero.thumbnail((1400, 1000), Image.Resampling.LANCZOS)
        hero.save(MEDIA / "hero.webp", quality=84, method=6)
        hero.thumbnail((700, 500), Image.Resampling.LANCZOS)
        hero.save(MEDIA / "hero-small.webp", quality=81, method=6)

    mark = Image.new("RGBA", (64, 64))
    draw = ImageDraw.Draw(mark)
    draw.ellipse((2, 2, 62, 62), fill="#1b3026")
    for offset in (0, 9, 18):
        draw.arc((14, 11 + offset, 50, 39 + offset), 190, 345, fill="#f6f1e7", width=3)
    mark.save(MEDIA / "favicon.png")

def export_tiles(path, cols, rows, ids):
    with Image.open(path) as original:
        pixels = original.convert("RGB")
        width, height = pixels.size
        for index, item_id in enumerate(ids):
            x, y = index % cols, index // cols
            left, right = round(width * x / cols), round(width * (x + 1) / cols)
            top, bottom = round(height * y / rows), round(height * (y + 1) / rows)
            inset = max(3, round(min(right - left, bottom - top) * .022))
            tile = pixels.crop((left + inset, top + inset, right - inset, bottom - inset))
            tile.thumbnail((480, 480), Image.Resampling.LANCZOS)
            tile.save(MEDIA / f"{item_id}.webp", quality=83, method=6)

parser = argparse.ArgumentParser()
parser.add_argument("source", type=Path)
parser.add_argument("--hero", action="store_true")
parser.add_argument("--grid", nargs=2, type=int, default=[4, 4])
parser.add_argument("--ids", nargs="+", type=int)
args = parser.parse_args()
if args.hero:
    export_hero(args.source)
else:
    if not args.ids or len(args.ids) > args.grid[0] * args.grid[1]:
        parser.error("Provide the item IDs in reading order for a valid grid.")
    export_tiles(args.source, *args.grid, args.ids)
