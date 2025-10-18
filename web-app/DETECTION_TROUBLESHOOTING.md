# 🔧 Blink Detection Troubleshooting Guide

## Problem: Inconsistent Detection

If blinks are sometimes detected and sometimes not, follow this guide.

---

## ✅ Quick Fixes (Try These First)

### 1. **Adjust EAR Threshold**
The most common issue is threshold sensitivity.

**Current default:** 0.21

**Try these values:**
- **Too few detections?** Lower to **0.18-0.19** (more sensitive)
- **Too many false positives?** Raise to **0.22-0.24** (less sensitive)
- **Glasses wearers:** Try **0.19-0.20**

**How to adjust:**
1. Start tracking
2. Enable "Debug Mode" checkbox
3. Watch "Current EAR" value
4. Blink naturally and note the EAR value when eyes close
5. Set threshold slightly above that value

### 2. **Enable Debug Mode**
1. Check "Debug Mode" in settings
2. Open browser console (F12)
3. Watch for detection logs
4. See real-time EAR values

### 3. **Watch Current EAR Display**
- **Green number** = Eyes open
- **Red number** = Eyes closed
- Value should drop below threshold when blinking

---

## 🎯 Optimal Settings

### Recommended Starting Points

**For Most Users:**
```
EAR Threshold: 0.21
Consecutive Frames: 2
```

**For Glasses Wearers:**
```
EAR Threshold: 0.19
Consecutive Frames: 2
```

**For Sensitive Detection:**
```
EAR Threshold: 0.18
Consecutive Frames: 1
```

**For Reliable Detection (fewer false positives):**
```
EAR Threshold: 0.23
Consecutive Frames: 3
```

---

## 🔍 Diagnostic Steps

### Step 1: Check Face Detection
1. Enable "Show Eye Landmarks"
2. You should see green outlines around your eyes
3. If no outlines appear:
   - Face not detected
   - Improve lighting
   - Face camera directly
   - Move closer to camera

### Step 2: Monitor EAR Values
1. Watch "Current EAR" display
2. **Normal open eyes:** 0.25-0.35
3. **Closed eyes:** 0.10-0.18
4. **Blinking:** Should dip below threshold

### Step 3: Check Console Logs
With debug mode enabled, you should see:
```
Eyes closed detected, EAR: 0.165
Blink detected! Duration: 180 ms, EAR: 0.245
```

If you see:
```
Invalid blink duration: 50 ms (ignored)
```
Your blinks are too fast - lower consecutive frames to 1

---

## 🎥 Camera & Environment

### Lighting
✅ **Good:**
- Bright, even lighting
- Natural daylight
- Light in front of you

❌ **Bad:**
- Backlighting (window behind you)
- Very dim lighting
- Harsh shadows on face

### Camera Position
✅ **Good:**
- Eye level
- 1-2 feet away
- Face centered

❌ **Bad:**
- Looking down at camera
- Too close (<1 foot)
- Face at angle

### Face Visibility
✅ **Good:**
- Full face visible
- Eyes clearly visible
- No obstructions

❌ **Bad:**
- Hand covering face
- Hair over eyes
- Reflective glasses

---

## 👓 Glasses Wearers

### Issues
- Reflections can interfere
- Frames may block landmarks
- Lower EAR values

### Solutions
1. **Lower threshold:** Try 0.18-0.20
2. **Tilt glasses:** Reduce reflections
3. **Clean lenses:** Remove smudges
4. **Adjust lighting:** Minimize glare
5. **Consider contacts:** For best results

---

## 🐛 Common Issues & Solutions

### Issue: No Blinks Detected At All

**Possible Causes:**
1. Threshold too high
2. Face not detected
3. Poor lighting

**Solutions:**
1. Lower threshold to 0.18
2. Enable "Show Eye Landmarks" to verify detection
3. Improve lighting
4. Enable debug mode and check console

---

### Issue: Too Many False Positives

**Possible Causes:**
1. Threshold too low
2. Head movement
3. Looking away

**Solutions:**
1. Raise threshold to 0.23-0.25
2. Increase consecutive frames to 3-4
3. Keep head still
4. Look at camera

---

### Issue: Detects Only Some Blinks

**Possible Causes:**
1. Inconsistent blink speed
2. Partial blinks
3. Threshold on borderline

**Solutions:**
1. Adjust threshold based on EAR display
2. Blink more deliberately
3. Enable debug mode to see which blinks register
4. Try consecutive frames = 2

---

### Issue: Delayed Detection

**Possible Causes:**
1. Consecutive frames too high
2. Slow computer
3. Too many browser tabs

**Solutions:**
1. Lower consecutive frames to 1-2
2. Close other applications
3. Close unnecessary browser tabs
4. Disable landmark visualization

---

## 📊 Understanding EAR Values

### What is EAR?
**Eye Aspect Ratio** - measures eye openness

### Typical Values
```
Wide open eyes:    0.30 - 0.40
Normal open eyes:  0.25 - 0.30
Squinting:         0.20 - 0.25
Closing:           0.15 - 0.20
Fully closed:      0.05 - 0.15
```

### How It Works
1. MediaPipe detects 6 points per eye
2. Calculates vertical/horizontal distances
3. EAR = (vertical) / (horizontal)
4. Lower EAR = more closed eyes

### Setting Threshold
Your threshold should be:
- **Above** your closed-eye EAR
- **Below** your open-eye EAR
- Typically: **0.18 - 0.23**

---

## 🔬 Advanced Debugging

### Test Your Settings
1. Enable debug mode
2. Start tracking
3. Blink 10 times deliberately
4. Check console - should see 10 detections
5. If not, adjust settings

### Find Your Personal Threshold
1. Enable debug mode
2. Start tracking
3. Close eyes and hold
4. Note EAR value (e.g., 0.16)
5. Open eyes
6. Note EAR value (e.g., 0.28)
7. Set threshold between them (e.g., 0.20)

### Calibration Process
```javascript
// In browser console (F12)
// After starting tracking:

// Check current settings
blinkDetector.EAR_THRESHOLD
blinkDetector.CONSECUTIVE_FRAMES

// Adjust on the fly
blinkDetector.setThreshold(0.19)
blinkDetector.setConsecutiveFrames(2)

// Watch current EAR
setInterval(() => {
    console.log('Current EAR:', blinkDetector.getCurrentEAR().toFixed(3));
}, 1000);
```

---

## 📈 Performance Optimization

### If Detection is Slow
1. Close other applications
2. Close browser tabs
3. Disable landmark visualization
4. Use Chrome (best performance)
5. Update graphics drivers

### If CPU Usage is High
1. Reduce consecutive frames
2. Disable landmarks
3. Close other tabs
4. Check for background processes

---

## 🎯 Recommended Workflow

### Initial Setup (5 minutes)
1. Open app
2. Enable debug mode
3. Enable show landmarks
4. Start tracking
5. Blink 5-10 times
6. Watch console logs
7. Adjust threshold if needed
8. Disable debug mode when satisfied

### Daily Use
1. Start tracking
2. Work normally
3. Check stats periodically
4. Export data weekly

---

## 📝 Settings Cheat Sheet

| Situation | Threshold | Frames | Notes |
|-----------|-----------|--------|-------|
| **Default** | 0.21 | 2 | Start here |
| **Glasses** | 0.19 | 2 | Lower for reflections |
| **Sensitive** | 0.18 | 1 | Catches more blinks |
| **Reliable** | 0.23 | 3 | Fewer false positives |
| **Fast blinks** | 0.20 | 1 | Quick detection |
| **Slow blinks** | 0.21 | 3 | More confirmation |

---

## 🆘 Still Having Issues?

### Check These:
- [ ] Browser is Chrome/Edge/Firefox (latest version)
- [ ] Camera permissions granted
- [ ] Good lighting on face
- [ ] Face clearly visible
- [ ] Eyes not obscured
- [ ] Debug mode enabled
- [ ] Console shows face detection
- [ ] EAR values changing when blinking

### Try This:
1. Refresh page
2. Clear browser cache
3. Try different browser
4. Restart computer
5. Check camera with other apps

### Debug Checklist:
```
✅ Face detected (green landmarks visible)
✅ EAR value displayed and changing
✅ EAR drops below threshold when blinking
✅ Console shows detection logs (debug mode)
✅ Red indicator flashes on blinks
✅ Counter increases
```

---

## 💡 Pro Tips

### For Best Results:
1. **Consistent lighting** - same time of day
2. **Same position** - mark camera spot
3. **Calibrate daily** - lighting changes
4. **Track patterns** - note what works
5. **Export data** - backup regularly

### Optimization:
- Lower threshold = more sensitive
- Higher threshold = more reliable
- Fewer frames = faster detection
- More frames = fewer false positives

### Remember:
- Everyone's eyes are different
- Lighting affects detection
- Glasses change EAR values
- Fatigue affects blink patterns
- Calibration improves accuracy

---

## 🎉 Success Indicators

You've got it right when:
- ✅ Blinks detected consistently
- ✅ Few or no false positives
- ✅ EAR display shows clear open/closed states
- ✅ Debug logs show valid blink durations (100-400ms)
- ✅ Counter increases with each blink
- ✅ No missed blinks

---

## 📞 Need More Help?

1. Enable debug mode
2. Record console output
3. Note your settings
4. Describe lighting conditions
5. Mention if wearing glasses
6. Share EAR values

---

**Remember:** The app is now optimized with:
- ✅ Improved threshold (0.21)
- ✅ Faster response (2 frames)
- ✅ EAR smoothing (reduces noise)
- ✅ Blink duration validation (100-400ms)
- ✅ Real-time EAR display
- ✅ Debug mode for troubleshooting

**These improvements should make detection much more reliable!** 🎯
