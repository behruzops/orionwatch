# 🛰️ OrionWatch

**by OrionSystems** — kompyuter yoki serverda ishlab turgan barcha loyihalarni bir joyda kuzatish vositasi.

Docker containerlar + local serverlar (portlar) avtomatik aniqlanadi, har biriga **tokenlar** (Telegram, GitHub va h.k.) biriktiriladi, **yangi loyiha qo'shilsa monitoring** ogohlantiradi.

> Yengil: **nol qo'shimcha kutubxona** (faqat Node.js). Native modul yo'q, build talab qilmaydi.

## Nima uchun kerak? (foydasi)

Ko'p loyiha, port va Docker container ishlatadigan dasturchi/DBA/server admin uchun "qaysi port band, qaysi container ishlayapti, qaysi havola qayoqqa olib boradi" — doim chalkash bo'ladi. OrionWatch buni hal qiladi:

- **Bitta oyna** — barcha Docker + local serverlar bir joyda, bosib ochiladigan havolalar bilan. `docker ps` / `netstat` terib o'tirish shart emas.
- **Vaqt tejaydi** — yangi server/loyiha qo'shilsa o'zi aniqlaydi va 🆕 belgilaydi; Telegram'ga xabar yuboradi.
- **Tartib** — har loyihaga izoh + tokenlar (Telegram, GitHub, DB parol) yagona, niqoblangan joyda; qidirib yurmaysiz.
- **Yengil & xavfsiz** — nol qo'shimcha kutubxona, ma'lumot faqat **sizning** kompyuteringizda (`store.json`), tashqariga chiqmaydi.
- **Hamma joyda** — kompyuter (Windows), server (Linux), Docker — bir xil ishlaydi, 3 tilda.

## Imkoniyatlar
- 🐳 **Docker containerlar** — nom, image, status, portlar (bosiladigan havola)
- ⚙️ **Local serverlar** — ishlab turgan portlar (Windows `netstat`, Linux `ss`, macOS `lsof`); OS shovqini filtrlangan
- 📌 **Qo'lda loyiha** qo'shish / tahrirlash / o'chirish
- 🔑 **Tokenlar** — har bir loyihaga maxfiy kalit (niqoblangan, bir bosishda nusxalash)
- 🔔 **Monitoring** — har N soatda yangi loyiha aniqlanadi → 🆕 belgi + Telegram xabar
- 🔄 5s avto-yangilanish

## Talab
Node.js **>= 18** (native) — yoki **Docker** (Linux server).

---

## O'rnatish

### 1) Windows (kompyuter)
```bat
npm start            :: yoki start.bat ustiga 2x bosing
```
Brauzer: **http://localhost:7575**

Avtoyuklash (har boot'da): `start.bat` ga Vazifa rejalashtiruvchi (Task Scheduler) orqali "At log on" trigger qo'shing.

### 2) Linux / macOS server (native)
```bash
chmod +x start.sh && ./start.sh      # yoki: node server.js
```
**systemd** xizmat sifatida (Linux):
```ini
# /etc/systemd/system/orionwatch.service
[Unit]
Description=OrionWatch (OrionSystems)
After=network.target docker.service
[Service]
WorkingDirectory=/opt/orionwatch
ExecStart=/usr/bin/node server.js
Restart=always
Environment=PORT=7575
[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl enable --now orionwatch
```

### 3) Global CLI
```bash
npm install -g .      # so'ng istalgan joydan:
orionwatch
```

### 4) Docker — tayyor image (eng oson, Linux server)
GitHub Container Registry'dan tayyor image (build kerak emas):
```bash
docker run -d --name orionwatch --restart unless-stopped \
  --network host --pid host \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v "$PWD/data:/app/data" \
  ghcr.io/behruzops/orionwatch:v1.0
```
So'ng → `http://SERVER_IP:7575`

### 5) GitHub'dan yuklab olib, Docker'da (compose)
```bash
git clone https://github.com/behruzops/orionwatch.git
cd orionwatch
docker compose up -d --build
```
- `network_mode: host` + `pid: host` — host portlari/jarayonlarini ko'rish uchun
- `/var/run/docker.sock` (ro) — host Docker containerlarini ko'rish uchun
- Ma'lumot (`store.json`) `./data` da saqlanadi

> ⚠️ Docker rejimida host monitoringi **faqat Linux**da to'liq ishlaydi (network/pid host — Linux xususiyati). Windows/macOS'da native (1–2) usulni ishlating.
> ⚠️ `docker.sock` ulash kuchli ruxsat beradi — faqat ishonchli hostda.

Sozlash: `PORT` (default 7575), `HOST`, `STORE_PATH`.

---

## Brend
Ushbu mahsulot **OrionWatch · OrionSystems** brendi ostida. Brend nomi va belgilari
dasturga mahkam kiritilgan va o'zgartirilmaydi (qarang: `LICENSE`).

© 2026 OrionSystems
