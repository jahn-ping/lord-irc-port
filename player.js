import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { defaultPlayer } from './gameData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const playersDir = path.join(__dirname, config.playersDir);

function ensurePlayersDir() {
  if (!fs.existsSync(playersDir)) {
    fs.mkdirSync(playersDir, { recursive: true });
  }
}

function getPlayerPath(nick) {
  return path.join(playersDir, `${nick.toLowerCase()}.json`);
}

export function playerExists(nick) {
  return fs.existsSync(getPlayerPath(nick));
}

export function loadPlayer(nick) {
  const filepath = getPlayerPath(nick);
  console.log('loadPlayer: nick=' + nick + ', filepath=' + filepath);
  console.log('loadPlayer: exists=' + fs.existsSync(filepath));
  if (!fs.existsSync(filepath)) {
    return null;
  }
  try {
    const data = fs.readFileSync(filepath, 'utf-8');
    console.log('loadPlayer: data length=' + data.length);
    return JSON.parse(data);
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
