# ⚡ Quick Deploy Steps

## 🎯 Checklist Sebelum Deploy

### 1. Persiapan (5 menit)
- [ ] Punya akun GitHub
- [ ] Punya akun Render.com
- [ ] Gemini API Key ready

### 2. Push ke GitHub (2 menit)
```bash
cd "c:\Ariya\Semester7\Kecerdasan Buatan pt2\text-preprocessing-app"

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

### 3. Deploy di Render (3 menit)
1. **Buka:** https://render.com
2. **Login** dengan GitHub
3. **New + → Web Service**
4. **Select repo:** text-preprocessing-app
5. **Settings:**
   - Name: `text-preprocessing-api`
   - Root Directory: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn app:app`
   - Free tier ✅

6. **Environment Variables:**
   - `GEMINI_API_KEY` = (paste your key)
   - `FLASK_ENV` = `production`

7. **Create Web Service** 🚀

### 4. Wait & Test (10 menit)
- ⏳ Wait for build (download IndoBERT model)
- ✅ Status: Live
- 🧪 Test: `https://your-app.onrender.com/api/health`

---

## 🔥 Super Quick (Copy-Paste)

### Git Commands:
```bash
# Initialize & commit
git init
git add .
git commit -m "Ready for Render deployment"

# Add remote (GANTI USERNAME & REPO!)
git remote add origin https://github.com/USERNAME/text-preprocessing-app.git

# Push
git branch -M main
git push -u origin main
```

### Render Settings (Copy these):
| Setting | Value |
|---------|-------|
| Name | `text-preprocessing-api` |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app` |
| Environment Variable | `GEMINI_API_KEY=AIzaSy...` |

---

## ✅ Setelah Deploy

### Test Backend:
```bash
# Ganti YOUR_APP dengan nama app kamu
curl https://YOUR_APP.onrender.com/api/health
```

### Update Frontend:
Edit `frontend/script.js` dan `frontend/chat.js`:
```javascript
const API_URL = 'https://YOUR_APP.onrender.com/api';
```

Lalu push lagi:
```bash
git add .
git commit -m "Update API URL"
git push
```

---

## 🐛 Kalau Ada Error

1. **Build failed?**
   - Cek logs di Render dashboard
   - Pastikan Python version supported

2. **API error?**
   - Cek Environment Variables
   - Test GEMINI_API_KEY valid

3. **Frontend tidak connect?**
   - Pastikan API_URL benar
   - Check CORS enabled

---

## 📞 Need More Help?

Lihat panduan lengkap: `RENDER_DEPLOYMENT_GUIDE.md`

---

**Total waktu: ~20 menit** ⚡
(First time deployment karena download model besar)
