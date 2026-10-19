# Live Camera Troubleshooting Guide

## Quick Start

The Live Jury camera feature requires specific browser security settings. Follow these steps:

### 1. Access the App Correctly

✅ **WORKS:**
```
http://localhost:5173
```

❌ **BLOCKED BY BROWSER:**
```
http://192.168.x.x:5173  (network IP)
http://your-computer-name:5173
```

**Why?** Browsers block camera access on non-HTTPS connections unless you use `localhost`.

### 2. Grant Camera Permissions

1. Navigate to the Live Jury page
2. Click **"Start Camera"**
3. Browser will show a permission prompt
4. Click **"Allow"**

### 3. Check Browser Console

Open Developer Tools (F12) and check the Console tab for messages:

✅ **Success messages:**
```
[CameraFeed] Requesting camera access...
[CameraFeed] ✅ Video playback started successfully
[CameraFeed] ✅ Presenter tracking initialized
```

❌ **Error messages will explain the problem:**
```
❌ Camera permission denied by user
❌ No camera device found
❌ Camera is already in use by another application
❌ Camera access requires HTTPS or localhost
```

---

## Common Issues & Solutions

### Issue 1: Permission Denied

**Symptom:** Browser shows "Permission denied" or blocks camera

**Solution:**
1. Click the 🔒 (lock icon) in browser address bar
2. Find "Camera" permissions
3. Set to "Allow"
4. Refresh the page
5. Try "Start Camera" again

### Issue 2: No Camera Found

**Symptom:** Error says "No camera detected"

**Solution:**
- Check if webcam is connected
- Try a different USB port
- Check Device Manager (Windows) to see if camera is recognized
- Restart browser

### Issue 3: Camera In Use

**Symptom:** Error says "Camera is in use by another application"

**Solution:**
- Close other apps using camera (Zoom, Teams, Skype, etc.)
- Close other browser tabs using camera
- Restart browser
- Try again

### Issue 4: Accessing via Network IP

**Symptom:** Alert says "Camera requires secure connection!"

**Solution:**
Change URL to `http://localhost:5173` instead of network IP

**OR** set up HTTPS (advanced, see below)

---

## Browser Compatibility

| Browser | Min Version | Status | Notes |
|---------|-------------|--------|-------|
| Chrome | 53+ | ✅ Supported | Recommended |
| Edge | 79+ | ✅ Supported | Recommended |
| Firefox | 36+ | ✅ Supported | May need additional permissions |
| Safari | 11+ | ⚠️ Limited | May require user interaction |

---

## Advanced: Enable HTTPS (Optional)

If you need to access the app from other devices on your network:

### Step 1: Install mkcert

**Windows (PowerShell as Admin):**
```powershell
# Using Chocolatey
choco install mkcert

# Or download from: https://github.com/FiloSottile/mkcert/releases
```

### Step 2: Generate Certificates

```powershell
# Navigate to project directory
cd "c:\Users\kruti\Downloads\ai jurry\final year project"

# Create certs directory
New-Item -ItemType Directory -Path "dev-certs" -Force

# Install local CA
mkcert -install

# Generate certificates
mkcert -key-file dev-certs/key.pem -cert-file dev-certs/cert.pem localhost 127.0.0.1 ::1
```

### Step 3: Update vite.config.ts

```typescript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'dev-certs/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'dev-certs/cert.pem')),
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
```

### Step 4: Access via HTTPS

```
https://localhost:5173
https://192.168.x.x:5173  (now works with camera!)
```

---

## Testing Checklist

Use this checklist to verify camera functionality:

- [ ] Access app via `http://localhost:5173`
- [ ] Open browser DevTools (F12) → Console tab
- [ ] Navigate to Live Jury page
- [ ] Click "Start Camera" button
- [ ] Grant camera permission in browser prompt
- [ ] Verify live video feed appears
- [ ] Check console shows success messages
- [ ] Verify UI shows "LIVE WEBCAM // USER FEED"
- [ ] Check presenter tracking overlay appears
- [ ] Toggle "Stop Camera" and verify it stops
- [ ] Toggle "Start Camera" again and verify it restarts

---

## Still Not Working?

### Debugging Steps:

1. **Open DevTools Console (F12)**
   - Look for error messages
   - Copy any error text

2. **Check Current URL**
   - Must be `http://localhost:5173` or `https://...`
   - Not an IP address on HTTP

3. **Verify Camera Access**
   - Try camera in another app (Camera app, browser test site)
   - Test site: https://webcamtests.com/

4. **Check Browser Permissions**
   - Browser Settings → Privacy & Security → Site Permissions → Camera
   - Ensure localhost is allowed

5. **Try Different Browser**
   - Test in Chrome first (best support)
   - Try in incognito/private mode

### Report an Issue:

If camera still doesn't work after troubleshooting:

1. Note your browser name and version
2. Copy error messages from console
3. Note the exact URL you're using
4. Screenshot any error dialogs

---

## How It Works (Technical)

The Live Jury camera feature uses:

1. **WebRTC MediaStream API** (`getUserMedia`)
   - Browser's native camera access
   - Requires HTTPS or localhost for security

2. **Real-time Computer Vision**
   - Face detection and tracking
   - Gaze direction estimation
   - Gesture activity monitoring
   - 30 FPS processing

3. **Fallback Simulation Mode**
   - If camera fails, shows simulated feed
   - UI indicator: "HARDWARE TEST BENCH"
   - Still allows testing other features

---

## Resources

- [MDN: getUserMedia API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [WebRTC Camera Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [mkcert - Local HTTPS](https://github.com/FiloSottile/mkcert)
- [Test Your Webcam](https://webcamtests.com/)

---

**Last Updated:** 2026-10-13  
**Project:** ProjectX-Ray AI - Live Jury Camera Feature
