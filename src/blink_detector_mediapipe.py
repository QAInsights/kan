"""
Blink Detection using MediaPipe Face Mesh - Python Version
Identical to the web app implementation
Implements Eye Aspect Ratio (EAR) algorithm with adaptive thresholding
"""

import cv2
import numpy as np
import time
import logging
from typing import Optional, Dict, Tuple
import mediapipe as mp


class BlinkDetectorMediaPipe:
    """
    Blink detector using MediaPipe Face Mesh
    Identical implementation to the web app
    """
    
    # Eye landmark indices for MediaPipe Face Mesh (same as web app)
    LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144]
    RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380]
    
    def __init__(self, db_manager=None):
        self.logger = logging.getLogger(__name__)
        self.db_manager = db_manager
        
        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Detection parameters - identical to web app
        self.EAR_THRESHOLD = 0.25
        self.CONSECUTIVE_FRAMES = 1
        self.MIN_BLINK_DURATION = 30  # ms
        self.MAX_BLINK_DURATION = 500  # ms
        self.EAR_DROP_THRESHOLD = 0.08
        self.GLASSES_MODE = False
        self.GLASSES_EAR_DROP = 0.06
        
        # State tracking
        self.blink_counter = 0
        self.frame_counter = 0
        self.open_frame_counter = 0
        self.is_blinking = False
        self.eyes_closed = False
        self.eyes_closed_start_time = None
        
        # EAR history for smoothing
        self.ear_history = []
        self.ear_history_size = 3
        
        # Baseline tracking for adaptive detection
        self.baseline_ear = 0
        self.baseline_history = []
        self.baseline_history_size = 30
        
        # Statistics
        self.total_blinks = 0
        self.session_start_time = None
        self.last_blink_time = None
        self.session_id = None
        
        # Debug mode
        self.debug_mode = False
        self.current_ear = 0
        self.use_adaptive_threshold = True
        
        # Pause state
        self.is_paused = False
        self.is_detecting = False  # Track if detection is active
        
        self.logger.info("MediaPipe Blink Detector initialized (identical to web app)")
    
    def calculate_ear(self, eye_landmarks: np.ndarray) -> float:
        """
        Calculate Eye Aspect Ratio (EAR)
        Same formula as web app
        
        Args:
            eye_landmarks: Array of 6 eye landmark points
            
        Returns:
            Eye Aspect Ratio value
        """
        # Vertical distances
        v1 = np.linalg.norm(eye_landmarks[1] - eye_landmarks[5])
        v2 = np.linalg.norm(eye_landmarks[2] - eye_landmarks[4])
        
        # Horizontal distance
        h = np.linalg.norm(eye_landmarks[0] - eye_landmarks[3])
        
        # EAR formula
        if h == 0:
            return 0
        
        ear = (v1 + v2) / (2.0 * h)
        return ear
    
    def get_eye_landmarks(self, face_landmarks, image_shape) -> Tuple[np.ndarray, np.ndarray]:
        """
        Extract eye landmarks from face mesh
        
        Args:
            face_landmarks: MediaPipe face landmarks
            image_shape: Shape of the image (height, width)
            
        Returns:
            Tuple of (left_eye_landmarks, right_eye_landmarks)
        """
        h, w = image_shape[:2]
        
        # Extract left eye landmarks
        left_eye = np.array([
            [face_landmarks.landmark[i].x * w, face_landmarks.landmark[i].y * h]
            for i in self.LEFT_EYE_INDICES
        ])
        
        # Extract right eye landmarks
        right_eye = np.array([
            [face_landmarks.landmark[i].x * w, face_landmarks.landmark[i].y * h]
            for i in self.RIGHT_EYE_INDICES
        ])
        
        return left_eye, right_eye
    
    def update_baseline(self, ear: float):
        """
        Update baseline EAR for adaptive thresholding
        Same as web app
        """
        if not self.use_adaptive_threshold:
            return
        
        # Only update baseline when eyes are open
        if ear > self.EAR_THRESHOLD:
            self.baseline_history.append(ear)
            
            # Keep only recent history
            if len(self.baseline_history) > self.baseline_history_size:
                self.baseline_history.pop(0)
            
            # Calculate baseline as average of history
            if len(self.baseline_history) > 0:
                self.baseline_ear = sum(self.baseline_history) / len(self.baseline_history)
    
    def get_adaptive_threshold(self) -> float:
        """
        Get adaptive threshold based on baseline
        Same as web app
        """
        if not self.use_adaptive_threshold or self.baseline_ear == 0:
            return self.EAR_THRESHOLD
        
        # Adaptive threshold is baseline minus drop threshold
        drop_threshold = self.GLASSES_EAR_DROP if self.GLASSES_MODE else self.EAR_DROP_THRESHOLD
        adaptive_threshold = self.baseline_ear - drop_threshold
        
        # Ensure threshold is reasonable
        adaptive_threshold = max(0.15, min(0.30, adaptive_threshold))
        
        return adaptive_threshold
    
    def smooth_ear(self, ear: float) -> float:
        """
        Smooth EAR using moving average
        Same as web app
        """
        self.ear_history.append(ear)
        
        # Keep only recent history
        if len(self.ear_history) > self.ear_history_size:
            self.ear_history.pop(0)
        
        # Return average
        return sum(self.ear_history) / len(self.ear_history)
    
    def process_frame(self, frame: np.ndarray) -> bool:
        """
        Process a frame for blink detection
        Identical logic to web app
        
        Args:
            frame: BGR image from camera
            
        Returns:
            True if processing successful, False otherwise
        """
        if self.is_paused:
            return False
        
        if frame is None:
            return False
        
        # Convert BGR to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = self.face_mesh.process(rgb_frame)
        
        if not results.multi_face_landmarks:
            # No face detected
            self.current_ear = 0
            return False
        
        # Get first face
        face_landmarks = results.multi_face_landmarks[0]
        
        # Extract eye landmarks
        left_eye, right_eye = self.get_eye_landmarks(face_landmarks, frame.shape)
        
        # Calculate EAR for both eyes
        left_ear = self.calculate_ear(left_eye)
        right_ear = self.calculate_ear(right_eye)
        
        # Average EAR
        ear = (left_ear + right_ear) / 2.0
        
        # Smooth EAR
        ear = self.smooth_ear(ear)
        self.current_ear = ear
        
        # Update baseline
        self.update_baseline(ear)
        
        # Get adaptive threshold
        threshold = self.get_adaptive_threshold()
        
        # Blink detection logic (same as web app)
        current_time = time.time() * 1000  # Convert to ms
        
        if ear < threshold:
            # Eyes closed
            if not self.eyes_closed:
                self.eyes_closed = True
                self.eyes_closed_start_time = current_time
                self.open_frame_counter = 0
            
            self.frame_counter += 1
        else:
            # Eyes open
            if self.eyes_closed:
                # Eyes just opened
                blink_duration = current_time - self.eyes_closed_start_time
                
                # Check if it's a valid blink
                if (self.MIN_BLINK_DURATION <= blink_duration <= self.MAX_BLINK_DURATION and
                    self.frame_counter >= self.CONSECUTIVE_FRAMES):
                    
                    # Valid blink detected!
                    self.blink_counter += 1
                    self.total_blinks += 1
                    self.last_blink_time = current_time
                    
                    if self.debug_mode:
                        self.logger.info(f"Blink detected! Duration: {blink_duration:.0f}ms, "
                                       f"EAR: {ear:.3f}, Threshold: {threshold:.3f}")
                    
                    # Save to database
                    if self.db_manager and self.session_id:
                        self._save_blink(ear, threshold)
                    
                    # Callback
                    self._on_blink_detected()
                
                # Reset state
                self.eyes_closed = False
                self.eyes_closed_start_time = None
                self.frame_counter = 0
            
            self.open_frame_counter += 1
        
        return True
    
    def _save_blink(self, ear: float, threshold: float):
        """Save blink to database"""
        try:
            self.db_manager.add_blink(
                session_id=self.session_id,
                ear_value=ear,
                threshold=threshold
            )
        except Exception as e:
            self.logger.error(f"Error saving blink: {e}")
    
    def _on_blink_detected(self):
        """Handle blink detection event"""
        # This can be extended for callbacks
        pass
    
    def start_detection(self, camera=None):
        """Start a new detection session"""
        self.session_start_time = time.time()
        self.blink_counter = 0
        self.total_blinks = 0
        self.is_detecting = True
        
        # Create new session in database
        if self.db_manager:
            try:
                self.session_id = self.db_manager.create_session()
                self.logger.info(f"Started new session: {self.session_id}")
            except Exception as e:
                self.logger.error(f"Error creating session: {e}")
    
    def stop(self):
        """Stop detection and end session"""
        self.is_detecting = False
        
        if self.session_id and self.db_manager:
            try:
                self.db_manager.end_session(self.session_id)
                self.logger.info(f"Ended session: {self.session_id}")
            except Exception as e:
                self.logger.error(f"Error ending session: {e}")
        
        self.session_id = None
    
    def stop_detection(self):
        """Alias for stop() to match OpenCV detector interface"""
        self.stop()
    
    def pause(self):
        """Pause detection"""
        self.is_paused = True
        self.logger.info("Detection paused")
    
    def resume(self):
        """Resume detection"""
        self.is_paused = False
        self.logger.info("Detection resumed")
    
    def get_stats(self) -> Dict:
        """
        Get current statistics
        Same format as web app
        """
        duration = 0
        blinks_per_minute = 0
        
        if self.session_start_time:
            duration = int(time.time() - self.session_start_time)
            if duration > 0:
                blinks_per_minute = (self.blink_counter / duration) * 60
        
        return {
            'session_blinks': int(self.blink_counter),
            'total_blinks': int(self.total_blinks),
            'session_duration': int(duration),
            'blinks_per_minute': float(round(blinks_per_minute, 1)),
            'current_ear': float(round(self.current_ear, 3)),
            'baseline_ear': float(round(self.baseline_ear, 3)),
            'active_threshold': float(round(self.get_adaptive_threshold(), 3)),
            'eyes_detected': bool(self.current_ear > 0),
            'is_paused': bool(self.is_paused)
        }
    
    def set_threshold(self, threshold: float):
        """Set EAR threshold"""
        self.EAR_THRESHOLD = threshold
        self.logger.info(f"EAR threshold set to {threshold}")
    
    def set_consecutive_frames(self, frames: int):
        """Set consecutive frames required"""
        self.CONSECUTIVE_FRAMES = frames
        self.logger.info(f"Consecutive frames set to {frames}")
    
    def set_glasses_mode(self, enabled: bool):
        """Enable/disable glasses mode"""
        self.GLASSES_MODE = enabled
        self.logger.info(f"Glasses mode: {'enabled' if enabled else 'disabled'}")
    
    def set_debug_mode(self, enabled: bool):
        """Enable/disable debug mode"""
        self.debug_mode = enabled
        self.logger.info(f"Debug mode: {'enabled' if enabled else 'disabled'}")
    
    def set_adaptive_threshold(self, enabled: bool):
        """Enable/disable adaptive thresholding"""
        self.use_adaptive_threshold = enabled
        self.logger.info(f"Adaptive threshold: {'enabled' if enabled else 'disabled'}")
    
    def __del__(self):
        """Cleanup"""
        if hasattr(self, 'face_mesh'):
            self.face_mesh.close()
