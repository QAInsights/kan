# -*- coding: utf-8 -*-
"""
Simple OpenCV-based blink detection test
No dlib required - uses OpenCV Haar Cascades only
"""

import cv2
import numpy as np
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from camera_manager import CameraManager
from database import DatabaseManager
from blink_detector_opencv import BlinkDetectorOpenCV

def main():
    print("="*60)
    print("Eye Blink Tracker - OpenCV Mode (No dlib)")
    print("="*60)
    print("\nThis version uses only OpenCV - no CMake/dlib needed!")
    print("\nControls:")
    print("  q - Quit")
    print("  r - Reset counter")
    print("\n" + "="*60)
    
    try:
        # Initialize
        print("\n[1/4] Initializing database...")
        db_manager = DatabaseManager()
        print("OK")
        
        print("[2/4] Initializing camera manager...")
        camera_manager = CameraManager()
        cameras = camera_manager.get_available_cameras()
        
        if not cameras:
            print("ERROR: No cameras found!")
            print("\nTroubleshooting:")
            print("  1. Check camera connection")
            print("  2. Enable camera permissions")
            print("  3. Close other apps using camera")
            return
        
        print(f"OK - Found {len(cameras)} camera(s)")
        
        print("[3/4] Initializing blink detector...")
        detector = BlinkDetectorOpenCV(db_manager)
        print("OK")
        
        print("[4/4] Starting camera...")
        camera_manager.select_camera(cameras[0]['index'])
        camera = camera_manager.get_active_camera()
        print("OK")
        
        print("\n" + "="*60)
        print("STARTING DETECTION - Look at the camera window")
        print("="*60)
        
        detector.start_detection(camera)
        
        frame_count = 0
        
        while True:
            ret, frame = camera.read()
            if not ret:
                print("WARNING: Cannot read frame")
                continue
            
            frame_count += 1
            
            # Process for blink detection
            detector.process_frame(frame)
            
            # Create display
            display = frame.copy()
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = detector.face_cascade.detectMultiScale(
                gray, 1.1, 5, minSize=(50, 50)
            )
            
            # Draw face and eyes
            for (x, y, w, h) in faces:
                cv2.rectangle(display, (x, y), (x+w, y+h), (255, 0, 0), 2)
                
                # Detect eyes
                roi_gray = gray[y:y+h, x:x+w]
                eyes = detector.eye_cascade.detectMultiScale(
                    roi_gray, 1.1, 5, minSize=(20, 20)
                )
                
                for (ex, ey, ew, eh) in eyes:
                    cv2.rectangle(display, (x+ex, y+ey), 
                                (x+ex+ew, y+ey+eh), (0, 255, 0), 2)
            
            # Get stats
            stats = detector.get_stats()
            
            # Display info
            cv2.putText(display, f"Frame: {frame_count}", (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            cv2.putText(display, f"Faces: {len(faces)}", (10, 60),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            eyes_text = "YES" if stats.get('eyes_detected', False) else "NO"
            eyes_color = (0, 255, 0) if stats.get('eyes_detected', False) else (0, 0, 255)
            cv2.putText(display, f"Eyes: {eyes_text}", (10, 90),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, eyes_color, 2)
            
            blink_count = stats.get('session_blinks', 0)
            cv2.putText(display, f"BLINKS: {blink_count}", (10, 120),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            
            bpm = stats.get('blinks_per_minute', 0)
            cv2.putText(display, f"BPM: {bpm:.1f}", (10, 150),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
            
            # Instructions
            cv2.putText(display, "q=quit  r=reset", (10, display.shape[0]-10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Show
            cv2.imshow('Blink Tracker', display)
            
            # Print to console every 100 frames
            if frame_count % 100 == 0:
                print(f"Frames: {frame_count} | Blinks: {blink_count} | BPM: {bpm:.1f}")
            
            # Keys
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('r'):
                detector.reset_session_stats()
                print("Counter reset!")
        
        # Cleanup
        detector.stop_detection()
        camera_manager.release_camera()
        cv2.destroyAllWindows()
        
        # Final stats
        final_stats = detector.get_stats()
        print("\n" + "="*60)
        print("SESSION COMPLETE")
        print("="*60)
        print(f"Total Blinks: {final_stats['session_blinks']}")
        print(f"Duration: {final_stats['session_duration']:.1f} seconds")
        print(f"Average BPM: {final_stats.get('blinks_per_minute', 0):.1f}")
        print("="*60)
        
    except KeyboardInterrupt:
        print("\nStopped by user")
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
