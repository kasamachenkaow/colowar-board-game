const jobMetadata = {
   "scientist": {
      initResources: 1,
      initTechCards: 2,
      skill: (level) => `Threat ${level} free slot(s) as your station to help play tech cards`,
      traits: ["beginner-friendly"],
   },
   "spiritual-leader": {
      initResources: 1,
      initTechCards: 1,
      skill: (level, playersCount) => `Gain ${isNaN(level) ? level + `*${playersCount+1}` : level*(playersCount+1)} population each turn`,
      traits: ["beginner-friendly"],
   },
   "engineer": {
      initResources: 1,
      initTechCards: 2,
      skill: (level) => `Can use ${level} adjacent station(s) to help play tech cards`,
      traits: ["beginner-friendly"],
   },
   "hacker": {
      initResources: 2,
      initTechCards: 1,
      skill: (level) => `Can reroll ${level} time(s) per turn`,
      traits: ["always-start-first"],
   },
   "politician": {
      initResources: 1,
      initTechCards: 1,
      skill: (level) => `During the beginning of playing card phase choose upto 1 player, you can use ${level} station(s) of them to help playing for Tech cards, if you play it this way everyone draws a tech card, the drawing effect happens only once each turn`,
   },
   "ruler": {
      initResources: 1,
      initTechCards: 1,
      skill: (level) => `Each turn you must declare to activate ${level} law(s), options are ['no-build', 'no-gain-resource', 'no-draw', 'no-play-card'], at least 1 law must be changed each turn`,
      traits: ["advanced-strategy-required"],
   },
   "spy": {
      initResources: 1,
      initTechCards: 0,
      skill: (level) => `After the end of your turn you can choose to spy upto ${level} player(s), whenever they play a tech card you can draw a tech card, you can only play tech cards when no player has less stations than you`,
   },
   "botanist": {
      initResources: 2,
      initTechCards: 1,
      skill: (level) => `When the slot roll matches with one of your stations, you gain upto ${level+1} extra effect(s), depending on the number of connected slots with the same slot type`,
      traits: ["beginner-friendly"],
   },
}
