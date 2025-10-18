"""
System Tray Application for Eye Blink Tracker
"""

import logging
import threading
import webbrowser
from PIL import Image, ImageDraw
import pystray
from pystray import MenuItem, Icon

class SystemTrayApp:
    """System tray application for background operation"""
    
    def __init__(self, main_app):
        self.logger = logging.getLogger(__name__)
        self.main_app = main_app
        self.icon = None
        
    def create_image(self, width=64, height=64, color1='black', color2='white'):
        """Create the tray icon image"""
        try:
            # Create a simple eye icon
            image = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            draw = ImageDraw.Draw(image)
            
            # Draw eye shape
            eye_width = width * 0.8
            eye_height = height * 0.4
            eye_left = (width - eye_width) / 2
            eye_top = (height - eye_height) / 2
            
            # Outer eye (white)
            draw.ellipse([eye_left, eye_top, eye_left + eye_width, eye_top + eye_height], 
                        fill='white', outline='black', width=2)
            
            # Iris (blue)
            iris_width = eye_width * 0.5
            iris_height = eye_height * 0.8
            iris_left = eye_left + (eye_width - iris_width) / 2
            iris_top = eye_top + (eye_height - iris_height) / 2
            draw.ellipse([iris_left, iris_top, iris_left + iris_width, iris_top + iris_height], 
                        fill='lightblue', outline='darkblue', width=1)
            
            # Pupil (black)
            pupil_width = iris_width * 0.4
            pupil_height = iris_height * 0.4
            pupil_left = iris_left + (iris_width - pupil_width) / 2
            pupil_top = iris_top + (iris_height - pupil_height) / 2
            draw.ellipse([pupil_left, pupil_top, pupil_left + pupil_width, pupil_top + pupil_height], 
                        fill='black')
            
            return image
            
        except Exception as e:
            self.logger.error(f"Error creating tray icon: {e}")
            # Create a simple fallback icon
            image = Image.new('RGBA', (width, height), 'blue')
            return image
    
    def create_menu(self):
        """Create the context menu for the tray icon"""
        try:
            return pystray.Menu(
                MenuItem('Eye Blink Tracker', self.show_dashboard, default=True),
                MenuItem('Status', self.show_status),
                pystray.Menu.SEPARATOR,
                MenuItem('Start Tracking', self.start_tracking, 
                        enabled=lambda item: not self.main_app.is_tracking),
                MenuItem('Pause Tracking', self.pause_tracking, 
                        enabled=lambda item: self.main_app.is_tracking and not self.main_app.blink_detector.is_paused),
                MenuItem('Resume Tracking', self.resume_tracking, 
                        enabled=lambda item: self.main_app.is_tracking and self.main_app.blink_detector.is_paused),
                MenuItem('Stop Tracking', self.stop_tracking, 
                        enabled=lambda item: self.main_app.is_tracking),
                pystray.Menu.SEPARATOR,
                MenuItem('Settings', self.show_settings),
                MenuItem('Statistics', self.show_statistics),
                pystray.Menu.SEPARATOR,
                MenuItem('Exit', self.quit_application)
            )
            
        except Exception as e:
            self.logger.error(f"Error creating menu: {e}")
            return pystray.Menu(MenuItem('Exit', self.quit_application))
    
    def show_dashboard(self, icon, item):
        """Open the web dashboard"""
        try:
            webbrowser.open('http://localhost:5000')
        except Exception as e:
            self.logger.error(f"Error opening dashboard: {e}")
    
    def show_status(self, icon, item):
        """Show current status (could open a simple status window)"""
        try:
            status = self.main_app.get_status()
            tracking_status = "Active" if status['is_tracking'] else "Stopped"
            camera_status = "Available" if status['camera_available'] else "Not Available"
            
            message = f"Tracking: {tracking_status}\nCamera: {camera_status}"
            
            # For now, just log the status. In a full implementation,
            # you might want to show a popup or notification
            self.logger.info(f"Status requested: {message}")
            
        except Exception as e:
            self.logger.error(f"Error showing status: {e}")
    
    def start_tracking(self, icon, item):
        """Start eye tracking"""
        try:
            success = self.main_app.start_tracking()
            if success:
                self.logger.info("Tracking started from system tray")
                self.update_icon_title("Eye Blink Tracker - Tracking")
            else:
                self.logger.warning("Failed to start tracking from system tray")
        except Exception as e:
            self.logger.error(f"Error starting tracking from tray: {e}")
    
    def pause_tracking(self, icon, item):
        """Pause eye tracking"""
        try:
            success = self.main_app.pause_tracking()
            if success:
                self.logger.info("Tracking paused from system tray")
                self.update_icon_title("Eye Blink Tracker - Paused")
        except Exception as e:
            self.logger.error(f"Error pausing tracking from tray: {e}")
    
    def resume_tracking(self, icon, item):
        """Resume eye tracking"""
        try:
            success = self.main_app.resume_tracking()
            if success:
                self.logger.info("Tracking resumed from system tray")
                self.update_icon_title("Eye Blink Tracker - Tracking")
        except Exception as e:
            self.logger.error(f"Error resuming tracking from tray: {e}")
    
    def stop_tracking(self, icon, item):
        """Stop eye tracking"""
        try:
            success = self.main_app.stop_tracking()
            if success:
                self.logger.info("Tracking stopped from system tray")
                self.update_icon_title("Eye Blink Tracker")
        except Exception as e:
            self.logger.error(f"Error stopping tracking from tray: {e}")
    
    def show_settings(self, icon, item):
        """Open settings page"""
        try:
            webbrowser.open('http://localhost:5000#settings')
        except Exception as e:
            self.logger.error(f"Error opening settings: {e}")
    
    def show_statistics(self, icon, item):
        """Open statistics page"""
        try:
            webbrowser.open('http://localhost:5000#statistics')
        except Exception as e:
            self.logger.error(f"Error opening statistics: {e}")
    
    def quit_application(self, icon, item):
        """Quit the application"""
        try:
            self.logger.info("Quit requested from system tray")
            if self.icon:
                self.icon.stop()
            
            # Shutdown the main application
            if hasattr(self.main_app, 'shutdown'):
                self.main_app.shutdown()
                
        except Exception as e:
            self.logger.error(f"Error quitting application: {e}")
    
    def update_icon_title(self, title):
        """Update the icon tooltip title"""
        try:
            if self.icon:
                self.icon.title = title
        except Exception as e:
            self.logger.debug(f"Error updating icon title: {e}")
    
    def run(self):
        """Run the system tray application"""
        try:
            # Create the icon
            image = self.create_image()
            menu = self.create_menu()
            
            self.icon = Icon(
                name="EyeBlinkTracker",
                icon=image,
                title="Eye Blink Tracker",
                menu=menu
            )
            
            self.logger.info("Starting system tray application")
            
            # Run the icon (this will block until the application is quit)
            self.icon.run()
            
        except Exception as e:
            self.logger.error(f"Error running system tray: {e}")
            raise
    
    def stop(self):
        """Stop the system tray application"""
        try:
            if self.icon:
                self.icon.stop()
                self.logger.info("System tray application stopped")
        except Exception as e:
            self.logger.error(f"Error stopping system tray: {e}")
    
    def notify(self, title, message):
        """Show a system notification"""
        try:
            if self.icon:
                self.icon.notify(title, message)
        except Exception as e:
            self.logger.debug(f"Error showing notification: {e}")
    
    def update_status(self):
        """Update the tray icon based on current status"""
        try:
            if not self.main_app:
                return
                
            status = self.main_app.get_status()
            
            if status['is_tracking']:
                if self.main_app.blink_detector.is_paused:
                    self.update_icon_title("Eye Blink Tracker - Paused")
                else:
                    self.update_icon_title("Eye Blink Tracker - Tracking")
            else:
                self.update_icon_title("Eye Blink Tracker")
                
        except Exception as e:
            self.logger.debug(f"Error updating status: {e}")
