# Eye Blink Tracker

A comprehensive Python application for tracking eye blinks with real-time monitoring, web dashboard, and background operation capabilities.

## 🎯 Features

### Core Functionality
- **Real-time Eye Blink Detection** using OpenCV and dlib facial landmarks
- **Background Operation** with system tray integration
- **Web Dashboard** for monitoring and control
- **Camera Management** with automatic detection and user selection
- **Start/Pause/Stop Controls** for flexible tracking sessions
- **Non-intrusive Operation** that won't interfere with video meetings

### Dashboard Features
- **Live Statistics** with real-time updates
- **Historical Data** with charts and analytics
- **Session Management** with detailed tracking history
- **Camera Selection** with resolution and FPS information
- **Settings Configuration** for detection parameters
- **Responsive Design** for desktop and mobile access

### Data & Analytics
- **SQLite Database** for persistent data storage
- **Daily/Weekly Statistics** with trend analysis
- **Hourly Distribution Charts** to track patterns
- **Session History** with detailed metrics
- **Export Capabilities** for data analysis

## 🚀 Quick Start

### Prerequisites
- Python 3.7 or higher
- Webcam or external camera
- Windows, macOS, or Linux

> **⚠️ Important**: The facial landmark model file (`shape_predictor_68_face_landmarks.dat`, ~95MB) is **not included** in this repository due to its size. It will be automatically downloaded during setup, or you can download it manually from the link below.

### Installation

1. **Clone or download** the project:
   ```bash
   git clone <repository-url>
   cd eye_blink_tracker
   ```

2. **Run the setup script**:
   ```bash
   python setup.py
   ```
   
   This will:
   - Install all required dependencies
   - Download the dlib facial landmark model
   - Create necessary directories
   - Test camera access
   - Create desktop shortcut (Windows)

3. **Start the application**:
   ```bash
   python main.py
   ```

### Manual Installation

If you prefer manual installation:

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Download dlib model**:
   - Download: http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2
   - Extract `shape_predictor_68_face_landmarks.dat` to project root

3. **Run the application**:
   ```bash
   python main.py
   ```

## 📱 Usage

### System Tray
- Look for the **eye icon** in your system tray
- **Right-click** for quick controls:
  - Start/Pause/Stop tracking
  - Open dashboard
  - View status
  - Exit application

### Web Dashboard
- Automatically opens at **http://localhost:5000**
- Or manually navigate to the URL in your browser

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
