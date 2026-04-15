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
  ARMOR: 'armor',
  ARMOR_BUY: 'armor_buy',
  ARMOR_SELL: 'armor_sell',
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
  FIGHT_PLAYER: 'fight_player'
};

const userStates = new Map();
const nickToCharacter = new Map();
const characterToNick = new Map();

// No IRC colors for now
const C = {};

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
      currentMonster: null
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
  console.log('statLine: stats=' + JSON.stringify(stats));
  if (!stats) return 'NO STATS!';
  return 'HP: (' + stats.hp + ' of ' + stats.maxhp + ') Fights: ' + stats.fights + ' Gold: ' + game.formatNumber(stats.gold) + ' Gems: ' + stats.gems;
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
    w('(R)eturn to town'),
    '',
    statLine(nick),
    r('The Forest') + w('  (L,H,R,Q) (? for menu)'),
    ''
  ];
  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.FOREST);
}

function showStats(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  const xpBar = '='.repeat(Math.floor(stats.xpPercent / 5)) + '-'.repeat(20 - Math.floor(stats.xpPercent / 5));
  
  sendLines(nick, [
    '',
    stats.name + r("'s Stats..."),
    border(),
    'Experience   : ' + g(game.formatNumber(stats.xp)),
    'Level        : ' + g(stats.level) + '   HitPoints   : (' + g(stats.hp) + ' of ' + g(stats.maxhp) + ')',
    'Forest Fights: ' + g(stats.fights) + '   PlayerFights: ' + g(stats.pfights),
    'Gold In Hand : ' + g(game.formatNumber(stats.gold)) + '   Gold In Bank: ' + g(game.formatNumber(stats.bank)),
    'Weapon       : ' + g(stats.weapon) + '   Atk Strength: ' + g(stats.str),
    'Armour       : ' + g(stats.armor) + '   Def Strength: ' + g(stats.def),
    'Charm        : ' + g(stats.charm) + '   Gems        : ' + g(stats.gems),
    '',
    'XP to next: ' + g(game.formatNumber(stats.nextXp)) + ' [' + g(xpBar) + '] ' + g(stats.xpPercent + '%'),
    '',
    '(R)eturn to town',
    ''
  ]);
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
  
  const lines = [
    '',
    r('  Warriors In The Realm Now'),
    border()
  ];

  if (allPlayers.length === 0) {
    lines.push('  No warriors currently online');
  } else {
    allPlayers.forEach((p, i) => {
      const dead = p.dead ? ' ' + r('(DEAD)') : '';
      const inn = p.stayinn ? ' [INN]' : '';
      const lvl = p.level.toString().padStart(2, ' ');
      lines.push(' ' + w(lvl) + ' ' + p.name + ' - Level ' + g(p.level) + ' ' + game.classNames[p.class] + dead + inn);
    });
  }
  
  lines.push(border());
  lines.push('  Total warriors: ' + g(allPlayers.length));
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
  lines.push(w('(A)ttack (R)un'));
  lines.push('');

  sendLines(nick, lines);
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
    game.incrementSeenMaster(nick);
    
    lines.push(border());
    lines.push('You have defeated ' + monster.name + '!');
    lines.push('You gain ' + g(xpGain) + ' experience!');
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
    game.killPlayer(nick, 10);
    
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

  game.setPlayerHp(nick, newPlayerHp);
  
  lines.push('');
  lines.push('HP: (' + g(newPlayerHp) + ' of ' + g(stats.maxhp) + ') - Master HP: (' + g(monster.hp) + ' of ' + g(monster.maxhp) + ')');
  lines.push('');
  lines.push(w('(A)ttack (R)un'));
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
    p.dead === 0
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
    p.dead === 0
  );

  if (targetIndex < 1 || targetIndex > onlinePlayers.length) {
    sendNotice(nick, 'Invalid player number!');
    showSlaughter(nick);
    return;
  }

  const target = onlinePlayers[targetIndex - 1];
  const stats = game.getPlayerStats(nick);

  if (stats.pfights <= 0) {
    const player = loadPlayer(nick);
    const now = Date.now();
    if (player.pfights_timer && now < player.pfights_timer) {
      const minutesLeft = Math.ceil((player.pfights_timer - now) / 60000);
      sendNotice(nick, 'No player fights left! Try again in ' + minutesLeft + ' minute(s).');
    } else {
      player.pfights = 3;
      player.pfights_timer = now + (60 * 60 * 1000);
      savePlayer(nick, player);
      sendNotice(nick, 'You have ' + player.pfights + ' player fights now!');
    }
    showSlaughter(nick);
    return;
  }

  if (target.stayinn) {
    sendNotice(nick, target.name + ' is safe at the Inn!');
    showSlaughter(nick);
    return;
  }

  const targetPlayer = game.getPlayerByName(target.name);
  const targetWeapon = targetPlayer ? (game.weapons[targetPlayer.weapon_num - 1]?.name || 'Fists') : 'Fists';
   
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
    sendDirectNotice(targetNick, warnMsg);
  }

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
  lines.push(w('(A)ttack (R)un'));
  lines.push('');

  sendLines(nick, lines);
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
    player.gold += goldStolen;
    player.pfights--;
    if (player.pfights <= 0) {
      player.pfights_timer = Date.now() + (60 * 60 * 1000);
    }
    savePlayer(nick, player);

    const loserNick = getPlayerNick(monster.name);
    const targetPlayer = loserNick ? loadPlayer(loserNick) : null;
    if (targetPlayer) {
      targetPlayer.gold -= goldStolen;
      targetPlayer.dead = 1;
      targetPlayer.dead_until = Date.now() + (10 * 60 * 1000);
      targetPlayer.hp = 1;
      savePlayer(loserNick, targetPlayer);
    }
    
    lines.push(border());
    lines.push('You have defeated ' + monster.name + '!');
    lines.push('You steal ' + g(goldStolen) + ' gold!');
    lines.push(border());
    lines.push('');
    
    const winnerChar = loadPlayer(nick);
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
    game.killPlayer(nick, 10);
    
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
  
  lines.push('');
  lines.push('HP: (' + g(newPlayerHp) + ' of ' + g(stats.maxhp) + ') - ' + monster.name + ' HP: (' + g(monster.hp) + ' of ' + g(monster.maxhp) + ')');
  lines.push('');
  lines.push(w('(A)ttack (R)un'));
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
    if (player.pfights_timer && now >= player.pfights_timer) {
      player.pfights = 3;
      player.pfights_timer = null;
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
  lines.push(w('(A)ttack (S)tats (R)un'));
  lines.push('');
  lines.push(r('The Forest') + w('  (A,R,Q) (? for menu)'));
  
  sendLines(nick, lines);
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
    
    lines.push(border());
    lines.push('You have killed ' + monster.name + '!');
    lines.push('');
    lines.push('You receive ' + g(game.formatNumber(reward.gold)) + ' gold and ' + g(reward.xp) + ' experience!');
    
    if (reward.gem) {
      lines.push('');
      lines.push('  You found a ' + r('GEM') + '!');
    }
    
    if (reward.levelUp && reward.levelUp.levelUp) {
      lines.push('');
      lines.push(r('********** LEVEL UP! **********'));
      lines.push('You are now level ' + g(reward.levelUp.newLevel) + '!');
      lines.push('HP: ' + g(reward.levelUp.gains.hp) + '  Str: ' + g(reward.levelUp.gains.str) + '  Def: ' + g(reward.levelUp.gains.def));
      lines.push(r('*******************************'));
    }
    
    lines.push(border());
    lines.push('');
    
    userState.currentMonster = null;
    flushQueue(nick);
    sendLines(nick, lines);
    showForest(nick);
    return;
  } else if (result.defeat) {
    const loss = game.loseMonsterFight(nick, monster.gold);
    
    lines.push(border());
    lines.push('You have been killed by ' + monster.name + '!');
    lines.push('');
    lines.push('You lost ' + g(game.formatNumber(loss.lostGold)) + ' gold on hand...');
    lines.push('');
    lines.push('You are dead for 10 minutes!');
    lines.push(border());
    lines.push('');
    
    userState.currentMonster = null;
    flushQueue(nick);
    sendLines(nick, lines);
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
  
  clearMessageQueue(nick);

  const userState = getState(nick);
  const state = userState.state;
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
        case 'v': case 'V': showStats(nick); break;
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
        case 'r': case 'R': showMainMenu(nick); break;
        case 'q': case 'Q':
          sendNotice(nick, 'Goodbye! Type !lord to return.');
          setPlayerOffline(nick);
          clearState(nick);
          break;
        case '?': showForest(nick); break;
        default:
          sendNotice(nick, 'The Forest - L,H,R,Q');
          break;
      }
      break;

    case PLAYER_STATES.FOREST_EVENT:
      switch (cmdLower) {
        case 'r': case 'R':
          userState.temp = {};
          showForest(nick);
          break;
        default:
          sendNotice(nick, 'Press R to return to the forest.');
          break;
      }
      break;

    case PLAYER_STATES.FIGHT:
      flushQueue(nick);
      switch (cmdLower) {
        case 'a': case 'A':
        case '':
          processAttack(nick);
          break;
        case 'r': case 'R':
          processRun(nick);
          break;
        case 'q': case 'Q':
          userState.currentMonster = null;
          showMainMenu(nick);
          break;
        default:
          sendNotice(nick, 'Forest Fight - A,R,Q');
          break;
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
        sendNotice(nick, 'Enter weapon number to sell:');
        setState(nick, PLAYER_STATES.WEAPONS_SELL);
      }
      if (cmdLower === '?') {
        showWeapons(nick);
        break;
      }
      sendNotice(nick, 'King Arthurs Weapons - B,S,R,Q');
      break;

    case PLAYER_STATES.WEAPONS_BUY:
      const wNum = parseInt(cmd);
      if (!isNaN(wNum) && wNum >= 1 && wNum <= game.weapons.length) {
        const result = game.buyWeapon(nick, wNum);
        if (result.success) {
          sendNotice(nick, 'You bought ' + result.weapon + ' for ' + g(game.formatNumber(result.cost)) + ' gold!');
        } else {
          sendNotice(nick, result.error);
        }
      } else {
        sendNotice(nick, 'Invalid weapon number!');
      }
      showWeapons(nick);
      break;

    case PLAYER_STATES.WEAPONS_SELL:
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
        sendNotice(nick, 'Enter armor number to sell:');
        setState(nick, PLAYER_STATES.ARMOR_SELL);
      }
      if (cmdLower === '?') {
        showArmor(nick);
        break;
      }
      sendNotice(nick, 'Abduls Armour - B,S,R,Q');
      break;

    case PLAYER_STATES.ARMOR_BUY:
      const aNum = parseInt(cmd);
      if (!isNaN(aNum) && aNum >= 1 && aNum <= game.armors.length) {
        const result = game.buyArmor(nick, aNum);
        if (result.success) {
          sendNotice(nick, 'You bought ' + result.armor + ' for ' + g(game.formatNumber(result.cost)) + ' gold!');
        } else {
          sendNotice(nick, result.error);
        }
      } else {
        sendNotice(nick, 'Invalid armor number!');
      }
      showArmor(nick);
      break;

    case PLAYER_STATES.ARMOR_SELL:
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
      showBank(nick);
      break;

    case PLAYER_STATES.BANK_WITHDRAW:
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
      flushQueue(nick);
      if (cmdLower === 'a' || cmdLower === '') {
        processMasterAttack(nick);
        break;
      }
      if (cmdLower === 'r') {
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
      const targetNum = parseInt(cmd);
      if (!isNaN(targetNum) && targetNum > 0) {
        startPlayerFight(nick, targetNum);
        break;
      }
      sendNotice(nick, 'Slaughter - Enter number or R,Q');
      break;

    case PLAYER_STATES.FIGHT_PLAYER:
      flushQueue(nick);
      if (cmdLower === 'a' || cmdLower === 'A' || cmdLower === '') {
        processPlayerAttack(nick);
        break;
      }
      if (cmdLower === 'r' || cmdLower === 'R') {
        userState.currentMonster = null;
        showSlaughter(nick);
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
});

client.addListener('pm', (nick, text) => {
  console.log('PM from ' + nick + ': ' + JSON.stringify(text));
  
  const parts = text.trim().split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);
  console.log('PM parsed: cmd="' + cmd + '", args=' + JSON.stringify(args));
  
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
