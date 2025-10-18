# START HERE - Eye Blink Tracker

## ✅ Quick Start (OpenCV Version - No dlib needed!)

### 1. Run the Application

```bash
cd C:\Users\Navee\eye_blink_tracker
python run_app.py
```

This will:
- ✓ Start the web dashboard at http://localhost:5000
- ✓ Create a system tray icon (look for eye icon in taskbar)
- ✓ Run in the background without interfering with other apps

### 2. Open Web Dashboard

Your browser should open automatically, or go to:
```
http://localhost:5000
```

### 3. Select Camera

In the web dashboard:
1. Click **"Refresh Cameras"** button
2. Select your camera from the dropdown
3. Click **"Start Tracking"**

### 4. Watch It Work!

You should see:
- Live blink counter incrementing
- Blinks per minute (BPM) calculation
- Real-time statistics
- Charts and graphs

---

## 🎮 Controls

### Web Dashboard
- **Start Tracking** - Begin counting blinks
- **Pause Tracking** - Temporarily pause
- **Resume Tracking** - Continue tracking
- **Stop Tracking** - End current session

### System Tray (Right-click the eye icon)
- Start/Pause/Stop tracking
- Open dashboard
- View status
- Exit application

---

## 📊 What You'll See

### Web Dashboard Shows:
1. **Control Panel** - Start/pause/stop buttons
2. **Camera Selection** - Choose your camera
3. **Current Session Stats** - Live blink count and BPM
4. **Total Statistics** - All-time blink data
5. **Weekly Chart** - Blink trends over the week
6. **Hourly Distribution** - When you blink most
7. **Recent Sessions** - History of tracking sessions

---

## 🔧 Two Versions Available

### Option A: Full App with Web Dashboard (Recommended)
```bash
python run_app.py
```
- Web dashboard at http://localhost:5000
- System tray integration
- Background operation
- Full statistics and charts

### Option B: Simple Visual Test
```bash
python test_opencv_simple.py
```
- Simple camera window with blink counter
- No web dashboard
- Good for testing if detection works
- Press 'q' to quit, 'r' to reset

---

## 📁 File Guide

### Main Applications
- **run_app.py** - ⭐ **USE THIS!** Full app with web dashboard (OpenCV)
- **test_opencv_simple.py** - Simple test with camera window only
- **main.py** - Original version (requires dlib/CMake - skip this)

### Source Code
- **src/app_opencv.py** - Main app coordinator (OpenCV version)
- **src/blink_detector_opencv.py** - OpenCV-based detection
- **src/camera_manager.py** - Camera handling
- **src/web_server.py** - Web dashboard backend
- **src/system_tray.py** - System tray integration
- **src/database.py** - Data storage

### Web Interface
- **templates/dashboard.html** - Web dashboard UI
- **static/css/dashboard.css** - Styling
- **static/js/dashboard.js** - Frontend logic

### Diagnostic Tools
- **diagnose.py** - Check all components
- **test_face_detection.py** - Test face detection
- **quick_camera_test.py** - Quick camera check

### Documentation
- **README.md** - Full documentation
- **TROUBLESHOOTING.md** - Detailed troubleshooting
- **QUICK_FIX.md** - Common solutions

---

## 🎯 Expected Workflow

1. **Start the app**: `python run_app.py`
2. **Open dashboard**: http://localhost:5000
3. **Select camera**: Choose from dropdown
4. **Start tracking**: Click "Start Tracking"
5. **Use your computer normally**: App runs in background
6. **View stats**: Check dashboard anytime for statistics
7. **System tray**: Right-click eye icon for quick controls

---

## ✨ Features

### Real-Time Detection
- Detects blinks as they happen
- Updates every second
- Shows current blink rate (BPM)

### Background Operation
- Runs in system tray
- Minimal CPU usage
- Won't interfere with video meetings
- Camera released when not tracking

### Statistics & Analytics
- Total blinks counted
- Daily/weekly trends
- Hourly patterns
- Session history
- Average blinks per minute

### Data Persistence
- All data saved to SQLite database
- Historical tracking
- Session replay
- Export capabilities (future feature)

---

## 🔍 Troubleshooting

### Web Dashboard Won't Load
```bash
# Check if server is running
# Look for: "Starting web server on localhost:5000" in console

# Try alternate URL
http://127.0.0.1:5000
```

### No Blinks Detected
1. Check lighting (needs good light)
2. Face camera directly
3. Ensure green boxes appear around eyes in logs
4. Run: `python test_opencv_simple.py` to see visual feedback

### Camera Issues
```bash
# Test camera access
python quick_camera_test.py

# List available cameras in dashboard
# Click "Refresh Cameras"
```

### System Tray Icon Not Appearing
- Check taskbar overflow area (hidden icons)
- May take a few seconds to appear
- Look for eye-shaped icon

---

## 📊 Understanding Statistics

### Blinks Per Minute (BPM)
- Normal range: 15-20 BPM
- Lower than 10: Possible eye strain (take a break!)
- Higher than 30: Normal variation

### Session Duration
- Shows how long you've been tracking
- Resets when you stop tracking
- Historical data saved in database

---

## 🆘 Need Help?

1. **Check logs**: `logs/eye_tracker.log`
2. **Run diagnostics**: `python diagnose.py`
3. **Visual test**: `python test_opencv_simple.py`
4. **Read guides**: 
   - TROUBLESHOOTING.md
   - QUICK_FIX.md
   - README.md

---

## 🚀 Pro Tips

1. **Better Lighting** = Better Detection
   - Face a window or lamp
   - Avoid backlighting
   - Use even, bright lighting

2. **Camera Position**
   - 1-3 feet from camera
   - Eye level or slightly above
   - Face camera directly

3. **Background Operation**
   - Minimize dashboard after starting
   - App runs in system tray
   - Check stats anytime via dashboard

4. **Performance**
   - Close other camera apps first
   - Use built-in camera for best results
   - Restart tracking if it slows down

---

**Ready to start? Run: `python run_app.py`**

Enjoy tracking your blinks! 👁️
