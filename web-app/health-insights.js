/**
 * Health Insights Module
 * Provides evidence-based health recommendations based on blink patterns
 * 
 * Medical References:
 * 1. Tsubota, K., & Nakamori, K. (1993). "Dry eyes and video display terminals." 
 *    New England Journal of Medicine, 328(8), 584.
 * 2. Patel, S., et al. (2011). "Normal values for spontaneous blink rate." 
 *    Optometry and Vision Science, 88(9), 1036-1040.
 * 3. Bentivoglio, A. R., et al. (1997). "Analysis of blink rate patterns in normal subjects."
 *    Movement Disorders, 12(6), 1028-1034.
 * 4. Rosenfield, M. (2016). "Computer vision syndrome (a.k.a. digital eye strain)."
 *    Optometry in Practice, 17(1), 1-10.
 */

class HealthInsights {
    constructor() {
        // Normal blink rate ranges (per minute) based on medical literature
        this.NORMAL_BLINK_RATE = {
            min: 12,
            max: 20,
            optimal: 15
        };

        // Thresholds for health alerts
        this.VERY_LOW_THRESHOLD = 8;   // <8 BPM - Severe reduction
        this.LOW_THRESHOLD = 12;        // <12 BPM - Reduced blinking
        this.HIGH_THRESHOLD = 20;       // >20 BPM - Increased blinking
        this.VERY_HIGH_THRESHOLD = 30;  // >30 BPM - Excessive blinking

        // Session duration thresholds (minutes)
        this.SHORT_BREAK_INTERVAL = 20;  // 20-20-20 rule
        this.LONG_BREAK_INTERVAL = 60;   // Hourly break
        this.MAX_CONTINUOUS_WORK = 120;  // 2 hours max

        // Tracking
        this.lastAlertTime = {};
        this.alertCooldown = 300000; // 5 minutes between same alerts
    }

    /**
     * Analyze blink patterns and provide health insights
     */
    analyzeBlinkPattern(stats) {
        const insights = {
            status: 'normal',
            level: 'info',
            title: '',
            message: '',
            recommendations: [],
            medicalNote: '',
            severity: 0, // 0-3: info, warning, alert, critical
            icon: '👁️'
        };

        const bpm = parseFloat(stats.blinksPerMinute) || 0;
        const duration = stats.sessionDuration || 0;
        const durationMinutes = Math.floor(duration / 60);

        // Analyze blink rate
        if (bpm < this.VERY_LOW_THRESHOLD && bpm > 0) {
            insights.status = 'critical';
            insights.level = 'danger';
            insights.severity = 3;
            insights.icon = '🚨';
            insights.title = 'Severely Reduced Blink Rate';
            insights.message = `Your blink rate is ${bpm} per minute, which is significantly below the normal range (12-20 BPM). This is commonly associated with intense screen use.`;
            insights.medicalNote = 'Studies show that blink rate can decrease by up to 60% during computer use, leading to dry eye syndrome (Tsubota & Nakamori, 1993).';
            insights.recommendations = [
                '⚠️ Take an immediate break from the screen',
                '💧 Use artificial tears or lubricating eye drops',
                '👀 Practice conscious blinking exercises',
                '🏥 Consider consulting an eye care professional if symptoms persist',
                '💻 Reduce screen brightness and increase text size',
                '🌡️ Check room humidity (aim for 30-50%)'
            ];
        } else if (bpm < this.LOW_THRESHOLD && bpm > 0) {
            insights.status = 'warning';
            insights.level = 'warning';
            insights.severity = 2;
            insights.icon = '⚠️';
            insights.title = 'Reduced Blink Rate Detected';
            insights.message = `Your blink rate is ${bpm} per minute, below the normal range (12-20 BPM). This may indicate digital eye strain.`;
            insights.medicalNote = 'Normal spontaneous blink rate ranges from 12-20 blinks per minute (Patel et al., 2011). Reduced blinking can lead to tear film instability.';
            insights.recommendations = [
                '😌 Take a 20-second break every 20 minutes',
                '💧 Blink consciously and completely',
                '📏 Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds',
                '💻 Position screen 20-26 inches from eyes',
                '🌊 Stay hydrated - drink water regularly'
            ];
        } else if (bpm > this.VERY_HIGH_THRESHOLD) {
            insights.status = 'alert';
            insights.level = 'warning';
            insights.severity = 2;
            insights.icon = '⚡';
            insights.title = 'Excessive Blink Rate Detected';
            insights.message = `Your blink rate is ${bpm} per minute, significantly above normal (12-20 BPM). This may indicate eye irritation or fatigue.`;
            insights.medicalNote = 'Excessive blinking can be caused by dry eyes, eye irritation, allergies, or eye strain (Bentivoglio et al., 1997).';
            insights.recommendations = [
                '🛑 Take an immediate break from the screen',
                '💧 Check if eyes feel dry or irritated',
                '🌡️ Ensure proper lighting (avoid glare)',
                '🧹 Check for environmental irritants (dust, smoke, dry air)',
                '😎 Consider using blue light filtering glasses',
                '🏥 If persistent, consult an eye care professional'
            ];
        } else if (bpm > this.HIGH_THRESHOLD) {
            insights.status = 'elevated';
            insights.level = 'info';
            insights.severity = 1;
            insights.icon = '📊';
            insights.title = 'Elevated Blink Rate';
            insights.message = `Your blink rate is ${bpm} per minute, slightly above normal (12-20 BPM). This could indicate mild eye fatigue.`;
            insights.medicalNote = 'Slightly elevated blink rates may occur during tasks requiring concentration or in response to environmental factors.';
            insights.recommendations = [
                '😌 Take short breaks periodically',
                '💧 Ensure adequate hydration',
                '🌡️ Check room temperature and humidity',
                '💻 Adjust screen position and brightness'
            ];
        } else if (bpm >= this.NORMAL_BLINK_RATE.min && bpm <= this.NORMAL_BLINK_RATE.max) {
            insights.status = 'healthy';
            insights.level = 'success';
            insights.severity = 0;
            insights.icon = '✅';
            insights.title = 'Healthy Blink Rate';
            insights.message = `Your blink rate is ${bpm} per minute, within the normal range (12-20 BPM). Great job maintaining healthy eye habits!`;
            insights.medicalNote = 'You are maintaining a normal spontaneous blink rate, which helps keep your eyes lubricated and comfortable.';
            insights.recommendations = [
                '👍 Keep up the good habits!',
                '😌 Continue taking regular breaks',
                '💧 Maintain hydration',
                '🌟 Your eye health is on track'
            ];
        }

        // Check session duration
        if (durationMinutes >= this.MAX_CONTINUOUS_WORK) {
            insights.severity = Math.max(insights.severity, 3);
            insights.level = 'danger';
            insights.icon = '🛑';
            insights.title = 'Extended Screen Time Alert';
            insights.message = `You've been working for ${durationMinutes} minutes without a break. Extended screen time increases risk of eye strain.`;
            insights.recommendations.unshift(
                '🚨 TAKE A BREAK NOW - You\'ve exceeded recommended continuous screen time',
                '🚶 Stand up, walk around for 5-10 minutes',
                '👀 Give your eyes a complete rest from screens'
            );
        } else if (durationMinutes >= this.LONG_BREAK_INTERVAL) {
            insights.recommendations.push(
                `⏰ You've been working for ${durationMinutes} minutes - consider taking a longer break soon`
            );
        } else if (durationMinutes >= this.SHORT_BREAK_INTERVAL) {
            insights.recommendations.push(
                '⏰ Time for a 20-second break (20-20-20 rule)'
            );
        }

        return insights;
    }

    /**
     * Get general eye health tips
     */
    getGeneralTips() {
        return {
            title: '👁️ Eye Health Best Practices',
            tips: [
                {
                    title: '20-20-20 Rule',
                    description: 'Every 20 minutes, look at something 20 feet away for 20 seconds',
                    reference: 'American Optometric Association recommendation for reducing digital eye strain'
                },
                {
                    title: 'Proper Lighting',
                    description: 'Ensure room lighting is similar to screen brightness. Avoid glare and harsh overhead lighting',
                    reference: 'Rosenfield, M. (2016). Computer vision syndrome'
                },
                {
                    title: 'Screen Position',
                    description: 'Position screen 20-26 inches from eyes, slightly below eye level (15-20 degrees)',
                    reference: 'OSHA guidelines for computer workstation ergonomics'
                },
                {
                    title: 'Blink Consciously',
                    description: 'Make a conscious effort to blink completely and regularly, especially during screen use',
                    reference: 'Tsubota & Nakamori (1993). Dry eyes and video display terminals'
                },
                {
                    title: 'Humidity Control',
                    description: 'Maintain room humidity between 30-50% to prevent dry eyes',
                    reference: 'American Academy of Ophthalmology recommendations'
                },
                {
                    title: 'Regular Eye Exams',
                    description: 'Get comprehensive eye exams annually, or as recommended by your eye care professional',
                    reference: 'American Academy of Ophthalmology guidelines'
                },
                {
                    title: 'Hydration',
                    description: 'Drink adequate water throughout the day to maintain tear film quality',
                    reference: 'General health recommendation for eye lubrication'
                },
                {
                    title: 'Screen Breaks',
                    description: 'Take a 5-10 minute break every hour from screen work',
                    reference: 'Occupational health guidelines for VDT workers'
                }
            ]
        };
    }

    /**
     * Get symptoms guide for common eye conditions
     */
    getSymptomsGuide() {
        return {
            title: '🏥 Common Eye Symptoms & When to Seek Help',
            conditions: [
                {
                    name: 'Digital Eye Strain (Computer Vision Syndrome)',
                    symptoms: [
                        'Reduced blink rate (<12 BPM)',
                        'Eye fatigue or tiredness',
                        'Dry or irritated eyes',
                        'Blurred vision',
                        'Headaches',
                        'Neck and shoulder pain'
                    ],
                    selfCare: [
                        'Follow 20-20-20 rule',
                        'Adjust screen position and lighting',
                        'Use artificial tears',
                        'Take regular breaks'
                    ],
                    seekHelp: 'If symptoms persist after implementing ergonomic changes'
                },
                {
                    name: 'Dry Eye Syndrome',
                    symptoms: [
                        'Excessive blinking (>20 BPM)',
                        'Burning or stinging sensation',
                        'Redness',
                        'Sensitivity to light',
                        'Feeling of something in the eye'
                    ],
                    selfCare: [
                        'Use preservative-free artificial tears',
                        'Increase humidity in environment',
                        'Avoid direct air flow (fans, AC)',
                        'Stay hydrated'
                    ],
                    seekHelp: 'If symptoms are severe or don\'t improve with over-the-counter treatments'
                },
                {
                    name: 'Eye Fatigue',
                    symptoms: [
                        'Tired, heavy eyes',
                        'Difficulty focusing',
                        'Increased light sensitivity',
                        'Watery eyes'
                    ],
                    selfCare: [
                        'Get adequate sleep (7-9 hours)',
                        'Take frequent breaks',
                        'Ensure proper lighting',
                        'Consider computer glasses'
                    ],
                    seekHelp: 'If fatigue is persistent or affecting daily activities'
                }
            ],
            emergency: {
                title: '🚨 Seek Immediate Medical Attention If:',
                symptoms: [
                    'Sudden vision loss or significant vision changes',
                    'Severe eye pain',
                    'Eye injury',
                    'Flashes of light or floaters',
                    'Double vision',
                    'Red, painful eye with discharge'
                ]
            }
        };
    }

    /**
     * Check if alert should be shown (respects cooldown)
     */
    shouldShowAlert(alertType) {
        const now = Date.now();
        const lastAlert = this.lastAlertTime[alertType] || 0;
        
        if (now - lastAlert > this.alertCooldown) {
            this.lastAlertTime[alertType] = now;
            return true;
        }
        return false;
    }

    /**
     * Get medical disclaimer
     */
    getDisclaimer() {
        return {
            title: '⚕️ Medical Disclaimer',
            content: `
                <strong>IMPORTANT NOTICE:</strong>
                <br><br>
                This application is designed for educational and informational purposes only. 
                It is NOT a substitute for professional medical advice, diagnosis, or treatment.
                <br><br>
                <strong>Key Points:</strong>
                <ul>
                    <li>The health insights provided are based on general medical literature and research</li>
                    <li>Individual health conditions vary significantly</li>
                    <li>This tool does not diagnose medical conditions</li>
                    <li>Always consult qualified healthcare professionals for medical concerns</li>
                    <li>If you experience persistent eye problems, seek professional eye care</li>
                    <li>In case of emergency eye conditions, seek immediate medical attention</li>
                </ul>
                <br>
                <strong>References:</strong>
                <br>
                This application's health recommendations are based on peer-reviewed medical literature 
                including research from the New England Journal of Medicine, Optometry and Vision Science, 
                Movement Disorders, and guidelines from the American Academy of Ophthalmology and 
                American Optometric Association.
                <br><br>
                <strong>Data Privacy:</strong>
                <br>
                All blink data and health insights are stored locally on your device. 
                No health information is transmitted to external servers.
                <br><br>
                <em>By using this application, you acknowledge that you have read and understood this disclaimer.</em>
            `
        };
    }

    /**
     * Get blink rate interpretation
     */
    getBlinkRateInterpretation(bpm) {
        if (bpm === 0) {
            return {
                category: 'No Data',
                description: 'Start tracking to see your blink rate',
                color: '#6c757d'
            };
        } else if (bpm < this.VERY_LOW_THRESHOLD) {
            return {
                category: 'Severely Low',
                description: 'Significant reduction - immediate action recommended',
                color: '#dc3545'
            };
        } else if (bpm < this.LOW_THRESHOLD) {
            return {
                category: 'Below Normal',
                description: 'Reduced blinking - may indicate eye strain',
                color: '#fd7e14'
            };
        } else if (bpm >= this.NORMAL_BLINK_RATE.min && bpm <= this.NORMAL_BLINK_RATE.max) {
            return {
                category: 'Normal',
                description: 'Healthy blink rate',
                color: '#198754'
            };
        } else if (bpm <= this.HIGH_THRESHOLD) {
            return {
                category: 'Slightly Elevated',
                description: 'Mild increase - monitor for patterns',
                color: '#0dcaf0'
            };
        } else if (bpm <= this.VERY_HIGH_THRESHOLD) {
            return {
                category: 'Elevated',
                description: 'Increased blinking - check for irritation',
                color: '#ffc107'
            };
        } else {
            return {
                category: 'Very High',
                description: 'Excessive blinking - may need attention',
                color: '#dc3545'
            };
        }
    }
}
