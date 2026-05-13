#!/usr/bin/env python3
"""Convierte todas las imágenes referenciadas en projects.json a webp (calidad 85, máx 2000px)
y actualiza projects.json con las nuevas rutas. Mantiene los originales."""
import json
import re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ROOT / "data" / "projects.json"
MAX_DIM = 2000
QUALITY = 85
EXTS = {".png", ".jpg", ".jpeg"}

def find_image_paths(node, out):
    if isinstance(node, str):
        if any(node.lower().endswith(e) for e in EXTS) and node.startswith("data/"):
            out.append(node)
    elif isinstance(node, list):
        for v in node:
            find_image_paths(v, out)
    elif isinstance(node, dict):
        for v in node.values():
            find_image_paths(v, out)

def convert(src_rel):
    src = ROOT / src_rel
    if not src.is_file():
        print(f"  MISSING {src_rel}")
        return None
    dst = src.with_suffix(".webp")
    if dst.exists():
        print(f"  exists  {dst.relative_to(ROOT)}")
        return str(dst.relative_to(ROOT))
    im = Image.open(src)
    if im.mode in ("RGBA", "LA", "P"):
        # webp supports alpha; convert P to RGBA
        if im.mode == "P":
            im = im.convert("RGBA")
    else:
        im = im.convert("RGB")
    w, h = im.size
    if max(w, h) > MAX_DIM:
        if w >= h:
            nh = round(h * MAX_DIM / w); nw = MAX_DIM
        else:
            nw = round(w * MAX_DIM / h); nh = MAX_DIM
        im = im.resize((nw, nh), Image.LANCZOS)
    im.save(dst, "WEBP", quality=QUALITY, method=6)
    print(f"  webp    {dst.relative_to(ROOT)}  ({src.stat().st_size//1024}KB → {dst.stat().st_size//1024}KB)")
    return str(dst.relative_to(ROOT))

def main():
    data = json.loads(PROJECTS.read_text(encoding="utf-8"))
    paths = []
    find_image_paths(data, paths)
    paths = sorted(set(paths))
    print(f"{len(paths)} imágenes referenciadas")
    mapping = {}
    for p in paths:
        new = convert(p)
        if new and new != p:
            mapping[p] = new

    if not mapping:
        print("Nada que actualizar en JSON")
        return

    raw = PROJECTS.read_text(encoding="utf-8")
    for old, new in mapping.items():
        raw = raw.replace(json.dumps(old, ensure_ascii=False)[1:-1],
                          json.dumps(new, ensure_ascii=False)[1:-1])
    PROJECTS.write_text(raw, encoding="utf-8")
    print(f"projects.json actualizado: {len(mapping)} rutas")

if __name__ == "__main__":
    main()
