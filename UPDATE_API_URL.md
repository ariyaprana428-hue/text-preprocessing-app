# 🔧 Update API URL untuk Production

Setelah deploy backend ke Render, kamu perlu update API URL di frontend.

---

## 📝 Yang Harus Diubah

### 1. File: `frontend/script.js`

**Cari baris ini (baris 2):**
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

**Ganti dengan URL Render kamu:**
```javascript
const API_BASE_URL = 'https://YOUR-APP-NAME.onrender.com';
```

**Contoh:**
```javascript
const API_BASE_URL = 'https://text-preprocessing-api.onrender.com';
```

### 2. File: `frontend/chat.js`

Tidak perlu diubah! File ini sudah pakai `API_BASE_URL` dari `script.js`.

---

## ⚡ Quick Copy-Paste

Setelah backend deploy, Render kasih URL seperti:
```
https://text-preprocessing-api.onrender.com
```

**Langkah mudah:**

1. Copy URL dari Render dashboard
2. Buka `frontend/script.js`
3. Edit baris 2
4. Save
5. Deploy frontend

---

## 🚀 Cara Deploy Frontend

### Option A: Netlify (Paling Mudah)

1. Buka https://netlify.com
2. Drag & drop folder `frontend/` 
3. Done! ✨

### Option B: Render Static Site

1. Render Dashboard → **New +** → **Static Site**
2. Select repository yang sama
3. Settings:
   - Name: `text-preprocessing-ui`
   - Root Directory: `frontend`
   - Build Command: (kosongkan)
   - Publish Directory: `.`
4. Create

### Option C: GitHub Pages (Gratis)

1. Push frontend ke branch `gh-pages`
2. Settings → Pages → Select branch
3. URL: `https://username.github.io/repo-name/`

---

## 🧪 Test Setelah Update

Buka frontend URL kamu, lalu:

1. **Input text:** `gue lagi belajar NLP`
2. **Klik Process**
3. **Cek hasil:** Harus muncul hasil preprocessing

Kalau error:
- Buka Console (F12)
- Cek error message
- Pastikan API URL benar (tidak ada `/` di akhir)

---

## 📊 Struktur URL yang Benar

✅ **BENAR:**
```javascript
const API_BASE_URL = 'https://text-preprocessing-api.onrender.com';
```

❌ **SALAH:**
```javascript
const API_BASE_URL = 'https://text-preprocessing-api.onrender.com/';  // Ada slash
const API_BASE_URL = 'https://text-preprocessing-api.onrender.com/api';  // Jangan include /api
```

---

## 🔍 Debugging

### Frontend tidak bisa connect ke API?

**1. Check Console (F12):**
```
CORS error? → Backend CORS sudah enabled, harusnya OK
Network error? → Cek API URL typo
```

**2. Test API Manual:**
```bash
curl https://YOUR-APP.onrender.com/api/health
```

Harus return:
```json
{
  "status": "healthy",
  "indobert_loaded": true
}
```

**3. Check API_BASE_URL:**
Buka Console → ketik:
```javascript
API_BASE_URL
```

Harus return URL production, bukan localhost.

---

## 💡 Tips

- **Jangan include `/api` di `API_BASE_URL`** 
  - Frontend code sudah append `/api/...` sendiri
  
- **Hindari slash `/` di akhir URL**
  - `https://app.onrender.com` ✅
  - `https://app.onrender.com/` ❌

- **Save & Hard Refresh**
  - Windows: `Ctrl + Shift + R`
  - Mac: `Cmd + Shift + R`

---

**Done!** Frontend sekarang connect ke production API 🎉
