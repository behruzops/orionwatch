# 🛰️ OrionWatch

> Local loyihalar, portlar va Docker containerlarni bitta paneldan kuzatish vositasi — **by OrionSystems**

OrionWatch server yoki kompyuterda ishlab turgan xizmatlarni avtomatik aniqlaydi, bitta jonli panelda ko'rsatadi va yangi loyiha paydo bo'lganda ogohlantiradi. Nol qo'shimcha kutubxona — faqat Node.js.

## Imkoniyatlar

- **Docker containerlar** — nom, image, status va nashr qilingan portlar (bosiladigan havola)
- **Local serverlar** — ochiq portlar (Windows `netstat`, Linux `ss`, macOS `lsof`), tizim shovqini filtrlangan
- **Qo'lda loyiha** — qo'shish, tahrirlash, o'chirish
- **Tokenlar** — har loyihaga maxfiy kalit (Telegram, GitHub va h.k.), niqoblangan, bir bosishda nusxalanadi
- **Monitoring** — yangi loyiha aniqlansa belgi + Telegram ogohlantirish (interval sozlanadi)
- **3 til** — UZ / RU / EN
- Avto-yangilanish, dark UI; barcha ma'lumot faqat local (`store.json`), tashqariga chiqmaydi

## Tezkor start

**Docker (Linux server — tavsiya etiladi):**
```bash
docker run -d --name orionwatch --restart unless-stopped \
  --network host --pid host \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v "$PWD/data:/app/data" \
  ghcr.io/behruzops/orionwatch:v1.0
```

**Native (Node.js ≥ 18):**
```bash
git clone https://github.com/behruzops/orionwatch.git
cd orionwatch
npm start
```

Panel: `http://localhost:7575`

## Boshqa usullar

<details><summary><b>Global CLI</b></summary>

```bash
npm install -g .
orionwatch
```
</details>

<details><summary><b>Docker Compose (manbadan build)</b></summary>

```bash
docker compose up -d --build
```
</details>

<details><summary><b>systemd xizmat (Linux)</b></summary>

```ini
# /etc/systemd/system/orionwatch.service
[Unit]
Description=OrionWatch
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
</details>

## Sozlash

Muhit o'zgaruvchilari: `PORT` (default `7575`), `HOST`, `STORE_PATH`.

> Docker rejimida host monitoringi to'liq faqat Linux'da ishlaydi (`--network host`, `--pid host`). Windows/macOS'da native ishga tushiring.
> `docker.sock` ulash root-darajali ruxsat beradi — faqat ishonchli hostda foydalaning.

## Litsenziya

© 2026 OrionSystems. OrionWatch brendi va belgilari dasturga kiritilgan; qayta brendlash taqiqlanadi. Batafsil — [`LICENSE`](LICENSE).
