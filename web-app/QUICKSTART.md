# Quick Start Guide 🚀

## Fastest Way to Run (3 Steps)

### 1. Open the File
Simply **double-click `index.html`** in your file browser.

### 2. Allow Camera Access
When prompted, click **"Allow"** to grant camera access.

### 3. Start Tracking
Click the **"Start Tracking"** button and you're done! 🎉

---

## Better Way: Use a Local Server

### Why?
- Better performance
- Proper CORS handling
- More reliable camera access
- Closer to production environment

### Using Python (Recommended)
```bash
# Navigate to the web-app folder
cd web-app

# Start server
python -m http.server 8000
```

Then open: **http://localhost:8000**

### Using Node.js
```bash
# Install http-server globally (one time)
npm install -g http-server

# Navigate to web-app folder
cd web-app

# Start server
http-server
```

Then open: **http://localhost:8080**

### Using PHP
```bash
cd web-app
php -S localhost:8000
```

Then open: **http://localhost:8000**

### Using VS Code
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## First Time Setup

### 1. Camera Permissions
- Browser will ask for camera access
- Click **"Allow"** or **"Yes"**
- If blocked, check browser settings

### 2. Wait for Loading
- MediaPipe libraries load from CDN
- Takes 2-5 seconds on first visit
- Cached for future visits

### 3. Adjust Settings (Optional)
- **EAR Threshold**: Start with 0.20
- **Consecutive Frames**: Keep at 3
- **Show Landmarks**: Enable to see eye tracking

---

## Testing the App

### Quick Test
1. Start tracking
2. Blink a few times
3. Watch the counter increase
4. See the red indicator flash on blinks

### Verify It's Working
- ✅ Video feed shows your face
- ✅ Blink counter increases when you blink
- ✅ Red indicator flashes on detection
- ✅ Session duration timer running
- ✅ Blinks per minute updates

---

## Troubleshooting

### Camera Not Working?
```
1. Check browser permissions
2. Close other apps using camera
3. Try a different browser
4. Use HTTPS or localhost
```

### Not Detecting Blinks?
```
1. Lower EAR threshold (try 0.18)
2. Ensure good lighting
3. Face the camera directly
4. Remove glasses if reflective
```

### Page Won't Load?
```
1. Check internet connection (for CDN)
2. Try a different browser
3. Clear browser cache
4. Use a local server instead
```

---

## Browser Recommendations

### Best Performance
1. **Chrome** - Fastest, best MediaPipe support
2. **Edge** - Chromium-based, excellent
3. **Firefox** - Good support
4. **Safari** - Works well on Mac/iOS

### Minimum Versions
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Next Steps

### After First Session
1. Check the **Statistics** cards
2. View the **Weekly Chart**
3. See **Recent Sessions** list
4. Try **Export Data** button

### Customize Your Experience
1. Adjust **EAR Threshold** for your eyes
2. Enable **Show Landmarks** to see tracking
3. Track for a few days to see trends

### Deploy Online (Optional)
1. Upload to GitHub Pages (free)
2. Share with others
3. Access from any device

---

## Tips for Best Results

### 🎯 Positioning
- Camera at eye level
- Face centered in frame
- 1-2 feet from camera

### 💡 Lighting
- Bright, even lighting
- Avoid backlighting
- Natural light is best

### ⚙️ Settings
- Start with defaults
- Adjust if too sensitive/insensitive
- Lower threshold = more sensitive

---

## Common Questions

**Q: Does it work offline?**
A: After first load, mostly yes. MediaPipe caches locally.

**Q: Where is data stored?**
A: In your browser's IndexedDB. Never leaves your device.

**Q: Can I use on mobile?**
A: Yes! Works on iOS Safari and Android Chrome.

**Q: Is it accurate?**
A: Very accurate with proper lighting and positioning.

**Q: Can I export my data?**
A: Yes! Click "Export Data" to download JSON.

---

## Support

If you encounter issues:
1. Check browser console (F12)
2. Review README.md
3. Try different browser
4. Ensure camera permissions granted

---

**Enjoy tracking your blinks! 👁️**
