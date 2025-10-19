/**
 * Voice Control for Eye Blink Tracker
 * Supports commands: Start, Stop, Stats
 */

class VoiceControl {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isEnabled = false;
        
        this.initializeSpeechRecognition();
        this.setupUI();
    }
    
    initializeSpeechRecognition() {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported in this browser');
            this.showNotification('Voice control not supported in this browser', 'warning');
            return;
        }
        
        // Initialize recognition
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        
        // Event handlers
        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript.toLowerCase().trim();
            
            console.log('Voice command received:', command);
            this.processCommand(command);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            
            if (event.error === 'no-speech') {
                console.log('No speech detected, continuing...');
            } else if (event.error === 'aborted') {
                console.log('Speech recognition aborted');
            } else {
                this.showNotification(`Voice error: ${event.error}`, 'error');
            }
        };
        
        this.recognition.onend = () => {
            // Auto-restart if still enabled
            if (this.isEnabled && this.isListening) {
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        console.log('Recognition restart delayed');
                    }
                }, 100);
            }
        };
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceIndicator(true);
            console.log('Voice recognition started');
        };
    }
    
    setupUI() {
        // Create voice control button
        const voiceBtn = document.createElement('button');
        voiceBtn.id = 'voice-control-btn';
        voiceBtn.className = 'btn btn-voice';
        voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Voice Control: OFF';
        voiceBtn.onclick = () => this.toggleVoiceControl();
        
        // Create voice indicator
        const voiceIndicator = document.createElement('div');
        voiceIndicator.id = 'voice-indicator';
        voiceIndicator.className = 'voice-indicator';
        voiceIndicator.innerHTML = '<i class="fas fa-microphone"></i> Listening...';
        voiceIndicator.style.display = 'none';
        
        // Create voice commands help
        const helpBtn = document.createElement('button');
        helpBtn.className = 'btn btn-sm btn-outline-secondary ms-2';
        helpBtn.innerHTML = '<i class="fas fa-question-circle"></i>';
        helpBtn.onclick = () => this.showVoiceHelp();
        helpBtn.title = 'Voice Commands Help';
        
        // Add to navbar
        const navbar = document.querySelector('.navbar-nav');
        if (navbar) {
            const voiceContainer = document.createElement('div');
            voiceContainer.className = 'd-flex align-items-center ms-3';
            voiceContainer.appendChild(voiceBtn);
            voiceContainer.appendChild(helpBtn);
            navbar.appendChild(voiceContainer);
        }
        
        // Add indicator to body
        document.body.appendChild(voiceIndicator);
    }
    
    toggleVoiceControl() {
        if (!this.recognition) {
            this.showNotification('Voice control not available', 'error');
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
            
            const btn = document.getElementById('voice-control-btn');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-microphone"></i> Voice Control: ON';
                btn.classList.add('btn-success');
                btn.classList.remove('btn-voice');
            }
            
            this.speak('Voice control activated. Say start, stop, or stats.');
            this.showNotification('Voice control enabled', 'success');
            
        } catch (e) {
            console.error('Error starting recognition:', e);
            this.showNotification('Could not start voice control', 'error');
        }
    }
    
    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
        
        this.isEnabled = false;
        this.isListening = false;
        
        const btn = document.getElementById('voice-control-btn');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-microphone-slash"></i> Voice Control: OFF';
            btn.classList.remove('btn-success');
            btn.classList.add('btn-voice');
        }
        
        this.updateVoiceIndicator(false);
        this.showNotification('Voice control disabled', 'info');
    }
    
    updateVoiceIndicator(isListening) {
        const indicator = document.getElementById('voice-indicator');
        if (indicator) {
            indicator.style.display = isListening ? 'block' : 'none';
        }
    }
    
    processCommand(command) {
        console.log('Processing command:', command);
        
        // Highlight the command briefly
        this.highlightVoiceCommand(command);
        
        // Match commands (flexible matching)
        if (command.includes('start')) {
            this.handleStartCommand();
        } else if (command.includes('stop')) {
            this.handleStopCommand();
        } else if (command.includes('stat') || command.includes('status')) {
            this.handleStatsCommand();
        } else if (command.includes('pause')) {
            this.handlePauseCommand();
        } else if (command.includes('resume')) {
            this.handleResumeCommand();
        } else if (command.includes('help')) {
            this.showVoiceHelp();
        } else {
            console.log('Unrecognized command:', command);
            this.speak('Command not recognized. Say help for available commands.');
        }
    }
    
    async handleStartCommand() {
        console.log('Executing START command');
        this.speak('Starting eye blink tracking');
        
        try {
            // Check if already tracking
            const statusResponse = await fetch('/api/status');
            const status = await statusResponse.json();
            
            if (status.is_tracking && !status.is_paused) {
                this.speak('Tracking is already active');
                return;
            }
            
            // Start tracking
            const response = await fetch('/api/tracking/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.speak('Tracking started successfully');
                this.showNotification('Tracking started via voice command', 'success');
            } else {
                this.speak('Failed to start tracking');
                this.showNotification('Failed to start tracking', 'error');
            }
        } catch (error) {
            console.error('Error starting tracking:', error);
            this.speak('Error starting tracking');
            this.showNotification('Error: ' + error.message, 'error');
        }
    }
    
    async handleStopCommand() {
        console.log('Executing STOP command');
        this.speak('Stopping eye blink tracking');
        
        try {
            const response = await fetch('/api/tracking/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.speak('Tracking stopped');
                this.showNotification('Tracking stopped via voice command', 'info');
            } else {
                this.speak('Failed to stop tracking');
                this.showNotification('Failed to stop tracking', 'error');
            }
        } catch (error) {
            console.error('Error stopping tracking:', error);
            this.speak('Error stopping tracking');
            this.showNotification('Error: ' + error.message, 'error');
        }
    }
    
    async handlePauseCommand() {
        console.log('Executing PAUSE command');
        this.speak('Pausing tracking');
        
        try {
            const response = await fetch('/api/tracking/pause', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.speak('Tracking paused');
                this.showNotification('Tracking paused via voice command', 'info');
            }
        } catch (error) {
            console.error('Error pausing tracking:', error);
            this.speak('Error pausing tracking');
        }
    }
    
    async handleResumeCommand() {
        console.log('Executing RESUME command');
        this.speak('Resuming tracking');
        
        try {
            const response = await fetch('/api/tracking/resume', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.speak('Tracking resumed');
                this.showNotification('Tracking resumed via voice command', 'success');
            }
        } catch (error) {
            console.error('Error resuming tracking:', error);
            this.speak('Error resuming tracking');
        }
    }
    
    async handleStatsCommand() {
        console.log('Executing STATS command');
        
        try {
            // Get current statistics
            const statsResponse = await fetch('/api/statistics/summary');
            const stats = await statsResponse.json();
            
            const statusResponse = await fetch('/api/status');
            const status = await statusResponse.json();
            
            // Build stats message
            let message = 'Here are your eye blink statistics. ';
            
            if (status.is_tracking) {
                const trackingStats = status.tracking_stats || {};
                message += `Current session: ${trackingStats.session_blinks || 0} blinks. `;
                message += `Blink rate: ${Math.round(trackingStats.blinks_per_minute || 0)} per minute. `;
            }
            
            message += `Total blinks today: ${stats.today_blinks || 0}. `;
            message += `All time total: ${stats.total_blinks || 0} blinks. `;
            message += `Average per day: ${Math.round(stats.average_per_day || 0)}. `;
            
            this.speak(message);
            
            // Also show visual notification
            this.showNotification('Stats read aloud', 'info');
            
        } catch (error) {
            console.error('Error getting stats:', error);
            this.speak('Error retrieving statistics');
            this.showNotification('Error getting stats', 'error');
        }
    }
    
    speak(text) {
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';
        
        this.synthesis.speak(utterance);
    }
    
    highlightVoiceCommand(command) {
        const indicator = document.getElementById('voice-indicator');
        if (indicator) {
            indicator.innerHTML = `<i class="fas fa-microphone"></i> "${command}"`;
            indicator.classList.add('voice-command-active');
            
            setTimeout(() => {
                indicator.innerHTML = '<i class="fas fa-microphone"></i> Listening...';
                indicator.classList.remove('voice-command-active');
            }, 2000);
        }
    }
    
    showVoiceHelp() {
        const helpText = `
            <h5>Voice Commands</h5>
            <ul class="list-unstyled">
                <li><strong>"Start"</strong> - Start eye blink tracking</li>
                <li><strong>"Stop"</strong> - Stop eye blink tracking</li>
                <li><strong>"Stats"</strong> or <strong>"Status"</strong> - Hear current statistics</li>
                <li><strong>"Pause"</strong> - Pause tracking</li>
                <li><strong>"Resume"</strong> - Resume tracking</li>
                <li><strong>"Help"</strong> - Show this help</li>
            </ul>
            <p class="text-muted"><small>Click the microphone button to enable/disable voice control</small></p>
        `;
        
        // Create or update help modal
        let modal = document.getElementById('voiceHelpModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'voiceHelpModal';
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Voice Control Help</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="voiceHelpContent"></div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        document.getElementById('voiceHelpContent').innerHTML = helpText;
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
    
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Initialize voice control when page loads
let voiceControl;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing voice control...');
    voiceControl = new VoiceControl();
});
