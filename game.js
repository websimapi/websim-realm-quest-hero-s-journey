class Player {
    constructor() {
        this.maxHealth = 6;  // 3 full hearts
        this.health = 6;
        this.level = 1;
        this.gold = 0;
        this.inventory = [];
        this.maxInventorySlots = 10;
        this.itemImages = {
            'Rusty Sword': '/Rusty Sword.png',
            'Magic Scroll': '/Magic Scroll.png',
            'Leather Armor': '/Leather Armour.png',
            'Health Potion': '/Health Potion.png'
        };
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.updateStats();
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
        this.updateStats();
    }

    updateStats() {
        const healthContainer = document.getElementById('player-health');
        healthContainer.innerHTML = this.renderHealthHearts();
        
        document.getElementById('player-level').textContent = ` Level ${this.level}`;
        document.getElementById('player-gold').textContent = ` ${this.gold}`;
    }

    renderHealthHearts() {
        const fullHearts = Math.floor(this.health / 2);
        const halfHeart = this.health % 2 === 1;
        let healthHtml = '';

        // Add full hearts
        for (let i = 0; i < fullHearts; i++) {
            healthHtml += `<img src="/Heart Full.png" alt="Full Heart" class="heart-icon">`;
        }

        // Add half heart if needed
        if (halfHeart) {
            healthHtml += `<img src="/Heart Half.png" alt="Half Heart" class="heart-icon">`;
        }

        return healthHtml;
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
            removeBtn.textContent = '';
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
        this.setupSceneInteractions();
        this.initSunCycle();
    }

    setupSceneInteractions() {
        const sceneGraphics = document.getElementById('scene-graphics');
        const exploreRegion = document.getElementById('explore-region');
        const enemySvg = document.getElementById('enemy-svg');

        // Explore interaction
        exploreRegion.addEventListener('click', () => {
            this.explore();
        });

        // Fight interaction
        enemySvg.addEventListener('click', () => {
            if (this.currentEnemy) {
                this.fight();
            }
        });
    }

    initializeEventListeners() {
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

    setupKeyboardSupport() {
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
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

    initSunCycle() {
        const sunImage = document.getElementById('sun-image');
        const lightingOverlay = document.getElementById('lighting-overlay');
        const sceneSvg = document.getElementById('scene-graphics');
        const backgroundLandscape = document.getElementById('background-landscape');
        const mountainRange = document.getElementById('mountain-range');
        const cycleDuration = 24 * 60 * 1000; // 24 minutes total cycle
        const startTime = Date.now() - (cycleDuration / 2); // Start mid-cycle

        const updateSunPosition = () => {
            const currentTime = Date.now();
            const elapsedTime = (currentTime - startTime) % cycleDuration;
            const progress = elapsedTime / cycleDuration;

            // Calculate sun position across the sky
            const sunX = 50 + (progress * 700); // Move from x=50 to x=750
            const sunY = 50 + Math.sin(progress * Math.PI) * 200; // Sine wave for arc

            // Update sun position
            sunImage.setAttribute('x', sunX);
            sunImage.setAttribute('y', sunY);

            // Update lighting based on time of day
            const intensity = Math.sin(progress * Math.PI);
            
            // More nuanced lighting overlay
            lightingOverlay.style.background = `radial-gradient(
                circle at ${sunX/8}% ${sunY/4}%, 
                rgba(255, 255, 0, ${0.1 + intensity * 0.3}), 
                transparent 70%
            )`;

            // Dynamic sky and mountain colors
            if (progress < 0.25 || progress > 0.75) {
                // Night time
                backgroundLandscape.style.fill = 'rgba(0, 0, 50, 0.8)';
                mountainRange.style.fill = 'rgba(50, 50, 100, 0.6)';
                sceneSvg.style.filter = 'brightness(0.4) contrast(1.2)';
            } else {
                // Day time
                backgroundLandscape.style.fill = 'rgba(135, 206, 235, 1)'; // Sky blue
                mountainRange.style.fill = 'rgba(119, 136, 153, 0.7)'; // Slate gray
                sceneSvg.style.filter = 'brightness(1) contrast(1)';
            }

            // Continue the animation
            requestAnimationFrame(updateSunPosition);
        };

        // Start the sun cycle
        updateSunPosition();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GameWorld();
});

if (!window.localStorage) {
    console.warn('Local storage is not supported in this browser.');
}