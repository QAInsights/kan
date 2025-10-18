"""
Main Application Class for Eye Blink Tracker - OpenCV Version
Integrates with web dashboard (no dlib required)
"""

import logging
import threading
import time
from pathlib import Path

from camera_manager import CameraManager
from blink_detector_opencv import BlinkDetectorOpenCV
from web_server import WebServer
from system_tray import SystemTrayApp
from database import DatabaseManager

class EyeBlinkTrackerApp:
    """Main application class that coordinates all components - OpenCV version"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Initialize components (using OpenCV detector instead of dlib)
        self.db_manager = DatabaseManager()
        self.camera_manager = CameraManager()
        self.blink_detector = BlinkDetectorOpenCV(self.db_manager)  # OpenCV version!
        self.web_server = WebServer(self.db_manager, self.camera_manager, self.blink_detector)
        self.system_tray = SystemTrayApp(self)
        
        # Application state
        self.is_running = False
        self.is_tracking = False
        self.tracking_thread = None
        
        self.logger.info("Eye Blink Tracker initialized (OpenCV mode)")
    
    def start_tracking(self):
        """Start eye blink tracking"""
        if self.is_tracking:
            self.logger.warning("Tracking already in progress")
            return False
            
        try:
            if not self.camera_manager.is_camera_available():
                self.logger.error("No camera available for tracking")
                return False
                
            self.is_tracking = True
            self.tracking_thread = threading.Thread(target=self._tracking_loop, daemon=True)
            self.tracking_thread.start()
            
            self.logger.info("Eye blink tracking started (OpenCV mode)")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to start tracking: {e}")
            self.is_tracking = False
            return False
    
    def pause_tracking(self):
        """Pause eye blink tracking"""
        if not self.is_tracking:
            self.logger.warning("No tracking in progress to pause")
            return False
            
        self.blink_detector.pause()
        self.logger.info("Eye blink tracking paused")
        return True
    
    def resume_tracking(self):
        """Resume eye blink tracking"""
        if not self.is_tracking:
            self.logger.warning("No tracking in progress to resume")
            return False
            
        self.blink_detector.resume()
        self.logger.info("Eye blink tracking resumed")
        return True
    
    def stop_tracking(self):
        """Stop eye blink tracking"""
        if not self.is_tracking:
            self.logger.warning("No tracking in progress to stop")
            return False
            
        self.is_tracking = False
        self.blink_detector.stop()
        
        if self.tracking_thread and self.tracking_thread.is_alive():
            self.tracking_thread.join(timeout=5)
            
        self.logger.info("Eye blink tracking stopped")
        return True
    
    def _tracking_loop(self):
        """Main tracking loop that runs in a separate thread"""
        try:
            # Get or select active camera
            camera = self.camera_manager.get_active_camera()
            if not camera:
                self.logger.info("No active camera, auto-selecting best camera...")
                if not self.camera_manager.auto_select_best_camera():
                    self.logger.error("Failed to select a camera")
                    self.is_tracking = False
                    return
                camera = self.camera_manager.get_active_camera()
                
            if not camera:
                self.logger.error("Failed to get active camera")
                self.is_tracking = False
                return
                
            self.logger.info("Starting detection with camera (OpenCV mode)")
            self.blink_detector.start_detection(camera)
            
            frame_count = 0
            failed_frames = 0
            
            while self.is_tracking:
                try:
                    # Read frame directly from camera
                    ret, frame = camera.read()
                    if not ret or frame is None:
                        failed_frames += 1
                        if failed_frames > 30:
                            self.logger.error("Too many failed frame reads, stopping tracking")
                            break
                        time.sleep(0.1)
                        continue
                    
                    failed_frames = 0  # Reset on successful read
                    frame_count += 1
                    
                    # Process frame for blink detection
                    if not self.blink_detector.process_frame(frame):
                        self.logger.debug("Frame processing returned False")
                        
                    # Broadcast updates to web dashboard every 30 frames (~1 second)
                    if frame_count % 30 == 0:
                        self.web_server.broadcast_status_update()
                        
                    # Log progress periodically
                    if frame_count % 100 == 0:
                        stats = self.blink_detector.get_stats()
                        self.logger.info(f"Processed {frame_count} frames | "
                                       f"Blinks: {stats.get('session_blinks', 0)} | "
                                       f"Eyes: {stats.get('eyes_detected', False)}")
                        
                    # Small delay for ~30 FPS
                    time.sleep(0.033)
                    
                except Exception as e:
                    self.logger.error(f"Error processing frame: {e}", exc_info=True)
                    time.sleep(0.1)
                
        except Exception as e:
            self.logger.error(f"Error in tracking loop: {e}", exc_info=True)
        finally:
            self.logger.info("Tracking loop ending, releasing camera")
            self.camera_manager.release_camera()
            self.is_tracking = False
            # Notify web dashboard that tracking stopped
            self.web_server.broadcast_status_update()
    
    def get_status(self):
        """Get current application status"""
        return {
            'is_running': self.is_running,
            'is_tracking': self.is_tracking,
            'camera_available': self.camera_manager.is_camera_available(),
            'active_camera': self.camera_manager.get_active_camera_info(),
            'tracking_stats': self.blink_detector.get_stats()
        }
    
    def run(self):
        """Run the application"""
        try:
            self.is_running = True
            self.logger.info("Starting Eye Blink Tracker application (OpenCV mode)")
            
            # Start web server in a separate thread
            web_thread = threading.Thread(target=self.web_server.run, daemon=True)
            web_thread.start()
            
            self.logger.info("Web dashboard starting at http://localhost:5000")
            print("\n" + "="*60)
            print("Eye Blink Tracker - OpenCV Mode")
            print("="*60)
            print("Web Dashboard: http://localhost:5000")
            print("System Tray: Look for the eye icon")
            print("="*60)
            
            # Give web server a moment to start
            time.sleep(2)
            
            # Start system tray (this will block until user exits)
            self.system_tray.run()
            
        except Exception as e:
            self.logger.error(f"Application error: {e}")
            raise
        finally:
            self.shutdown()
    
    def shutdown(self):
        """Shutdown the application gracefully"""
        self.logger.info("Shutting down Eye Blink Tracker")
        
        self.stop_tracking()
        self.is_running = False
        
        if hasattr(self, 'web_server'):
            self.web_server.shutdown()
            
        if hasattr(self, 'db_manager'):
            self.db_manager.close()
            
        self.logger.info("Application shutdown complete")
