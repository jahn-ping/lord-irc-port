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
  CONFIRM_LEAVE_HUT: 'confirm_leave_hut',
  INN_CONVO: 'inn_convo',
  INN_CONVO_ADD: 'inn_convo_add',
  INN_ANNOUNCEMENT: 'inn_announcement',
  INN_SETH: 'inn_seth',
  INN_VIOLET: 'inn_violet',
  INN_ROOM: 'inn_room',
  INN_ROOM_ONLY: 'inn_room_only',
  INN_STATS: 'inn_stats',
  INN_NEWS: 'inn_news',
  INN_BARTENDER: 'inn_bartender',
  INN_BARTENDER_GEMS: 'inn_bartender_gems',
  INN_BARTENDER_GEMS_BUY: 'inn_bartender_gems_buy',
  INN_BARTENDER_BRIBE: 'inn_bartender_bribe',
  INN_BARTENDER_GEMS_DRANK: 'inn_bartender_gems_drank',
  FOREST_OLDMAN: 'forest_oldman',
  FOREST_SCROLL: 'forest_scroll',
  FOREST_SCROLL_LOCATION: 'forest_scroll_location',
  FOREST_HAG: 'forest_hag',
  FOREST_EVENT_CONTINUE: 'forest_event_continue',
  DARK_CLOAK: 'dark_cloak',
  DARK_CLOAK_BARTENDER: 'dark_cloak_bartender',
  DARK_CLOAK_CONFIRM_LEAVE: 'dark_cloak_confirm_leave',
  DARK_CLOAK_GAMBLE: 'dark_cloak_gamble',
  DARK_CLOAK_GUESS: 'dark_cloak_guess',
  OTHER_PLACES: 'other_places',
  DRAGON: 'dragon',
  BARAK_HOUSE: 'barak_house',
  BARAK_KNOCK: 'barak_knock',
  BARAK_BREEZE: 'barak_breeze',
  BARAK_PLAY: 'barak_play',
  BARAK_CHESTS: 'barak_chests',
  BARAK_READ: 'barak_read',
  BARAK_LAUGH: 'barak_laugh',
  BARAK_WALKIN: 'barak_walkin',
  BARAK_APOLOGIZE: 'barak_apologize',
  BARAK_CONFIRM_LEAVE: 'barak_confirm_leave'
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

function calculateFirstStrikeChance(player, target) {
  if (!player || !target) return 50;

  const playerPower = player.level * 10 + player.str;
  const targetPower = target.maxhp || target.hp || 50;

  const ratio = targetPower / Math.max(playerPower, 1);
  
  let chance = 70 - (ratio * 15) + (player.level * 1.5);
  
  chance = Math.max(10, Math.min(90, chance));
  
  return chance;
}

const FLOOD_DELAY = 2000;
const FLOOD_DELAY_SLOW = 2500;
const FLOOD_DELAY_MASTER = 1500;
const FLOOD_DELAY_MAIN = 2000;
const FLOOD_DELAY_TRAINING_MAIN = 2000;
const FLOOD_DELAY_TRAINING_CHALLENGE = 1500;
const FLOOD_DELAY_TRAINING_QUESTION = 1500;

const messageQueue = new Map();
const queueTimeouts = new Map();
const queueVersion = new Map();
const userStateDelays = new Map();

const innConvo = [];
const innNewConvo = [];
const innAnnouncements = [];
const MAX_ANNOUNCEMENTS = 10;

const baraksBooks = {
  'Dirty Deeds': ['Page 1: The art of mischief...', 'Page 2: Be sneaky!'],
  'The Art Of Thievery': ['"The Art Of Thievery" by Chance.', ' Select your targets carefully. Don\'t steal from level', ' 12 people - being beheaded isn\'t particularly fun.'],
  'Dragon Slaying': ['Chapter 1: How to slay a dragon...', 'Chapter 2: Dont.']
};

const baraksBooksPerks = {
  'Dirty Deeds': ['hp', 1],
  'The Art Of Thievery': ['Thief', 1],
  'Dragon Slaying': ['hp', 2]
};

let barakChests = [];
let barakEarnedGold = 0;
let barakSelectedBook = -1;

const sethSongsMale = [
  [
    '..."Waiting in the forest waiting for his prey"...',
    '..."{0} didn\'t care what they would say"...',
    '..."He killed in the town, the lands"...',
    '..."He wanted evil\'s blood on his hands"...',
    '',
    'The song makes you feel powerful!'
  ],
  [
    '..."A true man was {0}, a warrior proud"...',
    '..."He voiced his opinions meekly, never very loud"...',
    '..."But he ain\'t no wimp, he took Violet to bed"...',
    '..."He\'s definately a man, at least that\'s what she said!"...',
    '',
    'The song makes you glad you are male!'
  ]
];

const sethSongsFemale = [
  [
    '..."{0} was a warrior, a queen"...',
    '..."She was a beauty, and she was mean"...',
    '..."She could melt a heart, at a glance"...',
    '..."And men would pay, to see her dance!"...',
    '',
    'The song makes you feel pretty!'
  ]
];

const ROOM_COST = 400;
const HORSE_NONE = 0;
const HORSE_WHITE = 1;
const HORSE_BLACK = 2;

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

function queueMessage(nick, message, delayMs = null) {
  if (!messageQueue.has(nick)) {
    messageQueue.set(nick, []);
    queueVersion.set(nick, (queueVersion.get(nick) || 0) + 1);
  }
  const queue = messageQueue.get(nick);
  queue.push({ text: message, delay: delayMs });
  
  if (queue.length === 1) {
    scheduleNextMessage(nick);
  }
}

function scheduleNextMessage(nick) {
  if (queueTimeouts.has(nick)) {
    clearTimeout(queueTimeouts.get(nick));
    queueTimeouts.delete(nick);
  }
  
  const queue = messageQueue.get(nick);
  if (!queue || queue.length === 0) return;
  
  // Get delay from the first message in queue
  const userState = getState(nick);
  let baseDelay = FLOOD_DELAY;
  if (userState && userState.displayMode) baseDelay = FLOOD_DELAY_SLOW;
  
  const msg = queue[0];
  const delay = msg?.delay ?? baseDelay;
  
  const timeout = setTimeout(() => processQueue(nick), delay);
  queueTimeouts.set(nick, timeout);
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
  
  const msg = queue.shift();
  if (queueVersion.get(nick) !== version) {
    return;
  }
  
  sendImmediate(nick, msg.text);
  
  if (queue.length > 0) {
    scheduleNextMessage(nick);
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

function sendLines(nick, lines, delayMs = null) {
  if (lines.length > 0) {
    if (!queueTimeouts.has(nick)) {
      clearMessageQueue(nick);
    }
  }
  lines.forEach(line => {
    let delay = FLOOD_DELAY;
    if (delayMs !== null) {
      delay = delayMs;
    } else if (line.includes('.') && line.includes("'") && line.length > 50) {
      delay = FLOOD_DELAY_SLOW;
    } else if (line.includes('MASTER FIGHT') || line.includes('You have challenged') || line.includes('Master HP:')) {
      delay = FLOOD_DELAY_MASTER;
    } else if (line.includes('Legend of the Red Dragon') || line.includes('Town Square')) {
      delay = FLOOD_DELAY_MAIN;
    } else if (line.includes('Turgon')) {
      delay = FLOOD_DELAY_TRAINING_MAIN;
    } else if (line.includes('says:')) {
      delay = FLOOD_DELAY_TRAINING_QUESTION;
    }
    queueMessage(nick, line, delay);
  });
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

function showOtherPlaces(nick) {
  const player = loadPlayer(nick);
  if (!player) return;

  const lines = [
    '',
    '  Other Places',
    border(),
    ''
  ];

  if (player.level >= 12) {
    lines.push(w('(D)ragon Lair'));
  } else {
    lines.push('  You must be level 12 to challenge the Dragon.');
  }

  if (player.baraks_visited_today === 0) {
    lines.push(w('(B)arak\'s House'));
  } else {
    lines.push('  You\'ve visited Barak today.');
  }

  lines.push('');
  lines.push(w('(R)eturn to town'));
  lines.push('');
  lines.push(statLine(nick));
  lines.push(r('Other Places') + w('  (D,B,R) (? for menu)'));
  lines.push('');

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.OTHER_PLACES);
}

function showDragon(nick) {
  const player = loadPlayer(nick);
  if (!player) return;

  const lines = [
    '',
    '  The Red Dragon',
    border(),
    ''
  ];

  if (player.level < 12) {
    lines.push('You must be level 12 to challenge the Dragon.');
    lines.push('');
    lines.push(w('(R)eturn'));
    lines.push('');
    sendLines(nick, lines);
    setState(nick, PLAYER_STATES.OTHER_PLACES);
    return;
  }

  if (player.seen_dragon === 1) {
    lines.push('You have already faced the Dragon today.');
    lines.push('');
    lines.push(w('(R)eturn'));
    lines.push('');
    sendLines(nick, lines);
    setState(nick, PLAYER_STATES.OTHER_PLACES);
    return;
  }

  player.seen_dragon = 1;
  savePlayer(nick, player);

  const dragonHp = 15000;
  const dragonStr = 2000;

  if (Math.random() * 100 > 97) {
    lines.push('You approach the lair of the Red Dragon concealed by');
    lines.push('darkness. The mountain looms high before you. In the');
    lines.push('front is a huge cave... peering from that cave are');
    lines.push('two blood red eyes. Those glaring eyes strike fear');
    lines.push('into you...and the dragons fire-hot breath warms');
    lines.push('you even from this far away.');
  } else {
    lines.push('The dragon laughs and burns you to ashes!');
    lines.push('You were no match for the Red Dragon.');
    lines.push('');
    lines.push('You wake up back at the Inn, dead.');
    player.dead = 1;
    player.dead_until = Date.now() + (10 * 60 * 1000);
    player.killed_by = 'Red Dragon';
    player.hp = 1;
    savePlayer(nick, player);
  }

  lines.push('');
  lines.push(w('(R)eturn'));
  lines.push('');

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.OTHER_PLACES);
}

function showBarakHouse(nick) {
  const lines = [
    '',
    '  Visiting A Friend',
    border(),
    '  Feeling a might lonely, you decide to pay a visit to a',
    '  dear friend. It\'s no short journey and you are quite',
    '  tired when you arrive.',
    '',
    w('(K)nock on the door'),
    w('(W)alk in like you own the place'),
    w('(H)ead back to town'),
    '',
    w('You decide to... [K] :'),
    ''
  ];

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.BARAK_HOUSE);
}

function showBarakKnock(nick) {
  const lines = [
    '',
    '  Visiting Old Friends',
    border(),
    '  Barak opens the door!',
    '',
    '"Whadaya ya want, kid?" Barak asks harshly.',
    '',
    w('(J)ust wanted to shoot the breeze, friend!'),
    w('(C)an I borrow a cup of sugar, neighbor?'),
    w('(Y)our beard went out of style centuries ago.'),
    '',
    w('You decide to say... [J] :'),
    ''
  ];

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.BARAK_KNOCK);
}

function showBarakBreeze(nick) {
  const lines = [
    '',
    '  Chatting With Barak',
    border(),
    '"Shoot the breeze?" Barak asks, obviously puzzled.',
    '',
    w('(C)an I read some of your books?'),
    w('(W)ant to play a game?'),
    '',
    w('You decide to say... [W] :'),
    ''
  ];

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.BARAK_BREEZE);
}

function showBarakPlay(nick) {
  const lines = [
    '',
    '"Game? Ok - Uh, want to play \'let\'s clean out',
    ' the basement\'?',
    '',
    w('(O)k, uh, that sounds like a really fun game.'),
    w('(F)orget it. I\'m not that stupid.'),
    '',
    w('You decide to... [O] :'),
    ''
  ];

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.BARAK_PLAY);
}

function showBarakChests(nick) {
  barakChests = [];
  barakEarnedGold = 0;
  const maxGold = 100 * (loadPlayer(nick)?.level || 1);
  for (let i = 0; i < 6; i++) {
    barakChests.push(random(0, maxGold) + 25);
  }

  const lines = [
    '',
    'There are six chests to choose from:',
    '',
    w('(1) (2) (3) (4) (5) (6)'),
    '',
    w('You choose ... :'),
    ''
  ];

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.BARAK_CHESTS);
}

function showBarakRead(nick) {
  const lines = [
    '',
    '"Books?! BOOKS?! You know I can\'t read!" Barak',
    ' shouts, tears streaming out of his eyes.',
    '',
    w('(L)augh ......... at poor Barak.'),
    w('(O)ffer to read him a story.'),
    '',
    w('You decide to say... [O] :'),
    ''
  ];

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.BARAK_READ);
}

function showBarakLaugh(nick) {
  const player = loadPlayer(nick);
  if (!player) return;

  player.gems = (player.gems || 0) + 1;
  player.baraks_visited_today = 1;
  savePlayer(nick, player);

  const lines = [
    '',
    'You can\'t stop yourself from bellowing out in',
    'laughter. Barak\'s face falls. Then turns to',
    'stone.',
    '',
    'He then pulls out an Able\'s Sword!',
    '',
    'Barak Hunts you down like a dog.',
    '',
    ' YOU ARE DEFEATED.',
    border(),
    'Barak laughs as warm blood flows down your cheek.',
    'Maybe next time?',
    '',
    'YOU FEEL AWFULLY WEAK.',
    '',
    'You trudge back home...',
    ''
  ];

  sendLines(nick, lines);
  showMainMenu(nick);
}

function showBarakWalkin(nick) {
  const lines = [
    '',
    '  Uh oh...',
    border(),
    '  You saunter in like you own the place. Barak stares',
    '  at you in wonder as you help yourself to some meat',
    '  and cheese sitting on the table.',
    '  "You insolent pubby! You will die for this." the',
    '  bearded man growls.',
    '',
    w('(A)pologize and leave him be'),
    w('(K)ick him in the shin and have a good laugh'),
    '',
    w('You decide to... [A] :'),
    ''
  ];

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.BARAK_WALKIN);
}

function showBarakApologize(nick) {
  const player = loadPlayer(nick);
  if (!player) return;

  player.charm = Math.max(0, (player.charm || 1) - 1);
  player.baraks_visited_today = 1;
  savePlayer(nick, player);

  const lines = [
    '',
    '"Oh, I thought you weren\'t home. My apologies."',
    '',
    'Barak throws you out of the house. You land in',
    'a pile of manure.',
    '',
    'You trudge back home...',
    ''
  ];

  sendLines(nick, lines);
  showMainMenu(nick);
}

function showForest(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  const player = loadPlayer(nick);
  const hasHorse = player && player.horse !== HORSE_NONE;
  const horseName = hasHorse ? (player.horse === HORSE_WHITE ? 'White' : 'Black') : '';

  const lines = [
    '',
    '  Legend of the Red Dragon - Forest',
    border(),
    '  The murky forest stands before you - a giant maw of',
    '  gloomy darkness ever beckoning.',
    ''
  ];

  if (hasHorse) {
    lines.push('  ' + g(horseName) + ' Mare' + '`% is tethered nearby.');
  }

  lines.push(w('(L)ook for something to kill'));
  lines.push(w('(H)ealers hut'));
  lines.push(w('(S)tats'));
  lines.push(w('(R)eturn to town'));
  lines.push('');

  if (hasHorse) {
    lines.push(w('(T)ake Horse to DarkCloak Tavern'));
    lines.push('');
    lines.push(statLine(nick));
    lines.push(r('The Forest') + w('  (L,H,S,R,T,Q) (? for menu)'));
  } else {
    lines.push(statLine(nick));
    lines.push(r('The Forest') + w('  (L,H,S,R,Q) (? for menu)'));
  }

  lines.push('');
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
  const classNames = ['Warrior', 'Death Knight', 'Mystic', 'Thief'];
  const className = classNames[player.class] || 'Warrior';

  const horseName = player.horse === HORSE_WHITE ? 'White' : (player.horse === HORSE_BLACK ? 'Black' : '');

  const lines = [
    '',
    stats.name + "'s Stats...",
    border(),
    'Experience    : ' + g(game.formatNumber(stats.xp)),
    'Level         : ' + g(stats.level) + '     ' + w('Hit Points  : ' + stats.hp + ' / ' + stats.maxhp),
    'Forest Fights: ' + g(stats.fights) + '     ' + w('Player Fights: ' + stats.pfights),
    'Gold In Hand  : ' + g(game.formatNumber(stats.gold)) + '     ' + w('Gold In Bank : ' + game.formatNumber(stats.bank)),
    'Weapon        : ' + g(stats.weapon) + '     ' + w('Atk Strength : ' + stats.str),
    'Armour        : ' + g(stats.armor) + '     ' + w('Def Strength : ' + stats.def),
    'Charm         : ' + g(stats.charm) + '     ' + w('Gems         : ' + stats.gems),
    'Fairies       : ' + g(player.fairies || 0),
    ''
  ];

  if (player.horse !== HORSE_NONE) {
    lines.push('Horse         : ' + g(horseName) + ' Mare');
  }

  if (player.skill_charges_max > 0) {
    const timers = getSkillChargeTimers(player);
    if (timers.length > 0) {
      lines.push('Skill Charges : ' + player.skill_charges_active + '/' + player.skill_charges_max + ' (refreshing: ' + timers.join(', ') + ')');
    } else {
      lines.push('Skill Charges : ' + player.skill_charges_active + '/' + player.skill_charges_max);
    }
  }

  lines.push('');
  lines.push('(R)eturn to town');
  lines.push('');

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.STATS);
}

function pad(str, len) {
  while (str.length < len) str += ' ';
  return str;
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

  const player = loadPlayer(nick);
  const fairyCount = player.fairies || 0;

  const lines = [
    '',
    '  Ye Olde Bank',
    border(),
    '  The bank is dark and smells of old money.',
    '',
    '  Your gold: ' + g(game.formatNumber(stats.gold)),
    '  Bank balance: ' + g(game.formatNumber(stats.bank)),
    ''
  ];

  if (fairyCount > 0) {
    lines.push(w('(B)ribe the guard (' + fairyCount + ' fair' + (fairyCount === 1 ? 'y' : 'ies') + ')'));
  }

  lines.push(w('(D)eposit gold'));
  lines.push(w('(W)ithdraw gold'));
  lines.push(w('(R)eturn to town'));
  lines.push('');
  lines.push(statLine(nick));

  if (fairyCount > 0) {
    lines.push(r('Ye Olde Bank') + w('  (B,D,W,R,Q) (? for menu)'));
  } else {
    lines.push(r('Ye Olde Bank') + w('  (D,W,R,Q) (? for menu)'));
  }

  lines.push('');

  sendLines(nick, lines);
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
  const player = loadPlayer(nick);
  if (!player) return;

  const now = Date.now();
  const violetReady = !player.violet_timer || now >= player.violet_timer;
  const timeLeft = player.violet_timer ? Math.max(0, player.violet_timer - now) : 0;
  const hoursLeft = Math.floor(timeLeft / 3600000);
  const minsLeft = Math.floor((timeLeft % 3600000) / 60000);

  const lines = [
    '',
    '  Legend of the Red Dragon - The Inn',
    border(),
    ''
  ];

  if (player.stayinn) {
    lines.push('  You are in your room at the inn.');
    lines.push('  You are safe from attacks, but you must leave');
    lines.push('  to do anything else.');
    lines.push('');
    lines.push(w('(L)eave the inn'));
    lines.push('');
    lines.push(statLine(nick));
    lines.push(r('The Inn - Room') + w('  (L) (? for menu)'));
    lines.push('');
    sendLines(nick, lines);
    setState(nick, PLAYER_STATES.INN_ROOM_ONLY);
    return;
  }

  lines.push('  You enter the inn and are immediately hailed by');
  lines.push('  several of the patrons. You respond with a wave and');
  lines.push('  scan the room. The room is filled with smoke from');
  lines.push('  the torches that line the walls. Oaken tables and');
  lines.push('  chairs are scattered across the room. You smile as');
  lines.push('  the well-rounded Violet brushes by you....');
  lines.push('');
  lines.push('  Room rate: ' + g('400') + ' gold/night');
  lines.push('');
  lines.push(w('(C)onverse with patrons'));

  if (player.sex === 0) {
    if (violetReady) {
      lines.push(w('(F)lirt with Violet'));
    } else {
      lines.push('  (F)lirt with Violet [resets in ' + hoursLeft + 'h ' + minsLeft + 'm]');
    }
    lines.push(w('(T)alk to the Bartender'));
    lines.push(w('(G)et a Room'));
    lines.push(w('(V)iew Your Stats'));
    lines.push(w('(H)ear Seth Able the Bard'));
    lines.push(w('(M)ake Announcement'));
    lines.push(w('(R)eturn to Town'));
    lines.push('');
    lines.push(statLine(nick));
    lines.push(r('The Inn') + w('  (C,F,T,G,V,H,M,R) (? for menu)'));
  } else {
    if (violetReady) {
      lines.push(w('(F)lirt with Seth'));
    } else {
      lines.push('  (F)lirt with Seth [resets in ' + hoursLeft + 'h ' + minsLeft + 'm]');
    }
    lines.push(w('(T)alk to the Bartender'));
    lines.push(w('(G)et a Room'));
    lines.push(w('(V)iew Your Stats'));
    lines.push(w('(H)ear Seth Able the Bard'));
    lines.push(w('(M)ake Announcement'));
    lines.push(w('(R)eturn to Town'));
    lines.push('');
    lines.push(statLine(nick));
    lines.push(r('The Inn') + w('  (C,F,T,G,V,H,M,R) (? for menu)'));
  }
  lines.push('');
  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.INN);
}

function showInnConvo(nick) {
  const lines = [
    '',
    '  Chat with the Patrons',
    border(),
    ''
  ];

  if (innAnnouncements.length > 0) {
    lines.push(r('*** ANNOUNCEMENTS ***'));
    for (let i = 0; i < innAnnouncements.length; i++) {
      lines.push(innAnnouncements[i]);
    }
    lines.push('');
  }

  if (innConvo.length === 0 && innNewConvo.length === 0) {
    lines.push('  The bar is quiet... no one is talking.');
    lines.push('');
  } else {
    const newItems = innNewConvo.length;
    if (newItems > 14) {
      innNewConvo.splice(innNewConvo.length - 14, 14);
    }

    const len = innConvo.length - newItems;
    for (let i = newItems; i < len; i += 2) {
      lines.push(innConvo[i] + ':');
      lines.push(innConvo[i + 1]);
    }

    for (let i = 0; i < innNewConvo.length; i += 2) {
      lines.push(innNewConvo[i] + ':');
      lines.push(innNewConvo[i + 1]);
    }
  }

  lines.push('');
  lines.push(w('(A)dd comment'));
  lines.push(w('(C)ontinue'));
  lines.push(w('(R)eturn to inn'));
  lines.push('');
  lines.push(r('Well? (A,C,R) (? for menu)'));
  lines.push('');

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.INN_CONVO);
}

function showMakeAnnouncement(nick) {
  const lines = [
    '',
    '  Make an Announcement',
    border(),
    '',
    '  Type your announcement below.',
    '  Maximum 75 characters.',
    '',
    r('Type your announcement (R to cancel) (? for menu)'),
    ''
  ];

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.INN_ANNOUNCEMENT);
}

function addAnnouncement(nick, message) {
  if (!message || message.trim().length === 0) return false;

  const player = loadPlayer(nick);
  if (!player) return false;

  const announcement = player.name + '`%: ' + message.trim().substring(0, 75);
  innAnnouncements.unshift(announcement);

  if (innAnnouncements.length > MAX_ANNOUNCEMENTS) {
    innAnnouncements.pop();
  }

  return true;
}

function showInnBartender(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  const lines = [
    '',
    '  Legend of the Red Dragon - Bartender',
    border(),
    '  The bartender escorts you into a back room.',
    '"I have heard yer name before kid... what do ya',
    ' want to talk about?"',
    ''
  ];

  lines.push(w('(V)iolet'));
  lines.push(w('(G)ems'));
  lines.push(w('(B)ribe'));
  lines.push(w('(R)eturn to Bar'));
  lines.push('');
  lines.push(r('"Well?" The bartender inquires. (? for menu)'));
  lines.push('');

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.INN_BARTENDER);
}

function showInnBartenderGems(nick) {
  const player = loadPlayer(nick);
  if (!player) return;

  const lines = [
    '',
    '  Bartender - Gems',
    border(),
    ''
  ];

  if (player.gems === 0) {
    lines.push('"You have no gems."');
    lines.push('');
    lines.push(r('(R)eturn (? for menu)'));
    lines.push('');
    sendLines(nick, lines);
    setState(nick, PLAYER_STATES.INN_BARTENDER_GEMS);
    return;
  }

  const maxElixirs = Math.floor(player.gems / 2);
  lines.push('"You have Gems, eh? I\'ll give ya a pint of magic');
  lines.push(' elixir for two."');
  lines.push('');
  lines.push('Buy how many elixirs? [' + maxElixirs + ']');
  lines.push('Or (R)eturn to bar');
  lines.push('');
  lines.push(r('Well? (How many? [' + maxElixirs + ']), (R) (? for menu)'));
  lines.push('');

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.INN_BARTENDER_GEMS);
}

function showInnBartenderBribe(nick) {
  const player = loadPlayer(nick);
  if (!player) return;

  const bribeCost = player.level * 1600;
  const players = game.getPlayerList();
  const roomPlayers = players.filter(p => 
    p.name.toLowerCase() !== nick.toLowerCase() && 
    p.dead === 0 &&
    p.stayinn === 1
  );

  const lines = [
    '',
    '  Bartender - Fight Inn Guests',
    border(),
    '',
    '"Ahh..You want to fight the inn guests?"',
    '"That\'ll cost ya ' + bribeCost + ' gold!!"',
    ''
  ];

  if (roomPlayers.length === 0) {
    lines.push('  No guests in rooms right now.');
  } else {
    lines.push('  Guests in rooms:');
    roomPlayers.forEach((p, i) => {
      lines.push('(' + g(i + 1) + ') ' + p.name + ' - Lvl ' + g(p.level));
    });
  }

  lines.push('');
  lines.push(w('(R)eturn to bar'));
  lines.push('');
  lines.push(r('Well? (number or R) (? for menu)'));
  lines.push('');

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.INN_BARTENDER_BRIBE);
}

function showSethAble(nick, returnTo = 'inn') {
  const player = loadPlayer(nick);
  if (!player) return;

  const userState = getState(nick);
  userState.temp = { sethReturn: returnTo };

  const now = Date.now();
  const sethReady = !player.seenbard || now >= player.seenbard;
  const timeLeft = player.seenbard ? Math.max(0, player.seenbard - now) : 0;
  const hoursLeft = Math.floor(timeLeft / 3600000);
  const minsLeft = Math.floor((timeLeft % 3600000) / 60000);

  const lines = [
    '',
    '  Seth Able the Bard',
    border(),
    '  Seth Able eyes you as you sit down next to him.',
    ''
  ];

  if (player.sex === 1) {
    lines.push('  You can\'t help but notice that Seth Able is a');
    lines.push('  very handsome, very well built individual.');
    lines.push('');
  }

  if (sethReady) {
    lines.push(w('(A)sk Seth to sing'));
  } else {
    lines.push('  (A)sk Seth to sing [resets in ' + hoursLeft + 'h ' + minsLeft + 'm]');
  }

  if (player.sex === 1) {
    lines.push(w('(F)lirt with Seth [Charm 1+]'));
    lines.push('');
    lines.push('Your Charm: ' + g(player.charm));
  }

  lines.push('');
  const sethPrompt = player.sex === 1 ? 'Well? (A,F,R) (? for menu)' : 'Well? (A,R) (? for menu)';
  lines.push(r(sethPrompt));
  lines.push('');

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.INN_SETH);
}

function sethSings(nick) {
  const player = loadPlayer(nick);
  if (!player) return;

  const now = Date.now();
  const lines = [''];

  if (player.seenbard && now < player.seenbard) {
    const timeLeft = player.seenbard - now;
    const hoursLeft = Math.floor(timeLeft / 3600000);
    const minsLeft = Math.floor((timeLeft % 3600000) / 60000);
    lines.push('"I\'m sorry, but my throat is too dry... Perhaps in ' + hoursLeft + 'h ' + minsLeft + 'm."');
    sendLines(nick, lines);
    showInn(nick);
    return;
  }

  player.seenbard = now + (60 * 60 * 1000);

  let song;
  if (player.sex === 0) {
    song = sethSongsMale[random(0, sethSongsMale.length - 1)];
  } else {
    song = sethSongsFemale[random(0, sethSongsFemale.length - 1)];
  }

  lines.push('(Seth clears his throat)');
  lines.push('');

  song.forEach(line => {
    lines.push(line.replace('{0}', player.name));
  });

  lines.push('');

  if (player.sex === 0) {
    const fightsGain = random(1, 3);
    player.fights = Math.min(500, player.fights + fightsGain);
    lines.push('You receive ' + g(fightsGain) + ' more forest fights for today!');
  } else {
    player.charm += 1;
    lines.push('You receive a charm point!');
  }

  savePlayer(nick, player);
  lines.push('');

  sendLines(nick, lines);
  showInn(nick);
}

function showViolet(nick, returnTo = 'inn') {
  const player = loadPlayer(nick);
  if (!player) return;

  const userState = getState(nick);
  userState.temp = { violetReturn: returnTo };

  const lines = [
    '',
    '  Violet',
    border(),
    ''
  ];

  if (player.marriedto && player.marriedto !== '') {
    lines.push('Violet is currently married to ' + player.marriedto);
    lines.push('');
    lines.push('Grizelda greets you instead...');
    lines.push('You find yourself with a hand full of cellulose...');
  } else {
    lines.push(w('(N)ever mind'));
    lines.push(w('(W)ink [Charm 1+]'));
    lines.push(w('(K)iss her hand [Charm 2+]'));
    lines.push(w('(P)eck her lips [Charm 4+]'));
    lines.push(w('(S)it on lap [Charm 8+]'));
    lines.push(w('(G)rab backside [Charm 16+]'));
    lines.push(w('(C)arry upstairs [Charm 32+]'));
    lines.push(w('(M)arry her [Charm 100+]'));
  }

  lines.push('');
  lines.push('Your Charm: ' + g(player.charm));
  lines.push('');
  lines.push(r('Well? (N,W,K,P,S,G,C,M,R) (? for menu)'));
  lines.push('');

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.INN_VIOLET);
}

function showInnRoom(nick) {
  const lines = [
    '',
    '  Get a room for ' + g(ROOM_COST) + ' gold?',
    border(),
    ''
  ];

  lines.push(w('(Y)es'));
  lines.push(w('(N)o'));
  lines.push('');
  lines.push(r('Get a room? (Y,N) (? for menu)'));
  lines.push('');

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.INN_ROOM);
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

function showDarkCloak(nick) {
  const stats = game.getPlayerStats(nick);
  if (!stats) return;

  sendLines(nick, [
    '',
    r('              Dark Cloak Tavern'),
    border(),
    '  A blazing fire warms your heart as well as your body',
    '  in this fragrant roadhouse. Many a wary traveler has',
    '  had the good fortune to find this cozy hostel, to',
    '  escape the harsh reality of the dense forest for a',
    '  few moments. You notice someone has etched something',
    '  in the table you are sitting at.',
    '',
    w('(C)onverse with The Patrons'),
    w('(D)aily News'),
    w('(E)xamine Etchings In Table'),
    w('(T)alk with Bartender'),
    w('(G)amble With Locals'),
    w('(R)eturn to Forest'),
    '',
    statLine(nick),
    r('Dark Cloak Tavern') + w('  (C,D,E,T,G,R) (? for menu)'),
    ''
  ]);
  setState(nick, PLAYER_STATES.DARK_CLOAK);
}

function showDarkCloakBartender(nick) {
  const player = loadPlayer(nick);
  if (!player) return;

  if (player.level <= 1) {
    sendLines(nick, [
      '',
      '  Legend of the Red Dragon - Bartender',
      border(),
      '  You find the bartender and ask him if he will talk',
      '  privately with you.',
      '',
      '"I don\'t recall ever hearing the name',
      player.name + '`% before! Get outta my face!"',
      '',
      w('(R)eturn to Bar'),
      ''
    ]);
    setState(nick, PLAYER_STATES.DARK_CLOAK);
    return;
  }

  const lines = [
    '',
    '  Legend of the Red Dragon - Bartender',
    border(),
    '  The bartender escorts you into a back room.',
    '"I have heard yer name before kid... what do ya',
    ' want to talk about?"',
    ''
  ];

  if (player.sex === 0) {
    lines.push(w('(V)iolet'));
  } else {
    lines.push(w('(S)eth'));
  }

  lines.push(w('(G)ems'));
  lines.push(w('(B)ribe'));
  lines.push(w('(C)hange your name'));
  lines.push(w('(R)eturn to Bar'));
  lines.push('');
  lines.push(r('"Well?" The bartender inquires. (? for menu)'));
  lines.push('');

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.DARK_CLOAK_BARTENDER);
}

function showDarkCloakGamble(nick) {
  const player = loadPlayer(nick);
  if (!player) return;

  const lines = [
    '',
    '  Gamble With Locals',
    border(),
    '  How much do you want to wager?',
    '',
    '  You have ' + g(player.gold) + ' gold.',
    '',
    w('(A)ll-in'),
    w('(R)eturn to bar'),
    ''
  ];
  lines.push(r('Wager amount (? for menu)'));
  lines.push('');

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.DARK_CLOAK_GAMBLE);
}

function showDarkCloakEtchings(nick) {
  const allPlayers = getAllPlayers();

  const lines = [
    '',
    '  Dark Cloak Tavern - Examine Etchings',
    border(),
    ''
  ];

  let foundAny = false;
  allPlayers.forEach((p) => {
    if (p.lays && p.lays > 0) {
      lines.push(p.name + '`% has ' + p.lays + ' lays');
      foundAny = true;
    }
  });

  if (!foundAny) {
    lines.push('  No one has made any marks on this table yet.');
  }

  lines.push('');
  lines.push(w('(R)eturn to Bar'));
  lines.push('');

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.DARK_CLOAK);
}

function showDarkCloakBartenderMenu(nick, cmd) {
  const player = loadPlayer(nick);
  if (!player) return;

  const isMale = player.sex === 0;
  const charPrompt = isMale ? 'V' : 'S';

  switch (cmd) {
    case 'r':
      showDarkCloak(nick);
      break;
    case 'v':
      if (isMale) {
        showViolet(nick, 'darkcloak');
      } else {
        clearMessageQueue(nick);
        showDarkCloakBartender(nick);
      }
      break;
    case 's':
      if (!isMale) {
        showSethAble(nick, 'darkcloak');
      } else {
        clearMessageQueue(nick);
        showDarkCloakBartender(nick);
      }
      break;
    case 'g':
      showInnBartenderGems(nick);
      break;
    case 'b':
      showInnBartenderBribe(nick);
      break;
    case 'c':
      sendLines(nick, [
        '',
        '  Change your name is not yet implemented.',
        ''
      ]);
      showDarkCloakBartender(nick);
      break;
    case '?':
      clearMessageQueue(nick);
      showDarkCloakBartender(nick);
      break;
    default:
      clearMessageQueue(nick);
      showDarkCloakBartender(nick);
  }
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
  let dailyNews = [];
  try {
    const newsData = fs.readFileSync('./dailyHappenings.json', 'utf8');
    const parsed = JSON.parse(newsData);
    dailyNews = parsed.dailyHappenings || [];
  } catch (e) {
    console.log('[NEWS] Could not load dailyHappenings.json:', e.message);
  }

  const lines = [
    '',
    '  The Daily Happenings....',
    border(),
    ''
  ];

  if (dailyNews.length === 0) {
    lines.push('  No news today.');
  } else {
    dailyNews.forEach(news => {
      lines.push('  ' + news);
    });
  }

  lines.push('');
  lines.push(border());
  lines.push('');

  sendLines(nick, lines);
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
  ], FLOOD_DELAY_TRAINING_MAIN);

  if (stats.level >= 12) {
    sendLines(nick, [
      '  You have reached the maximum level!',
      '  You are ready to fight the Red Dragon!',
      ''
    ], FLOOD_DELAY_TRAINING_MAIN);
  } else {
    sendLines(nick, [
      '  Next level: ' + g(stats.level + 1),
      '  XP needed: ' + g(game.formatNumber(stats.nextXp - stats.xp)),
      ''
    ], FLOOD_DELAY_TRAINING_MAIN);
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
    w('(C)hallenge Master'),
    w('(R)eturn to training'),
    '',
    r('Well? (C,R) (? for menu)'),
    ''
  ], FLOOD_DELAY_TRAINING_QUESTION);
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

  const firstStrikeChance = calculateFirstStrikeChance(player, masterMonster);
  const first = Math.random() * 100 < firstStrikeChance;

  const lines = [
    '',
    r('**MASTER FIGHT**'),
    'You have challenged ' + currentMaster.name + '!',
    '',
    'Master ' + currentMaster.name + ' wields a ' + currentMaster.weapon + '!',
    '',
    'Master HP: ' + g(currentMaster.hp),
    ''
  ];

  if (first) {
    lines.push('Your skill allows you to get the first strike.');
  } else {
    lines.push(currentMaster.name + ' has surprised you!');
  }

  lines.push('');
  lines.push(statLine(nick));
  const skillText = getSkillMenuText(player);
  lines.push(w('(A)ttack ') + skillText + w('(R)un'));
  lines.push('');
  const skillKeys = { 0: 'D', 1: 'M', 2: 'T' };
  const hasSkill = player.skill_charges_max > 0 && player.skill_charges_active > 0;
  const helpKeys = hasSkill ? '(A,' + skillKeys[player.class] + ',R) (? for menu)' : '(A,R) (? for menu)';
  lines.push(r('Master Fight') + w('  ' + helpKeys));
  lines.push('');

  sendLines(nick, lines, FLOOD_DELAY_TRAINING_CHALLENGE);
  {
    const us = getState(nick);
    us.lastFightState = PLAYER_STATES.FIGHT_MASTER;
    us.enemyFirstStrike = !first;
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
  const lines = [];

  if (userState.enemyFirstStrike) {
    let actualDamage;
    if (userState.isShielded) {
      actualDamage = 0;
      lines.push('Your shield absorbs ' + monster.name + '\'s attack!');
      userState.isShielded = false;
    } else {
      const monsterDamage = Math.floor(Math.random() * (monster.str + 1)) + (monster.attack || 0);
      const armorDefense = game.getArmorDefense ? game.getArmorDefense(stats.armor_num) : 0;
      actualDamage = monsterDamage - armorDefense;
        if (actualDamage <= 0) actualDamage = 1;
      lines.push(monster.name + ' attacks first for ' + g(actualDamage) + ' damage!');
    }
    const newPlayerHp = Math.max(0, stats.hp - actualDamage);

    if (newPlayerHp <= 0) {
      const killResult = game.killPlayer(nick, 10, 'Master: ' + monster.name);
      lines.push(border());
      lines.push('You have been defeated by ' + monster.name + '!');
      lines.push('Lost ' + g(game.formatNumber(killResult.lostGold)) + ' gold');
      lines.push('You are dead for 10 minutes!');
      lines.push(border());
      lines.push('');
      userState.currentMonster = null;
      userState.enemyFirstStrike = false;
      flushQueue(nick);
      sendLines(nick, lines);
      clearState(nick);
      return;
    }

    game.setPlayerHp(nick, newPlayerHp);
    userState.enemyFirstStrike = false;
    lines.push('');
  }

  const weaponAttack = game.getWeaponAttack ? game.getWeaponAttack(stats.weapon_num) : 0;
  const damage = Math.floor(Math.random() * (stats.str + 1)) + weaponAttack;
  monster.hp = monster.hp - damage;

  lines.push('You hit ' + monster.name + ' for ' + g(damage) + ' damage!');

  if (monster.hp <= 0) {
    if (monster.isPlayer) {
      returnToFightState(nick, PLAYER_STATES.FIGHT_MASTER);
      return;
    }
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

  let monsterDamageMsg;
  if (userState.isShielded) {
    monsterDamageMsg = 'Your shield absorbs the attack!';
    userState.isShielded = false;
  } else {
    const monsterDamage = Math.floor(Math.random() * (monster.str + 1)) + (monster.attack || 0);
    const armorDefense = game.getArmorDefense ? game.getArmorDefense(stats.armor_num) : 0;
    const actualDamage = monsterDamage - armorDefense;
        if (actualDamage <= 0) actualDamage = 1;
    const newPlayerHp = Math.max(0, stats.hp - actualDamage);
    monsterDamageMsg = monster.name + ' hits you for ' + g(actualDamage) + ' damage!';

if (newPlayerHp <= 0) {
      const killResult = game.killPlayer(nick, 10, 'Player: ' + monster.name);
      lines.push(border());
      lines.push('You have been defeated by ' + monster.name + '!');
      lines.push('Lost ' + g(game.formatNumber(killResult.lostGold)) + ' gold');
      lines.push('You are dead for 10 minutes!');
      lines.push(border());
      lines.push('');

      userState.currentMonster = null;
      userState.state = PLAYER_STATES.NONE;
      sendLines(nick, lines);
      return;
    }
  }

  lines.push(monsterDamageMsg);
  lines.push('');

  game.setPlayerHp(nick, stats.hp);
  lines.push('HP: (' + g(stats.hp) + ' of ' + g(stats.maxhp) + ') - Master HP: (' + g(monster.hp) + ' of ' + g(monster.maxhp) + ')');
  lines.push('');
  lines.push(w('(A)ttack (R)un'));
  lines.push('');
  lines.push(r('Fight Master') + w('  (A,R) (? for menu)'));
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

  const firstStrikeChance = calculateFirstStrikeChance(refreshedPlayer, target);
  const first = Math.random() * 100 < firstStrikeChance;

  const lines = [
    '',
    r('**PLAYER FIGHT**'),
    'You attack ' + target.name + '!',
    '',
    target.name + ' wields ' + targetWeapon + '!',
    '',
    target.name + ' HP: (' + (target.hp <= 0 ? r('DEAD') : g(target.hp)) + ' of ' + g(target.maxhp) + ')',
    ''
  ];

  if (first) {
    lines.push('Your experience gives you the first strike!');
  } else {
    lines.push(target.name + ' has surprised you!');
  }

  lines.push('');
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
    us.enemyFirstStrike = !first;
  }
  setState(nick, PLAYER_STATES.FIGHT_PLAYER);
}

function startInnRoomFight(nick, targetName) {
  const players = game.getPlayerList();
  const target = players.find(p => p.name.toLowerCase() === targetName.toLowerCase());

  if (!target || target.dead !== 0 || target.stayinn !== 1) {
    sendNotice(nick, 'That guest is no longer available!');
    showInn(nick);
    return;
  }

  const player = loadPlayer(nick);
  const now = Date.now();

  if (player.pfights_timer && now < player.pfights_timer) {
    const minutesLeft = Math.ceil((player.pfights_timer - now) / 60000);
    sendNotice(nick, 'No player fights left! Try again in ' + minutesLeft + ' minute(s).');
    showInn(nick);
    return;
  }

  if (player.pfights <= 0) {
    player.pfights = 3;
    player.pfights_timer = now + (60 * 60 * 1000);
    savePlayer(nick, player);
    sendNotice(nick, 'You have ' + player.pfights + ' player fights now!');
  }

  player.pfights--;
  if (player.pfights <= 0) {
    player.pfights_timer = now + (60 * 60 * 1000);
  }
  savePlayer(nick, player);

  let timerMsg = '';
  if (player.pfights_timer) {
    const minsLeft = Math.ceil((player.pfights_timer - now) / 60000);
    timerMsg = ' Timer resets in ' + minsLeft + ' min.';
  }
  sendNotice(nick, 'You have ' + player.pfights + ' of 3 player fights remaining!' + timerMsg);

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
    const warnMsg = 'WARNING! ' + (attackerChar?.name || nick) + ' paid the bartender to attack you while you\'re in your room!';
    console.log('[INN_BRIBE] -> ' + targetNick + ': ' + warnMsg);
    sendImmediate(targetNick, warnMsg);
  }

  const refreshedPlayer = checkAndRefreshSkills(nick);

  const firstStrikeChance = calculateFirstStrikeChance(refreshedPlayer, target);
  const first = Math.random() * 100 < firstStrikeChance;

  const lines = [
    '',
    r('**PLAYER FIGHT**'),
    'You attack ' + target.name + '!',
    '',
    target.name + ' wields ' + targetWeapon + '!',
    '',
    target.name + ' HP: (' + (target.hp <= 0 ? r('DEAD') : g(target.hp)) + ' of ' + g(target.maxhp) + ')',
    ''
  ];

  if (first) {
    lines.push('Your experience gives you the first strike!');
  } else {
    lines.push(target.name + ' has surprised you!');
  }

  lines.push('');
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
    us.enemyFirstStrike = !first;
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
  const lines = [];

  if (userState.enemyFirstStrike) {
    let actualDamage;
    if (userState.isShielded) {
      actualDamage = 0;
      lines.push('Your shield absorbs ' + monster.name + '\'s attack!');
      userState.isShielded = false;
    } else {
      const monsterDamage = Math.floor(Math.random() * (monster.str + 1)) + (monster.attack || 0);
      const armorDefense = game.getArmorDefense ? game.getArmorDefense(stats.armor_num) : 0;
      actualDamage = monsterDamage - armorDefense;
        if (actualDamage <= 0) actualDamage = 1;
      lines.push(monster.name + ' attacks first for ' + g(actualDamage) + ' damage!');
    }
    const newPlayerHp = Math.max(0, stats.hp - actualDamage);

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
      }

      userState.currentMonster = null;
      userState.enemyFirstStrike = false;
      userState.state = PLAYER_STATES.NONE;
      sendLines(nick, lines);
      return;
    }

    game.setPlayerHp(nick, newPlayerHp);
    userState.enemyFirstStrike = false;
    lines.push('');
  }

  const weaponAttack = game.getWeaponAttack ? game.getWeaponAttack(stats.weapon_num) : 0;
  const damage = Math.floor(Math.random() * (stats.str + 1)) + weaponAttack;
  monster.hp = monster.hp - damage;

  lines.push('You hit ' + monster.name + ' for ' + g(damage) + ' damage!');

  if (monster.hp <= 0) {
    if (monster.isPlayer) {
      returnToFightState(nick, PLAYER_STATES.FIGHT_PLAYER);
      return;
    }
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

  let monsterDamageMsg;
  if (userState.isShielded) {
    monsterDamageMsg = 'Your shield absorbs the attack!';
    userState.isShielded = false;
  } else {
    const monsterDamage = Math.floor(Math.random() * (monster.str + 1)) + (monster.attack || 0);
    const armorDefense = game.getArmorDefense ? game.getArmorDefense(stats.armor_num) : 0;
    const actualDamage = monsterDamage - armorDefense;
        if (actualDamage <= 0) actualDamage = 1;
    const newPlayerHp = Math.max(0, stats.hp - actualDamage);
    monsterDamageMsg = monster.name + ' hits you for ' + g(actualDamage) + ' damage!';

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
  }

  lines.push(monsterDamageMsg);
  lines.push('');

  const player = loadPlayer(nick);
  lines.push('HP: (' + g(stats.hp) + ' of ' + g(stats.maxhp) + ') - ' + monster.name + ' HP: (' + g(monster.hp) + ' of ' + g(monster.maxhp) + ')');
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

      if (player.stayinn) {
        const roomLines = [
          '',
          '  You are in your room at the inn.',
          '  You are safe from attacks, but you must leave',
          '  to do anything else.',
          '',
          w('(L)eave the inn'),
          '',
          r('The Inn - Room') + w('  (L) (? for menu)'),
          ''
        ];
        sendLines(nick, [...noticeLines, ...roomLines]);
        setState(nick, PLAYER_STATES.INN_ROOM_ONLY);
      } else {
        const mainMenuLines = buildMainMenuLines(playerNick);
        sendLines(nick, [...noticeLines, ...mainMenuLines]);
      }
    } else {
      if (player.stayinn) {
        showInn(nick);
      } else {
        showMainMenu(nick);
      }
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
        lines.push('  ' + outcome);
      });

      const userState = getState(nick);
      userState.temp = { eventOutcome: event };

      if (event.nextEvent) {
        userState.temp.nextEvent = event.nextEvent;
      }

      if (event.prompt === 'darkcloak') {
        showDarkCloak(nick);
        return;
      }

      if (event.prompt === 'oldman') {
        lines.push('');
        lines.push('  Do you take the old man? [Y/N]');
        lines.push('');
        sendLines(nick, lines);
        setState(nick, PLAYER_STATES.FOREST_EVENT);
      } else if (event.prompt === 'fairy_noticed') {
        lines.push('YOU ARE NOTICED!');
        lines.push('');
        lines.push('The small things encircle you. A small wet female');
        lines.push('bangs your shin. "How dare you spy on us, human!"');
        lines.push('you can\'t help but smile, the defiance in her');
        lines.push('silvery voice is truly a sight, you think to');
        lines.push('yourself. Further contemplation is interrupted by');
        lines.push('another sharpfully painful prod.');
        lines.push('');
        lines.push(w('(A)sk for a blessing'));
        lines.push(w('(T)ry to catch one to show your friends'));
        lines.push(w('(R)eturn to Forest'));
        lines.push('');
        lines.push(r('Your choice? [A/T/R] (? for menu)'));
        
        const userState = getState(nick);
        userState.displayMode = true;
        
        sendLines(nick, lines);
        setState(nick, PLAYER_STATES.FOREST_EVENT);
      } else {
        lines.push('');
        lines.push('(R)eturn to Forest');
        lines.push('');
        
        const userState = getState(nick);
        userState.displayMode = true;
        
        sendLines(nick, lines, 0); // Fast posting for single-phase events
        setState(nick, PLAYER_STATES.FOREST_EVENT);
      }
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

  const player = loadPlayer(nick);
  const monster = result.monster;
  const firstStrikeChance = calculateFirstStrikeChance(player, monster);
  const first = Math.random() * 100 < firstStrikeChance;

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

  const skillText = getSkillMenuText(player);
  lines.push(w('(A)ttack ') + skillText + w(' (S)tats (R)un'));
  lines.push('');
  lines.push(r('The Forest') + w('  (A,R,Q) (? for menu)'));

  sendLines(nick, lines);
  {
    const us = getState(nick);
    us.lastFightState = PLAYER_STATES.FIGHT;
    us.enemyFirstStrike = !first;
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

  const stats = game.getPlayerStats(nick);
  const lines = [];

  if (userState.enemyFirstStrike && !monster.isPlayer) {
    let actualDamage;
    if (userState.isShielded) {
      actualDamage = 0;
      lines.push('Your shield absorbs ' + monster.name + '\'s attack!');
      userState.isShielded = false;
    } else {
      const monsterDamage = Math.floor(Math.random() * (monster.str + 1));
      const armorDefense = game.getArmorDefense ? game.getArmorDefense(stats.armor_num) : 0;
      actualDamage = monsterDamage - armorDefense;
      if (actualDamage <= 0) actualDamage = 1;
    }
    const newPlayerHp = Math.max(0, stats.hp - actualDamage);

    if (actualDamage > 0) {
      lines.push(monster.name + ' attacks first for ' + g(actualDamage) + ' damage!');
    }

    if (newPlayerHp <= 0) {
      const killResult = game.killPlayer(nick, 10, 'Monster: ' + monster.name);
      lines.push('DEAD! Killed by ' + monster.name + ' - Lost ' + g(game.formatNumber(killResult.lostGold)) + ' gold - Dead for 10 minutes!');
      userState.currentMonster = null;
      userState.enemyFirstStrike = false;
      flushQueue(nick);
      sendLines(nick, lines);
      clearState(nick);
      return;
    }

    game.setPlayerHp(nick, newPlayerHp);
    userState.enemyFirstStrike = false;
    lines.push('');
  }

  const result = game.attackMonster(nick, monster.hp, monster.str, monster.maxhp);

  if (result.error) {
    sendNotice(nick, result.error);
    return;
  }

  if (result.powerMove) {
    lines.push(r('**POWER MOVE**'));
    lines.push('');
  }

  lines.push('You hit ' + monster.name + ' for ' + g(result.damage) + ' damage!');

  if (result.victory) {
    if (monster.isPlayer) {
      const lastFight = userState.lastFightState || PLAYER_STATES.FIGHT_PLAYER;
      returnToFightState(nick, lastFight);
      return;
    }
    const reward = game.winMonsterFight(nick, monster);
    const updatedPlayer = loadPlayer(nick);
    const victoryMsg = 'HP: [' + g(updatedPlayer.hp) + '/' + g(updatedPlayer.maxhp) + '] Gold: [' + g(updatedPlayer.gold) + '] Killed ' + monster.name + '! Got ' + g(game.formatNumber(reward.gold)) + ' gold + ' + g(reward.xp) + ' XP' + (reward.gem ? ' +GEM' : '');
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

    let monsterDamageMsg;
    if (userState.isShielded) {
      monsterDamageMsg = 'Your shield absorbs the attack!';
      userState.isShielded = false;
    } else {
      monsterDamageMsg = monster.name + ' hits you for ' + g(result.monsterDamage) + ' damage!';
    }
    lines.push(monsterDamageMsg);
    lines.push('');
    lines.push(statLine(nick));
    lines.push('HP: (' + g(result.playerHp) + ' of ' + g(game.getPlayerStats(nick).maxhp) + ') - Monster HP: (' + g(result.monsterHp) + ' of ' + g(monster.maxhp) + ')');
    lines.push('');

    const currentPlayer = loadPlayer(nick);
    const hasSkill = currentPlayer && currentPlayer.skill_charges_max > 0 && currentPlayer.skill_charges_active > 0;
    if (hasSkill) {
      const skillText = getSkillMenuText(currentPlayer);
      lines.push(w('(A)ttack ') + skillText + w(' (S)tats (R)un'));
    } else {
      lines.push(w('(A)ttack (S)tats (R)un'));
    }
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
    w('(R)eturn to Forest'),
    '',
    r('Enter your bet (? for menu)'),
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
  const userState = getState(nick);
  const monster = userState.currentMonster;
  
  if (monster && monster.isPlayer && monster.hp <= 0) {
    const loserNick = getPlayerNick(monster.name);
    if (loserNick) {
      const killResult = game.killPlayer(loserNick, 10, 'Player: ' + nick);
      const loserMsg = 'SLAUGHTER RESULT: You were defeated by ' + nick + '! Lost ' + g(game.formatNumber(killResult.lostGold)) + ' gold. You are dead for 10 minutes!';
      sendDirectNotice(loserNick, loserMsg);
      userState.currentMonster = null;
      showSlaughter(nick);
      return;
    }
  }
  
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

  const usesStatus = ' (' + player.skill_charges_active + '/' + player.skill_charges_max + ')';

  switch (player.class) {
    case 0: return w('(D)estroy' + usesStatus + ' '); // Death Knight
    case 1: return w('(P)owers' + usesStatus + ' '); // Mystic
    case 2: return w('(S)teal' + usesStatus + ' ');   // Thief
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

function getMysticSkill(skillLevel) {
  const skills = [
    { minLevel: 1, name: 'Pinch Real Hard', key: 'P', desc: 'Pinch the enemy hard', nextName: 'Disappear', nextLevel: 4 },
    { minLevel: 4, name: 'Disappear', key: 'D', desc: 'Escape to forest', nextName: 'Heat Wave', nextLevel: 8 },
    { minLevel: 8, name: 'Heat Wave', key: 'H', desc: 'Fire damage to enemy', nextName: 'Light Shield', nextLevel: 12 },
    { minLevel: 12, name: 'Light Shield', key: 'L', desc: 'Shield from next attack', nextName: 'Shatter', nextLevel: 16 },
    { minLevel: 16, name: 'Shatter', key: 'S', desc: 'Heavy damage', nextName: 'Mind Heal', nextLevel: 20 },
    { minLevel: 20, name: 'Mind Heal', key: 'M', desc: 'Heal yourself completely', nextName: 'MAXED', nextLevel: 0 }
  ];

  for (let i = skills.length - 1; i >= 0; i--) {
    if (skillLevel >= skills[i].minLevel) {
      return skills[i];
    }
  }
  return skills[0];
}

function getMysticKey(skillLevel) {
  const skill = getMysticSkill(skillLevel);
  return skill.key.toLowerCase();
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
    const skillKeys = { 0: 'D', 1: 'P', 2: 'S' };
    const skillNames = { 0: 'Destroy', 1: 'Magic', 2: 'Steal' };
    
    switch (player.class) {
      case 0: // Death Knight
        lines.push('  ** DESTROY **');
        lines.push('');
        lines.push('  You perform a devastating power attack!');
        lines.push('  Damage: Strength x 1.5-5.5 + Weapon Attack x multiplier');
        lines.push('');
        lines.push('  Uses Today: ' + player.skill_charges_active + '/' + player.skill_charges_max);
        lines.push('');
        lines.push(r('Choose skill (D,R) (? for menu)'));
        lines.push('');
        break;
        
      case 1: // Mystic
        {
          const skillLevel = player.usesm || 0;
          const skillInfo = getMysticSkill(skillLevel);

          lines.push('  ** MYSTICAL SKILLS **');
          lines.push('');
          lines.push('  Your skill level: ' + skillLevel);
          lines.push('');
          lines.push('  Current Skill: ' + r(skillInfo.name));
          lines.push('  ' + skillInfo.desc);
          lines.push('');
          lines.push('  Next Skill: ' + skillInfo.nextName + ' at level ' + skillInfo.nextLevel);
          lines.push('');
          lines.push('  Uses Today: ' + player.skill_charges_active + '/' + player.skill_charges_max);
          lines.push('');
          lines.push(r('Choose skill (' + skillInfo.key + ',R) (? for menu)'));
          lines.push('');
        }
        break;
        
      case 2: // Thief
        lines.push('  ** THIEVING SKILLS **');
        lines.push('');
        lines.push('  (S)teal Gold - Steal gold from monster');
        lines.push('');
        lines.push('  Uses Today: ' + player.skill_charges_active + '/' + player.skill_charges_max);
        lines.push('');
        lines.push(r('Choose skill (S,R) (? for menu)'));
        lines.push('');
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
      {
        if (player.skill_charges_active <= 0) {
          sendNotice(nick, 'No uses remaining! Train with masters to get more uses.');
          return;
        }

        player.skill_charges_active--;
        player.skill_charge_timers.push(now + (30 * 60 * 1000));

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
          'Uses: ' + player.skill_charges_active + '/' + player.skill_charges_max,
          ''
        ]);
      }
      break;
      
      case 1: // Mystic
        {
        const skillLevel = player.usesm || 0;
        const skillInfo = getMysticSkill(skillLevel);
        const expectedKey = skillInfo.key.toLowerCase();

        if (skill !== expectedKey) {
          sendNotice(nick, 'Your current mystical skill is (' + skillInfo.key + ') ' + skillInfo.name);
          return;
        }

        if (player.skill_charges_active <= 0) {
          sendNotice(nick, 'No uses remaining! Train with masters to get more uses.');
          return;
        }

        player.skill_charges_active--;
        player.skill_charge_timers.push(now + (30 * 60 * 1000));

        switch (skill) {
          case 'p': // Pinch Real Hard
            {
              const monsterLevel = Math.floor(monster.str / 10);
              if (player.level <= monsterLevel) {
                sendNotice(nick, 'Target level too high for Pinch!');
                return;
              }

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
              'Uses: ' + player.skill_charges_active + '/' + player.skill_charges_max,
              ''
            ]);

            userState.currentMonster = null;
            setTimeout(() => showForest(nick), 100);
            return;
          }

        case 'h': // Heat Wave
          {
            const wpnAttack = game.getWeaponAttack(player.weapon_num);
            const heatDamage = Math.floor((player.str + wpnAttack) * 2.5);
            monster.hp -= heatDamage;
            savePlayer(nick, player);

            sendLines(nick, [
              '',
              r('** HEAT WAVE **'),
              'You wave your hand and a wall of fire erupts!',
              'You hit ' + monster.name + ' for ' + heatDamage + ' fire damage!',
              'Uses: ' + player.skill_charges_active + '/' + player.skill_charges_max,
              ''
            ]);
          }
          break;

        case 'l': // Light Shield
          {
            userState.isShielded = true;
            savePlayer(nick, player);

            sendLines(nick, [
              '',
              r('** LIGHT SHIELD **'),
              'A shimmering shield of light materializes around you!',
              'You are protected from the next attack!',
              'Uses: ' + player.skill_charges_active + '/' + player.skill_charges_max,
              ''
            ]);
          }
          break;

        case 's': // Shatter
          {
            const wpnAttack = game.getWeaponAttack(player.weapon_num);
            const shatterDamage = Math.floor((player.str * 2 + wpnAttack) * 2);
            monster.hp -= shatterDamage;
            savePlayer(nick, player);

              sendLines(nick, [
                '',
                r('** SHATTER **'),
                'You speak the word of power and reality cracks!',
                'You hit ' + monster.name + ' for ' + shatterDamage + ' damage!',
                'Uses: ' + player.skill_charges_active + '/' + player.skill_charges_max,
                ''
              ]);
            }
            break;

          case 'm': // Mind Heal
            {
              player.hp = player.maxhp;
              savePlayer(nick, player);

              sendLines(nick, [
                '',
                r('** MIND HEAL **'),
                'You close your eyes and channel your inner power.',
                'Your wounds heal completely!',
                'HP: ' + player.hp + '/' + player.maxhp,
                'Uses: ' + player.skill_charges_active + '/' + player.skill_charges_max,
                ''
              ]);
            }
            break;

          default:
            sendNotice(nick, 'Mystical Skills - (' + skillInfo.key + ') ' + skillInfo.name);
            return;
        }
      }
      break;
      
    case 2: // Thief - Steal
      {
        if (player.skill_charges_active <= 0) {
          sendNotice(nick, 'No uses remaining! Train with masters to get more uses.');
          return;
        }

        const stealTable = [500, 999, 4000, 7992, 13500, 26973, 32000, 63936, 62500, 124875, 108000, 215784, 171500, 342657, 256000, 511488, 364500, 728271, 500000, 999000, 665500, 1329669, 864000, 1726272];
        const levelIndex = Math.min(Math.max(player.level - 1, 0) * 2, stealTable.length - 2);
        const minSteal = stealTable[levelIndex];
        const maxSteal = stealTable[levelIndex + 1];

        if (monster.gold <= 0 || monster.gold === undefined) {
          sendLines(nick, [
            '',
            r('** STEAL **'),
            'You attempt to steal from ' + monster.name + '!',
            'There is nothing to steal!',
            'Uses: ' + player.skill_charges_active + '/' + player.skill_charges_max,
            ''
          ]);
          break;
        }

        const stolen = Math.min(random(minSteal, maxSteal), monster.gold);
        const actualStolen = Math.floor(stolen * 0.5);
        const monsterKeep = Math.floor(stolen * 0.1);

        player.gold = Math.min(player.gold + actualStolen, config.maxGold);
        monster.gold = Math.max(0, monster.gold - stolen);

        player.skill_charges_active--;
        player.skill_charge_timers.push(now + (30 * 60 * 1000));
        savePlayer(nick, player);

        sendLines(nick, [
          '',
          r('** STEAL **'),
          'You attempt to steal from ' + monster.name + '!',
          'Your fingers work lightning fast...',
          'You manage to make off with ' + actualStolen + ' gold!',
          'Uses: ' + player.skill_charges_active + '/' + player.skill_charges_max,
          ''
        ]);
      }
      break;
  }

  if (monster.hp <= 0) {
    if (monster.isPlayer) {
      const lastFight = userState.lastFightState || PLAYER_STATES.FIGHT_PLAYER;
      returnToFightState(nick, lastFight);
      return;
    }
    monster.hp = 0;
    const result = game.winMonsterFight(nick, monster);
    if (result) {
      const updatedPlayer = loadPlayer(nick);
      const victoryMsg = 'HP: [' + g(updatedPlayer.hp) + '/' + g(updatedPlayer.maxhp) + '] Gold: [' + g(updatedPlayer.gold) + '] Killed ' + monster.name + '! Got ' + g(game.formatNumber(result.gold)) + ' gold + ' + g(result.xp) + ' XP' + (result.gem ? ' +GEM' : '');
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
    let actualDamage = monsterDamage - armorDefense;
    if (actualDamage <= 0) actualDamage = 1;
    
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
  const lines = [
    '',
    border(),
    r('  THE OLD MAN\'S TEST'),
    border(),
    '',
    '  You politely knock on the knotted wooden door.',
    '',
    '  "Watcha doin down there Sonny?!" A wizened old man',
    '  looks down from the window.',
    '',
    '  "Tell ya what! I\'ll give ya a mystical lesson if',
    '  you can pass my test!" the old man giggles.',
    '',
    '  "I\'m thinking of a number between 1 and 100.',
    '  I\'ll give ya 6 guesses."',
    '',
    '  Enter your guess (1-100):',
    ''
  ];

  const userState = getState(nick);
  userState.hutGuess = {
    answer: random(1, 100),
    tries: 0,
    maxTries: 6,
    wager: player.level * 100
  };

  sendLines(nick, lines);
  setState(nick, PLAYER_STATES.FOREST_HUT_GUESS);
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
        case 'o': case 'O': showOtherPlaces(nick); break;
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

    case PLAYER_STATES.OTHER_PLACES:
      if (cmdLower === 'r' || cmdLower === 'q') {
        showMainMenu(nick);
        break;
      }
      if (cmdLower === 'd') {
        showDragon(nick);
        break;
      }
      if (cmdLower === 'b') {
        showBarakHouse(nick);
        break;
      }
      if (cmdLower === '?') {
        showOtherPlaces(nick);
        break;
      }
      sendNotice(nick, 'Other Places - D (Dragon), B (Barak), R (Return)');
      showOtherPlaces(nick);
      break;

    case PLAYER_STATES.BARAK_HOUSE:
      if (cmdLower === 'h' || cmdLower === 'r') {
        showMainMenu(nick);
        break;
      }
      if (cmdLower === 'k' || cmdLower === '') {
        showBarakKnock(nick);
        break;
      }
      if (cmdLower === 'w') {
        showBarakWalkin(nick);
        break;
      }
      if (cmdLower === '?') {
        clearMessageQueue(nick);
        showBarakHouse(nick);
        break;
      }
      clearMessageQueue(nick);
      showBarakHouse(nick);
      break;

    case PLAYER_STATES.BARAK_KNOCK:
      if (cmdLower === 'h' || cmdLower === 'r') {
        const player = loadPlayer(nick);
        if (player) {
          player.baraks_visited_today = 1;
          savePlayer(nick, player);
        }
        showMainMenu(nick);
        break;
      }
      if (cmdLower === 'j' || cmdLower === '') {
        showBarakBreeze(nick);
        break;
      }
      if (cmdLower === 'c') {
        const player = loadPlayer(nick);
        if (player) {
          player.gems = (player.gems || 0) + 1;
          player.baraks_visited_today = 1;
          savePlayer(nick, player);
        }
        sendLines(nick, ['', 'Barak gives you 1 gem for your humor.', '', 'You trudge back home...', '']);
        showMainMenu(nick);
        break;
      }
      if (cmdLower === 'y') {
        sendLines(nick, ['', 'Barak is offended by your insult!', '', 'You trudge back home...', '']);
        showMainMenu(nick);
        break;
      }
      if (cmdLower === '?') {
        clearMessageQueue(nick);
        showBarakKnock(nick);
        break;
      }
      clearMessageQueue(nick);
      showBarakKnock(nick);
      break;

    case PLAYER_STATES.BARAK_BREEZE:
      if (cmdLower === 'h' || cmdLower === 'r') {
        sendLines(nick, [
          '',
          'Are you sure you want to leave Barak\'s house? [Y/N]',
          '',
          r('(Y)es, (N)o (? for menu)')
        ]);
        const us = getState(nick);
        us.temp.returnTo = 'barak_breeze';
        setState(nick, PLAYER_STATES.BARAK_CONFIRM_LEAVE);
        break;
      }
      if (cmdLower === 'w' || cmdLower === '') {
        showBarakPlay(nick);
        break;
      }
      if (cmdLower === 'c') {
        showBarakRead(nick);
        break;
      }
      if (cmdLower === '?') {
        clearMessageQueue(nick);
        showBarakBreeze(nick);
        break;
      }
      clearMessageQueue(nick);
      showBarakBreeze(nick);
      break;

    case PLAYER_STATES.BARAK_PLAY:
      if (cmdLower === 'h' || cmdLower === 'r' || cmdLower === 'f') {
        sendLines(nick, [
          '',
          'Are you sure you want to leave Barak\'s house? [Y/N]',
          '',
          r('(Y)es, (N)o (? for menu)')
        ]);
        const us = getState(nick);
        us.temp.returnTo = 'barak_play';
        setState(nick, PLAYER_STATES.BARAK_CONFIRM_LEAVE);
        break;
      }
      if (cmdLower === 'o' || cmdLower === '') {
        showBarakChests(nick);
        break;
      }
      if (cmdLower === '?') {
        clearMessageQueue(nick);
        showBarakPlay(nick);
        break;
      }
      clearMessageQueue(nick);
      showBarakPlay(nick);
      break;

    case PLAYER_STATES.BARAK_CHESTS:
      {
        const chestNum = parseInt(cmd);
        if (chestNum >= 1 && chestNum <= 6) {
          const goldFound = barakChests[chestNum - 1];
          barakEarnedGold += goldFound;

          const lines = [
            '',
            'You open chest ' + chestNum + ' and find ' + goldFound + ' gold!',
            ''
          ];

          if (goldFound < 50) {
            lines.push('"Not bad!" you say.');
            lines.push('');
            lines.push('You made off with ' + barakEarnedGold + ' gold!');
            const player = loadPlayer(nick);
            if (player) {
              player.gold = Math.min(player.gold + barakEarnedGold, config.maxGold);
              player.baraks_visited_today = 1;
              savePlayer(nick, player);
            }
            sendLines(nick, lines);
            showMainMenu(nick);
          } else {
            lines.push('"This is a trap!" you scream!');
            lines.push('');
            lines.push('Barak is right behind you!');
            lines.push('');
            lines.push('YOU ARE DEFEATED.');
            lines.push(border());
            lines.push('Barak laughs as warm blood flows down your cheek.');
            lines.push('Maybe next time?');
            lines.push('');
            lines.push('YOU FEEL AWFULLY WEAK.');
            const player = loadPlayer(nick);
            if (player) {
              player.hp = 1;
              player.baraks_visited_today = 1;
              savePlayer(nick, player);
            }
            lines.push('');
            lines.push('You trudge back home...');
            lines.push('');
            sendLines(nick, lines);
            showMainMenu(nick);
          }
          break;
        }
        if (cmdLower === '?') {
          clearMessageQueue(nick);
          showBarakChests(nick);
          break;
        }
        clearMessageQueue(nick);
        showBarakChests(nick);
      }
      break;

    case PLAYER_STATES.BARAK_READ:
      if (cmdLower === 'h' || cmdLower === 'r' || cmdLower === 'l') {
        showBarakLaugh(nick);
        break;
      }
      if (cmdLower === 'o' || cmdLower === '') {
        const player = loadPlayer(nick);
        const bookKeys = Object.keys(baraksBooks);
        barakSelectedBook = random(0, bookKeys.length - 1);
        const bookName = bookKeys[barakSelectedBook];
        const bookPages = baraksBooks[bookName];

        const lines = [
          '',
          '"You will?" pitifully, wiping his nose. "Will',
          ' you read this to me?"',
          '',
          'Barak shows you a book of....' + bookName + '.',
          '',
          'You are non-plussed, but agree to read it.',
          border()
        ];

        bookPages.forEach(page => lines.push(page));
        lines.push(border());

        if (random(1, 100) > 70) {
          lines.push('');
          lines.push('YOU LEARN SOMETHING FROM THE DRIVEL.');
          const perk = baraksBooksPerks[bookName];
          if (perk) {
            if (perk[0] === 'hp' && player) {
              player.maxhp += perk[1];
              player.hp = Math.min(player.hp + perk[1], player.maxhp);
              lines.push('Your max HP increased by ' + perk[1] + '!');
            }
          }
        }

        lines.push('');
        lines.push('You put down the book.');
        lines.push('"Please, ' + (player?.name || 'friend') + '!');
        lines.push('Read more!" Barak whines.');
        lines.push('');
        lines.push('You smile. "Nah, I gotta go."');
        lines.push('');

        if (player) {
          player.baraks_visited_today = 1;
          savePlayer(nick, player);
        }

        sendLines(nick, lines);
        showMainMenu(nick);
        break;
      }
      if (cmdLower === '?') {
        clearMessageQueue(nick);
        showBarakRead(nick);
        break;
      }
      clearMessageQueue(nick);
      showBarakRead(nick);
      break;

    case PLAYER_STATES.BARAK_WALKIN:
      if (cmdLower === 'a' || cmdLower === '') {
        sendLines(nick, [
          '',
          'Are you sure you want to leave Barak\'s house? [Y/N]',
          '',
          r('(Y)es, (N)o (? for menu)')
        ]);
        const us = getState(nick);
        us.temp.returnTo = 'barak_walkin';
        setState(nick, PLAYER_STATES.BARAK_CONFIRM_LEAVE);
        break;
      }
      if (cmdLower === 'k') {
        const player = loadPlayer(nick);
        if (player) {
          const maxhp = player.maxhp || 15;
          player.hp = Math.min(player.hp + Math.floor(maxhp * 0.25), player.maxhp);
          player.baraks_visited_today = 1;
          savePlayer(nick, player);
        }
        const lines = [
          '',
          'You kick him a good one!',
          'He screams in pain!',
          '',
          'You laugh so hard small pieces fly out of',
          'your mouth and pummel him.',
          '',
          '"No more!" Barak shrieks.',
          '',
          '"Give me your most valuable possession,',
          'you hairy fool."',
          '',
          '"Alright! I\'ll give you a flask of my Ultra Ale."',
          '',
          'You feel refreshed! HP restored!',
          ''
        ];
        sendLines(nick, lines);
        showMainMenu(nick);
        break;
      }
      if (cmdLower === '?') {
        clearMessageQueue(nick);
        showBarakWalkin(nick);
        break;
      }
      clearMessageQueue(nick);
      showBarakWalkin(nick);
      break;

    case PLAYER_STATES.BARAK_CONFIRM_LEAVE:
      if (cmdLower === 'y' || cmdLower === 'Y') {
        const player = loadPlayer(nick);
        if (player) {
          player.baraks_visited_today = 1;
          savePlayer(nick, player);
        }
        showMainMenu(nick);
      } else if (cmdLower === 'n' || cmdLower === 'N' || cmdLower === '?') {
        clearMessageQueue(nick);
        const us = getState(nick);
        const returnTo = us.temp.returnTo;
        if (returnTo === 'barak_play') {
          showBarakPlay(nick);
        } else if (returnTo === 'barak_walkin') {
          showBarakWalkin(nick);
        } else {
          showBarakBreeze(nick);
        }
      } else {
        sendNotice(nick, 'Are you sure you want to leave Barak\'s house? [Y/N] (? for menu)');
      }
      break;

    case PLAYER_STATES.FOREST:
      {
        const player = loadPlayer(nick);
        const hasHorse = player && player.horse !== HORSE_NONE;

        switch (cmdLower) {
          case 'l': case 'L': startFight(nick); break;
          case 'h': case 'H': showHealer(nick); break;
          case 's': case 'S': showStats(nick); break;
          case 'r': case 'R': showMainMenu(nick); break;
          case 't': case 'T':
            if (hasHorse) {
              showDarkCloak(nick);
            } else {
              sendNotice(nick, 'The Forest - L,H,S,R,Q');
            }
            break;
          case 'q': case 'Q':
            sendNotice(nick, 'Goodbye! Type !lord to return.');
            setPlayerOffline(nick);
            clearState(nick);
            break;
          case '?': showForest(nick); break;
          default:
            sendNotice(nick, hasHorse ? 'The Forest - L,H,S,R,T,Q (? for menu)' : 'The Forest - L,H,S,R,Q');
            break;
        }
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

        if (cmdLower === 'r') {
          showForest(nick);
          break;
        }

        if (cmdLower === '?') {
          clearMessageQueue(nick);
          sendLines(nick, [
            '',
            border(),
            r('  THE OLD MAN\'S TEST'),
            border(),
            '',
            '  "I\'m thinking of a number between 1 and 100.',
            '  I\'ll give ya 6 guesses."',
            '',
            '  Tries remaining: ' + (hutGuess.maxTries - hutGuess.tries),
            '',
            '  Enter your guess (1-100):',
            ''
          ]);
          break;
        }

        if (isNaN(guess) || guess < 1 || guess > 100) {
          clearMessageQueue(nick);
          sendLines(nick, [
            '',
            'Please enter a number between 1 and 100.',
            '',
            'Tries remaining: ' + (hutGuess.maxTries - hutGuess.tries),
            '',
            'Enter your guess (1-100):',
            ''
          ]);
          return;
        }

        hutGuess.tries++;

        const lines = [''];

        if (guess === hutGuess.answer) {
          const player = loadPlayer(nick);
          const xpGain = player.level * 500;
          const goldGain = player.level * 100;

          player.xp = Math.min(10000000, player.xp + xpGain);
          player.gold = Math.min(player.gold + goldGain, config.maxGold);
          savePlayer(nick, player);

          lines.push(border());
          lines.push(r('  ** YOU PASSED THE TEST! **'));
          lines.push(border());
          lines.push('');
          lines.push('  "That\'s right! You read my mind!"');
          lines.push('  The old man cheers with joy!');
          lines.push('');
          lines.push('  You gain ' + xpGain + ' XP!');
          lines.push('  You gain ' + goldGain + ' gold!');
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
          lines.push('  You gain nothing.');
          lines.push('');

          sendLines(nick, lines);
          sendNotice(nick, 'You return to the forest, wiser than before.');
          showForest(nick);
        } else if (guess < hutGuess.answer) {
          clearMessageQueue(nick);
          lines.push('  "The number is higher than that!"');
          lines.push('  Tries remaining: ' + (hutGuess.maxTries - hutGuess.tries));
          lines.push('');
          lines.push('  Enter your guess (1-100):');
          lines.push('');
          sendLines(nick, lines);
        } else {
          clearMessageQueue(nick);
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
      {
        const us = getState(nick);
        const event = us.temp.eventOutcome;

        if (event && event.prompt === 'oldman') {
          if (cmdLower === 'y') {
            const result = game.processForestEvent(nick, { type: 'oldman_help' });
            const lines = ['', border(), r('  EVENT: Old Man'), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            sendLines(nick, lines);
            savePlayer(nick, loadPlayer(nick));
            showForest(nick);
          } else if (cmdLower === 'n') {
            const result = game.processForestEvent(nick, { type: 'oldman_ignore' });
            const lines = ['', border(), r('  EVENT: Old Man'), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            sendLines(nick, lines);
            showForest(nick);
          } else if (cmdLower === '?') {
            sendLines(nick, [
              '',
              border(),
              r('  EVENT: Old Man'),
              border(),
              '',
              '  You come across an old man. He seems confused and',
              '  asks if you would direct him to the Inn. You know',
              '  that if you do, you will lose time for one fight',
              '  today.',
              '',
              '  Do you take the old man? [Y/N] (? for menu)',
              ''
            ]);
          } else {
            sendNotice(nick, 'Do you take the old man? [Y/N] (? for menu)');
          }
          break;
        }

        if (event && event.prompt === 'fairy_noticed') {
          if (cmdLower === 'a') {
            sendLines(nick, [
              '',
              'Do you want to ask for a blessing? [Y/N]',
              '',
              r('(Y)es, (N)o (? for menu)')
            ]);
            const us = getState(nick);
            us.temp.eventToConfirm = { action: 'fairy_interact' };
            setState(nick, PLAYER_STATES.FOREST_EVENT_CONFIRM);
          } else if (cmdLower === 't') {
            sendLines(nick, [
              '',
              'Do you want to try to catch a fairy? [Y/N]',
              '',
              r('(Y)es, (N)o (? for menu)')
            ]);
            const us = getState(nick);
            us.temp.eventToConfirm = { action: 'fairy_catch' };
            setState(nick, PLAYER_STATES.FOREST_EVENT_CONFIRM);
          } else if (cmdLower === 'r') {
            sendLines(nick, [
              '',
              'Are you sure you want to leave? [Y/N]',
              '',
              r('(Y)es, (N)o (? for menu)')
            ]);
            const us = getState(nick);
            us.temp.eventOutcome = { prompt: 'fairy_confirm_leave' };
            setState(nick, PLAYER_STATES.FOREST_EVENT_CONFIRM);
          } else if (cmdLower === '?') {
            clearMessageQueue(nick);
            sendLines(nick, [
              '',
              border(),
              r('  EVENT: Fairy'),
              border(),
              '',
              'YOU ARE NOTICED!',
              '',
              'The small things encircle you. A small wet female',
              'bangs your shin. "How dare you spy on us, human!"',
              '',
              w('(A)sk for a blessing'),
              w('(T)ry to catch one to show your friends'),
              w('(R)eturn to Forest'),
              '',
              r('Your choice? [A/T/R] (? for menu)')
            ]);
          } else {
            sendNotice(nick, 'Your choice? [A/T/R] (? for menu)');
          }
          break;
        }

        if (event && event.prompt === 'scroll') {
          if (cmdLower === 's') {
            const result = game.processForestEvent(nick, { type: 'scroll_save' });
            const us = getState(nick);
            us.temp.eventOutcome = result;
            const lines = ['', border(), r('  EVENT: ' + result.event), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            lines.push("  You're quite a hero. Unfortunately, the girl seems");
            lines.push("  to have forgotten the return address. You'll have");
            lines.push("  to guess.");
            lines.push('');
            lines.push('  (C)astle Coldrake');
            lines.push('  (F)ortress Liddux');
            lines.push('  (G)annon Keep');
            lines.push('  (P)enyon Manor');
            lines.push("  (D)ema's Lair");
            lines.push('');
            lines.push(r('Where do we go now? [C/F/G/P/D] (? for menu)'));
            sendLines(nick, lines);
          } else if (cmdLower === 'i') {
            const result = game.processForestEvent(nick, { type: 'scroll_ignore' });
            const lines = ['', border(), r('  EVENT: ' + result.event), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            sendLines(nick, lines);
            showForest(nick);
          } else if (cmdLower === 'r') {
            sendLines(nick, [
              '',
              'Are you sure you want to leave? [Y/N]',
              '',
              r('(Y)es, (N)o (? for menu)')
            ]);
            const us = getState(nick);
            us.temp.eventToConfirm = { action: 'leave' };
            setState(nick, PLAYER_STATES.FOREST_EVENT_CONFIRM);
          } else if (cmdLower === '?') {
            sendLines(nick, [
              '',
              border(),
              r('  EVENT: Scroll'),
              border(),
              '',
              '  The scroll reads:',
              '  I am to wed one against my will. My father tells me',
              '  I am selfish, because this political marriage will',
              '  bring peace. Get me out of here, -a prisoner of war',
              '',
              w('(S)ave her'),
              w('(I)gnore the girl'),
              '',
              r('Well? [S/I] (? for menu)')
            ]);
          } else {
            sendNotice(nick, 'Well? [S/I] (? for menu)');
          }
          break;
        }

        if (event && event.prompt === 'scroll_location') {
          const locations = ['c', 'f', 'g', 'p', 'd'];
          if (locations.includes(cmdLower)) {
            const result = game.processScrollRescue(nick, cmdLower);
            const lines = ['', border(), r('  EVENT: Rescue'), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            sendLines(nick, lines);
            showForest(nick);
          } else if (cmdLower === 'r') {
            sendLines(nick, [
              '',
              'Are you sure you want to leave? [Y/N]',
              '',
              r('(Y)es, (N)o (? for menu)')
            ]);
            const us = getState(nick);
            us.temp.eventToConfirm = { action: 'leave' };
            setState(nick, PLAYER_STATES.FOREST_EVENT_CONFIRM);
          } else if (cmdLower === '?') {
            sendLines(nick, [
              '',
              border(),
              r('  EVENT: Rescue'),
              border(),
              '',
              "  You're quite a hero. Unfortunately, the girl seems",
              "  to have forgotten the return address. You'll have",
              "  to guess.",
              '',
              w('(C)astle Coldrake'),
              w('(F)ortress Liddux'),
              w('(G)annon Keep'),
              w('(P)enyon Manor'),
              w("(D)ema's Lair"),
              '',
              r('Where do we go now? [C/F/G/P/D] (? for menu)')
            ]);
          } else {
            sendNotice(nick, 'Where do we go now? [C/F/G/P/D] (? for menu)');
          }
          break;
        }

        if (event && event.prompt === 'fairy_interact') {
          if (cmdLower === 'a') {
            const result = game.processForestEvent(nick, { type: 'fairy_blessing' });
            const lines = ['', border(), r('  EVENT: Fairy'), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            lines.push('(G)ems - Pray for fortune');
            lines.push('(H)orse - Seek a companion');
            lines.push('(K)iss - Receive healing');
            lines.push('');
            lines.push(r('Well? [G/H/K] (? for menu)'));
            sendLines(nick, lines);
            userState.temp.eventOutcome = result;
          } else if (cmdLower === 't') {
            const result = game.processForestEvent(nick, { type: 'fairy_catch' });
            const lines = ['', border(), r('  EVENT: Fairy'), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            sendLines(nick, lines);
            savePlayer(nick, loadPlayer(nick));
            showForest(nick);
          } else if (cmdLower === '?') {
            sendLines(nick, [
              '',
              border(),
              r('  EVENT: Fairy'),
              border(),
              '',
              'YOU ARE NOTICED!',
              '',
              'The small things encircle you. A small wet female',
              'bangs your shin. "How dare you spy on us, human!"',
              '',
              w('(A)sk for a blessing'),
              w('(T)ry to catch one to show your friends'),
              '',
              r('Your choice? [A/T] (? for menu)')
            ]);
          } else {
            clearMessageQueue(nick);
            sendLines(nick, [
              '',
              border(),
              r('  EVENT: Fairy'),
              border(),
              '',
              'YOU ARE NOTICED!',
              '',
              'The small things encircle you.',
              '',
              w('(A)sk for a blessing'),
              w('(T)ry to catch one'),
              '',
              r('Your choice? [A/T] (? for menu)')
            ]);
          }
          break;
        }

        if (event && event.prompt === 'fairy_blessing') {
          if (cmdLower === 'g') {
            sendLines(nick, [
              '',
              'Do you want to pray for gems? [Y/N]',
              '',
              r('(Y)es, (N)o (? for menu)')
            ]);
            const us = getState(nick);
            us.temp.eventToConfirm = { action: 'fairy_gems' };
            setState(nick, PLAYER_STATES.FOREST_EVENT_CONFIRM);
          } else if (cmdLower === 'h') {
            sendLines(nick, [
              '',
              'Do you want to seek a fairy horse? [Y/N]',
              '',
              r('(Y)es, (N)o (? for menu)')
            ]);
            const us = getState(nick);
            us.temp.eventToConfirm = { action: 'fairy_horse' };
            setState(nick, PLAYER_STATES.FOREST_EVENT_CONFIRM);
          } else if (cmdLower === 'k') {
            sendLines(nick, [
              '',
              'Do you want to receive healing? [Y/N]',
              '',
              r('(Y)es, (N)o (? for menu)')
            ]);
            const us = getState(nick);
            us.temp.eventToConfirm = { action: 'fairy_kiss' };
            setState(nick, PLAYER_STATES.FOREST_EVENT_CONFIRM);
          } else if (cmdLower === 'r') {
            sendLines(nick, [
              '',
              'Are you sure you want to leave? [Y/N]',
              '',
              r('(Y)es, (N)o (? for menu)')
            ]);
            const us = getState(nick);
            us.temp.eventToConfirm = { action: 'leave' };
            setState(nick, PLAYER_STATES.FOREST_EVENT_CONFIRM);
          } else if (cmdLower === '?') {
            sendLines(nick, [
              '',
              border(),
              r('  EVENT: Fairy'),
              border(),
              '',
              '  A tiny fairy appears before you!',
              '"Bless me!" you implore the small figure.',
              '',
              '"Very well." she agrees. "But we\'re still',
              'angry at you! What would you like?"',
              '',
              '  (G)ems - Pray for fortune',
              '  (H)orse - Seek a companion',
              '  (K)iss - Receive healing',
              '',
              '  Well? [G/H/K] (? for menu)',
              ''
            ]);
          } else {
            clearMessageQueue(nick);
            sendLines(nick, [
              '',
              border(),
              r('  EVENT: Fairy'),
              border(),
              '',
              '  A tiny fairy appears before you!',
              '"Bless me!" you implore the small figure.',
              '',
              '"Very well." she agrees. "But we\'re still',
              'angry at you! What would you like?"',
              '',
              w('(G)ems - Pray for fortune'),
              w('(H)orse - Seek a companion'),
              w('(K)iss - Receive healing'),
              '',
              r('Well? [G/H/K] (? for menu)')
            ]);
          }
          break;
        }

        if (event && event.prompt === 'hag') {
          if (cmdLower === 'y') {
            const result = game.processForestEvent(nick, { type: 'hag_yes' });
            const lines = ['', border(), r('  EVENT: Old Hag'), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            sendLines(nick, lines);
            showForest(nick);
          } else if (cmdLower === 'n') {
            const result = game.processForestEvent(nick, { type: 'hag_no' });
            const lines = ['', border(), r('  EVENT: Old Hag'), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            sendLines(nick, lines);
            showForest(nick);
          } else if (cmdLower === '?') {
            sendLines(nick, [
              '',
              border(),
              r('  EVENT: Old Hag'),
              border(),
              '',
              '  You come across an ugly old hag.',
              '"Give me a gem and I will completely heal you',
              'warrior!" she screeches.',
              '',
              '  Give her the gem? [Y/N] (? for menu)',
              ''
            ]);
          } else {
            sendNotice(nick, 'Give her the gem? [Y/N] (? for menu)');
          }
          break;
        }

        if (event && event.prompt === 'creepy_olivia') {
          if (cmdLower === 'g') {
            const result = game.processForestEvent(nick, { type: 'creepy_olivia_head' });
            const lines = ['', border(), r('  EVENT: Creepy Olivia'), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            sendLines(nick, lines);
            savePlayer(nick, loadPlayer(nick));
            showForest(nick);
          } else if (cmdLower === 'k') {
            const result = game.processForestEvent(nick, { type: 'creepy_olivia_kiss' });
            const lines = ['', border(), r('  EVENT: Creepy Olivia'), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            sendLines(nick, lines);
            savePlayer(nick, loadPlayer(nick));
            showForest(nick);
          } else if (cmdLower === '?') {
            sendLines(nick, [
              '',
              border(),
              r('  EVENT: Creepy Olivia'),
              border(),
              '',
              '  WAIT A SEC!',
              '',
              '  It\'s just your old pal Olivia the bodyless woman.',
              '',
              '  Olivia greets you with a head hug.',
              '',
              w('  (G)et inside her head'),
              w('  (K)iss her.'),
              '',
              r('  What will it be? [G/K] (? for menu)'),
              ''
            ]);
          } else {
            sendNotice(nick, 'What will it be? [G/K] (? for menu)');
          }
          break;
        }

        switch (cmdLower) {
          case 'r': case 'R':
            flushQueue(nick);
            {
              const nextEvent = us.temp.nextEvent;
              const nextState = us.temp.nextState;
              const event = us.temp.eventOutcome;

              if (nextEvent) {
                us.temp = {};
                us.displayMode = false;
                const result = game.processForestEvent(nick, { type: nextEvent });
                if (result) {
                  const lines = ['', border(), r('  EVENT: ' + result.event), border(), ''];
                  result.outcomes.forEach(o => lines.push('  ' + o));
                  if (result.prompt) {
                    lines.push('');
                    us.temp.eventOutcome = result;
                    sendLines(nick, lines);
                    setState(nick, PLAYER_STATES.FOREST_EVENT);
                    return;
                  }
                  lines.push('');
                  sendLines(nick, lines);
                }
                showForest(nick);
                return;
              }

              if (nextState) {
                us.temp = {};
                us.displayMode = false;
                if (nextState === 'dwarf') {
                  showDwarfGames(nick);
                } else if (nextState === 'hut') {
                  showForestHut(nick);
                } else {
                  showForest(nick);
                }
                return;
              }

              if (event && event.prompt) {
                sendLines(nick, [
                  '',
                  'Are you sure you want to leave? [Y/N]',
                  '',
                  r('(Y)es, (N)o (? for menu)')
                ]);
                setState(nick, PLAYER_STATES.FOREST_EVENT_CONFIRM);
              } else {
                us.temp = {};
                us.displayMode = false;
                showForest(nick);
              }
            }
            break;
          default:
            flushQueue(nick);
            const eventForDefault = us.temp.eventOutcome;
            if (eventForDefault && eventForDefault.prompt) {
              us.temp.eventToConfirm = eventForDefault;
              sendLines(nick, [
                '',
                'Are you sure you want to leave? [Y/N]',
                '',
                r('(Y)es, (N)o (? for menu)')
]);
              setState(nick, PLAYER_STATES.FOREST_EVENT_CONFIRM);
            } else {
              sendLines(nick, ['', 'Press R to continue.', '']);
            }
            break;
        }
      }
      break;

    case PLAYER_STATES.FOREST_EVENT_CONFIRM:
      if (cmdLower === 'y' || cmdLower === 'Y') {
        const us = getState(nick);
        const action = us.temp.eventToConfirm;
        
        if (action && action.action) {
          if (action.action === 'fairy_interact') {
            us.temp = {};
            us.displayMode = false;
            const result = game.processForestEvent(nick, { type: 'fairy_interact' });
            us.temp.eventOutcome = result;
            const lines = ['', border(), r('  EVENT: Fairy'), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            lines.push('  A tiny fairy appears before you!');
            lines.push('  "Bless me!" you implore the small figure.');
            lines.push('');
            lines.push('  "Very well." she agrees. "But we\'re still');
            lines.push('  angry at you! What would you like?"');
            lines.push('');
            lines.push('  (G)ems - Pray for fortune');
            lines.push('  (H)orse - Seek a companion');
            lines.push('  (K)iss - Receive healing');
            lines.push('');
            lines.push(r('Well? [G/H/K] (? for menu)'));
            us.displayMode = true;
            sendLines(nick, lines);
          } else if (action.action === 'fairy_catch') {
            us.temp = {};
            us.displayMode = false;
            const result = game.processForestEvent(nick, { type: 'fairy_catch' });
            const lines = ['', border(), r('  EVENT: Fairy'), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            sendLines(nick, lines);
            showForest(nick);
          } else if (action.action === 'fairy_gems') {
            us.temp = {};
            us.displayMode = false;
            const result = game.processForestEvent(nick, { type: 'fairy_gems' });
            const lines = ['', border(), r('  EVENT: Fairy'), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            sendLines(nick, lines);
            showForest(nick);
          } else if (action.action === 'fairy_horse') {
            us.temp = {};
            us.displayMode = false;
            const result = game.processForestEvent(nick, { type: 'fairy_horse' });
            const lines = ['', border(), r('  EVENT: Fairy'), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            sendLines(nick, lines);
            showForest(nick);
          } else if (action.action === 'fairy_kiss') {
            us.temp = {};
            us.displayMode = false;
            const result = game.processForestEvent(nick, { type: 'fairy_kiss' });
            const lines = ['', border(), r('  EVENT: Fairy'), border(), ''];
            result.outcomes.forEach(o => lines.push('  ' + o));
            lines.push('');
            sendLines(nick, lines);
            showForest(nick);
          } else if (action.action === 'leave') {
            us.temp = {};
            us.displayMode = false;
            showForest(nick);
          } else {
            showForest(nick);
          }
        } else {
          showForest(nick);
        }
      } else if (cmdLower === 'n' || cmdLower === 'N' || cmdLower === '?') {
        clearMessageQueue(nick);
        const us = getState(nick);
        const event = us.temp.eventToConfirm;
        
        if (event && event.prompt) {
          if (event.prompt === 'fairy_interact') {
            const lines = [
              '',
              border(),
              r('  EVENT: Fairy'),
              border(),
              '',
              'YOU ARE NOTICED!',
              '',
              'The small things encircle you. A small wet female',
              'bangs your shin. "How dare you spy on us, human!"',
              '',
              w('(A)sk for a blessing'),
              w('(T)ry to catch one to show your friends'),
              w('(R)eturn to Forest'),
              '',
              r('Your choice? [A/T/R] (? for menu)')
            ];
            sendLines(nick, lines);
          } else if (event.prompt === 'fairy_blessing') {
            const lines = [
              '',
              border(),
              r('  EVENT: Fairy'),
              border(),
              '',
              '  A tiny fairy appears before you!',
              '"Bless me!" you implore the small figure.',
              '',
              '"Very well." she agrees. "But we\'re still',
              'angry at you! What would you like?"',
              '',
              w('(G)ems - Pray for fortune'),
              w('(H)orse - Seek a companion'),
              w('(K)iss - Receive healing'),
              '',
              r('Well? [G/H/K] (? for menu)')
            ];
            sendLines(nick, lines);
          } else if (event.prompt === 'scroll') {
            const lines = [
              '',
              border(),
              r('  EVENT: Scroll'),
              border(),
              '',
              '  The scroll reads:',
              '  I am to wed one against my will. My father tells me',
              '  I am selfish, because this political marriage will',
              '  bring peace. Get me out of here, -a prisoner of war',
              '',
              w('(S)ave her'),
              w('(I)gnore the girl'),
              '',
              r('Well? [S/I] (? for menu)')
            ];
            sendLines(nick, lines);
          } else if (event.prompt === 'oldman') {
            const lines = [
              '',
              border(),
              r('  EVENT: Old Man'),
              border(),
              '',
              '  You come across an old man. He seems confused and',
              '  asks if you would direct him to the Inn. You know',
              '  that if you do, you will lose time for one fight',
              '  today.',
              '',
              '  Do you take the old man? [Y/N] (? for menu)',
              ''
            ];
            sendLines(nick, lines);
          } else if (event.prompt === 'hag') {
            const lines = [
              '',
              border(),
              r('  EVENT: Old Hag'),
              border(),
              '',
              '  You come across an ugly old hag.',
              '"Give me a gem and I will completely heal you',
              'warrior!" she screeches.',
              '',
              '  Give her the gem? [Y/N] (? for menu)',
              ''
            ];
            sendLines(nick, lines);
          } else {
            showForest(nick);
          }
        } else if (us.temp.nextState) {
          if (us.temp.nextState === 'dwarf') {
            showDwarfGames(nick);
          } else if (us.temp.nextState === 'hut') {
            showForestHut(nick);
          } else {
            showForest(nick);
          }
        } else {
          showForest(nick);
        }
      } else {
        sendNotice(nick, 'Are you sure you want to leave? [Y/N] (? for menu)');
      }
      break;

    case PLAYER_STATES.FOREST_EVENT_CONTINUE:
      if (cmdLower === 'y' || cmdLower === 'Y') {
        savePlayer(nick, loadPlayer(nick));
        showForest(nick);
      } else if (cmdLower === 'n' || cmdLower === 'N' || cmdLower === '?') {
        clearMessageQueue(nick);
        const us = getState(nick);
        const result = us.temp.eventOutcome;
        const lines = ['', border(), r('  EVENT: Fairy'), border(), ''];
        result.outcomes.forEach(o => lines.push('  ' + o));
        lines.push('');
        lines.push('Are you leaving? [Y/N]');
        lines.push('');
        lines.push(r('(Y)es, (N)o (? for menu)'));
        sendLines(nick, lines);
      } else {
        sendNotice(nick, 'Are you leaving? [Y/N] (? for menu)');
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
              sendLines(nick, ['', 'Press R to continue.', '']);
            }
            break;
          }
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

        if (cmdLower === '?' || cmdLower === '') {
          showSkillMenu(nick);
          break;
        }

        if (cmdLower === 'r' || cmdLower === 'R') {
          returnToFightState(nick, lastFight);
          break;
        }

        if (!skillPlayer.skill_charges_max || skillPlayer.skill_charges_active <= 0) {
          sendNotice(nick, 'No skill charges remaining!');
          returnToFightState(nick, lastFight);
          break;
        }

        const skillKeys = { 0: ['d'], 1: ['p', 'd', 'h', 'l', 's', 'm'], 2: ['s'] };
        const validKeys = skillKeys[skillPlayer.class] || [];

        if (!validKeys.includes(cmdLower)) {
          sendNotice(nick, 'Invalid skill for your class!');
          showSkillMenu(nick);
          break;
        }

        if (skillPlayer.class === 1) {
          const skillLevel = skillPlayer.usesm || 0;
          const currentKey = getMysticKey(skillLevel);
          if (cmdLower !== currentKey) {
            const skillInfo = getMysticSkill(skillLevel);
            sendNotice(nick, 'Your current mystical skill is (' + skillInfo.key + ') ' + skillInfo.name);
            break;
          }
        }

        performSkill(nick, cmdLower);
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
      if (cmdLower === 'b') {
        const result = game.robBank(nick);
        if (result.success) {
          sendLines(nick, [
            '',
            r('** ROBBERY **'),
            'The fairy escapes from your pocket and she unlocks',
            'the bank door for you.',
            '',
            'You manage to make off with ' + g(game.formatNumber(result.stolen)) + ' gold.',
            'Total gold: ' + g(game.formatNumber(result.total)),
            '',
            'The fairy escapes...',
            ''
          ]);
        } else {
          sendNotice(nick, result.error);
        }
        showBank(nick);
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
          if (result.charmGain) {
            sendNotice(nick, 'You gain an extra charm point!');
          }
        } else {
          sendNotice(nick, result.error);
        }
      } else {
        sendNotice(nick, 'Healers Hut - H,R,Q');
      }
      showHealer(nick);
      break;

    case PLAYER_STATES.INN:
      {
        const stats = game.getPlayerStats(nick);
        if (cmdLower === 'r' || cmdLower === 'q') {
          showMainMenu(nick);
          break;
        }
        if (cmdLower === 'c') {
          showInnConvo(nick);
          break;
        }
        if (cmdLower === 'f' && stats.sex === 0) {
          showViolet(nick);
          break;
        }
        if (cmdLower === 't') {
          showInnBartender(nick);
          break;
        }
        if (cmdLower === 'g') {
          showInnRoom(nick);
          break;
        }
        if (cmdLower === 'v') {
          showStats(nick);
          break;
        }
        if (cmdLower === 'h') {
          showSethAble(nick);
          break;
        }
        if (cmdLower === 'm') {
          showMakeAnnouncement(nick);
          break;
        }
        if (cmdLower === 'l') {
          game.leaveInn(nick);
          sendNotice(nick, 'You leave the inn. You are no longer protected.');
          showInn(nick);
          break;
        }
        if (cmdLower === '?') {
          clearMessageQueue(nick);
          showInn(nick);
          break;
        }
        clearMessageQueue(nick);
        showInn(nick);
        break;
      }

    case PLAYER_STATES.INN_CONVO:
      if (cmdLower === 'c' || cmdLower === 'r' || cmdLower === '' || cmdLower === '?') {
        if (cmdLower === '?') {
          clearMessageQueue(nick);
          showInnConvo(nick);
          break;
        }
        showInn(nick);
        break;
      }
      if (cmdLower === 'a') {
        setState(nick, PLAYER_STATES.INN_CONVO_ADD);
        sendLines(nick, [
          '',
          '  Share your feelings now... (Max 75 char!)',
          '',
          r('Type your message (R to cancel) (? for menu)'),
          ''
        ]);
        break;
      }
      clearMessageQueue(nick);
      showInnConvo(nick);
      break;

    case PLAYER_STATES.INN_CONVO_ADD:
      {
        if (cmdLower === '?') {
          clearMessageQueue(nick);
          sendLines(nick, [
            '',
            '  Share your feelings now... (Max 75 char!)',
            '',
            r('Type your message (R to cancel) (? for menu)'),
            ''
          ]);
          break;
        }
        const player = loadPlayer(nick);
        if (cmdLower === 'r') {
          showInnConvo(nick);
          break;
        }
        const msg = cmd.trim().substring(0, 75);
        if (msg && player) {
          innNewConvo.push(player.name);
          innNewConvo.push(msg);
          sendNotice(nick, 'Your words echo through the inn...');
        }
        showInnConvo(nick);
      }
      break;

    case PLAYER_STATES.INN_ANNOUNCEMENT:
      if (cmdLower === 'r') {
        showInn(nick);
        break;
      }
      if (cmdLower === '?') {
        clearMessageQueue(nick);
        showMakeAnnouncement(nick);
        break;
      }
      {
        const msg = cmd.trim();
        if (msg && msg.length > 0) {
          if (addAnnouncement(nick, msg)) {
            sendNotice(nick, 'Your announcement has been posted!');
          }
        }
        showInn(nick);
      }
      break;

    case PLAYER_STATES.INN_BARTENDER:
      if (cmdLower === 'r') {
        showInn(nick);
        break;
      }
      if (cmdLower === 'v') {
        showViolet(nick);
        break;
      }
      if (cmdLower === 'g') {
        showInnBartenderGems(nick);
        break;
      }
      if (cmdLower === 'b') {
        showInnBartenderBribe(nick);
        break;
      }
      if (cmdLower === '?') {
        clearMessageQueue(nick);
        showInnBartender(nick);
        break;
      }
      clearMessageQueue(nick);
      showInnBartender(nick);
      break;

    case PLAYER_STATES.INN_BARTENDER_GEMS:
      if (cmdLower === 'r') {
        showInn(nick);
        break;
      }
      if (cmdLower === '?') {
        clearMessageQueue(nick);
        showInnBartenderGems(nick);
        break;
      }
      const gemCount = parseInt(cmd);
      if (!isNaN(gemCount) && gemCount > 0) {
        setState(nick, PLAYER_STATES.INN_BARTENDER_GEMS_BUY);
        const userState = getState(nick);
        userState.temp = { gemCount: gemCount };
        sendLines(nick, [
          '',
          '  The bartender retrieves a steaming tankard from the',
          '  back room. Before you drink it, what do you',
          '  wish for?',
          '',
          w('(H)it Points'),
          w('(S)trength'),
          w('(D)efense'),
          w('(E)lixir'),
          w('(R)eturn to bar'),
          '',
          r('Well? (H,S,D,E,R) (? for menu)')
        ]);
        break;
      }
      clearMessageQueue(nick);
      showInnBartenderGems(nick);
      break;

    case PLAYER_STATES.INN_BARTENDER_GEMS_BUY:
      {
        const userState = getState(nick);
        const gemCount = userState.temp?.gemCount || 0;
        const player = loadPlayer(nick);

        if (cmdLower === 'e') {
          showInnBartenderGems(nick);
          return;
        }

        if (cmdLower === 'r') {
          showInn(nick);
          return;
        }

        if (cmdLower === '?') {
          clearMessageQueue(nick);
          const lines = [
            '',
            '  The bartender retrieves a steaming tankard from the',
            '  back room. Before you drink it, what do you',
            '  wish for?',
            '',
            w('(H)it Points'),
            w('(S)trength'),
            w('(D)efense'),
            w('(E)lixir'),
            w('(R)eturn to bar'),
            '',
            r('Well? (H,S,D,E,R) (? for menu)')
          ];
          sendLines(nick, lines);
          return;
        }

        if (gemCount > player.gems / 2) {
          sendNotice(nick, 'You don\'t have that many gems!');
          showInn(nick);
          return;
        }

        if (cmdLower === 'h' || cmdLower === 's' || cmdLower === 'd') {
          const lines = [''];
          player.gems -= gemCount * 2;

          switch (cmdLower) {
            case 'h':
              player.maxhp += gemCount;
              player.hp = player.maxhp;
              lines.push('YOU DRINK THE BREW AND YOUR SOUL REJOICES!');
              lines.push('You increased your MAX HP by ' + gemCount + '!');
              lines.push('You now have ' + player.maxhp + ' MAX HP.');
              break;
            case 's':
              player.str += gemCount;
              lines.push('YOU DRINK THE BREW AND YOUR SOUL REJOICES!');
              lines.push('You increased your STR by ' + gemCount + '!');
              lines.push('You now have ' + player.str + ' STR.');
              break;
            case 'd':
              player.def += gemCount;
              lines.push('YOU DRINK THE BREW AND YOUR SOUL REJOICES!');
              lines.push('You increased your DEF by ' + gemCount + '!');
              lines.push('You now have ' + player.def + ' DEF.');
              break;
          }
          savePlayer(nick, player);
          sendLines(nick, lines);
          showInn(nick);
        } else {
          clearMessageQueue(nick);
          const lines = [
            '',
            '  The bartender retrieves a steaming tankard from the',
            '  back room. Before you drink it, what do you',
            '  wish for?',
            '',
            w('(H)it Points'),
            w('(S)trength'),
            w('(D)efense'),
            w('(E)lixir'),
            '',
            r('Well? (H,S,D,E) (? for menu)')
          ];
          sendLines(nick, lines);
        }
      }
      break;

    case PLAYER_STATES.INN_BARTENDER_BRIBE:
      if (cmdLower === 'r' || cmdLower === 'R') {
        showInn(nick);
        break;
      }
      if (cmdLower === '?') {
        clearMessageQueue(nick);
        showInnBartenderBribe(nick);
        break;
      }
      {
        const player = loadPlayer(nick);
        const bribeCost = player.level * 1600;
        const targetNum = parseInt(cmd);

        if (!isNaN(targetNum) && targetNum > 0) {
          if (player.gold < bribeCost) {
            sendNotice(nick, '"Hey! You slobbering idiot! You don\'t have that much gold!"');
            showInn(nick);
            break;
          }

          const players = game.getPlayerList();
          const roomPlayers = players.filter(p => 
            p.name.toLowerCase() !== nick.toLowerCase() && 
            p.dead === 0 &&
            p.stayinn === 1
          );

          if (targetNum < 1 || targetNum > roomPlayers.length) {
            sendNotice(nick, 'Invalid guest number!');
            showInnBartenderBribe(nick);
            break;
          }

          const target = roomPlayers[targetNum - 1];
          player.gold -= bribeCost;
          savePlayer(nick, player);
          sendNotice(nick, 'You pay ' + bribeCost + ' gold to the bartender.');
          sendNotice(nick, '"Now go get \'em, tiger!"');

          startInnRoomFight(nick, target.name);
          break;
        }

        clearMessageQueue(nick);
        showInnBartenderBribe(nick);
        break;
      }

    case PLAYER_STATES.INN_SETH:
      {
        const us = getState(nick);
        const returnTo = us.temp?.sethReturn || 'inn';
        const returnFn = returnTo === 'darkcloak' ? showDarkCloak : showInn;

        if (cmdLower === 'r') {
          returnFn(nick);
          break;
        }
        if (cmdLower === 'a') {
          sethSings(nick);
          break;
        }
        if (cmdLower === '?' || cmdLower === 'f') {
          showSethAble(nick, returnTo);
          if (cmdLower === '?') break;
        }
        if (cmdLower === 'f') {
          const player = loadPlayer(nick);
          const now = Date.now();

          if (player.violet_timer && now < player.violet_timer) {
            const timeLeft = player.violet_timer - now;
            const hoursLeft = Math.floor(timeLeft / 3600000);
            const minsLeft = Math.floor((timeLeft % 3600000) / 60000);
            sendNotice(nick, 'Seth says "Come back later, darling. Try again in ' + hoursLeft + 'h ' + minsLeft + 'm"');
            returnFn(nick);
            break;
          }

        const sethLines = [''];
        const c = player ? player.charm : 1;
        const lvl = player ? player.level : 1;
        let success = false;

        switch (cmdLower) {
          case 'n':
            sethLines.push('"Perhaps another time then..."');
            break;
          case 'w':
            if (c >= 1) {
              const xpEarned = 5 * lvl;
              sethLines.push('`%You wink at Seth seductively..');
              sethLines.push('He blushes and smiles!!');
              sethLines.push('You are making progress with him!');
              sethLines.push('');
              sethLines.push('You receive ' + xpEarned + ' experience!');
              if (player) {
                player.xp = Math.min(10000000, player.xp + xpEarned);
                player.violet_timer = now + (24 * 60 * 60 * 1000);
                savePlayer(nick, player);
              }
              success = true;
            } else {
              sethLines.push('Seth ignores your wink.');
            }
            break;
          case 'k':
            if (c >= 2) {
              sethLines.push('You take Seth\'s hand and kiss it.');
              sethLines.push('He blushes deeply!');
              sethLines.push('');
              sethLines.push('You receive 10 experience!');
              if (player) {
                player.xp = Math.min(10000000, player.xp + 10);
                player.violet_timer = now + (24 * 60 * 60 * 1000);
                savePlayer(nick, player);
              }
              success = true;
            } else {
              sethLines.push('Seth pulls his hand away.');
            }
            break;
          case 'p':
            if (c >= 4) {
              sethLines.push('You lean in and peck Seth on the lips.');
              sethLines.push('He smiles warmly at you!');
              sethLines.push('');
              sethLines.push('You receive 20 experience!');
              if (player) {
                player.xp = Math.min(10000000, player.xp + 20);
                player.violet_timer = now + (24 * 60 * 60 * 1000);
                savePlayer(nick, player);
              }
              success = true;
            } else {
              sethLines.push('Seth turns away coldly.');
            }
            break;
          case 's':
            if (c >= 8) {
              sethLines.push('You pat your lap and Seth sits down.');
              sethLines.push('He snuggles up to you!');
              sethLines.push('');
              sethLines.push('You receive 30 experience!');
              if (player) {
                player.xp = Math.min(10000000, player.xp + 30);
                player.violet_timer = now + (24 * 60 * 60 * 1000);
                savePlayer(nick, player);
              }
              success = true;
            } else {
              sethLines.push('"I hardly know you!" Seth scoffs.');
            }
            break;
          case 'g':
            if (c >= 16) {
              sethLines.push('You grab Seth\'s backside!');
              sethLines.push('"Ooh, you bad boy!" He giggles.');
              sethLines.push('');
              sethLines.push('You receive 40 experience!');
              if (player) {
                player.xp = Math.min(10000000, player.xp + 40);
                player.violet_timer = now + (24 * 60 * 60 * 1000);
                savePlayer(nick, player);
              }
              success = true;
            } else {
              sethLines.push('Seth slaps your hand away!');
            }
            break;
          case 'c':
            if (c >= 32) {
              if (random(1, 100) > 70) {
                sethLines.push('You sweep Seth off his feet...');
                sethLines.push('You take Seth upstairs...');
                sethLines.push('');
                sethLines.push('You receive 240 experience!');
                if (player) {
                  player.xp = Math.min(10000000, player.xp + 240);
                  player.lays += 1;
                  player.violet_timer = now + (24 * 60 * 60 * 1000);
                  savePlayer(nick, player);
                }
                success = true;
              } else {
                sethLines.push('"Maybe another time, dear..."');
                sethLines.push('Seth giggles and walks away.');
              }
            } else {
              sethLines.push('Seth gives you a disapproving look.');
            }
            break;
          case 'm':
            if (c >= 100) {
              sethLines.push('"Yes! A thousand times yes!"');
              sethLines.push('You and Seth are now wed!');
              sethLines.push('');
              sethLines.push('You receive 1000 experience!');
              if (player) {
                player.xp = Math.min(10000000, player.xp + 1000);
                player.marriedto = 'Seth';
                player.violet_timer = now + (24 * 60 * 60 * 1000);
                savePlayer(nick, player);
              }
              success = true;
            } else {
              sethLines.push('"You need at least 100 charm to marry me!"');
            }
            break;
          default:
            clearMessageQueue(nick);
            showSethAble(nick, returnTo);
            return;
        }

        sethLines.push('');
        sendLines(nick, sethLines);
        returnFn(nick);
        break;
      }
      clearMessageQueue(nick);
      returnFn(nick);
      break;
    }

    case PLAYER_STATES.INN_VIOLET:
      {
        const us = getState(nick);
        const returnTo = us.temp?.violetReturn || 'inn';
        const returnFn = returnTo === 'darkcloak' ? showDarkCloak : showInn;

        if (cmdLower === 'r') {
          returnFn(nick);
          break;
        }
        if (cmdLower === '?') {
          clearMessageQueue(nick);
          showViolet(nick, returnTo);
          break;
        }

        const player = loadPlayer(nick);
        const now = Date.now();

        if (player.violet_timer && now < player.violet_timer) {
          const timeLeft = player.violet_timer - now;
          const hoursLeft = Math.floor(timeLeft / 3600000);
          const minsLeft = Math.floor((timeLeft % 3600000) / 60000);
          sendNotice(nick, 'Violet says "Come back later, honey. Try again in ' + hoursLeft + 'h ' + minsLeft + 'm"');
          returnFn(nick);
          break;
        }

        const violetLines = [''];
        const c = player ? player.charm : 1;
        const lvl = player ? player.level : 1;
        let success = false;

        switch (cmdLower) {
          case 'n':
            violetLines.push('"Perhaps another time then..."');
            break;
          case 'w':
            if (c >= 1) {
              const xpEarned = 5 * lvl;
              violetLines.push('`%You wink at Violet seductively..');
              violetLines.push('She blushes and smiles!!');
              violetLines.push('You are making progress with her!');
              violetLines.push('');
              violetLines.push('You receive ' + xpEarned + ' experience!');
              if (player) {
                player.xp = Math.min(10000000, player.xp + xpEarned);
                player.violet_timer = now + (24 * 60 * 60 * 1000);
                savePlayer(nick, player);
              }
              success = true;
            } else {
              violetLines.push('Violet ignores your wink.');
            }
            break;
          case 'k':
            if (c >= 2) {
              violetLines.push('You take Violet\'s hand and kiss it.');
              violetLines.push('She blushes deeply!');
              violetLines.push('');
              violetLines.push('You receive 10 experience!');
              if (player) {
                player.xp = Math.min(10000000, player.xp + 10);
                player.violet_timer = now + (24 * 60 * 60 * 1000);
                savePlayer(nick, player);
              }
              success = true;
            } else {
              violetLines.push('Violet pulls her hand away.');
            }
            break;
          case 'p':
            if (c >= 4) {
              violetLines.push('You lean in and peck Violet on the lips.');
              violetLines.push('She smiles warmly at you!');
              violetLines.push('');
              violetLines.push('You receive 20 experience!');
              if (player) {
                player.xp = Math.min(10000000, player.xp + 20);
                player.violet_timer = now + (24 * 60 * 60 * 1000);
                savePlayer(nick, player);
              }
              success = true;
            } else {
              violetLines.push('Violet turns away coldly.');
            }
            break;
          case 's':
            if (c >= 8) {
              violetLines.push('You pat your lap and Violet sits down.');
              violetLines.push('She snuggles up to you!');
              violetLines.push('');
              violetLines.push('You receive 30 experience!');
              if (player) {
                player.xp = Math.min(10000000, player.xp + 30);
                player.violet_timer = now + (24 * 60 * 60 * 1000);
                savePlayer(nick, player);
              }
              success = true;
            } else {
              violetLines.push('"I hardly know you!" Violet scoffs.');
            }
            break;
          case 'g':
            if (c >= 16) {
              violetLines.push('You grab Violet\'s backside!');
              violetLines.push('"Ooh, you bad boy!" She giggles.');
              violetLines.push('');
              violetLines.push('You receive 40 experience!');
              if (player) {
                player.xp = Math.min(10000000, player.xp + 40);
                player.violet_timer = now + (24 * 60 * 60 * 1000);
                savePlayer(nick, player);
              }
              success = true;
            } else {
              violetLines.push('Violet slaps your hand away!');
            }
            break;
          case 'c':
            if (c >= 32) {
              if (random(1, 100) > 70) {
                violetLines.push('You sweep Violet off her feet...');
                violetLines.push('You take Violet upstairs...');
                violetLines.push('');
                violetLines.push('You receive 240 experience!');
                if (player) {
                  player.xp = Math.min(10000000, player.xp + 240);
                  player.lays += 1;
                  player.violet_timer = now + (24 * 60 * 60 * 1000);
                  savePlayer(nick, player);
                }
                success = true;
              } else {
                violetLines.push('"Maybe another time, dear..."');
                violetLines.push('Violet giggles and walks away.');
              }
            } else {
              violetLines.push('Violet gives you a disapproving look.');
            }
            break;
          case 'm':
            if (c >= 100) {
              violetLines.push('"Yes! A thousand times yes!"');
              violetLines.push('You and Violet are now wed!');
              violetLines.push('');
              violetLines.push('You receive 1000 experience!');
              if (player) {
                player.xp = Math.min(10000000, player.xp + 1000);
                player.marriedto = 'Violet';
                player.violet_timer = now + (24 * 60 * 60 * 1000);
                savePlayer(nick, player);
              }
              success = true;
            } else {
              violetLines.push('"You need at least 100 charm to marry me!"');
            }
            break;
          default:
            clearMessageQueue(nick);
            showViolet(nick, returnTo);
            return;
        }

        violetLines.push('');
        sendLines(nick, violetLines);
        returnFn(nick);
        break;
      }

    case PLAYER_STATES.INN_ROOM:
      if (cmdLower === 'r' || cmdLower === 'n') {
        showInn(nick);
        break;
      }
      if (cmdLower === 'y') {
        const result = game.stayAtInn(nick);
        if (result.success) {
          sendNotice(nick, result.message);
        } else {
          sendNotice(nick, result.error);
        }
        showInn(nick);
        break;
      }
      if (cmdLower === '?') {
        clearMessageQueue(nick);
        showInnRoom(nick);
        break;
      }
      clearMessageQueue(nick);
      showInnRoom(nick);
      break;

    case PLAYER_STATES.INN_ROOM_ONLY:
      if (cmdLower === 'l' || cmdLower === 'r') {
        game.leaveInn(nick);
        sendNotice(nick, 'You leave your room. You are no longer protected.');
        showInn(nick);
        break;
      }
      if (cmdLower === 'j' || cmdLower === '?') {
        clearMessageQueue(nick);
        showInn(nick);
        break;
      }
      clearMessageQueue(nick);
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

case PLAYER_STATES.DARK_CLOAK:
      switch (cmdLower) {
        case 'c':
          showInnConvo(nick);
          break;
        case 'd':
          showNews(nick);
          break;
        case 'e':
          showDarkCloakEtchings(nick);
          break;
        case 't':
          showDarkCloakBartender(nick);
          break;
        case 'g':
          showDarkCloakGamble(nick);
          break;
        case 'r':
          sendLines(nick, [
            '',
            'Are you sure you want to leave Dark Cloak Tavern? [Y/N]',
            '',
            r('Well? (Y,N) (? for menu)')
          ]);
          setState(nick, PLAYER_STATES.DARK_CLOAK_CONFIRM_LEAVE);
          break;
        case '?':
          showDarkCloak(nick);
          break;
        default:
          clearMessageQueue(nick);
          showDarkCloak(nick);
      }
      break;

    case PLAYER_STATES.DARK_CLOAK_CONFIRM_LEAVE:
      if (cmdLower === 'y' || cmdLower === 'Y') {
        showForest(nick);
      } else if (cmdLower === 'n' || cmdLower === 'N' || cmdLower === '?') {
        clearMessageQueue(nick);
        showDarkCloak(nick);
      } else {
        clearMessageQueue(nick);
        sendLines(nick, [
          '',
          'Are you sure you want to leave Dark Cloak Tavern? [Y/N]',
          '',
          r('Well? (Y,N) (? for menu)')
        ]);
      }
      break;

    case PLAYER_STATES.DARK_CLOAK_BARTENDER:
      showDarkCloakBartenderMenu(nick, cmdLower);
      break;

    case PLAYER_STATES.DARK_CLOAK_GAMBLE:
      if (cmdLower === 'r') {
        showDarkCloak(nick);
        break;
      }
      if (cmdLower === '?') {
        clearMessageQueue(nick);
        showDarkCloakGamble(nick);
        break;
      }

      const player = loadPlayer(nick);
      if (!player) {
        showDarkCloak(nick);
        break;
      }

      if (player.gold <= 0) {
        sendNotice(nick, 'Come back when you have some gold.');
        showDarkCloak(nick);
        break;
      }

      let wagerAmount = 0;
      if (cmdLower === 'a') {
        wagerAmount = player.gold;
      } else {
        wagerAmount = parseInt(cmd);
      }

      if (isNaN(wagerAmount) || wagerAmount <= 0) {
        clearMessageQueue(nick);
        showDarkCloakGamble(nick);
        break;
      }

      if (wagerAmount > player.gold) {
        sendNotice(nick, 'You don\'t have that much gold!');
        showDarkCloakGamble(nick);
        break;
      }

      player.gold -= wagerAmount;
      savePlayer(nick, player);

      const us = getState(nick);
      us.gambleWager = wagerAmount;
      us.gambleNumber = random(1, 100);
      us.gambleTries = 6;

      sendLines(nick, [
        '',
        '  ** GUESS **',
        border(),
        '"All right now! I\'m thinking of a number between',
        '1 and 100. I\'ll give ya six guesses."',
        '',
        '(The old man leans out the window in anticipation)',
        '',
        r('Your guess (? for menu)'),
        ''
      ]);
      setState(nick, PLAYER_STATES.DARK_CLOAK_GUESS);
      break;

    case PLAYER_STATES.DARK_CLOAK_GUESS:
      {
        const us = getState(nick);
        const wager = us.gambleWager || 0;
        const secretNum = us.gambleNumber || 0;
        let tries = us.gambleTries || 0;

        if (cmdLower === '?') {
          clearMessageQueue(nick);
          sendLines(nick, [
            '',
            '  ** GUESS **',
            border(),
            '"All right now! I\'m thinking of a number between',
            '1 and 100. I\'ll give ya six guesses."',
            '',
            '(The old man leans out the window in anticipation)',
            '',
            'Guesses remaining: ' + tries,
            '',
            r('Your guess (? for menu)'),
            ''
          ]);
          break;
        }

        if (cmdLower === 'r') {
          showDarkCloak(nick);
          break;
        }

        const guess = parseInt(cmd);

        if (isNaN(guess) || guess < 1 || guess > 100) {
          clearMessageQueue(nick);
          sendLines(nick, [
            '',
            '  ** GUESS **',
            border(),
            'Invalid guess. Enter a number between 1 and 100.',
            '',
            'Guesses remaining: ' + tries,
            '',
            r('Your guess (? for menu)'),
            ''
          ]);
          break;
        }

        tries--;
        us.gambleTries = tries;

        if (guess === secretNum) {
          const winnings = wager * 2;
          const p = loadPlayer(nick);
          if (p) {
            p.gold = Math.min(p.gold + winnings, config.maxGold);
            savePlayer(nick, p);
          }

          sendLines(nick, [
            '',
            '"That\'s right! That\'s the number I was thinking of!"',
            '',
            'You win ' + winnings + ' gold!',
            ''
          ]);
          showDarkCloak(nick);
          break;
        } else if (tries <= 0) {
          sendLines(nick, [
            '',
            'You lost! You are out of guesses.',
            'The number was ' + secretNum,
            '',
            'You lost ' + wager + ' gold.',
            ''
          ]);
          showDarkCloak(nick);
          break;
        } else if (guess < secretNum) {
          clearMessageQueue(nick);
          sendLines(nick, [
            '',
            'Guess ' + (6 - tries) + ': ' + guess,
            '"The number is higher than that!"',
            '',
            'Guesses remaining: ' + tries,
            '',
            r('Your guess (? for menu)'),
            ''
          ]);
          break;
        } else {
          clearMessageQueue(nick);
          sendLines(nick, [
            '',
            'Guess ' + (6 - tries) + ': ' + guess,
            '"The number is lower than that!"',
            '',
            'Guesses remaining: ' + tries,
            '',
            r('Your guess (? for menu)'),
            ''
          ]);
          break;
        }
      }

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
      if (cmdLower === '?') {
        clearMessageQueue(nick);
        showTraining(nick);
        break;
      }
      clearMessageQueue(nick);
      showTraining(nick);
      break;

    case PLAYER_STATES.TRAINING_QUESTION:
      if (cmdLower === 'r') {
        showTraining(nick);
        break;
      }
      if (cmdLower === '?') {
        clearMessageQueue(nick);
        showTrainingQuestion(nick);
        break;
      }
      clearMessageQueue(nick);
      showTrainingQuestion(nick);
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
        if (cmdLower === 'r' || cmdLower === 'R') {
          sendLines(nick, [
            '',
            'Leave the dwarf games and return to forest? [Y/N]',
            '',
            r('Well? (Y,N) (? for menu)')
          ]);
          setState(nick, PLAYER_STATES.CONFIRM_LEAVE_DWARF);
          break;
        }
        const bet = parseInt(cmd);
        if (!isNaN(bet) && bet > 0) {
          startDwarfRound(nick, bet);
        } else {
          clearMessageQueue(nick);
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
      } else if (cmdLower === 'n' || cmdLower === 'N' || cmdLower === '?') {
        clearMessageQueue(nick);
        showDwarfGames(nick);
      } else {
        clearMessageQueue(nick);
        sendLines(nick, [
          '',
          'Leave the dwarf games and return to forest? [Y/N]',
          '',
          r('Well? (Y,N) (? for menu)')
        ]);
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
