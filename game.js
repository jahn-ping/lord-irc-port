import { config } from './config.js';
import { weapons, armors, levelGains, masters, monsters, deathMessages, classNames } from './gameData.js';
import { playerExists, loadPlayer, savePlayer, createPlayer, getAllPlayers } from './player.js';

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
  return num.toLocaleString();
}

export function getPlayerStats(nick) {
  const player = loadPlayer(nick);
  console.log('getPlayerStats: nick=' + nick + ', player=' + JSON.stringify(player));
  if (!player) return null;
  
  const weapon = weapons[player.weapon_num - 1];
  const armor = armors[player.armor_num - 1];
  const nextXp = getXpNeeded(player.level);
  
  return {
    ...player,
    weapon: weapon ? weapon.name : 'Fists',
    armor: armor ? armor.name : 'None',
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
  
  if (!name || name.length < 1 || name.length > 20) {
    console.log('createCharacter: Name validation failed!');
    return { success: false, message: 'Name must be 1-20 characters!' };
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
  
  const nextXp = getXpNeeded(player.level);
  
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

export function fightMonster(nick) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  if (player.fights <= 0) {
    return { error: 'No forest fights left! Stay at the Inn to be safe.' };
  }
  
  if (player.hp <= 0) {
    return { error: 'You are dead! You need to rest at the Inn.' };
  }
  
  player.fights--;
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
  if (monsterDamage < 0) monsterDamage = 0;
  
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

export function loseMonsterFight(nick, monsterGold) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  const lostGold = Math.floor(player.gold * 0.1);
  player.gold -= lostGold;
  player.dead = 1;
  player.dead_until = Date.now() + (10 * 60 * 1000);
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
  
  const weapon = weapons[weaponNum - 1];
  const sellPrice = Math.floor(weapon.cost * 0.5);
  
  player.gold += sellPrice;
  player.weapon_num = weaponNum;
  
  savePlayer(nick, player);
  
  return { success: true, weapon: weapon.name, sellPrice };
}

export function buyArmor(nick, armorNum) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  if (armorNum < 1 || armorNum > armors.length) {
    return { error: 'Invalid armor number!' };
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
  
  const armor = armors[armorNum - 1];
  const sellPrice = Math.floor(armor.cost * 0.5);
  
  player.gold += sellPrice;
  player.armor_num = armorNum;
  
  savePlayer(nick, player);
  
  return { success: true, armor: armor.name, sellPrice };
}

export function depositBank(nick, amount) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  if (amount <= 0 || amount > player.gold) {
    return { error: 'Invalid amount or insufficient funds!' };
  }
  
  player.gold -= amount;
  player.bank += amount;
  
  savePlayer(nick, player);
  
  return { success: true, amount, newBalance: player.bank };
}

export function withdrawBank(nick, amount) {
  const player = loadPlayer(nick);
  if (!player) return { error: 'Player not found!' };
  
  if (amount <= 0 || amount > player.bank) {
    return { error: 'Invalid amount or insufficient funds!' };
  }
  
  player.bank -= amount;
  player.gold += amount;
  
  savePlayer(nick, player);
  
  return { success: true, amount, newBalance: player.bank };
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
  
  savePlayer(nick, player);
  
  return { success: true, cost, hp: player.hp };
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
    .sort((a, b) => b.level - a.level || b.xp - a.xp)
    .slice(0, 20);
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
  
  if (!player.dead_until) return false;
  
  const now = Date.now();
  if (now < player.dead_until) {
    return { dead: true, remaining: player.dead_until - now };
  }
  
  player.dead_until = null;
  player.dead = 0;
  savePlayer(nick, player);
  return { dead: false };
}

export function killPlayer(nick, minutes) {
  const player = loadPlayer(nick);
  if (!player) return false;
  
  player.dead = 1;
  player.dead_until = Date.now() + (minutes * 60 * 1000);
  player.hp = 1;
  savePlayer(nick, player);
  return true;
}

export function incrementSeenMaster(nick) {
  const player = loadPlayer(nick);
  if (!player) return false;
  
  player.seen_master = (player.seen_master || 0) + 1;
  savePlayer(nick, player);
  return true;
}

export { weapons, armors, classNames, masters, getWeaponAttack, getArmorDefense, formatNumber };


