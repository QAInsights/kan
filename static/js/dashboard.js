// Eye Blink Tracker Dashboard JavaScript

let socket;
let weeklyChart;
let hourlyChart;
let isConnected = false;
let currentStatus = {
    is_tracking: false,
    is_paused: false,
    camera_available: false,
    active_camera: null,
    stats: {}
};

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeWebSocket();
    loadCameras();
    loadStatistics();
    loadSettings();
    initializeCharts();
    
    // Start periodic updates
    setInterval(updateDashboard, 5000);
});

// WebSocket connection
function initializeWebSocket() {
    socket = io();
    
    socket.on('connect', function() {
        console.log('Connected to server');
        isConnected = true;
        updateStatusIndicator('Connected', 'status-connected');
        socket.emit('request_status');
    });
    
    socket.on('disconnect', function() {
        console.log('Disconnected from server');
        isConnected = false;
        updateStatusIndicator('Disconnected', 'status-disconnected');
    });
    
    socket.on('status_update', function(data) {
        console.log('Status update:', data);
        currentStatus = data;
        updateControlButtons();
        updateSessionStats();
        updateStatusIndicator();
    });
    
    socket.on('blink_detected', function(data) {
        console.log('Blink detected:', data);
        animateBlinkDetection();
        updateSessionStats();
    });
}

// Update status indicator
function updateStatusIndicator(text, className) {
    const indicator = document.getElementById('status-indicator');
    
    if (text && className) {
        indicator.textContent = text;
        indicator.className = `badge me-2 ${className}`;
        return;
    }
    
    // Auto-determine status
    if (!isConnected) {
        indicator.textContent = 'Disconnected';
        indicator.className = 'badge bg-secondary me-2';
    } else if (currentStatus.is_tracking) {
        if (currentStatus.is_paused) {
            indicator.textContent = 'Paused';
            indicator.className = 'badge bg-warning me-2';
        } else {
            indicator.textContent = 'Tracking';
            indicator.className = 'badge bg-success me-2 status-tracking';
        }
    } else {
        indicator.textContent = 'Ready';
        indicator.className = 'badge bg-primary me-2';
    }
}

// Update control buttons based on current status
function updateControlButtons() {
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    const btnStop = document.getElementById('btn-stop');
    
    if (currentStatus.is_tracking) {
        btnStart.disabled = true;
        btnStop.disabled = false;
        
        if (currentStatus.is_paused) {
            btnPause.disabled = true;
            btnResume.disabled = false;
        } else {
            btnPause.disabled = false;
            btnResume.disabled = true;
        }
    } else {
        btnStart.disabled = !currentStatus.camera_available;
        btnPause.disabled = true;
        btnResume.disabled = true;
        btnStop.disabled = true;
    }
}

// Control functions
async function startTracking() {
    try {
        const response = await fetch('/api/tracking/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        if (result.success) {
            showNotification('Tracking started successfully', 'success');
        } else {
            showNotification('Failed to start tracking', 'error');
        }
    } catch (error) {
        console.error('Error starting tracking:', error);
        showNotification('Error starting tracking', 'error');
    }
}

async function pauseTracking() {
    try {
        const response = await fetch('/api/tracking/pause', {
            method: 'POST'
        });
        
        const result = await response.json();
        if (result.success) {
            showNotification('Tracking paused', 'info');
        }
    } catch (error) {
        console.error('Error pausing tracking:', error);
        showNotification('Error pausing tracking', 'error');
    }
}

async function resumeTracking() {
    try {
        const response = await fetch('/api/tracking/resume', {
            method: 'POST'
        });
        
        const result = await response.json();
        if (result.success) {
            showNotification('Tracking resumed', 'success');
        }
    } catch (error) {
        console.error('Error resuming tracking:', error);
        showNotification('Error resuming tracking', 'error');
    }
}

async function stopTracking() {
    try {
        const response = await fetch('/api/tracking/stop', {
            method: 'POST'
        });
        
        const result = await response.json();
        if (result.success) {
            showNotification('Tracking stopped', 'info');
        }
    } catch (error) {
        console.error('Error stopping tracking:', error);
        showNotification('Error stopping tracking', 'error');
    }
}

// Camera management
async function loadCameras() {
    try {
        const response = await fetch('/api/cameras');
        const cameras = await response.json();
        
        const select = document.getElementById('camera-select');
        select.innerHTML = '<option value="">Select Camera...</option>';
        
        cameras.forEach(camera => {
            const option = document.createElement('option');
            option.value = camera.index;
            option.textContent = `${camera.name} (${camera.resolution})`;
            select.appendChild(option);
        });
        
        // Show active camera
        if (currentStatus.active_camera) {
            select.value = currentStatus.active_camera.index;
            showCameraInfo(currentStatus.active_camera);
        }
        
    } catch (error) {
        console.error('Error loading cameras:', error);
    }
}

async function refreshCameras() {
    try {
        const response = await fetch('/api/cameras/refresh');
        const cameras = await response.json();
        
        loadCameras();
        showNotification('Cameras refreshed', 'info');
        
    } catch (error) {
        console.error('Error refreshing cameras:', error);
        showNotification('Error refreshing cameras', 'error');
    }
}

async function selectCamera() {
    const select = document.getElementById('camera-select');
    const cameraIndex = select.value;
    
    if (!cameraIndex) {
        document.getElementById('camera-info').innerHTML = '';
        return;
    }
    
    try {
        const response = await fetch(`/api/cameras/select/${cameraIndex}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        if (result.success) {
            showNotification('Camera selected successfully', 'success');
            // Reload status to get camera info
            setTimeout(loadStatus, 500);
        } else {
            showNotification('Failed to select camera', 'error');
        }
    } catch (error) {
        console.error('Error selecting camera:', error);
        showNotification('Error selecting camera', 'error');
    }
}

function showCameraInfo(camera) {
    const cameraInfo = document.getElementById('camera-info');
    
    if (!camera) {
        cameraInfo.innerHTML = '';
        return;
    }
    
    cameraInfo.innerHTML = `
        <div class="camera-info-item">
            <span>Name:</span>
            <span>${camera.name}</span>
        </div>
        <div class="camera-info-item">
            <span>Resolution:</span>
            <span>${camera.resolution}</span>
        </div>
        <div class="camera-info-item">
            <span>FPS:</span>
            <span>${camera.fps}</span>
        </div>
        <div class="camera-info-item">
            <span>Backend:</span>
            <span>${camera.backend || 'Unknown'}</span>
        </div>
    `;
}

// Statistics and UI updates
function updateSessionStats() {
    const stats = currentStatus.stats || {};
    
    document.getElementById('session-blinks').textContent = stats.session_blinks || 0;
    document.getElementById('blinks-per-minute').textContent = Math.round(stats.blinks_per_minute || 0);
    
    // Format session duration
    const duration = stats.session_duration || 0;
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    document.getElementById('session-duration').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function loadStatistics() {
    try {
        const response = await fetch('/api/statistics/summary');
        const stats = await response.json();
        
        document.getElementById('total-blinks').textContent = stats.total_blinks || 0;
        document.getElementById('today-blinks').textContent = stats.today_blinks || 0;
        document.getElementById('avg-per-day').textContent = stats.average_per_day || 0;
        document.getElementById('avg-bpm').textContent = Math.round(stats.average_bpm || 0);
        
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

async function loadStatus() {
    try {
        const response = await fetch('/api/status');
        const status = await response.json();
        
        currentStatus = status;
        updateControlButtons();
        updateSessionStats();
        updateStatusIndicator();
        
        if (status.active_camera) {
            showCameraInfo(status.active_camera);
        }
        
    } catch (error) {
        console.error('Error loading status:', error);
    }
}

// Charts
function initializeCharts() {
    initializeWeeklyChart();
    initializeHourlyChart();
    loadRecentSessions();
}

async function initializeWeeklyChart() {
    try {
        const response = await fetch('/api/statistics/weekly');
        const weeklyData = await response.json();
        
        const ctx = document.getElementById('weekly-chart').getContext('2d');
        const labels = weeklyData.map(day => {
            const date = new Date(day.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
        const data = weeklyData.map(day => day.total_blinks);
        
        weeklyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Blinks',
                    data: data,
                    borderColor: 'rgb(13, 110, 253)',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error initializing weekly chart:', error);
    }
}

async function initializeHourlyChart() {
    try {
        const response = await fetch('/api/statistics/daily');
        const dailyData = await response.json();
        
        const ctx = document.getElementById('hourly-chart').getContext('2d');
        
        // Prepare hourly data (0-23 hours)
        const hourlyLabels = Array.from({length: 24}, (_, i) => `${i}:00`);
        const hourlyValues = Array.from({length: 24}, (_, i) => 
            dailyData.hourly_distribution?.[i] || 0
        );
        
        hourlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: hourlyLabels,
                datasets: [{
                    label: 'Blinks per Hour',
                    data: hourlyValues,
                    backgroundColor: 'rgba(25, 135, 84, 0.5)',
                    borderColor: 'rgb(25, 135, 84)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error initializing hourly chart:', error);
    }
}

async function loadRecentSessions() {
    try {
        const response = await fetch('/api/sessions?limit=5');
        const sessions = await response.json();
        
        const container = document.getElementById('recent-sessions');
        
        if (sessions.length === 0) {
            container.innerHTML = '<div class="text-center text-muted">No recent sessions</div>';
            return;
        }
        
        container.innerHTML = sessions.map(session => {
            const startTime = new Date(session.start_time);
            const duration = Math.floor(session.duration_seconds / 60);
            
            return `
                <div class="session-item">
                    <div class="session-date">${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}</div>
                    <div class="session-stats">
                        ${session.total_blinks} blinks • ${duration} minutes • ${Math.round(session.average_bpm)} BPM
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading recent sessions:', error);
    }
}

// Settings
async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        
        document.getElementById('ear-threshold').value = settings.ear_threshold || 0.3;
        document.getElementById('consecutive-frames').value = settings.consecutive_frames || 3;
        document.getElementById('auto-start').checked = settings.auto_start || false;
        
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function saveSettings() {
    try {
        const settings = {
            ear_threshold: parseFloat(document.getElementById('ear-threshold').value),
            consecutive_frames: parseInt(document.getElementById('consecutive-frames').value),
            auto_start: document.getElementById('auto-start').checked
        };
        
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings)
        });
        
        const result = await response.json();
        if (result.success) {
            showNotification('Settings saved successfully', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
            modal.hide();
        } else {
            showNotification('Failed to save settings', 'error');
        }
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error saving settings', 'error');
    }
}

// Utility functions
function updateDashboard() {
    if (isConnected) {
        loadStatus();
        loadStatistics();
    }
}

function animateBlinkDetection() {
    const sessionBlinks = document.getElementById('session-blinks');
    sessionBlinks.classList.add('blink-animation');
    setTimeout(() => {
        sessionBlinks.classList.remove('blink-animation');
    }, 500);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible notification`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 's':
                event.preventDefault();
                if (currentStatus.is_tracking) {
                    stopTracking();
                } else {
                    startTracking();
                }
                break;
            case 'p':
                event.preventDefault();
                if (currentStatus.is_tracking && !currentStatus.is_paused) {
                    pauseTracking();
                } else if (currentStatus.is_tracking && currentStatus.is_paused) {
                    resumeTracking();
                }
                break;
        }
    }
});
