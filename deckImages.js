const deckImages = {
    tech: {
        engineer: [
            {
                id: 'engineer_lv2_A',
                pattern:  [
                  [0, 0, 0],
                  [1, 1, 0],
                  [0, 0, 0]
                ],
                title: 'Population Surge',
                details: {
                    type: 'population',
                    effect: 'Gain 5 Population',
                }
                copies: 5
            },
            {
                id: 'engineer_lv2_B',
                pattern:  [
                  [0, 1, 0],
                  [0, 1, 0],
                  [0, 0, 0]
                ],
                title: 'xxxx',
                details: {
                    type: 'population',
                    effect: 'Kill 5 Population',
                }
                copies: 5
            },
            {
                id: 'engineer_lv3_A',
                pattern:  [
                  [1, 0, 0],
                  [1, 1, 0],
                  [0, 0, 0]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Station',
                    effect: 'Recycle 1 of your stations',
                }
                copies: 4
            },
            {
                id: 'engineer_lv3_B',
                pattern:  [
                  [0, 1, 0],
                  [0, 1, 0],
                  [0, 1, 0]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Station',
                    effect: 'Move 1 station in a group freely to adjacent free slot of the group',
                }
                copies: 3
            },
            {
                id: 'engineer_lv4_A',
                pattern:  [
                  [1, 1, 0],
                  [1, 1, 0],
                  [0, 0, 0]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Station',
                    effect: 'Move all adjacent stations to other adjacent free slots (they get destoryed if no free slots)',
                }
                copies: 2
            },
        ],
        scientist: [
            {
                id: 'scientist_lv2_A',
                pattern:  [
                  [0, 0, 0],
                  [1, 1, 0],
                  [0, 0, 0]
                ],
                title: 'xxxxxx',
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
                title: 'xxxxxxx',
                details: {
                    type: 'Resource',
                    effect: 'Gain 1 Resource',
                }
                copies: 4
            },
            {
                id: 'scientist_lv3_B',
                pattern:  [
                  [1, 0, 0],
                  [0, 1, 0],
                  [0, 0, 1]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Station',
                    effect: 'You can put up to 4 stations this turn',
                }
                copies: 4
            },
            {
                id: 'scientist_lv3_C',
                pattern:  [
                  [0, 0, 0],
                  [1, 1, 1],
                  [0, 0, 0]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Station',
                    effect: 'Consume 1 resource to build 1 station',
                }
                copies: 4
            },
            {
                id: 'scientist_lv4_A',
                pattern:  [
                  [0, 1, 0],
                  [1, 1, 1],
                  [0, 0, 0]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Special',
                    effect: 'Take another turn',
                }
                copies: 3
            },
            {
                id: 'scientist_lv5_A',
                pattern:  [
                  [1, 0, 1],
                  [0, 1, 0],
                  [1, 0, 1]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Station',
                    effect: 'Eliminate all stations of 3 adjacent rows/columns',
                }
                copies: 1
            },
        ],
        hacker: [
            {
                id: 'hacker_lv2_A',
                pattern:  [
                  [0, 1, 0],
                  [1, 0, 0],
                  [0, 0, 0]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Population',
                    effect: 'Gain 5 Population',
                }
                copies: 3,
            },
            {
                id: 'hacker_lv3_A',
                pattern:  [
                  [0, 0, 0],
                  [0, 1, 1],
                  [1, 0, 0]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Station',
                    effect: 'Destroy 1 station of your choice',
                }
                copies: 4
            },
            {
                id: 'hacker_lv4_A',
                pattern:  [
                  [1, 0, 0],
                  [0, 1, 1],
                  [0, 0, 1]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Station',
                    effect: 'Recycle 3 stations of your choice',
                }
                copies: 3
            },
            {
                id: 'hacker_lv5_A',
                pattern:  [
                  [1, 1, 0],
                  [0, 0, 1],
                  [1, 1, 0]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Station',
                    effect: 'Move any 4 stations to any free slots',
                }
                copies: 3
            },
            {
                id: 'hacker_lv6_A',
                pattern:  [
                  [1, 1, 1],
                  [0, 0, 0],
                  [1, 1, 1]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Station',
                    effect: 'Steel 3 adjacent stations',
                }
                copies: 2
            },
        ],
        "spiritual-leader": [
            {
                id: 'spiritual_leader_lv3_A',
                pattern:  [
                  [0, 0, 0],
                  [1, 1, 1],
                  [0, 0, 0]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Population',
                    effect: 'Gain 8 Population',
                }
                copies: 3
            },
            {
                id: 'spiritual_leader_lv3_B',
                pattern:  [
                  [0, 1, 0],
                  [0, 1, 0],
                  [0, 1, 0]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Population',
                    effect: 'Gain 8 Population',
                }
                copies: 3
            },
            {
                id: 'spiritual_leader_lv3_C',
                pattern:  [
                  [1, 0, 0],
                  [0, 1, 0],
                  [0, 0, 1]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Population',
                    effect: 'Steal 4 Population from an opponent',
                }
                copies: 3
            },
            {
                id: 'spiritual_leader_lv3_D',
                pattern:  [
                  [0, 0, 1],
                  [0, 1, 0],
                  [1, 0, 0]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Population',
                    effect: 'Steal 4 Population from an opponent',
                }
                copies: 3
            },
            {
                id: 'spiritual_leader_lv3_E',
                pattern:  [
                  [1, 0, 0],
                  [1, 1, 0],
                  [0, 0, 0]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Population',
                    effect: 'Kill 6 Population from an opponent',
                }
                copies: 3
            },
            {
                id: 'spiritual_leader_lv3_F',
                pattern:  [
                  [0, 1, 1],
                  [0, 0, 1],
                  [0, 0, 0]
                ],
                title: 'xxxxxxx',
                details: {
                    type: 'Population',
                    effect: 'Kill 6 Population from an opponent',
                }
                copies: 3
            },
        ],
    }
};
