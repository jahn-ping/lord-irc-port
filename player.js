import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { defaultPlayer, weapons, armors } from './gameData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const playersDir = path.join(__dirname, config.playersDir);

function ensurePlayersDir() {
  if (!fs.existsSync(playersDir)) {
    fs.mkdirSync(playersDir, { recursive: true });
  }
}

function getPlayerPath(nick) {
  const safeNick = nick.replace(/[<>:"/\\|?*]/g, '_');
  return path.join(playersDir, `${safeNick.toLowerCase()}.json`);
}

export function playerExists(nick) {
  return fs.existsSync(getPlayerPath(nick));
}

export function findPlayerByIrcNick(ircNick) {
  const lowerNick = ircNick.toLowerCase();
  console.log('[findPlayerByIrcNick] searching for: ' + lowerNick);
  
  if (playerExists(lowerNick)) {
    console.log('[findPlayerByIrcNick] found by filename');
    return { player: loadPlayer(lowerNick), nick: lowerNick };
  }
  
  const allPlayers = getAllPlayers();
  console.log('[findPlayerByIrcNick] checking ' + allPlayers.length + ' players');
  const found = allPlayers.find(p => 
    (p.irc_nick && p.irc_nick.toLowerCase() === lowerNick) ||
    (p.name && p.name.toLowerCase() === lowerNick)
  );
  
  if (found) {
    console.log('[findPlayerByIrcNick] found by irc_nick/name: ' + found.name);
    return { player: loadPlayer(found.nick), nick: found.nick };
  }
  
  console.log('[findPlayerByIrcNick] not found');
  return null;
}

export function findPlayerByName(name) {
  const allPlayers = getAllPlayers();
  return allPlayers.find(p => p.name && p.name.toLowerCase() === name.toLowerCase());
}

export function loadPlayer(nick) {
  const filepath = getPlayerPath(nick);
  if (!fs.existsSync(filepath)) {
    return null;
  }
  try {
    const data = fs.readFileSync(filepath, 'utf-8');
    const player = JSON.parse(data);
    
    let fixed = false;
    
    if (player.weapon_num > 1) {
      const weapon = weapons[player.weapon_num - 1];
      if (weapon && player.str < weapon.strReq) {
        console.log('[VALIDATION] ' + player.name + ' has weapon ' + weapon.name + ' but only ' + player.str + ' str (needs ' + weapon.strReq + '). Downgrading to fists.');
        player.weapon_num = 1;
        fixed = true;
      }
    }
    
    if (player.armor_num > 1) {
      const armor = armors[player.armor_num - 1];
      if (armor && player.str < armor.strReq) {
        console.log('[VALIDATION] ' + player.name + ' has armor ' + armor.name + ' but only ' + player.str + ' str (needs ' + armor.strReq + '). Downgrading to Coat.');
        player.armor_num = 1;
        fixed = true;
      }
    }
    
    if (fixed) {
      savePlayer(nick, player);
    }
    
    return player;
  } catch (err) {
    console.error(`Error loading player ${nick}:`, err);
    return null;
  }
}

export function savePlayer(nick, player) {
  ensurePlayersDir();
  const filepath = getPlayerPath(nick);
  try {
    fs.writeFileSync(filepath, JSON.stringify(player, null, 2));
    return true;
  } catch (err) {
    console.error(`Error saving player ${nick}:`, err);
    return false;
  }
}

export function createPlayer(nick, name, playerClass, sex) {
  const player = { ...defaultPlayer };
  player.name = name;
  player.class = playerClass;
  player.sex = sex;
  return savePlayer(nick, player) ? player : null;
}

export function deletePlayer(nick) {
  const filepath = getPlayerPath(nick);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    return true;
  }
  return false;
}

export function getAllPlayers() {
  ensurePlayersDir();
  const files = fs.readdirSync(playersDir);
  const players = [];
  for (const file of files) {
    if (file.endsWith('.json')) {
      const nick = file.replace('.json', '');
      const player = loadPlayer(nick);
      if (player) {
        players.push({ nick, ...player });
      }
    }
  }
  return players;
}

export function getOnlineCount() {
  return getAllPlayers().filter(p => p.dead === 0).length;
}

export function getTopPlayers(limit = 10) {
  const players = getAllPlayers();
  return players
    .sort((a, b) => b.level - a.level || b.xp - a.xp)
    .slice(0, limit);
}

const onlinePlayers = new Set();

export function setPlayerOnline(nick) {
  onlinePlayers.add(nick.toLowerCase());
}

export function setPlayerOffline(nick) {
  onlinePlayers.delete(nick.toLowerCase());
}

export function isPlayerOnline(nick) {
  return onlinePlayers.has(nick.toLowerCase());
}

export function queueOfflineMessage(nick, message) {
  const player = loadPlayer(nick);
  if (!player) return false;
  
  if (!player.offline_messages) {
    player.offline_messages = [];
  }
  player.offline_messages.push({
    message,
    timestamp: Date.now()
  });
  console.log('[QUEUE] Queued message for ' + nick + ', total: ' + player.offline_messages.length);
  return savePlayer(nick, player);
}

export function getOfflineMessages(nick) {
  const player = loadPlayer(nick);
  if (!player) return [];
  return player.offline_messages || [];
}

export function clearOfflineMessages(nick) {
  const player = loadPlayer(nick);
  if (!player) return false;
  player.offline_messages = [];
  console.log('[CLEAR] Cleared offline_messages for ' + nick);
  return savePlayer(nick, player);
}
