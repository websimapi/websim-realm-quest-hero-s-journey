class Player {
    constructor() {
        this.health = 100;
        this.level = 1;
        this.gold = 0;
        this.inventory = [];
        this.maxInventorySlots = 10;
        this.itemImages = {
            'Rusty Sword': '/Rusty Sword.png'
        };
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
        
        // Clear existing inventory
        inventoryList.innerHTML = '';
        
        // Populate inventory
        this.inventory.forEach((item, index) => {
            const itemLi = document.createElement('li');
            itemLi.classList.add('inventory-item');
            
            // Create image for the item
            const itemImg = document.createElement('img');
            itemImg.src = this.itemImages[item.name] || this.getDefaultItemImage(item.type);
            itemImg.alt = item.name;
            itemImg.classList.add('inventory-item-image');
            
            // Create item details div
            const itemDetails = document.createElement('div');
            itemDetails.classList.add('inventory-item-details');
            
            // Item name
            const itemName = document.createElement('span');
            itemName.textContent = item.name;
            itemName.classList.add('inventory-item-name');
            
            // Item type
            const itemType = document.createElement('span');
            itemType.textContent = item.type;
            itemType.classList.add('inventory-item-type');
            
            // Remove button
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '✖';
            removeBtn.classList.add('remove-item-btn');
            removeBtn.addEventListener('click', () => {
                this.inventory.splice(index, 1);
                this.updateInventoryDisplay();
            });
            
            // Assemble the item list entry
            itemDetails.appendChild(itemName);
            itemDetails.appendChild(itemType);
            
            itemLi.appendChild(itemImg);
            itemLi.appendChild(itemDetails);
            itemLi.appendChild(removeBtn);
            
            inventoryList.appendChild(itemLi);
        });

        // Update capacity
        inventoryCapacity.textContent = `Inventory: ${this.inventory.length}/${this.maxInventorySlots}`;
    }

    getDefaultItemImage(type) {
        const imageMap = {
            'Consumable': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%232ecc71"><circle cx="50" cy="50" r="40"/></svg>',
            'Weapon': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23e74c3c"><rect x="20" y="40" width="60" height="20"/></svg>',
            'Armor': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%233498db"><path d="M20 30 L50 10 L80 30 L80 70 L50 90 L20 70 Z"/></svg>',
            'Magical': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%239b59b6"><polygon points="50 10 65 40 95 45 75 70 80 95 50 80 20 95 25 70 5 45 35 40"/></svg>'
        };
        return imageMap[type] || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%2334495e"><rect x="20" y="20" width="60" height="60"/></svg>';
    }

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