# 🔧 Troubleshooting Guide - Common Issues & Solutions

---

## 🐛 BACKEND ISSUES

### ❌ Build Failed: "Python version not supported"

**Error:**
```
Python version 3.10.0 is not available on this system
```

**Solution:**
1. Edit `backend/runtime.txt`
2. Ubah ke: `python-3.11.0` (or `python-3.9.0`)
3. Push to GitHub:
   ```bash
   git add backend/runtime.txt
   git commit -m "Fix Python version"
   git push
   ```
4. Render akan auto-redeploy

---

### ❌ Build Failed: "No module named 'transformers'"

**Error:**
```
ModuleNotFoundError: No module named 'transformers'
```

**Solution:**
1. Check `backend/requirements.txt` ada & lengkap
2. Pastikan ada baris:
   ```
   transformers==4.36.0
   torch==2.1.0
   ```
3. Kalau tidak ada, tambahkan & push
4. Redeploy

---

### ❌ Build Stuck: "Downloading IndoBERT model..."

**Symptom:**
- Build berjalan lama (>15 menit)
- Stuck di "Downloading model..."

**Solution:**
- **INI NORMAL!** IndoBERT model ~400MB
- First build memang lama (10-15 menit)
- Tunggu sampai selesai
- Build berikutnya akan lebih cepat (model di-cache)

**Check logs:**
```
==> Downloading indobert-base-p1
==> Download progress: [████████--] 75%
```

---

### ❌ API Error 500: "GEMINI_API_KEY not found"

**Error di logs:**
```
KeyError: 'GEMINI_API_KEY'
```

**Solution:**
1. Render Dashboard → Service → **Environment** tab
2. Check `GEMINI_API_KEY` ada
3. Kalau tidak ada → Add:
   - Key: `GEMINI_API_KEY`
   - Value: `AIzaSyB...` (paste API key kamu)
4. **Save Changes** → Auto redeploy

---

### ❌ API Error: "IndoBERT tokenizer not loaded"

**Error:**
```json
{
  "success": false,
  "error": "IndoBERT tokenizer not loaded"
}
```

**Solution:**
1. Check logs: Look for error saat load model
2. Biasanya: Memory issue (rare di Render)
3. Try redeploy: **Manual Deploy** → **Clear build cache** → **Deploy**
4. Kalau masih error, report di Render support

---

### ❌ Backend Sleep (Cold Start)

**Symptom:**
- First request setelah idle = very slow (30-60 seconds)
- Response: "Service Unavailable" sementara

**Solution:**
- **INI NORMAL di Free Tier!**
- Render free tier sleep setelah 15 menit idle
- First request wake up server (30-60 detik)
- Subsequent requests fast

**Workarounds:**
1. **Upgrade to paid** ($7/bulan) → Always-on
2. **Ping service** sebelum presentasi:
   ```bash
   curl https://YOUR-APP.onrender.com/api/health
   ```
3. **Use cron job** untuk keep-alive (not recommended, melanggar TOS)

---

### ❌ Disk Space Error

**Error:**
```
No space left on device
```

**Solution:**
- Rare di Render
- Clear build cache: **Manual Deploy** → **Clear build cache**
- Redeploy

---

## 🌐 FRONTEND ISSUES

### ❌ Frontend tidak bisa connect ke API

**Symptom:**
- Console error: `Failed to fetch`
- API status: "Disconnected"
- Features tidak jalan

**Solution:**

**1. Check API URL di `frontend/script.js`:**
```javascript
const API_BASE_URL = 'https://YOUR-APP.onrender.com';  // ✅ BENAR
```

**Common mistakes:**
```javascript
const API_BASE_URL = 'http://localhost:5000';  // ❌ Masih localhost!
const API_BASE_URL = 'https://YOUR-APP.onrender.com/';  // ❌ Ada slash di akhir
const API_BASE_URL = 'https://YOUR-APP.onrender.com/api';  // ❌ Jangan include /api
```

**2. Test API manual:**
```bash
curl https://YOUR-APP.onrender.com/api/health
```

Harus return JSON. Kalau error → backend issue.

**3. Check CORS:**
Backend sudah punya `Flask-CORS`, harusnya OK. Kalau masih error:
- Open browser Console (F12)
- Look for CORS error
- Report error message

---

### ❌ CORS Error

**Error di Console:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solution:**
1. Check `backend/app.py` punya:
   ```python
   from flask_cors import CORS
   CORS(app)
   ```
2. Kalau tidak ada, tambahkan
3. Push & redeploy backend

---

### ❌ Frontend: Blank Page / Not Loading

**Symptom:**
- Frontend URL buka tapi blank
- No errors visible

**Solution:**

**1. Hard refresh browser:**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**2. Check browser Console (F12):**
- Look for JavaScript errors
- Check Network tab → Failed requests?

**3. Check deployment:**
- Netlify/Render dashboard → Build logs
- Ensure files uploaded correctly

**4. Test direct file access:**
- `https://your-site.netlify.app/index.html`
- Should load the page

---

### ❌ CSS/JS Not Loading

**Error:**
```
Failed to load resource: style.css
```

**Solution:**
1. Check files exist di folder `frontend/`:
   - `index.html`
   - `style.css`
   - `script.js`
   - `chat.js`

2. Check file paths di `index.html`:
   ```html
   <link rel="stylesheet" href="style.css">  <!-- ✅ Relative path -->
   <script src="script.js"></script>
   ```

3. Redeploy dengan struktur folder benar

---

## 🔐 SECURITY ISSUES

### ❌ API Key Exposed di GitHub

**Symptom:**
- File `.env` ter-push ke GitHub
- API key visible di public repo

**Solution:**

**URGENT - Remove immediately:**

1. **Revoke old API key:**
   - Buka https://makersuite.google.com/app/apikey
   - Delete compromised key
   - Create new key

2. **Remove from Git history:**
   ```bash
   # Install BFG (if needed)
   # Then remove .env from history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```

3. **Update .gitignore:**
   Ensure `.env` in `.gitignore`:
   ```
   backend/.env
   .env
   ```

4. **Set new key di Render:**
   - Dashboard → Environment → Update `GEMINI_API_KEY`

---

## 🗄️ DATABASE/DICTIONARY ISSUES

### ❌ Dictionary Changes Not Persisting

**Symptom:**
- Add word → works
- Redeploy/restart → word gone

**Solution:**
- **Expected behavior!** Free tier Render tidak punya persistent disk
- Dictionary changes hilang setelah redeploy
- **Solutions:**
  1. Export dictionary before redeploy
  2. Store dictionary di database (upgrade required)
  3. Keep master `slang_dictionary.json` di Git

---

### ❌ JSON File Corrupt

**Error:**
```
json.decoder.JSONDecodeError
```

**Solution:**
1. Check `backend/slang_dictionary.json` valid JSON
2. Use JSON validator: https://jsonlint.com
3. Fix formatting errors
4. Push & redeploy

---

## ⚡ PERFORMANCE ISSUES

### ❌ Slow Response Time

**Symptom:**
- API calls very slow (>5 seconds)
- Not cold start issue

**Possible causes:**

**1. Large text input:**
- IndoBERT processing large text = slow
- Limit input to reasonable size

**2. Model loading:**
- First request after deploy = slow (loading model)
- Subsequent requests faster

**3. Free tier limitations:**
- Render free tier shared resources
- Upgrade for better performance

---

### ❌ Timeout Error

**Error:**
```
Request timeout after 30 seconds
```

**Solution:**
1. Reduce input text size
2. Check backend logs for bottleneck
3. Optimize preprocessing (disable heavy operations)

---

## 🔄 DEPLOYMENT ISSUES

### ❌ Auto-deploy Not Working

**Symptom:**
- Push to GitHub but Render doesn't redeploy

**Solution:**
1. Render Dashboard → Service → **Settings**
2. Check **"Auto-Deploy"** is **ON**
3. Check branch is correct (`main`)
4. Check GitHub webhook:
   - GitHub Repo → Settings → Webhooks
   - Should have Render webhook
   - Recent Deliveries should show success

---

### ❌ Manual Deploy Failed

**Error:**
```
Deploy failed: Build command failed
```

**Solution:**
1. Check logs for specific error
2. Common issues:
   - Wrong branch
   - Wrong root directory
   - Missing dependencies
3. Try **"Clear build cache"** before deploy

---

## 📱 BROWSER-SPECIFIC ISSUES

### ❌ Works in Chrome, Not in Firefox/Safari

**Solution:**
1. Check browser console for specific errors
2. Ensure modern JS (ES6) compatibility
3. Test in incognito/private mode
4. Clear browser cache

---

## 🆘 STILL STUCK?

### Debug Checklist:
- [ ] Read error message carefully
- [ ] Check Render logs (Backend)
- [ ] Check browser console (Frontend)
- [ ] Test API dengan curl/Postman
- [ ] Compare dengan working example
- [ ] Google the specific error message

### Get Help:
1. **Render Docs:** https://render.com/docs
2. **Render Community:** https://community.render.com
3. **Stack Overflow:** Tag `render` or `flask`
4. **GitHub Issues:** Report bugs in repo

### Information to Provide When Asking for Help:
- ✅ Exact error message
- ✅ Screenshots of error + logs
- ✅ What you've tried
- ✅ Links to deployed app (if accessible)
- ✅ Relevant code snippets

---

## 📋 Quick Diagnosis

**Backend not responding?**
→ Check Render Dashboard → Logs

**Frontend can't connect?**
→ Check API_BASE_URL in script.js

**Features not working?**
→ Check browser Console (F12)

**Build failed?**
→ Read build logs carefully

**Slow performance?**
→ Check if cold start (first request)

---

## 💡 Prevention Tips

✅ **Before deploy:**
- Test locally first
- Check all files committed
- Verify .gitignore working
- Review environment variables

✅ **After deploy:**
- Test all endpoints
- Monitor logs for errors
- Keep backup of dictionary
- Document any custom configurations

✅ **Ongoing:**
- Monitor Render dashboard
- Keep dependencies updated
- Regular backups
- Test before presenting

---

**Kalau masih stuck, DM atau screenshot error-nya!** 😊
