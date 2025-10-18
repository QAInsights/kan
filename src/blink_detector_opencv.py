"""
Eye Blink Detection using ONLY OpenCV (no dlib required)
This version uses OpenCV's eye detection for blink tracking
"""

import cv2
import numpy as np
import logging
from typing import Optional, Dict
from datetime import datetime

class BlinkDetectorOpenCV:
    """Eye blink detection using OpenCV's Haar Cascades only"""
    
    def __init__(self, db_manager, blink_threshold=3, consecutive_frames=2):
        self.logger = logging.getLogger(__name__)
        self.db_manager = db_manager
        
        # Blink detection parameters
        self.BLINK_THRESHOLD = blink_threshold  # Frames without eyes detected
        self.CONSECUTIVE_FRAMES = consecutive_frames
        
        # Detection state
        self.frames_without_eyes = 0
        self.frames_with_eyes = 0
        self.total_blinks = 0
        self.session_start_time = None
        self.last_blink_time = None
        self.prev_eye_detected = True
        
        # Control state
        self.is_detecting = False
        self.is_paused = False
        
        # Initialize OpenCV detectors
        self.face_cascade = None
        self.eye_cascade = None
        self._initialize_models()
        
        # Statistics
        self.stats = {
            'total_blinks': 0,
            'session_blinks': 0,
            'blinks_per_minute': 0,
            'session_duration': 0,
            'last_blink_time': None,
            'eyes_detected': False
        }
    
    def _initialize_models(self):
        """Initialize OpenCV Haar Cascade detectors"""
        try:
            # Load face detector
            face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.face_cascade = cv2.CascadeClassifier(face_cascade_path)
            
            if self.face_cascade.empty():
                raise Exception("Could not load face cascade")
            
            # Load eye detector
            eye_cascade_path = cv2.data.haarcascades + 'haarcascade_eye.xml'
            self.eye_cascade = cv2.CascadeClassifier(eye_cascade_path)
            
            if self.eye_cascade.empty():
                raise Exception("Could not load eye cascade")
            
            self.logger.info("OpenCV detectors initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Error initializing OpenCV detectors: {e}")
            raise
    
    def detect_eyes(self, frame):
        """Detect eyes in the frame using OpenCV"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(50, 50),
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            
            if len(faces) == 0:
                return False, 0
            
            # Use the first detected face
            (x, y, w, h) = faces[0]
            roi_gray = gray[y:y+h, x:x+w]
            
            # Detect eyes in the face region
            eyes = self.eye_cascade.detectMultiScale(
                roi_gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(20, 20)
            )
            
            num_eyes = len(eyes)
            
            # We expect to see 2 eyes
            eyes_detected = num_eyes >= 1  # At least 1 eye visible
            
            return eyes_detected, num_eyes
            
        except Exception as e:
            self.logger.debug(f"Error detecting eyes: {e}")
            return False, 0
    
    def process_frame(self, frame=None) -> bool:
        """Process a single frame for blink detection"""
        if self.is_paused or not self.is_detecting:
            return True
            
        try:
            # If no frame provided, capture from camera
            if frame is None:
                if not hasattr(self, 'camera') or self.camera is None:
                    return False
                    
                ret, frame = self.camera.read()
                if not ret or frame is None:
                    return False
            
            # Detect eyes
            eyes_detected, num_eyes = self.detect_eyes(frame)
            
            # Update statistics
            self.stats['eyes_detected'] = eyes_detected
            
            # Blink detection logic
            if not eyes_detected and self.prev_eye_detected:
                # Eyes just closed
                self.frames_without_eyes = 0
                self.frames_with_eyes = 0
            
            if not eyes_detected:
                # Eyes are closed
                self.frames_without_eyes += 1
            else:
                # Eyes are open
                if self.frames_without_eyes >= self.CONSECUTIVE_FRAMES:
                    # A blink just completed
                    self._register_blink()
                
                self.frames_without_eyes = 0
                self.frames_with_eyes += 1
            
            self.prev_eye_detected = eyes_detected
            
            # Update session statistics
            self._update_session_stats()
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error processing frame: {e}")
            return False
    
    def _register_blink(self):
        """Register a detected blink"""
        try:
            self.total_blinks += 1
            self.stats['session_blinks'] += 1
            self.stats['total_blinks'] = self.total_blinks
            
            current_time = datetime.now()
            self.last_blink_time = current_time
            self.stats['last_blink_time'] = current_time.isoformat()
            
            # Save blink to database
            self.db_manager.record_blink(current_time)
            
            self.logger.info(f"Blink detected! Total: {self.total_blinks}")
            
        except Exception as e:
            self.logger.error(f"Error registering blink: {e}")
    
    def _update_session_stats(self):
        """Update session statistics"""
        try:
            if self.session_start_time:
                session_duration = (datetime.now() - self.session_start_time).total_seconds()
                self.stats['session_duration'] = session_duration
                
                # Calculate blinks per minute
                if session_duration > 0:
                    self.stats['blinks_per_minute'] = (self.stats['session_blinks'] * 60) / session_duration
                    
        except Exception as e:
            self.logger.debug(f"Error updating session stats: {e}")
    
    def start_detection(self, camera):
        """Start blink detection with the given camera"""
        try:
            self.camera = camera
            self.is_detecting = True
            self.is_paused = False
            self.session_start_time = datetime.now()
            self.stats['session_blinks'] = 0
            self.frames_without_eyes = 0
            self.frames_with_eyes = 0
            self.prev_eye_detected = True
            
            # Load total blinks from database
            self.total_blinks = self.db_manager.get_total_blinks()
            self.stats['total_blinks'] = self.total_blinks
            
            self.logger.info("Blink detection started (OpenCV mode)")
            
        except Exception as e:
            self.logger.error(f"Error starting detection: {e}")
            self.is_detecting = False
    
    def stop_detection(self):
        """Stop blink detection"""
        self.is_detecting = False
        self.is_paused = False
        self.camera = None
        
        # Save session statistics
        if self.session_start_time:
            session_data = {
                'start_time': self.session_start_time,
                'end_time': datetime.now(),
                'total_blinks': self.stats['session_blinks'],
                'duration': self.stats['session_duration']
            }
            self.db_manager.save_session(session_data)
        
        self.logger.info("Blink detection stopped")
    
    def pause(self):
        """Pause blink detection"""
        self.is_paused = True
        self.logger.info("Blink detection paused")
    
    def resume(self):
        """Resume blink detection"""
        self.is_paused = False
        self.logger.info("Blink detection resumed")
    
    def stop(self):
        """Stop blink detection (alias for stop_detection)"""
        self.stop_detection()
    
    def get_stats(self) -> Dict:
        """Get current detection statistics"""
        return self.stats.copy()
    
    def reset_session_stats(self):
        """Reset session statistics"""
        self.stats['session_blinks'] = 0
        self.stats['session_duration'] = 0
        self.stats['blinks_per_minute'] = 0
        self.session_start_time = datetime.now()
        self.logger.info("Session statistics reset")
    
    def set_blink_threshold(self, threshold: int):
        """Set the blink threshold (frames without eyes)"""
        if 1 <= threshold <= 10:
            self.BLINK_THRESHOLD = threshold
            self.logger.info(f"Blink threshold set to {threshold}")
            return True
        else:
            self.logger.warning(f"Invalid blink threshold: {threshold}. Must be between 1 and 10")
            return False
    
    def set_consecutive_frames(self, frames: int):
        """Set the number of consecutive frames for blink detection"""
        if 1 <= frames <= 10:
            self.CONSECUTIVE_FRAMES = frames
            self.logger.info(f"Consecutive frames set to {frames}")
            return True
        else:
            self.logger.warning(f"Invalid consecutive frames: {frames}. Must be between 1 and 10")
            return False
    
    # Compatibility methods with dlib version
    def set_ear_threshold(self, threshold: float):
        """Compatibility method - converts EAR threshold to frame threshold"""
        # Map EAR threshold (0.1-0.5) to frame threshold (1-10)
        frame_threshold = int((0.5 - threshold) * 20)
        frame_threshold = max(1, min(10, frame_threshold))
        return self.set_blink_threshold(frame_threshold)
