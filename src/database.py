"""
Database Manager for storing blink tracking data
"""

import sqlite3
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pathlib import Path

class DatabaseManager:
    """Manages SQLite database for storing blink tracking data"""
    
    def __init__(self, db_path: str = "data/blink_tracker.db"):
        self.logger = logging.getLogger(__name__)
        self.db_path = Path(db_path)
        
        # Ensure data directory exists
        self.db_path.parent.mkdir(exist_ok=True)
        
        self.connection = None
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize database connection and create tables"""
        try:
            self.connection = sqlite3.connect(self.db_path, check_same_thread=False)
            self.connection.row_factory = sqlite3.Row  # Enable column access by name
            
            self._create_tables()
            self.logger.info(f"Database initialized: {self.db_path}")
            
        except Exception as e:
            self.logger.error(f"Database initialization failed: {e}")
            raise
    
    def _create_tables(self):
        """Create necessary database tables"""
        try:
            cursor = self.connection.cursor()
            
            # Blinks table - stores individual blink events
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS blinks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME NOT NULL,
                    ear_value REAL,
                    session_id INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Sessions table - stores tracking sessions
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    start_time DATETIME NOT NULL,
                    end_time DATETIME,
                    total_blinks INTEGER DEFAULT 0,
                    duration_seconds INTEGER DEFAULT 0,
                    average_bpm REAL DEFAULT 0,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Settings table - stores application settings
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create indices for better performance
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_blinks_timestamp ON blinks(timestamp)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_blinks_session ON blinks(session_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time)')
            
            self.connection.commit()
            self.logger.info("Database tables created/verified")
            
        except Exception as e:
            self.logger.error(f"Error creating tables: {e}")
            raise
    
    def record_blink(self, timestamp: datetime, ear_value: float = None, session_id: int = None):
        """Record a single blink event"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                INSERT INTO blinks (timestamp, ear_value, session_id)
                VALUES (?, ?, ?)
            ''', (timestamp, ear_value, session_id))
            
            self.connection.commit()
            self.logger.debug(f"Blink recorded: {timestamp}")
            
        except Exception as e:
            self.logger.error(f"Error recording blink: {e}")
    
    def get_total_blinks(self) -> int:
        """Get total number of recorded blinks"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('SELECT COUNT(*) FROM blinks')
            result = cursor.fetchone()
            return result[0] if result else 0
            
        except Exception as e:
            self.logger.error(f"Error getting total blinks: {e}")
            return 0
    
    def get_blinks_by_date_range(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Get blinks within a specific date range"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT * FROM blinks 
                WHERE timestamp BETWEEN ? AND ?
                ORDER BY timestamp
            ''', (start_date, end_date))
            
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
            
        except Exception as e:
            self.logger.error(f"Error getting blinks by date range: {e}")
            return []
    
    def get_daily_stats(self, date: datetime = None) -> Dict:
        """Get blink statistics for a specific day"""
        if date is None:
            date = datetime.now()
        
        try:
            # Get start and end of the day
            start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = start_of_day + timedelta(days=1)
            
            cursor = self.connection.cursor()
            
            # Get total blinks for the day
            cursor.execute('''
                SELECT COUNT(*) as total_blinks,
                       MIN(timestamp) as first_blink,
                       MAX(timestamp) as last_blink
                FROM blinks 
                WHERE timestamp BETWEEN ? AND ?
            ''', (start_of_day, end_of_day))
            
            result = cursor.fetchone()
            
            if result and result['total_blinks'] > 0:
                # Calculate hourly distribution
                cursor.execute('''
                    SELECT strftime('%H', timestamp) as hour,
                           COUNT(*) as blinks
                    FROM blinks 
                    WHERE timestamp BETWEEN ? AND ?
                    GROUP BY hour
                    ORDER BY hour
                ''', (start_of_day, end_of_day))
                
                hourly_data = cursor.fetchall()
                hourly_distribution = {int(row['hour']): row['blinks'] for row in hourly_data}
                
                return {
                    'date': date.date().isoformat(),
                    'total_blinks': result['total_blinks'],
                    'first_blink': result['first_blink'],
                    'last_blink': result['last_blink'],
                    'hourly_distribution': hourly_distribution
                }
            else:
                return {
                    'date': date.date().isoformat(),
                    'total_blinks': 0,
                    'first_blink': None,
                    'last_blink': None,
                    'hourly_distribution': {}
                }
                
        except Exception as e:
            self.logger.error(f"Error getting daily stats: {e}")
            return {}
    
    def get_weekly_stats(self, date: datetime = None) -> List[Dict]:
        """Get blink statistics for a week"""
        if date is None:
            date = datetime.now()
        
        try:
            # Get start of the week (Monday)
            days_since_monday = date.weekday()
            start_of_week = date - timedelta(days=days_since_monday)
            start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
            
            weekly_stats = []
            for i in range(7):
                day = start_of_week + timedelta(days=i)
                daily_stats = self.get_daily_stats(day)
                weekly_stats.append(daily_stats)
            
            return weekly_stats
            
        except Exception as e:
            self.logger.error(f"Error getting weekly stats: {e}")
            return []
    
    def save_session(self, session_data: Dict) -> int:
        """Save a tracking session"""
        try:
            cursor = self.connection.cursor()
            
            duration = (session_data['end_time'] - session_data['start_time']).total_seconds()
            avg_bpm = (session_data['total_blinks'] * 60) / duration if duration > 0 else 0
            
            cursor.execute('''
                INSERT INTO sessions (start_time, end_time, total_blinks, duration_seconds, average_bpm, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                session_data['start_time'],
                session_data['end_time'],
                session_data['total_blinks'],
                int(duration),
                avg_bpm,
                session_data.get('notes', '')
            ))
            
            session_id = cursor.lastrowid
            self.connection.commit()
            
            self.logger.info(f"Session saved with ID: {session_id}")
            return session_id
            
        except Exception as e:
            self.logger.error(f"Error saving session: {e}")
            return -1
    
    def get_recent_sessions(self, limit: int = 10) -> List[Dict]:
        """Get recent tracking sessions"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT * FROM sessions 
                ORDER BY start_time DESC 
                LIMIT ?
            ''', (limit,))
            
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
            
        except Exception as e:
            self.logger.error(f"Error getting recent sessions: {e}")
            return []
    
    def get_setting(self, key: str, default_value: str = None) -> Optional[str]:
        """Get a setting value"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('SELECT value FROM settings WHERE key = ?', (key,))
            result = cursor.fetchone()
            
            return result['value'] if result else default_value
            
        except Exception as e:
            self.logger.error(f"Error getting setting {key}: {e}")
            return default_value
    
    def set_setting(self, key: str, value: str):
        """Set a setting value"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO settings (key, value, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            ''', (key, value))
            
            self.connection.commit()
            self.logger.debug(f"Setting saved: {key} = {value}")
            
        except Exception as e:
            self.logger.error(f"Error setting {key}: {e}")
    
    def get_statistics_summary(self) -> Dict:
        """Get comprehensive statistics summary"""
        try:
            cursor = self.connection.cursor()
            
            # Total blinks
            cursor.execute('SELECT COUNT(*) as total FROM blinks')
            total_blinks = cursor.fetchone()['total']
            
            # Today's blinks
            today_stats = self.get_daily_stats()
            
            # Average blinks per day (last 30 days)
            thirty_days_ago = datetime.now() - timedelta(days=30)
            cursor.execute('''
                SELECT COUNT(*) as total FROM blinks 
                WHERE timestamp >= ?
            ''', (thirty_days_ago,))
            recent_blinks = cursor.fetchone()['total']
            avg_per_day = recent_blinks / 30 if recent_blinks > 0 else 0
            
            # Session statistics
            cursor.execute('''
                SELECT COUNT(*) as total_sessions,
                       AVG(duration_seconds) as avg_duration,
                       AVG(average_bpm) as avg_bpm
                FROM sessions
            ''', )
            session_stats = cursor.fetchone()
            
            return {
                'total_blinks': total_blinks,
                'today_blinks': today_stats.get('total_blinks', 0),
                'average_per_day': round(avg_per_day, 1),
                'total_sessions': session_stats['total_sessions'] or 0,
                'average_session_duration': round(session_stats['avg_duration'] or 0, 1),
                'average_bpm': round(session_stats['avg_bpm'] or 0, 1)
            }
            
        except Exception as e:
            self.logger.error(f"Error getting statistics summary: {e}")
            return {}
    
    def cleanup_old_data(self, days_to_keep: int = 90):
        """Clean up old data beyond specified days"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days_to_keep)
            
            cursor = self.connection.cursor()
            cursor.execute('DELETE FROM blinks WHERE timestamp < ?', (cutoff_date,))
            cursor.execute('DELETE FROM sessions WHERE start_time < ?', (cutoff_date,))
            
            deleted_blinks = cursor.rowcount
            self.connection.commit()
            
            self.logger.info(f"Cleaned up {deleted_blinks} old records")
            
        except Exception as e:
            self.logger.error(f"Error cleaning up old data: {e}")
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            self.logger.info("Database connection closed")
