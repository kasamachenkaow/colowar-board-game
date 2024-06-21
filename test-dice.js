function getDiceResult(diceType) {
  return Math.floor(Math.random() * diceType) + 1;
}

function testDice() {
  const diceType = 6;
  const results = {}
  for(let i = 0; i < 10e6; i++) {
    const result1 = getDiceResult(diceType);
    const result2 = getDiceResult(diceType);
    const result = `${result1}-${result2}`
    if(!results[result]) {
      results[result] = 1;
    } else {
      results[result] += 1;
    }
  }

  console.log(results)

  const mean = Object.values(results).reduce((acc, val) => acc + val, 0) / diceType ** 2;

  console.log({ mean })

  const meanDiff = Object.values(results).map(val => Math.abs(val - mean));

  console.log({ meanDiff })
}

testDice();
