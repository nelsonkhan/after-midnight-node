const _ = require('lodash')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let intro = `
AFTER MIDNIGHT! 
---------------------
Coded by Taylor Khan
github.com/nelsonkhan
nelsonkhan.github.io
---------------------

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

let kept = []
let current_roll
let dice_left = 6
let high_score = 0

function roll(times) {
  let result = []
  for (i=0; i < times; i++) {
    result.push(_.random(1, 6))
  }
  return result
}

function keepPrompt() {
    console.log(`\n| Current roll: ${current_roll}`)
    let die_counts = _.countBy(current_roll, Math.floor)

    rl.question("\n Enter any die you want to keep, separated by commas:", answer => {
      if (answer == '-r') { 
        console.log(rules) 
        return keepPrompt()
      }

      if (!answer.length) { 
        console.log('[!] You must keep at least one die.')
        return keepPrompt() 
      }

      let answer_arr = answer.split(',')

      // if answer is invalid, ask for new input
      if (!verifyAnswer(die_counts ,answer_arr)) {
        console.log('\n [!] Your current roll does not have all the dice you selected.')
        return keepPrompt()
      }

      // if we get this far the answer was valid, so move
      // selected dice to the kept array
      answer_arr
      .forEach(die => kept.push(die.trim()))
      console.log(` Your hand: ${kept}`)

      // if there is 6 die kept, the game is over.
      if (kept.length == 6) { 
        // player needs a one and a four to qualify
        if (kept.find(die => die == 1) && kept.find(die => die == 4)) {
          // add up total score and remove five, as the qualifier dice don't count
          let score = kept.reduce((a, b) => parseInt(a) + parseInt(b), -5)
          if (score > high_score) high_score = score
          console.log(` [*] Final score: ${score}`)
          // offer to keep playing or quit
          return restartPrompt()
        }
        // if we get this far, the player didnt qualify
        // offer to keep playing or quit
        console.log('[!] Your final hand did not contain a four and a one. You lose.')
        return restartPrompt()
      } 

      // if there isnt 6 dice kept, keep playing w/
      // remaining dice
      current_roll = roll(6 - kept.length)
      keepPrompt()
    })
  }

function verifyAnswer(src, input) {
  // verify that current roll contains each die in answer
  // innocent until proven guilty
  let valid_answer = true

  // if there is not enough of a die in current_roll, the answer was invalid
  input.forEach(die => {
    if (!src[die.trim()])  return valid_answer = false 
    src[die.trim()] -= 1
  })
  return valid_answer
}

function restartPrompt() {
  console.log(` [*] High Score: ${high_score}`)
  rl.question (
    `\nTry again? (Y/N)`,
    answer => {
      if (_.lowerCase(answer.trim()) == 'y') {
        kept = []
        current_roll = roll(6)
        console.log('\033[2J') // clear the console
        console.log(intro)
        return keepPrompt()
      }
      process.exit() 
    }
  )
}

console.log('\033[2J') // clear the console

rl.question(`${intro}
Press enter to begin!`, 
answer => {
  if (answer == '-r') console.log(rules)
  current_roll = roll(6)
  keepPrompt()  
})

