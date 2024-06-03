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
                    effect: 'Move a station to any free slot and build your new station in the old slot',
                    text: 'Shift photons to move a station to a new location and construct a new station in its place.'
                },
                copies: 4
            },
            {
                id: 'engineer_lv4_B',
                pattern:  [
                  [0, 1, 0],
                  [0, 1, 0],
                  [1, 0, 1]
                ],
                title: 'Technology Advancement',
                details: {
                    type: 'Tech',
                    effect: 'Draw 2 Tech cards',
                    text: 'Advance your technology to learn new methods and strategies.'
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
                    effect: 'Bounce all adjacent stations to other adjacent free slots (they get destroyed if no free slots)',
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
                    effect: 'Destroy all other adjacent stations',
                    text: 'Trigger a fission reaction to obliterate all adjacent stations.'
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
                title: 'Growt Serum',
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
                title: 'Resource Optimization',
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
                title: 'Technology Breakthrough',
                details: {
                    type: 'Station',
                    effect: 'Build 1 station',
                    text: 'Achieve a technological breakthrough to construct a new station without using resources.'
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
                title: 'Bytes Shift',
                details: {
                    type: 'Station',
                    effect: 'Shift a selected row by 1 slot, you can choose the direction',
                    text: 'Shift bytes to move an entire row of stations by one slot.'
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
                title: 'Photon Cannon',
                details: {
                    type: 'Station',
                    effect: 'Eliminate all stations of 1 rows/columns',
                    text: 'Deploy a photon cannon to eliminate all stations in a row or column.'
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
                title: 'Synthetic Black Hole',
                details: {
                    type: 'Station',
                    effect: 'Eliminate all stations of 4x4 area',
                    text: 'Create a synthetic black hole to eliminate all stations in a 4x4 area.'
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
                    effect: 'Gain or Kill [1d8] Population of 1 opponent',
                    text: 'Amplify the signal to either increase or decrease the population.',
                },
                copies: 3,
            },
            {
                id: 'hacker_lv3_A',
                pattern: [
                  [0, 0, 0],
                  [0, 1, 1],
                  [1, 0, 0]
                ],
                title: 'Stations Swap',
                details: {
                    type: 'Station',
                    effect: 'Swap any 2 slots',
                    text: 'Swap the positions of two stations to reconfigure the layout.'
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
                title: 'System Subotage',
                details: {
                    type: 'Station',
                    effect: 'Destroy 1 station of your choice',
                    text: 'Sabotage the system to destroy a station of your choice.'
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
                    effect: 'Gain X Population, where X is the number of the other players stations',
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
                    effect: 'Steal 2 Population from 2 opponents',
                    text: 'Drain the essence of your enemies, transferring their population to your own.'
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
                    effect: 'Kill 8 Population from an opponent',
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
                    effect: 'Kill 4 Population from 2 opponents',
                    text: 'Erase the shadows of your enemies, reducing their population.'
                },
                copies: 3
            },
        ],
    }
};
