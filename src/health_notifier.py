"""
Health Notification System for Desktop App
Displays health alerts using system notifications
"""

import logging
from typing import Optional
try:
    from plyer import notification
    PLYER_AVAILABLE = True
except ImportError:
    PLYER_AVAILABLE = False
    logging.warning("plyer not installed - notifications will be disabled")

from health_insights import HealthInsight, AlertLevel


class HealthNotifier:
    """Display health alerts using system notifications"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.enabled = PLYER_AVAILABLE
        
        if not self.enabled:
            self.logger.warning("Notifications disabled - install plyer: pip install plyer")
    
    def show_health_alert(self, insight: HealthInsight):
        """
        Show health alert as system notification
        
        Args:
            insight: HealthInsight object containing alert details
        """
        if not self.enabled:
            self.logger.debug(f"Notification skipped (plyer not available): {insight.title}")
            return
        
        try:
            # Determine notification urgency
            timeout = self._get_timeout(insight.level)
            
            # Format message with recommendations
            # Windows has a 256 character limit for notifications
            message = insight.message
            
            # Add top 2 recommendations only
            if insight.recommendations:
                message += "\n\nTop recommendations:\n"
                message += "\n".join(f"• {rec}" for rec in insight.recommendations[:2])
            
            # Truncate if too long (Windows limit is 256 chars)
            max_length = 240  # Leave some margin
            if len(message) > max_length:
                message = message[:max_length-3] + "..."
            
            # Truncate title if needed
            title = f"{insight.icon} {insight.title}"
            if len(title) > 63:  # Windows title limit
                title = title[:60] + "..."
            
            # Show notification
            notification.notify(
                title=title,
                message=message,
                app_name="Eye Blink Tracker",
                timeout=timeout
            )
            
            self.logger.info(f"Health notification shown: {insight.title}")
            
        except Exception as e:
            self.logger.error(f"Failed to show notification: {e}")
    
    def show_simple_notification(self, title: str, message: str, icon: str = "👁️"):
        """
        Show a simple notification
        
        Args:
            title: Notification title
            message: Notification message
            icon: Emoji icon (default: eye)
        """
        if not self.enabled:
            return
        
        try:
            notification.notify(
                title=f"{icon} {title}",
                message=message,
                app_name="Eye Blink Tracker",
                timeout=10
            )
        except Exception as e:
            self.logger.error(f"Failed to show notification: {e}")
    
    def _get_timeout(self, level: AlertLevel) -> int:
        """Get notification timeout based on alert level"""
        timeouts = {
            AlertLevel.INFO: 10,
            AlertLevel.WARNING: 15,
            AlertLevel.ALERT: 20,
            AlertLevel.CRITICAL: 30
        }
        return timeouts.get(level, 10)
    
    def is_available(self) -> bool:
        """Check if notifications are available"""
        return self.enabled
