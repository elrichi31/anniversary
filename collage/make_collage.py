"""Collage estilo "pila de fotos" para historia de Instagram (1080x1920).

Mezcla dos carpetas: fotos solo de ella y fotos de pareja. Por defecto salen
el doble de fotos de ella que de pareja.

Uso (en Windows, desde la carpeta donde guardes este archivo):

    pip install pillow numpy
    python make_collage.py --ella "C:\\Users\\Nicolas\\Desktop\\fotos\\ella" --pareja "C:\\Users\\Nicolas\\Desktop\\fotos\\pareja"

Opciones utiles:
    --fotos 30      cuantas fotos usar en total (24 por defecto)
    --ratio 3       fotos de ella por cada foto de pareja (2 por defecto)
    --semilla 5     otra mezcla al azar; prueba varias y elige la que mas te guste
    --enfoque 0.25  zona vertical del recorte (0 = arriba, 1 = abajo); sube o baja
                    si en las fotos se te corta la cara
    --sin-caras     no buscar caras (por defecto, si tienes opencv, centra cada
                    recorte en la cara; instalalo con: pip install "opencv-python<5")
    --salida x.jpg  nombre del archivo final
"""

import argparse
import math
import random
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

try:  # fotos HEIC del iPhone, si esta instalado: pip install pillow-heif
    from pillow_heif import register_heif_opener

    register_heif_opener()
except ImportError:
    pass

try:  # deteccion de caras para centrar el recorte: pip install "opencv-python<5"
    import cv2

    _CASCADA = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
except (ImportError, AttributeError):  # sin opencv, o una version sin CascadeClassifier
    cv2 = None
    _CASCADA = None

EXTENSIONES = {".jpg", ".jpeg", ".png", ".webp", ".heic"}
FONDO = (20, 14, 24)
ESCALA_EVAL = 4  # la visibilidad se mide a 1/4 de tamano para ir rapido


def listar(carpeta):
    ruta = Path(carpeta)
    if not ruta.is_dir():
        sys.exit(f"No encuentro la carpeta: {carpeta}")
    return sorted(p for p in ruta.iterdir() if p.suffix.lower() in EXTENSIONES)


def cargar(ruta):
    return ImageOps.exif_transpose(Image.open(ruta)).convert("RGB")


def centro_de_cara(im, por_defecto):
    """Devuelve (x, y) en 0-1 donde esta la cara mas grande, o `por_defecto` si no hay."""
    if cv2 is None:
        return por_defecto
    chica = im.copy()
    chica.thumbnail((800, 800))
    gris = cv2.cvtColor(np.array(chica), cv2.COLOR_RGB2GRAY)
    caras = _CASCADA.detectMultiScale(gris, scaleFactor=1.1, minNeighbors=6, minSize=(40, 40))
    if len(caras) == 0:
        return por_defecto
    x, y, w, h = max(caras, key=lambda c: c[2] * c[3])
    return ((x + w / 2) / gris.shape[1], (y + h / 2) / gris.shape[0])


def esquinas(cx, cy, w, h, ang):
    a = math.radians(ang)
    c, s = math.cos(a), math.sin(a)
    puntos = []
    for dx, dy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
        x, y = dx * w / 2, dy * h / 2
        puntos.append((cx + x * c - y * s, cy + x * s + y * c))
    return puntos


def elegir(ella, pareja, total, ratio, rng):
    n_ella = min(len(ella), round(total * ratio / (ratio + 1)))
    n_pareja = min(len(pareja), total - n_ella)
    n_ella = min(len(ella), total - n_pareja)  # si faltan de pareja, rellena con ella
    elegidas = [(p, True) for p in rng.sample(ella, n_ella)]
    elegidas += [(p, False) for p in rng.sample(pareja, n_pareja)]
    rng.shuffle(elegidas)
    return elegidas


def medidas(ruta, es_ella, base):
    ancho, alto = Image.open(ruta).size  # sin rotar por EXIF; se corrige abajo
    try:
        orientacion = Image.open(ruta).getexif().get(274, 1)
    except Exception:
        orientacion = 1
    if orientacion in (5, 6, 7, 8):
        ancho, alto = alto, ancho
    k = 1.08 if es_ella else 0.98
    if ancho > alto:
        return int(base * 1.45 * k), int(base * 1.45 * k * 0.78)
    return int(base * k), int(base * k * 1.22)


def filas_parejas(total, filas):
    """Cuantas fotos van en cada fila (se reparten casi iguales)."""
    base, extra = divmod(total, filas)
    return [base + (1 if f < extra else 0) for f in range(filas)]


def distribuir(fotos, W, H, conteos, semilla):
    r = random.Random(semilla)
    ch = H / len(conteos)
    orden = list(range(len(fotos)))
    r.shuffle(orden)
    posiciones = [(f, k) for f, n in enumerate(conteos) for k in range(n)]
    items = []
    for (fila, k), i in zip(posiciones, orden):
        cw = W / conteos[fila]
        w, h = fotos[i]["w"], fotos[i]["h"]
        items.append(
            dict(
                i=i, w=w, h=h, ang=r.uniform(-8, 8),
                cx=(k + 0.5) * cw + r.uniform(-18, 18),
                cy=(fila + 0.5) * ch + r.uniform(-18, 18),
                z=r.random(),
            )
        )
    items.sort(key=lambda t: t["z"])
    return items


def puntuar(items, W, H):
    tam = (W // ESCALA_EVAL, H // ESCALA_EVAL)
    capas = Image.new("I", tam, -1)
    d = ImageDraw.Draw(capas)
    poligonos = []
    for n, t in enumerate(items):
        pts = [(x / ESCALA_EVAL, y / ESCALA_EVAL) for x, y in esquinas(t["cx"], t["cy"], t["w"], t["h"], t["ang"])]
        poligonos.append(pts)
        d.polygon(pts, fill=n)
    L = np.array(capas)
    cobertura = (L >= 0).mean()
    peor, suma = 1.0, 0.0
    for n, t in enumerate(items):
        centro = Image.new("L", tam, 0)
        pts_c = [
            (x / ESCALA_EVAL, y / ESCALA_EVAL)
            for x, y in esquinas(t["cx"], t["cy"] - t["h"] * 0.08, t["w"] * 0.62, t["h"] * 0.62, t["ang"])
        ]
        ImageDraw.Draw(centro).polygon(pts_c, fill=255)
        total = Image.new("L", tam, 0)
        ImageDraw.Draw(total).polygon(poligonos[n], fill=255)
        c, tt = np.array(centro) > 0, np.array(total) > 0
        vis_c = ((L == n) & c).sum() / max(c.sum(), 1)
        vis_t = ((L == n) & tt).sum() / max(tt.sum(), 1)
        peor = min(peor, vis_c)
        suma += vis_t
    return cobertura, peor, suma / len(items)


def main():
    ap = argparse.ArgumentParser(description="Collage de fotos para historia de Instagram")
    ap.add_argument("--ella", required=True, help="carpeta con fotos solo de ella")
    ap.add_argument("--pareja", required=True, help="carpeta con fotos de pareja")
    ap.add_argument("--salida", default="collage-historia.jpg")
    ap.add_argument("--fotos", type=int, default=24)
    ap.add_argument("--ratio", type=float, default=2.0)
    ap.add_argument("--semilla", type=int, default=1)
    ap.add_argument("--enfoque", type=float, default=0.3)
    ap.add_argument("--sin-caras", action="store_true", help="no buscar caras, usar solo --enfoque")
    ap.add_argument("--ancho", type=int, default=1080)
    ap.add_argument("--alto", type=int, default=1920)
    args = ap.parse_args()

    W, H = args.ancho, args.alto
    ella, pareja = listar(args.ella), listar(args.pareja)
    print(f"Fotos de ella: {len(ella)} | de pareja: {len(pareja)}")
    if not ella and not pareja:
        sys.exit("No encontre fotos (jpg, png, webp o heic) en esas carpetas.")

    rng = random.Random(args.semilla)
    elegidas = elegir(ella, pareja, args.fotos, args.ratio, rng)
    total = len(elegidas)
    filas = max(2, round(math.sqrt(total * H / W)))
    conteos = filas_parejas(total, filas)
    base = (W / (total / filas)) * 1.3

    fotos = []
    for ruta, es_ella in elegidas:
        w, h = medidas(ruta, es_ella, base)
        fotos.append(dict(ruta=ruta, es_ella=es_ella, w=w, h=h))

    mejor = None
    for intento in range(500):
        items = distribuir(fotos, W, H, conteos, args.semilla * 1000 + intento)
        cobertura, peor, media = puntuar(items, W, H)
        if cobertura < 0.995:
            continue
        clave = peor * 2 + media
        if mejor is None or clave > mejor[0]:
            mejor = (clave, intento, peor, media)
    if mejor is None:
        sys.exit("No logre cubrir toda la pantalla; prueba con --fotos mas alto o mas bajo.")

    items = distribuir(fotos, W, H, conteos, args.semilla * 1000 + mejor[1])
    lienzo = Image.new("RGB", (W, H), FONDO)
    for t in items:
        info = fotos[t["i"]]
        original = cargar(info["ruta"])
        centrado = (0.5, args.enfoque) if args.sin_caras else centro_de_cara(original, (0.5, args.enfoque))
        im = ImageOps.fit(original, (t["w"], t["h"]), Image.LANCZOS, centering=centrado)
        marco = Image.new("RGB", (t["w"] + 12, t["h"] + 12), (250, 246, 240))
        marco.paste(im, (6, 6))
        marco = marco.convert("RGBA").rotate(t["ang"], expand=True, resample=Image.BICUBIC)
        alfa = marco.split()[3].point(lambda v: int(v * 0.55))
        sombra = Image.new("RGBA", marco.size, (0, 0, 0, 0))
        sombra.putalpha(alfa)
        sombra = sombra.filter(ImageFilter.GaussianBlur(14))
        x, y = int(t["cx"] - marco.width / 2), int(t["cy"] - marco.height / 2)
        lienzo.paste(sombra, (x + 6, y + 10), sombra)
        lienzo.paste(marco, (x, y), marco)

    lienzo.save(args.salida, quality=95)
    n_ella = sum(1 for f in fotos if f["es_ella"])
    print(f"Listo: {args.salida} ({total} fotos: {n_ella} de ella, {total - n_ella} de pareja)")


if __name__ == "__main__":
    main()
