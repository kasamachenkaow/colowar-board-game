const X = 'X';
const deckImages = {
    tech: {
        engineer: [
            {
                id: 'engineer_lv3_A',
                pattern:  [
                  [1, 0, 0],
                  [1, 1, 0],
                  [0, 0, 0]
                ],
                title: 'Bio-Enhancement',
                details: {
                    type: 'Population',
                    effect: 'Gain X*2 Population, where X is the number of the adjacent stations',
                    text: 'Enhance biological systems to increase the population swiftly.'
                },
                copies: 3
            },
            {
                id: 'engineer_lv3_B',
                pattern:  [
                  [0, 1, 1],
                  [0, 1, 0],
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
                  [0, 0, 0],
                  [1, 1, 0],
                  [1, 1, 0]
                ],
                title: 'Remote Station Construction',
                details: {
                    type: 'Station',
                    effect: 'Gain 1 resource then build 1 station, you can only build on a slot that has no adjacent stations',
                    text: 'Construct a new station in a location that is free of adjacent stations.'
                },
                copies: 3
            },
            {
                id: 'engineer_lv5_A',
                pattern:  [
                  [1, 1, 1],
                  [0, 1, 0],
                  [0, 1, 0]
                ],
                title: 'Photon Shift',
                details: {
                    type: 'Station',
                    effect: 'Move a station to any adjacent free slot and gain 1 resource and build your new station in the old slot',
                    text: 'Shift photons to move a station to a new location and construct a new station in its place.'
                },
                copies: 3
            },
            {
                id: 'engineer_lv5_B',
                pattern:  [
                  [0, 1, 0],
                  [0, 1, 0],
                  [1, 1, 1]
                ],
                title: 'Technology Advancement',
                details: {
                    type: 'Tech',
                    effect: 'Draw 2 Tech cards',
                    text: 'Advance your technology to learn new methods and strategies.'
                },
                copies: 3
            },
            {
                id: 'engineer_lv7_A',
                pattern:  [
                  [0, 1, 0],
                  [1, 1, 1],
                  [1, 1, 1]
                ],
                title: 'Stellar Reconfiguration',
                details: {
                    type: 'Station',
                    effect: 'Bounce all adjacent stations to other adjacent free slots (they get destroyed if no free slots)',
                    text: 'Reconfigure the positions of all adjacent stations, reshaping the stellar map.'
                },
                copies: 2
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
                id: 'scientist_lv3_A',
                pattern:  [
                  [0, 1, 0],
                  [0, 1, 0],
                  [0, 1, 0]
                ],
                title: 'Growt Serum',
                details: {
                    type: 'Population',
                    effect: 'Gain X*2 Population, where X is the number of the adjacent free slots',
                    text: 'Harness quantum technology to expand your population effortlessly.'
                },
                copies: 3
            },
            {
                id: 'scientist_lv3_B',
                pattern:  [
                  [0, 0, 1],
                  [0, 1, 0],
                  [1, 0, 0]
                ],
                title: 'Resource Alchemy',
                details: {
                    type: 'Resource',
                    effect: 'Gain 2 resource, you can only play this card if you have not build a station and you cannot build a station this turn',
                    text: 'Transform basic elements into valuable resources through alchemical processes.'
                },
                copies: 4
            },
            {
                id: 'scientist_lv3_C',
                pattern:  [
                  [1, 0, 0],
                  [0, 1, 0],
                  [0, 0, 1]
                ],
                title: 'Resource Optimization',
                details: {
                    type: 'Station',
                    effect: 'Consumes 1 resource to build 2 stations',
                    text: 'Utilize multiplexing technology to establish multiple stations simultaneously.'
                },
                copies: 4
            },
            {
                id: 'scientist_lv3_D',
                pattern:  [
                  [0, 0, 0],
                  [1, 1, 1],
                  [0, 0, 0]
                ],
                title: 'Technology Breakthrough',
                details: {
                    type: 'Station',
                    effect: 'Gain 1 resource and build 1 station',
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
                    effect: 'Shift a selected row or column by 1 slot, you can choose the direction',
                    text: 'Shift bytes to move a row or column of stations by one slot in any direction.'
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
                copies: 2
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
                    effect: 'Choose 2 slots and swap the stations in them (you can choose free slots too)',
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
                    effect: 'Choose 2 slots and swap the stations in them (you can choose free slots too), then destroy 1 station',
                    text: 'Sabotage the system to reposition stations and destroy a selected station.'
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
                    effect: 'Move any upto 2 stations to any slots',
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
                    effect: 'Steal 3 other adjacent stations',
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
                    effect: 'Steal 3 Population from 2 opponents',
                    text: 'Drain the essence of your enemies, transferring their population to your own.'
                },
                copies: 3
            },
            {
                id: 'spiritual_leader_lv3_E',
                pattern:  [
                  [0, 0, 0],
                  [1, 0, 0],
                  [1, 1, 0]
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
                    effect: 'Kill 3 Population from 2 opponents',
                    text: 'Erase the shadows of your enemies, reducing their population.'
                },
                copies: 3
            },
        ],
        "politician": [
            {
              id: 'politician_lv2_A',
              pattern: [
                [0, 1, 0],
                [0, 0, 0],
                [0, 1, 0]
              ],
              title: 'Corruption',
              details: {
                type: 'Resource',
                effect: 'Choose 1 opponent, they gain 1 resource and you can use 1 of their stations to help playing tech cards for 1 turn, this effect can stack',
                text: 'Use your influence to gain access to resources and stations.'
              },
              copies: 4,
            },
            {
              id: 'politician_lv3_A',
              pattern: [
                [1, 0, 1],
                [0, 0, 0],
                [0, 0, 1]
              ],
              title: 'Population Growth',
              details: {
                type: 'Population',
                effect: 'Gain X Population, where X is the number of all players cards in hands',
                text: 'Implement policies to encourage population growth.'
              },
              copies: 3,
            },
            {
              id: 'politician_lv3_B',
              pattern: [
                [0, 0, 0],
                [1, 0, 1],
                [0, 1, 0]
              ],
              title: 'technological Incentive',
              details: {
                type: 'Resource',
                effect: 'All players draw an additional Tech card in the choose R/T phase until the end of your next turn',
                text: 'Offer incentives to encourage technological advancement.'
              },
              copies: 3,
            },
            {
              id: 'politician_lv4_A',
              pattern: [
                [0, 1, 0],
                [1, 0, 1],
                [0, 1, 0]
              ],
              title: 'Technology Suppliment',
              details: {
                type: 'Tech',
                effect: 'All players draw 2 Tech cards',
                text: 'Demonstrate generosity to foster technological advancement.'
              },
              copies: 4,
            },
            {
              id: 'politician_lv5_A',
              pattern: [
                [1, 0, 1],
                [0, 1, 0],
                [1, 0, 1]
              ],
              title: 'Prisoners Dilemma',
              details: {
                type: 'Special',
                effect: 'Everyone gets to vote for any player, including themselves. You decide the voting order. If you end up with the most votes, you get 20 Population points. If someone else gets the most votes, they have to destroy 3 of their own stations. If there’s a tie, all other players each destroy 1 station. Players can also choose not to vote at all.',
                text: 'Create a scenario where cooperation is important.',
              },
              copies: 2,
            },
            {
              id: 'politician_lv7_A',
              pattern: [
                [1, 0, 1],
                [1, 1, 1],
                [1, 0, 1]
              ],
              title: `Coup d'état`,
              details: {
                type: 'Special',
                effect: 'Choose a player, you gain resources equal to the number of their stations, draw tech cards equal to the number of their tech cards in their hands, and your population become equal to their population if you have lower',
                text: 'Stage a coup to seize control of an opponent’s resources and population.',
              },
              copies: 1,
            },
        ],
        "ruler": [
            {
              id: 'ruler_lv2_A',
              pattern: [
                [0, 0, 0],
                [1, 1, 0],
                [0, 0, 0]
              ],
              title: 'Rule Paragraph 2 - Section A',
              details: {
                type: 'Population',
                effect: 'Punish playeys by seizing X*2 Population from players, where X is the number of the violations of the last rule declared by you, you can only choose players who violated the rule and you can give any amount of them to any non-violated players',
                text: 'Rob the bad to give the good.'
              },
              copies: 2,
            },
            {
              id: 'ruler_lv2_B',
              pattern: [
                [0, 1, 0],
                [0, 1, 0],
                [0, 0, 0]
              ],
              title: 'Rule Paragraph 2 - Section B',
              details: {
                type: 'Station',
                effect: 'Push an adjacent station to the next slot, you cannot push if there is no free slot and you can only push stations of players who violated the rule, if you do you can spend 1 resource to build a staion in that slot',
                text: 'Exile illegal stations to maintain order and stability.'
              },
              copies: 2,
            },
            {
              id: 'ruler_lv3_A',
              pattern: [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 0]
              ],
              title: 'Rule Paragraph 3 - Section A',
              details: {
                type: 'Station',
                effect: 'Punish players by moving any X / 3 (rounded down) stations to any free slots, where X is the number of the violations of the last rule declared by you, you can only choose stations of players who violated the rule',
                text: 'Realocate illegal stations to maintain order and stability.'
              },
              copies: 2,
            },
            {
              id: 'ruler_lv3_B',
              pattern: [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
              ],
              title: 'Rule Paragraph 3 - Section B',
              details: {
                type: 'Resource',
                effect: 'Players who have not violated the rule(s) declared by you draw X / 2 (rounded up) tech cards, where X is the number of the violations of the last rule declared by you',
                text: 'Rob the bad to give the good.'
              },
              copies: 2,
            },
            {
              id: 'ruler_lv4_A',
              pattern: [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]
              ],
              title: 'Rule Paragraph 4 - Section A',
              details: {
                type: 'Station',
                effect: 'Punish players by destroying X / 2 (rounded down) stations, where X is the number of the violations of the last rule declared by you, you can only choose stations of players who violated the rule',
                text: 'Eradicate illegal stations to maintain order and stability.'
              },
              copies: 2,
            },
            {
              id: 'ruler_lv5_B',
              pattern: [
                [1, 1, 1],
                [0, 1, 0],
                [0, 1, 0]
              ],
              title: 'Rule Paragraph 5 - Section A',
              details: {
                type: 'Station',
                effect: 'Gain X / 2 (rounded down) and build that many stations, where X is the number of violations of the last rule declared by you',
                text: 'Construct new stations to enforce the rules.'
              },
              copies: 2,
            },
            {
              id: 'ruler_lv7_A',
              pattern: [
                [1, 1, 1],
                [1, 1, 1],
                [0, 1, 0]
              ],
              title: 'Rule Paragraph 7 - Section A',
              details: {
                type: 'Special',
                effect: 'Opponents who violated the last rule declared by you the most lose the game (if there is a tie, all tied players lose)',
                text: 'Death sentence for the most notorious violators.'
              },
              copies: 2,
            },
        ],
        "spy": [
            {
              id: 'spy_lv1_A',
              pattern: [
                [0, X, 0],
                [X, 1, X],
                [0, X, 0]
              ],
              title: 'Mission Change',
              details: {
                type: 'Station',
                effect: 'Move 1 of your stations to any adjacent free slot',
                text: 'Change your mission to gain an advantage over your opponents.'
              },
              copies: 7,
            },
            {
              id: 'spy_lv2_A',
              pattern: [
                [0, 0, 0],
                [1, 0, 1],
                [0, 0, 0]
              ],
              title: 'Information Leak',
              details: {
                type: 'Station',
                effect: 'Gain X resource(s) and build that many station(s), where X is the maximum of number of stations that has been built by one of player your are spying this turn',
                text: 'Leak information to gain an advantage over your opponents.',
              },
              copies: 5,
            },
            {
              id: 'spy_lv3_A',
              pattern: [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
              ],
              title: 'Station Compromise',
              details: {
                type: 'Station',
                effect: 'Steal 1 station from the player you are spyin',
                text: 'Compromise the stations of your opponents to gain an advantage.'
              },
              copies: 5,
            },
            {
              id: 'spy_lv5_A',
              pattern: [
                [1, X, 1],
                [X, 1, X],
                [1, X, 1]
              ],
              title: 'Propaganda',
              details: {
                type: 'Population',
                effect: 'Gain X*3 Population, where X is the number of the stations for players you are spying',
                text: 'Spread propaganda to increase your population.'
              },
              copies: 3,
            }
        ],
        "botanist": [
            {
              id: 'botanist_lv1_A',
              pattern: [
                [X, 0, X],
                [0, 1, 0],
                [X, 0, X]
              ],
              title: 'Nature Push',
              details: {
                type: 'Station',
                effect: 'Push 1 adjacent station to the next free slot',
                text: 'Push nature to help your stations grow and flourish.'
              },
              copies: 4,
            },
            {
              id: 'botanist_lv2_A',
              pattern: [
                [0, X, 0],
                [X, 1, X],
                [0, 1, 0]
              ],
              title: 'Early Cultivate',
              details: {
                type: 'Station',
                effect: 'Roll slot dices 2 times, only you get the effects',
                text: 'Cultivate your stations to help them grow and flourish.',
              },
              copies: 6,
            },
            {
              id: 'botanist_lv3_A',
              pattern: [
                [X, 1, X],
                [0, 1, 0],
                [0, 1, 0]
              ],
              title: 'Fertilizer',
              details: {
                type: 'Station',
                effect: 'Push 1 station then build 1 station in the old slot',
                text: 'Fertilize your stations to help them grow and flourish.'
              },
              copies: 6,
            },
            {
              id: 'botanist_lv5_A',
              pattern: [
                [1, 1, 1],
                [0, 1, 0],
                [0, 1, 0]
              ],
              title: 'Full Cultivate',
              details: {
                type: 'Special',
                effect: 'Roll slot dices 5 times, only you get the effects',
                text: 'Cultivate your stations to help them grow and flourish.'
              },
              copies: 3,
            },
            {
              id: 'botanist_lv7_A',
              pattern: [
                [1, 1, 1],
                [1, 1, 1],
                [0, 1, 0]
              ],
              title: 'Global Warming',
              details: {
                type: 'Station',
                effect: 'Destroy all stations that are not connected to your stations',
                text: 'Increase the temperature to destroy all stations that are not connected to your stations.'
              },
              copies: 1,
            },
        ],
    }
};
