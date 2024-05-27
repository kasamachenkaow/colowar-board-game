const deckImages = {
    spell: [
        {
            id: 'spell1',
            name: 'spell_basic_02_lv1.png',
            title: 'Fire Spell Lv1',
            details: {
                type: 'Fire',
                level: 1,
                effect: 'Burn',
                power: 10,
                cost: 5
            }
        },
        {
            id: 'spell2',
            name: 'spell_basic_03_lv1.png',
            title: 'Water Spell Lv1',
            details: {
                type: 'Water',
                level: 1,
                effect: 'Drench',
                power: 8,
                cost: 4
            }
        },
        {
            id: 'spell3',
            name: 'spell_basic_04_lv1.png',
            title: 'Earth Spell Lv1',
            details: {
                type: 'Earth',
                level: 1,
                effect: 'Quake',
                power: 12,
                cost: 6
            }
        },
        {
            id: 'spell4',
            name: 'spell_basic_lv1.png',
            title: 'Wind Spell Lv1',
            details: {
                type: 'Wind',
                level: 1,
                effect: 'Gust',
                power: 7,
                cost: 3
            }
        }
    ],
    equipment: [
        {
            id: 'equip1',
            name: 'sword_lv1.png',
            title: 'Basic Sword Lv1',
            details: {
                type: 'Sword',
                level: 1,
                damage: 15,
                durability: 100
            }
        },
        {
            id: 'equip2',
            name: 'sword_lv1_02.png',
            title: 'Steel Sword Lv1',
            details: {
                type: 'Sword',
                level: 1,
                damage: 18,
                durability: 90
            }
        },
        {
            id: 'equip3',
            name: 'sword_lv1_03.png',
            title: 'Iron Sword Lv1',
            details: {
                type: 'Sword',
                level: 1,
                damage: 12,
                durability: 110
            }
        }
    ],
    tech: {
        scientist: [
            {
                id: 'magician1',
                name: 'skill_01.png',
                title: 'Magic Shield',
                details: {
                    type: 'Defense',
                    effect: 'Block Damage',
                    duration: '1 turn'
                }
            },
            {
                id: 'magician2',
                name: 'skill_02.png',
                title: 'Mana Burst',
                details: {
                    type: 'Attack',
                    effect: 'Double Damage',
                    duration: '1 turn'
                }
            }
        ],
        "spiritual-leader": [
            {
                id: 'fortune1',
                name: 'skill_01.png',
                title: 'Future Sight',
                details: {
                    type: 'Insight',
                    effect: 'Reveal Cards',
                    duration: '1 turn'
                }
            },
            {
                id: 'fortune2',
                name: 'skill_02.png',
                title: 'Lucky Draw',
                details: {
                    type: 'Buff',
                    effect: 'Double Cards',
                    duration: '1 turn'
                }
            }
        ],
        engineer: [
            {
                id: 'soldier1',
                name: 'skill_01.png',
                title: 'War Cry',
                details: {
                    type: 'Buff',
                    effect: 'Increase Attack',
                    duration: '2 turns'
                }
            },
            {
                id: 'soldier2',
                name: 'skill_02.png',
                title: 'Shield Block',
                details: {
                    type: 'Defense',
                    effect: 'Reduce Damage',
                    duration: '2 turns'
                }
            },
            {
                id: 'soldier2',
                name: 'skill_02.png',
                title: 'Shield Block',
                details: {
                    type: 'Defense',
                    effect: 'Reduce Damage',
                    duration: '2 turns'
                }
            }
        ],
        hacker: [
            {
                id: 'hacker1',
                name: 'skill_01.png',
                title: 'System Hack',
                details: {
                    type: 'Debuff',
                    effect: 'Reduce Defense',
                    duration: '2 turns'
                }
            },
        ]
    }
};
