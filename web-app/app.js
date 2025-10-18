/**
 * Main Application Logic for Eye Blink Tracker
 */

// Global variables
let db;
let blinkDetector;
let faceMesh;
let camera;
let isTracking = false;
let isPaused = false;
let currentSessionId = null;
let sessionBlinks = 0;
let sessionStartTime = null;
let durationInterval = null;
let showLandmarks = false;

// Chart instances
let weeklyChart;
let hourlyChart;

/**
 * Initialize the application
 */
async function initApp() {
    try {
        // Initialize database
        db = new BlinkDatabase();
        await db.init();
        console.log('Database initialized');

        // Initialize blink detector
        blinkDetector = new BlinkDetector(onBlinkDetected);
        console.log('Blink detector initialized');

        // Load settings
        await loadSettings();

        // Initialize MediaPipe Face Mesh
        await initFaceMesh();

        // Initialize charts
        initCharts();

        // Load statistics
        await updateStatistics();

        // Hide loading overlay
        document.getElementById('loadingOverlay').classList.add('hidden');

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        alert('Failed to initialize application. Please refresh the page.');
    }
}

/**
 * Initialize MediaPipe Face Mesh
 */
async function initFaceMesh() {
    faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onFaceMeshResults);
    console.log('Face Mesh initialized');
}

/**
 * Handle Face Mesh results
 */
function onFaceMeshResults(results) {
    if (!isTracking || isPaused) return;

    const videoElement = document.getElementById('videoElement');
    const canvasElement = document.getElementById('canvasElement');
    const ctx = canvasElement.getContext('2d');

    // Set canvas size to match video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Process blink detection
    const detectionResult = blinkDetector.processResults(results);

    // Update current EAR display
    if (detectionResult.detected) {
        const earDisplay = document.getElementById('currentEAR');
        const baselineDisplay = document.getElementById('baselineEAR');
        const thresholdDisplay = document.getElementById('activeThreshold');
        
        if (earDisplay) {
            earDisplay.textContent = detectionResult.ear.toFixed(3);
            // Color code based on threshold
            if (detectionResult.eyesClosed) {
                earDisplay.style.color = '#dc3545'; // Red when eyes closed
                earDisplay.style.fontWeight = 'bold';
            } else {
                earDisplay.style.color = '#198754'; // Green when eyes open
                earDisplay.style.fontWeight = 'normal';
            }
        }
        
        if (baselineDisplay && detectionResult.baseline) {
            baselineDisplay.textContent = detectionResult.baseline.toFixed(3);
            baselineDisplay.style.color = '#0d6efd';
        }
        
        if (thresholdDisplay && detectionResult.threshold) {
            thresholdDisplay.textContent = detectionResult.threshold.toFixed(3);
            thresholdDisplay.style.color = '#6c757d';
        }
    }

    // Draw landmarks if enabled
    if (showLandmarks && detectionResult.detected) {
        if (detectionResult.leftEye && detectionResult.rightEye) {
            blinkDetector.drawEyeLandmarks(
                ctx,
                detectionResult.leftEye,
                detectionResult.rightEye,
                canvasElement.width,
                canvasElement.height
            );
        }

        // Optionally draw full face mesh
        // blinkDetector.drawFaceMesh(ctx, detectionResult.landmarks, canvasElement.width, canvasElement.height);
    }

    // Update session stats
    updateSessionStats();
}

/**
 * Blink detected callback
 */
async function onBlinkDetected() {
    console.log('Blink detected!');
    
    // Visual feedback
    const indicator = document.getElementById('blinkIndicator');
    indicator.classList.add('active');
    setTimeout(() => indicator.classList.remove('active'), 300);

    // Save to database
    if (currentSessionId) {
        try {
            await db.saveBlink(currentSessionId);
            sessionBlinks++;
            updateSessionStats();
        } catch (error) {
            console.error('Failed to save blink:', error);
        }
    }
}

/**
 * Start tracking
 */
async function startTracking() {
    if (isTracking) return;

    try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            }
        });

        const videoElement = document.getElementById('videoElement');
        videoElement.srcObject = stream;

        // Wait for video to be ready
        await new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                resolve();
            };
        });

        // Initialize camera for MediaPipe
        camera = new Camera(videoElement, {
            onFrame: async () => {
                if (isTracking && !isPaused) {
                    await faceMesh.send({ image: videoElement });
                }
            },
            width: 640,
            height: 480
        });

        camera.start();

        // Start session
        currentSessionId = await db.startSession();
        sessionBlinks = 0;
        sessionStartTime = Date.now();
        blinkDetector.reset();

        isTracking = true;
        isPaused = false;

        // Start duration timer
        durationInterval = setInterval(updateSessionDuration, 1000);

        // Update UI
        updateControlButtons();
        updateStatusBadge('tracking');

        console.log('Tracking started');
    } catch (error) {
        console.error('Failed to start tracking:', error);
        alert('Failed to access camera. Please ensure camera permissions are granted.');
    }
}

/**
 * Pause tracking
 */
function pauseTracking() {
    if (!isTracking || isPaused) return;

    isPaused = true;
    updateControlButtons();
    updateStatusBadge('paused');
    console.log('Tracking paused');
}

/**
 * Resume tracking
 */
function resumeTracking() {
    if (!isTracking || !isPaused) return;

    isPaused = false;
    updateControlButtons();
    updateStatusBadge('tracking');
    console.log('Tracking resumed');
}

/**
 * Stop tracking
 */
async function stopTracking() {
    if (!isTracking) return;

    isTracking = false;
    isPaused = false;

    // Stop camera
    if (camera) {
        camera.stop();
    }

    // Stop video stream
    const videoElement = document.getElementById('videoElement');
    if (videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
    }

    // Clear canvas
    const canvasElement = document.getElementById('canvasElement');
    const ctx = canvasElement.getContext('2d');
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Stop duration timer
    if (durationInterval) {
        clearInterval(durationInterval);
        durationInterval = null;
    }

    // End session
    if (currentSessionId) {
        try {
            await db.endSession(currentSessionId, sessionBlinks);
        } catch (error) {
            console.error('Failed to end session:', error);
        }
    }

    currentSessionId = null;
    sessionBlinks = 0;
    sessionStartTime = null;

    // Update UI
    updateControlButtons();
    updateStatusBadge('stopped');
    await updateStatistics();

    console.log('Tracking stopped');
}

/**
 * Update control buttons state
 */
function updateControlButtons() {
    const btnStart = document.getElementById('btnStart');
    const btnPause = document.getElementById('btnPause');
    const btnResume = document.getElementById('btnResume');
    const btnStop = document.getElementById('btnStop');

    if (!isTracking) {
        btnStart.disabled = false;
        btnPause.disabled = true;
        btnResume.disabled = true;
        btnStop.disabled = true;
    } else if (isPaused) {
        btnStart.disabled = true;
        btnPause.disabled = true;
        btnResume.disabled = false;
        btnStop.disabled = false;
    } else {
        btnStart.disabled = true;
        btnPause.disabled = false;
        btnResume.disabled = true;
        btnStop.disabled = false;
    }
}

/**
 * Update status badge
 */
function updateStatusBadge(status) {
    const badge = document.getElementById('statusBadge');
    badge.className = 'status-badge';

    switch (status) {
        case 'tracking':
            badge.classList.add('status-tracking');
            badge.textContent = 'Tracking';
            break;
        case 'paused':
            badge.classList.add('status-paused');
            badge.textContent = 'Paused';
            break;
        case 'stopped':
            badge.classList.add('status-stopped');
            badge.textContent = 'Stopped';
            break;
    }
}

/**
 * Update session statistics
 */
function updateSessionStats() {
    const stats = blinkDetector.getStats();
    
    document.getElementById('sessionBlinks').textContent = stats.totalBlinks;
    document.getElementById('blinksPerMinute').textContent = stats.blinksPerMinute;
}

/**
 * Update session duration
 */
function updateSessionDuration() {
    if (!sessionStartTime) return;

    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('sessionDuration').textContent = formatted;
}

/**
 * Update all statistics
 */
async function updateStatistics() {
    try {
        // Total blinks
        const totalBlinks = await db.getTotalBlinks();
        document.getElementById('totalBlinks').textContent = totalBlinks;

        // Today's blinks
        const todayBlinks = await db.getTodayBlinks();
        document.getElementById('todayBlinks').textContent = todayBlinks;

        // Daily average
        const avgPerDay = await db.getDailyAverage();
        document.getElementById('avgPerDay').textContent = avgPerDay;

        // Average BPM
        const avgBPM = await db.getAverageBPM();
        document.getElementById('avgBPM').textContent = avgBPM;

        // Update charts
        await updateCharts();

        // Update recent sessions
        await updateRecentSessions();
    } catch (error) {
        console.error('Failed to update statistics:', error);
    }
}

/**
 * Initialize charts
 */
function initCharts() {
    // Weekly chart
    const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
    weeklyChart = new Chart(weeklyCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Blinks',
                data: [],
                backgroundColor: 'rgba(13, 110, 253, 0.5)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // Hourly chart
    const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
    hourlyChart = new Chart(hourlyCtx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
            datasets: [{
                label: 'Blinks',
                data: Array(24).fill(0),
                backgroundColor: 'rgba(25, 135, 84, 0.2)',
                borderColor: 'rgba(25, 135, 84, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

/**
 * Update charts
 */
async function updateCharts() {
    // Update weekly chart
    const weeklyStats = await db.getWeeklyStats();
    weeklyChart.data.labels = weeklyStats.days;
    weeklyChart.data.datasets[0].data = weeklyStats.counts;
    weeklyChart.update();

    // Update hourly chart
    const hourlyData = await db.getHourlyDistribution();
    hourlyChart.data.datasets[0].data = hourlyData;
    hourlyChart.update();
}

/**
 * Update recent sessions list
 */
async function updateRecentSessions() {
    const sessions = await db.getRecentSessions(5);
    const container = document.getElementById('recentSessions');

    if (sessions.length === 0) {
        container.innerHTML = '<div class="text-center text-muted"><i class="fas fa-info-circle me-2"></i>No sessions yet</div>';
        return;
    }

    container.innerHTML = sessions.map(session => {
        const startDate = new Date(session.startTime);
        const duration = session.duration ? Math.floor(session.duration / 1000) : 0;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const bpm = duration > 0 ? (session.blinkCount / (duration / 60000)).toFixed(1) : 0;

        return `
            <div class="session-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${startDate.toLocaleDateString()}</strong>
                        <small class="text-muted ms-2">${startDate.toLocaleTimeString()}</small>
                    </div>
                    <span class="badge bg-primary">${session.blinkCount} blinks</span>
                </div>
                <div class="mt-2 small text-muted">
                    <i class="fas fa-clock me-1"></i>${minutes}m ${seconds}s
                    <span class="ms-3"><i class="fas fa-tachometer-alt me-1"></i>${bpm} BPM</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Update EAR threshold
 */
function updateThreshold(value) {
    blinkDetector.setThreshold(parseFloat(value));
    document.getElementById('earThresholdValue').textContent = value;
    db.saveSetting('earThreshold', value);
}

/**
 * Update consecutive frames
 */
function updateConsecutiveFrames(value) {
    blinkDetector.setConsecutiveFrames(parseInt(value));
    document.getElementById('consecutiveFramesValue').textContent = value;
    db.saveSetting('consecutiveFrames', value);
}

/**
 * Toggle glasses mode
 */
function toggleGlassesMode() {
    const glassesMode = document.getElementById('glassesMode').checked;
    blinkDetector.setGlassesMode(glassesMode);
    db.saveSetting('glassesMode', glassesMode);
    
    if (glassesMode) {
        console.log('%c👓 Glasses Mode Enabled', 'color: #0d6efd; font-weight: bold; font-size: 14px;');
        console.log('Using more sensitive detection (0.06 EAR drop instead of 0.08)');
        console.log('Better for glasses wearers with reflections');
    } else {
        console.log('Glasses mode disabled - using standard detection');
    }
}

/**
 * Toggle landmarks display
 */
function toggleLandmarks() {
    showLandmarks = document.getElementById('showLandmarks').checked;
    db.saveSetting('showLandmarks', showLandmarks);
}

/**
 * Toggle debug mode
 */
function toggleDebugMode() {
    const debugMode = document.getElementById('debugMode').checked;
    blinkDetector.setDebugMode(debugMode);
    db.saveSetting('debugMode', debugMode);
    
    if (debugMode) {
        console.log('%c🔍 Debug Mode Enabled', 'color: #0d6efd; font-weight: bold; font-size: 14px;');
        console.log('Watch the console for real-time blink detection logs');
        console.log('Current EAR will be logged when eyes close/open');
    } else {
        console.log('Debug mode disabled');
    }
}

/**
 * Load settings from database
 */
async function loadSettings() {
    const earThreshold = await db.getSetting('earThreshold', '0.25');
    const consecutiveFrames = await db.getSetting('consecutiveFrames', '1');
    const glassesMode = await db.getSetting('glassesMode', false);
    const showLandmarksValue = await db.getSetting('showLandmarks', false);
    const debugModeValue = await db.getSetting('debugMode', false);

    document.getElementById('earThreshold').value = earThreshold;
    document.getElementById('earThresholdValue').textContent = earThreshold;
    blinkDetector.setThreshold(parseFloat(earThreshold));

    document.getElementById('consecutiveFrames').value = consecutiveFrames;
    document.getElementById('consecutiveFramesValue').textContent = consecutiveFrames;
    blinkDetector.setConsecutiveFrames(parseInt(consecutiveFrames));

    document.getElementById('glassesMode').checked = glassesMode;
    blinkDetector.setGlassesMode(glassesMode);

    document.getElementById('showLandmarks').checked = showLandmarksValue;
    showLandmarks = showLandmarksValue;

    document.getElementById('debugMode').checked = debugModeValue;
    blinkDetector.setDebugMode(debugModeValue);
}

/**
 * Export data as JSON
 */
async function exportData() {
    try {
        const data = await db.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eye-blink-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('Data exported successfully');
    } catch (error) {
        console.error('Failed to export data:', error);
        alert('Failed to export data');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Handle page unload
window.addEventListener('beforeunload', async (e) => {
    if (isTracking) {
        e.preventDefault();
        e.returnValue = 'You have an active tracking session. Are you sure you want to leave?';
    }
});
