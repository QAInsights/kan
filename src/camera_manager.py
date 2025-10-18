"""
Camera Manager for handling camera detection, selection, and access
"""

import cv2
import logging
from typing import List, Dict, Optional, Tuple

class CameraManager:
    """Manages camera detection, selection, and access for the application"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.active_camera = None
        self.active_camera_index = None
        self.available_cameras = []
        self._refresh_cameras()
    
    def _refresh_cameras(self):
        """Scan for available cameras in the system"""
        self.available_cameras = []
        self.logger.info("Scanning for available cameras...")
        
        # Test camera indices 0-10 (most systems won't have more than this)
        for index in range(10):
            try:
                cap = cv2.VideoCapture(index)
                if cap.isOpened():
                    # Try to read a frame to verify camera is working
                    ret, frame = cap.read()
                    if ret and frame is not None:
                        # Get camera properties
                        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                        fps = int(cap.get(cv2.CAP_PROP_FPS))
                        
                        camera_info = {
                            'index': index,
                            'name': f"Camera {index}",
                            'resolution': f"{width}x{height}",
                            'fps': fps,
                            'is_available': True
                        }
                        
                        # Try to get more detailed information on Windows
                        try:
                            backend = cap.getBackendName()
                            camera_info['backend'] = backend
                        except:
                            camera_info['backend'] = "Unknown"
                        
                        self.available_cameras.append(camera_info)
                        self.logger.info(f"Found camera {index}: {width}x{height} @ {fps}fps")
                        
                cap.release()
                
            except Exception as e:
                self.logger.debug(f"Camera {index} not available: {e}")
                continue
        
        self.logger.info(f"Found {len(self.available_cameras)} available cameras")
        return self.available_cameras
    
    def get_available_cameras(self) -> List[Dict]:
        """Get list of available cameras with their properties"""
        return self.available_cameras.copy()
    
    def select_camera(self, camera_index: int) -> bool:
        """Select a specific camera for use"""
        try:
            # Release current camera if active
            if self.active_camera:
                self.release_camera()
            
            # Check if camera index is valid
            available_indices = [cam['index'] for cam in self.available_cameras]
            if camera_index not in available_indices:
                self.logger.error(f"Camera index {camera_index} not available")
                return False
            
            # Try to open the camera
            cap = cv2.VideoCapture(camera_index)
            if not cap.isOpened():
                self.logger.error(f"Failed to open camera {camera_index}")
                return False
            
            # Test if we can read from the camera
            ret, frame = cap.read()
            if not ret or frame is None:
                self.logger.error(f"Cannot read from camera {camera_index}")
                cap.release()
                return False
            
            # Configure camera for optimal performance
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            cap.set(cv2.CAP_PROP_FPS, 30)
            
            # Set buffer size to reduce latency
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            
            self.active_camera = cap
            self.active_camera_index = camera_index
            
            self.logger.info(f"Camera {camera_index} selected and configured")
            return True
            
        except Exception as e:
            self.logger.error(f"Error selecting camera {camera_index}: {e}")
            return False
    
    def get_active_camera(self) -> Optional[cv2.VideoCapture]:
        """Get the currently active camera object"""
        return self.active_camera
    
    def get_active_camera_info(self) -> Optional[Dict]:
        """Get information about the currently active camera"""
        if self.active_camera_index is None:
            return None
            
        for cam in self.available_cameras:
            if cam['index'] == self.active_camera_index:
                return cam.copy()
        
        return None
    
    def is_camera_available(self) -> bool:
        """Check if any camera is available"""
        return len(self.available_cameras) > 0
    
    def is_camera_active(self) -> bool:
        """Check if a camera is currently active"""
        return self.active_camera is not None and self.active_camera.isOpened()
    
    def release_camera(self):
        """Release the currently active camera"""
        if self.active_camera:
            try:
                self.active_camera.release()
                self.logger.info(f"Camera {self.active_camera_index} released")
            except Exception as e:
                self.logger.error(f"Error releasing camera: {e}")
            finally:
                self.active_camera = None
                self.active_camera_index = None
    
    def capture_frame(self) -> Optional[Tuple[bool, any]]:
        """Capture a frame from the active camera"""
        if not self.is_camera_active():
            return None
            
        try:
            ret, frame = self.active_camera.read()
            return (ret, frame) if ret else None
        except Exception as e:
            self.logger.error(f"Error capturing frame: {e}")
            return None
    
    def get_camera_properties(self, camera_index: int = None) -> Dict:
        """Get detailed properties of a camera"""
        index = camera_index if camera_index is not None else self.active_camera_index
        
        if index is None:
            return {}
        
        try:
            cap = cv2.VideoCapture(index) if camera_index is not None else self.active_camera
            if not cap.isOpened():
                return {}
            
            properties = {
                'width': int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
                'height': int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
                'fps': int(cap.get(cv2.CAP_PROP_FPS)),
                'brightness': cap.get(cv2.CAP_PROP_BRIGHTNESS),
                'contrast': cap.get(cv2.CAP_PROP_CONTRAST),
                'saturation': cap.get(cv2.CAP_PROP_SATURATION),
                'hue': cap.get(cv2.CAP_PROP_HUE),
                'gain': cap.get(cv2.CAP_PROP_GAIN),
                'exposure': cap.get(cv2.CAP_PROP_EXPOSURE),
            }
            
            if camera_index is not None:
                cap.release()
            
            return properties
            
        except Exception as e:
            self.logger.error(f"Error getting camera properties: {e}")
            return {}
    
    def auto_select_best_camera(self) -> bool:
        """Automatically select the best available camera"""
        if not self.available_cameras:
            self.logger.warning("No cameras available for auto-selection")
            return False
        
        # For now, select the first available camera
        # In the future, this could include logic to select based on resolution, FPS, etc.
        best_camera = self.available_cameras[0]
        return self.select_camera(best_camera['index'])
    
    def refresh_and_get_cameras(self) -> List[Dict]:
        """Refresh camera list and return updated list"""
        self._refresh_cameras()
        return self.get_available_cameras()
