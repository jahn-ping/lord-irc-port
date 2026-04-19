export const config = {
  irc: {
    server: 'irc.mzima.net',
    port: 6667,
    secure: false,
    nick: 'LORD_1',
    username: 'LORD_1',
    realname: 'Legend of the Red Dragon Bot',
    password: '', // Optional: Add your NickServ password here
    autoConnect: true,
    autoRejoin: true,
    retryCount: 5,
    retryDelay: 2000
  },
  channels: [], // Channels to join (leave empty for query-only mode)
  channelsWithoutAuth: [], // Channels where bot operates without user authentication
  prefix: '!', // Command prefix (use !fight, !stats, etc.)
  adminNick: '', // Optional: Admin nick for maintenance commands
  playersDir: './players/', // Directory for player data files
  dataFile: './lord_data.json', // General game data
  maxFightsPerDay: 500,
  maxPlayerFightsPerDay: 3,
  maxLevel: 12,
  maxHP: 9999999,
  maxGold: 9999999,
  maxXP: 2147483647
};
