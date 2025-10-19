/**
 * Voice Control for Eye Blink Tracker Web App
 * Commands: Start, Stop, Stats
 * Uses localStorage and DOM elements (no database dependency)
 */

class VoiceController {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isEnabled = false;
        
        console.log('Voice Controller initializing...');
        this.initializeSpeechRecognition();
        this.createUI();
    }
    
    initializeSpeechRecognition() {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported');
            return;
        }
        
        // Initialize recognition
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;
        
        // Event handlers
        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript.toLowerCase().trim();
            const confidence = event.results[last][0].confidence;
            
            console.log(`Voice command: "${command}" (${(confidence * 100).toFixed(0)}% confidence)`);
            this.showCommandFeedback(command);
            this.processCommand(command);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            
            if (event.error === 'not-allowed') {
                this.showNotification('Microphone permission denied. Please allow microphone access.', 'danger');
                this.stopListening();
            } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
                console.warn(`Voice error: ${event.error}`);
            }
        };
        
        this.recognition.onend = () => {
            // Auto-restart if still enabled
            if (this.isEnabled) {
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        // Ignore errors during restart
                    }
                }, 200);
            } else {
                this.isListening = false;
                this.updateUI();
            }
        };
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI();
            console.log('Voice recognition listening...');
        };
        
        console.log('✓ Speech recognition initialized');
    }
    
    createUI() {
        // Add voice control button to navbar
        const navbar = document.querySelector('.navbar .d-flex');
        if (!navbar) return;
        
        // Create voice button
        const voiceBtn = document.createElement('button');
        voiceBtn.id = 'voiceControlBtn';
        voiceBtn.className = 'btn btn-outline-primary btn-sm ms-2';
        voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        voiceBtn.title = 'Voice Control (Click to enable)';
        voiceBtn.onclick = () => this.toggleVoiceControl();
        
        // Insert before export button
        navbar.insertBefore(voiceBtn, navbar.firstChild);
        
        // Create listening indicator
        const indicator = document.createElement('div');
        indicator.id = 'voiceIndicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 0.75rem 1.25rem;
            border-radius: 50px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            z-index: 1050;
            font-weight: 600;
            display: none;
            align-items: center;
            gap: 0.5rem;
            animation: slideInLeft 0.3s ease-out;
        `;
        indicator.innerHTML = '<i class="fas fa-microphone"></i> <span id="voiceCommandText">Listening...</span>';
        
        document.body.appendChild(indicator);
        
        console.log('✓ Voice UI created');
    }
    
    toggleVoiceControl() {
        if (!this.recognition) {
            this.showNotification('Voice control not supported in this browser. Use Chrome or Edge.', 'warning');
            return;
        }
        
        this.isEnabled = !this.isEnabled;
        
        if (this.isEnabled) {
            this.startListening();
        } else {
            this.stopListening();
        }
    }
    
    startListening() {
        try {
            this.recognition.start();
            this.isEnabled = true;
            this.updateUI();
            
            this.speak('Voice control activated. Say start, stop, or stats.');
            this.showNotification('🎤 Voice control enabled. Say "Start", "Stop", or "Stats"', 'success');
            
        } catch (e) {
            if (e.name === 'InvalidStateError') {
                // Already started, just enable it
                this.isEnabled = true;
                this.updateUI();
            } else {
                console.error('Error starting recognition:', e);
                this.showNotification('Could not start voice control: ' + e.message, 'danger');
            }
        }
    }
    
    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
        
        this.isEnabled = false;
        this.isListening = false;
        this.updateUI();
        
        this.showNotification('Voice control disabled', 'info');
    }
    
    updateUI() {
        const btn = document.getElementById('voiceControlBtn');
        const indicator = document.getElementById('voiceIndicator');
        
        if (!btn || !indicator) return;
        
        if (this.isListening && this.isEnabled) {
            btn.innerHTML = '<i class="fas fa-microphone"></i>';
            btn.className = 'btn btn-success btn-sm ms-2';
            btn.title = 'Voice Control ON (Click to disable)';
            btn.style.animation = 'pulse 2s infinite';
            
            indicator.style.display = 'flex';
        } else {
            btn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            btn.className = 'btn btn-outline-primary btn-sm ms-2';
            btn.title = 'Voice Control OFF (Click to enable)';
            btn.style.animation = '';
            
            indicator.style.display = 'none';
        }
    }
    
    processCommand(command) {
        const cmd = command.toLowerCase();
        
        // Match commands (flexible matching)
        if (cmd.includes('start') && !cmd.includes('restart')) {
            this.handleStartCommand();
        } else if (cmd.includes('stop')) {
            this.handleStopCommand();
        } else if (cmd.includes('stat') || cmd.includes('status')) {
            this.handleStatsCommand();
        } else if (cmd.includes('pause')) {
            this.handlePauseCommand();
        } else if (cmd.includes('resume')) {
            this.handleResumeCommand();
        } else {
            console.log(`Unrecognized command: "${command}"`);
            // Don't announce unrecognized commands to avoid annoyance
        }
    }
    
    handleStartCommand() {
        console.log('Voice: START command');
        this.speak('Starting eye blink tracking');
        
        setTimeout(() => {
            if (typeof startTracking === 'function') {
                startTracking();
            } else {
                this.speak('Start function not available');
            }
        }, 500);
    }
    
    handleStopCommand() {
        console.log('Voice: STOP command');
        this.speak('Stopping eye blink tracking');
        
        setTimeout(() => {
            if (typeof stopTracking === 'function') {
                stopTracking();
            } else {
                this.speak('Stop function not available');
            }
        }, 500);
    }
    
    handlePauseCommand() {
        console.log('Voice: PAUSE command');
        this.speak('Pausing tracking');
        
        setTimeout(() => {
            if (typeof pauseTracking === 'function') {
                pauseTracking();
            } else {
                this.speak('Pause function not available');
            }
        }, 500);
    }
    
    handleResumeCommand() {
        console.log('Voice: RESUME command');
        this.speak('Resuming tracking');
        
        setTimeout(() => {
            if (typeof resumeTracking === 'function') {
                resumeTracking();
            } else {
                this.speak('Resume function not available');
            }
        }, 500);
    }
    
    async handleStatsCommand() {
        console.log('Voice: STATS command - Reading from DOM and localStorage');
        
        try {
            // Read stats directly from the DOM elements (what's displayed on screen)
            const sessionBlinks = parseInt(document.getElementById('sessionBlinks')?.textContent || '0');
            const bpm = parseInt(document.getElementById('blinksPerMinute')?.textContent || '0');
            const totalBlinks = parseInt(document.getElementById('totalBlinks')?.textContent || '0');
            const todayBlinks = parseInt(document.getElementById('todayBlinks')?.textContent || '0');
            const avgPerDay = parseInt(document.getElementById('avgPerDay')?.textContent || '0');
            const avgBPM = parseInt(document.getElementById('avgBPM')?.textContent || '0');
            
            console.log('Stats read from DOM:', {
                sessionBlinks, bpm, totalBlinks, todayBlinks, avgPerDay, avgBPM
            });
            
            // Build stats message
            let message = 'Here are your eye blink statistics. ';
            
            // Current session stats (if tracking)
            if (sessionBlinks > 0) {
                message += `Current session: ${sessionBlinks} blinks at ${bpm} blinks per minute. `;
            }
            
            // Overall stats
            if (totalBlinks > 0) {
                message += `Total blinks recorded: ${totalBlinks}. `;
            }
            
            if (todayBlinks > 0) {
                message += `Today: ${todayBlinks} blinks. `;
            }
            
            if (avgPerDay > 0) {
                message += `Daily average: ${avgPerDay} blinks. `;
            }
            
            if (avgBPM > 0) {
                message += `Overall average rate: ${avgBPM} blinks per minute. `;
            }
            
            // Blink rate health assessment for current session
            if (bpm > 0) {
                if (bpm < 10) {
                    message += 'Your current blink rate is low. Consider taking a break and resting your eyes.';
                } else if (bpm >= 15 && bpm <= 20) {
                    message += 'Your current blink rate is healthy. Great job!';
                } else if (bpm > 30) {
                    message += 'Your current blink rate is high. You may be stressed or fatigued.';
                }
            } else if (totalBlinks === 0 && sessionBlinks === 0) {
                message = 'No blink data recorded yet. Start tracking to collect statistics.';
            }
            
            console.log('Speaking stats message:', message);
            this.speak(message);
            
        } catch (error) {
            console.error('Error getting stats:', error);
            this.speak('Error retrieving statistics. Please check the console for details.');
        }
    }
    
    speak(text) {
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        utterance.lang = 'en-US';
        
        // Use a more natural voice if available
        const voices = this.synthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') && (voice.name.includes('Female') || voice.name.includes('Samantha'))
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        this.synthesis.speak(utterance);
        console.log(`Speaking: "${text}"`);
    }
    
    showCommandFeedback(command) {
        const indicator = document.getElementById('voiceIndicator');
        const textSpan = document.getElementById('voiceCommandText');
        
        if (!indicator || !textSpan) return;
        
        // Show command
        textSpan.textContent = `"${command}"`;
        indicator.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        indicator.style.transform = 'scale(1.05)';
        indicator.style.boxShadow = '0 6px 20px rgba(245, 87, 108, 0.6)';
        
        // Reset after 2 seconds
        setTimeout(() => {
            textSpan.textContent = 'Listening...';
            indicator.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            indicator.style.transform = 'scale(1)';
            indicator.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        }, 2000);
    }
    
    showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            min-width: 300px;
            max-width: 400px;
            z-index: 1060;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Global voice controller instance
let voiceController;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Initializing voice controller...');
        voiceController = new VoiceController();
    });
} else {
    console.log('DOM already ready, initializing voice controller...');
    voiceController = new VoiceController();
}

// Add CSS animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInLeft {
        from {
            transform: translateX(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    #voiceControlBtn {
        transition: all 0.3s ease;
    }
    
    #voiceControlBtn:hover {
        transform: scale(1.05);
    }
    
    #voiceIndicator {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);
