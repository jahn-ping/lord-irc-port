# LORD - Legend of the Red Dragon IRC Bot

A Node.js IRC bot implementation of the classic BBS door game "Legend of the Red Dragon".

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure the bot in `config.js`:
```javascript
export const config = {
  irc: {
    server: 'irc.prison.net',  // Your IRC server
    port: 6667,
    nick: 'LORD_1',           // Bot's nickname
  },
};
```

3. Run the bot:
```bash
npm start
```

## Playing

1. Connect to the IRC server
2. `/msg LORD_1 lord` - Start the game
3. Type `n` to create a new character
4. Enter your warrior name
5. Choose your class: K (Death Knight), D (Mage), L (Thief)
6. Choose your gender: M (Male), F (Female)

## Commands

Once in the game, use these commands:

### Town Square (Main Menu)
- `f` - Enter the Forest
- `k` - King Arthurs Weapons (buy weapons)
- `a` - Abduls Armour (buy armor)
- `h` - Healers Hut
- `v` - View your stats
- `i` - The Inn (stay the night)
- `t` - Turgons Warrior Training
- `y` - Ye Olde Bank
- `l` - List Warriors
- `d` - Daily News
- `p` - People Online
- `?` - Help
- `q` - Quit

### Forest
- `l` - Look for something to kill (fight)
- `h` - Go to Healers Hut
- `r` - Return to town
- `q` - Quit

### Combat
- `a` or Enter - Attack
- `r` - Run (25% fail chance)

### Weapons Shop
- Enter number (1-15) - Buy weapon
- `s` then number - Sell weapon
- `r` - Return to town

### Armor Shop
- Enter number (1-15) - Buy armor
- `s` then number - Sell armor
- `r` - Return to town

### Bank
- `d` - Deposit gold
- `w` - Withdraw gold
- `r` - Return to town

## Features

- Player creation with 3 classes: Death Knight, Mage, Thief
- Forest fighting with 100+ monsters
- Equipment system (15 weapons, 15 armor pieces)
- Banking system
- Leveling system (1-12)
- Daily fights refilled each session

## Game Data

Player data is stored in `./players/` directory as JSON files.
