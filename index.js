import irc from 'irc';
import { config } from './config.js';
import * as game from './game.js';
import { playerExists, loadPlayer, savePlayer, getAllPlayers, setPlayerOnline, setPlayerOffline, isPlayerOnline, queueOfflineMessage, getOfflineMessages, clearOfflineMessages, findPlayerByIrcNick } from './player.js';

const PLAYER_STATES = {
  NONE: 'none',
  LOGIN: 'login',
  CREATE_NAME: 'create_name',
  CREATE_CLASS: 'create_class',
  CREATE_SEX: 'create_sex',
  MAIN: 'main',
  FOREST: 'forest',
  FOREST_EVENT: 'forest_event',
  FIGHT: 'fight',
  WEAPONS: 'weapons',
  WEAPONS_BUY: 'weapons_buy',
  WEAPONS_SELL: 'weapons_sell',
  CONFIRM_WEAPON_SELL: 'confirm_weapon_sell',
  CONFIRM_WEAPON_BUY: 'confirm_weapon_buy',
  ARMOR: 'armor',
  ARMOR_BUY: 'armor_buy',
  ARMOR_SELL: 'armor_sell',
  CONFIRM_ARMOR_SELL: 'confirm_armor_sell',
  CONFIRM_ARMOR_BUY: 'confirm_armor_buy',
  BANK: 'bank',
  BANK_DEPOSIT: 'bank_deposit',
  BANK_WITHDRAW: 'bank_withdraw',
  HEALER: 'healer',
  INN: 'inn',
  TAVERN: 'tavern',
  PEOPLE: 'people',
  NEWS: 'news',
  STATS: 'stats',
  CASINO: 'casino',
  TRAINING: 'training',
  TRAINING_QUESTION: 'training_question',
  FIGHT_MASTER: 'fight_master',
  SLAUGHTER: 'slaughter',
  FIGHT_PLAYER: 'fight_player',
  DWARF_GAMES: 'dwarf_games',
  DWARF_BETTING: 'dwarf_betting',
  FOREST_HUT: 'forest_hut',
  FOREST_HUT_KNOCK: 'forest_hut_knock',
  FOREST_HUT_GUESS: 'forest_hut_guess',
  SKILL_MENU: 'skill_menu',
  CONFIRM_LEAVE_DWARF: 'confirm_leave_dwarf',
  CONFIRM_LEAVE_HUT: 'confirm_leave_hut'
};

const userStates = new Map();
const nickToCharacter = new Map();
const characterToNick = new Map();

// ANSI colors for console
const C = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function g(val) { return '' + val; }
function r(val) { return '' + val; }
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function w(val) { return '' + val; }

const FLOOD_DELAY = 1000;

const messageQueue = new Map();
const queueTimeouts = new Map();
const queueVersion = new Map();

function getPlayerNick(characterName) {
  const lowerName = characterName.toLowerCase();
  if (characterToNick.has(lowerName)) {
    return characterToNick.get(lowerName);
  }
  const allPlayers = getAllPlayers();
  for (const p of allPlayers) {
    if (p.name && p.name.toLowerCase() === lowerName) {
      characterToNick.set(lowerName, p.nick);
      return p.nick;
    }
  }
  return null;
}

function getState(nick) {
  if (!userStates.has(nick)) {
    userStates.set(nick, {
      state: PLAYER_STATES.NONE,
      temp: {},
      currentMonster: null,
      displayMode: false,
      pendingCommand: null,
      pendingArgs: null,
      lastFightState: null
    });
  }
  return userStates.get(nick);
}

function setState(nick, state, temp) {
  const userState = getState(nick);
  userState.state = state;
  if (temp !== undefined) {
    userState.temp = temp;
  }
}

function clearState(nick) {
  userStates.delete(nick);
  messageQueue.delete(nick);
}

function sendImmediate(nick, message) {
  client.say(nick, message);
}

function queueMessage(nick, message) {
  if (!messageQueue.has(nick)) {
    messageQueue.set(nick, []);
    queueVersion.set(nick, (queueVersion.get(nick) || 0) + 1);
  }
  const queue = messageQueue.get(nick);
  queue.push(message);
  
  if (queue.length === 1) {
    const timeout = setTimeout(() => processQueue(nick), FLOOD_DELAY);
    queueTimeouts.set(nick, timeout);
  }
}

function processQueue(nick) {
  queueTimeouts.delete(nick);
  const version = queueVersion.get(nick);
  const queue = messageQueue.get(nick);
  if (!queue || queue.length === 0 || queueVersion.get(nick) !== version) {
    messageQueue.delete(nick);
    const userState = getState(nick);
    if (userState.pendingCommand) {
      const cmd = userState.pendingCommand;
      const args = userState.pendingArgs || [];
      userState.pendingCommand = null;
      userState.pendingArgs = null;
      userState.displayMode = false;
      handleCommand(nick, cmd, args);
    }
    return;
  }
  
  const message = queue.shift();
  if (queueVersion.get(nick) !== version) {
    return;
  }
  
  sendImmediate(nick, message);
  
  if (queue.length > 0) {
    const timeout = setTimeout(() => processQueue(nick), FLOOD_DELAY);
    queueTimeouts.set(nick, timeout);
  } else {
    messageQueue.delete(nick);
    const userState = getState(nick);
    if (userState.pendingCommand) {
      const cmd = userState.pendingCommand;
      const args = userState.pendingArgs || [];
      userState.pendingCommand = null;
      userState.pendingArgs = null;
      userState.displayMode = false;
      handleCommand(nick, cmd, args);
    } else {
      userState.displayMode = false;
    }
  }
}

function flushQueue(nick) {
  if (queueTimeouts.has(nick)) {
    clearTimeout(queueTimeouts.get(nick));
    queueTimeouts.delete(nick);
  }
  const version = queueVersion.get(nick);
  const queue = messageQueue.get(nick);
  if (queue && queueVersion.get(nick) === version) {
    queue.forEach(msg => client.say(nick, msg));
  }
  messageQueue.delete(nick);
}

function sendNotice(nick, message) {
  if (Array.isArray(message)) {
    message.forEach(line => queueMessage(nick, line));
  } else {
    const lines = message.split('\n');
    lines.forEach(line => queueMessage(nick, line));
  }
}

function clearMessageQueue(nick) {
  if (queueTimeouts.has(nick)) {
    clearTimeout(queueTimeouts.get(nick));
    queueTimeouts.delete(nick);
  }
  if (messageQueue.has(nick)) {
    queueVersion.set(nick, (queueVersion.get(nick) || 0) + 1);
    messageQueue.delete(nick);
  }
}

function sendLines(nick, lines) {
  if (lines.length > 0) {
    if (!queueTimeouts.has(nick)) {
      clearMessageQueue(nick);
    }
  }
  lines.forEach(line => queueMessage(nick, line));
}

function sendPrompt(nick, message) {
  sendImmediate(nick, message);
}

function border() {
  return '-----------------------------';
}

function statLine(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return 'NO STATS!';
  return stats.name + ' LVL' + stats.level + ' HP: [' + stats.hp + '/' + stats.maxhp + '] Gold: [' + game.formatNumber(stats.gold || 0) + '] Gems: [' + (stats.gems || 0) + '] Fights Left: [' + (stats.fights || 0) + '] XP: [' + game.formatNumber(stats.xp || 0) + '/' + game.formatNumber(stats.nextXp || 0) + ']';
}

function buildMainMenuLines(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return [];
  
  return [
    '',
    r('  Legend of the Red Dragon - Town Square'),
    '  Use ? or r if you\'re not seeing messages and q,r to stop msg',
    border(),
    '  The streets are crowded, it is difficult to',
    '  push your way through the mob....',
    '',
    w('(F)orest                   (S)laughter other players'),
    w('(K)ing Arthurs Weapons     (A)bduls Armour'),
    w('(H)ealers Hut              (V)iew your stats'),
    w('(I)nn                      (T)urgons Warrior Training'),
    w('(Y)e Old Bank              (L)ist Warriors'),
    w('(W)rite Mail              (D)aily News'),
    w('(C)onjugality List         (O)ther Places'),
    r('(X)pert Mode               (M)ake Announcement'),
    w('(P)eople Online            (Q)uit to Fields'),
    '',
    statLine(nick),
    ''
  ];
}

function showMainMenu(nick) {
  sendLines(nick, buildMainMenuLines(nick));
  setState(nick, PLAYER_STATES.MAIN);
}

function showForest(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  const lines = [
    '',
    '  Legend of the Red Dragon - Forest',
    border(),
    '  The murky forest stands before you - a giant maw of',
    '  gloomy darkness ever beckoning.',
    '',
    w('(L)ook for something to kill'),
    w('(H)ealers hut'),
    w('(S)tats'),
    w('(R)eturn to town'),
    '',
    statLine(nick),
    r('The Forest') + w('  (L,H,S,R,Q) (? for menu)'),
    ''
  ];
  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.FOREST);
}

function showStats(nick) {
  sendNotice(nick, statLine(nick));
}

function showFullStats(nick) {
  const player = loadPlayer(nick);
  if (!player) return;

  const stats = game.getPlayerStats(nick);
  const xpBar = '='.repeat(Math.floor(stats.xpPercent / 5)) + '-'.repeat(20 - Math.floor(stats.xpPercent / 5));
  
  const classNames = ['Death Knight', 'Mystic', 'Thief'];
  const className = classNames[player.class] || 'Warrior';
  
  const lines = [
    '',
    stats.name + r("'s Stats..."),
    border(),
    'Experience   : ' + g(game.formatNumber(stats.xp)),
    'Level        : ' + g(stats.level) + '   Class       : ' + g(className),
    'HitPoints   : (' + g(stats.hp) + ' of ' + g(stats.maxhp) + ')',
    'Forest Fights: ' + g(stats.fights) + '   PlayerFights: ' + g(stats.pfights),
    'Gold In Hand : ' + g(game.formatNumber(stats.gold)) + '   Gold In Bank: ' + g(game.formatNumber(stats.bank)),
    'Weapon       : ' + g(stats.weapon) + '   Atk Strength: ' + g(stats.str),
    'Armour       : ' + g(stats.armor) + '   Def Strength: ' + g(stats.def),
    'Charm        : ' + g(stats.charm) + '   Gems        : ' + g(stats.gems),
    '',
    'XP to next: ' + g(game.formatNumber(stats.nextXp)) + ' [' + g(xpBar) + '] ' + g(stats.xpPercent + '%'),
    ''
  ];
  
  if (player.skill_charges_max > 0) {
    const timers = getSkillChargeTimers(player);
    if (timers.length > 0) {
      lines.push('Skill Charges: ' + player.skill_charges_active + '/' + player.skill_charges_max + ' (refreshing: ' + timers.join(', ') + ')');
    } else {
      lines.push('Skill Charges: ' + player.skill_charges_active + '/' + player.skill_charges_max);
    }
  }
  
  lines.push('');
  lines.push('(R)eturn to town');
  lines.push('');
  
  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.STATS);
}

function showWeapons(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  const lines = [
    '',
    '  King Arthurs Weapons',
    border()
  ];

  game.weapons.forEach((w, i) => {
    const equipped = i + 1 === stats.weapon_num ? ' [EQUIPPED]' : '';
    const strReq = stats.str >= w.strReq ? '' : ' ' + r('[STR:' + w.strReq + ']');
    lines.push('(' + g(i + 1) + ') ' + w.name + equipped + strReq);
    lines.push('    Cost:' + g(game.formatNumber(w.cost)) + ' Gold   Atk:' + g(w.attack));
  });

  lines.push(border());
  lines.push('Your gold: ' + g(game.formatNumber(stats.gold)));
  lines.push(r('King Arthurs Weapons') + w('  (B,S,Q) (? for menu)'));
  lines.push('');
  
  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.WEAPONS);
}

function showArmor(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  const lines = [
    '',
    '  Abduls Armour',
    border()
  ];

  game.armors.forEach((a, i) => {
    const equipped = i + 1 === stats.armor_num ? ' [EQUIPPED]' : '';
    const strReq = stats.str >= a.strReq ? '' : ' ' + r('[STR:' + a.strReq + ']');
    lines.push('(' + g(i + 1) + ') ' + a.name + equipped + strReq);
    lines.push('    Cost:' + g(game.formatNumber(a.cost)) + ' Gold   Def:' + g(a.defense));
  });

  lines.push(border());
  lines.push('Your gold: ' + g(game.formatNumber(stats.gold)));
  lines.push(r('Abduls Armour') + w('  (B,S,Q) (? for menu)'));
  lines.push('');
  
  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.ARMOR);
}

function showBank(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  sendLines(nick, [
    '',
    '  Ye Olde Bank',
    border(),
    '',
    '  Gold in hand: ' + g(game.formatNumber(stats.gold)),
    '  Gold in bank: ' + g(game.formatNumber(stats.bank)),
    '',
    border(),
    '  The banker smiles at you. "What can I do for you?"',
    '',
    w('(D)eposit Gold'),
    w('(W)ithdraw Gold'),
    w('(R)eturn to town'),
    '',
    statLine(nick),
    r('Ye Olde Bank') + w('  (D,W,R,Q) (? for menu)'),
    ''
  ]);
  setState(nick, PLAYER_STATES.BANK);
}

function showHealer(nick) {
  const stats = game.getPlayerStats(nick);
  console.log('showHealer: stats=' + JSON.stringify(stats));
  if (!stats) return;

  const cost = stats.level * 5;
  
  sendLines(nick, [
    '',
    '  Healers Hut',
    border(),
    '',
    '  The healer looks at you knowingly.',
    '',
    '  Your HP: (' + g(stats.hp) + ' of ' + g(stats.maxhp) + ')',
    '  Heal cost: ' + g(cost) + ' gold',
    '',
    '  Your gold: ' + g(game.formatNumber(stats.gold)),
    '',
    border(),
    ''
  ]);

  if (stats.hp < stats.maxhp) {
    sendLines(nick, [
      w('(H)eal yourself'),
      ''
    ]);
  } else {
    sendLines(nick, [
      '  You are already at full health.',
      ''
    ]);
  }

  sendLines(nick, [
    w('(R)eturn to town'),
    '',
    statLine(nick),
    r('Healers Hut') + w('  (H,R,Q) (? for menu) '),
    ''
  ]);
  setState(nick, PLAYER_STATES.HEALER);
}

function showInn(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  const lines = [
    '',
    '  The Inn',
    border(),
    ''
  ];

  if (stats.stayinn) {
    lines.push('  You are currently staying at the inn.');
    lines.push('  You are safe from most attacks.');
    lines.push('');
    lines.push(w('(L)eave the inn'));
  } else {
    lines.push('  Room rate: ' + g('400') + ' gold/night');
    lines.push('');
    lines.push(w('(S)tay the night'));
  }
  
  lines.push(w('(R)eturn to town'));
  lines.push('');
  lines.push(statLine(nick));
  lines.push(r('The Inn') + w('  (S,L,R,Q) (? for menu)'));
  lines.push('');
  
  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.INN);
}

function showTavern(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  sendLines(nick, [
    '',
    '  The Dark Cloak Tavern',
    border(),
    '  A shadowy establishment filled with mercenaries.',
    '',
    '  The barkeep, Chance, eyes you suspiciously.',
    '',
    w('(T)alk to Chance'),
    w('(G)amble with locals'),
    w('(R)eturn to town'),
    '',
    statLine(nick),
    r('The Dark Cloak Tavern') + w('  (T,G,R,Q) (? for menu)'),
    ''
  ]);
  setState(nick, PLAYER_STATES.TAVERN);
}

function showPeople(nick) {
  const allPlayers = getAllPlayers();
  
  allPlayers.forEach((p) => {
    if (p.dead === 1 && p.dead_until && Date.now() >= p.dead_until) {
      game.resurrectPlayer(p.nick);
    }
  });
  
  const updatedPlayers = getAllPlayers();
  
  const lines = [
    '',
    r('  Warriors In The Realm Now'),
    border()
  ];

  if (updatedPlayers.length === 0) {
    lines.push('  No warriors currently online');
  } else {
    updatedPlayers.forEach((p, i) => {
      const lvl = p.level.toString().padStart(2, ' ');
      
      if (p.dead === 1) {
        const now = Date.now();
        const remaining = p.dead_until ? Math.max(0, p.dead_until - now) : 0;
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        const timeStr = mins + 'm ' + secs + 's remaining';
        const killedBy = p.killed_by || 'Unknown';
        lines.push(' ' + w(lvl) + ' ' + p.name + ' - Level ' + g(p.level) + ' ' + game.classNames[p.class] + ' ' + r('(DEAD) [' + killedBy + '] [' + timeStr + ']'));
      } else {
        const inn = p.stayinn ? ' [INN]' : '';
        lines.push(' ' + w(lvl) + ' ' + p.name + ' - Level ' + g(p.level) + ' ' + game.classNames[p.class] + inn);
      }
    });
  }
  
  lines.push(border());
  lines.push('  Total warriors: ' + g(updatedPlayers.length));
  lines.push('');
  lines.push(w('(R)eturn to town'));
  lines.push('');
  
  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.PEOPLE);
}

function showNews(nick) {
  sendLines(nick, [
    '',
    '  Daily News',
    border(),
    '',
    '  ' + g('A small girl was missing today.'),
    '  The town is in grief.',
    '  ' + g('Dragon sighting reported by a drunken old man.'),
    '',
    border(),
    ''
  ]);
  setState(nick, PLAYER_STATES.NEWS);
}

function showCasino(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  sendLines(nick, [
    '',
    '  Gambling Casino',
    border(),
    '',
    '  The casino is full of smoke and desperate faces.',
    '',
    '  Your gold: ' + g(game.formatNumber(stats.gold)),
    '  Minimum bet: ' + g('200') + ' - Maximum bet: ' + g('5000'),
    '',
    w('(B)lackjack'),
    w('(R)eturn to town'),
    '',
    statLine(nick),
    r('Gambling Casino') + w('  (B,R,Q) (? for menu)'),
    ''
  ]);
  setState(nick, PLAYER_STATES.CASINO);
}

function showTraining(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  const masterIndex = Math.min(stats.seen_master, game.masters.length - 1);
  const currentMaster = game.masters[masterIndex];

  sendLines(nick, [
    '',
    '  Turgons Warrior Training',
    border(),
    '',
    '  Your current Master: ' + g(currentMaster.name),
    '  ' + currentMaster.greeting,
    '',
    border(),
    '',
    '  Your Level: ' + g(stats.level),
    '',
    border(),
    ''
  ]);

  if (stats.level >= 12) {
    sendLines(nick, [
      '  You have reached the maximum level!',
      '  You are ready to fight the Red Dragon!',
      ''
    ]);
  } else {
    sendLines(nick, [
      '  Next level: ' + g(stats.level + 1),
      '  XP needed: ' + g(game.formatNumber(stats.nextXp - stats.xp)),
      ''
    ]);
  }

  sendLines(nick, [
    '',
    'Commands:',
    '  (Q)uestion master - Ask your master about training',
    '  (C)hallenge master - Fight your master',
    '(R)eturn to town',
    '',
    statLine(nick),
    r("Turgons Warrior Training") + w('  Q,C,R'),
    ''
  ]);
  setState(nick, PLAYER_STATES.TRAINING);
}

function showTrainingQuestion(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  const masterIndex = Math.min(stats.seen_master, game.masters.length - 1);
  const currentMaster = game.masters[masterIndex];

  sendLines(nick, [
    '',
    '  ' + currentMaster.name + ' says:',
    '',
    '  "' + currentMaster.greeting + '"',
    '',
    'You may (C)hallenge your master to a fight.',
    'If you win, you will gain experience!',
    'But be warned - if you lose, you will be severely injured!',
    '',
    '(R)eturn to training',
    ''
  ]);
  setState(nick, PLAYER_STATES.TRAINING_QUESTION);
}

function startMasterFight(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  const player = loadPlayer(nick);
  if (!player) return;

  const masterIndex = Math.min(stats.seen_master, game.masters.length - 1);
  const currentMaster = game.masters[masterIndex];

  const masterMonster = {
    name: currentMaster.name,
    weapon: currentMaster.weapon,
    hp: currentMaster.hp,
    maxhp: currentMaster.hp,
    str: currentMaster.str,
    attack: currentMaster.str
  };

  const userState = getState(nick);
  userState.currentMonster = masterMonster;

  const lines = [
    '',
    r('**MASTER FIGHT**'),
    'You have challenged ' + currentMaster.name + '!',
    '',
    'Master ' + currentMaster.name + ' wields a ' + currentMaster.weapon + '!',
    '',
    'Master HP: ' + g(currentMaster.hp),
    '',
    'Your move:',
    ''
  ];

  lines.push(statLine(nick));
  const skillText = getSkillMenuText(player);
  lines.push(w('(A)ttack ') + skillText + w('(R)un'));
  lines.push('');
  const skillKeys = { 0: 'D', 1: 'M', 2: 'T' };
  const hasSkill = player.skill_charges_max > 0 && player.skill_charges_active > 0;
  const helpKeys = hasSkill ? '(A,' + skillKeys[player.class] + ',R) (? for menu)' : '(A,R) (? for menu)';
  lines.push(r('Master Fight') + w('  ' + helpKeys));
  lines.push('');

  sendLines(nick, lines);
  {
    const us = getState(nick);
    us.lastFightState = PLAYER_STATES.FIGHT_MASTER;
  }
  setState(nick, PLAYER_STATES.FIGHT_MASTER);
}

function processMasterAttack(nick) {
  const userState = getState(nick);
  const monster = userState.currentMonster;

  if (!monster) {
    sendNotice(nick, 'No master to fight!');
    showTraining(nick);
    return;
  }

  const stats = game.getPlayerStats(nick);
  const weaponAttack = game.getWeaponAttack ? game.getWeaponAttack(stats.weapon_num) : 0;
  const damage = Math.floor(Math.random() * (stats.str + 1)) + weaponAttack;
  monster.hp = monster.hp - damage;

  const lines = [];
  lines.push('You hit ' + monster.name + ' for ' + g(damage) + ' damage!');

  if (monster.hp <= 0) {
    monster.hp = 0;
    const xpGain = Math.floor(monster.maxhp * 0.5);
    game.addExperience(nick, xpGain);
    const levelUp = game.checkLevelUp(nick);
    const skillResult = game.incrementSeenMaster(nick);
    
    lines.push(border());
    lines.push('You have defeated ' + monster.name + '!');
    lines.push('You gain ' + g(xpGain) + ' experience!');
    
    if (levelUp && levelUp.levelUp) {
      lines.push('');
      lines.push(r('********** LEVEL UP! **********'));
      lines.push('You are now level ' + g(levelUp.newLevel) + '!');
      lines.push('HP: ' + g(levelUp.gains.hp) + '  Str: ' + g(levelUp.gains.str) + '  Def: ' + g(levelUp.gains.def));
      lines.push(r('*******************************'));
    }
    
    if (skillResult && skillResult.skillRaised) {
      lines.push('');
      lines.push(r('** YOUR CLASS SKILL IS RAISED BY ONE! **'));
      lines.push('You now have ' + skillResult.currentUses + ' skill uses per reset.');
    } else if (skillResult && skillResult.lessonsRemaining !== undefined) {
      lines.push('');
      lines.push('You need ' + skillResult.lessonsRemaining + ' more lessons to raise skill uses.');
    }
    
    lines.push(border());
    lines.push('');
    
    userState.currentMonster = null;
    flushQueue(nick);
    sendLines(nick, lines);
    showTraining(nick);
    return;
  }

  const monsterDamage = Math.floor(Math.random() * (monster.str + 1)) + (monster.attack || 0);
  const armorDefense = game.getArmorDefense ? game.getArmorDefense(stats.armor_num) : 0;
  const actualDamage = Math.max(1, monsterDamage - armorDefense);
  const newPlayerHp = Math.max(0, stats.hp - actualDamage);

  lines.push(monster.name + ' hits you for ' + g(actualDamage) + ' damage!');

  if (newPlayerHp <= 0) {
    game.killPlayer(nick, 10, 'Master: ' + monster.name);
    
    lines.push(border());
    lines.push('You have been defeated by ' + monster.name + '!');
    lines.push('You are dead for 10 minutes!');
    border()
    lines.push('');
    
    userState.currentMonster = null;
    userState.state = PLAYER_STATES.NONE;
    sendLines(nick, lines);
    return;
  }

  game.setPlayerHp(nick, newPlayerHp);
  
  lines.push('');
  lines.push('HP: (' + g(newPlayerHp) + ' of ' + g(stats.maxhp) + ') - Master HP: (' + g(monster.hp) + ' of ' + g(monster.maxhp) + ')');
  lines.push('');
  lines.push(w('(A)ttack ') + getSkillMenuText(stats) + w('(R)un'));
  lines.push('');

  flushQueue(nick);
  sendLines(nick, lines);
}

function showHelp(nick) {
  sendLines(nick, [
    '',
    '  Legend of the Red Dragon - Help',
    border(),
    '',
    '  Welcome to LORD! Here are the basic commands:',
    '',
    '  ' + g('F') + ' - Enter the forest to fight monsters',
    '  ' + g('S') + ' - Slaughter (attack) other players',
    '  ' + g('K') + ' - Buy weapons at King Arthurs Weapons',
    '  ' + g('A') + ' - Buy armor at Abduls Armour',
    '  ' + g('H') + ' - Visit the Healers Hut',
    '  ' + g('V') + ' - View your character stats',
    '  ' + g('I') + ' - Stay at the Inn (safe from attacks)',
    '  ' + g('T') + ' - Visit Turgons Warrior Training',
    '  ' + g('Y') + ' - Go to Ye Olde Bank',
    '  ' + g('L') + ' - List all warriors',
    '  ' + g('D') + ' - Daily News',
    '  ' + g('P') + ' - See who is playing right now',
    '  ' + g('?') + ' - This help screen',
    '',
    '  Fight monsters to earn gold and experience!',
    '  Level up to get stronger and face tougher foes!',
    '  Buy better weapons and armor to increase your power!',
    '  Stay at the Inn to heal and be safe from attacks.',
    '  The ultimate goal: Slay the Red Dragon!',
    '',
    border(),
    ''
  ]);
}

function showSlaughter(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  const players = game.getPlayerList();
  const otherPlayers = players.filter(p => 
    p.name.toLowerCase() !== nick.toLowerCase() && 
    p.dead === 0 &&
    p.stayinn !== 1
  );

  const lines = [
    '',
    '  Slaughter Other Players',
    border(),
    ''
  ];

  if (otherPlayers.length === 0) {
    lines.push('  No other players available.');
    lines.push('');
  } else {
    otherPlayers.forEach((p, i) => {
      lines.push('(' + g(i + 1) + ') ' + p.name + ' - Lvl ' + g(p.level));
    });
    lines.push('');
  }

  lines.push('(R)eturn to town');
  lines.push('');
  
  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.SLAUGHTER);
}

function startPlayerFight(nick, targetIndex) {
  const players = game.getPlayerList();
  const onlinePlayers = players.filter(p => 
    p.name.toLowerCase() !== nick.toLowerCase() && 
    p.dead === 0 &&
    p.stayinn !== 1
  );

  if (targetIndex < 1 || targetIndex > onlinePlayers.length) {
    sendNotice(nick, 'Invalid player number!');
    showSlaughter(nick);
    return;
  }

  const target = onlinePlayers[targetIndex - 1];
  const player = loadPlayer(nick);
  const now = Date.now();
  
  console.log('[PFIGHTS] ' + nick + ' before fight - pfights: ' + player.pfights + ', timer: ' + player.pfights_timer);

  if (player.pfights_timer && now < player.pfights_timer) {
    const minutesLeft = Math.ceil((player.pfights_timer - now) / 60000);
    sendNotice(nick, 'No player fights left! Try again in ' + minutesLeft + ' minute(s).');
    showSlaughter(nick);
    return;
  }

  if (player.pfights <= 0) {
    player.pfights = 3;
    player.pfights_timer = now + (60 * 60 * 1000);
    savePlayer(nick, player);
    sendNotice(nick, 'You have ' + player.pfights + ' player fights now!');
  }

  player.pfights--;
  console.log('[PFIGHTS] ' + nick + ' after decrement - pfights: ' + player.pfights);
  if (player.pfights <= 0) {
    player.pfights_timer = now + (60 * 60 * 1000);
  }
  savePlayer(nick, player);
  console.log('[PFIGHTS] ' + nick + ' saved - pfights: ' + player.pfights);
  
  let timerMsg = '';
  if (player.pfights_timer) {
    const minsLeft = Math.ceil((player.pfights_timer - now) / 60000);
    timerMsg = ' Timer resets in ' + minsLeft + ' min.';
  }
  sendNotice(nick, 'You have ' + player.pfights + ' of 3 player fights remaining!' + timerMsg);

  if (target.stayinn) {
    sendNotice(nick, target.name + ' is safe at the Inn!');
    showSlaughter(nick);
    return;
  }

  const targetWeapon = game.weapons[target.weapon_num - 1]?.name || 'Fists';
   
  const fightMonster = {
    name: target.name,
    weapon: targetWeapon,
    hp: target.hp,
    maxhp: target.maxhp,
    str: target.str,
    attack: target.str,
    level: target.level,
    gold: Math.floor(target.gold * 0.1),
    isPlayer: true,
    attackerNick: nick
  };

  const userState = getState(nick);
  userState.currentMonster = fightMonster;

  const attackerChar = loadPlayer(nick);
  const targetNick = getPlayerNick(target.name);
  if (targetNick) {
    const warnMsg = 'WARNING! ' + (attackerChar?.name || nick) + ' is attacking you! Fight back by pressing S to enter slaughter and attack them!';
    console.log('[SLAUGHTER] -> ' + targetNick + ': ' + warnMsg);
    sendImmediate(targetNick, warnMsg);
  }

  const refreshedPlayer = checkAndRefreshSkills(nick);
   
  const lines = [
    '',
    r('**PLAYER FIGHT**'),
    'You attack ' + target.name + '!',
    '',
    target.name + ' wields ' + targetWeapon + '!',
    '',
    target.name + ' HP: (' + g(target.hp) + ' of ' + g(target.maxhp) + ')',
    ''
  ];
  
  lines.push(statLine(nick));
  const skillText = getSkillMenuText(refreshedPlayer);
  lines.push(w('(A)ttack ') + skillText + w('(R)un'));
  lines.push('');
  const skillKeys = { 0: 'D', 1: 'M', 2: 'T' };
  const hasSkill = refreshedPlayer.skill_charges_max > 0 && refreshedPlayer.skill_charges_active > 0;
  const helpKeys = hasSkill ? '(A,' + skillKeys[refreshedPlayer.class] + ',R) (? for menu)' : '(A,R) (? for menu)';
  lines.push(r('Player Fight') + w('  ' + helpKeys));
  lines.push('');

  sendLines(nick, lines);
  {
    const us = getState(nick);
    us.lastFightState = PLAYER_STATES.FIGHT_PLAYER;
  }
  setState(nick, PLAYER_STATES.FIGHT_PLAYER);
}

function processPlayerAttack(nick) {
  const userState = getState(nick);
  const monster = userState.currentMonster;

  if (!monster || !monster.isPlayer) {
    sendNotice(nick, 'No player to fight!');
    showMainMenu(nick);
    return;
  }

  const stats = game.getPlayerStats(nick);
  const weaponAttack = game.getWeaponAttack ? game.getWeaponAttack(stats.weapon_num) : 0;
  const damage = Math.floor(Math.random() * (stats.str + 1)) + weaponAttack;
  monster.hp = monster.hp - damage;

  const lines = [];
  lines.push('You hit ' + monster.name + ' for ' + g(damage) + ' damage!');

  if (monster.hp <= 0) {
    monster.hp = 0;
    
    const goldStolen = Math.floor(Math.random() * monster.gold) + 10;
    const player = loadPlayer(nick);
    const winnerChar = loadPlayer(nick);
    player.gold = Math.min(player.gold + goldStolen, config.maxGold);
    savePlayer(nick, player);

    const loserNick = getPlayerNick(monster.name);
    const targetPlayer = loserNick ? loadPlayer(loserNick) : null;
    if (targetPlayer) {
      targetPlayer.gold = Math.max(targetPlayer.gold - goldStolen, 0);
      targetPlayer.dead = 1;
      targetPlayer.dead_until = Date.now() + (10 * 60 * 1000);
      targetPlayer.killed_by = 'Player: ' + (winnerChar?.name || nick);
      targetPlayer.hp = 1;
      savePlayer(loserNick, targetPlayer);
    }
    
    lines.push(border());
    lines.push('You have defeated ' + monster.name + '!');
    lines.push('You steal ' + g(goldStolen) + ' gold!');
    lines.push(border());
    lines.push('');
    
    const loserChar = targetPlayer;
    
    console.log('[DEBUG WIN] monster.name=' + monster.name + ', loserNick=' + loserNick + ', loserChar=' + (loserChar ? loserChar.name : 'null'));
    
    if (loserNick && loserChar) {
      const loserMsg = 'SLAUGHTER RESULT: You were defeated by ' + (winnerChar?.name || nick) + '! They stole ' + goldStolen + ' gold. You now have ' + loserChar.gold + ' gold left.';
      console.log('[SLAUGHTER] -> ' + loserNick + ': ' + loserMsg);
      sendDirectNotice(loserNick, loserMsg);
    } else {
      console.log('[SLAUGHTER] Failed to send loser notice: loserNick=' + loserNick + ', loserChar=' + (loserChar ? 'exists' : 'null'));
    }
    
    const winnerNick = nick;
    const winnerMsg = 'SLAUGHTER RESULT: You defeated ' + monster.name + '! You stole ' + goldStolen + ' gold! You now have ' + winnerChar.gold + ' gold.';
    console.log('[SLAUGHTER] -> ' + winnerNick + ': ' + winnerMsg);
    sendDirectNotice(winnerNick, winnerMsg);
    
    userState.currentMonster = null;
    flushQueue(nick);
    sendLines(nick, lines);
    showMainMenu(nick);
    return;
  }

  const monsterDamage = Math.floor(Math.random() * (monster.str + 1)) + (monster.attack || 0);
  const armorDefense = game.getArmorDefense ? game.getArmorDefense(stats.armor_num) : 0;
  const actualDamage = Math.max(1, monsterDamage - armorDefense);
  const newPlayerHp = Math.max(0, stats.hp - actualDamage);

  lines.push(monster.name + ' hits you for ' + g(actualDamage) + ' damage!');

  if (newPlayerHp <= 0) {
    game.killPlayer(nick, 10, 'Player: ' + monster.name);
    
    lines.push(border());
    lines.push('You have been defeated by ' + monster.name + '!');
    lines.push('You are dead for 10 minutes!');
    lines.push(border());
    lines.push('');
    
    const victimChar = loadPlayer(nick);
    const attackerNick = getPlayerNick(monster.name);
    
    if (attackerNick) {
      const winMsg = 'You defeated ' + (victimChar?.name || nick) + '! They are dead for 10 minutes!';
      console.log('[SLAUGHTER] -> ' + attackerNick + ': ' + winMsg);
      sendDirectNotice(attackerNick, winMsg);
    } else {
      console.log('[SLAUGHTER] Failed to send winner notice: attackerNick=' + attackerNick + ', monster.name=' + monster.name);
    }
    
    userState.currentMonster = null;
    userState.state = PLAYER_STATES.NONE;
    sendLines(nick, lines);
    return;
  }

  game.setPlayerHp(nick, newPlayerHp);
  
  const player = loadPlayer(nick);
  lines.push('');
  lines.push('HP: (' + g(newPlayerHp) + ' of ' + g(stats.maxhp) + ') - ' + monster.name + ' HP: (' + g(monster.hp) + ' of ' + g(monster.maxhp) + ')');
  lines.push('');
  const skillText = getSkillMenuText(player);
  lines.push(w('(A)ttack ') + skillText + w('(R)un'));
  lines.push('');
  const skillKeys = { 0: 'D', 1: 'M', 2: 'T' };
  const hasSkill = player.skill_charges_max > 0 && player.skill_charges_active > 0;
  const helpKeys = hasSkill ? '(A,' + skillKeys[player.class] + ',R) (? for menu)' : '(A,R) (? for menu)';
  lines.push(r('Player Fight') + w('  ' + helpKeys));
  lines.push('');
 
  flushQueue(nick);
  sendLines(nick, lines);
}

function showLogin(nick) {
  console.log('[showLogin] nick=' + nick);
  let player = null;
  let playerNick = nick;
  
  if (playerExists(nick)) {
    console.log('[showLogin] playerExists=true');
    player = loadPlayer(nick);
    playerNick = nick;
  } else {
    console.log('[showLogin] playerExists=false, calling findPlayerByIrcNick');
    const found = findPlayerByIrcNick(nick);
    console.log('[showLogin] findPlayerByIrcNick result=' + JSON.stringify(found));
    if (found) {
      player = found.player;
      playerNick = found.nick;
    }
  }
  
  if (player) {
    console.log('[showLogin] player found: ' + player.name);
    
    const deadCheck = game.isPlayerDead(playerNick);
    if (deadCheck && deadCheck.dead) {
      const totalSeconds = Math.ceil(deadCheck.remaining / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const timeStr = minutes > 0 ? (seconds > 0 ? minutes + ' min ' + seconds + ' sec' : minutes + ' min') : seconds + ' sec';
      sendNotice(nick, 'You are dead! Wait ' + timeStr + ' before you can re-enter the town.');
      return;
    }
    
    player.irc_nick = nick;
    
    const now = Date.now();
    if (player.fights_timer && now >= player.fights_timer) {
      player.fights = 20;
      player.fights_timer = null;
    }
    
    if (player.pfights_timer && now >= player.pfights_timer) {
      player.pfights = 3;
      player.pfights_timer = null;
    }
    
    if (!player.skill_charge_timers) {
      player.skill_charge_timers = [];
    }
    
    if (player.skill_charges_max === undefined) {
      if (player.class === 0) {
        player.skill_charges_max = 1;
        player.skill_charges_active = 1;
      } else {
        player.skill_charges_max = 0;
        player.skill_charges_active = 0;
      }
    }
    
    if (player.skill_charges_active === undefined) {
      player.skill_charges_active = player.skill_charges_max;
    }
    
    if (player.skill_charge_timers && player.skill_charge_timers.length > 0) {
      for (let i = 0; i < player.skill_charge_timers.length; i++) {
        if (player.skill_charge_timers[i] && now >= player.skill_charge_timers[i]) {
          player.skill_charges_active++;
          player.skill_charge_timers[i] = null;
        }
      }
      if (player.skill_charges_active > player.skill_charges_max) {
        player.skill_charges_active = player.skill_charges_max;
      }
    }
    
    savePlayer(playerNick, player);
    nickToCharacter.set(nick, player.name);
    characterToNick.set(player.name.toLowerCase(), nick);
    setPlayerOnline(nick);
    
    const offlineMsgs = getOfflineMessages(playerNick);
    if (offlineMsgs.length > 0) {
      clearOfflineMessages(playerNick);
      const noticeLines = [
        '',
        '>>> You have ' + offlineMsgs.length + ' pending message(s)! <<<',
        ''
      ];
      offlineMsgs.forEach((msg, i) => {
        noticeLines.push((i + 1) + '. ' + msg.message);
      });
      noticeLines.push('---');
      noticeLines.push('');
      
      const mainMenuLines = buildMainMenuLines(playerNick);
      sendLines(nick, [...noticeLines, ...mainMenuLines]);
    } else {
      showMainMenu(nick);
    }
  } else {
    console.log('[showLogin] no player found, showing welcome');
    sendLines(nick, [
      '',
      '  Welcome to Legend of the Red Dragon!',
      border(),
      '',
      '  Hello ' + nick + '!',
      '',
      '  No character found for your nick.',
      '  Please create a new character.',
      '',
      w('(N)ew Character'),
      ''
    ]);
    setState(nick, PLAYER_STATES.LOGIN);
  }
}

function showCreateMenu(nick) {
  sendLines(nick, [
    '',
    '  Character Creation',
    border(),
    '',
    '  Enter your warrior name:',
    ''
  ]);
  setState(nick, PLAYER_STATES.CREATE_NAME);
}

function showClassSelect(nick) {
  sendLines(nick, [
    '',
    border(),
    '',
    '  Select your fighting style:',
    '',
    w('(K)ill with brute force - ') + g('DEATH KNIGHT'),
    '    Uses stamina to deliver twice the damage!',
    '',
    w('(D)efy the laws of magic - ') + g('MAGE'),
    '    Powerful, you can destroy with magic!',
    '',
    w('(L)ive by your wits - ') + g('THIEF'),
    '    Use stealth to steal from others!',
    ''
  ]);
  setState(nick, PLAYER_STATES.CREATE_CLASS);
}

function showSexSelect(nick) {
  sendLines(nick, [
    '',
    '  Select your gender:',
    '',
    w('(M)ale'),
    w('(F)emale'),
    ''
  ]);
  setState(nick, PLAYER_STATES.CREATE_SEX);
}

function startFight(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) {
    sendNotice(nick, 'Error loading player stats!');
    showForest(nick);
    return;
  }
  
  if (stats.fights <= 0) {
    sendNotice(nick, 'No forest fights left! Stay at the Inn to be safe.');
    showForest(nick);
    return;
  }
  
  if (stats.hp <= 0) {
    sendNotice(nick, 'You are dead! You need to rest at the Inn.');
    showForest(nick);
    return;
  }
  
  const eventChance = random(1, 100);
  if (eventChance <= 40) {
    const event = game.checkForestEvent(nick);
    if (event) {
      clearMessageQueue(nick);
      
      if (event.type === 'dwarf') {
        const lines = [
          '',
          border(),
          r('  EVENT: Dwarf Games'),
          border(),
          '',
          '  You stumble upon a group of dwarves gambling in the forest.',
          '',
          '  (R)eturn to Forest',
          ''
        ];
        const userState = getState(nick);
        userState.temp = { nextState: 'dwarf' };
        userState.displayMode = true;
        sendLines(nick, lines);
        setState(nick, PLAYER_STATES.FOREST_EVENT);
        return;
      }
      
      if (event.type === 'hut') {
        const lines = [
          '',
          border(),
          r('  EVENT: Forest Hut'),
          border(),
          '',
          '  While trekking through the forest, you come upon a small hut.',
          '',
          '  (R)eturn to Forest',
          ''
        ];
        const userState = getState(nick);
        userState.temp = { nextState: 'hut' };
        userState.displayMode = true;
        sendLines(nick, lines);
        setState(nick, PLAYER_STATES.FOREST_EVENT);
        return;
      }
      
      const lines = [
        '',
        border(),
        r('  EVENT: ' + event.event),
        border(),
        '',
        event.message,
        ''
      ];
      event.outcomes.forEach(outcome => {
        lines.push(outcome);
      });
      lines.push('');
      lines.push('(R)eturn to Forest');
      lines.push('');
      
      const userState = getState(nick);
      userState.temp = { eventOutcome: event };
      
      sendLines(nick, lines);
      setState(nick, PLAYER_STATES.FOREST_EVENT);
      return;
    }
  }
  
  game.decrementFights(nick);
  const result = game.fightMonster(nick);
  
  if (result.error) {
    sendNotice(nick, result.error);
    showForest(nick);
    return;
  }

  const userState = getState(nick);
  userState.currentMonster = result.monster;
  
  const first = Math.random() > 0.7;
  
  const lines = [
    '',
    r('**FIGHT**'),
    'You have encountered ' + result.monster.name + '!!',
    '',
    'It is wielding a ' + result.monster.weapon + '!',
    '',
    'Your move.',
    ''
  ];

  if (first) {
    lines.push('Your skill allows you to get the first strike.');
  } else {
    lines.push('The enemy surprised you!');
  }
  
  lines.push('');
  lines.push(statLine(nick));
  
  const player = loadPlayer(nick);
  const skillText = getSkillMenuText(player);
  lines.push(w('(A)ttack ') + skillText + w(' (S)tats (R)un'));
  lines.push('');
  lines.push(r('The Forest') + w('  (A,R,Q) (? for menu)'));
  
  sendLines(nick, lines);
  {
    const us = getState(nick);
    us.lastFightState = PLAYER_STATES.FIGHT;
  }
  setState(nick, PLAYER_STATES.FIGHT);
}

function processAttack(nick) {
  const userState = getState(nick);
  const monster = userState.currentMonster;
  
  if (!monster) {
    sendNotice(nick, 'No monster to fight!');
    showForest(nick);
    return;
  }
  
  const result = game.attackMonster(nick, monster.hp, monster.str, monster.maxhp);
  
  if (result.error) {
    sendNotice(nick, result.error);
    return;
  }
  
  const lines = [];
  
  if (result.powerMove) {
    lines.push(r('**POWER MOVE**'));
    lines.push('');
  }
  
  lines.push('You hit ' + monster.name + ' for ' + g(result.damage) + ' damage!');
  
  if (result.victory) {
    const reward = game.winMonsterFight(nick, monster);
    
    const victoryMsg = 'Killed ' + monster.name + '! Got ' + g(game.formatNumber(reward.gold)) + ' gold + ' + g(reward.xp) + ' XP' + (reward.gem ? ' +GEM' : '');
    sendImmediate(nick, victoryMsg);
    
    if (reward.levelUp && reward.levelUp.levelUp) {
      sendImmediate(nick, r('*** LEVEL UP! Now LVL' + reward.levelUp.newLevel + ' - HP: ' + reward.levelUp.gains.hp + ' Str: ' + reward.levelUp.gains.str + ' Def: ' + reward.levelUp.gains.def + ' ***'));
    }
    
    userState.currentMonster = null;
    showForest(nick);
    return;
  } else if (result.defeat) {
    const loss = game.loseMonsterFight(nick, monster.gold, monster.name);
    
    sendImmediate(nick, 'DEAD! Killed by ' + monster.name + ' - Lost ' + g(game.formatNumber(loss.lostGold)) + ' gold - Dead for 10 minutes!');
    
    userState.currentMonster = null;
    clearState(nick);
    return;
  } else {
    monster.hp = result.monsterHp;
    
    lines.push(monster.name + ' hits you for ' + g(result.monsterDamage) + ' damage!');
    lines.push('');
    lines.push(statLine(nick));
    lines.push('HP: (' + g(result.playerHp) + ' of ' + g(game.getPlayerStats(nick).maxhp) + ') - Monster HP: (' + g(result.monsterHp) + ' of ' + g(monster.maxhp) + ')');
    lines.push('');
    lines.push(w('(A)ttack (S)tats (R)un'));
    lines.push('');
    
    setState(nick, PLAYER_STATES.FIGHT);
    {
      const us = getState(nick);
      us.lastFightState = PLAYER_STATES.FIGHT;
    }
    flushQueue(nick);
    sendLines(nick, lines);
  }
}

function processRun(nick) {
  const userState = getState(nick);
  const monster = userState.currentMonster;
  
  if (!monster) {
    sendNotice(nick, 'No monster to run from!');
    showForest(nick);
    return;
  }
  
  const escapeChance = Math.random() > 0.25;
  
  if (escapeChance) {
    flushQueue(nick);
    sendLines(nick, [
      '',
      'You fled from the battle!',
      ''
    ]);
    userState.currentMonster = null;
    showForest(nick);
  } else {
    flushQueue(nick);
    sendLines(nick, [
      '',
      'You failed to escape!',
      monster.name + ' attacks you!',
      ''
    ]);
    processAttack(nick);
  }
}

function showDwarfGames(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;
  
  const userState = getState(nick);
  userState.dwarfGame = {
    playerCards: [],
    dealerCards: [],
    playerScore: 0,
    dealerScore: 0,
    bet: 0,
    gameOver: false,
    result: null
  };
  
  const lines = [
    '',
    border(),
    r('  DWARF GAMES'),
    border(),
    '',
    '  A sly looking dwarf hops out of the brush!',
    '',
    '"How about a game, friend?"',
    '',
    '  You have ' + g(game.formatNumber(stats.gold)) + ' gold on hand.',
    '',
    '  Minimum bet: 200 gold',
    '  Maximum bet: 5000 gold',
    '',
    '  Enter your bet:',
    ''
  ];
  
  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.DWARF_BETTING);
}

function initBlackjackDeck() {
  const deck = [];
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
}

function getCardValue(card) {
  if (card.value === 'A') return 11;
  if (['K', 'Q', 'J'].includes(card.value)) return 10;
  return parseInt(card.value);
}

function calculateScore(cards) {
  let score = 0;
  let aces = 0;
  
  for (const card of cards) {
    score += getCardValue(card);
    if (card.value === 'A') aces++;
  }
  
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
}

function formatCard(card) {
  return card.value + ' of ' + card.suit;
}

function showDwarfGameState(nick) {
  const userState = getState(nick);
  const gameState = userState.dwarfGame;
  const stats = game.getPlayerStats(nick);
  
  const lines = [
    '',
    border(),
    r('  DWARF BLACKJACK'),
    border(),
    '',
    '  Your hand: ' + gameState.playerCards.map(c => formatCard(c)).join(', '),
    '  Your score: ' + g(gameState.playerScore),
    '',
    '  Dealer\'s hand: ' + gameState.dealerCards.map(c => formatCard(c)).join(', '),
    '  Dealer score: ' + g(gameState.dealerScore),
    '',
    '  Bet: ' + g(game.formatNumber(gameState.bet)) + ' gold',
    ''
  ];
  
  if (gameState.gameOver) {
    lines.push(r('  ' + gameState.result));
    lines.push('');
    lines.push('  (P)lay Again');
    lines.push('  (R)eturn to Forest');
  } else {
    lines.push(w('(H)it'));
    lines.push(w('(S)tay'));
  }
  lines.push('');
  
  sendLines(nick, lines);
}

function startDwarfRound(nick, bet) {
  const userState = getState(nick);
  const stats = game.getPlayerStats(nick);
  
  if (bet < 200) {
    sendNotice(nick, 'Minimum bet is 200 gold!');
    showDwarfGames(nick);
    return;
  }
  
  if (bet > 5000) {
    sendNotice(nick, 'Maximum bet is 5000 gold!');
    showDwarfGames(nick);
    return;
  }
  
  if (bet > stats.gold) {
    sendNotice(nick, 'You don\'t have enough gold!');
    showDwarfGames(nick);
    return;
  }
  
  userState.dwarfGame = {
    deck: initBlackjackDeck(),
    playerCards: [],
    dealerCards: [],
    playerScore: 0,
    dealerScore: 0,
    bet: bet,
    gameOver: false,
    result: null
  };
  
  userState.dwarfGame.playerCards.push(userState.dwarfGame.deck.pop());
  userState.dwarfGame.playerCards.push(userState.dwarfGame.deck.pop());
  userState.dwarfGame.dealerCards.push(userState.dwarfGame.deck.pop());
  userState.dwarfGame.dealerCards.push(userState.dwarfGame.deck.pop());
  
  userState.dwarfGame.playerScore = calculateScore(userState.dwarfGame.playerCards);
  userState.dwarfGame.dealerScore = calculateScore(userState.dwarfGame.dealerCards);
  
  if (userState.dwarfGame.playerScore === 21) {
    endDwarfRound(nick);
  } else {
    setState(nick, PLAYER_STATES.DWARF_GAMES);
    showDwarfGameState(nick);
  }
}

function endDwarfRound(nick) {
  const userState = getState(nick);
  const gameState = userState.dwarfGame;
  
  while (gameState.dealerScore < 17) {
    gameState.dealerCards.push(gameState.deck.pop());
    gameState.dealerScore = calculateScore(gameState.dealerCards);
  }
  
  gameState.gameOver = true;
  
  if (gameState.playerScore > 21) {
    gameState.result = 'BUST! You lose ' + game.formatNumber(gameState.bet) + ' gold!';
    game.takeGold(nick, gameState.bet);
  } else if (gameState.dealerScore > 21) {
    gameState.result = 'Dealer busts! You WIN ' + game.formatNumber(gameState.bet) + ' gold!';
    game.addGold(nick, gameState.bet);
  } else if (gameState.playerScore > gameState.dealerScore) {
    gameState.result = 'You WIN ' + game.formatNumber(gameState.bet) + ' gold!';
    game.addGold(nick, gameState.bet);
  } else if (gameState.dealerScore > gameState.playerScore) {
    gameState.result = 'Dealer wins. You lose ' + game.formatNumber(gameState.bet) + ' gold!';
    game.takeGold(nick, gameState.bet);
  } else {
    gameState.result = 'Push! Your bet is returned.';
  }
   
  showDwarfGameState(nick);
}

function returnToFightState(nick, lastFightState) {
  switch (lastFightState) {
    case PLAYER_STATES.FIGHT:
      showFightState(nick);
      break;
    case PLAYER_STATES.FIGHT_PLAYER:
      showPlayerFightState(nick);
      break;
    case PLAYER_STATES.FIGHT_MASTER:
      showMasterFightState(nick);
      break;
    default:
      showFightState(nick);
  }
}

function showPlayerFightState(nick) {
  const userState = getState(nick);
  const monster = userState.currentMonster;
  if (!monster) {
    sendNotice(nick, 'No player to fight!');
    showMainMenu(nick);
    return;
  }
  
  const refreshedPlayer = checkAndRefreshSkills(nick);
  const stats = game.getPlayerStats(nick);
  
  const lines = [
    '',
    r('**PLAYER FIGHT**'),
    monster.name + ' HP: (' + g(monster.hp) + ' of ' + g(monster.maxhp) + ')',
    ''
  ];
  
  lines.push(statLine(nick));
  const skillText = getSkillMenuText(refreshedPlayer);
  lines.push(w('(A)ttack ') + skillText + w('(R)un'));
  lines.push('');
  const skillKeys = { 0: 'D', 1: 'M', 2: 'T' };
  const hasSkill = refreshedPlayer.skill_charges_max > 0 && refreshedPlayer.skill_charges_active > 0;
  const helpKeys = hasSkill ? '(A,' + skillKeys[refreshedPlayer.class] + ',R) (? for menu)' : '(A,R) (? for menu)';
  lines.push(r('Player Fight') + w('  ' + helpKeys));
  lines.push('');

  sendLines(nick, lines);
}

function showMasterFightState(nick) {
  const userState = getState(nick);
  const monster = userState.currentMonster;
  const player = checkAndRefreshSkills(nick);
  
  if (!monster || !player) {
    sendNotice(nick, 'No master to fight!');
    showTraining(nick);
    return;
  }
  
  const lines = [
    '',
    r('**MASTER FIGHT**'),
    monster.name + ' HP: (' + g(monster.hp) + ' of ' + g(monster.maxhp) + ')',
    ''
  ];
  
  lines.push(statLine(nick));
  const skillText = getSkillMenuText(player);
  lines.push(w('(A)ttack ') + skillText + w('(R)un'));
  lines.push('');
  const skillKeys = { 0: 'D', 1: 'M', 2: 'T' };
  const hasSkill = player.skill_charges_max > 0 && player.skill_charges_active > 0;
  const helpKeys = hasSkill ? '(A,' + skillKeys[player.class] + ',R) (? for menu)' : '(A,R) (? for menu)';
  lines.push(r('Master Fight') + w('  ' + helpKeys));
  lines.push('');
  
  sendLines(nick, lines);
}

function getSkillMenuText(player) {
  if (!player.skill_charges_max || player.skill_charges_active <= 0) return '';
  
  const chargeStatus = ' (' + player.skill_charges_active + '/' + player.skill_charges_max + ')';
  
  switch (player.class) {
    case 0: return w('(D)estroy ' + chargeStatus + ' '); // Death Knight
    case 1: return w('(M)agic ' + chargeStatus + ' ');   // Mystic
    case 2: return w('(T)hieve ' + chargeStatus + ' ');  // Thief
  }
  return '';
}

function checkAndRefreshSkills(nick) {
  const player = loadPlayer(nick);
  if (!player) return player;
  
  const now = Date.now();
  
  if (!player.skill_charge_timers) {
    player.skill_charge_timers = [];
  }
  if (player.skill_charges_active === undefined) {
    player.skill_charges_active = player.skill_charges_max || 1;
  }
  
  let refreshed = false;
  for (let i = 0; i < player.skill_charge_timers.length; i++) {
    if (player.skill_charge_timers[i] && now >= player.skill_charge_timers[i]) {
      player.skill_charges_active++;
      player.skill_charge_timers[i] = null;
      refreshed = true;
    }
  }
  
  if (refreshed) {
    savePlayer(nick, player);
    console.log('[SKILLS] ' + player.name + '\'s skills refreshed! Active: ' + player.skill_charges_active + '/' + player.skill_charges_max);
  }
  
  return player;
}

function getSkillChargeStatus(player) {
  if (!player.skill_charges_max) return '';
  if (player.skill_charges_active >= player.skill_charges_max) return '';
  return ' (' + player.skill_charges_active + '/' + player.skill_charges_max + ' charges)';
}

function getSkillChargeTimers(player) {
  if (!player.skill_charge_timers || player.skill_charge_timers.length === 0) return [];
  const now = Date.now();
  const timers = [];
  for (const timer of player.skill_charge_timers) {
    if (timer && timer > now) {
      const remaining = timer - now;
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      timers.push(mins + 'm ' + secs + 's');
    }
  }
  return timers;
}

function showSkillMenu(nick) {
  const player = checkAndRefreshSkills(nick);
  if (!player) return;
  
  const lines = [
    '',
    border(),
    r('  CLASS SKILLS'),
    border(),
    ''
  ];
  
  if (!player.skill_charges_max || player.skill_charges_max === 0) {
    lines.push('  You have not learned any skills yet.');
    lines.push('  Train with masters to learn class skills.');
  } else {
    const skillKeys = { 0: 'D', 1: 'M', 2: 'T' };
    const skillNames = { 0: 'Destroy', 1: 'Magic', 2: 'Steal' };
    
    switch (player.class) {
      case 0: // Death Knight
        lines.push('  ** DESTROY **');
        lines.push('');
        lines.push('  You perform a devastating power attack!');
        lines.push('  Damage: Strength x 1.5-5.5 + Weapon Attack x multiplier');
        lines.push('');
        lines.push('  Charges: ' + player.skill_charges_active + '/' + player.skill_charges_max);
        lines.push('');
        lines.push('  Press (D) to use Destroy');
        break;
        
      case 1: // Mystic
        lines.push('  ** MYSTICAL SKILLS **');
        lines.push('');
        lines.push('  (P)inch Real Hard - Pinch the enemy');
        lines.push('');
        lines.push('  Charges: ' + player.skill_charges_active + '/' + player.skill_charges_max);
        lines.push('');
        lines.push('  Press (P) to use Pinch');
        break;
        
      case 2: // Thief
        lines.push('  ** THIEVING SKILLS **');
        lines.push('');
        lines.push('  (S)teal Gold - Steal gold from monster');
        lines.push('');
        lines.push('  Charges: ' + player.skill_charges_active + '/' + player.skill_charges_max);
        lines.push('');
        lines.push('  Press (S) to use Steal');
        break;
    }
  }
  
  lines.push('');
  lines.push(w('(R)eturn to Fight'));
  lines.push('');
  
  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.SKILL_MENU);
}

function showFightState(nick) {
  const userState = getState(nick);
  const monster = userState.currentMonster;
  const player = checkAndRefreshSkills(nick);
  
  if (!monster || !player) return;
  
  const lines = [
    '',
    r('**FIGHT**'),
    'You have encountered ' + monster.name + '!!',
    '',
    'It is wielding a ' + monster.weapon + '!',
    '',
    'Your move.',
    ''
  ];
  
  lines.push('');
  lines.push(statLine(nick));
  const skillText = getSkillMenuText(player);
  lines.push(w('(A)ttack ') + skillText + w('(S)tats (R)un'));
  lines.push('');
  const skillKeys = { 0: 'D', 1: 'M', 2: 'T' };
  const hasSkill = player.skill_charges_max > 0 && player.skill_charges_active > 0;
  const helpKeys = hasSkill ? '(A,' + skillKeys[player.class] + ',R,Q) (? for menu)' : '(A,R,Q) (? for menu)';
  lines.push(r('The Forest') + w('  ' + helpKeys));
  
  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.FIGHT);
  {
    const us = getState(nick);
    us.lastFightState = PLAYER_STATES.FIGHT;
  }
}

function performSkill(nick, skill) {
  const player = loadPlayer(nick);
  const userState = getState(nick);
  const monster = userState.currentMonster;
  
  if (!player || !monster) {
    sendNotice(nick, 'Error: No fight in progress!');
    return;
  }
  
  if (!player.skill_charges_max || player.skill_charges_active <= 0) {
    sendNotice(nick, 'No skill charges remaining!');
    return;
  }
  
  const now = Date.now();
  switch (player.class) {
    case 0: // Death Knight - Power Attack
      player.skill_charges_active--;
      player.skill_charge_timers.push(now + (30 * 60 * 1000));
      if (player.skill_charges_active < 0) player.skill_charges_active = 0;
      
      const dkMultiplier = random(150, 550) / 100;
      const weaponAttack = game.getWeaponAttack(player.weapon_num);
      const dkDamage = Math.floor((player.str + weaponAttack) * dkMultiplier);
      
      monster.hp -= dkDamage;
      savePlayer(nick, player);
      
      sendLines(nick, [
        '',
        r('** DESTROY **'),
        'You perform a devastating power attack!',
        'You hit ' + monster.name + ' for ' + dkDamage + ' damage!',
        'Charges: ' + player.skill_charges_active + '/' + player.skill_charges_max,
        ''
      ]);
      break;
      
    case 1: // Mystic
      if (skill === 'p') { // Pinch
        const monsterLevel = Math.floor(monster.str / 10);
        if (player.level <= monsterLevel) {
          sendNotice(nick, 'Target level too high for Pinch!');
          return;
        }
        
        player.skill_charges_active--;
        player.skill_charge_timers.push(now + (30 * 60 * 1000));
        if (player.skill_charges_active < 0) player.skill_charges_active = 0;
        
        const wpnAttack = game.getWeaponAttack(player.weapon_num);
        const pinchMultiplier = random(100, 150) / 100;
        const pinchDamage = Math.floor((player.str + wpnAttack) * pinchMultiplier);
        monster.hp -= pinchDamage;
        savePlayer(nick, player);
        
        sendLines(nick, [
          '',
          r('** PINCH **'),
          'You whisper the word. You smile as ' + monster.name + ' screams out in pain.',
          'You hit ' + monster.name + ' for ' + pinchDamage + ' damage!',
          'Charges: ' + player.skill_charges_active + '/' + player.skill_charges_max,
          ''
        ]);
      }
      break;
      
    case 2: // Thief - Steal
      player.skill_charges_active--;
      player.skill_charge_timers.push(now + (30 * 60 * 1000));
      if (player.skill_charges_active < 0) player.skill_charges_active = 0;
      
      const stealTable = [500, 999, 4000, 7992, 13500, 26973, 32000, 63936, 62500, 124875, 108000, 215784];
      const levelIndex = Math.min(Math.max(player.level - 1, 0) * 2, stealTable.length - 2);
      const minSteal = stealTable[levelIndex];
      const maxSteal = stealTable[levelIndex + 1];
      const stolen = random(minSteal, maxSteal);
      
      player.gold += stolen;
      monster.gold -= Math.floor(stolen * 0.1);
      savePlayer(nick, player);
      
      sendLines(nick, [
        '',
        r('** STEAL **'),
        'You attempt to steal from ' + monster.name + '!',
        'You manage to make off with ' + stolen + ' gold!',
        'Charges: ' + player.skill_charges_active + '/' + player.skill_charges_max,
        ''
      ]);
      break;
  }
  
  if (monster.hp <= 0) {
    monster.hp = 0;
    const result = game.winMonsterFight(nick, monster);
    if (result) {
      const victoryMsg = 'Killed ' + monster.name + '! Got ' + g(game.formatNumber(result.gold)) + ' gold + ' + g(result.xp) + ' XP' + (result.gem ? ' +GEM' : '');
      sendImmediate(nick, victoryMsg);
      
      if (result.levelUp && result.levelUp.levelUp) {
        sendImmediate(nick, r('*** LEVEL UP! Now LVL' + result.levelUp.newLevel + ' - HP: ' + result.levelUp.gains.hp + ' Str: ' + result.levelUp.gains.str + ' Def: ' + result.levelUp.gains.def + ' ***'));
      }
      
      userState.currentMonster = null;
      userState.lastFightState = null;
      showForest(nick);
      return;
    }
  } else {
    const stats = game.getPlayerStats(nick);
    const monsterDamage = Math.floor(Math.random() * (monster.str + 1));
    const armorDefense = game.getArmorDefense(player.armor_num);
    const actualDamage = Math.max(1, monsterDamage - armorDefense);
    
    const newHp = Math.max(0, stats.hp - actualDamage);
    game.setPlayerHp(nick, newHp);
    
    const lines = [
      '',
      monster.name + ' hits you for ' + actualDamage + ' damage!',
      ''
    ];
    
    if (newHp <= 0) {
      game.killPlayer(nick, 10, monster.name);
      lines.push(border());
      lines.push('You have been defeated by ' + monster.name + '!');
      lines.push('You are dead for 10 minutes!');
      lines.push(border());
      lines.push('');
      userState.currentMonster = null;
      userState.state = PLAYER_STATES.NONE;
      sendLines(nick, lines);
      return;
    }
    
    lines.push(statLine(nick));
    const skillText = getSkillMenuText(player);
    if (userState.lastFightState === PLAYER_STATES.FIGHT_PLAYER) {
      lines.push(w('(A)ttack ') + skillText + w('(R)un'));
      lines.push('');
      sendLines(nick, lines);
    } else if (userState.lastFightState === PLAYER_STATES.FIGHT_MASTER) {
      lines.push(w('(A)ttack ') + skillText + w('(R)un'));
      lines.push('');
      sendLines(nick, lines);
    } else {
      lines.push(w('(A)ttack ') + skillText + w('(S)tats (R)un'));
      lines.push('');
      lines.push(r('The Forest') + w('  (A,R,Q) (? for menu)'));
      sendLines(nick, lines);
    }
  }
}

function showForestHut(nick) {
  const lines = [
    '',
    border(),
    r('  EVENT: Forest Hut'),
    border(),
    '',
    '  While trekking through the forest, you come upon a small hut.',
    '',
    '  (K)nock On The Door',
    '  (B)ang On The Door',
    '  (L)eave It Be',
    ''
  ];
  
  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.FOREST_HUT);
}

function showForestHutKnock(nick, player) {
  const isMystic = player.class === 2;
  
  const lines = [
    '',
    border()
  ];
  
  if (isMystic) {
    lines.push(r('  THE OLD MAN\'S TEST'));
    lines.push(border());
    lines.push('');
    lines.push('  You politely knock on the knotted wooden door.');
    lines.push('');
    lines.push('  "Watcha doin down there Sonny?!" A wizened old man');
    lines.push('  looks down from the window.');
    lines.push('');
    lines.push('  "Tell ya what! I\'ll give ya a mystical lesson if');
    lines.push('  you can pass my test!" the old man giggles.');
    lines.push('');
    lines.push('  "I\'m thinking of a number between 1 and 100.');
    lines.push('  I\'ll give ya 6 guesses."');
    lines.push('');
    lines.push('  Enter your guess (1-100):');
    lines.push('');
    
    const userState = getState(nick);
    userState.hutGuess = {
      answer: random(1, 100),
      tries: 0,
      maxTries: 6
    };
    
    sendLines(nick, lines);
    setState(nick, PLAYER_STATES.FOREST_HUT_GUESS);
  } else {
    lines.push(r('  No Answer'));
    lines.push(border());
    lines.push('');
    lines.push('  No one seems to be home.');
    lines.push('');
    lines.push('(R)eturn to Forest');
    lines.push('');
    
    sendLines(nick, lines);
    setState(nick, PLAYER_STATES.FOREST_EVENT);
  }
}

function showForestHutBang(nick) {
  const lines = [
    '',
    border(),
    r('  BANG!'),
    border(),
    '',
    '  You bang on the door loudly!',
    '',
    '  Suddenly, the door flies open and a bolt of lightning',
    '  strikes you! You are knocked unconscious.',
    '',
    '  You wake up with just 1 HP remaining!',
    ''
  ];
  
  const player = loadPlayer(nick);
  if (player) {
    player.hp = 1;
    savePlayer(nick, player);
  }
  
  lines.push('(R)eturn to Forest');
  lines.push('');
  
  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.FOREST_EVENT);
}

function handleCommand(nick, cmd, args) {
  const deadCheck = game.isPlayerDead(nick);
  if (deadCheck && deadCheck.dead) {
    const totalSeconds = Math.ceil(deadCheck.remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeStr = minutes > 0 ? (seconds > 0 ? minutes + ' min ' + seconds + ' sec' : minutes + ' min') : seconds + ' sec';
    sendNotice(nick, 'You are dead! Wait ' + timeStr + ' before you can re-enter the town.');
    return;
  }
  
  const userState = getState(nick);
  const state = userState.state;
  
  if (messageQueue.has(nick) && userState.displayMode) {
    userState.pendingCommand = cmd;
    userState.pendingArgs = args;
    return;
  }
  
  if (state !== PLAYER_STATES.FOREST_EVENT) {
    clearMessageQueue(nick);
  }
  const player = playerExists(nick) ? loadPlayer(nick) : null;

  const cmdUpper = cmd.toUpperCase();
  const cmdLower = cmd.toLowerCase();

  switch (state) {
    case PLAYER_STATES.NONE:
      showLogin(nick);
      break;

    case PLAYER_STATES.LOGIN:
      if (cmdUpper === 'N' || cmdLower === 'n') {
        showCreateMenu(nick);
      } else if (cmd.trim().length > 0) {
        sendNotice(nick, 'Press N to create a new character.');
      }
      break;

    case PLAYER_STATES.CREATE_NAME:
      let name = cmd;
      if (args.length > 0) {
        name = [cmd, ...args].join(' ').trim();
      }
      console.log('CREATE_NAME: cmd="' + cmd + '", args=' + JSON.stringify(args) + ', name="' + name + '"');
      console.log('CREATE_NAME: name.length=' + name.length + ', charCodes=' + [...name].map(c => c.charCodeAt(0)).join(','));
      if (name.length < 1 || name.length > 20) {
        console.log('CREATE_NAME: REJECTING name, length=' + name.length);
        sendNotice(nick, 'Name must be 1-100 characters!');
        showCreateMenu(nick);
        return;
      }
      userState.temp.name = name;
      showClassSelect(nick);
      break;

    case PLAYER_STATES.CREATE_CLASS:
      let classNum = -1;
      if (cmdUpper === 'K') classNum = 0;
      else if (cmdUpper === 'D') classNum = 1;
      else if (cmdUpper === 'L') classNum = 2;
      
      if (classNum >= 0) {
        userState.temp.class = classNum;
        showSexSelect(nick);
      } else {
        sendNotice(nick, 'Invalid choice! Press K (Warrior), D (Mage), or L (Thief).');
      }
      break;

    case PLAYER_STATES.CREATE_SEX:
      let sex = -1;
      if (cmdUpper === 'M') sex = 0;
      else if (cmdUpper === 'F') sex = 1;
      
      if (sex < 0) {
        sendNotice(nick, 'Invalid choice! Press M (Male) or F (Female).');
        return;
      }
      
      console.log('CREATE_SEX: name=' + userState.temp.name + ', class=' + userState.temp.class + ', sex=' + sex);
      
      if (sex >= 0) {
        const result = game.createCharacter(nick, userState.temp.name, userState.temp.class, sex);
        console.log('CREATE_SEX: result=' + JSON.stringify(result));
        
        if (result.success) {
          game.healPlayer(nick);
          const player = loadPlayer(nick);
          player.irc_nick = nick;
          savePlayer(nick, player);
          nickToCharacter.set(nick, result.player.name);
          characterToNick.set(result.player.name.toLowerCase(), nick);
          showMainMenu(nick);
        } else {
          sendNotice(nick, result.message);
          showLogin(nick);
        }
        userState.temp = {};
      }
      break;

    case PLAYER_STATES.MAIN:
      switch (cmdLower) {
        case 'f': case 'F': showForest(nick); break;
        case 's': case 'S': showSlaughter(nick); break;
        case 'k': case 'K': showWeapons(nick); break;
        case 'a': case 'A': showArmor(nick); break;
        case 'h': case 'H': showHealer(nick); break;
        case 'v': case 'V': showFullStats(nick); break;
        case 'i': case 'I': showInn(nick); break;
        case 't': case 'T': showTraining(nick); break;
        case 'y': case 'Y': showBank(nick); break;
        case 'l': case 'L': showPeople(nick); break;
        case 'd': case 'D': showNews(nick); break;
        case 'p': case 'P': showPeople(nick); break;
        case 'c': case 'C': showMainMenu(nick); break;
        case '?': showMainMenu(nick); break;
        case 'q': case 'Q':
          sendNotice(nick, 'Goodbye! Type !lord to return.');
          setPlayerOffline(nick);
          clearState(nick);
          break;
        default:
          sendNotice(nick, 'The Town Square - F,S,K,A,H,V,I,T,Y,L,W,D,C,O,X,M,P,Q,?');
          break;
      }
      break;

    case PLAYER_STATES.FOREST:
      switch (cmdLower) {
        case 'l': case 'L': startFight(nick); break;
        case 'h': case 'H': showHealer(nick); break;
        case 's': case 'S': showStats(nick); break;
        case 'r': case 'R': showMainMenu(nick); break;
        case 'q': case 'Q':
          sendNotice(nick, 'Goodbye! Type !lord to return.');
          setPlayerOffline(nick);
          clearState(nick);
          break;
        case '?': showForest(nick); break;
        default:
          sendNotice(nick, 'The Forest - L,H,S,R,Q');
          break;
      }
      break;

    case PLAYER_STATES.FOREST_HUT:
      {
        const hutPlayer = loadPlayer(nick);
        switch (cmdLower) {
          case 'k':
            showForestHutKnock(nick, hutPlayer);
            break;
          case 'b':
            showForestHutBang(nick);
            break;
          case 'l':
            sendNotice(nick, 'Leave the hut and return to forest? (Y/N)');
            setState(nick, PLAYER_STATES.CONFIRM_LEAVE_HUT);
            break;
          default:
            sendNotice(nick, 'Forest Hut - K (Knock), B (Bang), L (Leave)');
            break;
        }
      }
      break;

    case PLAYER_STATES.FOREST_HUT_GUESS:
      {
        const guess = parseInt(cmd);
        const hutGuess = userState.hutGuess;
        
        if (isNaN(guess) || guess < 1 || guess > 100) {
          sendNotice(nick, 'Please enter a number between 1 and 100.');
          return;
        }
        
        hutGuess.tries++;
        
        const lines = [''];
        
        if (guess === hutGuess.answer) {
          lines.push(border());
          lines.push(r('  ** YOU PASSED THE TEST! **'));
          lines.push(border());
          lines.push('');
          lines.push('  "That\'s right! You read my mind!"');
          lines.push('  The old man cheers with joy!');
          lines.push('');
          lines.push('  ** YOUR CLASS SKILL IS RAISED BY ONE! **');
          lines.push('');
          
          sendLines(nick, lines);
          sendNotice(nick, 'You return to the forest, wiser than before.');
          showForest(nick);
        } else if (hutGuess.tries >= hutGuess.maxTries) {
          lines.push(border());
          lines.push(r('  ** YOU FAILED THE TEST **'));
          lines.push(border());
          lines.push('');
          lines.push('  "No, no NO! The number was ' + hutGuess.answer + '!"');
          lines.push('  He slams his window shut in disappointment.');
          lines.push('');
          
          sendLines(nick, lines);
          sendNotice(nick, 'You return to the forest, wiser than before.');
          showForest(nick);
        } else if (guess < hutGuess.answer) {
          lines.push('  "The number is higher than that!"');
          lines.push('  Tries remaining: ' + (hutGuess.maxTries - hutGuess.tries));
          lines.push('');
          lines.push('  Enter your guess (1-100):');
          lines.push('');
          sendLines(nick, lines);
        } else {
          lines.push('  "The number is lower than that!"');
          lines.push('  Tries remaining: ' + (hutGuess.maxTries - hutGuess.tries));
          lines.push('');
          lines.push('  Enter your guess (1-100):');
          lines.push('');
          sendLines(nick, lines);
        }
      }
      break;

    case PLAYER_STATES.FOREST_EVENT:
      switch (cmdLower) {
        case 'r': case 'R':
          flushQueue(nick);
          {
            const us = getState(nick);
            const nextState = us.temp.nextState;
            us.temp = {};
            us.displayMode = false;
            if (nextState === 'dwarf') {
              showDwarfGames(nick);
            } else if (nextState === 'hut') {
              showForestHut(nick);
            } else {
              showForest(nick);
            }
          }
          break;
        default:
          sendNotice(nick, 'Press R to continue.');
          break;
      }
      break;

    case PLAYER_STATES.FIGHT:
      switch (cmdLower) {
        case 'a': case 'A':
        case '':
          flushQueue(nick);
          processAttack(nick);
          break;
        case 'd': case 'D':
        case 'm': case 'M':
        case 't': case 'T':
          {
            const p = loadPlayer(nick);
            if (p && ((p.class === 0 && cmdLower === 'd') || 
                       (p.class === 1 && cmdLower === 'm') || 
                       (p.class === 2 && cmdLower === 't'))) {
              flushQueue(nick);
              showSkillMenu(nick);
            } else {
              sendNotice(nick, 'Forest Fight - A,R,Q');
            }
          }
          break;
        case 'r': case 'R':
          flushQueue(nick);
          processRun(nick);
          break;
        case 'q': case 'Q':
          flushQueue(nick);
          userState.currentMonster = null;
          showMainMenu(nick);
          break;
        default:
          sendNotice(nick, 'Forest Fight - A,R,Q');
          break;
      }
      break;
      
    case PLAYER_STATES.SKILL_MENU:
      {
        const skillPlayer = loadPlayer(nick);
        const userState = getState(nick);
        const lastFight = userState.lastFightState;
        
        if (!skillPlayer.skill_charges_max || skillPlayer.skill_charges_active <= 0) {
          sendNotice(nick, 'No skill charges remaining!');
          returnToFightState(nick, lastFight);
          break;
        }
        switch (cmdLower) {
          case 'r': case 'R':
            returnToFightState(nick, lastFight);
            break;
          case 'd':
            if (skillPlayer.class === 0) {
              performSkill(nick, 'd');
            } else {
              sendNotice(nick, 'Invalid skill!');
            }
            break;
          case 'p':
            if (skillPlayer.class === 1) {
              performSkill(nick, 'p');
            } else {
              sendNotice(nick, 'Invalid skill!');
            }
            break;
          case 's':
            if (skillPlayer.class === 2) {
              performSkill(nick, 's');
            } else {
              sendNotice(nick, 'Invalid skill!');
            }
            break;
          default:
            sendNotice(nick, 'Invalid skill choice!');
            break;
        }
      }
      break;

    case PLAYER_STATES.WEAPONS:
      if (cmdLower === 'r' || cmdLower === 'q') {
        showMainMenu(nick);
        break;
      }
      if (cmdLower === 'b') {
        sendNotice(nick, 'Enter weapon number:');
        setState(nick, PLAYER_STATES.WEAPONS_BUY);
      }
      if (cmdLower === 's') {
        const stats = game.getPlayerStats(nick);
        if (stats.weapon_num === 1) {
          sendNotice(nick, 'You cannot sell your fists!');
          break;
        }
        const weapon = game.weapons[stats.weapon_num - 1];
        const sellPrice = Math.floor(weapon.cost * 0.5);
        userState.temp = { sellWeaponNum: stats.weapon_num };
        sendNotice(nick, 'Sell ' + weapon.name + ' for ' + g(game.formatNumber(sellPrice)) + ' gold? (Y/N)');
        setState(nick, PLAYER_STATES.CONFIRM_WEAPON_SELL);
        break;
      }
      if (cmdLower === '?') {
        showWeapons(nick);
        break;
      }
      sendNotice(nick, 'King Arthurs Weapons - B,S,R,Q');
      break;

    case PLAYER_STATES.WEAPONS_BUY:
      {
        const wNum = parseInt(cmd);
        if (!isNaN(wNum) && wNum >= 1 && wNum <= game.weapons.length) {
          const weapon = game.weapons[wNum - 1];
          userState.temp = { buyWeaponNum: wNum };
          sendNotice(nick, 'Buy ' + weapon.name + ' for ' + g(game.formatNumber(weapon.cost)) + ' gold? (Y/N)');
          setState(nick, PLAYER_STATES.CONFIRM_WEAPON_BUY);
        } else {
          sendNotice(nick, 'Invalid weapon number!');
          showWeapons(nick);
        }
      }
      break;

    case PLAYER_STATES.WEAPONS_SELL:
      {
        const wsNum = parseInt(cmd);
        if (!isNaN(wsNum) && wsNum >= 1 && wsNum <= game.weapons.length) {
          const result = game.sellWeapon(nick, wsNum);
          if (result.success) {
            sendNotice(nick, 'You sold your weapon for ' + g(game.formatNumber(result.sellPrice)) + ' gold!');
          } else {
            sendNotice(nick, result.error);
          }
        } else {
          sendNotice(nick, 'Invalid weapon number!');
        }
      }
      showWeapons(nick);
      break;

    case PLAYER_STATES.ARMOR:
      if (cmdLower === 'r' || cmdLower === 'q') {
        showMainMenu(nick);
        break;
      }
      if (cmdLower === 'b') {
        sendNotice(nick, 'Enter armor number:');
        setState(nick, PLAYER_STATES.ARMOR_BUY);
      }
      if (cmdLower === 's') {
        const stats = game.getPlayerStats(nick);
        if (stats.armor_num === 1) {
          sendNotice(nick, 'You cannot sell your coat!');
          break;
        }
        const armor = game.armors[stats.armor_num - 1];
        const sellPrice = Math.floor(armor.cost * 0.5);
        userState.temp = { sellArmorNum: stats.armor_num };
        sendNotice(nick, 'Sell ' + armor.name + ' for ' + g(game.formatNumber(sellPrice)) + ' gold? (Y/N)');
        setState(nick, PLAYER_STATES.CONFIRM_ARMOR_SELL);
        break;
      }
      if (cmdLower === '?') {
        showArmor(nick);
        break;
      }
      sendNotice(nick, 'Abduls Armour - B,S,R,Q');
      break;

    case PLAYER_STATES.ARMOR_BUY:
      {
        const aNum = parseInt(cmd);
        if (!isNaN(aNum) && aNum >= 1 && aNum <= game.armors.length) {
          const armor = game.armors[aNum - 1];
          userState.temp = { buyArmorNum: aNum };
          sendNotice(nick, 'Buy ' + armor.name + ' for ' + g(game.formatNumber(armor.cost)) + ' gold? (Y/N)');
          setState(nick, PLAYER_STATES.CONFIRM_ARMOR_BUY);
        } else {
          sendNotice(nick, 'Invalid armor number!');
          showArmor(nick);
        }
      }
      break;

    case PLAYER_STATES.ARMOR_SELL:
      {
        const asNum = parseInt(cmd);
        if (!isNaN(asNum) && asNum >= 1 && asNum <= game.armors.length) {
          const result = game.sellArmor(nick, asNum);
          if (result.success) {
            sendNotice(nick, 'You sold your armor for ' + g(game.formatNumber(result.sellPrice)) + ' gold!');
          } else {
            sendNotice(nick, result.error);
          }
        } else {
          sendNotice(nick, 'Invalid armor number!');
        }
      }
      showArmor(nick);
      break;

    case PLAYER_STATES.CONFIRM_WEAPON_SELL:
      if (cmdLower === 'y') {
        const weaponNum = userState.temp.sellWeaponNum;
        const result = game.sellWeapon(nick, weaponNum);
        if (result.success) {
          sendNotice(nick, 'You sold your ' + result.weapon + ' for ' + g(game.formatNumber(result.sellPrice)) + ' gold!');
        } else {
          sendNotice(nick, result.error);
        }
      } else {
        sendNotice(nick, 'Sale cancelled.');
      }
      userState.temp = {};
      showWeapons(nick);
      break;

    case PLAYER_STATES.CONFIRM_ARMOR_SELL:
      if (cmdLower === 'y') {
        const armorNum = userState.temp.sellArmorNum;
        const result = game.sellArmor(nick, armorNum);
        if (result.success) {
          sendNotice(nick, 'You sold your ' + result.armor + ' for ' + g(game.formatNumber(result.sellPrice)) + ' gold!');
        } else {
          sendNotice(nick, result.error);
        }
      } else {
        sendNotice(nick, 'Sale cancelled.');
      }
      userState.temp = {};
      showArmor(nick);
      break;

    case PLAYER_STATES.CONFIRM_WEAPON_BUY:
      if (cmdLower === 'y') {
        const weaponNum = userState.temp.buyWeaponNum;
        const result = game.buyWeapon(nick, weaponNum);
        if (result.success) {
          sendNotice(nick, 'You bought ' + result.weapon + ' for ' + g(game.formatNumber(result.cost)) + ' gold!');
        } else {
          sendNotice(nick, result.error);
        }
      } else {
        sendNotice(nick, 'Purchase cancelled.');
      }
      userState.temp = {};
      showWeapons(nick);
      break;

    case PLAYER_STATES.CONFIRM_ARMOR_BUY:
      if (cmdLower === 'y') {
        const armorNum = userState.temp.buyArmorNum;
        const result = game.buyArmor(nick, armorNum);
        if (result.success) {
          sendNotice(nick, 'You bought ' + result.armor + ' for ' + g(game.formatNumber(result.cost)) + ' gold!');
        } else {
          sendNotice(nick, result.error);
        }
      } else {
        sendNotice(nick, 'Purchase cancelled.');
      }
      userState.temp = {};
      showArmor(nick);
      break;

    case PLAYER_STATES.BANK:
      if (cmdLower === 'r' || cmdLower === 'q') {
        showMainMenu(nick);
        break;
      }
      if (cmdLower === 'd') {
        sendNotice(nick, 'Enter amount to deposit:');
        setState(nick, PLAYER_STATES.BANK_DEPOSIT);
      }
      if (cmdLower === 'w') {
        sendNotice(nick, 'Enter amount to withdraw:');
        setState(nick, PLAYER_STATES.BANK_WITHDRAW);
      }
      sendNotice(nick, 'Ye Old Bank - D,W,R,Q');
      break;

    case PLAYER_STATES.BANK_DEPOSIT:
      {
        const depAmt = parseInt(cmd);
        if (!isNaN(depAmt) && depAmt > 0) {
          const result = game.depositBank(nick, depAmt);
          if (result.success) {
            sendNotice(nick, 'Deposited ' + g(game.formatNumber(result.amount)) + ' gold. Bank: ' + g(game.formatNumber(result.newBalance)));
          } else {
            sendNotice(nick, result.error);
          }
        } else {
          sendNotice(nick, 'Invalid amount!');
        }
      }
      showBank(nick);
      break;

    case PLAYER_STATES.BANK_WITHDRAW:
      {
        const withAmt = parseInt(cmd);
        if (!isNaN(withAmt) && withAmt > 0) {
          const result = game.withdrawBank(nick, withAmt);
          if (result.success) {
            sendNotice(nick, 'Withdrew ' + g(game.formatNumber(result.amount)) + ' gold. Bank: ' + g(game.formatNumber(result.newBalance)));
          } else {
            sendNotice(nick, result.error);
          }
        } else {
          sendNotice(nick, 'Invalid amount!');
        }
      }
      showBank(nick);
      break;

    case PLAYER_STATES.HEALER:
      if (cmdLower === 'r' || cmdLower === 'q') {
        showMainMenu(nick);
        break;
      }
      if (cmdLower === 'h') {
        const result = game.healAtHealer(nick);
        if (result.success) {
          sendNotice(nick, 'You are fully healed! (Cost: ' + g(result.cost) + ' gold)');
        } else {
          sendNotice(nick, result.error);
        }
      } else {
        sendNotice(nick, 'Healers Hut - H,R,Q');
      }
      showHealer(nick);
      break;

    case PLAYER_STATES.INN:
      if (cmdLower === 'r' || cmdLower === 'q') {
        showMainMenu(nick);
        break;
      }
      if (cmdLower === 's') {
        const result = game.stayAtInn(nick);
        if (result.success) {
          sendNotice(nick, result.message);
        } else {
          sendNotice(nick, result.error);
        }
      } else if (cmdLower === 'l') {
        game.leaveInn(nick);
        sendNotice(nick, 'You leave the inn. You are no longer protected.');
      } else {
        sendNotice(nick, 'The Inn - S,L,R,Q');
      }
      showInn(nick);
      break;

    case PLAYER_STATES.TAVERN:
      if (cmdLower === 'r' || cmdLower === 'q') {
        showMainMenu(nick);
        break;
      }
      if (cmdLower === 't') {
        sendLines(nick, [
          '',
          '  Chance looks at you knowingly.',
          '',
          '"Another warrior seeking glory? The forest is full of',
          ' monsters, and the tavern is full of information."',
          '',
          '  (Press R to return to town)',
          ''
        ]);
      } else {
        sendNotice(nick, 'The Tavern - T,R,Q');
      }
      break;

    case PLAYER_STATES.TRAINING:
      if (cmdLower === 'r') {
        showMainMenu(nick);
        break;
      }
      if (cmdLower === 'q') {
        setState(nick, PLAYER_STATES.TRAINING_QUESTION);
        showTrainingQuestion(nick);
        break;
      }
      if (cmdLower === 'c') {
        startMasterFight(nick);
        break;
      }
      sendNotice(nick, 'Turgons Warrior Training - Q,C,R');
      break;

    case PLAYER_STATES.TRAINING_QUESTION:
      if (cmdLower === 'r') {
        showTraining(nick);
        break;
      }
      sendNotice(nick, 'Training Question - R');
      break;

    case PLAYER_STATES.FIGHT_MASTER:
      if (cmdLower === 'a' || cmdLower === '') {
        flushQueue(nick);
        processMasterAttack(nick);
        break;
      }
      if (cmdLower === 'd' || cmdLower === 'm' || cmdLower === 't') {
        const p = loadPlayer(nick);
        if (p && ((p.class === 0 && cmdLower === 'd') || 
                   (p.class === 1 && cmdLower === 'm') || 
                   (p.class === 2 && cmdLower === 't'))) {
          flushQueue(nick);
          showSkillMenu(nick);
        } else {
          sendNotice(nick, 'Fight Master - A,R');
        }
        break;
      }
      if (cmdLower === 'r') {
        flushQueue(nick);
        userState.currentMonster = null;
        showTraining(nick);
        break;
      }
      sendNotice(nick, 'Fight Master - A,R');
      break;

    case PLAYER_STATES.SLAUGHTER:
      flushQueue(nick);
      if (cmdLower === 'r' || cmdLower === 'R') {
        showMainMenu(nick);
        break;
      }
      {
        const targetNum = parseInt(cmd);
        if (!isNaN(targetNum) && targetNum > 0) {
          startPlayerFight(nick, targetNum);
          break;
        }
      }
      sendNotice(nick, 'Slaughter - Enter number or R,Q');
      break;

    case PLAYER_STATES.FIGHT_PLAYER:
      if (cmdLower === 'a' || cmdLower === 'A' || cmdLower === '') {
        flushQueue(nick);
        processPlayerAttack(nick);
        break;
      }
      if (cmdLower === 'r' || cmdLower === 'R') {
        flushQueue(nick);
        userState.currentMonster = null;
        showSlaughter(nick);
        break;
      }
      if (cmdLower === 'd' || cmdLower === 'm' || cmdLower === 't') {
        {
          const p = loadPlayer(nick);
          if (p && ((p.class === 0 && cmdLower === 'd') || 
                     (p.class === 1 && cmdLower === 'm') || 
                     (p.class === 2 && cmdLower === 't'))) {
            flushQueue(nick);
            showSkillMenu(nick);
          } else {
            sendNotice(nick, 'Player Fight - A,R');
          }
        }
        break;
      }
      sendNotice(nick, 'Player Fight - A,R');
      break;

    case PLAYER_STATES.PEOPLE:
    case PLAYER_STATES.NEWS:
    case PLAYER_STATES.CASINO:
    case PLAYER_STATES.STATS:
      if (cmdLower === 'r' || cmdLower === 'q') {
        showMainMenu(nick);
        break;
      }
      sendNotice(nick, 'Press R to return to town');
      break;

    case PLAYER_STATES.DWARF_BETTING:
      {
        const bet = parseInt(cmd);
        if (!isNaN(bet) && bet > 0) {
          startDwarfRound(nick, bet);
        } else {
          sendNotice(nick, 'Please enter a valid bet amount.');
          showDwarfGames(nick);
        }
      }
      break;

    case PLAYER_STATES.DWARF_GAMES:
      {
        const gameState = userState.dwarfGame;
        
        if (cmdLower === 'h') {
          if (gameState.gameOver) {
            sendNotice(nick, 'Game over. (P)lay Again or (R)eturn to Forest.');
            return;
          }
          gameState.playerCards.push(gameState.deck.pop());
          gameState.playerScore = calculateScore(gameState.playerCards);
          
          if (gameState.playerScore > 21) {
            endDwarfRound(nick);
          } else {
            showDwarfGameState(nick);
          }
        } else if (cmdLower === 's') {
          if (gameState.gameOver) {
            sendNotice(nick, 'Game over. (P)lay Again or (R)eturn to Forest.');
            return;
          }
          endDwarfRound(nick);
        } else if (cmdLower === 'p' || cmdLower === 'P') {
          if (gameState.gameOver) {
            showDwarfGames(nick);
          } else {
            sendNotice(nick, 'Dwarf Blackjack - H (Hit), S (Stay), R (Return)');
          }
        } else if (cmdLower === 'r') {
          sendNotice(nick, 'Leave the dwarf games and return to forest? (Y/N)');
          setState(nick, PLAYER_STATES.CONFIRM_LEAVE_DWARF);
        } else {
          sendNotice(nick, 'Dwarf Blackjack - H (Hit), S (Stay), P (Play Again), R (Return)');
        }
      }
      break;

    case PLAYER_STATES.CONFIRM_LEAVE_DWARF:
      if (cmdLower === 'y' || cmdLower === 'Y') {
        userState.currentMonster = null;
        showForest(nick);
      } else if (cmdLower === 'n' || cmdLower === 'N') {
        showDwarfGames(nick);
      } else {
        sendNotice(nick, 'Leave the dwarf games and return to forest? (Y/N)');
      }
      break;

    case PLAYER_STATES.CONFIRM_LEAVE_HUT:
      if (cmdLower === 'y' || cmdLower === 'Y') {
        sendNotice(nick, 'You leave well enough alone.');
        showForest(nick);
      } else if (cmdLower === 'n' || cmdLower === 'N') {
        showForestHut(nick);
      } else {
        sendNotice(nick, 'Leave the hut and return to forest? (Y/N)');
      }
      break;
  }
}

const client = new irc.Client(config.irc.server, config.irc.nick, {
  port: config.irc.port,
  secure: config.irc.secure,
  password: config.irc.password,
  autoRejoin: config.irc.autoRejoin,
  retryCount: config.irc.retryCount,
  retryDelay: config.irc.retryDelay,
  username: config.irc.username,
  realName: config.irc.realname
});

client.addListener('registered', () => {
  console.log('Connected to ' + config.irc.server + ' as ' + config.irc.nick);
  
  config.channels.forEach(channel => {
    if (channel) {
      client.join(channel);
      console.log('Joined ' + channel);
    }
  });
  
  const minuteForestFightBonus = () => {
    const allPlayers = getAllPlayers();
    let bonusCount = 0;
    let underCapCount = 0;
    allPlayers.forEach(player => {
      const p = loadPlayer(player.nick);
      if (p) {
        underCapCount++;
        if (p.fights < config.maxFightsPerDay) {
          p.fights = Math.min(p.fights + 1, config.maxFightsPerDay);
          savePlayer(player.nick, p);
          bonusCount++;
        }
      }
    });
    if (bonusCount > 0) {
      console.log('[MINUTE] ' + bonusCount + '/' + underCapCount + ' players granted +1 fight (max ' + config.maxFightsPerDay + ')');
    }
  };
  
  setInterval(minuteForestFightBonus, 60 * 1000);
  const now = new Date();
  const msUntilNextMinute = (60 - now.getSeconds()) * 1000;
  setTimeout(() => {
    minuteForestFightBonus();
    setInterval(minuteForestFightBonus, 60 * 1000);
  }, msUntilNextMinute);
});

client.addListener('message', (from, to, text) => {
  console.log(C.yellow + '[MSG] ' + from + ' -> ' + to + ': ' + text + C.reset);
});

client.addListener('pm', (nick, text) => {
  console.log(C.cyan + '[IRC PM] from ' + nick + ': ' + JSON.stringify(text) + C.reset);
  
  const parts = text.trim().split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);
  console.log(C.blue + 'PM parsed: cmd="' + cmd + '", args=' + JSON.stringify(args) + C.reset);
  
  if (cmd.toLowerCase() === 'help') {
    showLogin(nick);
    return;
  }
  
  if (cmd.toLowerCase() === 'quit' || cmd.toLowerCase() === 'exit') {
    setPlayerOffline(nick);
    clearState(nick);
    sendNotice(nick, 'Goodbye! Send a message to return.');
    return;
  }
  
  if (cmd.toLowerCase() === 'lord') {
    showLogin(nick);
    return;
  }
  
  handleCommand(nick, cmd, args);
});

client.addListener('error', (message) => {
  console.error('IRC Error:', message);
  
  if (message.command === 'err_nosuchnick') {
    const targetNick = message.args && message.args[1];
    if (targetNick && pendingMessages.has(targetNick.toLowerCase())) {
      const msgs = pendingMessages.get(targetNick.toLowerCase());
      pendingMessages.delete(targetNick.toLowerCase());
      msgs.forEach(msg => {
        console.log('[OFFLINE] Queuing message for ' + targetNick + ' (IRC offline)');
        queueOfflineMessage(targetNick, msg);
      });
    }
  }
});

const pendingMessages = new Map();

function sendDirectNotice(nick, message) {
  const lines = Array.isArray(message) ? message : message.split('\n');
  const fullMessage = lines.join('\n');
  
  pendingMessages.set(nick.toLowerCase(), (pendingMessages.get(nick.toLowerCase()) || []).concat(fullMessage));
  
  lines.forEach(line => {
    client.notice(nick, line);
    client.say(nick, line);
  });
  
  setTimeout(() => {
    pendingMessages.delete(nick.toLowerCase());
  }, 5000);
}

console.log('Starting LORD IRC Bot...');
console.log('Server: ' + config.irc.server + ':' + config.irc.port);
console.log('Nick: ' + config.irc.nick);
console.log('Press Ctrl+C to stop.');
