import { config } from './config.js';
import { weapons, armors, levelGains, masters, monsters, deathMessages, classNames, forestEvents } from './gameData.js';
import { playerExists, loadPlayer, savePlayer, createPlayer, getAllPlayers } from './player.js';

const HORSE_NONE = 0;
const HORSE_WHITE = 1;
const HORSE_BLACK = 2;

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function getWeaponAttack(weaponNum) {
  const weapon = weapons[weaponNum - 1];
  return weapon ? weapon.attack : 0;
}

function getWeaponName(weaponNum) {
  const weapon = weapons[weaponNum - 1];
  return weapon ? weapon.name : 'Unknown';
}

function getArmorDefense(armorNum) {
  const armor = armors[armorNum - 1];
  return armor ? armor.defense : 0;
}

function getLevelGains(level) {
  return levelGains.find(g => g.level === level) || levelGains[levelGains.length - 1];
}

function getXpNeeded(level) {
  const gains = getLevelGains(level);
  return gains ? gains.xpNeeded : 9999999;
}

function getRandomMonster(playerLevel) {
  const maxIndex = Math.min(monsters.length, playerLevel * 10);
  const index = random(0, maxIndex - 1);
  const baseMonster = { ...monsters[index], index };
  
  const levelMultiplier = 1 + (playerLevel - 1) * 0.15;
  const scaleFactor = Math.max(1, levelMultiplier);
  
  return {
    ...baseMonster,
    hp: Math.floor(baseMonster.hp * scaleFactor),
    str: Math.floor(baseMonster.str * scaleFactor),
    gold: Math.floor(baseMonster.gold * scaleFactor),
    xp: Math.floor(baseMonster.xp * scaleFactor),
    maxhp: Math.floor(baseMonster.hp * scaleFactor)
  };
}

function formatNumber(num) {
  if (num == null) return '0';
  return num.toLocaleString();
}

export function getPlayerStats(nick) {
  const player = loadPlayer(nick);
  if (!player) return null;
  
  const weapon = weapons[player.weapon_num - 1];
  const armor = armors[player.armor_num - 1];
  const nextXp = getXpNeeded(player.level + 1);
  const weaponAttack = weapon ? weapon.attack : 0;
  const armorDefense = armor ? armor.defense : 0;
  const totalAttack = player.str + weaponAttack;
  const totalDefense = player.def + armorDefense;
  
  return {
    ...player,
    weapon: weapon ? weapon.name : 'Fists',
    weaponAttack: weaponAttack,
    armor: armor ? armor.name : 'None',
    armorDefense: armorDefense,
    str: totalAttack,
    def: totalDefense,
    className: classNames[player.class],
    nextXp,
    xpPercent: Math.min(100, Math.floor((player.xp / nextXp) * 100))
  };
}

export function sanitizeName(name) {
  if (!name) return '';
  return name
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/\x03[0-9]{1,2}(,[0-9]{1,2})?/g, '')
    .replace(/\x02|\x1f|\x16|\x0f/g, '')
    .slice(0, 20);
}

export function createCharacter(nick, name, playerClass, sex) {
  name = sanitizeName(name);
  console.log('createCharacter: nick=' + nick + ', name="' + name + '", nameLen=' + (name ? name.length : 'NULL') + ', class=' + playerClass + ', sex=' + sex);
  
  if (playerExists(nick)) {
    console.log('createCharacter: Player already exists!');
    return { success: false, message: 'Character already exists!' };
  }
  
  if (!name || name.length < 1 || name.length > 100) {
    console.log('createCharacter: Name validation failed!');
    return { success: false, message: 'Name must be 1-100 characters!' };
  }
  
  const allPlayers = getAllPlayers();
  const nameExists = allPlayers.some(p => p.name.toLowerCase() === name.toLowerCase());
  if (nameExists) {
    console.log('createCharacter: Name already taken!');
    return { success: false, message: 'That name is already taken! Choose another.' };
  }
  
  if (playerClass < 0 || playerClass > 3) {
    return { success: false, message: 'Invalid class!' };
  }
  
  const player = createPlayer(nick, name, playerClass, sex);
  if (player) {
    if (playerClass === 0) {
      player.skill_charges_max = 1;
      player.skill_charges_active = 1;
    }
    savePlayer(nick, player);
    return { success: true, message: 'Character created! Welcome to LORD.', player };
  }
  return { success: false, message: 'Error creating character!' };
}

export function healPlayer(nick) {
  const player = loadPlayer(nick);
  if (!player) return null;
  
  player.hp = player.maxhp;
  savePlayer(nick, player);
  return player;
}

export function checkLevelUp(nick) {
  const player = loadPlayer(nick);
  if (!player) return null;
  
  const nextXp = getXpNeeded(player.level + 1);
  
  if (player.xp >= nextXp && player.level < config.maxLevel) {
    const newLevel = player.level + 1;
    const gains = getLevelGains(newLevel);
    
    player.level = newLevel;
    player.maxhp = gains.hp;
    player.hp = gains.hp;
    player.str = gains.str;
    player.def = gains.def;
    
    savePlayer(nick, player);
    return { levelUp: true, newLevel, gains };
  }
  
  return { levelUp: false };
}

export function checkForestEvent(nick) {
  const roll = random(1, 100);
  let cumulative = 0;
  
  for (const event of forestEvents) {
    cumulative += event.chance;
    if (roll <= cumulative) {
      return processForestEvent(nick, event);
    }
  }
  
  return null;
}

export function processForestEvent(nick, event) {
  const player = loadPlayer(nick);
  if (!player) return null;
  
  const result = {
    event: event.name,
    message: event.message,
    type: event.type,
    outcomes: []
  };
  
  switch (event.type) {
    case 'treasure':
      const goldFound = random(50, 200) * (1 + player.level * 0.5);
      const gemsFound = random(1, 100) <= 10 ? 1 : 0;
      player.gold = clamp(player.gold + Math.floor(goldFound), 0, config.maxGold);
      if (gemsFound) {
        player.gems += 1;
        result.outcomes.push('You found ' + Math.floor(goldFound) + ' gold and a GEM!');
      } else {
        result.outcomes.push('You found ' + Math.floor(goldFound) + ' gold!');
      }
      break;
      
    case 'bandit':
      result.outcomes.push('You fight off the bandit!');
      const goldLost = Math.floor(player.gold * random(5, 20) / 100);
      player.gold = clamp(player.gold - goldLost, 0, config.maxGold);
      if (goldLost > 0) {
        result.outcomes.push('The bandit stole ' + goldLost + ' gold!');
      }
      const hpLost = random(1, 5);
      player.hp = clamp(player.hp - hpLost, 1, player.maxhp);
      result.outcomes.push('You took ' + hpLost + ' damage in the fight.');
      break;
      
    case 'fairy':
      result.outcomes.push('                  ....                         ');
      result.outcomes.push("         .     ..........''....   ........         ");
      result.outcomes.push("       ...........        ..  ......     ..        ");
      result.outcomes.push("      .. .          Extra Special Event!  ..       ");
      result.outcomes.push("      ....         -=- -=- -=- -=- -=- -=-  ..      ");
      result.outcomes.push("      ... Your journey is interrupted by  ....     ");
      result.outcomes.push("   ... ..the sound of tiny voices. It seems.. .    ");
      result.outcomes.push(" ';. ....you've come across a group of     ..  ..'c");
      result.outcomes.push(".od;'.''. fairies bathing ..              ..  .'ok");
      result.outcomes.push(".lo;'':ol'.                . .             .. ...cx");
      result.outcomes.push(" .''.';cl:'.         ....... .            ..  ':;:");
      result.outcomes.push("      .''.     ......',;co:..             ..  ':;c:");
      result.outcomes.push("        ...........',:lxdc,...    ....   ...  .;;od");
      result.outcomes.push("         ..       .,cl:,.    ......  .....     .,lc");
      result.outcomes.push("                   ,:.                          ...");
      result.outcomes.push('');
      result.autoContinue = true;
      break;

    case 'fairy_noticed':
      result.outcomes.push('YOU ARE NOTICED!');
      result.outcomes.push('');
      result.outcomes.push('The small things encircle you. A small wet female');
      result.outcomes.push('bangs your shin. "How dare you spy on us, human!"');
      result.outcomes.push('you can\'t help but smile, the defiance in her');
      result.outcomes.push('silvery voice is truly a sight, you think to');
      result.outcomes.push('yourself. Further contemplation is interrupted by');
      result.outcomes.push('another sharpfully painful prod.');
      result.outcomes.push('');
      result.outcomes.push('(A)sk for a blessing');
      result.outcomes.push('(T)ry to catch one to show your friends');
      result.outcomes.push('');
      result.outcomes.push(r('Your choice? [A/T] (? for menu)'));
      result.prompt = 'fairy_interact';
      break;

    case 'fairy_blessing':
      {
        const roll = random(1, 100);
        if (roll < 30) {
          const gemsCaught = random(1, 3);
          player.gems += gemsCaught;
          result.outcomes.push('"Very well." the fairy nods.');
          result.outcomes.push('');
          result.outcomes.push('A single tear rolls down her cheek and');
          result.outcomes.push('transforms into a beautiful gem!');
          result.outcomes.push('');
          result.outcomes.push('You caught ' + gemsCaught + ' gem(s)!');
        } else if (roll < 80) {
          const lvl = player.level;
          const xpEarned = lvl * lvl * 10;
          player.xp = clamp(player.xp + xpEarned, 0, config.maxXP);
          result.outcomes.push('angry at you! Your blessing is...Fairy Lore!');
          result.outcomes.push('You earned ' + xpEarned + ' experience points.');
        } else {
          player.hp = player.maxhp;
          result.outcomes.push('angry at you!');
          result.outcomes.push('');
          result.outcomes.push('Your blessing is...a kiss from Teesha!');
          result.outcomes.push('');
          result.outcomes.push('A fairy near her wordlessly upstretches its arms');
          result.outcomes.push('to you.');
          result.outcomes.push('');
          result.outcomes.push('THE KISS IS STRANGELY FULFILLING!');
          result.outcomes.push('(You\'re refreshed)');
        }
        result.autoContinue = true;
      }
      break;

    case 'fairy_catch':
      {
        const roll = random(1, 100);
        if (roll >= 50) {
          result.outcomes.push('YOU MAKE A WILD GRAB FOR THE SMALL FIGURES!');
          result.outcomes.push('');
          result.outcomes.push('Your hand finally connects with.... A FAIRY!');
          result.outcomes.push('');
          result.outcomes.push('You throw the screaming creature into your pouch. What hidden');
          result.outcomes.push('powers could it have?');
          result.outcomes.push('');
          result.outcomes.push('You think now would be splendid time to leave.');
          player.fairies = (player.fairies || 0) + 1;
        } else {
          result.outcomes.push('YOU MAKE A WILD GRAB FOR THE SMALL FIGURES!');
          result.outcomes.push('');
          result.outcomes.push('Your hand finally connects with.... NOTHING!');
        }
        result.autoContinue = true;
      }
      break;

    case 'creepy':
      result.outcomes.push('                 ** CREEPY EVENT **');
      result.outcomes.push('Your quest is interrupted by a strange wailing noise.');
      result.outcomes.push('');
      result.outcomes.push('Closer inspection reveals the eerie howl seems to be');
      result.outcomes.push('coming from a nearby cave.');
      result.outcomes.push('');
      result.nextEvent = 'creepy_olivia';
      break;

    case 'creepy_olivia':
      result.outcomes.push('WAIT A SEC!');
      result.outcomes.push('');
      result.outcomes.push('It\'s just your old pal Olivia the bodyless woman.');
      result.outcomes.push('');
      result.outcomes.push('Olivia greets you with a head hug.');
      result.prompt = 'creepy_olivia';
      break;

    case 'creepy_olivia_head':
      result.outcomes.push('                 A FREUDIAN SLIP');
      result.outcomes.push('"Watcha thinkin?" you ask politely.');
      result.outcomes.push('');
      result.outcomes.push('Olivia nudges herself to a better speaking position.');
      result.outcomes.push('');
      result.outcomes.push('"Well. I was thinking about when I had a body. A very');
      result.outcomes.push('beautiful one if I do say myself. Men followed me like');
      result.outcomes.push('flies on honey. Especially one man. At the time he was');
      result.outcomes.push('a town crier at Penyon Manor."');
      result.outcomes.push('');
      result.outcomes.push('"It is because of him I am like this..You see, he.."');
      result.outcomes.push('');
      result.outcomes.push('"Getting bored here. Gotta go, see ya," you break');
      result.outcomes.push('in rudely.');
      result.outcomes.push('You travel back to the forest entrance.');
      result.autoContinue = true;
      break;

    case 'creepy_olivia_kiss':
      result.outcomes.push('You pucker up and go in for the kiss...');
      result.outcomes.push('');
      result.outcomes.push('Olivia\'s ghostly lips feel surprisingly real!');
      result.outcomes.push('');
      result.outcomes.push('You feel refreshed and stronger!');
      const strGain = random(1, 3);
      player.str += strGain;
      result.outcomes.push('You gain ' + strGain + ' strength!');
      result.autoContinue = true;
      break;

    case 'nothing':
      result.outcomes.push('You continue on your way.');
      break;
      
    case 'merchant':
      result.outcomes.push('The merchant has left some potions behind.');
      const potionHeal = Math.floor(player.maxhp * 0.3);
      player.hp = clamp(player.hp + potionHeal, 1, player.maxhp);
      result.outcomes.push('You drink a health potion and restore ' + potionHeal + ' HP!');
      break;
      
    case 'ruins':
      result.outcomes.push('You find ancient texts that increase your wisdom!');
      const xpGain = random(20, 50) * player.level;
      player.xp = clamp(player.xp + xpGain, 0, config.maxXP);
      result.outcomes.push('You gain ' + xpGain + ' experience!');
      break;
      
    case 'snow':
      result.outcomes.push('The cold saps your strength!');
      const fightsLost = random(1, 3);
      player.fights = clamp(player.fights - fightsLost, 0, 500);
      result.outcomes.push('You lose ' + fightsLost + ' fight(s) from exhaustion.');
      break;
      
    case 'bats':
      result.outcomes.push('You fight off the bats!');
      const batDamage = random(1, player.level * 2);
      player.hp = clamp(player.hp - batDamage, 1, player.maxhp);
      result.outcomes.push('The vampire bats drain ' + batDamage + ' HP!');
      const batGold = random(10, 50);
      player.gold = clamp(player.gold + batGold, 0, config.maxGold);
      result.outcomes.push('You crush a few bats and find ' + batGold + ' gold in their nest.');
      break;
      
    case 'herbs':
      const herbHeal = Math.floor(player.maxhp * random(15, 35) / 100);
      player.hp = clamp(player.hp + herbHeal, 1, player.maxhp);
      result.outcomes.push('You brew the herbs into a tea and restore ' + herbHeal + ' HP!');
      break;
      
    case 'traveler':
      const travelerGold = random(20, 100) * (1 + player.level * 0.2);
      player.gold = clamp(player.gold + Math.floor(travelerGold), 0, config.maxGold);
      result.outcomes.push('The grateful traveler gives you ' + Math.floor(travelerGold) + ' gold!');
      break;
      
    case 'wierd':
      const weirdGems = random(1, 12);
      player.gems += weirdGems;
      result.outcomes.push('You follow the angelic sounds for some time...');
      result.outcomes.push('');
      result.outcomes.push('You find ' + weirdGems + ' GEMS!');
      break;

    case 'oldman':
      if (player.sex === 0) {
        const roll = random(1, 100);
        if (roll > 90) {
          if (roll > 95) {
            result.outcomes.push('** MEGA EVENT IN THE FOREST **');
            result.outcomes.push('You are whacked with a pretty stick by the old man!');
            result.outcomes.push('He giggles and runs away!');
            result.outcomes.push('');
            result.outcomes.push('YOU GET 5 CHARM!');
            player.charm = clamp(player.charm + 5, 1, 100);
            result.autoContinue = true;
          } else {
            result.outcomes.push('** MEGA EVENT IN THE FOREST **');
            result.outcomes.push('You are whacked with an ugly stick by the old man!');
            result.outcomes.push('He giggles and runs away!');
            result.outcomes.push('');
            result.outcomes.push('You lose 1 CHARM!');
            player.charm = clamp(player.charm - 1, 0, 100);
            result.autoContinue = true;
          }
        } else {
          result.outcomes.push('You come across an old man. He seems confused and');
          result.outcomes.push('asks if you would direct him to the Inn. You know');
          result.outcomes.push('that if you do, you will lose time for one fight');
          result.outcomes.push('today.');
          result.outcomes.push('');
          result.outcomes.push('Do you take the old man? [Y/N] (? for menu)');
          result.prompt = 'oldman';
        }
      } else {
        result.outcomes.push('You come across an old man who seems confused.');
        result.outcomes.push('He mumbles something and wanders off...');
        result.autoContinue = true;
      }
      break;

    case 'oldman_help':
      if (player.sex === 0) {
        const goldGain = 500 * player.level;
        player.gold = clamp(player.gold + goldGain, 0, config.maxGold);
        player.charm = clamp(player.charm + 1, 1, 100);
        return {
          event: 'Old Man',
          message: 'You help the old man',
          type: 'oldman_help',
          outcomes: [
            'You take the old man to the Inn. He is pleased with',
            'you, and gives you ' + goldGain + ' gold!',
            '',
            '**CHARM GOES UP BY 1**',
            '',
            'You return to the forest.'
          ],
          autoContinue: true
        };
      }
      break;

    case 'oldman_ignore':
      if (player.sex === 0) {
        return {
          event: 'Old Man',
          message: 'You ignore the old man',
          type: 'oldman_ignore',
          outcomes: [
            'He grimaces as you walk away.',
            '',
            'You return to the forest.'
          ],
          autoContinue: true
        };
      }
      break;

    case 'scroll':
      result.outcomes.push('');
      result.outcomes.push('(S)ave her');
      result.outcomes.push('(I)gnore the girl');
      result.outcomes.push('');
      result.outcomes.push('Well? [S] (? for menu)');
      result.prompt = 'scroll';
      break;

    case 'scroll_ignore':
      return {
        event: 'Scroll',
        message: 'You ignore the damsel',
        type: 'scroll_ignore',
        outcomes: [
          'You quickly put down the note.',
          'Some things are best left alone.',
          '',
          'You return to the forest.'
        ],
        autoContinue: true
      };

    case 'scroll_save':
      return {
        event: 'Scroll',
        message: 'You decide to save her',
        type: 'scroll_save',
        prompt: 'scroll_location',
        outcomes: [
          '',
          'You\'re quite a hero. Unfortunately, the girl seems',
          'to have forgotten the return address. You\'ll have',
          'to guess.',
          '',
          '(C)astle Coldrake',
          '(F)ortress Liddux',
          '(G)annon Keep',
          '(P)enyon Manor',
          "(D)ema's Lair",
          '',
          'Where do we go now? [C/F/G/P/D] (? for menu)'
        ]
      };

    case 'hag':
      if (player.gems > 0) {
        result.outcomes.push('"Give me a gem and I will completely heal you');
        result.outcomes.push('warrior!" she screeches.');
        result.outcomes.push('');
        result.outcomes.push('Give her the gem? [Y/N] (? for menu)');
        result.prompt = 'hag';
      } else {
        result.outcomes.push('"Give me a gem and I will completely heal you');
        result.outcomes.push('warrior!" she screeches.');
        result.outcomes.push('');
        result.outcomes.push('You have no gems!');
        result.outcomes.push('');
        result.outcomes.push('"Hurumph!" the old woman grunts sourly as you leave.');
        result.autoContinue = true;
      }
      break;

    case 'hag_yes':
      if (player.gems > 0) {
        player.gems -= 1;
        const newMaxHp = player.maxhp + 1;
        player.maxhp = newMaxHp;
        player.hp = newMaxHp;
        return {
          event: 'Old Hag',
          message: 'You give her a gem',
          type: 'hag_yes',
          outcomes: [
            'You give her a gem. She waves her wand strangely.',
            '',
            'YOU FEEL BETTER',
            '',
            '** MAX HP GOES UP BY 1 **',
            '',
            'You return to the forest.'
          ],
          autoContinue: true
        };
      }
      return {
        event: 'Old Hag',
        message: 'You have no gems',
        type: 'hag_no',
        outcomes: [
          'You have no gems!',
          '',
          '"Hurumph!" the old woman grunts sourly as you leave.',
          '',
          'You return to the forest.'
        ],
        autoContinue: true
      };

    case 'hag_no':
      return {
        event: 'Old Hag',
        message: 'You decline the hag',
        type: 'hag_no',
        outcomes: [
          '"Hurumph!" the old woman grunts sourly as you leave.',
          '',
          'You return to the forest.'
        ],
        autoContinue: true
      };

    case 'hammer':
      result.outcomes.push('As is the tradition, you break it in two with your');
      result.outcomes.push(getWeaponName(player.weapon_num) + '. Your weapon tingles!');
      result.outcomes.push('');
      result.outcomes.push('** ATTACK STRENGTH RAISED **');
      player.str += 1;
      result.autoContinue = true;
      break;

    case 'darkcloak':
      result.outcomes.push('A blazing fire warms your heart as well as your body');
      result.outcomes.push('in this fragrant roadhouse. Many a wary traveler has');
      result.outcomes.push('had the good fortune to find this cozy hostel, to');
      result.outcomes.push('escape the harsh reality of the dense forest for a');
      result.outcomes.push('few moments.');
      result.prompt = 'darkcloak';
      break;
  }

  savePlayer(nick, player);
  return result;
}

export function processScrollRescue(nick, location) {
  const player = loadPlayer(nick);
  if (!player) return null;

  const locations = ['c', 'f', 'g', 'p', 'd'];
  const correctLocation = locations[random(0, locations.length - 1)];
  const success = location.toLowerCase() === correctLocation;

  const outcomes = [];

  outcomes.push('');
  outcomes.push('****************************************');
  outcomes.push('             THE RESCUE');
  outcomes.push('****************************************');
  outcomes.push('');

  if (success) {
    const xpGain = 20 * player.level;
    const gemsGain = 3 * player.level;
    player.xp = clamp(player.xp + xpGain, 0, config.maxXP);
    player.gems = clamp(player.gems + gemsGain, 0, 999999);
    outcomes.push('THE DOOR SWINGS WIDE OPEN!');
    outcomes.push('');
    outcomes.push('"You\'ve come for me!" shouts an overjoyed girl.');
    outcomes.push('');
    outcomes.push('You breath a sigh of relief.');
    outcomes.push('');
    outcomes.push('The girl eyes you dreamily...');
    outcomes.push('');
    outcomes.push('YOU GET ' + xpGain + ' EXPERIENCE!');
    outcomes.push('YOU GET ' + gemsGain + ' GEMS!');
    savePlayer(nick, player);
  } else {
    const hpLoss = Math.floor(player.maxhp * 0.25);
    const newHp = Math.max(1, player.hp - hpLoss);
    player.hp = newHp;
    outcomes.push('THE DOOR SWINGS WIDE OPEN!');
    outcomes.push('');
    outcomes.push('The room is empty, save a giant chest in the middle.');
    outcomes.push('');
    outcomes.push('"Help me! I\'m in here!" a voice pleads from the chest.');
    outcomes.push('');
    outcomes.push('You open the chest...');
    outcomes.push('');
    outcomes.push('"MY GOD! A HALF HUMAN HALF TROLL WOMAN! NO!"');
    outcomes.push('');
    outcomes.push('You are violated by this hairy beast...');
    outcomes.push('');
    outcomes.push('YOU WEAKLY CRAWL AWAY...');
    outcomes.push('');
    outcomes.push('You lose ' + hpLoss + ' HP!');
    savePlayer(nick, player);
  }

  return {
    event: 'Rescue',
    outcomes: outcomes,
    autoContinue: true
  };
}

export function decrementFights(nick) {
  const player = loadPlayer(nick);
  if (!player) return false;
  player.fights = clamp(player.fights - 1, 0, config.maxFightsPerDay);
  savePlayer(nick, player);
  return true;
}

export function fightMonster(nick) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  if (player.hp <= 0) {
    return { error: 'You are dead! You need to rest at the Inn.' };
  }
  
  const monster = getRandomMonster(player.level);
  
  savePlayer(nick, player);
  
  return {
    encounter: true,
    monster: {
      name: monster.name,
      weapon: monster.weapon,
      hp: monster.hp,
      maxhp: monster.maxhp,
      str: monster.str,
      gold: monster.gold,
      xp: monster.xp
    },
    playerHp: player.hp,
    fightsLeft: player.fights
  };
}

export function attackMonster(nick, currentMonsterHp, monsterStr, monsterMaxHp) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  const weaponAttack = getWeaponAttack(player.weapon_num);
  const baseDamage = random(1, player.str);
  let damage = baseDamage + weaponAttack;
  
  const isPowerMove = random(1, 100) >= 90;
  if (isPowerMove) {
    const multiplier = randomFloat(1.5, 3.0);
    damage = Math.floor(damage * multiplier);
  }
  
  const newMonsterHp = currentMonsterHp - damage;
  
  if (newMonsterHp <= 0) {
    return {
      victory: true,
      damage,
      powerMove: isPowerMove,
      monsterHp: 0
    };
  }
  
  const armorDefense = getArmorDefense(player.armor_num);
  let monsterDamage = random(1, monsterStr) - armorDefense;
  
  if (monsterDamage <= 0) {
    monsterDamage = 1;
  }
  
  const newPlayerHp = player.hp - monsterDamage;
  player.hp = newPlayerHp;
  
  if (newPlayerHp <= 0) {
    savePlayer(nick, player);
    return {
      defeat: true,
      damage,
      powerMove: isPowerMove,
      monsterHp: newMonsterHp,
      playerHp: 0
    };
  }
  
  savePlayer(nick, player);
  return {
    damage,
    powerMove: isPowerMove,
    monsterHp: newMonsterHp,
    playerHp: newPlayerHp,
    monsterDamage
  };
}

export function runFromMonster(nick) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  const escapeChance = random(1, 100);
  
  if (escapeChance <= 25) {
    return { escape: false, message: 'You failed to escape!' };
  }
  
  return { escape: true, message: 'You escaped!' };
}

export function winMonsterFight(nick, monster) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  const findGem = random(1, 100) >= 90;
  
  player.gold = clamp(player.gold + monster.gold, 0, config.maxGold);
  player.xp = clamp(player.xp + monster.xp, 0, config.maxXP);
  
  if (findGem) {
    player.gems++;
  }
  
  savePlayer(nick, player);
  
  const levelUp = checkLevelUp(nick);
  
  return {
    gold: monster.gold,
    xp: monster.xp,
    gem: findGem,
    levelUp
  };
}

export function loseMonsterFight(nick, monsterGold, monsterName) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  const lostGold = Math.floor(player.gold * 0.1);
  player.gold -= lostGold;
  player.dead = 1;
  player.dead_until = Date.now() + (10 * 60 * 1000);
  player.killed_by = 'Monster: ' + (monsterName || 'Unknown');
  player.hp = 1;
  
  savePlayer(nick, player);
  
  return { lostGold };
}

export function buyWeapon(nick, weaponNum) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  if (weaponNum < 1 || weaponNum > weapons.length) {
    return { error: 'Invalid weapon number!' };
  }
  
  if (player.weapon_num > 1) {
    return { error: 'You must sell your current weapon first!' };
  }
  
  const weapon = weapons[weaponNum - 1];
  
  if (player.str < weapon.strReq) {
    return { error: `You need ${weapon.strReq} strength to wield ${weapon.name}!` };
  }
  
  if (player.gold < weapon.cost) {
    return { error: `Not enough gold! Cost: ${formatNumber(weapon.cost)}, You have: ${formatNumber(player.gold)}` };
  }
  
  player.gold -= weapon.cost;
  player.weapon_num = weaponNum;
  
  savePlayer(nick, player);
  
  return { success: true, weapon: weapon.name, cost: weapon.cost };
}

export function sellWeapon(nick, weaponNum) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  if (weaponNum < 1 || weaponNum > weapons.length) {
    return { error: 'Invalid weapon number!' };
  }
  
  if (weaponNum === 1) {
    return { error: 'You cannot sell your fists!' };
  }
  
  if (player.weapon_num !== weaponNum) {
    return { error: 'You can only sell weapons you have equipped!' };
  }
  
  const weapon = weapons[weaponNum - 1];
  const sellPrice = Math.floor(weapon.cost * 0.5);
  
  player.gold += sellPrice;
  player.weapon_num = 1;
  
  savePlayer(nick, player);
  
  return { success: true, weapon: weapon.name, sellPrice };
}

export function buyArmor(nick, armorNum) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  if (armorNum < 1 || armorNum > armors.length) {
    return { error: 'Invalid armor number!' };
  }
  
  if (player.armor_num > 1) {
    return { error: 'You must sell your current armor first!' };
  }
  
  const armor = armors[armorNum - 1];
  
  if (player.str < armor.strReq) {
    return { error: `You need ${armor.strReq} strength to wear ${armor.name}!` };
  }
  
  if (player.gold < armor.cost) {
    return { error: `Not enough gold! Cost: ${formatNumber(armor.cost)}, You have: ${formatNumber(player.gold)}` };
  }
  
  player.gold -= armor.cost;
  player.armor_num = armorNum;
  
  savePlayer(nick, player);
  
  return { success: true, armor: armor.name, cost: armor.cost };
}

export function sellArmor(nick, armorNum) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  if (armorNum < 1 || armorNum > armors.length) {
    return { error: 'Invalid armor number!' };
  }
  
  if (armorNum === 1) {
    return { error: 'You cannot sell your coat!' };
  }
  
  if (player.armor_num !== armorNum) {
    return { error: 'You can only sell armor you have equipped!' };
  }
  
  const armor = armors[armorNum - 1];
  const sellPrice = Math.floor(armor.cost * 0.5);
  
  player.gold += sellPrice;
  player.armor_num = 1;
  
  savePlayer(nick, player);
  
  return { success: true, armor: armor.name, sellPrice };
}

export function depositBank(nick, amount) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  if (!Number.isInteger(amount) || amount <= 0 || amount > player.gold) {
    return { error: 'Invalid amount or insufficient funds!' };
  }
  
  if (player.gold < 0) {
    player.gold = 0;
  }
  
  player.gold -= amount;
  player.bank += amount;
  
  savePlayer(nick, player);
  
  return { success: true, amount, newBalance: player.bank };
}

export function withdrawBank(nick, amount) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  if (!Number.isInteger(amount) || amount <= 0 || amount > player.bank) {
    return { error: 'Invalid amount or insufficient funds!' };
  }
  
  if (player.bank < 0) {
    player.bank = 0;
  }
  
  player.bank -= amount;
  player.gold += amount;
  
  savePlayer(nick, player);
  
  return { success: true, amount, newBalance: player.bank };
}

export function robBank(nick) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };

  if (player.fairies <= 0) {
    return { error: 'You need a fairy to rob the bank!' };
  }

  const stealTable = [500, 999, 4000, 7992, 13500, 26973, 32000, 63936, 62500, 124875, 108000, 215784, 171500, 342657, 256000, 511488, 364500, 728271, 500000, 999000, 665500, 1329669, 864000, 1726272];
  const levelIndex = Math.min(Math.max(player.level - 1, 0) * 2, stealTable.length - 2);
  const minStolen = stealTable[levelIndex];
  const maxStolen = stealTable[levelIndex + 1];
  const stolen = Math.floor(Math.random() * (maxStolen - minStolen + 1)) + minStolen;

  player.fairies = Math.max(0, player.fairies - 1);
  player.gold = clamp(player.gold + stolen, 0, config.maxGold);

  savePlayer(nick, player);

  return { success: true, stolen, total: player.gold };
}

export function healAtHealer(nick) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };

  const cost = player.level * 5;

  if (player.hp >= player.maxhp) {
    return { error: 'You are already at full health!' };
  }

  if (player.gold < cost) {
    return { error: `Not enough gold! Cost: ${cost}, You have: ${player.gold}` };
  }

  player.gold -= cost;
  player.hp = player.maxhp;

  if (player.sex === 0) {
    player.charm = clamp(player.charm + 1, 1, 100);
  }

  savePlayer(nick, player);

  return { success: true, cost, hp: player.hp, charmGain: player.sex === 0 };
}

export function stayAtInn(nick) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  const cost = 400;
  
  if (player.gold < cost) {
    return { error: `Not enough gold! Cost: ${cost}, You have: ${player.gold}` };
  }
  
  player.gold -= cost;
  player.hp = player.maxhp;
  player.stayinn = 1;
  
  savePlayer(nick, player);
  
  return { success: true, cost, message: 'You stay the night, fully healed and safe from attacks!' };
}

export function leaveInn(nick) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  player.stayinn = 0;
  savePlayer(nick, player);
  
  return { success: true };
}

let cachedPlayerList = null;
let playerListCacheTime = 0;
const PLAYER_LIST_CACHE_MS = 5000;

export function getPlayerList() {
  const now = Date.now();
  if (cachedPlayerList && (now - playerListCacheTime) < PLAYER_LIST_CACHE_MS) {
    return cachedPlayerList;
  }
  
  const players = getAllPlayers();
  cachedPlayerList = players
    .filter(p => p.dead === 0)
    .sort((a, b) => b.level - a.level || b.xp - b.xp)
    .slice(0, 50);
  playerListCacheTime = now;
  return cachedPlayerList;
}

export function invalidatePlayerListCache() {
  cachedPlayerList = null;
}

export function getPlayerByName(name) {
  return loadPlayer(name);
}

export function addExperience(nick, xp) {
  const player = loadPlayer(nick);
  if (!player) return false;
  
  player.xp = clamp(player.xp + xp, 0, config.maxXP);
  savePlayer(nick, player);
  return true;
}

export function setPlayerHp(nick, hp) {
  const player = loadPlayer(nick);
  if (!player) return false;
  
  player.hp = clamp(hp, 0, player.maxhp);
  savePlayer(nick, player);
  return true;
}

export function isPlayerDead(nick) {
  const player = loadPlayer(nick);
  if (!player) return false;
  
  const now = Date.now();
  
  if (player.dead === 1 && player.dead_until && now < player.dead_until) {
    return { dead: true, remaining: player.dead_until - now };
  }
  
  if (player.dead === 1 && (!player.dead_until || now >= player.dead_until)) {
    player.dead = 0;
    player.dead_until = null;
    savePlayer(nick, player);
  }
  
  return false;
}

export function killPlayer(nick, minutes, killedBy = 'Unknown', monsterGold = 0) {
  const player = loadPlayer(nick);
  if (!player) return { dead: false, lostGold: 0 };
  
  const lostGold = Math.floor(player.gold * 0.1);
  player.gold -= lostGold;
  player.dead = 1;
  player.dead_until = Date.now() + (minutes * 60 * 1000);
  player.killed_by = killedBy;
  player.hp = 1;
  savePlayer(nick, player);
  return { dead: true, lostGold };
}

export function resurrectPlayer(nick) {
  const player = loadPlayer(nick);
  if (!player) return false;
  
  if (player.dead === 1) {
    player.dead = 0;
    player.dead_until = null;
    player.hp = player.maxhp;
    player.killed_by = '';
    savePlayer(nick, player);
    console.log('[RESURRECT] ' + player.name + ' has been resurrected');
  }
  return true;
}

export function incrementSeenMaster(nick) {
  const player = loadPlayer(nick);
  if (!player) return false;

  player.seen_master = (player.seen_master || 0) + 1;

  if (!player.training_needed) player.training_needed = 0;
  player.training_needed--;

  const result = {
    seen_master: player.seen_master,
    training_needed: player.training_needed
  };

  if (player.training_needed <= 0) {
    player.training_needed = 3;

    player.skill_charges_max = (player.skill_charges_max || 0) + 1;
    player.skill_charges_active = player.skill_charges_max;

    const useField = ['usesd', 'usesm', 'usest'][player.class] || 'usesd';
    player[useField] = (player[useField] || 0) + 1;
    result.skillRaised = true;
    result.currentUses = player.skill_charges_max;
  } else {
    result.lessonsRemaining = player.training_needed;
  }

  savePlayer(nick, player);
  return result;
}

export function addGold(nick, amount) {
  const player = loadPlayer(nick);
  if (!player) return false;
  
  player.gold = clamp(player.gold + amount, 0, config.maxGold);
  savePlayer(nick, player);
  return true;
}

export function takeGold(nick, amount) {
  const player = loadPlayer(nick);
  if (!player) return false;
  
  player.gold = clamp(player.gold - amount, 0, config.maxGold);
  savePlayer(nick, player);
  return true;
}

export { weapons, armors, classNames, masters, getWeaponAttack, getArmorDefense, formatNumber };


