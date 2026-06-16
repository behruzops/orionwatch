# 🛰️ OrionWatch

**by OrionSystems** — kompyuter yoki serverda ishlab turgan barcha loyihalarni bir joyda kuzatish vositasi.

Docker containerlar + local serverlar (portlar) avtomatik aniqlanadi, har biriga **tokenlar** (Telegram, GitHub va h.k.) biriktiriladi, **yangi loyiha qo'shilsa monitoring** ogohlantiradi.

> Yengil: **nol qo'shimcha kutubxona** (faqat Node.js). Native modul yo'q, build talab qilmaydi.

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

### 4) Docker (Linux server tavsiya etiladi)
```bash
docker compose up -d --build
```
- `network_mode: host` + `pid: host` — host portlari va jarayonlarini ko'rish uchun
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
