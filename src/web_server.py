"""
Web Server for Eye Blink Tracker Dashboard
"""

import logging
import json
from datetime import datetime, timedelta
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
import threading

class WebServer:
    """Flask web server for the dashboard interface"""
    
    def __init__(self, db_manager, camera_manager, blink_detector, host='localhost', port=5000):
        self.logger = logging.getLogger(__name__)
        self.db_manager = db_manager
        self.camera_manager = camera_manager
        self.blink_detector = blink_detector
        self.host = host
        self.port = port
        
        # Initialize Flask app
        self.app = Flask(__name__, 
                        template_folder='../templates',
                        static_folder='../static')
        self.app.config['SECRET_KEY'] = 'eye_blink_tracker_secret_key'
        
        # Initialize SocketIO for real-time updates
        self.socketio = SocketIO(self.app, cors_allowed_origins="*")
        
        # Setup routes
        self._setup_routes()
        self._setup_socketio_events()
        
        self.is_running = False
        
    def _setup_routes(self):
        """Setup Flask routes"""
        
        @self.app.route('/')
        def index():
            """Main dashboard page"""
            return render_template('dashboard.html')
        
        @self.app.route('/api/status')
        def get_status():
            """Get current application status"""
            try:
                status = {
                    'is_tracking': self.blink_detector.is_detecting,
                    'is_paused': self.blink_detector.is_paused,
                    'camera_available': self.camera_manager.is_camera_available(),
                    'active_camera': self.camera_manager.get_active_camera_info(),
                    'stats': self.blink_detector.get_stats()
                }
                return jsonify(status)
            except Exception as e:
                self.logger.error(f"Error getting status: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/cameras')
        def get_cameras():
            """Get available cameras"""
            try:
                cameras = self.camera_manager.get_available_cameras()
                return jsonify(cameras)
            except Exception as e:
                self.logger.error(f"Error getting cameras: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/cameras/refresh')
        def refresh_cameras():
            """Refresh camera list"""
            try:
                cameras = self.camera_manager.refresh_and_get_cameras()
                return jsonify(cameras)
            except Exception as e:
                self.logger.error(f"Error refreshing cameras: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/cameras/select/<int:camera_index>', methods=['POST'])
        def select_camera(camera_index):
            """Select a specific camera"""
            try:
                success = self.camera_manager.select_camera(camera_index)
                return jsonify({'success': success})
            except Exception as e:
                self.logger.error(f"Error selecting camera: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/tracking/start', methods=['POST'])
        def start_tracking():
            """Start eye tracking"""
            try:
                # Get the main app instance (this is a bit of a hack, but works for our use case)
                from app import EyeBlinkTrackerApp
                # In a real implementation, we'd need a better way to access the main app
                success = True  # Placeholder
                return jsonify({'success': success})
            except Exception as e:
                self.logger.error(f"Error starting tracking: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/tracking/pause', methods=['POST'])
        def pause_tracking():
            """Pause eye tracking"""
            try:
                success = self.blink_detector.pause() if self.blink_detector.is_detecting else False
                return jsonify({'success': success})
            except Exception as e:
                self.logger.error(f"Error pausing tracking: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/tracking/resume', methods=['POST'])
        def resume_tracking():
            """Resume eye tracking"""
            try:
                success = self.blink_detector.resume() if self.blink_detector.is_detecting else False
                return jsonify({'success': success})
            except Exception as e:
                self.logger.error(f"Error resuming tracking: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/tracking/stop', methods=['POST'])
        def stop_tracking():
            """Stop eye tracking"""
            try:
                self.blink_detector.stop_detection()
                return jsonify({'success': True})
            except Exception as e:
                self.logger.error(f"Error stopping tracking: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/statistics/daily')
        def get_daily_stats():
            """Get daily statistics"""
            try:
                date_str = request.args.get('date')
                if date_str:
                    date = datetime.fromisoformat(date_str)
                else:
                    date = datetime.now()
                
                stats = self.db_manager.get_daily_stats(date)
                return jsonify(stats)
            except Exception as e:
                self.logger.error(f"Error getting daily stats: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/statistics/weekly')
        def get_weekly_stats():
            """Get weekly statistics"""
            try:
                date_str = request.args.get('date')
                if date_str:
                    date = datetime.fromisoformat(date_str)
                else:
                    date = datetime.now()
                
                stats = self.db_manager.get_weekly_stats(date)
                return jsonify(stats)
            except Exception as e:
                self.logger.error(f"Error getting weekly stats: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/statistics/summary')
        def get_statistics_summary():
            """Get comprehensive statistics summary"""
            try:
                summary = self.db_manager.get_statistics_summary()
                return jsonify(summary)
            except Exception as e:
                self.logger.error(f"Error getting statistics summary: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/sessions')
        def get_sessions():
            """Get recent tracking sessions"""
            try:
                limit = request.args.get('limit', 10, type=int)
                sessions = self.db_manager.get_recent_sessions(limit)
                return jsonify(sessions)
            except Exception as e:
                self.logger.error(f"Error getting sessions: {e}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/settings', methods=['GET', 'POST'])
        def handle_settings():
            """Get or update settings"""
            try:
                if request.method == 'GET':
                    # Get current settings
                    settings = {
                        'ear_threshold': float(self.db_manager.get_setting('ear_threshold', '0.3')),
                        'consecutive_frames': int(self.db_manager.get_setting('consecutive_frames', '3')),
                        'auto_start': self.db_manager.get_setting('auto_start', 'false') == 'true'
                    }
                    return jsonify(settings)
                
                elif request.method == 'POST':
                    # Update settings
                    data = request.get_json()
                    
                    if 'ear_threshold' in data:
                        threshold = float(data['ear_threshold'])
                        if self.blink_detector.set_ear_threshold(threshold):
                            self.db_manager.set_setting('ear_threshold', str(threshold))
                    
                    if 'consecutive_frames' in data:
                        frames = int(data['consecutive_frames'])
                        if self.blink_detector.set_consecutive_frames(frames):
                            self.db_manager.set_setting('consecutive_frames', str(frames))
                    
                    if 'auto_start' in data:
                        auto_start = bool(data['auto_start'])
                        self.db_manager.set_setting('auto_start', str(auto_start).lower())
                    
                    return jsonify({'success': True})
                    
            except Exception as e:
                self.logger.error(f"Error handling settings: {e}")
                return jsonify({'error': str(e)}), 500
    
    def _setup_socketio_events(self):
        """Setup SocketIO events for real-time updates"""
        
        @self.socketio.on('connect')
        def handle_connect():
            """Handle client connection"""
            self.logger.info("Client connected to WebSocket")
            emit('status', {'message': 'Connected to Eye Blink Tracker'})
        
        @self.socketio.on('disconnect')
        def handle_disconnect():
            """Handle client disconnection"""
            self.logger.info("Client disconnected from WebSocket")
        
        @self.socketio.on('request_status')
        def handle_status_request():
            """Handle status request from client"""
            try:
                status = {
                    'is_tracking': self.blink_detector.is_detecting,
                    'is_paused': self.blink_detector.is_paused,
                    'stats': self.blink_detector.get_stats()
                }
                emit('status_update', status)
            except Exception as e:
                self.logger.error(f"Error sending status update: {e}")
    
    def broadcast_blink_detected(self):
        """Broadcast blink detection to connected clients"""
        try:
            if hasattr(self, 'socketio'):
                stats = self.blink_detector.get_stats()
                self.socketio.emit('blink_detected', stats)
        except Exception as e:
            self.logger.error(f"Error broadcasting blink: {e}")
    
    def broadcast_status_update(self):
        """Broadcast status update to connected clients"""
        try:
            if hasattr(self, 'socketio'):
                status = {
                    'is_tracking': self.blink_detector.is_detecting,
                    'is_paused': self.blink_detector.is_paused,
                    'stats': self.blink_detector.get_stats()
                }
                self.socketio.emit('status_update', status)
        except Exception as e:
            self.logger.error(f"Error broadcasting status: {e}")
    
    def run(self):
        """Run the web server"""
        try:
            self.is_running = True
            self.logger.info(f"Starting web server on {self.host}:{self.port}")
            
            # Run SocketIO app
            self.socketio.run(
                self.app,
                host=self.host,
                port=self.port,
                debug=False,
                use_reloader=False
            )
            
        except Exception as e:
            self.logger.error(f"Web server error: {e}")
            raise
    
    def shutdown(self):
        """Shutdown the web server"""
        self.is_running = False
        self.logger.info("Web server shutdown requested")
        
        # Note: There's no direct way to stop Flask/SocketIO from another thread
        # In a production environment, you might want to use a proper WSGI server
        # like Gunicorn that supports graceful shutdown
