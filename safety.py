DANGER_KEYWORDS = [
    "ingin mati",
    "bunuh diri",
    "capek hidup",
    "pengen mati",
    "nggak mau hidup",
    "self harm",
    "menyakiti diri",
    "gantung diri",
    "loncat",
    "overdosis"
]

CRISIS_MESSAGE = (
    "Aku sangat prihatin kamu sedang berada di situasi yang berat.\n\n"
    "Aku bukan pengganti bantuan profesional.\n"
    "Jika kamu berada di Indonesia, kamu bisa menghubungi:\n"
    "- 119 ext. 8 (Layanan Kesehatan Jiwa)\n"
    "- Orang terdekat yang kamu percaya\n\n"
    "Jika kamu berada di negara lain, segera hubungi layanan darurat setempat."
)

def check_risk(text: str) -> bool:
    text = text.lower()
    return any(k in text for k in DANGER_KEYWORDS)
