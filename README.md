# 👁️ Kan - Eye Health Monitor

> **Kan** (கண்) means "Eye" in Tamil

**Protect your vision in the digital age.** Kan is an intelligent eye health monitoring application that tracks your blink rate in real-time, provides health insights, and helps prevent digital eye strain through continuous background monitoring.

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Face%20Mesh-green.svg)](https://google.github.io/mediapipe/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Problem Statement

In today's digital world, people spend 8-12 hours daily staring at screens, leading to:
- 💻 **Digital Eye Strain** affecting 60% of computer users
- 😓 **Reduced Blink Rate** (from 15-20 to 5-7 blinks/minute)
- 🏥 **Computer Vision Syndrome** with symptoms like dry eyes, headaches, and blurred vision
- ⚠️ **Long-term Vision Problems** from prolonged screen exposure

## 💡 Our Solution

**Kan** is a non-intrusive desktop application that:
1. ✅ **Monitors** your blink rate continuously in the background
2. ✅ **Analyzes** your eye health patterns using medical research
3. ✅ **Alerts** you when issues are detected
4. ✅ **Guides** you with personalized recommendations
5. ✅ **Tracks** your progress over time with detailed analytics

## ✨ Key Features

### 🔬 Advanced Detection Technology
- **MediaPipe Face Mesh** - Google's state-of-the-art 468-point facial landmark detection
- **Adaptive Thresholding** - Learns your unique blink pattern
- **Glasses Mode** - Optimized detection for eyewear users
- **Real-time Processing** - 30 FPS with minimal CPU usage
- **High Accuracy** - Eye Aspect Ratio (EAR) algorithm with 95%+ accuracy

### 🎛️ Smart Features
- **Background Operation** - Runs silently in system tray
- **Desktop Notifications** - Automatic health alerts every 30 seconds
- **Adaptive Learning** - Adjusts to your baseline blink rate
- **Medical Insights** - Research-based health recommendations
- **Privacy First** - All data stored locally, no cloud sync

### 📊 Comprehensive Dashboard
- **Real-time Statistics** - Live blink counter, BPM, session duration
- **Interactive Charts** - Weekly trends and hourly patterns
- **Health Insights** - Color-coded alerts (Normal, Warning, Critical)
- **Customizable Settings** - Adjust sensitivity and detection parameters
- **Session History** - Track your progress over time

### 🎨 Beautiful UI
- **Apple-inspired Design** - Modern, clean interface
- **Responsive Layout** - Works on any screen size
- **Dark/Light Mode** - Easy on the eyes
- **Smooth Animations** - Polished user experience

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** (recommended)
- **Webcam** (built-in or external)
- **Windows 10/11** (macOS/Linux support coming soon)
- **2GB RAM** minimum

### One-Command Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/kan-eye-health.git
cd kan-eye-health

# Create virtual environment
python -m venv venv-py311
venv-py311\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run the application
python run_app.py
```

### What Happens Next?

1. 🌐 **Web dashboard** opens automatically at `http://localhost:5000`
2. 👁️ **System tray icon** appears in bottom-right corner
3. 📹 **Camera access** requested (allow for detection)
4. ✅ **Ready to track!** Click "Start Tracking" in dashboard

## 📱 How to Use Kan

### 1️⃣ System Tray (Background Monitoring)

**Find the eye icon** 👁️ in your system tray (bottom-right corner):

**Hover to see:**
```
Kan [TRACKING] | Blinks: 42 | BPM: 15.2 | Time: 00:15:32
```

**Right-click menu:**
- 📊 **Live Stats** - Blinks, BPM, Duration
- ▶️ **Start Tracking** - Begin monitoring
- ⏸️ **Pause Tracking** - Temporary pause
- ⏹️ **Stop Tracking** - End session
- 🌐 **Open Dashboard** - Full interface
- ❌ **Exit** - Close application

### 2️⃣ Web Dashboard (Full Control)

**Access:** `http://localhost:5000`

**Features:**
- 📈 **Real-time stats** updating every second
- 🎛️ **Adjustable settings** (EAR threshold, glasses mode)
- 📊 **Beautiful charts** (weekly trends, hourly patterns)
- 💡 **Health insights** with medical recommendations
- 🎥 **Camera selection** and configuration

### Dashboard Sections

#### 1. Control Panel
- **Start Tracking**: Begin eye blink detection
- **Pause/Resume**: Temporarily halt tracking
- **Stop Tracking**: End current session

#### 2. Camera Selection
- **Select Camera**: Choose from available cameras
- **Refresh**: Update camera list
- **Camera Info**: View resolution, FPS, and backend details

#### 3. Statistics
- **Current Session**: Live blink count and rate
- **Total Statistics**: Historical data summary
- **Charts**: Weekly trends and hourly patterns

#### 4. Settings
- **EAR Threshold**: Adjust sensitivity (0.1 - 0.5)
- **Consecutive Frames**: Frames needed to confirm blink
- **Auto-start**: Automatically begin tracking on launch

## 🔧 Configuration

### Detection Parameters

#### Eye Aspect Ratio (EAR) Threshold
- **Default**: 0.3
- **Range**: 0.1 - 0.5
- **Lower values**: More sensitive (detects more blinks)
- **Higher values**: Less sensitive (detects fewer blinks)

#### Consecutive Frames
- **Default**: 3
- **Range**: 1 - 10
- **Purpose**: Prevent false positives from noise

### Camera Settings
- **Resolution**: Automatically set to 640x480 for optimal performance
- **FPS**: Target 30 FPS for smooth detection
- **Buffer Size**: Minimal buffering to reduce latency

## 📊 Data Storage

### Database Schema
- **Blinks Table**: Individual blink events with timestamps
- **Sessions Table**: Tracking session summaries
- **Settings Table**: User preferences and configuration

### Data Location
- **Database**: `data/blink_tracker.db`
- **Logs**: `logs/eye_tracker.log`
- **Settings**: Stored in database

## 🎛️ API Endpoints

The web dashboard communicates with the backend via REST API:

### Status & Control
- `GET /api/status` - Current application status
- `POST /api/tracking/start` - Start tracking
- `POST /api/tracking/pause` - Pause tracking
- `POST /api/tracking/resume` - Resume tracking
- `POST /api/tracking/stop` - Stop tracking

### Camera Management
- `GET /api/cameras` - List available cameras
- `GET /api/cameras/refresh` - Refresh camera list
- `POST /api/cameras/select/<index>` - Select specific camera

### Statistics
- `GET /api/statistics/summary` - Overall statistics
- `GET /api/statistics/daily` - Daily breakdown
- `GET /api/statistics/weekly` - Weekly trends
- `GET /api/sessions` - Recent tracking sessions

### Settings
- `GET /api/settings` - Current settings
- `POST /api/settings` - Update settings

## 🔒 Privacy & Security

### Data Privacy
- **Local Storage**: All data stored locally on your device
- **No Cloud Sync**: No data transmitted to external servers
- **Camera Access**: Only used for blink detection, no recording

### Security Features
- **Local Web Server**: Dashboard only accessible from localhost
- **No External Dependencies**: Self-contained operation
- **Minimal Permissions**: Only requires camera access

## 🔍 Troubleshooting

### Common Issues

#### Camera Not Detected
```
1. Check camera connections
2. Ensure camera isn't used by another application
3. Try running as administrator (Windows)
4. Check privacy settings (Windows 10/11)
```

#### Dashboard Not Loading
```
1. Verify Python is running without errors
2. Check if port 5000 is available
3. Try accessing http://127.0.0.1:5000
4. Check firewall settings
```

#### Poor Detection Accuracy
```
1. Adjust EAR threshold in settings
2. Ensure good lighting conditions
3. Position camera at eye level
4. Clean camera lens
5. Check camera resolution and FPS
```

#### High CPU Usage
```
1. Close other camera applications
2. Reduce detection sensitivity
3. Check for proper camera drivers
4. Monitor system resources
```

### Log Files
Check `logs/eye_tracker.log` for detailed error information:
```bash
tail -f logs/eye_tracker.log  # Linux/macOS
Get-Content logs/eye_tracker.log -Tail 20 -Wait  # Windows PowerShell
```

## 🛠️ Development

### Project Structure
```
eye_blink_tracker/
├── main.py                 # Application entry point
├── setup.py                # Setup and installation script
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── src/                   # Source code
│   ├── app.py             # Main application class
│   ├── camera_manager.py  # Camera detection and management
│   ├── blink_detector.py  # Eye blink detection logic
│   ├── web_server.py      # Flask web server
│   ├── system_tray.py     # System tray integration
│   └── database.py        # Database management
├── templates/             # HTML templates
│   └── dashboard.html     # Main dashboard template
├── static/               # Static web assets
│   ├── css/
│   │   └── dashboard.css  # Dashboard styles
│   └── js/
│       └── dashboard.js   # Dashboard JavaScript
├── data/                 # Database storage
├── logs/                 # Application logs
└── shape_predictor_68_face_landmarks.dat  # dlib model file
```

### Adding Features
1. **New API Endpoints**: Add to `web_server.py`
2. **Database Changes**: Modify `database.py`
3. **UI Components**: Update `templates/dashboard.html`
4. **Detection Logic**: Enhance `blink_detector.py`

### Testing
```bash
# Run with debug logging
python main.py --debug

# Test camera detection
python -c "from src.camera_manager import CameraManager; cm = CameraManager(); print(cm.get_available_cameras())"

# Test database
python -c "from src.database import DatabaseManager; db = DatabaseManager(); print(db.get_statistics_summary())"
```

## 📋 Requirements

### Python Packages
- **opencv-python** (4.8.0+): Computer vision and camera access
- **dlib** (19.24.0+): Facial landmark detection
- **numpy** (1.24.0+): Numerical computations
- **Flask** (2.3.0+): Web server framework
- **Flask-SocketIO** (5.3.0+): Real-time web communication
- **pystray** (0.19.0+): System tray integration
- **Pillow** (10.0.0+): Image processing
- **scipy**: Distance calculations for EAR

### System Requirements
- **RAM**: 2GB minimum, 4GB recommended
- **CPU**: Any modern processor
- **Camera**: USB webcam or built-in camera
- **Network**: Local network access for web dashboard

## 🤝 Contributing

### Bug Reports
1. Check existing issues
2. Provide detailed description
3. Include system information
4. Attach log files if applicable

### Feature Requests
1. Describe the feature
2. Explain use case
3. Consider implementation approach

### Pull Requests
1. Fork the repository
2. Create feature branch
3. Test thoroughly
4. Update documentation
5. Submit pull request

## 📄 License

This project is released under the MIT License. See LICENSE file for details.

## 🙏 Acknowledgments

- **dlib**: Davis King's machine learning library
- **OpenCV**: Computer vision library
- **Flask**: Web framework for Python
- **Chart.js**: Charts and graphs for the dashboard
- **Bootstrap**: UI framework for responsive design

## 📞 Support

For support and questions:
1. Check this README for common solutions
2. Review log files for error details
3. Search existing issues
4. Create new issue with detailed information

---

**Happy Blinking! 👁️**
