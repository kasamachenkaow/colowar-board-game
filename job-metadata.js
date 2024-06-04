const jobMetadata = {
   "scientist": {
      initResources: 1,
      initTechCards: 1,
      skill: (level) => `Skill: threat ${level} free slot(s) as your station to help play tech cards`,
   },
   "spiritual-leader": {
      initResources: 1,
      initTechCards: 1,
      skill: (level) => `Skill: gain ${level*5} population each turn`,
   },
   "engineer": {
      initResources: 1,
      initTechCards: 2,
      skill: (level) => `Skill: can use ${level} adjacent station(s) to help play tech cards`,
   },
   "hacker": {
      initResources: 2,
      initTechCards: 1,
      skill: (level) => `Skill: can reroll ${level} time(s) per turn`,
      traits: ["always-start-first"],
   },
   "politician": {
      initResources: 1,
      initTechCards: 1,
      skill: (level) => `Skill: choose upto 1 player, you can use ${level} station(s) of them to help playing for Tech cards, if you play it this way everyone draws a tech card`,
   },
   "ruler": {
      initResources: 1,
      initTechCards: 1,
      skill: (level) => `Skill: each turn you must declare to activate ${level} law(s), options are ['no-build', 'no-gain-resource', 'no-draw', 'no-play-card'], at least 1 law must be changed each turn`,
   },
}
