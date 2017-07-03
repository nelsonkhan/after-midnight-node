const _ = require('lodash')
const readline = require('readline')
const prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let intro = `
AFTER MIDNIGHT! 
------------------------
Coded by Taylor Khan
Thanks /u/ugwe43to874nf4
github.com/nelsonkhan
nelsonkhan.github.io
------------------------

-r to view rules
`

let rules = `
THE RULES
---------
After Midnight (or 1-4-24) is a dice game played with 6 dice.
One player rolls at a time. 
He rolls 6 dice, and keeps at least one. 
Any that the player doesn't keep are rerolled. 
This procedure is then repeated 
until there are no more dice to roll. 
Once kept, dice cannot be rerolled. 
Players must have kept a 1 and a 4, or they are disqualified. 
If they have a 1 and 4, the other dice are totaled to give the player's score. 
The maximum score is therefore 24. 
The procedure is repeated for the remaining players. 
The player with the highest 4 dice total wins.
---------
`

let game = {
  highScore: 0,
  roll: [
    { value: 0, status: 'unkept'},
    { value: 0, status: 'unkept'},
    { value: 0, status: 'unkept'},    
    { value: 0, status: 'unkept'},    
    { value: 0, status: 'unkept'},    
    { value: 0, status: 'unkept'}
  ],
  // randomizes roll, excludes 'kept' dice
  rollDice () {
    this.roll = this.roll.map(die => {
      if (die.status == 'kept') { return die }
      return { value: _.random(1, 6), status: 'unkept'}
    })
  },
  filterRoll(dieStatus) {
    return this.roll.filter(die => die.status == dieStatus)
  },
  // maps die value
  viewDice (dieStatus) {
    return this.filterRoll(dieStatus)
    .map(die => die.value)
  },
  findDieIndex (dieValue) {
    return this.roll.findIndex(die => die.value == dieValue && die.status == 'unkept')
  },
  keepDie (dieIndex) {
    this.roll[dieIndex].status = 'kept'
  },
  rollContains(dieStatus) {
    return this.roll.find(die => die.status == dieStatus)
  },
  generateScore() {
    let hasFour = this.roll.find(die => die.value == 4)
    let hasOne = this.roll.find(die => die.value == 1)
    if (hasFour && hasOne) { return this.roll.reduce((total, current) => {
      return total + current.value
    }, -5)}
    return 0
  },
  reset () {
    this.roll.forEach(die => die.status = 'unkept')
  }
}

function playGame() {
  if (game.rollContains('unkept')) {
    game.rollDice()
    gamePrompt()
  }
  else {
    if (game.highScore < game.generateScore()) { game.highScore = game.generateScore() }    
    console.log(`SCORE: ${ game.generateScore() }`)
    console.log(`HIGHSCORE: ${ game.highScore }`)
    prompt.question('Continue playing? [y/n]\n', answer => {
      game.reset()
      if (answer.toLowerCase() == 'y') { return playGame() }
      process.exit()
    })
  }
}

function gamePrompt () {
  let keptLength = game.filterRoll('kept').length
  console.log(`\nROLL: ${ game.viewDice('unkept') }`) 

  prompt.question(`Enter the dice you'd like to keep separated by commas\n`, answer => {
    if (answer == '-r') {
      console.log(rules)
      return gamePrompt()
    }

    answer
    .split(',')
    .map(die => die.trim())
    .forEach(die => {
      let index = game.findDieIndex(die) 
      index > -1 ? game.keepDie(index) : console.warn(`[!] ${ die } is an invalid choice`)
    })

    if (keptLength < game.filterRoll('kept').length) {
      console.log(`KEPT DICE: ${ game.viewDice('kept') }`)
      return playGame()
    }

    console.warn('[!] You must select at least one die!')
    gamePrompt()
  })
}


console.log('\033[2J')
console.log(intro)
playGame()