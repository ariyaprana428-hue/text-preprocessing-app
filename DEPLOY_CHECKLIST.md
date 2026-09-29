# ✅ Deploy Checklist - Render.com

Ikuti checklist ini step-by-step untuk deploy tanpa error!

---

## 📋 FASE 1: PERSIAPAN (5 menit)

### ✅ Akun & Tools
- [ ] Punya akun **GitHub** (https://github.com)
- [ ] Punya akun **Render** (https://render.com)
- [ ] Install **Git** di komputer
- [ ] Punya **Gemini API Key**

### ✅ Check Project Files
- [ ] File `backend/app.py` ada
- [ ] File `backend/requirements.txt` ada
- [ ] File `backend/Procfile` ada
- [ ] File `backend/runtime.txt` ada (Python 3.11.0)
- [ ] File `.gitignore` ada (untuk protect `.env`)

### ✅ Test Local (Opsional)
```bash
cd backend
python app.py
```
- [ ] Buka http://localhost:5000 → harus muncul JSON response
- [ ] Test endpoint `/api/health` → harus return `{"status": "healthy"}`

---

## 📋 FASE 2: GITHUB SETUP (10 menit)

### ✅ Buat Repository GitHub

1. [ ] Login ke GitHub
2. [ ] Klik **"New repository"**
3. [ ] Nama: `text-preprocessing-app` (atau nama lain)
4. [ ] Visibility: **Public** (recommended untuk free tier)
5. [ ] **JANGAN** centang "Add README"
6. [ ] Klik **"Create repository"**
7. [ ] **Copy URL repository** (contoh: `https://github.com/username/text-preprocessing-app.git`)

### ✅ Push Project ke GitHub

Buka **Command Prompt/Terminal** di folder project:
```bash
cd "c:\Ariya\Semester7\Kecerdasan Buatan pt2\text-preprocessing-app"
```

Jalankan commands ini satu per satu:

```bash
# 1. Initialize Git
git init

# 2. Add all files
git add .

# 3. First commit
git commit -m "Initial commit - Ready for Render deployment"

# 4. Add remote (GANTI dengan URL repository kamu!)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# 5. Set branch main
git branch -M main

# 6. Push to GitHub
git push -u origin main
```

**Checklist:**
- [ ] Git commands berhasil semua
- [ ] Refresh GitHub page → files sudah muncul
- [ ] **PENTING:** File `.env` **TIDAK** muncul di GitHub (harus ter-ignore)

---

## 📋 FASE 3: RENDER DEPLOYMENT (15 menit)

### ✅ Login & Connect Render

1. [ ] Buka https://render.com
2. [ ] Klik **"Get Started"**
3. [ ] Pilih **"Sign in with GitHub"** (paling mudah)
4. [ ] Authorize Render untuk akses GitHub
5. [ ] Masuk ke **Dashboard**

### ✅ Create Web Service

1. [ ] Klik tombol **"New +"** di kanan atas
2. [ ] Pilih **"Web Service"**
3. [ ] Klik **"Connect account"** (pilih GitHub)
4. [ ] **Pilih repository:** `text-preprocessing-app`
5. [ ] Klik **"Connect"**

### ✅ Configure Service

**Basic Settings:**
- [ ] **Name:** `text-preprocessing-api` (atau nama lain, lowercase, no spaces)
- [ ] **Region:** `Singapore` (paling dekat Indonesia)
- [ ] **Branch:** `main`
- [ ] **Root Directory:** `backend` ⚠️ **PENTING!**
- [ ] **Runtime:** `Python 3`

**Build & Deploy:**
- [ ] **Build Command:** `pip install -r requirements.txt`
- [ ] **Start Command:** `gunicorn app:app`

**Instance Type:**
- [ ] Pilih **"Free"** 💰 (0$)

### ✅ Environment Variables

Scroll ke **Environment Variables** section:

1. [ ] Klik **"Add Environment Variable"**

2. [ ] Tambahkan variabel ini:

| Key | Value | Notes |
|-----|-------|-------|
| `FLASK_ENV` | `production` | Required |
| `GEMINI_API_KEY` | `AIzaSyB...` | Copy dari `.env` kamu |

**⚠️ PENTING:** 
- Pastikan **GEMINI_API_KEY** di-paste dengan benar (no spaces, no quotes)
- Variable `PORT` **tidak perlu** ditambahkan (Render set otomatis)

3. [ ] Double-check semua environment variables benar

### ✅ Deploy!

1. [ ] Scroll ke bawah
2. [ ] Klik **"Create Web Service"** 🚀
3. [ ] Tunggu build process dimulai

---

## 📋 FASE 4: MONITORING BUILD (10-15 menit)

### ✅ Watch Build Logs

- [ ] Tab **"Logs"** terbuka otomatis
- [ ] Lihat progress:
  ```
  ==> Installing dependencies
  ==> Downloading packages...
  ==> Installing transformers, torch, etc.
  ==> Downloading IndoBERT model (~400MB)
  ==> Build successful!
  ==> Starting server...
  ```

### ✅ Build Status

**Expected timeline:**
- ⏱️ **0-2 min:** Install dependencies
- ⏱️ **2-8 min:** Download IndoBERT model (file besar ~400MB)
- ⏱️ **8-10 min:** Initialize & start server
- ✅ **Status: LIVE** → Success!

**Kalau ada error:**
- [ ] Baca error message di logs
- [ ] Check troubleshooting section di `RENDER_DEPLOYMENT_GUIDE.md`
- [ ] Common issues:
  - Python version not supported → ubah `runtime.txt`
  - Dependencies error → check `requirements.txt`
  - Missing env var → check environment variables

---

## 📋 FASE 5: TEST API (5 menit)

### ✅ Get Your API URL

Setelah status **"Live"**, copy URL dari dashboard:
```
https://text-preprocessing-api.onrender.com
```

### ✅ Test Endpoints

**1. Test di Browser:**
- [ ] Buka `https://YOUR-APP.onrender.com`
- [ ] Harus muncul JSON:
  ```json
  {
    "message": "Text Preprocessing API",
    "version": "1.0.0",
    "endpoints": {...}
  }
  ```

**2. Test Health Check:**
- [ ] Buka `https://YOUR-APP.onrender.com/api/health`
- [ ] Harus return:
  ```json
  {
    "status": "healthy",
    "indobert_loaded": true
  }
  ```

**3. Test dengan curl (Opsional):**
```bash
curl https://YOUR-APP.onrender.com/api/health
```

**4. Test Preprocessing:**
```bash
curl -X POST https://YOUR-APP.onrender.com/api/preprocess/traditional \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"gue lagi belajar NLP nih\"}"
```

### ✅ Backend API Checklist
- [ ] Homepage (`/`) works
- [ ] Health check (`/api/health`) works
- [ ] Traditional preprocessing works
- [ ] IndoBERT loaded successfully

---

## 📋 FASE 6: UPDATE FRONTEND (5 menit)

### ✅ Update API URL

1. [ ] Buka file `frontend/script.js`
2. [ ] Cari baris 2:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000';
   ```
3. [ ] Ganti dengan URL Render kamu:
   ```javascript
   const API_BASE_URL = 'https://text-preprocessing-api.onrender.com';
   ```
4. [ ] **Save file**

### ✅ Push Update ke GitHub

```bash
git add frontend/script.js
git commit -m "Update API URL for production"
git push
```

- [ ] Push berhasil
- [ ] GitHub repo updated

---

## 📋 FASE 7: DEPLOY FRONTEND (10 menit)

### ✅ Option A: Netlify (Recommended)

1. [ ] Buka https://netlify.com
2. [ ] Sign up/Login (pakai GitHub)
3. [ ] Klik **"Add new site"** → **"Deploy manually"**
4. [ ] **Drag & drop folder `frontend/`** ke area drop zone
5. [ ] Tunggu upload & deploy (~30 detik)
6. [ ] **Copy URL:** `https://YOUR-SITE.netlify.app`

### ✅ Option B: Render Static Site

1. [ ] Render Dashboard → **"New +"** → **"Static Site"**
2. [ ] Select repository: `text-preprocessing-app`
3. [ ] Settings:
   - Name: `text-preprocessing-ui`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: (kosongkan)
   - Publish Directory: `.`
4. [ ] **Create Static Site**
5. [ ] Tunggu deploy
6. [ ] **Copy URL:** `https://YOUR-UI.onrender.com`

---

## 📋 FASE 8: FINAL TEST (5 menit)

### ✅ Test Full Application

1. [ ] Buka frontend URL di browser
2. [ ] Check API status badge → harus **"Connected"** (green)
3. [ ] Input text: `gue lagi belajar NLP nih`
4. [ ] Pilih method: **Traditional**
5. [ ] Klik **"Process Text"**
6. [ ] Hasil muncul dengan benar
7. [ ] Test IndoBERT method juga
8. [ ] Test Chat widget
9. [ ] Test Dictionary Manager

### ✅ Feature Checklist
- [ ] Text preprocessing works (Traditional)
- [ ] IndoBERT tokenization works
- [ ] Combined mode works
- [ ] Slang normalization works (gue → saya, dll)
- [ ] Chat widget works
- [ ] Dictionary manager works (add/remove/search)
- [ ] Download results works

---

## 📋 FASE 9: DOKUMENTASI (5 menit)

### ✅ Save Important URLs

Buat file catatan dengan info ini:

```
PROJECT: Text Preprocessing App

BACKEND API:
- URL: https://text-preprocessing-api.onrender.com
- Health: https://text-preprocessing-api.onrender.com/api/health
- Dashboard: https://dashboard.render.com

FRONTEND:
- URL: https://text-preprocessing-ui.netlify.app
- (atau Render URL)

GITHUB:
- Repo: https://github.com/USERNAME/text-preprocessing-app

API KEYS:
- Gemini API Key: [saved in Render environment variables]

NOTES:
- Backend sleeps after 15 min idle (free tier)
- First request after sleep = slow (~30-60 seconds)
- 750 hours/month free
```

### ✅ Update README (Opsional)

- [ ] Tambahkan live demo links di README
- [ ] Push ke GitHub

---

## 🎉 DONE! 

### ✅ Final Checklist
- [ ] ✅ Backend deployed & running
- [ ] ✅ Frontend deployed & accessible
- [ ] ✅ API connected properly
- [ ] ✅ All features working
- [ ] ✅ URLs documented
- [ ] ✅ Ready for presentation! 🎓

---

## 📊 Quick Summary

| Component | Status | URL |
|-----------|--------|-----|
| Backend API | ✅ Live | `https://your-api.onrender.com` |
| Frontend UI | ✅ Live | `https://your-ui.netlify.app` |
| GitHub Repo | ✅ Public | `https://github.com/user/repo` |
| Total Time | ⏱️ ~60 min | First time deployment |

---

## 🐛 Troubleshooting Quick Links

**Kalau ada masalah, check:**
- 📚 `RENDER_DEPLOYMENT_GUIDE.md` → Troubleshooting section
- 🔧 `UPDATE_API_URL.md` → Frontend connection issues
- 💬 Render Dashboard → Logs tab (untuk backend errors)
- 🌐 Browser Console (F12) → untuk frontend errors

---

## 💡 Tips

- 🔄 **Auto-deploy:** Push ke GitHub → Render auto redeploy
- ⏰ **Free tier sleep:** Normal, first request after 15 min idle = lambat
- 📧 **Email notif:** Render kirim email kalau deploy failed
- 🚀 **Fast iteration:** Edit di local → push → auto deploy

---

**Selamat! Project kamu sekarang online! 🌍🎉**

Share link ke dosen & teman-teman! 😊
