# 🐦 Flappy Rogue

A rogue-like twist on the classic Flappy Bird game, built with vanilla JavaScript and HTML5 Canvas.

## 🎮 Features

### Rogue-like Elements
- **Upgrade System**: Every 5 pipes, choose from 3 random upgrades
- **Multiple Lives**: Collect hearts and upgrade to gain extra lives
- **Power-ups**: Collect coins, hearts, stars, and clocks during gameplay
- **Persistent Stats**: High score and total runs saved locally

### Upgrades Available
| Upgrade | Rarity | Effect |
|---------|--------|--------|
| ❤️ Extra Heart | Common | +1 Max Health |
| 🛡️ Shield | Rare | Block one hit |
| ⏱️ Slow Motion | Epic | Slow down time briefly |
| 🧲 Magnet | Rare | Attract power-ups |
| ✨ Double Score | Epic | 2x points per pipe |
| 🔬 Shrink | Legendary | Smaller hitbox |
| 🪶 Feather Fall | Common | Reduced gravity |
| ↕️ Wide Gaps | Rare | Larger pipe gaps |

### Power-ups
- 🪙 **Coin**: +5 points
- ❤️ **Heart**: Restore 1 health
- ⭐ **Star**: +10 points + Shield
- ⏰ **Clock**: Activate slow motion (requires upgrade)

## 🕹️ Controls

- **Space** or **Click/Tap** to flap

## 🚀 How to Play

1. Open `index.html` in a web browser
2. Click "Start Run" to begin
3. Flap to avoid pipes and collect power-ups
4. Choose upgrades every 5 pipes
5. Try to beat your high score!

## 🛠️ Tech Stack

- HTML5 Canvas
- Vanilla JavaScript (ES6+)
- CSS3 with animations
- LocalStorage for persistence

## 📁 Project Structure

```
FlappyBird/
├── index.html    # Main HTML file
├── styles.css    # Styling and animations
├── game.js       # Game logic and rendering
└── README.md     # This file
```

## 🎯 Built With

Created with **Claude Opus** as part of an AI agent comparison project.

---

*Part of the AI Agent Comparison Project - Testing Claude, ChatGPT, and Gemini*
