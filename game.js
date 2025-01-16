class Player {
    constructor() {
        this.health = 100;
        this.level = 1;
        this.gold = 0;
        this.inventory = [];
        this.maxInventorySlots = 10;
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

    addToInventory(item) {
        if (this.inventory.length < this.maxInventorySlots) {
            this.inventory.push(item);
            this.updateInventoryDisplay();
            return true;
        }
        return false;
    }

    updateInventoryDisplay() {
        const inventoryList = document.getElementById('inventory-list');
        const inventoryCapacity = document.getElementById('inventory-capacity');
        const inventorySvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        
        // Clear existing inventory
        inventoryList.innerHTML = '';
        inventorySvg.innerHTML = ''; // Clear SVG
        
        // Configure SVG
        inventorySvg.setAttribute('viewBox', '0 0 500 200');
        inventorySvg.setAttribute('width', '100%');
        inventorySvg.setAttribute('height', '200');
        
        // Populate inventory
        this.inventory.forEach((item, index) => {
            const itemGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            itemGroup.setAttribute('transform', `translate(${index * 100}, 0)`);
            
            // Background rect
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute('x', '10');
            rect.setAttribute('y', '10');
            rect.setAttribute('width', '80');
            rect.setAttribute('height', '80');
            rect.setAttribute('fill', this.getItemColor(item.type));
            rect.setAttribute('stroke', '#ffffff');
            rect.setAttribute('stroke-width', '2');
            
            // Item type text
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute('x', '50');
            text.setAttribute('y', '110');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#ffffff');
            text.textContent = item.name;
            
            // Remove button
            const removeBtn = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            removeBtn.setAttribute('cx', '85');
            removeBtn.setAttribute('cy', '15');
            removeBtn.setAttribute('r', '10');
            removeBtn.setAttribute('fill', '#ff6b6b');
            removeBtn.setAttribute('cursor', 'pointer');
            
            removeBtn.addEventListener('click', () => {
                this.inventory.splice(index, 1);
                this.updateInventoryDisplay();
            });
            
            const removeBtnText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            removeBtnText.setAttribute('x', '85');
            removeBtnText.setAttribute('y', '20');
            removeBtnText.setAttribute('text-anchor', 'middle');
            removeBtnText.setAttribute('fill', 'white');
            removeBtnText.setAttribute('font-size', '12');
            removeBtnText.textContent = '✖';
            
            itemGroup.appendChild(rect);
            itemGroup.appendChild(text);
            itemGroup.appendChild(removeBtn);
            itemGroup.appendChild(removeBtnText);
            
            inventorySvg.appendChild(itemGroup);
        });
        
        // Append SVG to inventory list
        const inventoryListItem = document.createElement('li');
        inventoryListItem.appendChild(inventorySvg);
        inventoryList.appendChild(inventoryListItem);

        // Update capacity
        inventoryCapacity.textContent = `Inventory: ${this.inventory.length}/${this.maxInventorySlots}`;
    }

    // New method to get color based on item type
    getItemColor(type) {
        const colorMap = {
            'Consumable': '#2ecc71',   // Green for potions
            'Weapon': '#e74c3c',       // Red for weapons
            'Armor': '#3498db',        // Blue for armor
            'Magical': '#9b59b6'       // Purple for magical items
        };
        return colorMap[type] || '#34495e';
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
        this.setupInventoryModal();
    }

    initializeEventListeners() {
        document.getElementById('explore-btn').addEventListener('click', () => this.explore());
        document.getElementById('fight-btn').addEventListener('click', () => this.fight());
        document.getElementById('inventory-btn').addEventListener('click', () => {
            this.player.updateInventoryDisplay();
            document.getElementById('inventory-modal').showModal();
        });
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
        this.player.updateInventoryDisplay();
        document.getElementById('inventory-modal').showModal();
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

        // Randomly add an item to inventory
        const possibleItems = [
            { name: "Health Potion", type: "Consumable" },
            { name: "Rusty Sword", type: "Weapon" },
            { name: "Leather Armor", type: "Armor" },
            { name: "Magic Scroll", type: "Magical" }
        ];

        const newItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
        if (this.player.addToInventory(newItem)) {
            return `You found ${gold} gold coins and a ${newItem.name}!`;
        }
        
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

    setupInventoryModal() {
        const closeInventoryBtn = document.getElementById('close-inventory-btn');
        closeInventoryBtn.addEventListener('click', () => {
            document.getElementById('inventory-modal').close();
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