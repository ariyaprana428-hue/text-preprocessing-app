# 🚀 Panduan Deploy ke Render.com

## 📋 Prerequisites
- ✅ Akun GitHub (gratis)
- ✅ Akun Render.com (gratis)
- ✅ Gemini API Key (sudah ada di .env)

---

## 🎯 Step 1: Persiapan Project

### 1.1 Cek File yang Dibutuhkan
Pastikan file-file ini ada di folder `backend/`:
- ✅ `app.py` - Main application
- ✅ `requirements.txt` - Dependencies
- ✅ `runtime.txt` - Python version
- ✅ `Procfile` - Gunicorn config
- ⚠️ `.env` - JANGAN di-push ke GitHub!

### 1.2 Update File Configuration

**File sudah OK:**
- ✅ `Procfile` → `web: gunicorn app:app`
- ✅ `runtime.txt` → `python-3.10.0`
- ✅ `requirements.txt` → Semua dependencies lengkap

---

## 🐙 Step 2: Push ke GitHub

### 2.1 Buat Repository Baru di GitHub
1. Buka https://github.com
2. Klik tombol **"New"** atau **"+"** → **"New repository"**
3. Nama: `text-preprocessing-app` (atau nama lain)
4. Set **Public** (gratis) atau **Private** (butuh verifikasi card)
5. **JANGAN centang** "Add README"
6. Klik **"Create repository"**

### 2.2 Push Project ke GitHub

Buka terminal di folder project (`text-preprocessing-app/`), lalu jalankan:

```bash
# Initialize Git (kalau belum)
git init

# Add semua file
git add .

# Commit
git commit -m "Initial commit for Render deployment"

# Add remote (ganti USERNAME dan REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Push
git branch -M main
git push -u origin main
```

**⚠️ PENTING:** Pastikan `.env` ada di `.gitignore` agar API key tidak ter-upload!

---

## 🌐 Step 3: Deploy di Render.com

### 3.1 Sign Up / Login Render
1. Buka https://render.com
2. Klik **"Get Started"**
3. Login dengan **GitHub** (recommended)
4. Authorize Render untuk akses GitHub

### 3.2 Buat Web Service Baru

1. **Dashboard Render** → Klik **"New +"** → Pilih **"Web Service"**

2. **Connect Repository:**
   - Klik **"Connect account"** (GitHub)
   - Pilih repository: `text-preprocessing-app`
   - Klik **"Connect"**

3. **Configure Service:**

   | Field | Value |
   |-------|-------|
   | **Name** | `text-preprocessing-api` (atau nama lain) |
   | **Region** | `Singapore` (paling dekat) |
   | **Branch** | `main` |
   | **Root Directory** | `backend` ⚠️ PENTING! |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `gunicorn app:app` |
   | **Instance Type** | **Free** 🎉 |

4. **Advanced Settings** → **Environment Variables:**
   
   Klik **"Add Environment Variable"** dan tambahkan:
   
   | Key | Value |
   |-----|-------|
   | `FLASK_ENV` | `production` |
   | `PORT` | `10000` (otomatis dari Render) |
   | `GEMINI_API_KEY` | `AIzaSyB...` (copy dari .env kamu) |

5. **Klik "Create Web Service"** 🚀

### 3.3 Tunggu Deployment

- ⏳ Render akan mulai build (5-10 menit pertama kali)
- 📦 Download dependencies
- 🤖 Download IndoBERT model (~400MB)
- ✅ Selesai! Status jadi **"Live"**

---

## 🎉 Step 4: Test Backend API

Setelah deploy sukses, kamu dapat URL seperti:
```
https://text-preprocessing-api.onrender.com
```

### Test Endpoints:

**1. Health Check:**
```bash
curl https://text-preprocessing-api.onrender.com/api/health
```

**2. Traditional Preprocessing:**
```bash
curl -X POST https://text-preprocessing-api.onrender.com/api/preprocess/traditional \
  -H "Content-Type: application/json" \
  -d '{"text": "gue lagi belajar NLP nih"}'
```

**3. Buka di Browser:**
```
https://text-preprocessing-api.onrender.com
```

Harus muncul JSON response:
```json
{
  "message": "Text Preprocessing API",
  "version": "1.0.0"
}
```

---

## 🖥️ Step 5: Deploy Frontend

### Option A: Deploy Frontend di Render (Static Site)

1. **New +** → **Static Site**
2. **Connect repository** yang sama
3. **Configure:**
   - Name: `text-preprocessing-ui`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: (kosongkan)
   - Publish Directory: `.` (titik)

4. **Update `frontend/script.js`:**

Ganti:
```javascript
const API_URL = 'http://localhost:5000/api';
```

Menjadi:
```javascript
const API_URL = 'https://text-preprocessing-api.onrender.com/api';
```

5. Push perubahan:
```bash
git add frontend/script.js
git commit -m "Update API URL for production"
git push
```

### Option B: Deploy Frontend di Netlify (Recommended)

1. Buka https://netlify.com
2. Drag & drop folder `frontend/` ke Netlify
3. Done! Dapat URL: `https://your-app.netlify.app`

---

## ⚠️ IMPORTANT NOTES

### 1. Free Tier Limitations:
- ⏰ **Backend sleep setelah 15 menit tidak aktif**
- 🐌 **First request setelah sleep = lambat (30-60 detik)**
- 💾 **750 jam/bulan gratis** (cukup untuk demo)
- 📊 **Disk tidak persistent** (file upload hilang saat redeploy)

### 2. CORS Configuration:
Backend sudah pakai `Flask-CORS`, jadi frontend dari domain lain bisa akses API.

### 3. Environment Variables:
- ❌ **JANGAN commit `.env` ke Git!**
- ✅ **Set di Render Dashboard** → Environment Variables

### 4. IndoBERT Model:
- 📦 Model di-download otomatis saat first deploy
- ⏳ Build time jadi lebih lama (normal)
- 💾 Model di-cache untuk deploy berikutnya

---

## 🔧 Troubleshooting

### Problem: Build Failed
**Solusi:**
- Cek logs di Render Dashboard
- Pastikan `requirements.txt` lengkap
- Pastikan Python version di `runtime.txt` supported (3.9-3.11)

### Problem: API Error 500
**Solusi:**
- Cek Environment Variables (GEMINI_API_KEY)
- Lihat logs: Render Dashboard → Logs tab
- Pastikan IndoBERT model berhasil di-load

### Problem: Frontend tidak bisa akses API
**Solusi:**
- Pastikan API URL benar di `script.js` dan `chat.js`
- Cek CORS di backend
- Test API dulu pakai Postman/curl

### Problem: Backend Sleep (Cold Start)
**Solusi:**
- Ini normal di free tier
- First request setelah 15 menit = lambat
- Upgrade ke paid tier ($7/bulan) untuk always-on

---

## 🎯 Quick Commands Cheat Sheet

```bash
# Push ke GitHub
git add .
git commit -m "Update"
git push

# Check logs remote
# (Login ke Render Dashboard → Logs)

# Update environment variables
# (Render Dashboard → Environment → Edit)
```

---

## 📊 Monitoring

**Render Dashboard:**
- 📈 Metrics: CPU, Memory, Request count
- 📝 Logs: Real-time application logs
- 🔄 Deploy history
- ⚙️ Settings: Environment, scaling, etc.

---

## 🚀 Next Steps

1. ✅ Backend deployed ke Render
2. ✅ Frontend deployed (Netlify/Render)
3. 📱 Test semua features
4. 🎓 Siap presentasi!

---

## 💡 Tips

- 🔄 **Auto-deploy:** Setiap push ke GitHub → otomatis redeploy
- 📧 **Email notifications:** Render kirim notif kalau deploy gagal
- 🌍 **Custom domain:** Bisa pakai domain sendiri (gratis)
- 📊 **SSL:** HTTPS otomatis enabled

---

## 📞 Need Help?

- 📚 Render Docs: https://render.com/docs
- 💬 Render Community: https://community.render.com
- 🐛 Check project logs di Render Dashboard

---

**Good luck! 🎉**

Kalau ada error, screenshot dan tanya aja! 😊
