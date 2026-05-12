from __future__ import annotations

from pathlib import Path

import imageio.v2 as imageio
import qrcode
from PIL import Image, ImageColor, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
SHOTS = ROOT / "shots"
OUTPUT_VIDEO = ROOT / "demo.mp4"
OUTPUT_POSTER = ROOT / "demo-poster.png"
OUTPUT_QR = ROOT / "expo-qr.png"
FPS = 6
CANVAS_SIZE = (720, 1280)
CARD_RECT = (76, 270, 644, 1140)
BRANCH = "submission/231118040-insan-destegi"
APK_LINK = (
    "https://github.com/mehmetalisahingm/seyyah-nokta/blob/"
    f"{BRANCH}/submissions/231118040-insan-destegi/app-release.apk?raw=1"
)

SCENES = [
    {
        "file": SHOTS / "01-capture.png",
        "title": "1. Ham fikir yakalama",
        "body": "Kullanici text veya voice transcript modunu secip ilk fikrini verir. Maskot burada guven veren bir baslangic rolu oynar.",
        "seconds": 15,
    },
    {
        "file": SHOTS / "02-questions.png",
        "title": "2. 5 engineering sorusu",
        "body": "Nokta problem, kullanici, kapsam, kisit ve validation sinyalini kisa ama sert sorularla netlestirir.",
        "seconds": 20,
    },
    {
        "file": SHOTS / "03-spec.png",
        "title": "3. Spec uretimi",
        "body": "Cevaplar bir one-page spec'e doner. Confidence gorunur tutulur; AI fazladan guven satmaz.",
        "seconds": 15,
    },
    {
        "file": SHOTS / "04-support.png",
        "title": "4. Insan destegi deviri",
        "body": "Kullanici isterse veya guven orta seviyede kalirsa queue id, ozet, ETA ve handoff notlari otomatik hazirlanir.",
        "seconds": 10,
    },
]


def load_font(name: str, size: int):
    candidates = [Path("C:/Windows/Fonts") / name, Path("C:/Windows/Fonts") / "arial.ttf"]
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


TITLE_FONT = load_font("georgiab.ttf", 52)
SECTION_FONT = load_font("arialbd.ttf", 34)
BODY_FONT = load_font("arial.ttf", 24)
SMALL_FONT = load_font("arial.ttf", 20)


def fit_image(image: Image.Image, width: int, height: int) -> Image.Image:
    ratio = min(width / image.width, height / image.height)
    new_size = (int(image.width * ratio), int(image.height * ratio))
    return image.resize(new_size, Image.Resampling.LANCZOS)


def draw_wrapped(draw: ImageDraw.ImageDraw, text: str, box: tuple[int, int, int, int], font, fill: str, line_gap: int):
    words = text.split()
    lines: list[str] = []
    current = ""
    max_width = box[2] - box[0]
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if draw.textlength(candidate, font=font) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)

    y = box[1]
    for line in lines:
        draw.text((box[0], y), line, font=font, fill=fill)
        y += font.size + line_gap


def gradient_background() -> Image.Image:
    canvas = Image.new("RGB", CANVAS_SIZE, "#0B1020")
    draw = ImageDraw.Draw(canvas)
    for y in range(CANVAS_SIZE[1]):
        mix = y / CANVAS_SIZE[1]
        r = int(11 * (1 - mix) + 7 * mix)
        g = int(16 * (1 - mix) + 40 * mix)
        b = int(32 * (1 - mix) + 59 * mix)
        draw.line((0, y, CANVAS_SIZE[0], y), fill=(r, g, b))
    draw.ellipse((460, -130, 900, 250), fill=ImageColor.getrgb("#2E1B68"))
    draw.ellipse((-160, 810, 180, 1180), fill=ImageColor.getrgb("#083344"))
    return canvas


def make_frame(scene: dict[str, object], progress: float) -> Image.Image:
    base = gradient_background()
    draw = ImageDraw.Draw(base)

    draw.text((52, 66), "NOKTA / Track A", font=SMALL_FONT, fill="#F8D57E")
    draw.text((52, 102), "Nokta Human Assist", font=TITLE_FONT, fill="#F8FAFC")
    draw.text((52, 176), "Mascot-driven idea capture with human handoff", font=BODY_FONT, fill="#D1D5DB")

    image = Image.open(scene["file"]).convert("RGB")
    fitted = fit_image(image, CARD_RECT[2] - CARD_RECT[0] - 44, 610)
    zoom = 1 + 0.04 * progress
    zoom_size = (max(1, int(fitted.width * zoom)), max(1, int(fitted.height * zoom)))
    fitted = fitted.resize(zoom_size, Image.Resampling.LANCZOS)
    left = (fitted.width - (CARD_RECT[2] - CARD_RECT[0] - 44)) // 2
    top = (fitted.height - 610) // 2
    fitted = fitted.crop((left, top, left + CARD_RECT[2] - CARD_RECT[0] - 44, top + 610))

    draw.rounded_rectangle(CARD_RECT, radius=38, fill="#0F172A", outline="#243041", width=2)
    base.paste(fitted, (CARD_RECT[0] + 22, CARD_RECT[1] + 22))
    draw.rounded_rectangle((102, 938, 618, 1096), radius=28, fill="#102132", outline="#28435B", width=2)
    draw.text((128, 968), str(scene["title"]), font=SECTION_FONT, fill="#E2E8F0")
    draw_wrapped(draw, str(scene["body"]), (128, 1016, 590, 1088), BODY_FONT, "#D5DEEE", 4)

    draw.rounded_rectangle((52, 1186, 668, 1202), radius=999, fill="#172033")
    draw.rounded_rectangle((52, 1186, 52 + int(616 * progress), 1202), radius=999, fill="#5EEAD4")
    return base


def build_video():
    frames = []
    total_seconds = sum(scene["seconds"] for scene in SCENES)
    elapsed = 0
    for scene in SCENES:
        scene_frames = int(scene["seconds"] * FPS)
        for index in range(scene_frames):
            scene_progress = (index + 1) / scene_frames
            overall_progress = (elapsed + (index + 1) / FPS) / total_seconds
            frame = make_frame(scene, max(scene_progress, overall_progress))
            frames.append(frame)
        elapsed += scene["seconds"]
    imageio.mimsave(OUTPUT_VIDEO, [frame for frame in frames], fps=FPS, codec="libx264", quality=8)
    frames[-1].save(OUTPUT_POSTER)


def build_qr():
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=2, box_size=10)
    qr.add_data(APK_LINK)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#111827", back_color="#F8F5D7").convert("RGB")
    img = img.resize((900, 900), Image.Resampling.NEAREST)

    canvas = Image.new("RGB", (1080, 1320), "#0B1020")
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((90, 90, 990, 1230), radius=44, fill="#0F172A", outline="#243041", width=3)
    draw.text((150, 150), "APK QR", font=TITLE_FONT, fill="#F8FAFC")
    draw.text((150, 232), "Scan to open the release APK from this branch.", font=BODY_FONT, fill="#D1D5DB")
    canvas.paste(img, (90, 300))
    canvas.save(OUTPUT_QR)


if __name__ == "__main__":
    build_video()
    build_qr()
