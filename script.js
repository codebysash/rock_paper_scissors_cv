class RockPaperScissorsGame {
    constructor() {
        this.scores = [0, 0]; // [AI, Player]
        this.timer = 0;
        this.stateResult = false;
        this.startGame = false;
        this.gameOver = false;
        this.initialTime = 0;
        this.aiMove = null;
        this.playerMove = null;
        
        // TensorFlow.js HandPose setup
        this.handPoseModel = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        this.isDetecting = false;
        
        // Sound system
        this.audioContext = null;
        this.soundsEnabled = true;
        this.initAudioSystem();
        
        this.init();
    }
    
    initAudioSystem() {
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🔊 Audio system initialized');
        } catch (error) {
            console.log('⚠️ Audio not supported:', error);
            this.soundsEnabled = false;
        }
    }
    
    // Generate different types of game sounds
    playSound(type, options = {}) {
        if (!this.soundsEnabled || !this.audioContext) return;
        
        try {
            // Resume audio context if suspended (required for Chrome)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const now = this.audioContext.currentTime;
            
            switch (type) {
                case 'countdown':
                    // High beep for countdown
                    oscillator.frequency.setValueAtTime(800, now);
                    oscillator.type = 'square';
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    oscillator.start(now);
                    oscillator.stop(now + 0.2);
                    break;
                    
                case 'countdownFinal':
                    // Different tone for final countdown
                    oscillator.frequency.setValueAtTime(600, now);
                    oscillator.type = 'square';
                    gainNode.gain.setValueAtTime(0.15, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                    oscillator.start(now);
                    oscillator.stop(now + 0.4);
                    break;
                    
                case 'startGame':
                    // Energetic start sound
                    oscillator.frequency.setValueAtTime(440, now);
                    oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.3);
                    oscillator.type = 'sawtooth';
                    gainNode.gain.setValueAtTime(0.2, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                    oscillator.start(now);
                    oscillator.stop(now + 0.5);
                    break;
                    
                case 'roundWin':
                    // Happy ascending notes
                    this.playChord([523, 659, 784], 0.8, 0.1); // C, E, G
                    break;
                    
                case 'roundLose':
                    // Sad descending notes
                    oscillator.frequency.setValueAtTime(400, now);
                    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.6);
                    oscillator.type = 'triangle';
                    gainNode.gain.setValueAtTime(0.15, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                    oscillator.start(now);
                    oscillator.stop(now + 0.8);
                    break;
                    
                case 'matchWin':
                    // Victory fanfare
                    setTimeout(() => this.playChord([523, 659, 784], 0.5, 0.15), 0);
                    setTimeout(() => this.playChord([587, 740, 880], 0.5, 0.15), 300);
                    setTimeout(() => this.playChord([659, 831, 988], 0.8, 0.2), 600);
                    break;
                    
                case 'matchLose':
                    // Defeat sound
                    oscillator.frequency.setValueAtTime(300, now);
                    oscillator.frequency.exponentialRampToValueAtTime(150, now + 1.2);
                    oscillator.type = 'triangle';
                    gainNode.gain.setValueAtTime(0.2, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
                    oscillator.start(now);
                    oscillator.stop(now + 1.5);
                    break;
                    
                case 'buttonClick':
                    // Quick button sound
                    oscillator.frequency.setValueAtTime(600, now);
                    oscillator.type = 'square';
                    gainNode.gain.setValueAtTime(0.05, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    oscillator.start(now);
                    oscillator.stop(now + 0.1);
                    break;
                    
                case 'endGame':
                    // Gentle end sound
                    oscillator.frequency.setValueAtTime(440, now);
                    oscillator.frequency.exponentialRampToValueAtTime(220, now + 1.0);
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
                    oscillator.start(now);
                    oscillator.stop(now + 1.2);
                    break;
            }
        } catch (error) {
            console.log('Sound playback error:', error);
        }
    }
    
    // Play chord for more complex sounds
    playChord(frequencies, duration, volume) {
        if (!this.soundsEnabled || !this.audioContext) return;
        
        frequencies.forEach(freq => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const now = this.audioContext.currentTime;
            oscillator.frequency.setValueAtTime(freq, now);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(volume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
        });
    }
    
    toggleSound() {
        this.soundsEnabled = !this.soundsEnabled;
        
        if (this.soundsEnabled) {
            this.soundToggleButton.textContent = '🔊 SOUND ON';
            this.soundToggleButton.classList.remove('muted');
            console.log('🔊 Sound enabled');
            this.playSound('buttonClick'); // Test sound
        } else {
            this.soundToggleButton.textContent = '🔇 SOUND OFF';
            this.soundToggleButton.classList.add('muted');
            console.log('🔇 Sound disabled');
        }
    }
    
    async init() {
        this.setupElements();
        this.setupEventListeners();
        this.updateDisplay();
        
        // Try to initialize camera automatically, but don't fail if it doesn't work
        try {
            console.log('Attempting automatic camera initialization...');
            await this.setupCamera();
            await this.loadHandPoseModel();
            
            // Start detection based on which model loaded and update status
            if (this.hands && this.isMediaPipeActive) {
                console.log('✅ Starting with MediaPipe detection');
                this.gameStatus.textContent = 'MediaPipe ready! Press START TOURNAMENT to begin match (first to 3 wins)!';
                // MediaPipe starts automatically with camera
            } else if (this.handPoseModel) {
                console.log('✅ Starting with TensorFlow detection');
                this.gameStatus.textContent = 'TensorFlow ready! Press START TOURNAMENT to begin match (first to 3 wins)!';
                this.startHandDetection();
            } else {
                console.log('⚠️ No hand detection loaded, using keyboard controls');
                this.gameStatus.textContent = 'Keyboard ready! Press START TOURNAMENT to begin match (first to 3 wins)!';
                this.setupKeyboardFallback();
            }
        } catch (error) {
            console.log('Automatic camera initialization failed, showing permission modal');
            console.log('Error details:', error.name, error.message);
            this.showModal(this.permissionModal);
        }
    }
    
    setupElements() {
        console.log('Setting up DOM elements...');
        
        this.videoElement = document.getElementById('videoElement');
        this.canvasElement = document.getElementById('canvasElement');
        this.canvasCtx = this.canvasElement.getContext('2d');
        
        this.timerDisplay = document.getElementById('timer');
        this.gameStatus = document.getElementById('gameStatus');
        this.aiScoreDisplay = document.getElementById('aiScore');
        this.playerScoreDisplay = document.getElementById('playerScore');
        this.aiMoveImage = document.getElementById('aiMoveImage');
        
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.permissionModal = document.getElementById('permissionModal');
        this.playAgainButton = document.getElementById('playAgainButton');
        this.endGameButton = document.getElementById('endGameButton');
        this.soundToggleButton = document.getElementById('soundToggleButton');
        this.allowCameraButton = document.getElementById('allowCameraButton');
        this.testCameraButton = document.getElementById('testCameraButton');
        this.closeModalButton = document.getElementById('closeModalButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // Debug: Log which elements were found
        console.log('Elements found:');
        console.log('- videoElement:', !!this.videoElement);
        console.log('- canvasElement:', !!this.canvasElement);
        console.log('- permissionModal:', !!this.permissionModal);
        console.log('- allowCameraButton:', !!this.allowCameraButton);
        console.log('- testCameraButton:', !!this.testCameraButton);
        console.log('- closeModalButton:', !!this.closeModalButton);
        console.log('- endGameButton:', !!this.endGameButton);
        console.log('- soundToggleButton:', !!this.soundToggleButton);
        
        // Add a global function to manually trigger camera access (for debugging)
        window.debugCameraAccess = () => {
            console.log('Manual camera access triggered');
            this.requestCameraPermission();
        };
        
        window.debugTestCamera = () => {
            console.log('Manual camera test triggered');
            this.testCameraOnly();
        };
        
        window.simpleHandTest = async () => {
            console.log('🧪 SIMPLE HAND TEST - Starting...');
            
            const video = document.getElementById('videoElement');
            console.log('Video element:', !!video);
            console.log('Video ready:', video?.readyState === 4);
            console.log('Video dimensions:', video?.videoWidth, 'x', video?.videoHeight);
            
            if (!video || video.readyState !== 4) {
                console.error('❌ Video not ready');
                return;
            }
            
            // Test if TensorFlow.js is working at all
            if (typeof tf !== 'undefined') {
                console.log('✅ TensorFlow.js available, version:', tf.version);
                try {
                    await tf.ready();
                    console.log('✅ TensorFlow.js ready, backend:', tf.getBackend());
                } catch (e) {
                    console.error('❌ TensorFlow.js failed:', e);
                    return;
                }
            } else {
                console.error('❌ TensorFlow.js not available');
                return;
            }
            
            // Test if HandPose is available
            if (typeof handpose === 'undefined') {
                console.error('❌ HandPose not available');
                return;
            }
            
            console.log('✅ HandPose available');
            
            // Load a completely fresh model
            try {
                console.log('📦 Loading fresh HandPose model...');
                const freshModel = await handpose.load();
                console.log('✅ Fresh model loaded');
                
                // Test on video element first
                console.log('🎥 Testing on video element...');
                const videoResult = await freshModel.estimateHands(video);
                console.log('📊 Video result:', videoResult);
                
                if (videoResult && videoResult.length > 0) {
                    console.log('🎉 SUCCESS! Hand detected on video element');
                    console.log('Landmarks:', videoResult[0].landmarks.length);
                    return videoResult;
                }
                
                // Test on canvas
                console.log('🎨 Testing on canvas...');
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);
                
                const canvasResult = await freshModel.estimateHands(canvas);
                console.log('📊 Canvas result:', canvasResult);
                
                if (canvasResult && canvasResult.length > 0) {
                    console.log('🎉 SUCCESS! Hand detected on canvas');
                    return canvasResult;
                }
                
                console.log('😞 No hands detected in either test');
                
            } catch (error) {
                console.error('❌ Test failed:', error);
            }
        };
        
        window.testBasicHandPose = async () => {
            console.log('🧪 Basic HandPose test starting...');
            
            // Check if we have all requirements
            if (typeof tf === 'undefined') {
                console.error('❌ TensorFlow.js not available');
                return;
            }
            
            if (typeof handpose === 'undefined') {
                console.error('❌ HandPose not available');
                return;
            }
            
            console.log('✅ Libraries available, loading fresh model...');
            
            try {
                // Load a fresh model for testing
                const testModel = await handpose.load();
                console.log('✅ Fresh model loaded for test');
                
                // Test with video element
                const video = document.getElementById('videoElement');
                if (!video || video.readyState !== 4) {
                    console.error('❌ Video not ready for test');
                    return;
                }
                
                console.log('🎥 Testing prediction on video...');
                console.log('Video info:', {
                    width: video.videoWidth,
                    height: video.videoHeight,
                    readyState: video.readyState,
                    srcObject: !!video.srcObject
                });
                
                // Try prediction
                const result = await testModel.estimateHands(video);
                console.log('📊 Test result:', result);
                
                // If no results, try with canvas
                if (!result || result.length === 0) {
                    console.log('🎨 Trying with canvas approach...');
                    const canvas = document.getElementById('canvasElement');
                    const ctx = canvas.getContext('2d');
                    
                    // Draw current video frame to canvas
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0);
                    
                    // Try prediction on canvas
                    const canvasResult = await testModel.estimateHands(canvas);
                    console.log('📊 Canvas result:', canvasResult);
                    
                    return canvasResult;
                }
                
                return result;
                
            } catch (error) {
                console.error('❌ Basic test failed:', error);
            }
        };
        
        window.debugHandPose = async () => {
            console.log('🧪 Manual HandPose test triggered');
            if (!this.handPoseModel) {
                console.log('❌ No HandPose model loaded');
                return;
            }
            
            if (this.videoElement.readyState !== 4) {
                console.log('❌ Video not ready');
                return;
            }
            
            try {
                console.log('🎥 Testing single frame prediction...');
                let predictions;
                if (typeof this.handPoseModel.estimateHands === 'function') {
                    predictions = await this.handPoseModel.estimateHands(this.videoElement);
                } else if (typeof this.handPoseModel.estimate === 'function') {
                    predictions = await this.handPoseModel.estimate(this.videoElement);
                } else {
                    console.error('❌ No estimation method available');
                    return;
                }
                console.log('✅ Manual test result:', predictions);
                
                if (predictions.length > 0) {
                    console.log('🖐️ Hand found with', predictions[0].landmarks.length, 'landmarks');
                    // Test gesture detection
                    this.detectGesture(predictions[0].landmarks);
                } else {
                    console.log('👀 No hands detected in manual test');
                }
            } catch (error) {
                console.error('❌ Manual test failed:', error);
            }
        };
        
        window.testMediaPipe = async () => {
            console.log('🧪 MEDIAPIPE TEST - Starting...');
            
            if (typeof Hands === 'undefined') {
                console.error('❌ MediaPipe Hands not available');
                return;
            }
            
            console.log('✅ MediaPipe Hands available');
            
            try {
                const video = document.getElementById('videoElement');
                if (!video || video.readyState !== 4) {
                    console.error('❌ Video not ready');
                    return;
                }
                
                // Create MediaPipe Hands instance
                const hands = new Hands({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
                });
                
                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.3,  // Lower threshold
                    minTrackingConfidence: 0.3   // Lower threshold
                });
                
                // Set up results handler
                hands.onResults((results) => {
                    console.log('🖐️ MediaPipe results:', results);
                    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                        console.log('🎉 MediaPipe SUCCESS! Detected', results.multiHandLandmarks.length, 'hands');
                        console.log('Landmarks per hand:', results.multiHandLandmarks[0].length);
                    } else {
                        console.log('😞 MediaPipe: No hands detected');
                    }
                });
                
                console.log('📷 Sending frame to MediaPipe...');
                await hands.send({image: video});
                
            } catch (error) {
                console.error('❌ MediaPipe test failed:', error);
            }
        };
        
        // Add a super simple MediaPipe test
        window.quickMediaPipeTest = async () => {
            console.log('🚀 QUICK MEDIAPIPE TEST');
            
            const video = document.getElementById('videoElement');
            if (!video || video.readyState !== 4) {
                console.error('❌ Video not ready for quick test');
                return;
            }
            
            if (typeof Hands === 'undefined') {
                console.error('❌ MediaPipe Hands not loaded');
                return;
            }
            
            try {
                console.log('Creating quick test instance...');
                const quickHands = new Hands({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
                });
                
                quickHands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 0,  // Fastest model
                    minDetectionConfidence: 0.1,  // Very low threshold
                    minTrackingConfidence: 0.1
                });
                
                let resultCount = 0;
                quickHands.onResults((results) => {
                    resultCount++;
                    console.log(`🔄 Quick test result #${resultCount}:`, results);
                    
                    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                        console.log('🎉 QUICK TEST SUCCESS! Hand detected!');
                        console.log('Hand landmarks:', results.multiHandLandmarks[0].length);
                    } else {
                        console.log(`⚪ Quick test #${resultCount}: No hands`);
                    }
                });
                
                // Send 5 frames quickly
                for (let i = 0; i < 5; i++) {
                    console.log(`📸 Sending frame ${i + 1}/5...`);
                    await quickHands.send({image: video});
                    await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms between frames
                }
                
                console.log('✅ Quick test completed');
                
            } catch (error) {
                console.error('❌ Quick MediaPipe test failed:', error);
            }
        };
        
        window.testMotionDetection = () => {
            console.log('🧪 MOTION DETECTION TEST - Starting...');
            
            const video = document.getElementById('videoElement');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!video || video.readyState !== 4) {
                console.error('❌ Video not ready');
                return;
            }
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            let previousImageData = null;
            let motionThreshold = 30;
            let testCount = 0;
            
            const detectMotion = () => {
                testCount++;
                
                // Draw current frame
                ctx.drawImage(video, 0, 0);
                const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                if (previousImageData) {
                    let diffSum = 0;
                    const pixels = currentImageData.data.length;
                    
                    // Compare with previous frame
                    for (let i = 0; i < pixels; i += 4) {
                        const diff = Math.abs(currentImageData.data[i] - previousImageData.data[i]) +
                                   Math.abs(currentImageData.data[i + 1] - previousImageData.data[i + 1]) +
                                   Math.abs(currentImageData.data[i + 2] - previousImageData.data[i + 2]);
                        diffSum += diff;
                    }
                    
                    const avgDiff = diffSum / (pixels / 4);
                    
                    if (testCount % 30 === 0) {
                        console.log(`📊 Motion level: ${avgDiff.toFixed(2)} (threshold: ${motionThreshold})`);
                    }
                    
                    if (avgDiff > motionThreshold) {
                        console.log('🎉 MOTION DETECTED! Average difference:', avgDiff.toFixed(2));
                    }
                }
                
                previousImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                if (testCount < 300) { // Run for 10 seconds at 30fps
                    requestAnimationFrame(detectMotion);
                } else {
                    console.log('Motion detection test completed');
                }
            };
            
            detectMotion();
        };
        
        console.log('Elements setup complete.');
        console.log('Available tests: simpleHandTest(), testMediaPipe(), quickMediaPipeTest(), testMotionDetection()');
        console.log('Debug functions: debugCameraAccess(), debugTestCamera()');
        console.log('🚀 Try quickMediaPipeTest() for the fastest MediaPipe test!');
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Check if elements exist before adding listeners
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.playSound('buttonClick');
                this.startRound();
            });
            console.log('Start button listener added');
        } else {
            console.error('Start button not found!');
        }
        
        if (this.restartButton) {
            this.restartButton.addEventListener('click', () => {
                this.playSound('buttonClick');
                this.restartMatch();
            });
            console.log('Restart button listener added');
        } else {
            console.error('Restart button not found!');
        }
        
        if (this.playAgainButton) {
            this.playAgainButton.addEventListener('click', () => {
                this.playSound('buttonClick');
                this.restartMatch();
            });
            console.log('Play again button listener added');
        } else {
            console.error('Play again button not found!');
        }
        
        if (this.endGameButton) {
            this.endGameButton.addEventListener('click', () => {
                this.playSound('endGame');
                this.endGame();
            });
            console.log('End game button listener added');
        } else {
            console.error('End game button not found!');
        }
        
        if (this.soundToggleButton) {
            this.soundToggleButton.addEventListener('click', () => {
                this.toggleSound();
            });
            console.log('Sound toggle button listener added');
        } else {
            console.error('Sound toggle button not found!');
        }
        
        if (this.allowCameraButton) {
            this.allowCameraButton.addEventListener('click', (e) => {
                console.log('Allow camera button clicked!');
                e.preventDefault();
                this.requestCameraPermission();
            });
            console.log('Allow camera button listener added');
        } else {
            console.error('Allow camera button not found!');
        }
        
        if (this.testCameraButton) {
            this.testCameraButton.addEventListener('click', (e) => {
                console.log('Test camera button clicked!');
                e.preventDefault();
                this.testCameraOnly();
            });
            console.log('Test camera button listener added');
        } else {
            console.error('Test camera button not found!');
        }
        
        // Touch events for mobile
        if (this.startButton) {
            this.startButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startRound();
            });
        }
        
        if (this.restartButton) {
            this.restartButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.restartMatch();
            });
        }
        
        // Mobile touch events for camera buttons
        if (this.allowCameraButton) {
            this.allowCameraButton.addEventListener('touchstart', (e) => {
                console.log('Allow camera button touched!');
                e.preventDefault();
                this.requestCameraPermission();
            });
        }
        
        if (this.testCameraButton) {
            this.testCameraButton.addEventListener('touchstart', (e) => {
                console.log('Test camera button touched!');
                e.preventDefault();
                this.testCameraOnly();
            });
        }
        
        if (this.closeModalButton) {
            this.closeModalButton.addEventListener('click', (e) => {
                console.log('Close modal button clicked!');
                e.preventDefault();
                this.hideModal(this.permissionModal);
            });
            console.log('Close modal button listener added');
        } else {
            console.error('Close modal button not found!');
        }
        
        console.log('All event listeners setup complete');
    }
    
    async setupCamera() {
        console.log('=== Starting Camera Setup ===');
        console.log('Protocol:', window.location.protocol);
        console.log('Host:', window.location.host);
        console.log('User Agent:', navigator.userAgent);
        
        // Check HTTPS requirement
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            console.error('Camera requires HTTPS in production environments');
            this.gameStatus.textContent = 'Camera requires HTTPS. Please use https:// or localhost';
            this.showModal(this.permissionModal);
            throw new Error('HTTPS required for camera access');
        }

        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('getUserMedia not supported');
            this.gameStatus.textContent = 'Camera not supported in this browser';
            this.showModal(this.permissionModal);
            throw new Error('getUserMedia not supported');
        }

        console.log('getUserMedia is supported');

        // Try multiple approaches for camera access
        const approaches = [
            // Approach 1: Simple video request
            { video: true },
            
            // Approach 2: Basic constraints
            {
                video: {
                    facingMode: 'user'
                }
            },
            
            // Approach 3: Detailed constraints
            {
                video: {
                    width: { ideal: 640, min: 320 },
                    height: { ideal: 480, min: 240 },
                    facingMode: 'user'
                }
            },
            
            // Approach 4: Minimal constraints
            {
                video: {
                    width: 640,
                    height: 480
                }
            }
        ];

        for (let i = 0; i < approaches.length; i++) {
            const constraints = approaches[i];
            console.log(`Trying camera approach ${i + 1}:`, constraints);
            
            try {
                this.gameStatus.textContent = `Requesting camera access (attempt ${i + 1})...`;
                
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                console.log('Camera access granted!');
                console.log('Stream tracks:', stream.getTracks().length);
                
                // Set up video element
                this.videoElement.srcObject = stream;
                this.hideModal(this.permissionModal);
                
                return new Promise((resolve, reject) => {
                    this.videoElement.onloadedmetadata = () => {
                        console.log(`Video loaded: ${this.videoElement.videoWidth}x${this.videoElement.videoHeight}`);
                        
                        // Set canvas size to match video
                        this.canvasElement.width = this.videoElement.videoWidth;
                        this.canvasElement.height = this.videoElement.videoHeight;
                        
                        console.log(`Canvas set to: ${this.canvasElement.width}x${this.canvasElement.height}`);
                        
                        this.gameStatus.textContent = 'Camera ready! Loading hand detection...';
                        resolve(this.videoElement);
                    };
                    
                    this.videoElement.onerror = (error) => {
                        console.error('Video element error:', error);
                        reject(new Error('Video playback failed'));
                    };
                    
                    // Timeout if video doesn't load
                    setTimeout(() => {
                        if (this.videoElement.readyState < 2) {
                            console.error('Video loading timeout');
                            reject(new Error('Video loading timeout'));
                        }
                    }, 10000);
                });
                
            } catch (error) {
                console.error(`Camera approach ${i + 1} failed:`, error.name, error.message);
                
                // Log specific error details
                if (error.name === 'NotAllowedError') {
                    console.error('Camera permission denied by user or browser policy');
                } else if (error.name === 'NotFoundError') {
                    console.error('No camera device found');
                } else if (error.name === 'NotReadableError') {
                    console.error('Camera is already in use by another application');
                } else if (error.name === 'OverconstrainedError') {
                    console.error('Camera constraints could not be satisfied');
                }
                
                // Continue to next approach unless it's a permission denial
                if (error.name === 'NotAllowedError' && i === 0) {
                    // User denied permission, show modal immediately
                    this.gameStatus.textContent = 'Camera permission denied. Please allow camera access.';
                    this.showModal(this.permissionModal);
                    throw error;
                }
                
                if (i === approaches.length - 1) {
                    // All approaches failed
                    console.error('All camera approaches failed');
                    this.gameStatus.textContent = `Camera failed: ${error.message}`;
                    this.showModal(this.permissionModal);
                    throw error;
                }
            }
        }
    }
    
    async requestCameraPermission() {
        try {
            await this.setupCamera();
            await this.loadHandPoseModel();
            this.startHandDetection();
        } catch (error) {
            console.error('Full camera setup failed:', error);
            this.gameStatus.textContent = 'Camera setup failed. Check console for details.';
        }
    }

    async testCameraOnly() {
        console.log('=== Testing Camera Only (No Hand Detection) ===');
        
        try {
            // Simple camera test without TensorFlow.js
            this.gameStatus.textContent = 'Testing camera access...';
            
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            console.log('Camera test successful!');
            this.videoElement.srcObject = stream;
            this.gameStatus.textContent = 'Camera test successful! You should see video feed.';
            
            // Set a timeout to show success message
            setTimeout(() => {
                if (this.videoElement.videoWidth > 0) {
                    this.gameStatus.textContent = 'Camera working! Close this modal and try REQUEST CAMERA ACCESS.';
                } else {
                    this.gameStatus.textContent = 'Camera opened but no video. Check camera settings.';
                }
            }, 2000);
            
        } catch (error) {
            console.error('Camera test failed:', error);
            this.gameStatus.textContent = `Camera test failed: ${error.name} - ${error.message}`;
            
            if (error.name === 'NotAllowedError') {
                this.gameStatus.textContent = 'Camera permission denied. Please check browser settings.';
            } else if (error.name === 'NotFoundError') {
                this.gameStatus.textContent = 'No camera found. Please connect a camera.';
            }
        }
    }
    
    async loadHandPoseModel() {
        console.log('=== Loading MediaPipe Hands ===');
        
        // Wait for MediaPipe to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check MediaPipe availability
        console.log('Library status check:');
        console.log('- MediaPipe Hands:', typeof Hands !== 'undefined');
        console.log('- Camera utils:', typeof Camera !== 'undefined');
        
        if (typeof Hands === 'undefined') {
            console.error('❌ MediaPipe Hands not loaded - trying TensorFlow fallback');
            await this.tryTensorFlowFallback();
            return;
        }
        
        try {
            this.gameStatus.textContent = 'Loading MediaPipe hand detection...';
            console.log('✅ MediaPipe available - initializing...');
            
            // Create MediaPipe Hands instance
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });
            
            // Configure MediaPipe with lower thresholds for better detection
            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.3,  // Lower threshold
                minTrackingConfidence: 0.3   // Lower threshold
            });
            
            // Set up results handler
            this.hands.onResults((results) => {
                this.onMediaPipeResults(results);
            });
            
            // Try MediaPipe Camera if available, otherwise use manual detection
            if (typeof Camera !== 'undefined') {
                console.log('✅ Using MediaPipe Camera utility');
                // Set up camera
                this.camera = new Camera(this.videoElement, {
                    onFrame: async () => {
                        if (this.hands) {
                            await this.hands.send({image: this.videoElement});
                        }
                    },
                    width: 640,
                    height: 480
                });
                
                console.log('✅ MediaPipe Hands initialized successfully!');
                this.gameStatus.textContent = 'MediaPipe ready! Press START TOURNAMENT to begin match (first to 3 wins)!';
                this.hideLoadingIndicator();
                this.isMediaPipeActive = true;
                
                // Start MediaPipe camera
                this.camera.start();
            } else {
                console.log('⚠️ MediaPipe Camera not available, using manual detection');
                this.gameStatus.textContent = 'MediaPipe ready! Press START TOURNAMENT to begin match (first to 3 wins)!';
                this.hideLoadingIndicator();
                this.isMediaPipeActive = true;
                
                // Start manual MediaPipe detection loop
                this.startManualMediaPipeDetection();
            }
            
        } catch (error) {
            console.error('❌ MediaPipe loading failed:', error);
            console.log('Trying TensorFlow fallback...');
            await this.tryTensorFlowFallback();
        }
    }
    
    async tryTensorFlowFallback() {
        console.log('=== Trying TensorFlow.js Fallback ===');
        
        if (typeof tf === 'undefined' || typeof handpose === 'undefined') {
            console.error('❌ TensorFlow.js libraries not available');
            this.setupKeyboardFallback();
            return;
        }
        
        try {
            this.gameStatus.textContent = 'Loading TensorFlow hand detection...';
            await tf.ready();
            this.handPoseModel = await handpose.load();
            
            console.log('✅ TensorFlow fallback loaded');
            this.gameStatus.textContent = 'TensorFlow ready! Press START TOURNAMENT to begin match (first to 3 wins)!';
            this.hideLoadingIndicator();
            this.startHandDetection();
            
        } catch (error) {
            console.error('❌ TensorFlow fallback failed:', error);
            this.gameStatus.textContent = 'Hand detection failed. Using keyboard controls.';
            this.hideLoadingIndicator();
            this.setupKeyboardFallback();
        }
    }
    
    
    startManualMediaPipeDetection() {
        if (!this.hands || this.manualDetectionRunning) return;
        
        console.log('Starting manual MediaPipe detection loop...');
        this.manualDetectionRunning = true;
        this.detectionCount = 0;
        
        const detectFrame = async () => {
            if (!this.manualDetectionRunning || !this.hands) return;
            
            if (this.videoElement.readyState === 4) {
                try {
                    this.detectionCount++;
                    
                    // Send frame to MediaPipe
                    await this.hands.send({image: this.videoElement});
                    
                    // Log every 60 frames
                    if (this.detectionCount % 60 === 0) {
                        console.log(`📹 Manual MediaPipe detection running... frame ${this.detectionCount}`);
                    }
                    
                } catch (error) {
                    console.error('❌ Manual MediaPipe detection error:', error);
                }
            }
            
            // Continue detection loop
            requestAnimationFrame(detectFrame);
        };
        
        detectFrame();
    }

    setupKeyboardFallback() {
        console.log('Setting up keyboard fallback controls');
        this.keyboardMode = true;
        
        // Remove any existing keyboard listener first
        if (this.keyboardListener) {
            document.removeEventListener('keydown', this.keyboardListener);
        }
        
        // Create new keyboard listener
        this.keyboardListener = (e) => {
            if (this.startGame && !this.stateResult) {
                const key = e.key.toLowerCase();
                console.log('Key pressed during game:', key);
                
                switch(key) {
                    case 'r':
                        this.playerMove = 1; // Rock
                        console.log('Keyboard: Rock selected');
                        this.gameStatus.textContent = 'Rock selected! ✊';
                        break;
                    case 'p':
                        this.playerMove = 2; // Paper
                        console.log('Keyboard: Paper selected');
                        this.gameStatus.textContent = 'Paper selected! ✋';
                        break;
                    case 's':
                        this.playerMove = 3; // Scissors
                        console.log('Keyboard: Scissors selected');
                        this.gameStatus.textContent = 'Scissors selected! ✌️';
                        break;
                }
            }
        };
        
        document.addEventListener('keydown', this.keyboardListener);
        
        // Update status to show keyboard controls are ready
        setTimeout(() => {
            this.gameStatus.textContent = 'Keyboard ready! Press START TOURNAMENT to begin match (first to 3 wins)!';
        }, 500);
    }
    
    async startHandDetection() {
        if (!this.handPoseModel || this.isDetecting) {
            console.log('Cannot start hand detection:', {
                hasModel: !!this.handPoseModel,
                isDetecting: this.isDetecting
            });
            return;
        }
        
        console.log('Starting hand detection loop...');
        this.isDetecting = true;
        this.detectionCount = 0;
        
        const detectHands = async () => {
            if (this.videoElement.readyState === 4) {
                try {
                    this.detectionCount++;
                    
                    // Update canvas size to match video
                    if (this.canvasElement.width !== this.videoElement.videoWidth) {
                        this.canvasElement.width = this.videoElement.videoWidth;
                        this.canvasElement.height = this.videoElement.videoHeight;
                        console.log('📏 Canvas resized to:', this.canvasElement.width, 'x', this.canvasElement.height);
                    }
                    
                    // Clear canvas and draw current video frame
                    this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
                    this.canvasCtx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
                    
                    // Log every 60 frames (roughly every 1 second at 60fps)
                    if (this.detectionCount % 60 === 0) {
                        console.log(`🔍 Hand detection running... frame ${this.detectionCount}`);
                        console.log('Video dimensions:', this.videoElement.videoWidth, 'x', this.videoElement.videoHeight);
                        console.log('Canvas dimensions:', this.canvasElement.width, 'x', this.canvasElement.height);
                        console.log('Model available:', !!this.handPoseModel);
                    }
                    
                    // Try prediction on canvas (more reliable than video element)
                    let predictions;
                    try {
                        predictions = await this.handPoseModel.estimateHands(this.canvasElement);
                    } catch (canvasError) {
                        console.log('Canvas prediction failed, trying video element...');
                        predictions = await this.handPoseModel.estimateHands(this.videoElement);
                    }
                    
                    // Show real-time detection status
                    if (predictions && predictions.length > 0) {
                        // Hand detected - show green indicator
                        this.drawDetectionStatus('✅ HAND DETECTED', '#00ff00');
                        
                        // Log occasionally
                        if (this.detectionCount % 30 === 0) {
                            console.log('🖐️ Hand found:', predictions[0].landmarks.length, 'landmarks');
                        }
                    } else {
                        // No hand detected - show red indicator
                        this.drawDetectionStatus('❌ NO HAND', '#ff0000');
                        
                        // Log occasionally
                        if (this.detectionCount % 60 === 0) {
                            console.log('👀 No hands detected');
                        }
                    }
                    
                    this.onHandDetection(predictions);
                    
                } catch (error) {
                    console.error('❌ Hand detection error:', error);
                    this.drawDetectionStatus('❌ ERROR', '#ff8800');
                }
            } else {
                // Video not ready
                this.drawDetectionStatus('⏳ VIDEO LOADING', '#ffff00');
                
                if (this.detectionCount % 60 === 0) {
                    console.log('⚠️ Video not ready, readyState:', this.videoElement.readyState);
                }
            }
            
            if (this.isDetecting) {
                requestAnimationFrame(detectHands);
            }
        };
        
        detectHands();
    }
    
    onMediaPipeResults(results) {
        // Clear canvas
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Draw the video frame first
        this.canvasCtx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Process MediaPipe results
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Show real-time detection status
            this.drawDetectionStatus('✅ HAND DETECTED', '#00ff00');
            
            // Convert MediaPipe landmarks to TensorFlow format for compatibility
            const tfFormatLandmarks = landmarks.map(point => [
                point.x * this.canvasElement.width,
                point.y * this.canvasElement.height,
                point.z || 0
            ]);
            
            // Draw hand landmarks
            this.drawMediaPipeHand(landmarks);
            
            // Detect gesture during the game OR in debug mode
            if ((this.startGame && !this.stateResult) || this.debugGestureDetection) {
                if (this.debugGestureDetection) {
                    console.log('Debug mode - detecting gesture...');
                } else {
                    console.log('Game active - detecting gesture...');
                }
                this.detectGesture(tfFormatLandmarks);
            }
            
            // Log occasionally
            if (this.detectionCount % 30 === 0) {
                console.log('🖐️ MediaPipe hand found:', landmarks.length, 'landmarks');
            }
        } else {
            // No hand detected
            this.drawDetectionStatus('❌ NO HAND', '#ff0000');
            
            if (this.detectionCount % 60 === 0) {
                console.log('👀 MediaPipe: No hands detected');
            }
        }
        
        this.detectionCount = (this.detectionCount || 0) + 1;
    }

    onHandDetection(predictions) {
        // Clear canvas
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Log hand detection results
        if (predictions.length > 0) {
            // Only log occasionally to avoid spam
            if (this.detectionCount % 30 === 0) {
                console.log(`Hand detected! Landmarks: ${predictions[0].landmarks.length}`);
            }
            
            const hand = predictions[0];
            this.drawHand(hand.landmarks);
            
            // Detect gesture during the game OR in debug mode
            if ((this.startGame && !this.stateResult) || this.debugGestureDetection) {
                if (this.debugGestureDetection) {
                    console.log('Debug mode - detecting gesture...');
                } else {
                    console.log('Game active - detecting gesture...');
                }
                this.detectGesture(hand.landmarks);
            } else {
                // Show why we're not detecting gestures
                if (this.detectionCount % 60 === 0) {
                    console.log('Not detecting gestures:', {
                        startGame: this.startGame,
                        stateResult: this.stateResult,
                        debugMode: this.debugGestureDetection
                    });
                }
            }
        } else {
            // Log when no hands are detected (less frequently)
            if (this.detectionCount % 120 === 0) {
                console.log('No hands detected in frame');
            }
        }
    }
    
    drawDetectionStatus(text, color) {
        // Draw status indicator on canvas
        this.canvasCtx.save();
        this.canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.canvasCtx.fillRect(10, 10, 200, 30);
        
        this.canvasCtx.fillStyle = color;
        this.canvasCtx.font = '16px Arial';
        this.canvasCtx.fillText(text, 15, 30);
        this.canvasCtx.restore();
    }
    
    drawMediaPipeHand(landmarks) {
        // Draw MediaPipe hand landmarks (normalized coordinates)
        this.canvasCtx.save();
        this.canvasCtx.fillStyle = '#FF0000';
        this.canvasCtx.strokeStyle = '#00FF00';
        this.canvasCtx.lineWidth = 2;
        
        // Draw landmarks as circles
        landmarks.forEach(landmark => {
            const x = landmark.x * this.canvasElement.width;
            const y = landmark.y * this.canvasElement.height;
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(x, y, 4, 0, 2 * Math.PI);
            this.canvasCtx.fill();
        });
        
        // Draw hand connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [5, 9], [9, 10], [10, 11], [11, 12], // Middle
            [9, 13], [13, 14], [14, 15], [15, 16], // Ring
            [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [0, 17] // Palm connection
        ];
        
        this.canvasCtx.beginPath();
        connections.forEach(([start, end]) => {
            const startX = landmarks[start].x * this.canvasElement.width;
            const startY = landmarks[start].y * this.canvasElement.height;
            const endX = landmarks[end].x * this.canvasElement.width;
            const endY = landmarks[end].y * this.canvasElement.height;
            
            this.canvasCtx.moveTo(startX, startY);
            this.canvasCtx.lineTo(endX, endY);
        });
        this.canvasCtx.stroke();
        this.canvasCtx.restore();
    }

    drawHand(landmarks) {
        // Draw hand landmarks
        this.canvasCtx.save();
        this.canvasCtx.fillStyle = '#FF0000';
        this.canvasCtx.strokeStyle = '#00FF00';
        this.canvasCtx.lineWidth = 2;
        
        // Draw landmarks as circles
        landmarks.forEach(landmark => {
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(landmark[0], landmark[1], 4, 0, 2 * Math.PI);
            this.canvasCtx.fill();
        });
        
        // Draw hand connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [5, 9], [9, 10], [10, 11], [11, 12], // Middle
            [9, 13], [13, 14], [14, 15], [15, 16], // Ring
            [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [0, 17] // Palm connection
        ];
        
        this.canvasCtx.beginPath();
        connections.forEach(([start, end]) => {
            this.canvasCtx.moveTo(landmarks[start][0], landmarks[start][1]);
            this.canvasCtx.lineTo(landmarks[end][0], landmarks[end][1]);
        });
        this.canvasCtx.stroke();
        this.canvasCtx.restore();
    }
    
    detectGesture(landmarks) {
        const fingers = this.getFingersUp(landmarks);
        const previousMove = this.playerMove;
        let detectedGesture = null;
        let gestureName = '';
        
        // 🚫 SPORTSMANSHIP DETECTOR - Check for middle finger first!
        if (this.startGame && !this.stateResult && this.detectMiddleFinger(fingers)) {
            console.log('🚫 UNSPORTSMANLIKE CONDUCT DETECTED!');
            this.handleUnsportsmanlikeConduct();
            return; // Stop processing other gestures
        }
        
        // Rock: All fingers down (fist) - allow some tolerance
        const downFingers = fingers.filter(f => !f).length;
        if (downFingers >= 4) { // At least 4 fingers down
            detectedGesture = 1;
            gestureName = 'ROCK ✊';
        }
        // Paper: All or most fingers up (open hand)
        else if (fingers.filter(f => f).length >= 4) { // At least 4 fingers up
            detectedGesture = 2;
            gestureName = 'PAPER ✋';
        }
        // Scissors: Index and middle finger up, others down
        else if (fingers[1] && fingers[2] && !fingers[3] && !fingers[4]) {
            detectedGesture = 3;
            gestureName = 'SCISSORS ✌️';
        }
        
        // Update player move and show feedback
        if (detectedGesture) {
            this.playerMove = detectedGesture;
            
            // Show gesture on canvas
            this.drawGestureIndicator(gestureName);
            
            // Log and update status only when gesture changes
            if (previousMove !== detectedGesture) {
                console.log(`${gestureName} detected!`);
                if (!this.startGame || this.stateResult) {
                    this.gameStatus.textContent = `${gestureName} detected!`;
                }
            }
        } else {
            // No clear gesture detected
            this.playerMove = null;
            const upFingers = fingers.filter(f => f).length;
            
            if (this.debugGestureDetection && this.detectionCount % 60 === 0) {
                console.log(`Unclear gesture: ${upFingers} fingers up`, fingers.map(f => f ? '1' : '0').join(''));
            }
        }
    }
    
    // 🚫 Sportsmanship Detector - Middle finger detection
    detectMiddleFinger(fingers) {
        // Middle finger pattern: Only middle finger up, all others down
        // fingers array: [thumb, index, middle, ring, pinky]
        const isMiddleFingerUp = fingers[2]; // Middle finger
        const isIndexDown = !fingers[1]; // Index finger down
        const isRingDown = !fingers[3]; // Ring finger down 
        const isPinkyDown = !fingers[4]; // Pinky down
        // Thumb can be up or down (thumb position varies)
        
        // Classic middle finger: only middle finger extended
        const classicMiddleFinger = isMiddleFingerUp && isIndexDown && isRingDown && isPinkyDown;
        
        return classicMiddleFinger;
    }
    
    // 🚫 Handle unsportsmanlike conduct
    handleUnsportsmanlikeConduct() {
        console.log('🚫 Player disqualified for unsportsmanlike conduct!');
        
        // Play a disapproving sound
        this.playSound('matchLose');
        
        // Immediately end the game with AI victory
        this.scores[0] = 3; // AI wins
        this.scores[1] = Math.min(this.scores[1], 2); // Player can't win
        this.gameOver = true;
        this.startGame = false;
        this.stateResult = true;
        
        // Show disqualification on canvas
        this.drawDisqualificationMessage();
        
        // Update status
        this.gameStatus.textContent = '🚫 DISQUALIFIED for bad conduct!';
        this.gameStatus.style.color = '#ff0000';
        this.updateDisplay();
        
        // Show special game over modal after delay
        setTimeout(() => {
            this.showUnsportsmanlikeGameOver();
        }, 2000);
    }
    
    // Draw disqualification message on canvas
    drawDisqualificationMessage() {
        this.canvasCtx.save();
        
        // Red warning background
        this.canvasCtx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        this.canvasCtx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Warning text
        this.canvasCtx.fillStyle = '#ffffff';
        this.canvasCtx.font = 'bold 24px Arial';
        this.canvasCtx.textAlign = 'center';
        
        const centerX = this.canvasElement.width / 2;
        const centerY = this.canvasElement.height / 2;
        
        this.canvasCtx.fillText('🚫 DISQUALIFIED!', centerX, centerY - 10);
        this.canvasCtx.fillText('BAD CONDUCT!', centerX, centerY + 20);
        
        this.canvasCtx.restore();
    }
    
    // Special game over for disqualification
    showUnsportsmanlikeGameOver() {
        const gameOverTitle = document.getElementById('gameOverTitle');
        const gameOverMessage = document.getElementById('gameOverMessage');
        
        // Fun random messages (shorter for better fit)
        const unsportsmanlikeMessages = [
            "DISQUALIFIED! 🚫",
            "KEEP IT CLEAN! 😤", 
            "BAD CONDUCT! 🚨",
            "REFEREE SAYS NO! 🏃‍♂️",
            "SHAME ON YOU! 😠",
            "PLAY NICE! 🤨",
            "CAUGHT RED-HANDED! 👀"
        ];
        
        const descriptions = [
            "AI wins by default due to poor sportsmanship!",
            "Keep it clean next time, champ! 🧽",
            "The digital referee is watching! 👀",
            "Play nice or don't play at all! 😤",
            "Sportsmanship matters in Rock Paper Scissors! 🤝"
        ];
        
        const randomMessage = unsportsmanlikeMessages[Math.floor(Math.random() * unsportsmanlikeMessages.length)];
        const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
        
        gameOverTitle.textContent = randomMessage;
        gameOverTitle.style.color = '#ff0000';
        gameOverMessage.textContent = randomDescription;
        
        this.showModal(this.gameOverModal);
    }
    
    drawGestureIndicator(gestureName) {
        // Draw gesture indicator on canvas
        this.canvasCtx.save();
        this.canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.canvasCtx.fillRect(10, 50, 180, 25);
        
        this.canvasCtx.fillStyle = '#00ff00';
        this.canvasCtx.font = 'bold 14px Arial';
        this.canvasCtx.fillText(gestureName, 15, 68);
        this.canvasCtx.restore();
    }
    
    getFingersUp(landmarks) {
        const tipIds = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips
        const pipIds = [3, 6, 10, 14, 18]; // PIP joints for comparison
        const fingers = [];
        
        // Only log detailed analysis in debug mode
        if (this.debugGestureDetection && this.detectionCount % 30 === 0) {
            console.log('🔍 Analyzing landmarks for finger detection...');
        }
        
        // Thumb detection - improved logic
        const thumbTip = landmarks[tipIds[0]];
        const thumbPip = landmarks[pipIds[0]];
        
        // Thumb is up if tip is further from palm than pip
        const thumbDistanceFromPalm = Math.sqrt(
            Math.pow(thumbTip[0] - landmarks[0][0], 2) + 
            Math.pow(thumbTip[1] - landmarks[0][1], 2)
        );
        const pipDistanceFromPalm = Math.sqrt(
            Math.pow(thumbPip[0] - landmarks[0][0], 2) + 
            Math.pow(thumbPip[1] - landmarks[0][1], 2)
        );
        
        const thumbUp = thumbDistanceFromPalm > pipDistanceFromPalm;
        fingers.push(thumbUp);
        
        // Other fingers - improved detection
        for (let i = 1; i < 5; i++) {
            const tip = landmarks[tipIds[i]];
            const pip = landmarks[pipIds[i]];
            const mcp = landmarks[pipIds[i] - 3]; // MCP joint
            
            // Finger is up if tip is above both pip and mcp
            const fingerUp = tip[1] < pip[1] && tip[1] < mcp[1];
            fingers.push(fingerUp);
            
            if (this.debugGestureDetection && this.detectionCount % 30 === 0) {
                const fingerNames = ['index', 'middle', 'ring', 'pinky'];
                console.log(`${fingerNames[i-1]}: ${fingerUp ? '👆' : '👇'}`);
            }
        }
        
        // Show finger pattern in debug mode
        if (this.debugGestureDetection && this.detectionCount % 30 === 0) {
            console.log('Finger pattern:', fingers.map(f => f ? '1' : '0').join(''));
        }
        
        return fingers;
    }
    
    startRound() {
        console.log('Start round clicked!');
        console.log('Game over:', this.gameOver);
        console.log('Hand pose model (TensorFlow):', !!this.handPoseModel);
        console.log('MediaPipe active:', !!this.isMediaPipeActive);
        console.log('MediaPipe hands:', !!this.hands);
        console.log('Keyboard mode:', !!this.keyboardMode);
        
        // Allow starting if we have hand detection OR keyboard mode
        if (this.gameOver) {
            console.log('Cannot start - game is over');
            return;
        }
        
        // Check for any available input method
        const hasMediaPipe = this.isMediaPipeActive && this.hands;
        const hasTensorFlow = !!this.handPoseModel;
        const hasKeyboard = !!this.keyboardMode;
        
        console.log('Input methods available:', { hasMediaPipe, hasTensorFlow, hasKeyboard });
        
        if (!hasMediaPipe && !hasTensorFlow && !hasKeyboard) {
            console.log('Cannot start - no input method available');
            this.gameStatus.textContent = 'No input method available. Trying to load hand detection...';
            this.loadHandPoseModel(); // Try loading again
            return;
        }
        
        console.log('Starting tournament match...');
        this.playSound('startGame');  // Play start game sound
        this.startGame = true;
        this.stateResult = false;
        this.initialTime = Date.now();
        this.playerMove = null;
        this.aiMove = null;
        this.aiMoveImage.style.display = 'none';
        
        // Show appropriate message based on available input method
        if (hasMediaPipe) {
            this.gameStatus.textContent = 'Tournament started! Show your hand gesture';
            console.log('✅ Starting tournament with MediaPipe hand detection');
        } else if (hasTensorFlow) {
            this.gameStatus.textContent = 'Tournament started! Show your hand gesture';
            console.log('✅ Starting tournament with TensorFlow hand detection');
        } else if (hasKeyboard) {
            this.gameStatus.textContent = 'Tournament started! Use R=Rock, P=Paper, S=Scissors';
            console.log('✅ Starting tournament with keyboard controls');
        }
        
        this.startButton.disabled = true;
        
        this.runTimer();
    }
    
    runTimer() {
        const updateTimer = () => {
            if (!this.startGame || this.stateResult) return;
            
            const elapsed = (Date.now() - this.initialTime) / 1000;
            const remaining = Math.max(0, 3 - elapsed);
            
            if (remaining > 0) {
                const countdownNumber = Math.ceil(remaining);
                this.timerDisplay.textContent = countdownNumber;
                this.timerDisplay.classList.add('counting');
                this.gameStatus.textContent = 'Show your move!';
                
                // Play countdown sounds
                const prevCountdown = Math.ceil(remaining + 0.016); // Previous frame countdown
                if (countdownNumber !== prevCountdown) {
                    if (countdownNumber === 1) {
                        this.playSound('countdownFinal'); // Different sound for "1"
                    } else {
                        this.playSound('countdown'); // Regular countdown beep
                    }
                }
                
                requestAnimationFrame(updateTimer);
            } else {
                this.timerDisplay.classList.remove('counting');
                this.evaluateRound();
            }
        };
        
        requestAnimationFrame(updateTimer);
    }
    
    evaluateRound() {
        this.stateResult = true;
        this.timerDisplay.textContent = '';
        
        // Generate AI move
        this.aiMove = Math.floor(Math.random() * 3) + 1;
        this.aiMoveImage.src = `Resources/${this.aiMove}.png`;
        this.aiMoveImage.style.display = 'block';
        this.aiMoveImage.classList.add('bounce');
        
        // Determine winner and update scores
        let roundResult = '';
        if (this.playerMove !== null) {
            const result = this.determineWinner(this.playerMove, this.aiMove);
            
            if (result === 'player') {
                this.scores[1]++;
                roundResult = 'You win this round!';
                this.gameStatus.style.color = '#00ff00';
                this.playSound('roundWin');
            } else if (result === 'ai') {
                this.scores[0]++;
                roundResult = 'AI wins this round!';
                this.gameStatus.style.color = '#ff0000';
                this.playSound('roundLose');
            } else {
                roundResult = "It's a tie!";
                this.gameStatus.style.color = '#ffff00';
                // No sound for tie - keeps it neutral
            }
        } else {
            roundResult = 'No move detected!';
            this.gameStatus.style.color = '#ff8800';
        }
        
        // Show round result with current score
        this.gameStatus.textContent = `${roundResult} Score: AI ${this.scores[0]} - ${this.scores[1]} You`;
        this.updateDisplay();
        
        // Check for match over (first to 3 points)
        if (this.scores[0] >= 3 || this.scores[1] >= 3) {
            console.log('Match over! Final score:', this.scores);
            this.gameOver = true;
            this.startButton.disabled = false;
            setTimeout(() => this.showGameOver(), 2500);
        } else {
            // Continue tournament - automatically start next round
            console.log(`Round complete. Score: AI ${this.scores[0]} - ${this.scores[1]} Player. Continuing tournament...`);
            setTimeout(() => {
                // Start next round automatically
                this.startNextRound();
            }, 3000);
        }
    }
    
    startNextRound() {
        console.log('Auto-starting next round...');
        
        // Reset round state
        this.stateResult = false;
        this.playerMove = null;
        this.aiMove = null;
        this.aiMoveImage.style.display = 'none';
        this.aiMoveImage.classList.remove('bounce');
        this.initialTime = Date.now();
        
        // Show next round message
        this.gameStatus.textContent = `Round ${this.scores[0] + this.scores[1] + 1}: Get ready!`;
        this.gameStatus.style.color = '#ffffff';
        
        // Start timer for next round
        this.runTimer();
    }
    
    determineWinner(playerMove, aiMove) {
        if (playerMove === aiMove) return 'tie';
        
        const winConditions = {
            1: 3, // Rock beats Scissors
            2: 1, // Paper beats Rock
            3: 2  // Scissors beats Paper
        };
        
        return winConditions[playerMove] === aiMove ? 'player' : 'ai';
    }
    
    showGameOver() {
        const gameOverTitle = document.getElementById('gameOverTitle');
        const gameOverMessage = document.getElementById('gameOverMessage');
        
        if (this.scores[1] >= 3) {
            gameOverTitle.textContent = '🎉 YOU WIN! 🎉';
            gameOverTitle.style.color = '#00ff00';
            gameOverMessage.textContent = `Congratulations! Final Score: ${this.scores[1]} - ${this.scores[0]}`;
            this.playSound('matchWin'); // Victory fanfare!
        } else {
            gameOverTitle.textContent = '🤖 AI WINS! 🤖';
            gameOverTitle.style.color = '#ff0000';
            gameOverMessage.textContent = `Better luck next time! Final Score: ${this.scores[0]} - ${this.scores[1]}`;
            this.playSound('matchLose'); // Defeat sound
        }
        
        this.showModal(this.gameOverModal);
    }
    
    restartMatch() {
        this.gameOver = false;
        this.startGame = false;
        this.stateResult = false;
        this.scores = [0, 0];
        this.playerMove = null;
        this.aiMove = null;
        
        this.timerDisplay.textContent = '';
        this.timerDisplay.classList.remove('counting');
        this.gameStatus.textContent = 'Press START TOURNAMENT to begin new match (first to 3 wins)!';
        this.gameStatus.style.color = '#ffffff';
        this.aiMoveImage.style.display = 'none';
        this.aiMoveImage.classList.remove('bounce');
        this.startButton.disabled = false;
        
        this.hideModal(this.gameOverModal);
        this.updateDisplay();
    }
    
    endGame() {
        console.log('Ending game...');
        
        // Reset game state
        this.gameOver = false;
        this.startGame = false;
        this.stateResult = false;
        this.scores = [0, 0];
        this.playerMove = null;
        this.aiMove = null;
        
        // Reset UI
        this.timerDisplay.textContent = '';
        this.timerDisplay.classList.remove('counting');
        this.aiMoveImage.style.display = 'none';
        this.aiMoveImage.classList.remove('bounce');
        this.startButton.disabled = false;
        this.updateDisplay();
        
        // Hide game over modal
        this.hideModal(this.gameOverModal);
        
        // Show thank you message and return to main menu state
        this.gameStatus.textContent = '🎉 Thanks for playing Rock Paper Scissors! 🎉';
        this.gameStatus.style.color = '#00ff00';
        
        // After 3 seconds, show ready message
        setTimeout(() => {
            // Show appropriate ready message based on active input method
            if (this.isMediaPipeActive && this.hands) {
                this.gameStatus.textContent = 'MediaPipe ready! Press START TOURNAMENT when you want to play again!';
            } else if (this.handPoseModel) {
                this.gameStatus.textContent = 'TensorFlow ready! Press START TOURNAMENT when you want to play again!';
            } else if (this.keyboardMode) {
                this.gameStatus.textContent = 'Keyboard ready! Press START TOURNAMENT when you want to play again!';
            } else {
                this.gameStatus.textContent = 'Press START TOURNAMENT when you want to play again!';
            }
            this.gameStatus.style.color = '#ffffff';
        }, 3000);
    }
    
    updateDisplay() {
        this.aiScoreDisplay.textContent = this.scores[0];
        this.playerScoreDisplay.textContent = this.scores[1];
    }
    
    showModal(modal) {
        modal.style.display = 'flex';
        modal.classList.add('fade-in');
    }
    
    hideModal(modal) {
        modal.style.display = 'none';
        modal.classList.remove('fade-in');
    }
    
    hideLoadingIndicator() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }
    
    showLoadingIndicator() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'flex';
        }
    }
    
    
    async runImmediateHandTest() {
        console.log('🧪 IMMEDIATE HAND TEST - Starting...');
        
        // Test 1: Check video
        const video = this.videoElement;
        console.log('Video ready:', video?.readyState === 4);
        console.log('Video dimensions:', video?.videoWidth, 'x', video?.videoHeight);
        
        if (!video || video.readyState !== 4) {
            this.gameStatus.textContent = 'Video not ready for testing';
            this.debugButton.textContent = 'DEBUG HANDS';
            return;
        }
        
        // Test 2: Try MediaPipe first (preferred)
        if (typeof Hands !== 'undefined') {
            console.log('✅ MediaPipe available - testing...');
            try {
                await this.testMediaPipeInDebug();
                return; // MediaPipe test handles the rest
            } catch (error) {
                console.log('MediaPipe test failed, trying TensorFlow fallback:', error);
            }
        }
        
        // Test 3: Fallback to TensorFlow.js
        const tfAvailable = typeof tf !== 'undefined';
        const handposeAvailable = typeof handpose !== 'undefined';
        
        console.log('TensorFlow.js available:', tfAvailable);
        console.log('HandPose available:', handposeAvailable);
        
        if (!tfAvailable || !handposeAvailable) {
            this.gameStatus.textContent = 'Hand detection libraries not loaded';
            this.debugButton.textContent = 'DEBUG HANDS';
            return;
        }
        
        // Test 4: Try TensorFlow detection
        try {
            this.gameStatus.textContent = 'Testing TensorFlow hand detection...';
            
            // Load fresh model
            const testModel = await handpose.load();
            console.log('✅ TensorFlow test model loaded');
            
            // Try detection on current video frame
            const result = await testModel.estimateHands(video);
            console.log('📊 TensorFlow test result:', result);
            
            if (result && result.length > 0) {
                console.log('🎉 SUCCESS! TensorFlow hand detected in test');
                this.gameStatus.textContent = '✅ TensorFlow hand detection working! Try making gestures.';
                this.debugButton.textContent = 'DEBUG: ON';
                
                // Use this working model
                this.handPoseModel = testModel;
                this.startHandDetection();
            } else {
                console.log('😞 No hands detected in TensorFlow test');
                this.gameStatus.textContent = '❌ No hands detected. Try moving hand in camera view.';
                this.debugButton.textContent = 'TRY AGAIN';
                
                // Start basic video analysis to show something is happening
                this.startBasicVideoAnalysis();
                
                // Keep trying every 5 seconds
                setTimeout(() => this.runImmediateHandTest(), 5000);
            }
            
        } catch (error) {
            console.error('❌ Test failed:', error);
            this.gameStatus.textContent = '❌ Hand detection test failed. Using keyboard controls.';
            this.debugButton.textContent = 'DEBUG HANDS';
            this.setupKeyboardFallback();
        }
    }
    
    async testMediaPipeInDebug() {
        console.log('🧪 Testing MediaPipe in debug mode...');
        this.gameStatus.textContent = 'Testing MediaPipe hand detection...';
        
        try {
            // Create test MediaPipe instance
            const testHands = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });
            
            testHands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.3,  // Lower threshold for testing
                minTrackingConfidence: 0.3   // Lower threshold for testing
            });
            
            // Set up test results handler
            let testResultReceived = false;
            testHands.onResults((results) => {
                testResultReceived = true;
                console.log('🖐️ MediaPipe debug test results:', results);
                
                if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                    console.log('🎉 SUCCESS! MediaPipe detected hand in debug test');
                    this.gameStatus.textContent = '✅ MediaPipe working! Activating full detection...';
                    this.debugButton.textContent = 'DEBUG: ON';
                    
                    // Use MediaPipe as primary detection method
                    this.hands = testHands;
                    this.isMediaPipeActive = true;
                    
                    // Start MediaPipe camera if not already started
                    if (!this.camera) {
                        this.camera = new Camera(this.videoElement, {
                            onFrame: async () => {
                                if (this.hands) {
                                    await this.hands.send({image: this.videoElement});
                                }
                            },
                            width: 640,
                            height: 480
                        });
                        this.camera.start();
                    }
                    
                } else {
                    console.log('😞 MediaPipe debug test: No hands detected');
                    this.gameStatus.textContent = '❌ MediaPipe: No hands detected. Try moving hand in view.';
                    this.debugButton.textContent = 'TRY AGAIN';
                    
                    // Keep trying
                    setTimeout(() => this.runImmediateHandTest(), 3000);
                }
            });
            
            // Send current frame to MediaPipe
            console.log('📷 Sending frame to MediaPipe for debug test...');
            await testHands.send({image: this.videoElement});
            
            // Wait for result or timeout
            setTimeout(() => {
                if (!testResultReceived) {
                    console.log('⏰ MediaPipe debug test timeout');
                    throw new Error('MediaPipe test timeout');
                }
            }, 5000);
            
        } catch (error) {
            console.error('❌ MediaPipe debug test failed:', error);
            throw error; // Re-throw to trigger TensorFlow fallback
        }
    }
    
    startBasicVideoAnalysis() {
        if (this.basicAnalysisRunning) return;
        
        this.basicAnalysisRunning = true;
        let frameCount = 0;
        
        const analyzeFrame = () => {
            if (!this.debugMode || !this.basicAnalysisRunning) return;
            
            frameCount++;
            
            // Draw video frame to canvas
            if (this.videoElement.readyState === 4) {
                this.canvasCtx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
                
                // Add simple visual feedback
                this.canvasCtx.save();
                this.canvasCtx.fillStyle = 'rgba(255, 255, 0, 0.8)';
                this.canvasCtx.fillRect(10, 10, 250, 30);
                this.canvasCtx.fillStyle = 'black';
                this.canvasCtx.font = '14px Arial';
                this.canvasCtx.fillText(`🔍 Analyzing frame ${frameCount}...`, 15, 28);
                this.canvasCtx.restore();
                
                // Simple brightness analysis as activity indicator
                if (frameCount % 30 === 0) {
                    const imageData = this.canvasCtx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
                    let totalBrightness = 0;
                    
                    for (let i = 0; i < imageData.data.length; i += 4) {
                        totalBrightness += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
                    }
                    
                    const avgBrightness = totalBrightness / (imageData.data.length / 4);
                    console.log(`📊 Frame ${frameCount}: Average brightness ${avgBrightness.toFixed(1)}`);
                }
            }
            
            requestAnimationFrame(analyzeFrame);
        };
        
        analyzeFrame();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new RockPaperScissorsGame();
});

// Handle page visibility changes (for mobile browser switching)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - camera paused');
    } else {
        console.log('Page visible - camera resumed');
    }
});