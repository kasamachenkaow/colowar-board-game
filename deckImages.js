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
                title: 'Bio-Enhancement',
                details: {
                    type: 'Population',
                    effect: 'Gain X Population, where X is the number of the adjacent stations',
                    text: 'Enhance biological systems to increase the population swiftly.'
                },
                copies: 3
            },
            {
                id: 'engineer_lv2_B',
                pattern:  [
                  [0, 1, 0],
                  [0, 1, 0],
                  [0, 0, 0]
                ],
                title: 'Dark Protocol',
                details: {
                    type: 'population',
                    effect: 'Kill X Population, where X is the number of the adjacent stations',
                    text: 'Activate a covert protocol that results in the reduction of the population.'
                },
                copies: 3
            },
            {
                id: 'engineer_lv3_A',
                pattern:  [
                  [1, 0, 0],
                  [1, 1, 0],
                  [0, 0, 0]
                ],
                title: 'Galactic Recycler',
                details: {
                    type: 'Station',
                    effect: 'Move 1 of your stations to any free slot',
                    text: 'Utilize advanced recycling techniques to repurpose one of your stations.'
                },
                copies: 4
            },
            {
                id: 'engineer_lv4_A',
                pattern:  [
                  [1, 0, 1],
                  [0, 1, 0],
                  [0, 1, 0]
                ],
                title: 'Photon Shift',
                details: {
                    type: 'Station',
                    effect: 'Move a station to any free slot and build your station in the old slot',
                    text: 'Shift photons to move a station to a new location and construct a new station in its place.'
                },
                copies: 4
            },
            {
                id: 'engineer_lv5_A',
                pattern:  [
                  [0, 1, 0],
                  [1, 1, 1],
                  [0, 1, 0]
                ],
                title: 'Stellar Reconfiguration',
                details: {
                    type: 'Station',
                    effect: 'Move all adjacent stations to other adjacent free slots (they get destroyed if no free slots)',
                    text: 'Reconfigure the positions of all adjacent stations, reshaping the stellar map.'
                },
                copies: 3
            },
            {
                id: 'engineer_lv9_A',
                pattern:  [
                  [1, 1, 1],
                  [1, 1, 1],
                  [1, 1, 1]
                ],
                title: 'Fission Reactor',
                details: {
                    type: 'Station',
                    effect: 'Destroy all adjacent stations for of your stations',
                    text: 'Trigger a chain reaction that moves all adjacent stations to new positions.'
                },
                copies: 1
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
                title: 'Quantum Expansion',
                details: {
                    type: 'population',
                    effect: 'Gain X Population, where X is the number of the adjacent free slots',
                    text: 'Harness quantum technology to expand your population effortlessly.'
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
                title: 'Resource Alchemy',
                details: {
                    type: 'Resource',
                    effect: 'Gain 1 Resource',
                    text: 'Transform basic elements into valuable resources through alchemical processes.'
                },
                copies: 4
            },
            {
                id: 'scientist_lv3_B',
                pattern:  [
                  [1, 0, 0],
                  [0, 1, 0],
                  [0, 0, 1]
                ],
                title: 'Station Multiplexer',
                details: {
                    type: 'Station',
                    effect: 'Consumes 1 Resource to build 2 stations',
                    text: 'Utilize multiplexing technology to establish multiple stations simultaneously.'
                },
                copies: 4
            },
            {
                id: 'scientist_lv3_C',
                pattern:  [
                  [0, 0, 0],
                  [1, 1, 1],
                  [0, 0, 0]
                ],
                title: 'Terraforming Beacon',
                details: {
                    type: 'Station',
                    effect: 'Build 1 station',
                    text: 'Activate a terraforming beacon to construct a new station.'
                },
                copies: 4
            },
            {
                id: 'scientist_lv4_A',
                pattern:  [
                  [0, 1, 0],
                  [1, 1, 1],
                  [0, 0, 0]
                ],
                title: 'Chrono Distortion',
                details: {
                    type: 'Special',
                    effect: 'Take another turn',
                    text: 'Distort the fabric of time, allowing you to take an additional turn.'
                },
                copies: 3
            },
            {
                id: 'scientist_lv5_A',
                pattern:  [
                  [1, 0, 1],
                  [0, 1, 0],
                  [1, 0, 1]
                ],
                title: 'Nova Blast',
                details: {
                    type: 'Station',
                    effect: 'Eliminate all stations of 1 adjacent rows/columns',
                    text: 'Release a massive energy blast, obliterating stations in a wide area.'
                },
                copies: 3
            },
            {
                id: 'scientist_lv8_A',
                pattern:  [
                  [1, 1, 1],
                  [1, 0, 1],
                  [1, 1, 1]
                ],
                title: 'Singularity',
                details: {
                    type: 'Station',
                    effect: 'Eliminate all stations of 4x4 area',
                    text: 'Create a singularity to consume all stations within a large area.'
                },
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
                title: 'Signal Boost',
                details: {
                    type: 'Population',
                    effect: 'Gain or Kill [1d8] Population',
                    text: 'Boost signal strength to increase your population through enhanced communications.',
                },
                copies: 3,
            },
            {
                id: 'hacker_lv3_A',
                pattern:  [
                  [0, 0, 0],
                  [0, 1, 1],
                  [1, 0, 0]
                ],
                title: 'System Reset',
                details: {
                    type: 'Station',
                    effect: 'Move any upto 3 stations to any free slots',
                    text: 'Initiate a system-wide reset, allowing you to recycle multiple stations.'
                },
                copies: 4
            },
            {
                id: 'hacker_lv4_A',
                pattern:  [
                  [1, 0, 0],
                  [0, 1, 1],
                  [0, 0, 1]
                ],
                title: 'Codebreaker',
                details: {
                    type: 'Station',
                    effect: 'Destroy 1 station of your choice',
                    text: 'Deploy a codebreaking algorithm to dismantle an opposing station.'
                },
                copies: 3
            },
            {
                id: 'hacker_lv5_A',
                pattern:  [
                  [1, 1, 0],
                  [0, 0, 1],
                  [1, 1, 0]
                ],
                title: 'Circuit Overload',
                details: {
                    type: 'Station',
                    effect: 'Move any upto 3 stations to any slots',
                    text: 'Overload the circuit, enabling you to reposition multiple stations.'
                },
                copies: 2
            },
            {
                id: 'hacker_lv6_A',
                pattern:  [
                  [1, 1, 1],
                  [0, 0, 0],
                  [1, 1, 1]
                ],
                title: 'Data Heist',
                details: {
                    type: 'Station',
                    effect: 'Steal 3 adjacent stations',
                    text: 'Execute a data heist to seize control of nearby stations.'
                },
                copies: 1
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
                title: 'Celestial Awakening',
                details: {
                    type: 'Population',
                    effect: 'Gain 8 Population',
                    text: 'Invoke a celestial awakening to greatly increase your population.'
                },
                copies: 3
            },
            {
                id: 'spiritual_leader_lv3_B',
                pattern:  [
                  [0, 1, 0],
                  [0, 1, 0],
                  [0, 1, 0]
                ],
                title: 'Ascension Surge',
                details: {
                    type: 'Population',
                    effect: 'Gain 8 Population',
                    text: 'Trigger a surge of ascension, significantly boosting your population.'
                },
                copies: 3
            },
            {
                id: 'spiritual_leader_lv3_C',
                pattern:  [
                  [1, 0, 0],
                  [0, 1, 0],
                  [0, 0, 1]
                ],
                title: 'Soul Siphon',
                details: {
                    type: 'Population',
                    effect: 'Steal 4 Population from an opponent',
                    text: 'Siphon the souls of your opponents, transferring their population to your own.'
                },
                copies: 3
            },
            {
                id: 'spiritual_leader_lv3_D',
                pattern:  [
                  [0, 0, 1],
                  [0, 1, 0],
                  [1, 0, 0]
                ],
                title: 'Essence Drain',
                details: {
                    type: 'Population',
                    effect: 'Steal 4 Population from an opponent',
                    text: 'Drain the essence of your rivals, adding their population to yours.'
                },
                copies: 3
            },
            {
                id: 'spiritual_leader_lv3_E',
                pattern:  [
                  [1, 0, 0],
                  [1, 1, 0],
                  [0, 0, 0]
                ],
                title: 'Void Purge',
                details: {
                    type: 'Population',
                    effect: 'Kill 6 Population from an opponent',
                    text: 'Purge your enemies into the void, reducing their population.'
                },
                copies: 3
            },
            {
                id: 'spiritual_leader_lv3_F',
                pattern:  [
                  [0, 1, 1],
                  [0, 0, 1],
                  [0, 0, 0]
                ],
                title: 'Shadow Erasure',
                details: {
                    type: 'Population',
                    effect: 'Kill 6 Population from an opponent',
                    text: 'Erase the shadows of your foes, eliminating part of their population.'
                },
                copies: 3
            },
        ],
    }
};
