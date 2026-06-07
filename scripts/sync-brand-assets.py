from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError as exc:
    raise SystemExit("Install Pillow: pip install pillow") from exc

root = Path(__file__).resolve().parent.parent
brand = root / "brand"
pairs = [("logo.jpg", "logo-full2.png"), ("icon.jpg", "logo-icon.png")]
targets = [root, root / "vite-app" / "public"]

for filename, name in pairs:
    img = Image.open(brand / filename).convert("RGBA")
    for target_dir in targets:
        out = target_dir / name
        img.save(out, format="PNG", optimize=True)
        print(f"wrote {out}")