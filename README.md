# Davomat tizimi

O'qituvchi uchun guruhlar va o'quvchilarni boshqarish veb-ilovasi.

## Texnologiyalar

- **React** (Vite bilan) — foydalanuvchi interfeysi
- **Tailwind CSS v4** — stillar
- **Supabase** — ma'lumotlar bazasi (PostgreSQL) va backend

---

## Boshlash uchun qadamlar

### 1. Paketlarni o'rnatish

```bash
npm install
```

### 2. Supabase loyihasini sozlash

1. [supabase.com](https://supabase.com) ga kiring va yangi loyiha yarating
2. Loyiha yaratilgach, **Settings → API** bo'limiga kiring
3. **Project URL** va **anon public** kalitini nusxalab oling

### 3. `.env` fayl yaratish

`.env.example` faylini nusxalab `.env` nomli yangi fayl yarating:

```bash
# Windows PowerShell da:
Copy-Item .env.example .env
```

Keyin `.env` faylini oching va o'z kalitlaringizni kiriting:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Ma'lumotlar bazasi jadvallarini yaratish

1. Supabase Dashboard → **SQL Editor** bo'limiga kiring
2. `supabase/schema.sql` faylining barcha mazmunini ko'chirib u yerga joylashtiring
3. **Run** tugmasini bosing — jadvallar yaratiladi

### 5. Loyihani ishga tushirish

```bash
npm run dev
```

Brauzerda **http://localhost:5173** manzilini oching.

---

## Papka tuzilishi

```
davomat-tizimi/
├── src/
│   ├── components/    # Qayta ishlatiladigan UI komponentlar
│   ├── pages/         # Sahifalar (keyingi bosqichlarda to'ldiriladi)
│   ├── lib/
│   │   └── supabase.js  # Supabase client ulanishi
│   ├── hooks/         # Custom React hooklar
│   ├── App.jsx        # Asosiy komponent
│   └── main.jsx       # Kirish nuqtasi
├── supabase/
│   └── schema.sql     # Ma'lumotlar bazasi jadvallari
├── .env.example       # Muhit o'zgaruvchilari namunasi
└── README.md
```

---

## Ma'lumotlar bazasi jadvallari

| Jadval | Tavsif |
|---|---|
| `teachers` | O'qituvchi ma'lumotlari |
| `groups` | Guruhlar ro'yxati |
| `group_days` | Guruh dars kunlari |
| `students` | O'quvchilar ro'yxati |
| `attendance_logs` | Davomat loglari (keyingi bosqich) |
