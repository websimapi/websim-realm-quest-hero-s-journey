class Player {
    constructor() {
        this.health = 100;
        this.level = 1;
        this.gold = 0;
        this.inventory = [];
    }

    takeDamage(amount) {
        this.health -= amount;
        this.updateStats();
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, 100);
        this.updateStats();
    }

    updateStats() {
        document.getElementById('player-health').textContent = `❤️ ${this.health}`;
        document.getElementById('player-level').textContent = `🔱 Level ${this.level}`;
        document.getElementById('player-gold').textContent = `💰 ${this.gold}`;
    }
}

class Enemy {
    constructor(name, health, damage) {
        this.name = name;
        this.health = health;
        this.damage = damage;
    }
}

class GameWorld {
    constructor() {
        this.player = new Player();
        this.currentEnemy = null;
        this.initializeEventListeners();
        this.setupKeyboardSupport();
    }

    initializeEventListeners() {
        document.getElementById('explore-btn').addEventListener('click', () => this.explore());
        document.getElementById('fight-btn').addEventListener('click', () => this.fight());
        document.getElementById('inventory-btn').addEventListener('click', () => this.showInventory());
    }

    explore() {
        const encounters = [
            this.findTreasure(),
            this.encounterEnemy(),
            this.findPotion()
        ];
        const randomEncounter = encounters[Math.floor(Math.random() * encounters.length)];
        this.updateDialogue(randomEncounter);
    }

    fight() {
        if (!this.currentEnemy) {
            this.updateDialogue("No enemy to fight! Explore first.");
            return;
        }
        // Basic combat mechanics
        this.currentEnemy.health -= 20;
        this.player.takeDamage(this.currentEnemy.damage);

        if (this.currentEnemy.health <= 0) {
            this.updateDialogue(`You defeated the ${this.currentEnemy.name}!`);
            
            // Hide enemy SVG
            const enemySvg = document.getElementById('enemy-svg');
            enemySvg.style.display = 'none';
            
            this.player.gold += 10;
            this.player.updateStats();
            this.currentEnemy = null;
        }
    }

    showInventory() {
        this.updateDialogue("Inventory is empty. Keep exploring!");
    }

    encounterEnemy() {
        const enemies = [
            new Enemy("Goblin", 50, 10),
            new Enemy("Skeleton", 40, 15),
            new Enemy("Wolf", 60, 8)
        ];
        this.currentEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        
        // Update SVG enemy display
        const enemySvg = document.getElementById('enemy-svg');
        enemySvg.style.display = 'block';
        
        return `You encountered a ${this.currentEnemy.name}!`;
    }

    findTreasure() {
        const gold = Math.floor(Math.random() * 20);
        this.player.gold += gold;
        this.player.updateStats();
        return `You found ${gold} gold coins!`;
    }

    findPotion() {
        const healAmount = Math.floor(Math.random() * 20) + 10;
        this.player.heal(healAmount);
        return `You found a healing potion and restored ${healAmount} health!`;
    }

    updateDialogue(message) {
        const dialogueBox = document.getElementById('dialogue-box');
        dialogueBox.textContent = message;
    }

    // Add keyboard navigation support
    setupKeyboardSupport() {
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'e':
                case 'E':
                    document.getElementById('explore-btn').click();
                    break;
                case 'f':
                case 'F':
                    document.getElementById('fight-btn').click();
                    break;
                case 'i':
                case 'I':
                    document.getElementById('inventory-btn').click();
                    break;
            }
        });
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    new GameWorld();
});

// Error handling for older browsers
if (!window.localStorage) {
    console.warn('Local storage is not supported in this browser.');
}