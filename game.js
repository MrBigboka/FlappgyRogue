// ============================================
// FLAPPY ROGUE - A Rogue-like Flappy Bird Game
// REMASTERED EDITION
// ============================================

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Display mode: 'pc', 'mobile', 'fullscreen'
        this.displayMode = 'pc';
        this.isFullscreen = false;
        
        // Audio system
        this.setupAudio();
        
        // Set canvas size with proper aspect ratio
        this.setupCanvas();
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
        
        // Handle fullscreen change
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            if (!this.isFullscreen && this.displayMode === 'fullscreen') {
                this.displayMode = 'pc';
                this.updateModeButtons();
            }
            this.setupCanvas();
        });
        
        // Game state
        this.state = 'menu'; // menu, playing, upgrade, gameover
        this.score = 0;
        this.pipesPassed = 0;
        this.powerupsCollected = 0;
        
        // Player stats (rogue-like progression)
        this.stats = {
            highScore: parseInt(localStorage.getItem('flappyRogue_highScore')) || 0,
            totalRuns: parseInt(localStorage.getItem('flappyRogue_totalRuns')) || 0
        };
        
        // Bird properties
        this.bird = {
            x: 80,
            y: 300,
            width: 40,
            height: 30,
            velocity: 0,
            gravity: 0.2,
            jumpForce: -5,
            rotation: 0
        };
        
        // Game objects
        this.pipes = [];
        this.powerups = [];
        this.particles = [];
        
        // Rogue-like upgrades
        this.upgrades = {
            extraLife: 0,
            shield: false,
            slowTime: false,
            magnetism: false,
            doubleScore: false,
            smallerBird: false,
            floaty: false
        };
        
        this.health = 1;
        this.maxHealth = 1;
        this.shieldActive = false;
        this.slowTimeActive = false;
        this.slowTimeTimer = 0;
        this.invulnerableTimer = 0;
        this.milestoneTimer = 0;
        
        // Juice effects
        this.screenShake = 0;
        this.combo = 0;
        this.lastScoreTime = 0;
        
        // Timing
        this.pipeSpawnTimer = 0;
        this.pipeSpawnInterval = 150; // Start with wide spacing
        this.powerupSpawnTimer = 0;
        this.gameSpeed = 1.5;
        this.baseGapSize = 200; // Start with large gaps
        
        // Available upgrades pool
        this.upgradePool = [
            { id: 'extraLife', name: 'Extra Heart', icon: '❤️', description: '+1 Max Health', rarity: 'common' },
            { id: 'shield', name: 'Shield', icon: '🛡️', description: 'Block one hit', rarity: 'rare' },
            { id: 'slowTime', name: 'Slow Motion', icon: '⏱️', description: 'Permanently slows game 15%', rarity: 'epic' },
            { id: 'magnetism', name: 'Magnet', icon: '🧲', description: 'Attract power-ups', rarity: 'rare' },
            { id: 'doubleScore', name: 'Double Score', icon: '✨', description: '2x points per pipe', rarity: 'epic' },
            { id: 'smallerBird', name: 'Shrink', icon: '🔬', description: 'Smaller hitbox', rarity: 'rare' },
            { id: 'floaty', name: 'Feather Fall', icon: '🪶', description: 'Reduced gravity', rarity: 'common' },
            { id: 'widerGaps', name: 'Wide Gaps', icon: '↕️', description: 'Larger pipe gaps', rarity: 'rare' },
            { id: 'oneUp', name: '1-UP', icon: '👼', description: 'Revive once when you die!', rarity: 'legendary' }
        ];
        
        // Power-up types that spawn in game
        this.powerupTypes = [
            { type: 'coin', icon: '🪙', color: '#ffd700', weight: 40 },
            { type: 'heart', icon: '❤️', color: '#e74c3c', weight: 25 },
            { type: 'star', icon: '⭐', color: '#f39c12', weight: 15 },
            { type: 'shield', icon: '🛡️', color: '#3498db', weight: 15 },
            { type: 'clock', icon: '⏰', color: '#9b59b6', weight: 5 }
        ];
        
        // World/Environment system
        this.currentWorld = 0;
        this.worldTransitionTimer = 0;
        this.worldTransitionText = '';
        this.worlds = [
            {
                name: 'Sky Meadow',
                subtitle: 'World 1 - The Beginning',
                bgTop: '#87CEEB',
                bgBottom: '#E0F6FF',
                pipeColor1: '#2ecc71',
                pipeColor2: '#27ae60',
                pipeColor3: '#1e8449',
                groundColor: '#8B4513',
                grassColor: '#2ecc71',
                birdColor1: '#f39c12',
                birdColor2: '#e67e22',
                particleColor: '#fff',
                obstacleType: 'pipes',
                threshold: 0
            },
            {
                name: 'Sunset Valley',
                subtitle: 'World 2 - Twilight Zone',
                bgTop: '#ff7e5f',
                bgBottom: '#feb47b',
                pipeColor1: '#8e44ad',
                pipeColor2: '#9b59b6',
                pipeColor3: '#6c3483',
                groundColor: '#5d4e37',
                grassColor: '#f39c12',
                birdColor1: '#e74c3c',
                birdColor2: '#c0392b',
                particleColor: '#ffeaa7',
                obstacleType: 'pillars',
                threshold: 8
            },
            {
                name: 'Frozen Peaks',
                subtitle: 'World 3 - Ice Mountains',
                bgTop: '#a8e6cf',
                bgBottom: '#dcedc1',
                pipeColor1: '#74b9ff',
                pipeColor2: '#0984e3',
                pipeColor3: '#0652DD',
                groundColor: '#dfe6e9',
                grassColor: '#81ecec',
                birdColor1: '#00cec9',
                birdColor2: '#00b894',
                particleColor: '#fff',
                obstacleType: 'icicles',
                threshold: 18
            },
            {
                name: 'Volcanic Hell',
                subtitle: 'World 4 - Inferno',
                bgTop: '#2d1b00',
                bgBottom: '#5c0000',
                pipeColor1: '#e74c3c',
                pipeColor2: '#c0392b',
                pipeColor3: '#7b241c',
                groundColor: '#1a1a1a',
                grassColor: '#e74c3c',
                birdColor1: '#ff6b6b',
                birdColor2: '#ee5a24',
                particleColor: '#ff9f43',
                obstacleType: 'lava',
                threshold: 30
            },
            {
                name: 'Neon City',
                subtitle: 'World 5 - Cyberpunk',
                bgTop: '#0c0c1e',
                bgBottom: '#1a1a3e',
                pipeColor1: '#00ff88',
                pipeColor2: '#00cc6a',
                pipeColor3: '#009950',
                groundColor: '#1a1a2e',
                grassColor: '#ff00ff',
                birdColor1: '#00ffff',
                birdColor2: '#ff00ff',
                particleColor: '#00ff88',
                obstacleType: 'lasers',
                threshold: 45
            },
            {
                name: 'Cosmic Void',
                subtitle: 'World 6 - Final Frontier',
                bgTop: '#0a0a15',
                bgBottom: '#1a0a2e',
                pipeColor1: '#9b59b6',
                pipeColor2: '#8e44ad',
                pipeColor3: '#6c3483',
                groundColor: '#0a0a15',
                grassColor: '#e056fd',
                birdColor1: '#f368e0',
                birdColor2: '#be2edd',
                particleColor: '#fff',
                obstacleType: 'asteroids',
                threshold: 60
            }
        ];
        
        this.init();
    }
    
    setupCanvas() {
        const container = document.getElementById('game-container');
        
        if (this.displayMode === 'mobile') {
            // Mobile: full screen with portrait-friendly settings
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            container.classList.add('mobile-mode');
            container.classList.remove('fullscreen-mode');
        } else if (this.displayMode === 'fullscreen' || this.isFullscreen) {
            // Fullscreen: use full screen
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            container.classList.add('fullscreen-mode');
            container.classList.remove('mobile-mode');
        } else {
            // PC: limit to 16:9 aspect ratio, max 700px height for playability
            const maxHeight = Math.min(window.innerHeight - 40, 700);
            const maxWidth = Math.min(window.innerWidth - 40, maxHeight * 1.5);
            this.canvas.width = maxWidth;
            this.canvas.height = maxHeight;
            container.classList.remove('fullscreen-mode');
            container.classList.remove('mobile-mode');
        }
        
        // Update bird position based on mode
        if (this.bird) {
            this.bird.x = (this.displayMode === 'mobile') ? 60 : 120;
        }
    }
    
    setDisplayMode(mode) {
        this.displayMode = mode;
        this.updateModeButtons();
        
        if (mode === 'fullscreen') {
            const container = document.getElementById('game-container');
            container.requestFullscreen().catch(err => console.log(err));
        } else if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        
        this.setupCanvas();
        
        // Update mode text
        const modeText = document.getElementById('current-mode');
        if (modeText) {
            const modeNames = { pc: 'PC', mobile: 'Mobile', fullscreen: 'Fullscreen' };
            modeText.textContent = `Mode: ${modeNames[mode]}`;
        }
    }
    
    updateModeButtons() {
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`mode-${this.displayMode}-btn`);
        if (activeBtn) activeBtn.classList.add('active');
    }
    
    // Get mode-specific settings
    getSettings() {
        const isMobileMode = this.displayMode === 'mobile';
        
        if (isMobileMode) {
            return {
                minGap: 160,
                maxGap: 220,
                pipeDistance: 250,      // Tighter on mobile
                baseSpeed: 2.5,
                maxSpeed: 5,
                magnetRadius: 220,
                powerupSize: 40
            };
        } else {
            return {
                minGap: 140,
                maxGap: 200,
                pipeDistance: 280,      // Faster pacing on PC
                baseSpeed: 3,
                maxSpeed: 6,
                magnetRadius: 180,
                powerupSize: 30
            };
        }
    }
    
    setupAudio() {
        // Audio context for sound effects
        this.audioEnabled = true;
        this.musicVolume = parseFloat(localStorage.getItem('flappyRogue_volume')) || 0.5;
        
        // Create oscillator-based sounds (no external files needed)
        this.audioCtx = null;
        
        // Try to create audio context on first user interaction
        const initAudio = () => {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
        };
        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);
    }
    
    playSound(type) {
        if (!this.audioEnabled || !this.audioCtx) return;
        
        const ctx = this.audioCtx;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        gainNode.gain.value = this.musicVolume * 0.3;
        
        switch(type) {
            case 'flap':
                oscillator.frequency.setValueAtTime(400, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.1);
                break;
            case 'score':
                oscillator.frequency.setValueAtTime(523, ctx.currentTime);
                oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.2);
                break;
            case 'powerup':
                oscillator.frequency.setValueAtTime(300, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.2);
                break;
            case 'hit':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.3);
                break;
            case 'death':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(400, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.5);
                break;
            case 'upgrade':
                oscillator.frequency.setValueAtTime(400, ctx.currentTime);
                oscillator.frequency.setValueAtTime(500, ctx.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
                oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.3);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.4);
                break;
            case 'oneup':
                // Special 1-UP sound
                oscillator.frequency.setValueAtTime(523, ctx.currentTime);
                oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
                oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
                oscillator.frequency.setValueAtTime(1047, ctx.currentTime + 0.45);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.6);
                break;
        }
    }
    
    toggleMusic() {
        this.audioEnabled = !this.audioEnabled;
        const btn = document.getElementById('music-toggle');
        if (btn) {
            btn.textContent = this.audioEnabled ? '🔊' : '🔇';
        }
    }
    
    setVolume(value) {
        this.musicVolume = value / 100;
        localStorage.setItem('flappyRogue_volume', this.musicVolume);
    }
    
    init() {
        this.bindEvents();
        this.updateStatsDisplay();
        
        // Set initial volume slider
        const slider = document.getElementById('volume-slider');
        if (slider) {
            slider.value = this.musicVolume * 100;
        }
        
        this.gameLoop();
    }
    
    bindEvents() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleInput();
            }
        });
        
        // Touch/Click controls with button detection
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleCanvasClick(e.touches[0]);
        });
        
        // Menu buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.showMenu());
        
        // Guide buttons
        document.getElementById('guide-btn')?.addEventListener('click', () => {
            document.getElementById('guide-screen').classList.remove('hidden');
        });
        document.getElementById('close-guide-btn')?.addEventListener('click', () => {
            document.getElementById('guide-screen').classList.add('hidden');
        });
        
        // Mode selector buttons
        document.getElementById('mode-pc-btn')?.addEventListener('click', () => this.setDisplayMode('pc'));
        document.getElementById('mode-mobile-btn')?.addEventListener('click', () => this.setDisplayMode('mobile'));
        document.getElementById('mode-fullscreen-btn')?.addEventListener('click', () => this.setDisplayMode('fullscreen'));
        
        // In-game fullscreen toggle
        document.getElementById('fullscreen-toggle')?.addEventListener('click', () => {
            if (this.displayMode === 'fullscreen') {
                this.setDisplayMode('pc');
            } else {
                this.setDisplayMode('fullscreen');
            }
        });
        
        // Audio controls
        document.getElementById('music-toggle')?.addEventListener('click', () => this.toggleMusic());
        document.getElementById('volume-slider')?.addEventListener('input', (e) => this.setVolume(e.target.value));
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // Check if clicking on control buttons
        if (this.controlButtons) {
            const sound = this.controlButtons.sound;
            const fs = this.controlButtons.fullscreen;
            
            if (x >= sound.x && x <= sound.x + sound.w && y >= sound.y && y <= sound.y + sound.h) {
                this.toggleMusic();
                return;
            }
            if (x >= fs.x && x <= fs.x + fs.w && y >= fs.y && y <= fs.y + fs.h) {
                this.toggleFullscreen();
                return;
            }
        }
        
        // Otherwise, handle as game input
        this.handleInput();
    }
    
    toggleFullscreen() {
        const container = document.getElementById('game-container');
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen();
        }
    }
    
    handleInput() {
        if (this.state === 'playing') {
            this.flap();
        }
    }
    
    flap() {
        const jumpForce = this.upgrades.floaty ? this.bird.jumpForce * 0.8 : this.bird.jumpForce;
        this.bird.velocity = jumpForce;
        const world = this.getCurrentWorld();
        this.createParticles(this.bird.x, this.bird.y + this.bird.height / 2, 5, world.particleColor);
        this.playSound('flap');
    }
    
    getCurrentWorld() {
        // Find the highest threshold world that we've passed
        let world = this.worlds[0];
        for (let i = this.worlds.length - 1; i >= 0; i--) {
            if (this.pipesPassed >= this.worlds[i].threshold) {
                world = this.worlds[i];
                break;
            }
        }
        return world;
    }
    
    checkWorldTransition() {
        const newWorld = this.getCurrentWorld();
        const newWorldIndex = this.worlds.indexOf(newWorld);
        if (newWorldIndex > this.currentWorld) {
            this.currentWorld = newWorldIndex;
            // Create transition effect
            this.screenShake = 15;
            this.worldTransitionTimer = 180; // 3 seconds display
            this.worldTransitionText = newWorld.subtitle;
            this.createParticles(this.canvas.width / 2, this.canvas.height / 2, 40, newWorld.particleColor);
            this.playSound('upgrade');
            return true;
        }
        return false;
    }
    
    startGame() {
        const settings = this.getSettings();
        
        this.state = 'playing';
        this.score = 0;
        this.pipesPassed = 0;
        this.powerupsCollected = 0;
        
        // Setup canvas for current platform
        this.setupCanvas();
        
        // Reset bird
        this.bird.x = this.isMobile ? 60 : 120;
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.bird.width = 40;
        this.bird.height = 30;
        
        // Reset upgrades
        this.upgrades = {
            extraLife: 0,
            shield: false,
            slowTime: false,
            magnetism: false,
            doubleScore: false,
            smallerBird: false,
            floaty: false,
            widerGaps: false
        };
        
        this.health = 1;
        this.maxHealth = 1;
        this.shieldActive = false;
        this.slowTimeActive = false;
        this.invulnerableTimer = 0;
        this.gameSpeed = settings.baseSpeed;
        this.screenShake = 0;
        this.combo = 0;
        this.currentWorld = 0;
        this.baseGapSize = settings.maxGap;
        this.countdownTimer = 0;
        this.hasOneUp = false;
        this.coins = parseInt(localStorage.getItem('flappyRogue_coins')) || 0;
        
        // Clear objects
        this.pipes = [];
        this.powerups = [];
        this.particles = [];
        
        // Update stats
        this.stats.totalRuns++;
        localStorage.setItem('flappyRogue_totalRuns', this.stats.totalRuns);
        
        this.hideAllScreens();
        document.getElementById('game-screen').classList.remove('hidden');
        this.updateHealthDisplay();
    }
    
    showMenu() {
        this.state = 'menu';
        this.hideAllScreens();
        document.getElementById('menu-screen').classList.remove('hidden');
        this.updateStatsDisplay();
    }
    
    showGameOver() {
        this.state = 'gameover';
        
        // Update high score
        if (this.score > this.stats.highScore) {
            this.stats.highScore = this.score;
            localStorage.setItem('flappyRogue_highScore', this.stats.highScore);
        }
        
        this.hideAllScreens();
        document.getElementById('gameover-screen').classList.remove('hidden');
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('pipes-passed').textContent = this.pipesPassed;
        document.getElementById('powerups-collected').textContent = this.powerupsCollected;
    }
    
    hideAllScreens() {
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
    }
    
    updateStatsDisplay() {
        document.getElementById('high-score').textContent = this.stats.highScore;
        document.getElementById('total-runs').textContent = this.stats.totalRuns;
    }
    
    updateHealthDisplay() {
        // Health is now drawn directly on canvas in render()
    }
    
    update() {
        // Handle countdown state
        if (this.state === 'countdown') {
            this.countdownTimer--;
            if (this.countdownTimer <= 0) {
                this.state = 'playing';
            }
            return;
        }
        
        // Game continues during upgrade selection!
        if (this.state !== 'playing') return;
        
        let timeScale = 1;
        if (this.slowTimeActive) timeScale = 0.5;
        
        // Update slow time
        if (this.slowTimeActive) {
            this.slowTimeTimer--;
            if (this.slowTimeTimer <= 0) {
                this.slowTimeActive = false;
            }
        }

        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer--;
        }
        
        // Update milestone timer
        if (this.milestoneTimer > 0) {
            this.milestoneTimer--;
        }
        
        // Update world transition timer
        if (this.worldTransitionTimer > 0) {
            this.worldTransitionTimer--;
        }
        
        // Bird physics
        const gravity = this.upgrades.floaty ? this.bird.gravity * 0.7 : this.bird.gravity;
        this.bird.velocity += gravity * timeScale;
        this.bird.y += this.bird.velocity * timeScale;
        
        // Bird rotation based on velocity
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 3, -30), 90);
        
        // Boundary check
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
        
        if (this.bird.y + this.bird.height > this.canvas.height) {
            this.takeDamage();
        }
        
        // Spawn pipes based on distance, not time
        const settings = this.getSettings();
        const lastPipe = this.pipes[this.pipes.length - 1];
        const pipeDistance = settings.pipeDistance + Math.max(0, 50 - this.pipesPassed * 0.5); // Start with extra space
        
        if (!lastPipe || lastPipe.x < this.canvas.width - pipeDistance) {
            this.spawnPipe();
        }
        
        // Update pipes
        this.pipes.forEach((pipe, index) => {
            pipe.x -= this.gameSpeed * timeScale;
            
            // Score when passing pipe
            if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
                pipe.passed = true;
                this.pipesPassed++;
                
                // Combo system
                const now = Date.now();
                if (now - this.lastScoreTime < 2000) {
                    this.combo++;
                } else {
                    this.combo = 1;
                }
                this.lastScoreTime = now;
                
                const basePoints = this.upgrades.doubleScore ? 2 : 1;
                const comboBonus = Math.floor(this.combo / 3);
                const points = basePoints + comboBonus;
                const oldScore = this.score;
                this.score += points;
                this.playSound('score');
                
                // Check for 100 score milestone - give extra life!
                const oldMilestone = Math.floor(oldScore / 100);
                const newMilestone = Math.floor(this.score / 100);
                if (newMilestone > oldMilestone) {
                    this.maxHealth++;
                    this.health = this.maxHealth;
                    this.milestoneTimer = 180; // 3 seconds shiny effect
                    this.playSound('oneup');
                    this.createParticles(this.bird.x, this.bird.y, 30, '#ffd700');
                    this.createParticles(this.bird.x, this.bird.y, 20, '#ff69b4');
                }
                
                // Visual feedback
                this.createParticles(this.bird.x + 30, this.bird.y, 3, '#ffd700');
                
                // Check world transition
                this.checkWorldTransition();
                
                // Increase difficulty gradually based on world
                this.adjustDifficulty();
            }
            
            // Collision detection
            if (this.checkPipeCollision(pipe)) {
                this.takeDamage();
            }
        });
        
        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => pipe.x + pipe.width > 0);
        
        // Update powerups
        this.powerups.forEach((powerup, index) => {
            powerup.x -= this.gameSpeed * timeScale;
            
            // Magnetism effect - platform aware
            const settings = this.getSettings();
            if (this.upgrades.magnetism) {
                const dx = this.bird.x - powerup.x;
                const dy = this.bird.y - powerup.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const magnetRadius = settings.magnetRadius;
                
                if (dist < magnetRadius) {
                    // Stronger pull when closer
                    const strength = 0.12 * (1 - dist / magnetRadius) + 0.04;
                    powerup.x += dx * strength;
                    powerup.y += dy * strength;
                    
                    // Visual feedback - make powerup glow
                    powerup.magnetized = true;
                }
            }
            
            // Collect powerup
            if (this.checkPowerupCollision(powerup)) {
                this.collectPowerup(powerup);
                this.powerups.splice(index, 1);
            }
        });
        
        // Remove off-screen powerups
        this.powerups = this.powerups.filter(p => p.x + p.size > 0);
        
        // Update particles
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    adjustDifficulty() {
        const settings = this.getSettings();
        const progress = this.pipesPassed;
        const worldIndex = this.currentWorld;
        
        // Speed increases faster with each world
        // Base acceleration + world bonus
        const worldSpeedBonus = worldIndex * 0.3; // +0.3 speed per world
        const speedProgress = Math.min(progress / 40, 1); // Max faster at 40 pipes
        this.gameSpeed = settings.baseSpeed + worldSpeedBonus + (settings.maxSpeed - settings.baseSpeed) * speedProgress;
        
        // Cap at reasonable max
        this.gameSpeed = Math.min(this.gameSpeed, settings.maxSpeed + 2);
        
        // Gap size decreases with world progression
        const worldGapPenalty = worldIndex * 8; // -8px per world
        const gapProgress = Math.min(progress / 35, 1); // Max faster at 35 pipes
        this.baseGapSize = settings.maxGap - worldGapPenalty - (settings.maxGap - settings.minGap) * gapProgress;
        
        // Never go below minimum
        this.baseGapSize = Math.max(this.baseGapSize, settings.minGap - 10);
    }
    
    spawnPipe() {
        const settings = this.getSettings();
        
        // Calculate gap size based on progression
        let gapSize = this.baseGapSize || settings.maxGap;
        if (this.upgrades.widerGaps) gapSize += 40;
        
        // Small random variation (±10px)
        gapSize += (Math.random() - 0.5) * 20;
        gapSize = Math.max(gapSize, settings.minGap);
        
        // Safe zones for gap position
        const minY = 80;
        const maxY = this.canvas.height - gapSize - 80;
        
        // Smart gap positioning - check previous pipe to avoid impossible jumps
        let gapY;
        const lastPipe = this.pipes[this.pipes.length - 1];
        
        if (this.pipesPassed < 5) {
            // Very early game: centered gaps
            gapY = (this.canvas.height - gapSize) / 2;
            gapY += (Math.random() - 0.5) * 60;
        } else if (lastPipe) {
            // Limit vertical change from last pipe for fairness
            const lastGapCenter = lastPipe.gapY + lastPipe.gapSize / 2;
            const maxVerticalChange = 150 + Math.min(this.pipesPassed * 2, 100);
            const newGapCenter = lastGapCenter + (Math.random() - 0.5) * maxVerticalChange;
            gapY = newGapCenter - gapSize / 2;
        } else {
            gapY = Math.random() * (maxY - minY) + minY;
        }
        
        // Clamp to valid range
        gapY = Math.max(minY, Math.min(gapY, maxY));
        
        this.pipes.push({
            x: this.canvas.width,
            gapY: gapY,
            gapSize: gapSize,
            width: 60,
            passed: false
        });

        // 35% chance to spawn powerup in the gap
        if (Math.random() < 0.35) {
            const powerupX = this.canvas.width + 30;
            const powerupY = gapY + gapSize / 2;
            this.spawnPowerup(powerupX, powerupY);
        }
    }
    
    spawnPowerup(x, y) {
        // Weighted random selection
        const totalWeight = this.powerupTypes.reduce((sum, p) => sum + p.weight, 0);
        let roll = Math.random() * totalWeight;
        let type = this.powerupTypes[0];
        for (const p of this.powerupTypes) {
            roll -= p.weight;
            if (roll <= 0) {
                type = p;
                break;
            }
        }
        
        this.powerups.push({
            x: x,
            y: y,
            size: 30,
            type: type.type,
            icon: type.icon,
            color: type.color,
            rotation: 0
        });
    }
    
    checkPipeCollision(pipe) {
        const birdBox = {
            x: this.bird.x - this.bird.width / 2 + 5,
            y: this.bird.y - this.bird.height / 2 + 5,
            width: this.bird.width - 10,
            height: this.bird.height - 10
        };
        
        // Top pipe
        if (birdBox.x < pipe.x + pipe.width &&
            birdBox.x + birdBox.width > pipe.x &&
            birdBox.y < pipe.gapY) {
            return true;
        }
        
        // Bottom pipe
        if (birdBox.x < pipe.x + pipe.width &&
            birdBox.x + birdBox.width > pipe.x &&
            birdBox.y + birdBox.height > pipe.gapY + pipe.gapSize) {
            return true;
        }
        
        return false;
    }
    
    checkPowerupCollision(powerup) {
        // AABB collision for more reliable pickup
        const birdLeft = this.bird.x - this.bird.width / 2;
        const birdRight = this.bird.x + this.bird.width / 2;
        const birdTop = this.bird.y - this.bird.height / 2;
        const birdBottom = this.bird.y + this.bird.height / 2;
        
        const powerupLeft = powerup.x - powerup.size * 0.7;  // 40% larger hitbox
        const powerupRight = powerup.x + powerup.size * 0.7;
        const powerupTop = powerup.y - powerup.size * 0.7;
        const powerupBottom = powerup.y + powerup.size * 0.7;
        
        return birdRight > powerupLeft && birdLeft < powerupRight &&
               birdBottom > powerupTop && birdTop < powerupBottom;
    }
    
    collectPowerup(powerup) {
        this.powerupsCollected++;
        this.createParticles(powerup.x, powerup.y, 12, powerup.color);
        this.screenShake = 3; // Small feedback
        this.playSound('powerup');
        
        const scoreMultiplier = this.upgrades.doubleScore ? 2 : 1;
        
        switch (powerup.type) {
            case 'coin':
                this.score += 5 * scoreMultiplier;
                break;
            case 'heart':
                if (this.health < this.maxHealth) {
                    this.health++;
                    this.updateHealthDisplay();
                } else {
                    // Full health = bonus points
                    this.score += 3 * scoreMultiplier;
                }
                break;
            case 'star':
                this.score += 15 * scoreMultiplier;
                this.invulnerableTimer = 120; // 2 seconds invincibility
                break;
            case 'shield':
                this.shieldActive = true;
                this.createParticles(this.bird.x, this.bird.y, 10, '#3498db');
                break;
            case 'clock':
                this.slowTimeActive = true;
                this.slowTimeTimer = 240; // 4 seconds (reduced from 6)
                break;
        }
    }
    
    takeDamage() {
        if (this.invulnerableTimer > 0) return;

        if (this.shieldActive) {
            this.shieldActive = false;
            this.updateHealthDisplay();
            this.createParticles(this.bird.x, this.bird.y, 15, '#3498db');
            this.invulnerableTimer = 90; // 1.5 seconds i-frames
            this.screenShake = 10;
            this.playSound('hit');
            return;
        }
        
        this.health--;
        this.updateHealthDisplay();
        this.createParticles(this.bird.x, this.bird.y, 20, '#e74c3c');
        this.screenShake = 15;
        this.combo = 0;
        this.playSound('hit');
        
        if (this.health <= 0) {
            // Check for 1-UP
            if (this.hasOneUp) {
                this.hasOneUp = false;
                this.health = 1;
                this.bird.y = this.canvas.height / 2;
                this.bird.velocity = 0;
                this.pipes = [];
                this.invulnerableTimer = 120;
                this.screenShake = 25;
                this.createParticles(this.bird.x, this.bird.y, 30, '#ffd700');
                this.updateHealthDisplay();
                this.playSound('oneup');
            } else {
                this.playSound('death');
                this.showGameOver();
            }
        } else {
            // Reset position but continue
            this.bird.y = this.canvas.height / 2;
            this.bird.velocity = 0;
            this.pipes = [];
            this.invulnerableTimer = 60;
        }
    }
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 6 + 2,
                color: color,
                life: 30,
                maxLife: 30,
                alpha: 1
            });
        }
    }
    
    render() {
        const world = this.getCurrentWorld();
        
        // Apply screen shake
        this.ctx.save();
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(shakeX, shakeY);
            this.screenShake *= 0.9;
            if (this.screenShake < 0.5) this.screenShake = 0;
        }
        
        // Clear canvas with world colors
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        if (this.slowTimeActive) {
            gradient.addColorStop(0, '#1a1a4e');
            gradient.addColorStop(1, '#2d2d6e');
        } else {
            gradient.addColorStop(0, world.bgTop);
            gradient.addColorStop(1, world.bgBottom);
        }
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw environment effects based on world
        this.drawEnvironmentEffects(world);
        
        // Draw clouds (decorative)
        this.drawClouds(world);
        
        // Draw pipes
        this.pipes.forEach(pipe => this.drawPipe(pipe));
        
        // Draw powerups
        this.powerups.forEach(powerup => this.drawPowerup(powerup));
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        
        // Draw bird
        this.drawBird();
        
        // Draw ground
        this.drawGround(world);
        
        // Draw score (top left)
        if (this.state === 'playing' || this.state === 'countdown') {
            // Score background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            this.ctx.beginPath();
            this.ctx.roundRect(15, 12, 60, 40, 20);
            this.ctx.fill();
            
            // Score text
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.score.toString(), 45, 32);
            
            // Health (top left, below score)
            this.ctx.font = '18px Arial';
            this.ctx.textAlign = 'left';
            let healthX = 20;
            for (let i = 0; i < this.maxHealth; i++) {
                this.ctx.globalAlpha = i < this.health ? 1 : 0.3;
                this.ctx.fillText('❤️', healthX, 70);
                healthX += 22;
            }
            if (this.shieldActive) {
                this.ctx.globalAlpha = 1;
                this.ctx.fillText('🛡️', healthX, 70);
            }
            this.ctx.globalAlpha = 1;
        }
        
        // Draw world name indicator (bottom left)
        if (this.state === 'playing' || this.state === 'countdown') {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'alphabetic';
            this.ctx.fillText(world.name, 15, this.canvas.height - 55);
        }
        
        // Draw world transition announcement
        if (this.worldTransitionTimer > 0) {
            const alpha = Math.min(1, this.worldTransitionTimer / 60);
            const slideIn = Math.min(1, (180 - this.worldTransitionTimer) / 30);
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            
            // Background bar
            const barY = this.canvas.height - 120;
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, barY, this.canvas.width * slideIn, 50);
            
            // Text
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(this.worldTransitionText, 20, barY + 32);
            
            // Decorative line
            this.ctx.strokeStyle = world.particleColor;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(0, barY);
            this.ctx.lineTo(this.canvas.width * slideIn, barY);
            this.ctx.stroke();
            
            this.ctx.restore();
        }
        
        // Draw combo indicator
        if (this.combo > 1 && this.state === 'playing') {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`Combo x${this.combo}`, this.canvas.width - 20, 60);
        }
        
        // Draw slow motion indicator (small, bottom right corner)
        if (this.slowTimeActive && (this.state === 'playing' || this.state === 'countdown')) {
            const barWidth = 100;
            const barHeight = 6;
            const barX = this.canvas.width - barWidth - 15;
            const barY = this.canvas.height - 70;
            const progress = this.slowTimeTimer / 240;
            
            // Small icon and bar
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.beginPath();
            this.ctx.roundRect(barX - 25, barY - 8, barWidth + 30, barHeight + 16, 8);
            this.ctx.fill();
            
            // Icon
            this.ctx.font = '14px Arial';
            this.ctx.fillText('⏰', barX - 18, barY + 5);
            
            // Progress bar
            this.ctx.fillStyle = '#9b59b6';
            this.ctx.beginPath();
            this.ctx.roundRect(barX, barY, barWidth * progress, barHeight, 3);
            this.ctx.fill();
        }
        
        // Draw invincibility indicator
        if (this.invulnerableTimer > 60 && this.state === 'playing') {
            const pulse = Math.sin(Date.now() * 0.015) * 0.2 + 0.3;
            this.ctx.strokeStyle = `rgba(255, 215, 0, ${pulse + 0.5})`;
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Draw milestone celebration (100 score = +1 life)
        if (this.milestoneTimer > 0) {
            const progress = this.milestoneTimer / 180;
            const pulse = Math.sin(Date.now() * 0.02) * 0.5 + 0.5;
            
            // Rainbow shiny border
            const hue = (Date.now() * 0.5) % 360;
            this.ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${progress})`;
            this.ctx.lineWidth = 8 + pulse * 4;
            this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Big announcement text
            this.ctx.save();
            this.ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${progress})`;
            this.ctx.strokeStyle = `rgba(0, 0, 0, ${progress})`;
            this.ctx.lineWidth = 4;
            this.ctx.font = `bold ${40 + pulse * 10}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            const text = '🎉 +1 VIE! 🎉';
            const y = this.canvas.height / 2 - 50 + (1 - progress) * 30;
            this.ctx.strokeText(text, this.canvas.width / 2, y);
            this.ctx.fillText(text, this.canvas.width / 2, y);
            
            // Show milestone reached
            const milestone = Math.floor(this.score / 100) * 100;
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillStyle = `rgba(255, 255, 255, ${progress})`;
            this.ctx.fillText(`${milestone} POINTS!`, this.canvas.width / 2, y + 50);
            this.ctx.restore();
        }
        
        // Draw active upgrades icons
        if (this.state === 'playing' || this.state === 'countdown') {
            let iconX = 20;
            const iconY = 55;
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'left';
            
            if (this.upgrades.magnetism) { this.ctx.fillText('🧲', iconX, iconY); iconX += 28; }
            if (this.upgrades.doubleScore) { this.ctx.fillText('✨', iconX, iconY); iconX += 28; }
            if (this.upgrades.slowTime) { this.ctx.fillText('⏱️', iconX, iconY); iconX += 28; }
            if (this.upgrades.floaty) { this.ctx.fillText('🪶', iconX, iconY); iconX += 28; }
            if (this.upgrades.widerGaps) { this.ctx.fillText('↕️', iconX, iconY); iconX += 28; }
            if (this.upgrades.smallerBird) { this.ctx.fillText('🔬', iconX, iconY); iconX += 28; }
            if (this.hasOneUp) { this.ctx.fillText('👼', iconX, iconY); iconX += 28; }
        }
        
        // Draw countdown
        if (this.state === 'countdown') {
            // Darken background slightly
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Countdown number
            const seconds = Math.ceil(this.countdownTimer / 60);
            const scale = 1 + (this.countdownTimer % 60) / 60 * 0.3;
            
            this.ctx.save();
            this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.scale(scale, scale);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 80px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = '#000';
            this.ctx.shadowBlur = 20;
            this.ctx.fillText(seconds.toString(), 0, 0);
            
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText('GET READY!', 0, 60);
            
            this.ctx.restore();
        }
        
        // Draw audio/fullscreen controls on canvas
        this.drawControls();
        
        this.ctx.restore();
    }
    
    drawControls() {
        const x = this.canvas.width - 80;
        const y = 15;
        
        // Background box
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, 70, 35, 8);
        this.ctx.fill();
        
        // Sound icon
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(this.audioEnabled ? '🔊' : '🔇', x + 20, y + 18);
        
        // Fullscreen icon
        this.ctx.fillText('⛶', x + 50, y + 18);
        
        // Store button positions for click detection
        this.controlButtons = {
            sound: { x: x, y: y, w: 35, h: 35 },
            fullscreen: { x: x + 35, y: y, w: 35, h: 35 }
        };
    }
    
    drawEnvironmentEffects(world) {
        const time = Date.now() * 0.001;
        
        // Volcanic Hell - lava bubbles
        if (world.name === 'Volcanic Hell') {
            for (let i = 0; i < 8; i++) {
                const x = (i * 150 + time * 20) % (this.canvas.width + 50);
                const y = this.canvas.height - 40 + Math.sin(time + i) * 10;
                this.ctx.fillStyle = `rgba(255, ${100 + Math.sin(time * 2 + i) * 50}, 0, 0.8)`;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 8 + Math.sin(time * 3 + i) * 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        // Frozen Peaks - snowflakes
        if (world.name === 'Frozen Peaks') {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 20; i++) {
                const x = (i * 80 + time * 30) % this.canvas.width;
                const y = (i * 50 + time * 40) % this.canvas.height;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        // Neon City - grid lines
        if (world.name === 'Neon City') {
            this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < 10; i++) {
                const y = (i * 80 + time * 20) % this.canvas.height;
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
        }
        
        // Cosmic Void - stars
        if (world.name === 'Cosmic Void') {
            for (let i = 0; i < 30; i++) {
                const x = (i * 73) % this.canvas.width;
                const y = (i * 47) % this.canvas.height;
                const twinkle = Math.sin(time * 3 + i) * 0.5 + 0.5;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    drawClouds(world) {
        // No clouds in certain worlds
        if (world.name === 'Volcanic Hell' || world.name === 'Cosmic Void' || world.name === 'Neon City') {
            return;
        }
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        const time = Date.now() * 0.0001;
        
        for (let i = 0; i < 5; i++) {
            const x = ((time * 20 + i * 100) % (this.canvas.width + 100)) - 50;
            const y = 50 + i * 80;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 25, 0, Math.PI * 2);
            this.ctx.arc(x + 25, y - 10, 30, 0, Math.PI * 2);
            this.ctx.arc(x + 50, y, 25, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawPipe(pipe) {
        const world = this.getCurrentWorld();
        const gradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
        gradient.addColorStop(0, world.pipeColor1);
        gradient.addColorStop(0.5, world.pipeColor2);
        gradient.addColorStop(1, world.pipeColor3);
        
        this.ctx.fillStyle = gradient;
        
        const obstacleType = world.obstacleType || 'pipes';
        
        switch(obstacleType) {
            case 'icicles':
                // Icicles - pointy at ends
                this.ctx.beginPath();
                this.ctx.moveTo(pipe.x, 0);
                this.ctx.lineTo(pipe.x + pipe.width, 0);
                this.ctx.lineTo(pipe.x + pipe.width, pipe.gapY - 20);
                this.ctx.lineTo(pipe.x + pipe.width/2, pipe.gapY);
                this.ctx.lineTo(pipe.x, pipe.gapY - 20);
                this.ctx.closePath();
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.moveTo(pipe.x, this.canvas.height);
                this.ctx.lineTo(pipe.x + pipe.width, this.canvas.height);
                this.ctx.lineTo(pipe.x + pipe.width, pipe.gapY + pipe.gapSize + 20);
                this.ctx.lineTo(pipe.x + pipe.width/2, pipe.gapY + pipe.gapSize);
                this.ctx.lineTo(pipe.x, pipe.gapY + pipe.gapSize + 20);
                this.ctx.closePath();
                this.ctx.fill();
                break;
                
            case 'lava':
                // Lava pillars with glow
                this.ctx.shadowColor = '#ff4500';
                this.ctx.shadowBlur = 20;
                this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
                this.ctx.fillRect(pipe.x, pipe.gapY + pipe.gapSize, pipe.width, this.canvas.height);
                this.ctx.shadowBlur = 0;
                
                // Dripping effect
                const time = Date.now() * 0.003;
                for (let i = 0; i < 3; i++) {
                    const dripY = (time * 50 + i * 30) % 60;
                    this.ctx.fillStyle = '#ff6600';
                    this.ctx.beginPath();
                    this.ctx.arc(pipe.x + 15 + i * 15, pipe.gapY + dripY, 5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                break;
                
            case 'lasers':
                // Neon laser beams
                this.ctx.shadowColor = world.pipeColor1;
                this.ctx.shadowBlur = 15;
                this.ctx.fillRect(pipe.x + 10, 0, pipe.width - 20, pipe.gapY);
                this.ctx.fillRect(pipe.x + 10, pipe.gapY + pipe.gapSize, pipe.width - 20, this.canvas.height);
                
                // Emitter boxes
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(pipe.x, pipe.gapY - 25, pipe.width, 25);
                this.ctx.fillRect(pipe.x, pipe.gapY + pipe.gapSize, pipe.width, 25);
                this.ctx.shadowBlur = 0;
                break;
                
            case 'asteroids':
                // Floating asteroid chunks
                this.ctx.shadowColor = world.pipeColor1;
                this.ctx.shadowBlur = 10;
                
                // Top cluster
                for (let i = 0; i < 4; i++) {
                    const ax = pipe.x + (i % 2) * 30 + 5;
                    const ay = pipe.gapY - 40 - i * 50;
                    const size = 25 + (i % 3) * 10;
                    this.ctx.beginPath();
                    this.ctx.arc(ax + size/2, ay, size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                // Bottom cluster
                for (let i = 0; i < 4; i++) {
                    const ax = pipe.x + (i % 2) * 30 + 5;
                    const ay = pipe.gapY + pipe.gapSize + 40 + i * 50;
                    const size = 25 + (i % 3) * 10;
                    this.ctx.beginPath();
                    this.ctx.arc(ax + size/2, ay, size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                this.ctx.shadowBlur = 0;
                break;
                
            default: // pipes, pillars
                // Standard pipes
                this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
                this.ctx.fillRect(pipe.x - 5, pipe.gapY - 30, pipe.width + 10, 30);
                this.ctx.fillRect(pipe.x, pipe.gapY + pipe.gapSize, pipe.width, this.canvas.height - pipe.gapY - pipe.gapSize);
                this.ctx.fillRect(pipe.x - 5, pipe.gapY + pipe.gapSize, pipe.width + 10, 30);
                
                // Highlights
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.fillRect(pipe.x + 5, 0, 8, pipe.gapY - 30);
                this.ctx.fillRect(pipe.x + 5, pipe.gapY + pipe.gapSize + 30, 8, this.canvas.height);
        }
    }
    
    drawPowerup(powerup) {
        powerup.rotation += 0.05;
        
        this.ctx.save();
        this.ctx.translate(powerup.x, powerup.y);
        
        // Magnetized effect - pulsing and trailing
        if (powerup.magnetized) {
            const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 1;
            this.ctx.scale(pulse, pulse);
            
            // Draw magnet trail
            this.ctx.shadowColor = '#ff00ff';
            this.ctx.shadowBlur = 25;
            powerup.magnetized = false; // Reset for next frame
        } else {
            this.ctx.shadowColor = powerup.color;
            this.ctx.shadowBlur = 15;
        }
        
        this.ctx.rotate(Math.sin(powerup.rotation) * 0.2);
        
        // Draw icon
        this.ctx.font = `${powerup.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(powerup.icon, 0, 0);
        
        this.ctx.restore();
    }
    
    drawBird() {
        if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) return;
        
        const world = this.getCurrentWorld();

        this.ctx.save();
        this.ctx.translate(this.bird.x, this.bird.y);
        this.ctx.rotate(this.bird.rotation * Math.PI / 180);
        
        // Shield effect
        if (this.shieldActive) {
            this.ctx.strokeStyle = 'rgba(52, 152, 219, 0.6)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.bird.width / 2 + 10, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Bird body with world colors
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.bird.width / 2);
        gradient.addColorStop(0, world.birdColor1);
        gradient.addColorStop(1, world.birdColor2);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.bird.width / 2, this.bird.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wing
        this.ctx.fillStyle = '#d35400';
        const wingY = Math.sin(Date.now() * 0.02) * 3;
        this.ctx.beginPath();
        this.ctx.ellipse(-5, wingY, 12, 8, -0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(10, -5, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(12, -5, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Beak
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.moveTo(15, 0);
        this.ctx.lineTo(25, 3);
        this.ctx.lineTo(15, 6);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawGround(world) {
        const gradient = this.ctx.createLinearGradient(0, this.canvas.height - 20, 0, this.canvas.height);
        gradient.addColorStop(0, world.groundColor);
        gradient.addColorStop(1, this.darkenColor(world.groundColor, 30));
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);
        
        // Grass/top layer
        this.ctx.fillStyle = world.grassColor;
        this.ctx.fillRect(0, this.canvas.height - 25, this.canvas.width, 8);
    }
    
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
