"""
Health Insights Module for Eye Blink Tracker
Provides evidence-based health recommendations based on blink patterns

Medical References:
1. Tsubota, K., & Nakamori, K. (1993). "Dry eyes and video display terminals." 
   New England Journal of Medicine, 328(8), 584.
2. Patel, S., et al. (2011). "Normal values for spontaneous blink rate." 
   Optometry and Vision Science, 88(9), 1036-1040.
3. Bentivoglio, A. R., et al. (1997). "Analysis of blink rate patterns in normal subjects."
   Movement Disorders, 12(6), 1028-1034.
4. Rosenfield, M. (2016). "Computer vision syndrome (a.k.a. digital eye strain)."
   Optometry in Practice, 17(1), 1-10.
"""

import logging
import time
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum


class AlertLevel(Enum):
    """Alert severity levels"""
    INFO = 0
    WARNING = 1
    ALERT = 2
    CRITICAL = 3


@dataclass
class HealthInsight:
    """Health insight data structure"""
    status: str
    level: AlertLevel
    title: str
    message: str
    recommendations: List[str]
    medical_note: str
    icon: str


class HealthInsightsMonitor:
    """Monitor blink patterns and provide health insights"""
    
    # Normal blink rate ranges (per minute)
    NORMAL_BLINK_RATE = {'min': 12, 'max': 20, 'optimal': 15}
    
    # Thresholds for health alerts
    VERY_LOW_THRESHOLD = 8
    LOW_THRESHOLD = 12
    HIGH_THRESHOLD = 20
    VERY_HIGH_THRESHOLD = 30
    
    # Session duration thresholds (minutes)
    SHORT_BREAK_INTERVAL = 20  # 20-20-20 rule
    LONG_BREAK_INTERVAL = 60   # Hourly break
    MAX_CONTINUOUS_WORK = 120  # 2 hours max
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.last_alert_time = {}
        self.alert_cooldown = 300  # 5 minutes between same alerts
        
    def analyze_blink_pattern(self, blinks_per_minute: float, 
                             session_duration_seconds: int) -> Optional[HealthInsight]:
        """
        Analyze blink patterns and provide health insights
        
        Args:
            blinks_per_minute: Current blink rate
            session_duration_seconds: Duration of current session
            
        Returns:
            HealthInsight object or None if no alert needed
        """
        duration_minutes = session_duration_seconds / 60
        
        # Analyze blink rate
        if blinks_per_minute < self.VERY_LOW_THRESHOLD and blinks_per_minute > 0:
            return self._create_severely_low_alert(blinks_per_minute, duration_minutes)
        elif blinks_per_minute < self.LOW_THRESHOLD and blinks_per_minute > 0:
            return self._create_low_alert(blinks_per_minute, duration_minutes)
        elif blinks_per_minute > self.VERY_HIGH_THRESHOLD:
            return self._create_very_high_alert(blinks_per_minute, duration_minutes)
        elif blinks_per_minute > self.HIGH_THRESHOLD:
            return self._create_elevated_alert(blinks_per_minute, duration_minutes)
        elif duration_minutes >= self.MAX_CONTINUOUS_WORK:
            return self._create_extended_work_alert(duration_minutes)
        elif duration_minutes >= self.LONG_BREAK_INTERVAL:
            return self._create_break_reminder(duration_minutes)
            
        return None
    
    def _create_severely_low_alert(self, bpm: float, duration: float) -> HealthInsight:
        """Create alert for severely reduced blink rate"""
        return HealthInsight(
            status='critical',
            level=AlertLevel.CRITICAL,
            title='Severely Reduced Blink Rate',
            message=f'Your blink rate is {bpm:.1f} per minute, significantly below normal (12-20 BPM). '
                   'This is commonly associated with intense screen use.',
            recommendations=[
                '⚠️ Take an immediate break from the screen',
                '💧 Use artificial tears or lubricating eye drops',
                '👀 Practice conscious blinking exercises',
                '🏥 Consider consulting an eye care professional if symptoms persist',
                '💻 Reduce screen brightness and increase text size',
                '🌡️ Check room humidity (aim for 30-50%)'
            ],
            medical_note='Studies show that blink rate can decrease by up to 60% during computer use, '
                        'leading to dry eye syndrome (Tsubota & Nakamori, 1993).',
            icon='🚨'
        )
    
    def _create_low_alert(self, bpm: float, duration: float) -> HealthInsight:
        """Create alert for reduced blink rate"""
        return HealthInsight(
            status='warning',
            level=AlertLevel.WARNING,
            title='Reduced Blink Rate Detected',
            message=f'Your blink rate is {bpm:.1f} per minute, below normal (12-20 BPM). '
                   'This may indicate digital eye strain.',
            recommendations=[
                '😌 Take a 20-second break every 20 minutes',
                '💧 Blink consciously and completely',
                '📏 Follow the 20-20-20 rule',
                '💻 Position screen 20-26 inches from eyes',
                '🌊 Stay hydrated - drink water regularly'
            ],
            medical_note='Normal spontaneous blink rate ranges from 12-20 blinks per minute '
                        '(Patel et al., 2011). Reduced blinking can lead to tear film instability.',
            icon='⚠️'
        )
    
    def _create_very_high_alert(self, bpm: float, duration: float) -> HealthInsight:
        """Create alert for excessive blink rate"""
        return HealthInsight(
            status='alert',
            level=AlertLevel.ALERT,
            title='Excessive Blink Rate Detected',
            message=f'Your blink rate is {bpm:.1f} per minute, significantly above normal (12-20 BPM). '
                   'This may indicate eye irritation or fatigue.',
            recommendations=[
                '🛑 Take an immediate break from the screen',
                '💧 Check if eyes feel dry or irritated',
                '🌡️ Ensure proper lighting (avoid glare)',
                '🧹 Check for environmental irritants (dust, smoke, dry air)',
                '😎 Consider using blue light filtering glasses',
                '🏥 If persistent, consult an eye care professional'
            ],
            medical_note='Excessive blinking can be caused by dry eyes, eye irritation, allergies, '
                        'or eye strain (Bentivoglio et al., 1997).',
            icon='⚡'
        )
    
    def _create_elevated_alert(self, bpm: float, duration: float) -> HealthInsight:
        """Create alert for elevated blink rate"""
        return HealthInsight(
            status='elevated',
            level=AlertLevel.INFO,
            title='Elevated Blink Rate',
            message=f'Your blink rate is {bpm:.1f} per minute, slightly above normal (12-20 BPM). '
                   'This could indicate mild eye fatigue.',
            recommendations=[
                '😌 Take short breaks periodically',
                '💧 Ensure adequate hydration',
                '🌡️ Check room temperature and humidity',
                '💻 Adjust screen position and brightness'
            ],
            medical_note='Slightly elevated blink rates may occur during tasks requiring concentration '
                        'or in response to environmental factors.',
            icon='📊'
        )
    
    def _create_extended_work_alert(self, duration: float) -> HealthInsight:
        """Create alert for extended screen time"""
        return HealthInsight(
            status='extended_work',
            level=AlertLevel.CRITICAL,
            title='Extended Screen Time Alert',
            message=f'You\'ve been working for {duration:.0f} minutes without a break. '
                   'Extended screen time increases risk of eye strain.',
            recommendations=[
                '🚨 TAKE A BREAK NOW - You\'ve exceeded recommended continuous screen time',
                '🚶 Stand up, walk around for 5-10 minutes',
                '👀 Give your eyes a complete rest from screens',
                '💧 Hydrate and rest your eyes'
            ],
            medical_note='Prolonged screen time without breaks significantly increases the risk of '
                        'computer vision syndrome (Rosenfield, 2016).',
            icon='🛑'
        )
    
    def _create_break_reminder(self, duration: float) -> HealthInsight:
        """Create reminder for taking a break"""
        return HealthInsight(
            status='break_reminder',
            level=AlertLevel.INFO,
            title='Break Reminder',
            message=f'You\'ve been working for {duration:.0f} minutes. Time for a break!',
            recommendations=[
                '⏰ Take a 5-10 minute break',
                '🚶 Stand up and stretch',
                '👀 Look at distant objects',
                '💧 Drink some water'
            ],
            medical_note='Regular breaks help prevent eye strain and maintain productivity.',
            icon='⏰'
        )
    
    def should_show_alert(self, alert_type: str) -> bool:
        """Check if alert should be shown (respects cooldown)"""
        now = time.time()
        last_alert = self.last_alert_time.get(alert_type, 0)
        
        if now - last_alert > self.alert_cooldown:
            self.last_alert_time[alert_type] = now
            return True
        return False
    
    def get_blink_rate_interpretation(self, bpm: float) -> Dict[str, str]:
        """Get interpretation of blink rate"""
        if bpm == 0:
            return {
                'category': 'No Data',
                'description': 'Start tracking to see your blink rate',
                'color': 'gray'
            }
        elif bpm < self.VERY_LOW_THRESHOLD:
            return {
                'category': 'Severely Low',
                'description': 'Significant reduction - immediate action recommended',
                'color': 'red'
            }
        elif bpm < self.LOW_THRESHOLD:
            return {
                'category': 'Below Normal',
                'description': 'Reduced blinking - may indicate eye strain',
                'color': 'orange'
            }
        elif bpm >= self.NORMAL_BLINK_RATE['min'] and bpm <= self.NORMAL_BLINK_RATE['max']:
            return {
                'category': 'Normal',
                'description': 'Healthy blink rate',
                'color': 'green'
            }
        elif bpm <= self.HIGH_THRESHOLD:
            return {
                'category': 'Slightly Elevated',
                'description': 'Mild increase - monitor for patterns',
                'color': 'blue'
            }
        elif bpm <= self.VERY_HIGH_THRESHOLD:
            return {
                'category': 'Elevated',
                'description': 'Increased blinking - check for irritation',
                'color': 'yellow'
            }
        else:
            return {
                'category': 'Very High',
                'description': 'Excessive blinking - may need attention',
                'color': 'red'
            }
    
    @staticmethod
    def get_general_tips() -> List[Dict[str, str]]:
        """Get general eye health tips"""
        return [
            {
                'title': '20-20-20 Rule',
                'description': 'Every 20 minutes, look at something 20 feet away for 20 seconds',
                'reference': 'American Optometric Association recommendation'
            },
            {
                'title': 'Proper Lighting',
                'description': 'Ensure room lighting is similar to screen brightness',
                'reference': 'Rosenfield, M. (2016). Computer vision syndrome'
            },
            {
                'title': 'Screen Position',
                'description': 'Position screen 20-26 inches from eyes, slightly below eye level',
                'reference': 'OSHA guidelines for computer workstation ergonomics'
            },
            {
                'title': 'Blink Consciously',
                'description': 'Make a conscious effort to blink completely and regularly',
                'reference': 'Tsubota & Nakamori (1993). Dry eyes and video display terminals'
            },
            {
                'title': 'Humidity Control',
                'description': 'Maintain room humidity between 30-50%',
                'reference': 'American Academy of Ophthalmology recommendations'
            },
            {
                'title': 'Regular Eye Exams',
                'description': 'Get comprehensive eye exams annually',
                'reference': 'American Academy of Ophthalmology guidelines'
            }
        ]
    
    @staticmethod
    def get_medical_disclaimer() -> str:
        """Get medical disclaimer text"""
        return """
MEDICAL DISCLAIMER

This application is designed for educational and informational purposes only. 
It is NOT a substitute for professional medical advice, diagnosis, or treatment.

Key Points:
• The health insights provided are based on general medical literature and research
• Individual health conditions vary significantly
• This tool does not diagnose medical conditions
• Always consult qualified healthcare professionals for medical concerns
• If you experience persistent eye problems, seek professional eye care
• In case of emergency eye conditions, seek immediate medical attention

References:
This application's health recommendations are based on peer-reviewed medical literature 
including research from the New England Journal of Medicine, Optometry and Vision Science, 
Movement Disorders, and guidelines from the American Academy of Ophthalmology and 
American Optometric Association.

Data Privacy:
All blink data and health insights are stored locally on your device. 
No health information is transmitted to external servers.

By using this application, you acknowledge that you have read and understood this disclaimer.
"""
