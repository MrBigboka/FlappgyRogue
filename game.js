// ============================================
// FLAPPY ROGUE - A Rogue-like Flappy Bird Game
// Built with Claude Opus
// ============================================

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 400;
        this.canvas.height = 600;
        
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
        
        // Timing
        this.pipeSpawnTimer = 0;
        this.pipeSpawnInterval = 90;
        this.powerupSpawnTimer = 0;
        this.gameSpeed = 1.5;
        
        // Available upgrades pool
        this.upgradePool = [
            { id: 'extraLife', name: 'Extra Heart', icon: '❤️', description: '+1 Max Health', rarity: 'common' },
            { id: 'shield', name: 'Shield', icon: '🛡️', description: 'Block one hit', rarity: 'rare' },
            { id: 'slowTime', name: 'Slow Motion', icon: '⏱️', description: 'Slow down time briefly', rarity: 'epic' },
            { id: 'magnetism', name: 'Magnet', icon: '🧲', description: 'Attract power-ups', rarity: 'rare' },
            { id: 'doubleScore', name: 'Double Score', icon: '✨', description: '2x points per pipe', rarity: 'epic' },
            { id: 'smallerBird', name: 'Shrink', icon: '🔬', description: 'Smaller hitbox', rarity: 'legendary' },
            { id: 'floaty', name: 'Feather Fall', icon: '🪶', description: 'Reduced gravity', rarity: 'common' },
            { id: 'widerGaps', name: 'Wide Gaps', icon: '↕️', description: 'Larger pipe gaps', rarity: 'rare' }
        ];
        
        // Power-up types that spawn in game
        this.powerupTypes = [
            { type: 'coin', icon: '🪙', color: '#ffd700' },
            { type: 'heart', icon: '❤️', color: '#e74c3c' },
            { type: 'star', icon: '⭐', color: '#f39c12' },
            { type: 'clock', icon: '⏰', color: '#3498db' }
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateStatsDisplay();
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
        
        // Touch/Click controls
        this.canvas.addEventListener('click', () => this.handleInput());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        });
        
        // Menu buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.showMenu());
    }
    
    handleInput() {
        if (this.state === 'playing') {
            this.flap();
        }
    }
    
    flap() {
        const jumpForce = this.upgrades.floaty ? this.bird.jumpForce * 0.8 : this.bird.jumpForce;
        this.bird.velocity = jumpForce;
        this.createParticles(this.bird.x, this.bird.y + this.bird.height / 2, 5, '#fff');
    }
    
    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.pipesPassed = 0;
        this.powerupsCollected = 0;
        
        // Reset bird
        this.bird.y = 300;
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
        this.gameSpeed = 3;
        
        // Clear objects
        this.pipes = [];
        this.powerups = [];
        this.particles = [];
        
        this.pipeSpawnTimer = 0;
        this.powerupSpawnTimer = 0;
        
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
    
    showUpgradeScreen() {
        this.state = 'upgrade';
        this.hideAllScreens();
        document.getElementById('upgrade-screen').classList.remove('hidden');
        this.generateUpgradeOptions();
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
        document.getElementById('upgrade-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
    }
    
    generateUpgradeOptions() {
        const container = document.getElementById('upgrade-options');
        container.innerHTML = '';
        
        // Pick 3 random upgrades
        const shuffled = [...this.upgradePool].sort(() => Math.random() - 0.5);
        const options = shuffled.slice(0, 3);
        
        options.forEach(upgrade => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.innerHTML = `
                <h3>
                    ${upgrade.icon} ${upgrade.name}
                    <span class="upgrade-rarity rarity-${upgrade.rarity}">${upgrade.rarity}</span>
                </h3>
                <p>${upgrade.description}</p>
            `;
            card.addEventListener('click', () => this.selectUpgrade(upgrade));
            container.appendChild(card);
        });
    }
    
    selectUpgrade(upgrade) {
        switch (upgrade.id) {
            case 'extraLife':
                this.maxHealth++;
                this.health = this.maxHealth;
                break;
            case 'shield':
                this.shieldActive = true;
                break;
            case 'slowTime':
                this.upgrades.slowTime = true;
                break;
            case 'magnetism':
                this.upgrades.magnetism = true;
                break;
            case 'doubleScore':
                this.upgrades.doubleScore = true;
                break;
            case 'smallerBird':
                this.bird.width = 30;
                this.bird.height = 22;
                this.upgrades.smallerBird = true;
                break;
            case 'floaty':
                this.upgrades.floaty = true;
                break;
            case 'widerGaps':
                this.upgrades.widerGaps = true;
                break;
        }
        
        this.updateHealthDisplay();
        this.state = 'playing';
        this.hideAllScreens();
        document.getElementById('game-screen').classList.remove('hidden');
    }
    
    updateStatsDisplay() {
        document.getElementById('high-score').textContent = this.stats.highScore;
        document.getElementById('total-runs').textContent = this.stats.totalRuns;
    }
    
    updateHealthDisplay() {
        const container = document.getElementById('health-display');
        container.innerHTML = '';
        
        for (let i = 0; i < this.maxHealth; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart' + (i >= this.health ? ' empty' : '');
            heart.textContent = '❤️';
            container.appendChild(heart);
        }
        
        if (this.shieldActive) {
            const shield = document.createElement('span');
            shield.className = 'heart';
            shield.textContent = '🛡️';
            container.appendChild(shield);
        }
    }
    
    update() {
        if (this.state !== 'playing') return;
        
        const timeScale = this.slowTimeActive ? 0.5 : 1;
        
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
        
        // Spawn pipes
        this.pipeSpawnTimer++;
        if (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
            this.spawnPipe();
            this.pipeSpawnTimer = 0;
        }
        
        // Spawn powerups
        this.powerupSpawnTimer++;
        if (this.powerupSpawnTimer >= 150 && Math.random() < 0.3) {
            this.spawnPowerup();
            this.powerupSpawnTimer = 0;
        }
        
        // Update pipes
        this.pipes.forEach((pipe, index) => {
            pipe.x -= this.gameSpeed * timeScale;
            
            // Score when passing pipe
            if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
                pipe.passed = true;
                this.pipesPassed++;
                const points = this.upgrades.doubleScore ? 2 : 1;
                this.score += points;
                document.getElementById('current-score').textContent = this.score;
                
                // Show upgrade screen every 5 pipes
                if (this.pipesPassed % 5 === 0) {
                    this.showUpgradeScreen();
                }
                
                // Increase difficulty
                if (this.pipesPassed % 10 === 0) {
                    this.gameSpeed = Math.min(this.gameSpeed + 0.3, 6);
                    this.pipeSpawnInterval = Math.max(this.pipeSpawnInterval - 5, 60);
                }
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
            
            // Magnetism effect
            if (this.upgrades.magnetism) {
                const dx = this.bird.x - powerup.x;
                const dy = this.bird.y - powerup.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    powerup.x += dx * 0.05;
                    powerup.y += dy * 0.05;
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
    
    spawnPipe() {
        const gapSize = this.upgrades.widerGaps ? 180 : 150;
        const minY = 80;
        const maxY = this.canvas.height - gapSize - 80;
        const gapY = Math.random() * (maxY - minY) + minY;
        
        this.pipes.push({
            x: this.canvas.width,
            gapY: gapY,
            gapSize: gapSize,
            width: 60,
            passed: false
        });

        // 30% chance to spawn powerup in the gap
        if (Math.random() < 0.3) {
            // Center of the pipe gap
            const powerupX = this.canvas.width + 30; // 30 is half of pipe width (60)
            const powerupY = gapY + gapSize / 2;
            this.spawnPowerup(powerupX, powerupY);
        }
    }
    
    spawnPowerup(x, y) {
        const type = this.powerupTypes[Math.floor(Math.random() * this.powerupTypes.length)];
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
        const dx = this.bird.x - powerup.x;
        const dy = this.bird.y - powerup.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < (this.bird.width / 2 + powerup.size / 2);
    }
    
    collectPowerup(powerup) {
        this.powerupsCollected++;
        this.createParticles(powerup.x, powerup.y, 10, powerup.color);
        
        switch (powerup.type) {
            case 'coin':
                this.score += 5;
                break;
            case 'heart':
                if (this.health < this.maxHealth) {
                    this.health++;
                    this.updateHealthDisplay();
                }
                break;
            case 'star':
                this.score += 10;
                this.shieldActive = true;
                this.updateHealthDisplay();
                break;
            case 'clock':
                this.slowTimeActive = true;
                this.slowTimeTimer = 180; // 3 seconds at 60fps
                break;
        }
        
        document.getElementById('current-score').textContent = this.score;
    }
    
    takeDamage() {
        if (this.shieldActive) {
            this.shieldActive = false;
            this.updateHealthDisplay();
            this.createParticles(this.bird.x, this.bird.y, 15, '#3498db');
            this.bird.y = Math.min(this.bird.y, this.canvas.height - 100);
            this.bird.velocity = this.bird.jumpForce;
            return;
        }
        
        this.health--;
        this.updateHealthDisplay();
        this.createParticles(this.bird.x, this.bird.y, 20, '#e74c3c');
        
        if (this.health <= 0) {
            this.showGameOver();
        } else {
            // Reset position but continue
            this.bird.y = 300;
            this.bird.velocity = 0;
            this.pipes = [];
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
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        if (this.slowTimeActive) {
            gradient.addColorStop(0, '#1a1a4e');
            gradient.addColorStop(1, '#2d2d6e');
        } else {
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#E0F6FF');
        }
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds (decorative)
        this.drawClouds();
        
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
        this.drawGround();
    }
    
    drawClouds() {
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
        const gradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
        gradient.addColorStop(0, '#2ecc71');
        gradient.addColorStop(0.5, '#27ae60');
        gradient.addColorStop(1, '#1e8449');
        
        this.ctx.fillStyle = gradient;
        
        // Top pipe
        this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
        // Top pipe cap
        this.ctx.fillRect(pipe.x - 5, pipe.gapY - 30, pipe.width + 10, 30);
        
        // Bottom pipe
        this.ctx.fillRect(pipe.x, pipe.gapY + pipe.gapSize, pipe.width, this.canvas.height - pipe.gapY - pipe.gapSize);
        // Bottom pipe cap
        this.ctx.fillRect(pipe.x - 5, pipe.gapY + pipe.gapSize, pipe.width + 10, 30);
        
        // Pipe highlights
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(pipe.x + 5, 0, 8, pipe.gapY - 30);
        this.ctx.fillRect(pipe.x + 5, pipe.gapY + pipe.gapSize + 30, 8, this.canvas.height);
    }
    
    drawPowerup(powerup) {
        powerup.rotation += 0.05;
        
        this.ctx.save();
        this.ctx.translate(powerup.x, powerup.y);
        this.ctx.rotate(Math.sin(powerup.rotation) * 0.2);
        
        // Glow effect
        this.ctx.shadowColor = powerup.color;
        this.ctx.shadowBlur = 15;
        
        // Draw icon
        this.ctx.font = `${powerup.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(powerup.icon, 0, 0);
        
        this.ctx.restore();
    }
    
    drawBird() {
        if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) return;

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
        
        // Bird body
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.bird.width / 2);
        gradient.addColorStop(0, '#f39c12');
        gradient.addColorStop(1, '#e67e22');
        
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
    
    drawGround() {
        const gradient = this.ctx.createLinearGradient(0, this.canvas.height - 20, 0, this.canvas.height);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(1, '#654321');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);
        
        // Grass
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(0, this.canvas.height - 25, this.canvas.width, 8);
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
