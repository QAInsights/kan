/**
 * Blink Detection using MediaPipe Face Mesh
 * Implements Eye Aspect Ratio (EAR) algorithm
 */

class BlinkDetector {
    constructor(onBlinkCallback) {
        this.onBlinkCallback = onBlinkCallback;
        
        // Eye landmark indices for MediaPipe Face Mesh (improved indices)
        // Using more reliable landmarks for better detection
        this.LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144];
        this.RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380];
        
        // Detection parameters - optimized for better accuracy
        this.EAR_THRESHOLD = 0.25;  // Higher default - will need adjustment per user
        this.CONSECUTIVE_FRAMES = 1;  // Reduced to 1 for immediate response
        this.MIN_BLINK_DURATION = 30;  // Minimum blink duration in ms (lowered for fast blinks)
        this.MAX_BLINK_DURATION = 500;  // Maximum blink duration in ms
        this.EAR_DROP_THRESHOLD = 0.08;  // Minimum EAR drop to consider a blink
        this.GLASSES_MODE = false;  // Glasses mode for better detection with eyewear
        this.GLASSES_EAR_DROP = 0.06;  // Smaller drop threshold for glasses (more sensitive)
        
        // State tracking
        this.blinkCounter = 0;
        this.frameCounter = 0;
        this.openFrameCounter = 0;  // Track open eye frames
        this.isBlinking = false;
        this.eyesClosed = false;
        this.eyesClosedStartTime = null;
        
        // EAR history for smoothing
        this.earHistory = [];
        this.earHistorySize = 3;
        
        // Baseline tracking for adaptive detection
        this.baselineEAR = 0;
        this.baselineHistory = [];
        this.baselineHistorySize = 30;  // Track last 30 frames for baseline
        
        // Statistics
        this.totalBlinks = 0;
        this.sessionStartTime = null;
        this.lastBlinkTime = null;
        
        // Debug mode
        this.debugMode = false;
        this.currentEAR = 0;
        this.useAdaptiveThreshold = true;  // Use adaptive detection by default
    }

    /**
     * Calculate Eye Aspect Ratio (EAR)
     * EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
     */
    calculateEAR(eyeLandmarks) {
        // Vertical distances
        const v1 = this.euclideanDistance(eyeLandmarks[1], eyeLandmarks[5]);
        const v2 = this.euclideanDistance(eyeLandmarks[2], eyeLandmarks[4]);
        
        // Horizontal distance
        const h = this.euclideanDistance(eyeLandmarks[0], eyeLandmarks[3]);
        
        // EAR calculation
        const ear = (v1 + v2) / (2.0 * h);
        return ear;
    }

    /**
     * Calculate Euclidean distance between two points
     */
    euclideanDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = point1.z - point2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Extract eye landmarks from face mesh results
     */
    getEyeLandmarks(landmarks, eyeIndices) {
        return eyeIndices.map(index => landmarks[index]);
    }

    /**
     * Smooth EAR value using moving average
     */
    smoothEAR(ear) {
        this.earHistory.push(ear);
        if (this.earHistory.length > this.earHistorySize) {
            this.earHistory.shift();
        }
        
        const sum = this.earHistory.reduce((a, b) => a + b, 0);
        return sum / this.earHistory.length;
    }

    /**
     * Update baseline EAR (average when eyes are open)
     */
    updateBaseline(ear) {
        // Only update baseline when eyes are open
        if (!this.eyesClosed && ear > this.EAR_THRESHOLD * 0.8) {
            this.baselineHistory.push(ear);
            if (this.baselineHistory.length > this.baselineHistorySize) {
                this.baselineHistory.shift();
            }
            
            if (this.baselineHistory.length > 0) {
                const sum = this.baselineHistory.reduce((a, b) => a + b, 0);
                this.baselineEAR = sum / this.baselineHistory.length;
            }
        }
    }

    /**
     * Get adaptive threshold based on baseline
     */
    getAdaptiveThreshold() {
        if (this.baselineEAR > 0 && this.useAdaptiveThreshold) {
            // Use smaller drop threshold for glasses mode (more sensitive)
            const dropThreshold = this.GLASSES_MODE ? this.GLASSES_EAR_DROP : this.EAR_DROP_THRESHOLD;
            return this.baselineEAR - dropThreshold;
        }
        return this.EAR_THRESHOLD;
    }

    /**
     * Enable/disable glasses mode
     */
    setGlassesMode(enabled) {
        this.GLASSES_MODE = enabled;
        if (this.debugMode) {
            console.log('Glasses mode:', enabled ? 'ENABLED' : 'DISABLED');
            console.log('EAR drop threshold:', enabled ? this.GLASSES_EAR_DROP : this.EAR_DROP_THRESHOLD);
        }
    }

    /**
     * Process face mesh results to detect blinks (IMPROVED)
     */
    processResults(results) {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            // Reset counters if no face detected
            this.frameCounter = 0;
            this.openFrameCounter = 0;
            return { detected: false, ear: 0 };
        }

        const landmarks = results.multiFaceLandmarks[0];
        
        // Get eye landmarks
        const leftEye = this.getEyeLandmarks(landmarks, this.LEFT_EYE_INDICES);
        const rightEye = this.getEyeLandmarks(landmarks, this.RIGHT_EYE_INDICES);
        
        // Calculate EAR for both eyes
        const leftEAR = this.calculateEAR(leftEye);
        const rightEAR = this.calculateEAR(rightEye);
        
        // Average EAR with smoothing
        const rawEAR = (leftEAR + rightEAR) / 2.0;
        const avgEAR = this.smoothEAR(rawEAR);
        this.currentEAR = avgEAR;
        
        // Update baseline for adaptive thresholding
        this.updateBaseline(avgEAR);
        
        // Get current threshold (adaptive or fixed)
        const currentThreshold = this.getAdaptiveThreshold();
        
        // Improved blink detection logic
        if (avgEAR < currentThreshold) {
            // Eyes appear closed
            this.frameCounter++;
            this.openFrameCounter = 0;
            
            if (this.frameCounter >= this.CONSECUTIVE_FRAMES && !this.eyesClosed) {
                // Eyes confirmed closed
                this.eyesClosed = true;
                this.eyesClosedStartTime = Date.now();
                
                if (this.debugMode) {
                    console.log('Eyes closed detected, EAR:', avgEAR.toFixed(3), 
                               'Threshold:', currentThreshold.toFixed(3),
                               'Baseline:', this.baselineEAR.toFixed(3));
                }
            }
        } else {
            // Eyes appear open
            this.openFrameCounter++;
            
            if (this.eyesClosed && this.openFrameCounter >= this.CONSECUTIVE_FRAMES) {
                // Eyes confirmed open after being closed
                const blinkDuration = Date.now() - this.eyesClosedStartTime;
                
                // Validate blink duration (filter out false positives)
                if (blinkDuration >= this.MIN_BLINK_DURATION && 
                    blinkDuration <= this.MAX_BLINK_DURATION) {
                    
                    // Valid blink detected!
                    this.totalBlinks++;
                    this.lastBlinkTime = Date.now();
                    
                    if (this.debugMode) {
                        console.log('✅ Blink detected! Duration:', blinkDuration, 'ms, EAR:', avgEAR.toFixed(3),
                                   'Threshold:', currentThreshold.toFixed(3));
                    }
                    
                    if (this.onBlinkCallback) {
                        this.onBlinkCallback();
                    }
                } else if (this.debugMode) {
                    console.log('Invalid blink duration:', blinkDuration, 'ms (ignored)');
                }
                
                this.eyesClosed = false;
                this.eyesClosedStartTime = null;
            }
            
            this.frameCounter = 0;
        }
        
        return {
            detected: true,
            ear: avgEAR,
            rawEAR: rawEAR,
            leftEAR: leftEAR,
            rightEAR: rightEAR,
            leftEye,
            rightEye,
            landmarks,
            eyesClosed: this.eyesClosed,
            threshold: currentThreshold,
            baseline: this.baselineEAR
        };
    }

    /**
     * Update detection threshold
     */
    setThreshold(threshold) {
        this.EAR_THRESHOLD = threshold;
    }

    /**
     * Update consecutive frames requirement
     */
    setConsecutiveFrames(frames) {
        this.CONSECUTIVE_FRAMES = frames;
    }

    /**
     * Reset statistics
     */
    reset() {
        this.totalBlinks = 0;
        this.frameCounter = 0;
        this.openFrameCounter = 0;
        this.eyesClosed = false;
        this.eyesClosedStartTime = null;
        this.earHistory = [];
        this.sessionStartTime = Date.now();
        this.lastBlinkTime = null;
    }

    /**
     * Enable/disable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        if (enabled) {
            console.log('Blink detector debug mode enabled');
            console.log('Current settings:', {
                threshold: this.EAR_THRESHOLD,
                consecutiveFrames: this.CONSECUTIVE_FRAMES,
                minDuration: this.MIN_BLINK_DURATION,
                maxDuration: this.MAX_BLINK_DURATION
            });
        }
    }

    /**
     * Get current EAR value (for debugging)
     */
    getCurrentEAR() {
        return this.currentEAR;
    }

    /**
     * Get current statistics
     */
    getStats() {
        const now = Date.now();
        const sessionDuration = this.sessionStartTime ? (now - this.sessionStartTime) / 1000 : 0;
        const blinksPerMinute = sessionDuration > 0 ? (this.totalBlinks / (sessionDuration / 60)).toFixed(1) : 0;
        
        return {
            totalBlinks: this.totalBlinks,
            sessionDuration: Math.floor(sessionDuration),
            blinksPerMinute: parseFloat(blinksPerMinute),
            lastBlinkTime: this.lastBlinkTime
        };
    }

    /**
     * Draw eye landmarks on canvas
     */
    drawEyeLandmarks(ctx, leftEye, rightEye, canvasWidth, canvasHeight) {
        const drawEye = (eye, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            eye.forEach((point, index) => {
                const x = point.x * canvasWidth;
                const y = point.y * canvasHeight;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.closePath();
            ctx.stroke();
            
            // Draw points
            ctx.fillStyle = color;
            eye.forEach(point => {
                const x = point.x * canvasWidth;
                const y = point.y * canvasHeight;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 2 * Math.PI);
                ctx.fill();
            });
        };
        
        drawEye(leftEye, '#00ff00');
        drawEye(rightEye, '#00ff00');
    }

    /**
     * Draw face mesh on canvas
     */
    drawFaceMesh(ctx, landmarks, canvasWidth, canvasHeight) {
        ctx.fillStyle = '#00ff00';
        
        landmarks.forEach(point => {
            const x = point.x * canvasWidth;
            const y = point.y * canvasHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
}
