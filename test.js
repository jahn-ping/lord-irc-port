import * as game from './game.js';
import { playerExists, loadPlayer, savePlayer, createPlayer, deletePlayer } from './player.js';
import fs from 'fs';

console.log('Testing LORD game logic...\n');

// Clean up any existing test player
const testNick = 'TestPlayer';
if (playerExists(testNick)) {
  deletePlayer(testNick);
}

// Test 1: Create character
console.log('Test 1: Creating character...');
let result = game.createCharacter(testNick, 'TestWarrior', 0, 0);
console.log('Result:', result);
console.log('Player exists:', playerExists(testNick));

// Test 2: Load character
console.log('\nTest 2: Loading character...');
let player = loadPlayer(testNick);
console.log('Player:', JSON.stringify(player, null, 2));

// Test 3: Get stats
console.log('\nTest 3: Getting stats...');
let stats = game.getPlayerStats(testNick);
console.log('Stats:', stats);

// Test 4: Fight monster
console.log('\nTest 4: Fighting monster...');
let fight = game.fightMonster(testNick);
console.log('Fight result:', JSON.stringify(fight, null, 2));

// Test 5: Attack monster
if (fight && fight.encounter) {
  console.log('\nTest 5: Attacking monster...');
  let attack = game.attackMonster(testNick, fight.monster.hp);
  console.log('Attack result:', JSON.stringify(attack, null, 2));
  
  // Continue fighting until done
  let currentHp = fight.monster.hp;
  let attempts = 0;
  while (attempts < 20) {
    let result = game.attackMonster(testNick, currentHp);
    if (result.victory || result.defeat) {
      console.log('Fight ended:', result.victory ? 'VICTORY' : 'DEFEAT');
      if (result.victory) {
        let reward = game.winMonsterFight(testNick, fight.monster);
        console.log('Reward:', JSON.stringify(reward, null, 2));
      }
      break;
    }
    currentHp = result.monsterHp;
    attempts++;
  }
}

// Test 6: Buy weapon
console.log('\nTest 6: Buying weapon...');
result = game.buyWeapon(testNick, 2); // Dagger
console.log('Buy weapon result:', result);

// Test 7: Deposit to bank
console.log('\nTest 7: Depositing to bank...');
result = game.depositBank(testNick, 1000);
console.log('Deposit result:', result);

// Test 8: Heal at healer
console.log('\nTest 8: Heal at healer...');
result = game.healAtHealer(testNick);
console.log('Heal result:', result);

// Test 9: Stay at inn
console.log('\nTest 9: Stay at inn...');
result = game.stayAtInn(testNick);
console.log('Inn result:', result);

// Test 10: Get final stats
console.log('\nTest 10: Final stats...');
stats = game.getPlayerStats(testNick);
console.log('Final Stats:');
console.log('  Name:', stats.name);
console.log('  Level:', stats.level);
console.log('  HP:', stats.hp + '/' + stats.maxhp);
console.log('  Gold:', stats.gold);
console.log('  Bank:', stats.bank);
console.log('  Weapon:', stats.weapon);
console.log('  Fights:', stats.fights);

// Clean up
deletePlayer(testNick);
console.log('\nAll tests completed!');
