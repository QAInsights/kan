#!/usr/bin/env python3
"""
Eye Blink Tracker - Main Application Entry Point
OpenCV Version with Web Dashboard (No dlib/CMake required)
"""

import sys
import os
import logging
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.app_opencv import EyeBlinkTrackerApp

def setup_logging():
    """Setup logging configuration"""
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_dir / "eye_tracker.log"),
            logging.StreamHandler(sys.stdout)
        ]
    )

def main():
    """Main application entry point"""
    try:
        setup_logging()
        logger = logging.getLogger(__name__)
        logger.info("Starting Eye Blink Tracker Application (OpenCV Mode)")
        
        print("="*70)
        print("  EYE BLINK TRACKER - OpenCV Mode")
        print("="*70)
        print()
        print("  Features:")
        print("  - No dlib/CMake required")
        print("  - Web dashboard at http://localhost:5000")
        print("  - System tray integration")
        print("  - Background operation")
        print("  - Real-time statistics")
        print()
        print("  Opening web dashboard and system tray...")
        print("="*70)
        print()
        
        # Create and run the application
        app = EyeBlinkTrackerApp()
        app.run()
        
    except KeyboardInterrupt:
        logger.info("Application stopped by user")
        print("\nApplication stopped by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        print(f"\nError: {e}")
        print("Check logs/eye_tracker.log for details")
        sys.exit(1)

if __name__ == "__main__":
    main()
