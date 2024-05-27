const deckImages = {
    tech: {
        scientist: [
            {
                id: 'scientist_lv2_A',
                pattern:  [
                  [0, 0, 0],
                  [1, 1, 0],
                  [0, 0, 0]
                ],
                title: 'Propaganda',
                details: {
                    type: 'Population',
                    effect: 'Gain 5 Population',
                },
                copies: 3
            },
            {
                id: 'scientist_lv3_A',
                pattern:  [
                  [0, 0, 1],
                  [0, 1, 0],
                  [1, 0, 0]
                ],
                title: 'Propaganda',
                details: {
                    type: 'Population',
                    effect: 'Gain 5 Population',
                }
            },
            {
                id: 'scientist_lv3_B',
                pattern:  [
                  [1, 0, 0],
                  [0, 1, 0],
                  [0, 0, 1]
                ],
                title: 'Propaganda',
                details: {
                    type: 'Population',
                    effect: 'Gain 5 Population',
                }
            }
        ],
        "spiritual-leader": [
            {
                id: 'fortune1',
                pattern:  [
                  [0, 0, 0],
                  [1, 1, 0],
                  [0, 0, 0]
                ],
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
