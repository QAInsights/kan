# Eye Blink Tracker - Pure Web App 👁️

A **100% client-side web application** for tracking eye blinks using **MediaPipe Face Mesh**. No installation, no backend, no Python required - just open in your browser!

## ✨ Features

### 🎯 Core Functionality
- **Real-time Blink Detection** using Google's MediaPipe Face Mesh
- **Browser-based** - runs entirely in your web browser
- **Offline Support** - works without internet after first load
- **Local Data Storage** - all data stored in browser (IndexedDB)
- **Privacy First** - no data leaves your device
- **Cross-platform** - works on Windows, Mac, Linux, Android, iOS

### 📊 Dashboard Features
- **Live Statistics** with real-time updates
- **Session Tracking** with start/pause/resume/stop controls
- **Historical Data** with interactive charts
- **Weekly Trends** visualization
- **Hourly Distribution** analysis
- **Export Data** as JSON for backup/analysis

### 🎨 Modern UI
- Beautiful gradient design
- Responsive layout (mobile & desktop)
- Real-time visual feedback on blinks
- Smooth animations and transitions
- Bootstrap 5 styling

## 🚀 Quick Start

### Option 1: Local File (Simplest)
1. Download all files to a folder
2. Open `index.html` in a modern web browser
3. Allow camera access when prompted
4. Click "Start Tracking"

### Option 2: Local Web Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Option 3: Deploy to Web
Deploy to any static hosting service:
- **GitHub Pages**: Free, easy setup
- **Netlify**: Drag & drop deployment
- **Vercel**: One-click deployment
- **Cloudflare Pages**: Fast global CDN

## 📱 Usage

### Starting a Session
1. Click **"Start Tracking"** button
2. Allow camera access in browser prompt
3. Position your face in front of camera
4. Blinks are automatically detected and counted

### Controls
- **Start**: Begin tracking session
- **Pause**: Temporarily pause detection
- **Resume**: Continue paused session
- **Stop**: End session and save data

### Settings
- **EAR Threshold** (0.15-0.30): Adjust blink sensitivity
  - Lower = more sensitive (detects more blinks)
  - Higher = less sensitive (fewer false positives)
- **Consecutive Frames** (2-5): Frames needed to confirm blink
- **Show Landmarks**: Toggle eye landmark visualization

## 🔧 How It Works

### Blink Detection Algorithm
Uses the **Eye Aspect Ratio (EAR)** method:

```
EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
```

Where p1-p6 are eye landmark points from MediaPipe Face Mesh.

**Detection Logic:**
1. MediaPipe detects 468 facial landmarks at 30 FPS
2. Extract 6 landmarks per eye (12 total)
3. Calculate EAR for left and right eyes
4. Average the two EAR values
5. If EAR < threshold for N consecutive frames → eyes closed
6. When EAR returns above threshold → blink detected!

### Data Storage
All data is stored locally in your browser using **IndexedDB**:

- **Blinks Table**: Individual blink events with timestamps
- **Sessions Table**: Tracking session summaries
- **Settings Table**: User preferences

**Data persists** even after closing the browser!

## 🌐 Browser Compatibility

### Fully Supported
- ✅ Chrome 90+ (Desktop & Mobile)
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+ (Desktop & iOS)
- ✅ Opera 76+

### Requirements
- WebRTC support (for camera access)
- WebAssembly support (for MediaPipe)
- IndexedDB support (for data storage)

## 📊 Statistics & Analytics

### Real-time Metrics
- **Session Blinks**: Current session count
- **Blinks Per Minute**: Real-time BPM calculation
- **Session Duration**: Live timer

### Historical Data
- **Total Blinks**: All-time count
- **Today's Blinks**: Daily total
- **Daily Average**: Average blinks per day
- **Average BPM**: Overall blink rate

### Visualizations
- **Weekly Chart**: 7-day blink trends
- **Hourly Distribution**: Today's hourly breakdown
- **Recent Sessions**: Last 5 sessions with details

## 💾 Data Export

Export your data as JSON:
1. Click **"Export Data"** button
2. Downloads `eye-blink-data-YYYY-MM-DD.json`
3. Contains all blinks, sessions, and settings

### Export Format
```json
{
  "exportDate": "2025-10-18T14:30:00.000Z",
  "blinks": [...],
  "sessions": [...],
  "settings": [...]
}
```

## 🔒 Privacy & Security

### Complete Privacy
- ✅ **No server communication** - everything runs locally
- ✅ **No data collection** - nothing sent to external servers
- ✅ **No tracking** - no analytics or telemetry
- ✅ **Camera-only** - video never recorded or saved
- ✅ **Local storage** - data stays in your browser

### Permissions
- **Camera**: Required for face detection
- **Storage**: Automatic (IndexedDB for data persistence)

## 🛠️ Technical Stack

### Core Technologies
- **MediaPipe Face Mesh**: Google's ML-powered facial landmark detection
- **WebRTC**: Browser camera access
- **IndexedDB**: Client-side database
- **Canvas API**: Video overlay rendering

### Libraries
- **Bootstrap 5**: UI framework
- **Font Awesome**: Icons
- **Chart.js**: Data visualization

### No Dependencies Required
- No npm packages
- No build process
- No bundlers
- No transpilers
- Just vanilla JavaScript!

## 📁 File Structure

```
web-app/
├── index.html          # Main HTML file
├── app.js              # Application logic
├── blink-detector.js   # Blink detection algorithm
├── db.js               # IndexedDB manager
└── README.md           # This file
```

**Total Size**: ~50KB (excluding CDN libraries)

## 🎯 Use Cases

- **Eye Health Monitoring**: Track blink frequency
- **Screen Time Analysis**: Correlate with computer usage
- **Dry Eye Prevention**: Ensure adequate blinking
- **Research**: Collect personal blink data
- **Productivity**: Monitor focus and fatigue
- **Medical**: Track symptoms or treatment effects

## 🐛 Troubleshooting

### Camera Not Working
- **Check permissions**: Allow camera access in browser
- **Close other apps**: Ensure camera isn't in use
- **Try different browser**: Some browsers have better WebRTC support
- **HTTPS required**: Camera access requires secure context (localhost is OK)

### Poor Detection Accuracy
- **Adjust threshold**: Lower EAR threshold for more sensitivity
- **Good lighting**: Ensure face is well-lit
- **Face position**: Keep face centered in frame
- **Remove glasses**: Reflections can interfere
- **Clean camera**: Wipe lens if blurry

### Data Not Persisting
- **Check browser settings**: Ensure cookies/storage enabled
- **Private/Incognito mode**: Data cleared on close
- **Storage quota**: Browser may limit IndexedDB size
- **Export regularly**: Backup data with export feature

### Performance Issues
- **Close other tabs**: Free up browser resources
- **Disable landmarks**: Turn off landmark visualization
- **Update browser**: Use latest version
- **Check CPU**: High usage may slow detection

## 🚀 Deployment Guide

### GitHub Pages (Free)
1. Create GitHub repository
2. Upload all files
3. Go to Settings → Pages
4. Select branch and folder
5. Access at `https://username.github.io/repo-name`

### Netlify (Free)
1. Drag & drop folder to netlify.com
2. Instant deployment
3. Custom domain support
4. Automatic HTTPS

### Vercel (Free)
```bash
npm i -g vercel
vercel
```

### Self-Hosted
Any web server works:
- Apache
- Nginx
- IIS
- Caddy

Just serve the files as static content!

## 📈 Future Enhancements

Potential features to add:
- [ ] PWA support (install as app)
- [ ] Notifications for low blink rate
- [ ] Multiple face tracking
- [ ] Blink pattern analysis
- [ ] Data import functionality
- [ ] Dark mode
- [ ] Customizable themes
- [ ] Advanced statistics
- [ ] CSV export option
- [ ] Comparison charts

## 🤝 Contributing

This is a standalone web app - feel free to:
- Fork and modify
- Add features
- Improve UI/UX
- Fix bugs
- Share improvements

## 📄 License

MIT License - Free to use, modify, and distribute

## 🙏 Acknowledgments

- **Google MediaPipe**: Amazing face mesh technology
- **Bootstrap**: Beautiful UI components
- **Chart.js**: Excellent charting library
- **Font Awesome**: Comprehensive icon set

## 💡 Tips

### For Best Results
1. **Good lighting**: Natural light or bright room
2. **Stable position**: Keep camera steady
3. **Eye level**: Position camera at face height
4. **Regular breaks**: Follow 20-20-20 rule
5. **Calibrate**: Adjust threshold for your eyes

### Recommended Settings
- **Normal use**: EAR 0.20, Frames 3
- **Sensitive**: EAR 0.18, Frames 2
- **Conservative**: EAR 0.22, Frames 4

## 📞 Support

Having issues? Check:
1. Browser console for errors (F12)
2. Camera permissions in browser settings
3. This README troubleshooting section
4. Try different browser

## 🎉 Enjoy!

Start tracking your blinks and maintain healthy eyes! 👁️✨

---

**Made with ❤️ using MediaPipe and modern web technologies**

**No installation • No backend • No hassle**
