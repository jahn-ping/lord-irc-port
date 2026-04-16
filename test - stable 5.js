"use strict";
/**
 * @file LORD (for Last Call BBS)
 * @version 0.68
 *
 * Changes:
 *
 * v0.1 (2022-07-23):
 * - First implementation
 * - healers
 * - forest fights
 * - full monster list supported
 * - bank withdrawals and deposits
 * - people online list
 * - saving/loading persistent stat data
 * - viewing stats
 * - carrying gold/gems/fairys
 * - fight use after each forest encounter
 * - no more fights after running out of fights
 * - Death knight ability.
 * - Initial release on Reddit
 *
 * v0.2 (2022-07-23):
 * - Purchasing and selling armor and weapons.
 * - Power move attacks.
 * - Enabled use strict, cleaned up code.
 *
 * v0.3 (2022-07-24):
 * - You can now converse with the patrons at the Inn.
 * - Armor now mitigates damage. Weapon + strength deliver damage. I eyeballed the math on this one.
 * - Initial support for training - work in progress
 *
 * v0.41 (2022-07-27):
 * - WIP Adding support for finding faeries in the forest.
 * - Fixed formatting of the stats screen.
 * - Training implemented.
 *
 * v0.42 (2022-07-28):
 * - Jennie cheat codes added.
 * - WIP Horse
 * - WIP Death Crystal
 * - WIP Dragon battles
 * - WIP High / low spirits
 * - WIP Violet
 * - WIP Mail system for receiving and sending mail.
 * - You can now converse with the patrons at the Dark Cloak Tavern.
 * - Changing profession via the bartender Chance at the Dark Cloak Tavern.
 * - Bribing Chance with 2 gems for information on another target player implemented.
 * - Sleeping at the inn.
 *
 * v0.43 (2022-08-01):
 * - Fairies found in the forest now grant all types of blessings and can be caught.
 * - Using a fairy at the bank with the 2 key releasing the fairy and steals gold based on level if a Thief.
 * - Switched to functors for draw_menu.
 *
 * v0.45 (2022-08-01):
 * - Cleaned up some menu displays.
 *
 * v0.46 (2022-08-01):
 * - Added old man event for receiving and losing charm.
 * - Added dark cloak tavern etchings listing for lays.
 * - Seth sings now
 * - Quite a few more events in the forest added
 * - Added stats for multi-trade skills and listing if horse has been acquired.
 * - WIP Added menu for talking to the bartender.
 * - Rooms can be acquired now at the inn if you have the gold.
 * - You can now fully flirt with Violet and earn rewards.
 * - The test to receive a skill for the guessing number game forest event implemented.
 * - WIP Gamble with the locals at dark cloak tavern implemention underway.
 * - WIP Beginning to add the gem potion via bartender.
 * - You can give the hag a gem for an extra max hp point.
 *
 * v0.49 (2022-08-02):
 * - Fixed bug in forest event for sack of gold, missing let.
 * - Fixed a number of attack calculation issues.
 * - Fixed heal menu.
 * - WIP Adding working save princess event. Needs more pages implemented still.
 * - Added multi-pager.
 *
 * v0.50 (2022-08-02):
 * - Complete rewrite of the player data storage.
 * - Dying actually dies.
 *
 * v0.51 (2022-08-04):
 * - Slight adjustments to support Classic BBS
 *
 * v0.54 (2022-08-06):
 * - API for save / load changed to allow default values.
 * - Deepcopy of default players if missing.
 *
 * v0.55 (2022-08-12):
 * - Conjugality list can now list marriages.
 * - Fixed amount of gold and gems found in the forest events.
 * - Added earning 3X gems per level for a successful tower rescue.
 * - Fixed earning a horse from the fairies.
 * - Corrected the value of the fights given when receiving the horse.
 * - The horse can now be ridden to the dark cloak tavern.
 *
 * v0.56 (2022-08-13):
 * - Fixed backspace in inn convo, dark cloak tavern convo, etc.
 * - Added choosing your name handle when the game starts.
 * - Added missing fair catching text.
 * - Added the full menu for talking to the bartender in the inn.
 *
 * v0.57 (2022-08-13):
 * - Corrected the stats not loading when creating a new character.
 * - Redesigned the login and creation process to more closely fit the original.
 * - You can now select your gender and class.
 *
 * v0.58 (2022-08-13):
 * - Bartender won't talk to you if you're level 1.
 * - A bit more of an adjustment to the character creation steps to fit the original.
 *
 * v0.59 (2022-08-13):
 * - Added color codes, I just used various shades to represent them. It is what it is.
 * - The color codes work in the inn conversations etc. You can even put them in your name handle.
 *
 * v0.60 (2022-08-14):
 * - Fixes for color codes bleeding over if used in as a handle name.
 *
 * v0.61 (2022-08-14):
 * - Extended length of name input to compensate for color codes.
 *
 * v0.62 (2022-08-14):
 * - Corrected printout width for warrior online list etc.
 *
 * v0.63 (2022-08-14):
 * - Implemented the IGM (In-Game-Module) for Barak's House in the (O)ther Places menu.
 *
 * v0.64 (2022-08-14):
 * - Added the undocumented B key in the forest.
 * - Fixed missing color codes `@ and `$ by using `& and `S instead.
 * - Added blinking text support; e.g. B key in forest, or 'On' in Warrior List
 * - WIP Added color to the stat line and some other screens.
 * - If you can barely notice the color, that's how it is until they give us more color in NETronics.
 * - WIP Added menu line to the various screens.
 * - WIP Adding the handle name to the your command line.
 *
 * v0.65 (2022-08-15):
 * - Added multi-page IGM menu that can handle adding more IGMs dynamically.
 * - Fixed banner offset issue due to color code symbol.
 *
 * v0.66 (2022-08-24):
 * - List weapon as Fists if sold at weapon shop on stat screen.
 * - Class professions are now tracked properly.
 * - Implemented Mystical Skills; pinch, disappear, heat wave, light shield, shatter, mind heal
 * - Old hag now correctly increases both hp and maxhp by 1 for a gem.
 * - WIP Adding gambling casino option to the main menu. Added dwarven blackjack. Not quite done yet.
 * - Full game instructions now included.
 * - Experienced limited to original maximum.
 * - Added missing ascii art for the save girl event. And, corrected input range for choices.
 * - XP and gems are now rewarded for saving the girl.
 * - Main menu now has a different version for females.
 * - Seth's menu now has a different version for females.
 * - Fixed the flashing text code.
 * - Login now displays more information and also includes that you rode in on a horse.
 * - Pinch is now limited from being used in levels equal to or lower for players.
 *
 * v0.67 (2024-04-26):
 * - Fixed exit -> menu_exit
 *
 * v0.68 (2025-05-23):
 * - Fixed empty player name crashing door and fixed People online showing twice in menu
 */
let VER = '0.68';

// todo: slaughter MAIL: `0${0} `2did a power move for `4{1} `2damage!
// todo: money in the bank earns 10% interest a day
// todo: occassionally npcs should add new convos to the inn e.g. Barak: SYSOP. Interesting name...

/* AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUu
   VvWwXxYyZz.,:;!?&#/\\%\'"0123456789+-*()[]^`
   █▟▙▜▛▀▄▐▌▝▘▗▖─═║╔╗╚╝╠╣╦╩╬><▲▼☺☻⚉ ™ ♦ ♣ ♠ ♥
*/

const reset_everything = 0;				// enable to reset the save data

const MAX_GUESSES = 6;					// maximum number of guessing in the guessing game
const MAX_BANK_TRANSFER = 100000;		// maximum bank transfer amount
const DELETION_GRACE_PERIOD_DAYS = 30;	// deletion of old accounts after X days
const FOREST_FIGHTS_PER_DAY = 500;		// number of fights per day
const CLEAN_MODE = 0;					// allow disabling getting laid
const ALLOW_TRANSFER_FUNDS = 1;			// allowing transferring of bank funds
const MAX_TRANSFER_PER_DAY = 3;			// maximum bank transfers per day
const DEEDS_TO_WIN = 10;				// amount of deeds to win the game
const HUMAN_FIGHTS_PER_DAY = 3;			// number of player to player fights a day
const OTHER_MENU_SIZE = 26;				// The size of each page of IGMs in # of items.
const MAX_VALUE = 9999999;				// default max value for most items, e.g. gems, hp, gold, etc
const MAX_XP = 2147483647;              // max experience

const CARD_HIDE			= 2;			// card should hide its details
const CARD_SHOW			= 1;			// card should show its details
const SUIT_HEART		= 0;			// the heart suit
const SUIT_SPADE		= 1;			// the spade suit
const SUIT_CLUB			= 2;			// the club suit
const SUIT_DIAMOND		= 3;			// the diamond suit
const CARD_INDEX_LIMIT	= 10;			// max # of cards dealt, can only fit 5 sets of 2 across
const WINNER_NONE		= 0;			// no winners
const WINNER_DEALER		= 1;			// dealer wins
const WINNER_DRAW		= 2;			// push
const WINNER_PLAYER		= 3;			// player wins

const BLACKJACK_LEFT_MESSAGE_QUIT=0;			 // Player quit blackjack
const BLACKJACK_LEFT_MESSAGE_SPLIT_WINLOSE=1;	 // Split won or lost in blackjack
const BLACKJACK_LEFT_MESSAGE_WAGER=2;			 // Player places a bet in blackjack
const BLACKJACK_LEFT_MESSAGE_PUSH=3;			 // There was a push (draw) in blackjack
const BLACKJACK_LEFT_MESSAGE_PLAYER_BUSTED=4;	 // Player busted in blackjack
const BLACKJACK_LEFT_MESSAGE_HIT_OR_STAY=5;	 	 // Hit or stay in blackjack
const BLACKJACK_LEFT_MESSAGE_SPLIT=6;			 // Split in blackjack
const BLACKJACK_LEFT_MESSAGE_PLAYER_BLACKJACK=7; // Player got blackjack and wins
const BLACKJACK_LEFT_MESSAGE_DEALER_BUSTED=8;	 // Dealer busted in blackjack
const BLACKJACK_LEFT_MESSAGE_PLAYER_LOSES=9;	 // Player loses in blackjack
const BLACKJACK_LEFT_MESSAGE_PLAYER_WINS=10;	 // Player wins in blackjack
const BLACKJACK_LEFT_MESSAGE_PLAY_AGAIN=11;	 	 // Play again in blackjack?
const BLACKJACK_LEFT_MESSAGE_HIT_OR_STAY_SPLIT=12; // Hit or stay on a split hand in blackjack

const BLACKJACK_RIGHT_MESSAGE_YES_NO=0;		 	 // Yes or no in blackjack
const BLACKJACK_RIGHT_MESSAGE_HIT_OR_STAY=1;	 // Hit or stay in blackjack
const BLACKJACK_MIN_BET = 200;
const BLACKJACK_MAX_BET = 5000;

let weapons = [
'Stick',        200, 		5,		0,
'Dagger',		1000,		10,		0,
'Short Sword',	3000,		20,		15,
'Long Sword',	10000,		30,		22,
'Huge Axe',		30000,		40,		32,
'Bone Cruncher',100000,		60,		44,
'Twin Swords',	150000,		80,		64,
'Power Axe',	200000,		120,	99,
'Able\'s Sword',400000,		180,	149,
'Wan\'s Weapon',1000000,	250,	224,
'Spear of Gold',4000000,	350,	334,
'Crystal Shard',1000000,	500,	334,
'Nira\'s Teeth',40000000,	800,	334,
'Blood Sword',	100000000,	1200,	334,
'Death Sword',	400000000,	1800,	334
];

function get_weapon_attack()
{
	let w = get_player_value(player, 'weapon');
	let i = findData(weapons, w);
	if (i != -1) { return weapons[i+2]; }
	return 0;
}

let armors = [
'Coat',				200,		1,		0,
'Heavy Coat',		1000,		3,		0,
'Leather Vest',		3000,		10,		2,
'Bronze Armor',		10000,		15,		5,
'Iron Armor',		30000,		25,		10,
'Graphite Armor',	100000,		35,		20,
'Erdrick\'s Armor',	150000,		50,		35,
'Armor of Death',	200000,		75,		57,
'Able\'s Armor',	400000,		100,	92,
'Full Body Armor',	1000000,	150,	152,
'Blood Armor',		4000000,	225,	232,
'Magic Protection',	10000000,	300,	232,
'Belar\'s Armor',	40000000,	400,	232,
'Golden Armor',		100000000,	600,	232,
'Armor of Love',	400000000,	1000,	232
];

function get_armor_defense()
{
	let a = get_player_value(player, 'armor');
	let i = findData(armors, a);
	if (i != -1) { return armors[i+2]; }
	return 0;
}

let gains = [
// Level    HP     STR    DEF        XP NEED
     1,     20,    10,     1,           1,
     2,     10,     5,     2,         100,
     3,     15,     7,     3,         400,
     4,     20,    10,     5,        1000, 
     5,     30,    12,    10,        4000, 
     6,     50,    20,    15,       10000, 
     7,     75,    35,    22,       40000, 
     8,    125,    50,    35,      100000, 
     9,    185,    75,    60,      400000, 
    10,    250,   110,    80,     1000000,  
    11,    350,   150,   120,     4000000,  
    12,    550,   200,   150,    10000000
];

function get_xpneeded()
{
	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) { lvl = 1; }
	return gains[(lvl * 5) + 4];
}

let chosen_class = 0;
let chosen_gender = 0;
let showing_instructions = 0;
let instruction_page = 0;
let days_run = 0;
let weapon_cost = 0;
let weapon_choice = '';
let armor_price = 0;
let armor_cost = 0;
let armor_choice = '';
let status = '';
let event = 0;
let room_cost = 400;
let buffer = '';
let current = menu_main;
let last_menu = menu_main;
let training_needed = 0;
let switching_profession = 0;
let entering_target = 0;
let player_value_not_found = 1;
let players = [];

let default_players =
[
	{
		'name'       :'SYSOP',
		'str'        :10,
		'def'        : 1,
		'weapon'     :'Stick',
		'weapon_num' :1,
		'armor'      :'Coat',
		'armor_num'  :1,
		'kids'       :0,
		'horse'      :0,
		'gold'       :6000, // gold in hand
		'bank'       :0, // gold in bank
		'lays'       :0,
		'xp'         :1,
		'seen_master':0,
		'fights'     :500, // forest fights
		'pfights'    :3,   // human fights
		'seen_dragon':0,
		'class'      :0, //active class
		'classd'     :1, // for multi-mastering d
		'classm'     :0, // for multi-mastering m
		'classt'     :0, // for multi-mastering t
		'usesd'      :1,
		'usesm'      :0,
		'usest'      :0,
		'dead'       :0,
		'pkills'     :0,
		'marriedto'  :'',
		'highspirits':1,
		'lastseen'   :-1,
		'level'      :1,
		'hp'         :20,
		'maxhp'      :20,
		'sex'        :0,
		'gems'       :0,
		'charm'      :1,
		'seenviolet' :0,
		'won'        :0,
		'stayinn'    :0,
		'seenbard'   :0,
		'flirted'    :0,
		'fairies'    :0,
		'mastered'   :-1,
		'mastered2'  :-1,
		'mastered3'  :-1,
		'baraks_visited_today' :0
	},
	{
		'name'       :'Test1',
		'str'        :15,
		'def'        : 2,
		'weapon'     :'Short Sword',
		'weapon_num' :2,
		'armor'      :'Coat',
		'armor_num'  :1,
		'kids'       :0,
		'horse'      :0,
		'gold'       :100000,   // gold in hand
		'bank'       :100, // gold in bank
		'lays'       :2,
		'xp'         :1,
		'seen_master':0,
		'fights'     :500, // forest fights
		'pfights'    :3,   // human fights
		'seen_dragon':0,
		'class'      :0, // active class
		'classd'     :1, // for multi-mastering d
		'classm'     :0, // for multi-mastering m
		'classt'     :0, // for multi-mastering t
		'usesd'      :1,
		'usesm'      :0,
		'usest'      :0,
		'dead'       :0,
		'pkills'     :0,
		'marriedto'  :'',
		'highspirits':1,
		'lastseen'   :-1,
		'level'      :1,
		'hp'         :20,
		'maxhp'      :20,
		'sex'        :0,
		'gems'       :0,
		'charm'      :1,
		'seenviolet' :0,
		'won'        :0,
		'stayinn'    :0,
		'seenbard'   :0,
		'flirted'    :0,
		'fairies'    :0,
		'mastered'   :-1,
		'mastered2'  :-1,
		'mastered3'  :-1,
		'baraks_visited_today' :0
	}
];

let JENNIE = '';
let cheat = '';
let gender = 'm';
let marriage_length = 200;
let SPIRITS_LOW = 0;
let SPIRITS_HIGH = 1;
let HORSE_NONE = 0;
let HORSE_WHITE = 1;
let HORSE_BLACK = 2;
let dragon_hp = 15000;
let dragon_str = 2000;
let dragon_def = 0;
let dragon_weapon = '';
let dragon_visited = 0;
let dragon_weapons = ['Swishing Tail', 'Huge Claw', 'Stomping the Ground', 'Flaming Breath'];
let monster = '';
let monster_hp = 0;
let monster_str = 0;
let monster_gp = 0;
let monster_xp = 0;
let monster_death = '';
let monster_weapon = '';
let damage = 0;
let rmail_limit = 1; // romantic mail limit
let text_buffer = [];
let handled_bank=0;
let handle_wbuy=0;
let handle_wsell=0;
let handle_abuy=0;
let handle_asell=0;
let master_hp = 30;
let master_str = 10;
let master_weapon = 'None';
let master_greet = '';
let master_handled = 0;
let current_news = [];
let baraks_chests = [];
let barak_earned_gold = 0;
let barak_selected_book = -1;

let baraks_books = {
	'Dirty Deeds': ['todo: pages'],
	'The Art Of Thievery': ['"The Art Of Thievery" by Chance.',
		' Select your targets carefully. Don\'t steal from level',
		' 12 people - being beheaded isn\'t particularly fun.']
	//todo; find the rest of the books
};

let baraks_books_perks = {
	'Dirty Deeds': ['hp',1], // just guessing on the perk here
	'The Art Of Thievery': ['Thief',1]
};

// name, weapon, str, hp, gp, xp, death
function get_monster(index)
{
	index = index * 7;
	monster = monsters[index];
	monster_weapon = monsters[index+1];
	monster_str = monsters[index+2];
	monster_hp = monsters[index+3];
	monster_gp = monsters[index+4];
	monster_xp = monsters[index+5];
	monster_death = monsters[index+6];
}

function get_monster_index(name) { return findData(monsters, name); }

let monsters = [
//name,weapon,strength,hp,gold,experience,death message
'Small Thief','Small Dagger',6 , 9 , 56 ,2 ,'You disembowel the little thieving menace!',
'Rude Boy','Cudgel',3 , 7 , 7,3 ,'You quietly watch as the very Rude Boy bleeds to death.',
'Old Man','Cane',5 , 13, 73 ,4 ,'You finish him off, by tripping him with his own cane.',
'Large Green Rat','Sharp Teeth',3 , 4 , 32 ,1 ,'A well placed step ends this small rodents life.',
'Wild Boar','Sharp Tusks',10, 9 , 58 ,5 ,'You impale the boar between the eyes!',
'Ugly Old Hag','Garlic Breath',6 , 9 , 109,4 ,'You emotionally crush the hag, by calling her ugly!',
'Large Mosquito','Blood Sucker',2 , 3 , 46 ,2 ,'With a sharp slap, you end the Mosquitos life.',
'Bran The Warrior','Short Sword',12, 15, 234,10,'After a hardy duel, Bran lies at your feet, dead.',
'Evil Wretch','Finger Nail',7 , 12, 76 ,3 ,'With a swift boot to her head, you kill her.',
'Small Bear','Claws',9 , 7 , 154,6 ,'After a swift battle, you stand holding the Bears heart!',
'Small Troll','Uglyness',6 , 14, 87 ,5 ,'This battle reminds you how of how much you hate trolls.',
'Green Python','Dripping Fangs',13, 17, 80 ,6 ,'You tie the mighty snake\'s carcass to a tree.',
'Gath The Barbarian','Huge Spiked Club',12, 13, 134,9 ,'You knock Gath down, ignoring his constant groaning.',
'Evil Wood Nymph','Flirtatios Behavior',15, 10, 160,11,'You shudder to think of what would have happened, had you given in.',
'Fedrick The Limping Baboon','Scary Faces',8 , 23, 97 ,6 ,'Fredrick will never grunt in anyones face again.',
'Wild Man','Hands',13, 14, 134,8 ,'Pitting your wisdom against his brawn has one this battle.',
'Brorandia The Viking','Hugely Spiked Mace',21, 18, 330,20,'You consider this a message to her people, "STAY AWAY!".',
'Huge Bald Man','Glare From Forehead',19, 19, 311,16,'It wasn\'t even a close battle, you slaughtered him.',
'Senile Senior Citizen','Crazy Ravings',13, 11, 270,13,'You may have just knocked some sense into this old man.',
'Membrain Man','Strange Ooze',10, 16, 190,11,'The monstrosity has been slain.',
'Bent River Dryad','Pouring Waterfall',12, 16, 150,9 ,'You cannot resist thinking the Dryad is "All wet".',
'Rock Man','Large Stones',8 , 27, 300,12,'You have shattered the Rock Mans head!',
'Lazy Bum','Unwashed Body Odor',19, 29, 380,18,'"This was a bum deal" You think to yourself.',
'Two Headed Rotwieler','Twin Barking',18, 32, 384,17,'You have silenced the mutt, once and for all.',
'Purple Monchichi','Continous Whining',14, 29, 763,23,'You cant help but realize you have just killed a real loser.',
'Bone','Terrible Smoke Smell',27, 11, 432,16,'Now that you have killed Bone, maybe he will get a life..',
'Red Neck','Awfull Country Slang',19, 16, 563,19,'The dismembered body causes a churning in your stomach.',
'Winged Demon Of Death','Red Glare',42, 23, 830,28,'You cut off the Demons head, to be sure of its death.',
'Black Owl','Hooked Beak',28, 29, 711,26,'A well placed blow knocks the winged creature to the ground.',
'Muscled Midget','Low Punch',26, 19, 870,32,'You laugh as the small man falls to the ground.',
'Headbanger Of The West','Ear Shattering Noises',23, 27, 245,43,'You slay the rowdy noise maker and destroy his evil machines.',
'Morbid Walker','Endless Walking',28, 10, 764,9 ,'Even lying dead on its back, it is still walking.',
'Magical Evil Gnome','Spell Of Fire',24, 25, 638,28,'The Gnome\'s small body is covered in a deep red blood.',
'Death Dog','Teeth',36, 52, 1150, 36,'You rejoice as the dog wimpers for the very last time.',
'Weak Orc','Spiked Club',27, 32, 900,25,'A solid blow removes the Orcs head!',
'Dark Elf','Small bow',43, 57, 1070, 33,'The Elf falls at your feet, dead.',
'Evil Hobbit','Smoking Pipe',35, 95, 1240, 46,'The Hobbit will never bother anyone again!',
'Short Goblin','Short Sword',34, 45, 768,24,'A quick lunge renders him dead!',
'Huge Black Bear','Razor Claws',67, 48, 1765, 76,'You bearly beat the Huge Bear...',
'Rabid Wolf','Deathlock Fangs',45, 39, 1400, 43,'You pull the dogs lifeless body off you.',
'Young Wizard','Weak Magic',64, 35, 1754, 64,'This Wizard will never cast another spell!',
'Mud Man','Mud Balls',56, 65, 870,43,'You chop up the Mud Man into sushi!',
'Death Jester','Horrible Jokes',34, 46, 1343, 32,'You feel no pity for the Jester, his jokes being as bad as they were.',
'Rock Man','Large Stones',87, 54, 1754, 76,'You have shattered the Rock Mans head!',
'Pandion Knight','Orkos Broadsword',64, 59, 3100, 98,'You are elated in the knowledge that you both fought honorably.',
'Jabba','Whiplashing Tail',61, 198,2384, 137,'The fat thing falls down, never to squirm again.',
'Manoken Sloth','Dripping Paws',54, 69, 2452, 97,'You have cut him down, spraying a neaby tree with blood.',
'Trojan Warrior','Twin Swords',73, 87, 3432, 154,'You watch, as the ants claim his body.',
'Misfit The Ugly','Strange Ideas',75, 89, 2563, 120,'You cut him cleanly down the middle, in a masterfull stroke.',
'George Of The Jungle','Echoing Screams',56, 43, 2230, 128,'You thought the story of George was a myth, until now.',
'Silent Death','Pale Smoke',113,98, 4711, 230,'Instead of spilling blood, the creature seems filled with only air.',
'Bald Medusa','Glare Of Stone',78, 120,4000, 256,'You are lucky you didnt look at her... Man was she ugly!',
'Black Alligator','Extra Sharp Teeth',65, 65, 3245, 123,'With a single stroke, you sever the creatures head right off.',
'Clancy, Son Of Emporor Len','Spiked Bull Whip',52, 324,4764, 324,'Its a pity so many new warriors get so proud.',
'Black Sorcerer','Spell Of Lightning',86, 25, 2838, 154,'Thats the last spell this Sorcerer will ever cast!',
'Iron Warrior','3 Iron',100,253,6542, 364,'You have bent the Iron warriors Iron!',
'Black Soul','Black Candle',112,432,5865, 432,'You have released the black soul.',
'Gold Man','Rock Arm',86, 354,8964, 493,'You kick the body of the Gold man to reveal some change..',
'Screaming Zombie','Gaping Mouth Full Of Teeth',98,286,5322, 354,'The battle has rendered the zombie even more unatractive then he was.',
'Satans Helper','Pack Of Lies',112,165,7543, 453,'Apparently you have seen through the Devils evil tricks',
'Wild Stallion','Hoofs',78, 245,4643, 532,'You only wish you could have spared the animals life.',
'Belar','Fists Of Rage',120,352,9432, 565,'Not even Belar can stop you!',
'Empty Armour','Cutting Wind',67, 390,6431, 432,'The whole battle leaves you with a strange chill.',
'Raging Lion','Teeth And Claws',98, 274,3643, 365,'You rip the jaw bone off the magnificient animal!',
'Huge Stone Warrior','Rock Fist',112,232,4942, 543,'There is nothing left of the stone warrior, except a few pebbles.',
'Magical Evil Gnome','Spell Of Fire',89, 234,6384, 321,'The Gnomes small body is covered in a deep red blood.',
'Emporer Len','Lightning Bull Whip',210,432,12043,764,'His last words were.. "I have failed to avenge my son."',
'Night Hawk','Blood Red Talons',220,675,10433,686,'Your last swing pulls the bird out of the air, landing him at your feet',
'Charging Rhinoceros','Rather Large Horn',187,454,9853, 654,'You finally fell the huge beast, not without a few scratches.',
'Goblin Pygmy','Death Squeeze',165,576,13252,754,'You laugh at the little Goblin\'s puny attack.',
'Goliath','Six Fingered Fist',243,343,14322,898,'Now you know how David felt...',
'Angry Liontaur','Arms And Teeth',187,495,13259,753,'You have laid this mythical beast to rest.',
'Fallen Angel','Throwing Halos',154,654,12339,483,'You slay the Angel, then watch as it gets sucked down into the ground.',
'Wicked Wombat','The Dark Wombats Curse',198, 464,13283,786,'It\'s hard to believe a little wombat like that could be so much trouble',
'Massive Dinosaur','Gaping Jaws',200,986,16753,1204,'The earth shakes as the huge beast falls to the ground.',
'Swiss Butcher','Meat Cleaver',230,453,8363, 532,'You\'re glad you won...You really didn\'t want the haircut..',
'Death Gnome','Touch Of Death',270,232,10000,654,'You watch as the animals pick away at his flesh.',
'Screeching Witch','Spell Of Ice',300,674,19753,2283,'You have silenced the witch\'s infernal screeching.',
'Rundorig','Poison Claws',330,675,17853,2748,'Rundorig, once your friend, now lays dead before you.',
'Wheeler','Annoying Laugh',250,786,23433,1980,'You rip the wheeler\'s wheels clean off!',
'Death Knight','Huge Silver Sword',287,674,21923,4282,'The Death knight finally falls, not only wounded, but dead.',
'Werewolf','Fangs',230,543,19474,3853,'You have slaughtered the Werewolf. You didn\'t even need a silver bullet',
'Fire Ork','FireBall',267,674,24933,3942,'You have put out this Fire Orks flame!',
'Wans Beast','Crushing Embrace',193,1243, 17141,2432,'The hairy thing has finally stopped moving.',
'Lord Mathese','Fencing Sword',245,875,24935,2422,'You have wiped the sneer off his face once and for all.',
'King Vidion','Long Sword Of Death',400,1243, 28575,6764,'You feel lucky to have lived, things could have gone sour..',
'Baby Dragon','Dragon Smoke',176,2322, 25863,3675,'This Baby Dragon will never grow up.',
'Death Gnome','Touch Of Death',356,870,31638,2300,'You watch as the animals pick away at his flesh.',
'Pink Elephant','Stomping',434,1232, 33844,7843,'You have witnessed the Pink Elephant...And you aren\'t even drunk!',
'Gwendolens Nightmare','Dreams',490,764,35846,8232,'This is the first Nightmare you have put to sleep.',
'Flying Cobra','Poison Fangs',400,1123, 37694,8433,'The creature falls to the ground with a sickening thud.',
'Rentakis Pet','Gaping Maw',556,987,37584,9854,'You vow to find Rentaki and tell him what you think about his new pet.',
'Ernest Brown','Knee',432,2488, 34833,9754,'Ernest has finally learned his lesson it seems.',
'Scallian Rap','Way Of Hurting People',601,788,22430,6784,'Scallians dead...Looks like you took out the trash...',
'Apeman','Hairy Hands',498,1283, 38955,7202,'The battle is over...Nothing is left but blood and hair.',
'Hemo-Glob','Weak Insults',212,1232, 27853,4432,'The battle is over.. And you really didn\'t find him particularly scary.',
'FrankenMoose','Butting Head',455,1221, 31221,5433,'That Moose was a perversion of nature!',
'Earth Shaker','Earthquake',767,985,37565,7432,'The battle is over...And it looks like you shook him up...',
'Gollums Wrath','Ring Of Invisibility',621,2344, 42533,13544,'Gollums ring apparently wasn\'t powerfull enough.',
'Toraks Son, Korak','Sword Of Lightning',921,1384, 46575,13877,'You have slain the son of a God!You ARE great!',
'Brand The Wanderer','Fighting Quarter Staff',643, 2788, 38755,13744,'Brand will wander no more.',
'The Grimest Reaper','White Sickle',878,1674, 39844,14237,'You have killed that which was already dead.Odd.',
'Death Dealer','Stare Of Paralization',765,1764, 47333,13877,'The Death Dealer has been has been delt his last hand.',
'Tiger Of The Deep Jungle','Eye Of The Tiger',587,3101, 43933,9766,'The Tiger\'s cubs weep over their dead mother.',
'Sweet Looking Little Girl','Demon Strike',989,1232, 52322,14534,'If it wasn\'t for her manners, you might have got along with her.',
'Floating Evil Eye','Evil Stare',776,2232, 43233,13455,'You really didn\'t like the look of that Eye...',
'Slock','Swamp Slime',744,1675, 56444,14333,'Walking away from the battle, you nearly slip on the thing\'s slime.',
'Adult Gold Dragon','Dragon Fire',565,3222, 56444,15364,'He was strong, but you were stronger.',
'Kill Joy','Terrible Stench',988,3222, 168844, 25766,'Kill Joy has fallen, and can\'t get up.',
'Black Sorcerer','Spell Of Lightning',86, 25, 2838, 187,'Thats the last spell this Sorcerer will ever cast!',
'Gorma The Leper','Contagous Desease',1132, 2766, 168774, 26333,'It looks like the lepers fighting stratagy has fallen apart..',
'Shogun Warrior','Japanese Nortaki',1143, 3878, 165433, 26555,'He was tough, but not nearly tough enough.',
'Apparently Weak Old Woman','*GODS HAMMER*',1543, 1878, 173522, 37762,'You pull back the old womans hood, to reveal an eyeless skull.',
'Ables Creature','Bear Hug',985,2455, 176775, 28222,'That was a mighty creature.Created by a mighty man.',
'White Bear Of Lore','Snow Of Death',1344, 1875, 65544,16775,'The White Bear Of Lore DOES exist you\'ve found.Too bad it\'s now dead.',
'Mountain','Landslide',1544, 1284, 186454, 38774,'You have knocked the mountain to the ground.Now it IS the ground.',
'Sheena The Shapechanger','Deadly Illusions',1463, 1898, 165755, 26655,'Sheena is now a quivering mass of flesh.Her last shapechange.',
'ShadowStormWarrior','Mystical Storm',1655, 2767, 162445, 26181,'The storm is over, and the sunshine greets you as the victor.',
'Madman','Chant Of Insanity',1265, 1764, 149564, 25665,'Madman must have been mad to think he could beat you!',
'Vegetable Creature','Pickled Cabbage',111,172,4838, 2187 ,'For once you finished off your greens...',
'Cyclops Warrior','Fire Eye',1744, 2899, 204000, 49299,'The dead Cyclop\'s one eye stares at you blankly.',
'Corinthian Giant','De-rooted Tree',2400, 2544, 336643, 60333,'You hope the giant has brothers, more sport for you.',
'The Screaming Eunich','High Pitched Voice',1488, 2877, 197888, 78884,'If it wasn\'t for his ugly features, you thought he looked female.',
'Black Warlock','Satanic Choruses',1366, 2767, 168483, 58989,'You have slain Satan\'s only son.',
'Kal Torak','Cthrek Goru',876,6666, 447774, 94663,'You have slain a God!You are the ultimate warrior!',
'The Mighty Shadow','Shadow Axe',1633, 2332, 176333, 51655,'The mighty Shadow is now only a Shadow of his former self.',
'Black Unicorn','Shredding Horn',1899, 1587, 336693, 41738,'You have felled the Unicorn, not the first, not the last.',
'Mutated Black Widow','Venom Bite',2575, 1276, 434370, 98993,'A well placed stomp ends this Spider\'s life.',
'Humongous Black Wyre','Death Talons',1166, 3453, 653834, 76000,'The Wyre\'s dead carcass covers the whole field!',
'The Wizard Of Darkness','Chant Of Insanity',1497, 1383, 224964, 39878,'This Wizard of Darkness will never bother you again',
'Great Ogre Of The North','Spiked Steel Mace',1800, 2878, 524838, 112833,'No one is going to call him The "Great" Ogre Of The North again.'
];

//function clearStatus(s) { status=''; drawText('                                             ', 16, 0, 19); }
function clearStatus(s) { status=''; '                                             '; }

function getName() { return 'L.O.R.D.'; }

function fill_master_data()
{
	let lv = get_player_value(player, 'level');
	if (player_value_not_found == 1) { lv = 1; }
	
	let lvl = lv - 1;
	
	master = masters[lvl];
	master_hp = masters_health[lvl];
	master_str = masters_str[lvl];
	master_weapon = master_weapons[lvl];
	master_greet = master_greets[lvl];
	master_handled = 0;
}

let masters        = ['Halder',     'Barak',     'Aragorn',     'Olodrin',  'Sandtiger',     'Sparhawk',           'Atsuko Sensei',     'Aladdin',    'Prince Caspian',  'Gandalf',        'Turgon'];
let masters_health = [30, 50, 100, 120, 140, 160, 180, 190, 200, 210, 220]; // fix these, i scribbled random values
let masters_str    = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]; // fix these, i scribbled random values
let master_weapons = ['Short Sword','Battle Axe','Twin Swords', 'Power Axe','Blessed Sword', 'Double Bladed Sword','Huge Curved Blade', 'Shiny Lamp', 'Flashing Rapier', 'Huge Fireballs', 'Ables Sword'];

let master_greets  = [
//halder
'Hi there. Although I may not look muscular, I ain\'t all that weak. You cannot advance to another Master until you can best me in battle.  I don\'t really have any advice except wear a groin cup at all times. I learned the hard way.',
//barak
'You are now level two, and a respected warrior. Try talking to the Bartender, he will see you now.  He is a worthy asset... Remember, your ultimate goal is to reach Ultimate Warrior status, which is level twelve.',
//aragorn
'You are now level three, and you are actually becoming well known in the realm. I heard your name being mentioned by Violet.... Ye Gods she\'s hot....',
//olodrin
'You are now level four. But don\'t get cocky - There are many in the realm that could kick your... Nevermind, I\'m just not good at being insperational.',
//sandtiger
'You are now level five..Not bad...Not bad at all.. I am called Sandtiger - Because.. Actually I can\'t remember why people call me that. Oh - Don\'t pay attention to that stupid bartender - I could make a much better one.',
//sparhawk
'You are level six! Vengeance is yours! You can now beat up on all those young punks that made fun of you when you were level 1. This patch? Oh - I lost my eye when I fell on my sword after tripping over a gopher. If you tell anyone this, I\'ll hunt you down.',
//atsuko sensei
'Even in my country, you would be considered a good warrior. But you have much to learn. Remember to always respect your teachers, for it is right.',
//aladdin
'You are now level eight. Remember, do not use your great strength in bullying the other warriors. Do not be a braggart. Be humble, and remember, honor is everything.',
//prince caspian
'You are now level nine. You have traveled far on the road of hardships, but what doesn\'t kill you, only makes you stronger. Never stop fighting.',
//gandalf
'You are now level ten.. A true honor! Do not stop now... You may be the one to rid the realm of the Red Dragon yet... Only two more levels to go until you are the greatest warrior in the land.',
//turgon
'I am Turgon, son. The greatest warrior in the realm. You are a great warrior, and if you best me, you must find and kill the Red Dragon. I have every faith in you.'
];

let master_estimate = [
//halder
'Gee, your muscles are getting bigger than mine...',
//barak
'You know, you are actually getting pretty good with that thing...',
//aragorn
'You have learned everything I can teach you.',
//olodrin
'You\'re becoming a very skilled warrior.',
//sandtiger
'Gee - You really know how to handle your shaft!',
//sparhawk
'You\'re getting the hang of it now!',
//atsuko sensei
'You are ready to be tested on the battle field!',
//aladdin
'You REALLY know how to use your weapon!!!',
//prince caspian
'Something tells me you are as good as I am now..',
//gandalf
'You\'re becoming a very skilled warrior.',
//turgon
'You are truly the BEST warrior in the realm.'
];

let master_beaten = [
//halder
'Belar!!!  You are truly a great warrior!',
//barak
'Children Of Mara!!!  You have bested me??!',
//aragorn
'Torak\'s Eye!!!  You are a great warrior!',
//olodrin
'Ye Gods!!  You are a master warrior!',
//sandtiger
'Very impressive...Very VERY impressive.',
//sparhawk
'This Battle is yours...You have fought with honor.',
//atsuko sensei
'Even though you beat me, I am proud of you.',
//aladdin
'I don\'t need a genie to see that you beat me, man!',
//prince caspian
'Good show, chap!  Jolly good show!',
//gandalf
'Torak\'s Tooth!  You are great!',
//turgon
'You are a master warrior! You pay your respects to Turgon, and stroll around the grounds. Lesser warriors bow low as you pass. Turgon\'s last words advise you to find and kill the Red Dragon..'
];

let win_messages = [
	// death knight win
	'After your bloody duel with the huge Dragon, your first inpulse is to rip it\'s head off and bring it town. Carefull thought reveals it is much to big for your horse, so that plan is moot. Your second notion is bring back the childrens bones. Bags and bags of them for proper barial, but you realize this would only cause the towns inhabitants MORE pain. You finally decide on the Dragons heart. After adding ten years to your swords life, you finally chip off enough scales to wallow in the huge beasts insides. When you are finished, and fit the still heart in a gunny sack you brought, (who would have thought this would be its use?) you make your way back to town. As you share your story to a crowd of excited onlookers, this crowd becomes a gathering, and this gathering becomes an assemblage, and this assemblage becomes a multitude! This multitude nearly becomes a mob, but thinking quick, you make a speech. "PEOPLE!" your voice booms. "It is true I have ridden this town of it\'s curse, the Red Dragon. And this is his heart." You dump the bloody object onto the ground. From the back, Barak\'s voice is heard. "How do we know where you got that thing? It looks like you skinned a sheep!" A flicker of annoyance crosses your face, but you force a smile. "Why Barak, would you doubt me? A LEVEL 12 warrior? If I am not mistaken, you are quite a bit lower, still at level two, eh?" Barak gives you no more trouble, and you are declared a hero by all. Violet tops off the evening by giving you a kiss on the cheek, and a whisper of things to come later that night makes even you almost blush. Almost.',
	// mystic knight win
	'Still shaking from the battle, you decide it is time to return to town and share the good tidings. You close your eyes and concentrate. "There is no place like Town"...A when you open your eyes, you are under a cow in a farm outside - Not far from Abduls Armour. You trek the distance to the Armoury, cursing as you go. Wizards were not made for this kind of hardship you tell yourself. Miss Abdul is estatic when you tell her about your escapades. She agrees to accompany you to the Inn. She lends you a horse when you tell her of how your feet ache. When you enter the smokey bar with a loud clatter, merry makers stop their carousing, people hunched over their meals stop chewing and Seth Able stops playing in mid-strum. "People! I have slain the beast!" you shout triumphantly. A voice is heard from the back. "What beast? A large rat or something?" You scowl. It is Barak. You nonchalantly make a gesture with one hand. A few moments later, Barak stands up suprised. He looks wildly around, then makes a bolt for the door. "What happened to him?" Miss Adbul asks you in puzzlement. "Nature called." you smile. Your face becomes serious as you address the bar. "The Red Dragon is no more." Violet sets her serving tray down to hear better. "We cannot bring back those dead, but I have stopped this from happening again." "And he did it with Armour from Abduls Armour!" Miss Abdul adds. "Er, thank you. Anyway, make sure you put something in the Daily happenings about this!" The crowd gives you a standing ovation.',
	// thief win
	'You breath a sigh of relief, retrieve your daggers and carefully clean them. Although you realized some may think it cold hearted if they ever found out, you pick through the childrens bones, picking up a gold piece here, a silver there. Afterall, these children didn\'t need it to buy a meal anymore... They WERE a meal! You smile at your own dry wit and realize you had better get to town and share the news. The hike to town is long, but you are used to it, and rather enjoy the peace it brings. You find the town deserted. You enter the inn, hoping find some clue, but all you find is Violet. "Via, Where has everyone gone? Have they finally given up hope of ever stopping the Red Dragon, and have gone to seek a new lifestyle?" There is a pause, then she responds. "No, they are having a feast at Turgons Place. Naturally SOMEONE had to stay here, and OF COURSE it would be me...I never get to have any fun!" You give her a wink. "That just isn\'t so...Remember last night?" She giggles, and after a few more naughty sayings you have her cheeks as deep a scarlet as a rose. When you finally meet up at Turgons, you share your story. You can\'t help but be pleased at seeing so many faces in awe over your doings, so you \'spice\' up the story in a few places... As you are finishing, a woman in the back cries out. "That Thief is wearing the ring I gave my Ellie the last birthday before disappeared!" You decide now would be the perfect time to make your departure.'
];

let daily = [
	'More children are missing today.',
	'A small girl was missing today.',
	'The town is in grief. Several children didn\'t come home today.',
	'Dragon sighting reported today by a drunken old man.',
	'Despair covers the land - more bloody remains have been found today.',
	'A group of children did not return from a nature walk today.',
	'The land is in chaos today. Will the abductions ever stop?',
	'Dragon scales have been found in the forest today..Old or new?',
	'Several farmers report missing cattle today.',
	'A Child was found today!  But scared deaf and dumb.',
];

let dark_convo = [
	'Chance',  ' Pull up a chair, friends.',
	'Barak',   ' These chairs are light. Maybe it\'s b/c I\'m strong.',
	'Aragorn', ' I really doubt that..',
	'Barak',   ' I could juggle these chairs I\'m such a stud!',
	'Aragorn', ' Chance, did you forget to give Barak his medicine?',
	'Chance',  ' Whups. I\'ll slip it in his ale...',
	'Aragorn', ' Why don\'t you move this pub to town? More biz there.',
	'Chance',  ' Nah, I don\'t like towns. Even though I do like Violet',
	'Barak',   ' She\'s mine I say! All mine!'
];

let inn_convo = [
	'Halder', 		'Why are the children missing?',
	'Bartender',	'I say the dragons been gettin \'em!',
	'Barak',		'Thats garbage! Red Dragon hasn\'t been seen in years.',
	'Violet',		'Well...They say the Dragon was very smart.',
	'Halder',		'Hey Violet. How bout going to the back room with me?',
	'Violet',		'All you men are pigs!',
	'Bartender',	'Be nice Violet, or you can work elsewhere...',
	'Barak',		'Don\'t worry Violet, There are new warriors in town.',
	'Bartender',	'Ha...These new warriors are a dime a bakers dozen.'
];

let mailbox = [];

let igms = [
'Barak\'s House',
'Apothecary',
'Castle Coldrake',
'Castle of LORD',
'CavernOfCreators',
'Changeling',
'DragonsClawTavern',
'DragonsDen',
'Casino',
'Elaikases Tower',
'FelicitysTemple',
'ForestOuthouse',
'Forgery',
'Fun & Games',
'Gallaghers Perf',
'The Gem Trader',
'HiddenSpringTurgon',
'HidingInShadows',
'KnightsGldenHrshoe',
'Lets Go Fishing',
'Gambling Casino',
'Holidays',
'Suburbia',
'Wheel',
'Morphs Gymnasium',
'The Nice Hag',
'Old Skull Inn',
'Quik-E-Mart',
'Pawn Shop',
'Realm of Lore',
'Reflections',
'Rest&Relaxation',
'Robin Hood',
'School Days',
'Four Horsemen',
'Axehandler Arena',
'AxehndlrBtlGround',
'Across The Tracks',
'AddamsFamily+Munst',
'AxehndlrDominion',
'CityOfTheSunGOD',
'Aladdin\'s Bar',
'Ancients of LORD',
'Aladdin\'s Palace',
'ARABIAN KNIGHTS',
'Aragon\'s home',
'Arena Of Lords',
'Haldar\'s Arena',
'Aragorn\'s Timer',
'Arkhaim Asylum',
'Backally Bar',
'Backally Church',
'Backally',
'Baldur\'s Camp',
'Seth\'s Cottage',
'ShaunaPrnSorcery',
'Village Hut',
'Werewolf',
'WereWolf II',
'The Wise One'
];

let player = 'Test1';
let master = 'Halder';
let master_level = 0;
let text_lines = 0;
let inn_new_convo = [];
let dark_new_convo = [];
let player_arrival = '';
let skill_level = 0;
let skill2_level = 0;
let skill3_level = 0;
let skill = 0;
let skill2 = 0;
let skill3 = 0;
let trade1 = 'Deathknight'; //todo: defaulting to deathknight for now
let trade2 = '';
let trade3 = '';
let weapon_price = 0;
let dark_wager = 0;
let guess_my_number = -1;
let last_guess = -1;
let guess_tries = 0;
let is_shielded = 0;
let max_buy_drinks = 0;
let drinks_requested = 0;
let change_name_cost = 0;
let name_to_change = '';
let bartender_bribe = 0;
let flash_interval = 40;
let flash_zones = [];

let steal_table = [
	500, 999,  4000, 7992,  13500, 26973,  32000, 63936,  62500, 124875,  108000, 215784,
	171500, 342657, 256000, 511488, 364500, 728271, 500000, 999000, 665500, 1329669, 864000, 1726272
];

let save_dest = ['c', 'Castle Coldrake', 'f', 'Fortress Liddux', 'g', 'Gannon Keep', 'p', 'Penyon Manor', 'd', 'Dema\'s Lair'];

let save_girl_location = -1;
let save_target_dest = '';
let save_success = 0;
let current_save_girl_data = [];
let current_save_girl_page = 0;
let current_save_girl_firstpage = '';
let enabled_igms = [0]; // which IGMs are implemented
let other_menu_index = 0;
let save_girl_xp   = 0;
let save_girl_gems = 0;

let fail_save_girl = [
   ['                THE RESCUE',	'THE DOOR SWINGS WIDE OPEN!',	'The room is empty, save a giant chest in the middle.',	'',	'"Hello? Anybody home?" you call softly.',	'',	'You jump in surprise when you hear a voice answer -',	' from the chest.',	'',	'"Help me! I\'m in here! I wrote the note!"',	' the voice pleads.',	'',	'"Um, how did you write the note from in there?"',	' you wonder out loud.',	'',	'"Nevermind that! Just help me!"',	'',	'"Fine." you open the chest. Surprisingly, there',	'is not a fair maiden inside. Instead you find a..',	'',	'"MY GOD A HOLL! A HALF HUMAN HALF TROLL WOMAN! NO!"',	' you scream.',	'',	'You are violated by this hairy beast. Apparently',	'she needs love like anyone else.',	'',	'YOU WEAKLY CRAWL AWAY FROM HER SOMETIME LATER'],
   ['THE DOOR SWINGS WIDE OPEN',	'',	'You see two beautiful women playing chess.',	'',	'"Hello, ladys. Which one of you needs rescuing?" you',	'ask politely.',	'',	'"Neither!" they chime.',	'',	'You scratch your chin in cunfusion. "So where is the',	'damn damsel in distress?!"',	'',	'At this moment, a messenger burst through the broken',	'doorway. "My friends, I bear terrible news -',	'the castle has been attacked. Your father the King',	'is dead." the messenger is now audibly sobbing.',	'',	'"Ah. Yes. Well, this is all very tragic, but I uh, need',	'to be going." you studder uncomfortably.',	'',	'The now ashen white faced women look at you dumbfounded',	'as you make your exit.']
];

let ok_save_girl = [
   [
   '                THE RESCUE',
   'THE DOOR SWINGS WIDE OPEN!',
   '"You\'ve come for me!" shouts an overjoyed (and darn',
   'good looking) girl.',
   '',
   'You breath a sigh of relief. This was the right place.',
   '',
   'The girl eyes you dreamily. "I can never replay you,',
   ' and I..."',
   '',
   '"Oh but you can. Is that your bed?" you interrupt.',
   '',
   '1 minute later, you feel quite repaid.',
   '',
   'YOU GET {0} EXPERIENCE.',
   '',
   '"Well, that was fun, gotta go," you mutter as you',
   'throw your tunic back on.',
   '',
   'A sweet voice from the bed stops you as you hit the',
   'stairs. "Wait! I have something else for you too."',
   '',
   'Your blank face turns to joy as she hands you a pouch.',
   '',
   'YOU GET {1} GEMS FOR YOUR TROUBLE.']
];

let save_girl_firstpage = [
'`1██████████████████████████████████████████████████████  ',
'`1██████████████████████████████████████████████████████  ',
'`1████████`8█`1█`8█`1█`8█`1█`8█`1█`8█`1█`8█`1█`!█`1█`!█`1█`%█`1█`%█`1███████████████████████████  ',
'`1████████`8███████████`!██`%██████`1███████████████████████████  ',
'`1█████████`8████████`&╔═════════════════════════════════════╗',
'`1██████████`8███████`&║`! You reach the castle and fight your ║',
'`1██████████`8█`%▌`8█████`&║`! way up the tower!                   ║',
'`1█`0█`1█████`0██`1█`8███████`&║                                     ║',
'`0███`1██`0█████`8███████`&║`! You blindly slash at any who stand  ║',
'`0█████`1█`0████`8███████`&║`! in your path screaming to find the  ║',
'`0████`1█`0███`1█`0█`8███████`&║`! prisoner you seek and the jailer of ║',
'`1█`0█████`1██`0██`8███████`&║`! your heart.                         ║',
'`0████`6█`0█████`8███████`&╚═════════════════════════════════════╝',
'`1█`0██`6████`0██`1█`8█████████`!███`%██`1██`&╔══════════════════════════╗  ',
'`1████`6██`1████`8██`%▌`8██████`!█▐`%█▌█`1██`&║`%You make it to the top and`&║  ',
'`1████`6███`1███`8████████`!██`%████`1██`&║`%  throw open the door...  `&║  ',
'`1████`6███`1██`0██`8████████`!██`%███`1██`&╚═`0██═════`0███═══════════════╝  ',
'`1██`0███`6██`1█`0█████`8█████`!██`%████`1██`0█████`1██`0███████`1██`0████`1████████  ',
'`0███████████`8█`0███`8████`!███`%█`0█████████████████████`1██████████  ',
'`0█████████████████████████████████████████████`1██`%<MORE>`1█  ',
];

let seth_songs_m = [
[
'..."Waiting in the forest waiting for his prey"...',
'..."`%{0}`2 didn\'t care what they would say"...',
'..."He killed in the town, the lands"...',
'..."He wanted evil\'s blood on his hands"...',
'',
'The song makes you feel powerful!'
],
['..."A true man was {0}, a warrior proud"...',
 '..."He voiced his opinions meekly, never very loud"...',
 '..."But he ain\'t no wimp, he took Violet to bed"...',
 '..."He\'s definately a man, at least that\'s what she said!"...',
 '',
 'The song makes you glad you are male!',]
];

let seth_songs_f = [
[
'..."{0} was a warrior, a queen"...',
'..."She was a beauty, and she was mean"...',
'..."She could melt a heart, at a glance"...',
'..."And men would pay, to see her dance!"...',
'',
'The song makes you feel pretty!'
]
];

let banner_width = 62;
let show_banner = 0;

let banner =[
            "=                        /   \\                          ",
           "=                )      ((   ))     (                     ",
          "=               /║\\      )) ((     /║\\                   ",
          "=              / ║ \\    (/\\║/\\)   / ║ \\                ",
          "=╔════════════/══║═voV═══\\`║'/══Vov═║══\\════════════════╗",
            "=║                 '^`   (o o)  '^`                     ║",
           "=║                       `\\Y/'                          ║",
            "=║                                                      ║",
            "=║             LEGEND OF THE RED DRAGON                 ║",
            "=║                  FOR LASTCALLBBS                     ║",
            "=║           reimplemented by almostsweet 2022          ║",
            "=╚══════════════════════════════════════════════════════╝",
            "=           l   /\\ /      ( (     \\ /\\   l            ",
            "=           l /   V        \\ \\     V   \\ l            ",
            "=           l/              ) )         \\I              ",
            "=                          `\\ /'                  v"+VER];

let death_rattles = [
'"Damn, Damn, Damn!,"`5${0} roars.',
'"I would rather gargle razor blades then be beaten\n by you, "`0${1}`2 !,"`5${0}`2 screams.',
'"How the hell did you do that?!,"`5${0}`2 shouts.',
'"You got lucky,`0${1}`2!,"`5${0}`2 declares.',
'"Try that again! I\'ll decapitate you!,"\n`5${0}`2 challenges.',
'"You are definatly stronger than you look,\n`0${1}`2,"`5${0}`2 admits.',
'"I am SO mad I could slice you in two!,"\n`5${0}`2 screams.',
'"You have not seen the last of me,`0${1}`2!,"\n`5${0}`2 threatens.',
'"How could a scrawny little wimp like`0${1}`2\n best me?,"`5${0}`2 wonders aloud.',
'"How many of you`0${1}\'s`2 live in that forest\n anyway?!,"`5${0}`2 ponders.',
'"Ack! I was under the impression I was invincible.\n I suppose I was wrong,"`5${0}`2 admits.',
'"Killed by`0${1}`2. I am disgraced,"\n grieves`5${0}`2.',
'"I\'LL BE BACK!," swears`5${0}`2.',
'"At least I wasn\'t bested by Large Rat,\n eh?," shrugs`5${0}`2.',
'"My goodness. This a turn for the worse,"\n states`5${0}`2.',
'"You never think it can happen to you...Then\n WHAM!," explains`5${0}`2.',
'"I think I\'m going to be sick,"\n`5${0}`2 moans pitifully.',
'"I feel ill," elucidates`5${0}`2.',
'"Well...So much for my reputation!," expounds`5${0}`2.',
'"Damnit! I was looking for the Dark Cloak Tavern,"\n explains`5${0}`2 in dismay.',
'`0${1}`2 devours`5${0}`2 raw.',
'`0${1}`2 carefully burys`5${0}`2.',
'`5${0}\'s`2 entrails are littering the forest.',
'Halder laughs at `5${0}\'s`2 plight.',
'The banker is already looking for `5${0}\'s`2\n next of kin.',
];

let dwarf_should_play = 0;
//let blackjack_result = 0;
let blackjack_card_display = [[], [], [], []];
let blackjack_hand = [];
let blackjack_cards = [];
let blackjack_dealer_hand=[];
let blackjack_dealerpoints = 0;
let blackjack_hand1points  = 0;
let blackjack_hand1points2 = 0;
let blackjack_cur_suit = -1;
let blackjack_cur_value = -1;
let blackjack_cur_points = -1;
let blackjack_has_split = 0;
let blackjack_deal_suit = -1;
let blackjack_deal_value = -1;
let blackjack_deal_points = -1;
let blackjack_alive = 1;
let blackjack_checksplit = 0;
let blackjack_player_score = 0;
let blackjack_dealer_score = 0;
let blackjack_dealer_alive = 0;
let blackjack_has_ace = 0;
let blackjack_result = WINNER_NONE;
let blackjack_hand2 = [];
let blackjack_game_over = 0;
let blackjack_is_split_aces = 0;
let blackjack_cansplit = 0;
let blackjack_card_index = 0;
let blackjack_s1 = 0;
let blackjack_s2 = 0;
let current_bet = -1;
let bet_error = '';
let blackjack_left_messages = [
['Quitting', 'while your', 'ahead?', 'Smart move.', '', '', '', '','   <MORE>'],
['I have {0}.', 'Hand1 {0}', 'Hand2 {0}', 'You {0}', '{0}', '{0}', '','   <MORE>'],
['How much', 'ya gonna', 'wager?', '{0}', '', '', '', '','   <MORE>'],
['It\s a push!', 'I guess its', 'better than', 'losing.', '', '', '', '','   <MORE>'],
['Sorry!', 'That hand', 'busted.', '', '', '', '', '','   <MORE>'],
['Would you', 'like to hit', 'or stay?', '', '', '', '', '','   <MORE>'],
['Would you', 'like to', 'split?', '', '', '', '', '','   <MORE>'],
['You got a', 'Blackjack!?', 'Are you', 'cheating?!', '', 'You win', '{0}', 'Gold', '   <MORE>'],
['I busted!', 'See? You', 'win', '', '{0}', 'Gold.', '', '', '   <MORE>'],
['Looks like', 'you lose.', 'Oh well!', 'better luck', 'next time.', '', '', '', '   <MORE>'],
['You win!', 'Not too bad', 'for a kid..', '', 'You win', '{0}', 'Gold', '   <MORE>'],
['Play again?', '', '', '', '', '', '', ''],
// not the official msg but i didn't find it yet
['Hand{0}', 'busted', 'Hit or', 'stay?', 'Hand{0}', '', '', '   <MORE>']
];
let blackjack_right_messages = [['`2(`0Y`2)es (`0N`2)o.'],['`2(`0H`2)it', '`2(`0S`2)tay']];
let blackjack_current_left_message = [];
let blackjack_current_right_message = [];
let blackjack_busted1=0;
let blackjack_busted2=0;
let blackjack_dealer_reveal = [];
let card_suits = ['♥','♠','♣','♦'];
let full_playing_card = ['╔════╗','║{0}{1}  ║','║    ║','║    ║','╚════╝'];
let hidden_playing_card = ['╔════╗','║████║'];
let revealed_playing_card =['╔════╗','║{0}{1}  ║'];
let blackjack_left_msg_args = ['',	'',	'',	'',	'',	'',	'',	''];
let blackjack_right_msg_args = ['', '', '', '', '', '', '', ''];

let mystical_messages = [
['You feel power dancing in your mind, maybe it\'s',
 'time to use it.'
],
['Your mind carefully goes over what you have learned.'],
['You struggle to keep your anger under control.']
];

let instruction_manual = [
['                 Instructions',
'-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-',
'WELCOME TO THE ADVENTURE OF A LIFETIME!',
'',
'** Full multi-node support.',
'** This game is FINISHABLE! (If the sysop chooses)',
'** Real time online messages and battles.',
'** Marriage and other \'Real Life\' options.',
'** Auto reincarnation if a player is dead for 2 days.',
'',
'This is multi player battle game, created for BBS\'s',
'it is the type of game where you kill other players,',
'get strong and stronger and your number one goal is',
'to stay #1 in the player rankings! Of course, killing',
'the Dreaded Red Dragon will make you a hero, and your',
'name will be immortalized in the Hall Of Honor.',
'',
'Each day, you are given a certain amount of fights per',
'day, once you use them, you can no longer do battle',
'that day, you must call back the NEXT day to be',
'\'refilled\'.'],
['Money in the bank gets 10% interest per day.',
'Stay at the Inn, and you will be safe from `0MOST`2',
'attackers...If they want to kill you bad enough, they',
'may find a way...However costly. Be sure to buy better',
'armour and weapons when possible, it really makes a',
'LARGE difference.',
'',
'Be sure to take advantage of the advanced mail writing',
'functions available, they are very fast and easy to use,',
'and you will have LOADS more fun when you get to `0KNOW`2',
'who you are killing!',
'',
'Particapate in conversation at The Bar,  interacting',
'with real people is what makes BBS games so enjoyable,',
'and this game is loaded with ways to do that... From',
'insulting people in the Daily Happenings, to ',
'slaughtering them in cold blood, then sending them',
'mail gloating over the victory, this game will let',
'you have some fun!'
],
[
'The game is pretty self explanatory, so I will let you,',
'the player, explore on your own.  Just hit \'`0?`2\' when',
'you\'re not sure, and you will get a menu.  For starters,',
'try visiting the Inn.',
'',
'If you are male, try your hand at Flirting with Violet...',
'If you are female, you can try your luck with The Bard.',
'',
'If someone else attacks you and loses, you will get the',
'experience just as if you killed them yourself.  (You will',
'be mailed on the details of the battle)',
'',
'              `0GOOD LUCK AND HAPPY GAMING!`2']
];

if (!String.format) {
  String.format = function(format)
  {
	let args = Array.prototype.slice.call(arguments, 1);
	return format.replace(/{(\d+)}/g, function(match, number)
	{ 
		return typeof args[number] != 'undefined'
			? args[number] 
			: match;
	});
  };
}

function healamt()
{
	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) { lvl = 1; }
	return 5 * lvl;
}

function heal_cost()
{
	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) { lvl = 1; }
	return lvl * 5;
}

function inflict_damage_player(tstr)
{
	let r = getRandomFloat(0.1, 1.0, 2);
	let tdmg = parseInt(tstr * r);
	let arm = get_armor_defense();
	tdmg -= arm;
	
	if (tdmg < 0) tdmg = 0;
	if (is_shielded == 1)
	{
		is_shielded = 0;
		tdmg = parseInt(tdmg / 2);
		
		//Not the official message, look this up
		writelog('');
		writelog('The light shield deflects the attack.');
	}
	
	if (tdmg > 0)
	{
		dec_player_value(player, 'hp', tdmg, 0);
	}
	
	damage = tdmg;
}

function writelog(s)
{
	text_buffer.push(s);
	text_lines++;
	console.log(s);
}

function clearlog()
{
	text_buffer = [];
	text_lines = 0;
	console.clear();
	
}

function died_by()
{
	add_news(String.format('`5{0} `2has been killed by `%{1}`2!', player, monster),
		String.format(death_rattles[getRandomInt(death_rattles.length)], player, monster));
}

function killed_player(e, msg)
{
	add_news(player+'`% has killed '+e, '"'+msg+'" laughs '+player);
}

function list_mystical_skills()
{
	let m = get_player_value(player, 'classm');
	if (player_value_not_found == 1) m = 0;
	if (m == 0) return;
	
	let um = get_player_value(player, 'usesm');
	if (player_value_not_found == 1) um = 0;
	
	writelog('** MYSTICAL SKILLS **');
	writelog('');
	
	let msg = mystical_messages[getRandomInt(mystical_messages.length)];
	
	for(let i=0; i < msg.length; i++)
	{
		writelog(msg[i]);
	}
	
	writelog('');
	if (um >= 1)	{ writelog('(P)inch Real Hard (1) '); }
	if (um >= 4)	{ writelog('(D)isappear (4) '); }
	if (um >= 8)	{ writelog('(H)eatwave (8) '); }
	if (um >= 12) 	{ writelog('(L)ight Shield (12) '); }
	if (um >= 16)	{ writelog('(S)hatter (16) '); }
	if (um >= 20)	{ writelog('(M)ind Heal (20) '); }
	writelog('');
	writelog('');
	writelog('You Have '+um+' Use Points. Choose. [Nothing] ');
	writelog('');
}

function use_mystical_pinch(t,tw,thp,tstr,td,txp,tgp,level)
{
	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) lvl = 1;
	
	// note: level = -1 for monsters, if a player then pinch cannot be used in <= player fights
	if (level != -1 && level <= lvl) return;
	
	damage = 0;
	
	let s = get_player_value(player, 'str');
	if (player_value_not_found == 1) { s = 10; }
	
	let r = getRandomFloat(1.0, 1.5, 2);
	damage = parseInt(s * r);
	damage += parseInt(get_weapon_attack() * r);

	writelog('You whisper the word. You smile as '+t);
	writelog(' screams out in pain.');
	writelog('');
	writelog('You hit '+t+' for '+damage+' damage!');
	writelog('');
	
	thp -= damage;
	
	if (thp > 0)
	{
		inflict_damage_player(tstr);
		
		writelog('** '+t+' hits with its '+tw+' for '+damage+' **');
		writelog('');
		writelog('<MORE>');
	}
	else
	{
		let findgem = getRandomInt(100) >= 90;
		perform_monster_died(player, t, td, txp, tgp, findgem);
	}

	return thp;
}

function use_heatwave(t,tw,thp,tstr,td,txp,tgp)
{
	damage = 0;
	
	let s = get_player_value(player, 'str');
	if (player_value_not_found == 1) { s = 10; }

	let r = getRandomFloat(1.5, 5.5, 2);
	damage = parseInt(s * r);
	damage += parseInt(get_weapon_attack() * r);

	writelog('You whisper the word. You smile as a heatwave');
	writelog(' hits '+t);
	writelog('');
	writelog('You hit '+t+' for '+damage+' damage!');
	writelog('');
	
	thp -= damage;
	
	if (thp > 0)
	{
		inflict_damage_player(tstr);
		writelog('** '+t+' hits with its '+tw+' for '+damage+' **');
		writelog('');
		writelog('<MORE>');
	}
	else
	{
		let findgem = getRandomInt(100) >= 90;
		perform_monster_died(player, t, td, txp, tgp, findgem);
	}
	
	return thp;
}

function use_shatter(t,tw,thp,tstr,td,txp,tgp)
{
	damage = 0;
	
	let s = get_player_value(player, 'str');
	if (player_value_not_found == 1) { s = 10; }
	
	let r = getRandomFloat(1.5, 5.5, 2);
	damage = parseInt(s * r);
	damage += parseInt(get_weapon_attack() * r);
	damage *= 2;

	writelog('You whisper the word. You smile as shatter');
	writelog(' hits '+t);
	writelog('');
	writelog('You hit '+t+' for '+damage+' damage!');
	writelog('');
	
	thp -= damage;
	
	if (thp > 0)
	{
		inflict_damage_player(tstr);
		writelog('** '+t+' hits with its '+tw+' for '+damage+' **');
		writelog('');
		writelog('<MORE>');
	}
	else
	{
		let findgem = getRandomInt(100) >= 90;
		perform_monster_died(player, t, td, txp, tgp, findgem);
	}
	
	return thp;
}

function add_news(s1, s2)
{
	let s = s1;
	if (s2 != undefined && s2 != '') s += '\n'+s2;
	current_news.push(s);
}

function calc_player_damage()
{
	let s = get_player_value(player, 'str');
	if (player_value_not_found == 1) { s = 10; }

	if (getRandomInt(100) >= 90)
	{
		// note: i'm just guessing at what the calculation for damage is...
		let r = getRandomFloat(1.5, 5.5, 2);
		damage = parseInt(s * r);
		damage += parseInt(get_weapon_attack() * r);
	}
}

function perform_monster_died(p, t, td, txp, tgp, findgem)
{
	writelog(td);
	writelog('');
	writelog('You have killed '+t+'!');
	
	if (findgem)
	{
		if (getRandomInt(100) >= 90)
		{
			writelog('You find a Gem!');
			writelog('');
			inc_player_value(p, 'gems', 1, MAX_VALUE);
		}
	}
	
	writelog('');
	writelog('You receive '+tgp+' gold, and '+txp+' experience!');
	writelog('');
	draw_menu(0);
	
	
	inc_player_value(p, 'xp', txp, MAX_XP);
	inc_player_value(p, 'gold', tgp, MAX_VALUE);
}

function perform_attack()
{
	let s = get_player_value(player, 'str');
	if (player_value_not_found == 1) { s = 10; }

	if (getRandomInt(100) >= 90)
	{
		// note: i'm just guessing at what the calculation for damage is...
		let r = getRandomFloat(1.5, 5.5, 2);
		damage = parseInt(s * r);
		damage += parseInt(get_weapon_attack() * r);
		
		writelog('**POWER MOVE**');
		writelog('');
		writelog('You hit '+monster+' for '+damage+' damage!');
		
		monster_hp -= damage;

		if (monster_hp <= 0)
		{
			perform_monster_died(player, monster, monster_death, monster_xp, monster_gp, 0);
		}
		return;
	}
	
	damage = getRandomInt(s);
	damage += parseInt(get_weapon_attack());
	
	if (damage == 0)
	{
		writelog('You missed!');
	}
	else
	{
		monster_hp -= damage;
		writelog('You hit '+monster+' for '+damage+' damage!');
	}
	
	if (monster_hp <= 0)
	{
		let findgem = getRandomInt(100) >= 90;
		perform_monster_died(player, monster, monster_death, monster_xp, monster_gp, findgem);
	}
	else
	{
		inflict_damage_player(monster_str);
		
		if (damage > 0)
		{
			writelog('* '+monster+' hits w/ '+monster_weapon+' for '+damage);
		}
		else
		{
			writelog('* '+monster+' misses you Completely! **');
		}
		
		let h = get_player_value(player, 'hp');
		if (player_value_not_found == 1) { h = 0; }
		
		if (h <= 0)
		{
			died_by();

			clearlog();
			writelog('You have been killed by '+monster);
			writelog('');
			writelog('GOLD ON HAND WAS LOST.');
			writelog('');
			writelog('TEN PERCENT OF EXPERIENCE LOST.');
			writelog('');
			writelog('You have been defeated on your way to glory. The road to');
			writelog('succcess is long and hard. You have encountered a minor');
			writelog('setback. But do NOT lose heart, you can continue your');
			writelog('struggle tomorrow.');
			writelog('');
			writelog('RETURNING TO THE MUNDANE WORLD...');
			writelog('');
			writelog('+++ATH NO CARRIER');
			
			let x = get_player_value(player, 'xp');
			if (player_value_not_found == 1) { x = 1; }
			x = parseInt(x - (x * 0.1));
			if (x < 0) x = 0;

			set_player_value(player, 'gold', 0, MAX_VALUE);
			set_player_value(player, 'xp', x, MAX_VALUE);
			set_player_value(player, 'dead', 1, MAX_VALUE);
			return;
		}
		
		h = get_player_value(player, 'hp');
		
		writelog('');
		writelog('Your Hitpoints : '+h);
		writelog(monster+'\'s Hitpoints : '+monster_hp);
		writelog('');
		writelog('(A)ttack');
		writelog('(S)tats');
		writelog('(R)un');
		writelog('');
		menu_skill_type();
		writelog('');
		display_your_command();
		writelog('');
	}
}

function perform_skill()
{
	let c = get_player_value(player, 'class');
	if (player_value_not_found == 1) c=0;
	
	switch (c)
	{
		case 0:
		{
			let u = get_player_value(player, 'usesd');
			if (player_value_not_found == 1) { u = 0; }
			if (u-1 >= 0)
			{
				dec_player_value(player, 'usesd', 1, 0);

				let s = get_player_value(player, 'str');
				if (player_value_not_found == 1) { s = 10; }

				let r = getRandomFloat(1.5, 5.5, 2);
				damage = parseInt(s * r);
				damage += parseInt(get_weapon_attack() * r);
				monster_hp -= damage;
				writelog('Performed skill attack on '+monster+' for '+damage);
				writelog('');
				writelog('<MORE>');
			}
			else
			{
				writelog('That skill is out of uses for today.');
				writelog('');
				writelog('<MORE>');
			}
		}
		break;
		case 1:
		{
			current=list_mystical_skills;
			draw_menu(0);
			return;
		}
		break;
		case 2:
		{
			current=list_thieving_skills;
			draw_menu(0);
		}
		break;
	}
}

function attackedby()
{
	inflict_damage_player(monster_str);
	
	if (damage <= 0)
	{
		writelog(monster+' has missed!');
	}
	else
	{
		writelog(monster+' attacked w/ '+monster_weapon+' for '+damage);
		
		let hp = get_player_value(player, 'hp');
		if (player_value_not_found == 1) hp = 0;
		if (hp > 0) menu_use_death_crystal(monster);
	}
}

function encounterby()
{
	let h = get_player_value(player, 'hp');
	if (player_value_not_found == 1) { h = -1; }
	
	writelog('');
	writelog('Your Hitpoints : '+h);
	writelog(monster+'\'s Hitpoints : '+monster_hp);
	writelog('');
	writelog('(A)ttack');
	writelog('(S)tats');
	writelog('(R)un');
	writelog('');
	menu_skill_type();
	writelog('');
	display_your_command();
	writelog('');
}

function menu_main()
{
	writelog('`%  Legend of the Red Dragon - `2Town Square');
	writelog('`0-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('  The streets are crowded, it is difficult to');
	writelog('  push your way through the mob....');
	writelog('');
	writelog('(`5F`2)orest                   (`5S`2)laughter other players');
	writelog('(`5K`2)ing Arthurs Weapons     (`5A`2)bduls Armour');
	writelog('(`5H`2)ealers Hut              (`5V`2)iew your stats');
	writelog('(`5I`2)nn                      (`5T`2)urgons Warrior Training');
	writelog('(`5Y`2)e Old Bank              (`5L`2)ist Warriors');
	writelog('(`5W`2)rite Mail               (`5D`2)aily News');
	writelog('(`5C`2)onjugality List         (`5O`2)ther Places');
	writelog('(`%X`2)pert Mode               (`5M`2)ake Announcement');
	//writelog('(`5P`2)eople Online            (`%G`2)ambling Casino');
	writelog('(`5P`2)eople Online            (`0Q`2)uit to Fields');
	writelog('');
	build_menu_string('The Town Square', 'F,S,K,A,H,V,I,T,Y,L,W,D,C,O,X,M.P,Q', 1);
	display_your_command();
}

function menu_refreshed()
{
	// forest events do not use up forest fights
	inc_player_value(player, 'fights', 1, MAX_VALUE);
	
	writelog('  Event In The Forest');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You find a beautiful Garden, and decide to take ');
	writelog('a little rest... You drink from the brook, and');
	writelog('smell the flowers.');
	writelog('');
	writelog('YOU ARE REFRESHED, AND GET ONE MORE FOREST');
	writelog('FIGHT TODAY!');
	writelog('');
	writelog('<MORE>');

	inc_player_value(player, 'fights', 1, MAX_VALUE);
}

function menu_begin_arrange_flowers()
{
	writelog('');
	writelog('You notice the flowers seem to be arranged.');
	writelog('Study them? [Y] : ');
}

function menu_arrange_flowers()
{
	writelog('');
	writelog('todo; arrange flowers');
}

function menu_hammer_stone()
{
	// forest events do not use up forest fights
	inc_player_value(player, 'fights', 1, MAX_VALUE);
	
	let w = get_player_value(player, 'weapon');
	if (player_value_not_found == 1) { w = ''; }

	writelog('  Event In The Forest');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You find a Hammer Stone!');
	writelog('');
	writelog('As is the tradition, you break it in two with your');
	writelog(w+'. Your weapon tingles!');
	writelog('');
	writelog('ATTACK STRENGTH RAISED.');
	writelog('');
	writelog('<MORE>');
	
	inc_player_value(player, 'str', 1, MAX_VALUE);
}

function menu_old_hag()
{
	// forest events do not use up forest fights
	inc_player_value(player, 'fights', 1, MAX_VALUE);

	writelog('  Event In The Forest');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You come across an ugly old hag. "Give me a gem and');
	writelog('I will completely heal you warrior!" she screeches.');
	writelog('');
	writelog('Give her the gem? [N] ');
}

function menu_hag_yes_gem()
{
	let g = get_player_value(player, 'gems');
	if (player_value_not_found == 1) { g = 0; }
	
	if (g > 0)
	{
		dec_player_value(player, 'gems', 1, 0);
		
		writelog('');
		writelog('You give her a gem. She waves her wand strangely.');
		writelog('');
		writelog('YOU FEEL BETTER');
		writelog('');
		writelog('<MORE>');
		
		let maxhp = inc_player_value(player, 'maxhp', 1, MAX_VALUE);
		set_player_value(player, 'hp', maxhp);
	}
	else
	{
		writelog('');
		writelog('You have no gems!');
		writelog('');
		writelog('<MORE>');
	}
}

function menu_hag_no_gem()
{
	writelog('');
	writelog('"Hurumph!" the old woman grunts sourly as you leave.');
	writelog('');
	writelog('<MORE>');
}

function menu_use_death_crystal(enemy_name)
{
	let h = get_player_value(player, 'horse');
	if (player_value_not_found == 1) { h = 0; }
	
	if (h > 0)
	{
		if (getRandomInt(27) == 0)
		{
			writelog('');
			writelog('"Prepare to die, fool!" '+enemy_name+' screams.');
			writelog('');
			writelog('He takes a Death Crystal from his cloak and throws it at');
			writelog('you!');
			
			writelog('Your horse moves its huge body to intercept the crystal.');
			writelog('');
			writelog('YOUR HORSE IS VAPORIZED!');
			writelog('');
			writelog('Tears of anger flow down your cheeks. Your valiant steed must');
			writelog('be avenged.');
			writelog('');

			writelog('YOU PUMMEL '+enemy_name+' WITH BLOWS!');
			writelog('');
			writelog('A few seconds later, your adversary is dead.');
			writelog('');
			writelog('You bury your horse in a small clearing. The best');
			writelog('friend you ever had.');
			writelog('');
			writelog('You have killed '+enemy_name+'!');
			writelog('');
			
			let mi = get_monster_index(enemy_name);
			if (mi != -1)
			{
				get_monster(mi);
				
				inc_player_value(player, 'gold', monster_gp, MAX_VALUE);
				inc_player_value(player, 'xp', monster_xp, MAX_XP);
				
				writelog('You receive '+monster_gp+' gold, and '+monster_xp+' experience!');
			}
			else
			{
				writelog('ERROR: Could not lookup enemy: '+enemy_name);
			}
			
			writelog('');
			writelog('<MORE>');
			
			monster_hp = 0;
			
			set_player_value(player, 'horse', 0);
		}
	}
}

function menu_forest()
{
	writelog('  Legend of the Red Dragon - Forest');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('  The murky forest stands before you - a giant maw of');
	writelog('  gloomy darkness ever beckoning.');
	writelog('');
	writelog('(`0L`2)ook for something to kill');
	writelog('(`0H`2)ealers hut');
	let horse = get_player_value(player, 'horse');
	if (player_value_not_found == 1) horse = HORSE_NONE;
	if (horse != HORSE_NONE)
	{
		writelog('(T)ake Horse to DarkCloak Tavern');
	}
	writelog('(`0R`2)eturn to town');
	writelog(''); 
	stat_line();
	build_menu_string('The Forest', 'L,H,R,Q', 0);
	display_your_command2(['L','H','R','Q','l','h','r','q']);
}

function build_menu_string(location, opts, twoline)
{
	if (twoline)
	{
		writelog('`5'+location+'`2  `1(? for menu)');
		writelog('`1('+opts+')');
	}
	else
	{
		writelog('`5'+location+'`2  `1('+opts+') (? for menu)');
	}
}



import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { write } from 'node:fs';

let rl = readline.createInterface({ input, output });

async function display_your_command()
{

            
                let r1 = await rl.question('Whats your command? (?: Menu):        ');
        if (r1.trim() != '') {
        onInput(r1.trim());
 	}
	else{
		display_your_command();
	}
}

async function display_your_command2(array1)
{

            
                let r1 = await rl.question('Whats your command? (?: Menu):        ');
        if (array1.includes(r1.trim()) ) {
        onInput(r1.trim());	
		//display_your_command2(array1);
		
 	}
	else{
		writelog('Invalid selection.');
		display_your_command2(array1);
		
	}
}

function menu_inn_convo()
{
	writelog('  Conversation at the Bar');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	
	let new_items = inn_new_convo.length;
	if (new_items > 14) { inn_new_convo = inn_new_convo.splice(new_items - 14, 14); }
	
	let len = inn_convo.length - new_items;
	for(let i=new_items; i < len; i+=2)
	{
		writelog(inn_convo[i]+':');
		writelog(inn_convo[i+1]);
	}

	for(let i=0; i < inn_new_convo.length; i+=2)
	{
		writelog(inn_new_convo[i]+':');
		writelog(inn_new_convo[i+1]);
	}
	
	writelog('');
	writelog('(C)ontinue (A)dd to Conversation [C]:');
}

function menu_weapon_sell()
{
	writelog('  King Arthurs Weapons');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');

	let w = get_player_value(player, 'weapon');
	if (player_value_not_found == 1) { w = ''; }

	let i = findData(weapons, w);
	
	if (w == '' || i == -1)
	{
		writelog('I can\'t buy that.');
	}
	else
	{
		weapon_price = parseInt(weapons[i + 1] * 0.50167);
		
		writelog('"I will buy '+w+' for '+weapon_price+'."');
		writelog('Sell it? [Y, N] :');
		
	
	}
}

function menu_weapon_buy()
{
	writelog('The legend of the Red Dragon - Weapons List');

	let line=0;
	for(let i=0; i < weapons.length; i+=4)
	{
		line++;
		let wname = weapons[i];
		let prefix = '';
		if (line < 10) prefix = ' ';
		let wprice = weapons[i+1].toString();
		
		let s='';
		let w=20
		let d=0
		
		for(let x=0; x < w  - wname.length; x++)
		{
			s += '\t';
		}
		writelog(prefix + line.toString() + '. ' + wname + s + wprice);
	}

	let g = get_player_value(player, 'gold');
	if (player_value_not_found == 1) { g = 0; }

	writelog('(Gold: '+g.toString()+')  (0 to exit)');
	writelog('Number Of Weapon : ');
}

function menu_weapons()
{
	writelog('  Legend of the Red Dragon - King Arthurs Weapons');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog(' You walk into the well known weapons');
	writelog(' shop, you pause to look around at all of');
	writelog(' the many implements of destruction. A');
	writelog(' fat man woddles into the room, and');
	writelog(' asks, "Wadaya want kid?"');
	writelog('');
	writelog(' [B]uy Weapon');
	writelog(' [S]ell Weapon');
	writelog(' [Y]our Stats');
	writelog(' [R]eturn to Town');
	writelog('');
	display_your_command();
}

function menu_armor_sell()
{
	writelog('  Abduls Armour');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');

	let a = get_player_value(player, 'armor');
	if (player_value_not_found == 1) { a = ''; }

	let i = findData(armors, a);
	
	if (a == '' || i == -1)
	{
		writelog('I can\'t buy that.');
	}
	else
	{
		armor_price = parseInt(armors[i + 1] * 0.50167);
		
		writelog('"I will buy '+a+' for '+armor_price+'."');
		writelog('Sell it? [Y,N] :');
	}
}

function menu_armor_buy()
{
	writelog('Abduls Armour - Armor List');

	let line=0;
	for(let i=0; i < armors.length; i+=4)
	{
		line++;
		let wname = armors[i];
		let prefix = '';
		if (line < 10) prefix = ' ';
		let wprice = armors[i+1].toString();
		
		let s='';
		let w=20
		let d=0
		
		for(let x=0; x < w  - wname.length; x++)
		{
			s += '\t';
		}
		writelog(prefix + line.toString() + '. ' + wname + s + wprice);
	}

	let g = get_player_value(player, 'gold');
	if (player_value_not_found == 1) { g = 0; }

	writelog('(Gold: '+g.toString()+')  (0 to exit)');
	writelog('Number Of Armor : ');
}

function menu_armor()
{
	writelog('  Legend of the Red Dragon - Abduls Armour');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog(' Behind the desk of the armour shop is an');
	writelog(' amazingly attractive looking female - she seems');
	writelog(' busy, doing her nails but she asks "How');
	writelog(' may I be of service?"');
	writelog('');
	writelog(' [B]uy Armour');
	writelog(' [S]ell Armour');
	writelog(' [Y]our Stats');
	writelog(' [R]eturn to Town');
	writelog('');
	display_your_command();
}

function menu_heal()
{
	let h = get_player_value(player, 'hp');
	if (player_value_not_found == 1) { h = 0; }

	let mh = get_player_value(player, 'maxhp');
	if (player_value_not_found == 1) { mh = 0; }
	
	let g = get_player_value(player, 'gold');
	if (player_value_not_found == 1) { g = 0; }
	
	writelog('  Legend of the Red Dragon - Healers');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('   You enter the smoky healers hut.');
	writelog('   "What is your wish, warrior?" the old');
	writelog('   healer asks.');
	writelog('');
	writelog('  (H)eal all possible');
	writelog('  (C)ertain amount healed');
	writelog('  (R)eturn');
	writelog('');
	writelog('HP: ('+h+' of '+mh+') Gold: '+g);
	writelog('(it costs '+healamt()+' to heal 1 hitpoint)');
	writelog('');
	display_your_command();
}

function menu_begin_heal()
{
	let h = get_player_value(player, 'hp');
	if (player_value_not_found == 1) { h = 0; }

	let mh = get_player_value(player, 'maxhp');
	if (player_value_not_found == 1) { mh = 0; }
	
	let g = get_player_value(player, 'gold');
	if (player_value_not_found == 1) { g = 0; }
	
	writelog('  Healers');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('');
	writelog('HP: ('+h+' of '+mh+') Gold: '+g);
	writelog('(it costs '+healamt()+' to heal 1 hitpoint)');
	writelog('');
	writelog('"How many hit points would you like healed?"');
	writelog('AMOUNT :');
}

function menu_inn()
{
	let sex = get_player_value(player, 'sex');
	if (player_value_not_found == 1) sex = 0;
	
	writelog('  Legend of the Red Dragon - The Inn');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You enter the inn and are immediately hailed by');
	writelog('several of the patrons. You respond with a wave and');
	writelog('scan the room. The room is filled with smoke from');
	writelog('the torches that line the walls. Oaken tables and');
	writelog('chairs are scattered across the room. You smile as');
	writelog('the well-rounded Violet brushes by you....');
	writelog('');
	writelog('(C)onverse with the patrons (D)aily News');

	if (sex == 0)
	{
		writelog('(F)lirt with Violet         (T)alk to the Bartender');
		writelog('(G)et a Room                (V)iew Your Stats');
		writelog('(H)ear Seth Able The Bard   (M)ake Announcement');
		writelog('(R)eturn to Town');
		writelog('');
		display_your_command();
	}
	else
	{
		writelog('(T)alk to the Bartender     (G)et a Room');
		writelog('(V)iew Your Stats           (H)ear Seth Able The Bard');
		writelog('(M)ake Announcement         (R)eturn to Town');
		writelog('');
		display_your_command();
	}
}

function menu_forest_event()
{
	// forest events do not use up forest fights
	inc_player_value(player, 'fights', 1, MAX_VALUE);

	writelog('  Event In The Forest');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('  While trekking through the forest, you come upon a small hut.');
	writelog('');
	writelog('  (K)nock On The Door');
	writelog('  (B)ang On The Door');
	writelog('  (L)eave It Be');
	writelog('');
	display_your_command();
}

function menu_forest_sack()
{
	// forest events do not use up forest fights
	inc_player_value(player, 'fights', 1, MAX_VALUE);
	
	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) lvl = 1;

	let r = (getRandomInt(500)+250) * (lvl * lvl);
	inc_player_value(player, 'gold', r, MAX_VALUE);

	writelog('  Event In The Forest');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('  You find a sack with '+r+' gold in it!');
	writelog('');
	writelog('<MORE>');
}

function menu_bank()
{
	let g = get_player_value(player, 'gold');
	if (player_value_not_found == 1) { g = 0; }

	let b = get_player_value(player, 'bank');
	if (player_value_not_found == 1) { b = 0; }
	
	writelog('  Legend of the Red Dragon - Bank');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog(' A polite clerk approaches. "Can I help you sir?"');
	writelog('');
	writelog('(D)eposit Gold');
	writelog('(W)ithdraw Gold');
	writelog('(T)ransfer Gold');
	writelog('(R)eturn to Town');
	writelog('');
	writelog('Gold In Hand: '+g+'  Gold In Bank: '+b);
	writelog('');
	display_your_command();
}

function menu_withdraw()
{
	let g = get_player_value(player, 'gold');
	if (player_value_not_found == 1) { g = 0; }

	let b = get_player_value(player, 'bank');
	if (player_value_not_found == 1) { b = 0; }

	writelog('  Ye Olde Bank');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('Gold In Hand: '+g+'  Gold In Bank: '+b);
	writelog('');
	writelog('"How much gold to withdraw?" (1 for ALL of it)');
	writelog('');
	writelog('AMOUNT: ');
	writelog('');
}

function menu_deposit()
{
	let g = get_player_value(player, 'gold');
	if (player_value_not_found == 1) { g = 0; }

	let b = get_player_value(player, 'bank');
	if (player_value_not_found == 1) { b = 0; }

	writelog('  Ye Olde Bank');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('Gold In Hand: '+g+'  Gold In Bank: '+b);
	writelog('');
	writelog('"How much gold to deposit?" (1 for ALL of it)');
	writelog('');
	writelog('AMOUNT: ');
	writelog('');
}

function menu_transfer()
{
	writelog('  Ye Olde Bank');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('');
	writelog('  Transfers Not Yet Implemented');
}

function menu_mail()
{
	writelog('Mail');
}

function menu_conj()
{
	writelog('** CONJUGALITY LIST **')
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('');
	
	let count = 0;
	let checked = [];
	for(let i=0; i < players.length; i++)
	{
		if (players[i].marriedto != '')
		{
			if (findArray(checked, players[i].name) == -1 &&
				findArray(checked, players[i].marriedto) == -1)
			{
				writelog(players[i].name + '`% is married to ' + players[i].marriedto);
				count++;
				
				checked.push(players[i].marriedto);
				checked.push(players[i].name);
			}
		}
	}
	
	if (count == 0)
	{
		writelog('No one is married in this realm.');
	}
	
	writelog('');
	writelog('<MORE>');
}

function menu_charm_gain_event()
{
	let f = get_player_value(player, 'fights');
	if (player_value_not_found == 1) { f = 0; }
	
	if (getRandomInt(100) > 90)
	{
		if (getRandomInt(100) > 70)
		{
			current = menu_charm_loss_event;
			draw_menu(1);
		}
		else
		{
			current = menu_charm_pretty_event;
			draw_menu(1);
		}
	}
	else if (f > 0)
	{
		// forest events do not use up forest fights
		inc_player_value(player, 'fights', 1, MAX_VALUE);

		writelog('Event In The Forest')
		writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
		writelog('You come across an old man. He seems confused and');
		writelog('asks if you would direct him to the Inn. You know');
		writelog('that if you do, you will lose time for one fight');
		writelog('today.');
		writelog('');
		writelog('Do you take the old man? [Y] :');
		writelog('');
	}
	else // added this b/c i'm not sure how to handle having no fights for the event
	{
		// forest events do not use up forest fights
		inc_player_value(player, 'fights', 1, MAX_VALUE);
		
		writelog('Event In The Forest')
		writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
		writelog('');
		writelog('You find an empty clearing.');
		writelog('There is nothing to see here.');
		writelog('');
		writelog('<MORE>');
	}
}

function menu_charm_gain_event_yes()
{
	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) { lvl = 0; }
	
	let gain_gold = 500 * lvl;
	inc_player_value(player, 'gold', gain_gold, MAX_VALUE);
	inc_player_value(player, 'charm', 1, MAX_VALUE);
	
	writelog('You take the old man to the Inn, he is pleased with');
	writelog('you, and gives you '+gain_gold+' gold!');
	writelog('');
	writelog('**CHARM GOES UP BY 1**');
	writelog('');
	writelog('<MORE>');
}

function menu_charm_gain_event_no()
{
	writelog('He grimaces as you walk away.');
	writelog('');
	writelog('<MORE>');
}

function menu_charm_loss_event()
{
	// forest events do not use up forest fights
	inc_player_value(player, 'fights', 1, MAX_VALUE);

	writelog('** MEGA EVENT IN THE FOREST **')
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You are whacked with an ugly stick by the old man!');
	writelog('');
	writelog('He giggles and runs away!');
	writelog('');
	writelog('You lose 1 CHARM!');
	writelog('');
	writelog('<MORE>');
	
	dec_player_value(player, 'charm', 1, 0);
}

function menu_charm_pretty_event()
{
	// forest events do not use up forest fights
	inc_player_value(player, 'fights', 1, MAX_VALUE);

	writelog('** MEGA EVENT IN THE FOREST **')
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You are whacked with an pretty stick by the old man!');
	writelog('');
	writelog('He giggles and runs away!');
	writelog('');
	writelog('YOU GET 5 CHARM!');
	writelog('');
	writelog('<MORE>');
	
	inc_player_value(player, 'charm', 5, MAX_VALUE);
}

function menu_fairy1()
{
	// forest events do not use up forest fights
	inc_player_value(player, 'fights', 1, MAX_VALUE);

	writelog("                      ....                         ");
	writelog("         .     ..........''....   ........         ");
	writelog("       ...........        ..  ......     ..        ");
	writelog("      .. .          Extra Special Event!  ..       ");
	writelog("      ....         -═-═-═-═--═-═-═-═--═-   ..      ");
	writelog("      ... Your journey is interrupted by  ....     ");
	writelog("   ... ..the sound of tiny voices. It seems.. .    ");
	writelog(" ';. ....you've come across a group of     ..  ..'c");
	writelog(".od;'..''. fairies bathing ..              ..  .'ok");
	writelog(".lo;'':ol'.                . .             .. ...cx");
	writelog(" .''.';cl:'.         ....... .            ..  ..';:");
	writelog("      .''.     ......',;co:..             ..  ':;c:");
	writelog("        ...........',:lxdc,...    ....   ...  .;;od");
	writelog("         ..       .,cl:,.    ......  .....     .,lc");
	writelog("                   ,:.                          ...");
}

function menu_fairy2()
{
	writelog('YOU ARE NOTICED!')
	writelog('');
	writelog('The small things encircle you. A small wet female');
	writelog('bangs your shin. "How dare you spy on us, human!"');
	writelog('you can\'t help but smile, the defiance in her');
	writelog('silvery voice is truly a sight, you think to');
	writelog('yourself. Further contemplation is interrupted by');
	writelog('another sharpfully painful prod.');
	writelog('');
	writelog('(A)sk for a blessing');
	writelog('(T)ry to catch one to show your friends');
	writelog('');
	writelog('Your choice? [A] :');
}

function menu_fairy3()
{
	writelog('');
	writelog('The faeries escape!');
	writelog('');
}

function menu_ride_horse()
{
	writelog('');
	writelog('You nudge your horse deeper into the woods.');
	writelog('');
	writelog('`% Event In The Forest');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog(' In the gloom of the shady forest, you see');
	writelog('smoke coming from a bright chimney.');
}

function menu_fairy_blessing()
{
	writelog('"Bless me!" you implore the small figure.');
	writelog('');
	writelog('"Very well." she agrees. "But we\'re still ');
	
	let r = getRandomInt(100);
	if (r < 20) // gems
	{
		let gems_caught = getRandomInt(2)+1;
		
		let g = inc_player_value(player, 'gems', gems_caught, MAX_VALUE);
		if (player_value_not_found == 1) { g = 0; }

		writelog('angry at you! Your blessing is...an incredibly');
		writelog('sad story!" The small body beckons you to');
		writelog('lift her. As you bring her closer, she beings');
		writelog('to whisper. You almost immediately begin to cry.');
		writelog('');
		writelog('YOUR TEARS TURNS INTO GEMS AND FALL INTO YOUR HANDS!');
		writelog('');
		writelog('You caught '+gems_caught+' gems! Total: '+g);
		writelog('');
		writelog('<MORE>');
	}
	else if (r < 30) // horse
	{
		let h = get_player_value(player, 'horse');
		if (player_value_not_found == 1) { h = 0; }
		
		if (h == HORSE_NONE) // no horse?
		{
			writelog('angry at you! Your blessing is...a companion!');
			writelog('');
			
			if (getRandomInt(100) >= 50) // white horse
			{
				set_player_value(player, 'horse', HORSE_WHITE);
				writelog('A pure white mare nudges your back!');
				writelog('');
			}
			else // black stallion
			{
				set_player_value(player, 'horse', HORSE_BLACK);
				writelog('A shiny black stallion surfaces its head in the lake!');
				writelog('');
			}
			
			writelog('YOU FEEL THE DAY GROW LONGER');
			writelog('');
			writelog('<MORE>');
			
			let fights_per_day = FOREST_FIGHTS_PER_DAY;
			let kids = get_player_value(player, 'kids');
			if (player_value_not_found == 1) kids = 0;
			fights_per_day += kids;
			
			let give_fights = parseInt(fights_per_day * 0.25);
			inc_player_value(player, 'fights', give_fights, MAX_VALUE);
		}
		else // has horse
		{
			writelog('angry at you! Oh nevermind, you already have a horse.');
			writelog('');
			writelog('<MORE>');
		}
	}
	else if (r < 50)
	{
		let lvl = get_player_value(player, 'level');
		if (player_value_not_found == 1) { lvl = 0; }
		
		let earn_xp = lvl * lvl * 10;
		writelog('angry at you! Your blessing is...Fairy Lore!');
		writelog('You earned '+earn_xp+' experience points.');
		writelog('');

		inc_player_value(player, 'xp', earn_xp, MAX_XP);
	}
	else
	{
		writelog('angry at you!');
		writelog('');
		writelog('Your blessing is...a kiss from Teesha!');
		writelog('');
		writelog('A fairy near her wordlessly upstretches its arms');
		writelog('to you.');
		writelog('');
		writelog('THE KISS IS STRANGELY FULFILLING! (You\'re refreshed)');
		writelog('');
		
		let mh = get_player_value(player, 'maxhp');
		if (player_value_not_found == 1) { mh = 0; }
		
		set_player_value(player, 'hp', mh);
	}
}

function menu_fairy_catch()
{
	writelog('');
	if (getRandomInt(100) >= 50)
	{
		writelog('YOU MAKE A WILD GRAB FOR THE SMALL FIGURES!');
		writelog('');
		writelog('Your hand finally connects with.... A FAIRY!');
		writelog('');
		writelog('You throw the screaming creature into your pouch. What hidden');
		writelog('powers could it have?');
		writelog('');
		writelog('You think now would be splendid time to leave.');
		
		inc_player_value(player, 'fairies', 1, MAX_VALUE);
	}
	else
	{
		writelog('YOU MAKE A WILD GRAB FOR THE SMALL FIGURES!');
		writelog('');
		writelog('Your hand finally connects with.... NOTHING!');
	}
	writelog('');
}

function menu_forest_scroll()
{
	// forest events do not use up forest fights
	inc_player_value(player, 'fights', 1, MAX_VALUE);

	writelog('                  FOREST EVENT')
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You stumble... Another dead bird with a scroll.');
	writelog('The scroll reads:');
	writelog('I am to wed one against my will. My father tells me');
	writelog('I am selfish, because this political marriage will');
	writelog('bring peace. Get me out of here, -a prisoner of war');
	writelog('');
	writelog('You quickly swipe a tear from your eye as you put');
	writelog('down the note.');
	writelog('');
	writelog('(S)ave her');
	writelog('(I)gnore the girl');
	writelog('');
	writelog('Well? [S] : ');
}

function menu_scroll_save()
{
	writelog('');
	writelog('You\'re quite a hero. Unfortunately, the girl seems');
	writelog('to have forgotten the return address. You\'ll have');
	writelog('to guess.');
	writelog('');
	writelog('(C)astle Coldrake');
	writelog('(F)ortress Liddux');
	writelog('(G)annon Keep');
	writelog('(P)enyon Manor');
	writelog('(D)ema\'s Lair');
	writelog('');
	writelog('Where do we go now?');
}

function menu_save_at()
{
	let f = findData(save_dest, save_target_dest);
	save_target_dest = '';
	
	if (f != -1)
	{
		current_save_girl_firstpage = save_girl_firstpage;
		
		let r = 0;
		// this is for when you meet the headless woman
		if (save_girl_location != -1) { r = save_girl_location; }
		// if we didnt meet her then just randomize it
		else { r = getRandomInt(save_dest.length); }

		save_girl_location = -1; // reset for the next headless encounter
		
		let fr = parseInt(f / 2);
		if (fr == r) { save_success = 1; }
		else { save_success = 0; }
		
		current=menu_save_girl_event;
		draw_menu(1);
	}
}

function multi_page_display(data, page, firstpage)
{
	if (page == 0 && firstpage != '')
	{
		for(let i=0; i < firstpage.length; i++)
		{ writelog(firstpage[i]); }
		return 1;
	}
	
	if (firstpage != '') { page=page-1; }
	
	let total_pages = data.length / 18;
	
	if (page > total_pages) { return 0; }

	let line_start = page * 18;
	let line_end   = line_start + 18;

	for(let i=line_start; i < line_end && i < data.length; i++)
	{
		writelog(String.format(''+data[i], save_girl_xp, save_girl_gems));
	}

	writelog('<MORE>');
	return 1;
}

function menu_save_girl_pager()
{
	if (0 == multi_page_display(current_save_girl_data, current_save_girl_page, current_save_girl_firstpage))
	{
		current=menu_forest;
		draw_menu(1);
	}
	else { current_save_girl_page++; }
}

function menu_save_girl_event()
{
	if (save_success == 0)
	{
		let h = get_player_value(player, 'hp');
		if (player_value_not_found == 1) { h = 0; }
	
		let mh = get_player_value(player, 'maxhp');
		if (player_value_not_found == 1) { mh = 0; }
	
		let index = getRandomInt(fail_save_girl.length);
		current_save_girl_page = 0;
		current_save_girl_data = fail_save_girl[index];
		
		// NOTE: Not sure if this is the right math, eyeballed it.
		let hp_loss = parseInt(0.25 * mh);
		
		if (h > hp_loss && hp_loss != 0)
		{
			set_player_value(player, 'hp', hp_loss);
		}
		else
		{
			h = parseInt(h / 2);
			if (h == 0) { set_player_value(player, 'hp', 1); }
		}
	}
	else
	{
		let index = getRandomInt(ok_save_girl.length);
		current_save_girl_page = 0;
		current_save_girl_data = ok_save_girl[index];
		
		let lvl = get_player_value(player, 'level');
		if (player_value_not_found == 1) lvl = 1;
		
		save_girl_xp   = 20 * lvl;
		save_girl_gems = 3 * lvl;
		inc_player_value(player, 'xp', save_girl_xp, MAX_VALUE);
		inc_player_value(player, 'gems', save_girl_gems, MAX_VALUE);
	}
	
	current=menu_save_girl_pager;
	draw_menu(1);
}

function rob_bank()
{
	let f = get_player_value(player, 'fairies');
	if (player_value_not_found == 1) { f = 0; }

	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) { lvl = 0; }
	
	if (f > 0)
	{
		let steal_index = (lvl - 1) * 2;
		let min_stolen = steal_table[steal_index];
		let max_stolen = steal_table[steal_index+1];
		let stolen = getRandomInt(max_stolen - min_stolen) + min_stolen;
		
		set_player_value(player, 'fairies', 0);
		let g = inc_player_value(player, 'gold', stolen, MAX_VALUE);

		writelog('');
		writelog('The fairy escapes from your pocket and she unlocks');
		writelog('the bank door for you.');
		writelog('');
		writelog('You manage to make off with '+stolen+' gold.');
		writelog('Total gold: '+g);
		writelog('');
		writelog('The fairy escapes...');
		writelog('');
		writelog('<MORE>');
	}
}

function formatAMPM(date)
{
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function menu_people()
{
	if (player_arrival == '') { player_arrival = formatAMPM(new Date()); }
	
	let extra_chars = 0;
	for(let j=0; j < player.length; j++) { if (player[j] == '`') { extra_chars+=2; } }
	
	writelog('`%           Warriors In The Realm Now');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('`0 '+padEnd(16+extra_chars-1, player.trim(), ' ')+'`2 Arrived At    `%'+player_arrival);
	writelog('');
	display_your_command();
}

function menu_message()
{
	writelog('Announcement');
}

function skill_type(v)
{
	let sk = get_player_value(player, v);
	if (player_value_not_found == 1) sk = -1;
	switch (sk)
	{
		case 0: return "Death Knight";
		case 1: return "Mystical";
		case 2: return "Thief";
	}
	return '';
}

function stringify(obj)
{
	//check if the type of object is undefined or a function
	if (typeof(obj) === 'undefined' || typeof(obj) === 'function')
	{
		//if yes return undefined
		return undefined;
	}

	//check if the type of object is a string
	if(typeof(obj) === 'string')
	{
		//if its true return the stringified object 
		return '"' + obj + '"';
	}

	//checks if the input obj is a array/nest array
	if(Array.isArray(obj))
	{
		//if true create a new array variable that is equal to an empty array
		var newArray = [];
		//iterate through each key in the object.
		for(var i = 0; i < obj.length; i++) {
			//if the element at a given index is undefined or a function 
			if(obj[i] === undefined || typeof(obj[i]) === 'function')
			{
				//recursion: invoke the stringify function on null and push the result into the new array
				newArray.push(stringify(null));
			}
			else
			{
				//recursion: invoke the stringify function on the value at the given index
				//and push the result into the new array
				newArray.push(stringify(obj[i]));	
			}
		}
		//return the concatenation of the  new array with quoted brackets on each side.  
		return '[' + newArray.join(',') + ']';
	}

	//checks if the input obj is an object literal and if it is defined 
	if(obj && typeof(obj) === 'object')
	{
		//if true, create a new array variable that is equal to an empty array
		var newObjArray = [];
		//iterate through each key in the object.
		for(var key in obj)
		{
			//if the obj[key] is NOT equal to undefined or the typeof obj[key] is NOT function
			if(obj[key] !== undefined || typeof(obj[key]) !== 'function')
			{
				//recursion: invoke the stringify function on the key and the value and 
				//push formatted property into the new array
				newObjArray.push(stringify(key) + ":" + stringify(obj[key]));
			}
		}
		//return the concatenation of the new array with quoted curly braces on each side. 
		return "{" + newObjArray.join(',') + "}";
	}
	//will take care of any other edge cases such as numbers and null 
	return obj + "";
};

function add_mail(from,to,title,msg)
{
	mailbox.push(to);
	mailbox.push(from);
	mailbox.push(title);
	mailbox.push(msg);
}

function read_mail()
{
	for(let i=0; i < mailbox.length; i++)
	{
		if (mailbox[i] == player)
		{
			clearlog();
			writelog('Mail');
			writelog('----');
			writelog('From   : ' + mailbox[i+1]);
			writelog('Title  : ' + mailbox[i+2]);
			drawTextWrapped(''+mailbox[i+3], 16, 0, 4, 54);
		}
	}
}

function split_save_data(s)
{
	let arr = s.split('|');
	players = JSON.parse(arr[0]);
	inn_new_convo = JSON.parse(arr[1]);
	dark_new_convo = JSON.parse(arr[2]);
	mailbox = JSON.parse(arr[3]);
	//We purposely do not save the last username because we want to use default each time
	//the bbs connects because you never know who is going to connect to your bbs.
	//player = JSON.parse(arr[4]);
	return arr;
}

function save_data()
{


		let data = stringify(players)        + "|" +
				   stringify(inn_new_convo)  + '|' +
				   stringify(dark_new_convo) + '|' +
				   stringify(mailbox)        + '|' +
				   stringify(player);
		//saveData(data);
	
}

function set_player_defaults()
{
	players = JSON.parse(JSON.stringify(default_players));
}

function load_savedata()
{

	
		let s = loadData();
		if (s == '') return 0;
		let datum = split_save_data(s);
		players = JSON.parse(datum[0]);
		inn_new_convo = JSON.parse(datum[1]);
		dark_new_convo = JSON.parse(datum[2]);
		mailbox = JSON.parse(datum[3]);
		player = JSON.parse(datum[4]);
	
	
	if (players.length > 0) writelog('Loading Players..');
	if (inn_new_convo.length > 0) writelog('Inn..');
	if (dark_new_convo.length > 0) writelog('Dark Cloak Tavern..');
	if (mailbox.length > 0) writelog('Mailbox..');
	return 1;
}

function load_data()
{
	clearlog();
	
	let hasdata = load_savedata();
	if (reset_everything == 1) { hasdata=0; writelog('Resetting save data...'); }
	
	if (!hasdata)
	{
		set_player_defaults();
		save_data();
		hasdata = load_savedata();
		writelog('Reloading defaults...');
	}
	
	// todo; mocking news for now, until day change code implemented.
	current_news = ['`4Several farmers report missing cattle today.'];
	
	current = show_enter_screen;
	draw_menu(1);
}

function perform_draw_banner()
{
	for(let i=0; i < banner.length; i++) writelog(banner[i]);
	writelog('<MORE>');
}

function padEnd(pad_length, s, delim)
{
	let ln = Math.abs(pad_length - s.length);
	return s + new Array(ln).join(delim);
}

function padStart(pad_length, s, delim)
{
	let ln = Math.abs(pad_length - s.length);
	return new Array(ln).join(delim) + s;
}

function write_append(s1, l1, s2, l2, s3)
{
	writelog(padEnd(l1, s1, ' ') + padEnd(l2, s2, ' ') + s3);
}

function menu_stats()
{
	let x = get_player_value(player, 'xp');
	if (player_value_not_found == 1) x = 0;

	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) lvl = 0;

	let f = get_player_value(player, 'fights');
	if (player_value_not_found == 1) f = 0;
	
	let gd = get_player_value(player, 'gold');
	if (player_value_not_found == 1) gd = 0;

	let w = get_player_value(player, 'weapon');
	if (player_value_not_found == 1) w = '';
	if (w == '') w='Fists';

	let a = get_player_value(player, 'armor');
	if (player_value_not_found == 1) a = '';
	if (a == '') a='Nothing';

	let c = get_player_value(player, 'charm');
	if (player_value_not_found == 1) c = 0;

	let h = get_player_value(player, 'hp');
	if (player_value_not_found == 1) h = 0;

	let mh = get_player_value(player, 'maxhp');
	if (player_value_not_found == 1) mh = 0;

	let pf = get_player_value(player, 'pfights');
	if (player_value_not_found == 1) pf = 0;

	let b = get_player_value(player, 'bank');
	if (player_value_not_found == 1) b = 0;

	let st = get_player_value(player, 'str');
	if (player_value_not_found == 1) st = 0;

	let df = get_player_value(player, 'def');
	if (player_value_not_found == 1) df = 0;

	let g = get_player_value(player, 'gems');
	if (player_value_not_found == 1) g = 0;

	let fr = get_player_value(player, 'fairies');
	if (player_value_not_found == 1) fr = 0;
	
	let hh = get_player_value(player, 'horse');
	if (player_value_not_found == 1) hh = 0;
	
	writelog(player+'\'s`% Stats...');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('Experience   : ' + x);
	write_append('Level        : ' + lvl,   32, ' HitPoints   : '+'('+h+' of '+mh+')', 0, '');
	write_append('Forest Fights: ' + f,     32, ' PlayerFights: '+pf, 0, '');
	write_append('Gold In Hand : ' + gd,    32, ' Gold In Bank: '+b, 0, '');
	write_append('Weapon       : ' + w, 	32, ' Atk Strength: '+st, 0, '');
	write_append('Armour       : ' + a,  	32, ' Def Strength: '+df, 0, '');
	write_append('Charm        : ' + c,     32, ' Gems        : '+g, 0, '');
	
	if (fr > 0) { writelog(''); writelog('You have a fairy in your pocket.'); }
	
	writelog('');
	if (hh > 0) { writelog('You are on horseback.'); }

	let d  = get_player_value(player, 'classd');
	let ud = get_player_value(player, 'usesd');
	let m  = get_player_value(player, 'classm');
	let um = get_player_value(player, 'usesm');
	let t  = get_player_value(player, 'classt');
	let ut = get_player_value(player, 'usest');
	
	if (d > 0)
	{
		let skills = 'NONE';
		if (d > 1) skills = ''+d;
		writelog('Death Knight Skills: '+padEnd(9, skills, ' ')+'\t\t\tUses Today: ('+ud+')');
	}
	if (m > 0)
	{
		let skills = 'NONE';
		if (m > 1) skills = ''+m;
		writelog('The Mystical Skills: '+padEnd(9, skills, ' ')+'\t\t\tUses Today: ('+um+')');
	}
	if (t > 0)
	{
		let skills = 'NONE';
		if (t > 1) skills = ''+t;
		writelog('The Thieving Skills: '+padEnd(9, skills, ' ')+'\t\t\tUses Today: ('+ut+')');
	}
	
	writelog('');
	writelog('You are currently interested in '+skill_type('class')+' skills.');
	writelog('');
	//display_your_command();
}

function menu_training()
{
	writelog('  Turgons Warrior Training');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You enter the mighty Training Center. Hundreds of');
	writelog('warriors, young, as well as old, are sparring.');
	writelog('Every few seconds you hear someone shriek in pain.');
	writelog('Obviously some novice who let his guard down.');
	writelog('');
	writelog('(Q)uestion Master');
	writelog('(A)ttack Master');
	writelog('(V)isit The Hall Of Honor');
	writelog('(R)eturn to Town');
	writelog('');
	writelog('Your master is '+master);
	writelog('');
	//display_your_command
}

function menu_training_question()
{
	let needed = get_xpneeded();
	
	writelog('  Questioning Your Master');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	//writelog('');
	//writelog('');
	//writelog('');
	//writelog('');
	//writelog('');
	//writelog('');
	//writelog('');
	//writelog('');
	writelog('');
	writelog(master+' looks at you carefully.');
	writelog('');

	let x = get_player_value(player, 'xp');
	if (player_value_not_found == 1) { x = 0; }
	
	if (x < needed)
	{
		writelog('"You need '+(needed - x)+' more experience before');
		writelog(' you will be as good as I am."');
	}
	else
	{
		writelog('"Gee, your muscles are getting bigger than mine..."');
	}
	
	writelog('');
	writelog('Your master is '+master);
	writelog('');
	writelog(master_greets[masters.indexOf(master)]);
	writelog('');
	writelog('');

	
	//drawTextWrapped(master_greet, 16, 0, 2, 54);
}

function master_swing()
{
	inflict_damage_player(master_str);
	
	if (damage <= 0)
	{
		writelog(master+' has missed!');
	}
	else
	{
		writelog(master+' attacked w/ '+master_weapon+' for '+damage);
		
		let h = get_player_value(player, 'hp');
		if (player_value_not_found == 1) { h = 0; }
		
		if (h > 0) menu_use_death_crystal(master);
		else if (h <= 0)
		{
			let mh = get_player_value(player, 'maxhp');
			if (player_value_not_found == 1) { mh = 0; }
			
			set_player_value(player, 'hp', mh);
			
			writelog(master+' does not finish you off.'); //<-- todo: rewrite this
			master_handled=1;
			//return;
			display_your_command();
		}
	}
}

function master_battle()
{
	let h = get_player_value(player, 'hp');
	if (player_value_not_found == 1) h = 0;

	writelog('');
	writelog('Your Hitpoints : '+h);
	writelog(master+'\'s Hitpoints : '+master_hp);
	writelog('');
	writelog('(A)ttack');
	writelog('(S)tats');
	writelog('(R)un');
	writelog('');
	menu_skill_type();
	writelog('');
	//display_your_command
}

function bested_master()
{
	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) lvl = 0;
	
	writelog('');
	writelog('You have bested '+master+'!');
	writelog('');
	writelog(master_beaten[lvl-1]);

	if (lvl < 12) { lvl = inc_player_value(player, 'level', 1, MAX_VALUE); }
	skill_level++;

	let can_raise_use = 0;

	training_needed--;
	if (training_needed <= 0) { can_raise_use=1; training_needed=3; }
	
	// todo; calc this per level
	let new_hp = 15;
	let new_str = 7;
	let new_def = 3;
	
	writelog('You receive '+new_hp+' hp, '+new_str+' strength and '+new_def+' defense points!');
	writelog('');
	writelog('YOU ARE NOW LEVEL '+lvl+'.');
	writelog('');
	writelog('** YOUR CLASS SKILL IS RAISED BY ONE **');
	writelog('');

	if (can_raise_use == 0)
	{
		writelog('You need '+training_needed+' more lesson to raise '+skill_type('class')+' Uses');
		writelog('');
	}
	else
	{
		let u = 0;
		let c = get_player_value(player, 'class');
		if (player_value_not_found == 1) c = 0;
		if (c == 0) u = inc_player_value(player, 'usesd', 1, MAX_VALUE);
		else if (c == 1) u = inc_player_value(player, 'usesm', 1, MAX_VALUE);
		else if (c == 2) u = inc_player_value(player, 'usest', 1, MAX_VALUE);
		
		writelog('You now have '+u+' '+skill_type('class')+' Skill points a day.');
		writelog('');
		writelog('Need '+training_needed+' lessons to learn a new '+skill_type('class')+ ' Skill');
	}

	master = masters[lvl-1];

	writelog('Your new master is '+master);
	writelog('');
	//writelog('<MORE>');

	set_player_value(player, 'pfights', 2);
	
	let h = inc_player_value(player, 'maxhp', new_hp, MAX_VALUE);
	set_player_value(player, 'hp', h);

	inc_player_value(player, 'str', new_str, MAX_VALUE);
	inc_player_value(player, 'def', new_def, MAX_VALUE);
	
	set_player_value(player, 'masterseen', 1);

	current  = menu_main;
	draw_menu(0);
	display_your_command();
}

function master_attackedby()
{
	let s = get_player_value(player, 'str');
	if (player_value_not_found == 1) s = 0;
	
	if (getRandomInt(100) >= 90)
	{
		// note: i'm just guessing at what the calculation for damage is...
		let r = getRandomFloat(1.5, 5.5, 2);
		damage = parseInt(s * r);
		damage += parseInt(get_weapon_attack() * r);
		
		writelog('**POWER MOVE**');
		writelog('');
		writelog('You hit '+master+' for '+damage+' damage!');
		
		master_hp -= damage;

		if (master_hp <= 0)
		{
			writelog('You blew your master away!');
			writelog('');
			writelog('You find a Gem!');
			inc_player_value(player, 'gems', 1, MAX_VALUE);
			bested_master();
			master_handled=1;
		}
		return;
	}
	
	damage = getRandomInt(s);
	damage += parseInt(get_weapon_attack());
	
	if (damage == 0)
	{
		writelog('You missed!');
	}
	else
	{
		master_hp -= damage;
		writelog('You hit '+master+' for '+damage+' damage!');
	}
	
	if (master_hp <= 0)
	{
		bested_master();
		master_handled=1;
	}
	else
	{
		inflict_damage_player(master_str);
		
		if (damage > 0)
		{
			writelog('* '+master+' hits w/ '+master_weapon+' for '+damage);
		}
		else
		{
			writelog('* '+master+' misses you Completely! **');
		}
		
		let h = get_player_value(player, 'hp');
		if (player_value_not_found == 1) h = 0;

		if (h <= 0)
		{
			died_by();
			writelog('You have been defeated by '+master);
			writelog('');
			writelog(master+' raises his '+master_weapon+' to kill you!');
			writelog('');
			writelog('At the last minute, he reaches down and helps you up.');
			writelog('Don\'t be discouraged. I have healed you.');
			writelog('');
			writelog('Your master is '+master+'.');
			writelog('');
			//writelog('<MORE>');
			
			let mh = get_player_value(player, 'maxhp');
			if (player_value_not_found == 1) mh = 0;
			
			set_player_value(player, 'hp', mh);
			
			master_handled=1;
			return;	
			
		} 
		
			h = get_player_value(player, 'hp');
			if (player_value_not_found == 1) h = 0;
		
			writelog('');
			writelog('Your Hitpoints : '+h);
			writelog(master+'\'s Hitpoints : '+master_hp);
			writelog('');
			writelog('(A)ttack');
			writelog('(S)tats');
			writelog('(R)un');
			writelog('');
			menu_skill_type();
			writelog('');
			display_your_command()
			writelog('');
		
	}
}

function menu_skill_type()
{
	let type = skill_type('class');
	let type_str = '';
	let u = 0;
	
	if (type == 'Death Knight')
	{
		u = get_player_value(player, 'usesd');
		if (player_value_not_found == 1) u = 0;
		type_str = '(D)eath Knight';
	}
	else if (type == 'Mystical')
	{
		u = get_player_value(player, 'usesm');
		if (player_value_not_found == 1) u = 0;
		type_str = '(M)ystical';
	}
	else if (type == 'Thief')
	{
		u = get_player_value(player, 'usest');
		if (player_value_not_found == 1) u = 0;
		type_str = '(T)hief';
	}

	writelog(type_str+' Skills ('+u+')');
}

function menu_training_fight()
{
	if (master_handled == 1)
	{
		current = menu_main;
		draw_menu(1);
		return;
	}
	
	let w = get_player_value(player, 'weapon');
	if (player_value_not_found == 1) { w = 0; }
	
	writelog('  Fighting Your Master');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You enter the arena with your '+w);
	writelog('');
	writelog('When your name is called, you move to the proper');
	writelog('position and take a fighting stance against master.');
	writelog('');
	writelog('**MASTER FIGHT**');
	writelog('You have encountered '+master+'!!');
	writelog('');
	
	if (getRandomInt(100) >= 70)
	{
		writelog('Your skill allows you to get the first strike.');
	}
	else
	{
		writelog(master+' has surprised you!');
		master_swing();
	}
	
	master_battle();
}

function get_class_letter(c)
{
	if (c == 0) return 'D';
	else if (c == 1) return 'M';
	else if (c == 2) return 'T';
	return ' ';
}

function menu_list()
{
	writelog('    Legend Of The Red Dragon - Player Rankings');
	writelog('');
	writelog('    Name          XP         Level  Mastered  Status');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	
	for(let i=0; i < players.length; i++)
	{
		let xp = players[i].xp;
		let lvl = players[i].level;
		let d = players[i].dead;
		
		let ds = '`%Alive';
		if (d == 1) ds = '`4Dead';
		
		let class_letter = get_class_letter(players[i].class);
		let classes = '';
		switch (class_letter)
		{
			case 'D': classes = '`0'; break;
			case 'M': classes = '`5'; break;
			case 'T': classes = '`9'; break;
		}
		classes += class_letter;
		
		let sex_string = ' ';
		let sex = players[i].sex;
		if (sex == 1) sex_string = '`#F';
		
		let mastered = '';
		let master1 = players[i].mastered;
		let master2 = players[i].mastered2;
		let master3 = players[i].mastered3;
		mastered += get_class_letter(master3)+' ';
		mastered += get_class_letter(master2)+' ';
		mastered += get_class_letter(master1)+' ';
		
		if (players[i].name != undefined && players[i].name != '')
		{
			let name = players[i].name;
			if (name.length > 14) name = name.substring(0, 14);
			
			let xps='';
			if (xp > 999) { xp = parseInt(xp/1000); xps = ''+xp+'K'; }
			else xps = ''+xp;

			let extra_chars = 0;
			for(let j=0; j < name.length; j++) { if (name[j] == '`') { extra_chars+=2; } }

			let is_on = '@On@';
			if (players[i].name != player) is_on = '';

			writelog(sex_string + ' ' + classes + ' `2' +
					 padEnd(16 + extra_chars-1, players[i].name.trim(), ' ') + ' ' +
					 padEnd(14, '`2'+xps, ' ') + ' ' +
					 padEnd(10, '`%'+lvl, ' ') + ' ' +
					 padEnd(7,  '`%'+mastered, ' ') + ' ' +
					 ds + is_on);
		}
	}
	writelog('');
	display_your_command();	
}

function menu_news()
{
	writelog('  The Daily Happenings....');
	writelog('`0-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	
	if (current_news.length == 0)
	{
		writelog(' No news today...');
	}
	else
	{
		for(let i=0; i < current_news.length; i++)
		{
			let lines = current_news[i].split('\n');

			for(let j=0; j < lines.length; j++)
			{
				writelog(' ' + lines[j]);
			}

			writelog('                      `2-`0═`2-`0═`2-`0═`2-');
		}
	}

	writelog('`0-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('');
	writelog('');
	writelog('');
}

function menu_other()
{
	writelog('`%  Other Options');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');

	if (other_menu_index < 0) other_menu_index=0;

	for(let i=other_menu_index; i < igms.length && i < other_menu_index+OTHER_MENU_SIZE; i+=2)
	{
		let s = '`1';
		if (findArray(enabled_igms, i) != -1) s = '`%';
		
		s += ''+padStart(3, ''+(i+1), ' ')+'. '+padEnd(20, igms[i], ' ');
		
		if (findArray(enabled_igms, i+1) != -1) s += '`%';
		else s += '`1';

		if (i+1 < igms.length)
		{
			s += ''+padStart(3, ''+(i+2), ' ')+'. '+igms[i+1];
		}
		
		writelog(s);
	}
	
	let menumsg = ',N═Next';
	let menudef = 'N';
	
	other_menu_index += OTHER_MENU_SIZE;
	
	if (other_menu_index > igms.length)
	{
		menumsg = ',B═Back';
		menudef = 'Q';
	}
	else if (other_menu_index > OTHER_MENU_SIZE)
	{
		menumsg = ',B═Back,N═Next';
	}
	
	writelog('');
	writelog('Your pleasure? [`01-'+igms.length+menumsg+',Q`2] (`0? menu`2) ['+menudef+'] : ');
}

function menu_dragon_fight()
{
	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) lvl = 0;
	
	if (lvl != 12 || dragon_visited == 1) return;
	
	dragon_visited=1;

	if (getRandomInt(100) > 97)
	{
		writelog('');
		writelog('You approach the lair of the Red Dragon concealed by');
		writelog('darkness. The mountain looms high before you. In the');
		writelog('front is a huge cave... peering from that cave are');
		writelog('two blood red eyes. Those glaring eyes strike fear');
		writelog('into you...and the dragons fire-hot breath warms');
		writelog('you even from this far away.');
	}
}

function menu_dragon_fail()
{
	writelog('');
	writelog('The dragon pauses to look at you, then snorts in a');
	writelog('Dragon laugh, and delicately rips your head off,');
	writelog('with the finess only a Dragon well practiced in the');
	writelog('art could do.');
	writelog('');
}

function menu_dragon_beaten()
{
	//win_messages
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('** YOUR QUEST IS NOT OVER **');
	writelog('You are a hero. Bards will sing of your deeds, but');
	writelog('that doesn\'t mean your life doesn\'t go on.');
	writelog('');
	writelog('YOUR CHARACTER WILL NOW BE RESET. But you will keep');
	writelog('a few things you have earned. Like the following.');
	writelog('');
	writelog('ALL SPECIAL SKILLS.');
	writelog('');
	writelog('CHARM.');
	writelog('');
	writelog('A FEW OTHER THINGS.');
	writelog('');
	writelog('YOU FEEL STRANGE.');
	writelog('');
	writelog('Apparently, you have been sleeping. You dust');
	writelog('yourself off, and regain your bearings.');
	writelog('You feel like a new person!');
	writelog('');
	writelog('');
	
	let w = get_player_value(player, 'weapon');
	if (player_value_not_found == 1) w = 0;

	let a = get_player_value(player, 'armor');
	if (player_value_not_found == 1) a = 0;
	
	set_player_value(player, 'weapon', 'Stick');
	set_player_value(player, 'armor', 'Coat');
	set_player_value(player, 'weapon_num', 1);
	set_player_value(player, 'armor_num', 1);
	set_player_value(player, 'level', 1);

	inc_player_value(player, 'str', 10, MAX_VALUE);
	inc_player_value(player, 'def', 1, MAX_VALUE);
	inc_player_value(player, 'gold', 500, MAX_VALUE);
	inc_player_value(player, 'gems', 10, MAX_VALUE);
	inc_player_value(player, 'fights', 25, MAX_VALUE);
	inc_player_value(player, 'pfights', 3, MAX_VALUE);
	
	rmail_limit++;
}

function menu_dragon_attacks()
{
	let dr = getRandomInt(dragon_weapons.length);
	let dw = dragon_weapons[dr];
	
	let datk = dragon_str / 2;
	let breath_damage = (datk + getRandomInt(0, datk - 1)) * 2;
	
	if (getRandomInt(100) > 90) // power move?
	{
		breath_damage += breath_damage / 2;
	}
}

function menu_dark_convo()
{
	writelog('  Conversation at the Dark Cloak Tavern');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	
	let new_items = dark_new_convo.length;
	if (new_items > 14) { dark_new_convo = dark_new_convo.splice(new_items - 14, 14); }
	
	let len = dark_convo.length - new_items;
	for(let i=new_items; i < len; i+=2)
	{
		writelog(dark_convo[i]+':');
		writelog(dark_convo[i+1]);
	}

	for(let i=0; i < dark_new_convo.length; i+=2)
	{
		writelog(dark_new_convo[i]+':');
		writelog(dark_new_convo[i+1]);
	}
	
	writelog('');
	writelog('(C)ontinue (A)dd to Conversation [C]:');
}

function handle_violet(s)
{
	let c = get_player_value(player, 'charm');
	if (player_value_not_found == 1) { c = 0; }
	
	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) lvl = 1;

	let flirted = get_player_value(player, 'seenviolet');
	if (player_value_not_found == 1) flirted = 0;
	
	if (flirted == 0)
	{
		writelog('');
		
		switch (s)
		{
			case 'w':
			{
				if (c >= 1)
				{
					let xp_earned = 5 * lvl;
					inc_player_value(player, 'xp', xp_earned, MAX_XP);
					
					writelog('`%You wink at Violet seductively..');
					writelog('She blushes and smiles!!');
					writelog('You are making progress with her!');
					writelog('');
					writelog('You receive '+xp_earned+' experience!');
					
					set_player_value(player, 'seenviolet', 1);
				}
			}
			break;
			case 'k':
			{
				if (c >= 2)
				{
					inc_player_value(player, 'xp', 10, MAX_XP);
					writelog('You succeed!');
					set_player_value(player, 'seenviolet', 1);
				}
			}
			break;
			case 'p':
			{
				if (c >= 4)
				{
					inc_player_value(player, 'xp', 20, MAX_XP);
					writelog('You succeed!');
					set_player_value(player, 'seenviolet', 1);
				}
			}
			break;
			case 's':
			{
				if (c >= 8)
				{
					inc_player_value(player, 'xp', 30, MAX_XP);
					writelog('You succeed!');
					set_player_value(player, 'seenviolet', 1);
				}
			}
			break;
			case 'g':
			{
				if (c >= 16)
				{
					inc_player_value(player, 'xp', 40, MAX_XP);
					writelog('You succeed!');
					set_player_value(player, 'seenviolet', 1);
				}
			}
			break;
			case 'c':
			{
				if (c >= 32 && getRandomInt(100) > 70)
				{
					writelog('You take Violet upstairs.');
					inc_player_value(player, 'xp', 240, MAX_XP);
					inc_player_value(player, 'kids', 1, MAX_VALUE);
					inc_player_value(player, 'lays', 1, MAX_VALUE);
					set_player_value(player, 'seenviolet', 1);
				}
				else
				{
					writelog('todo; fail');
				}
			}
			break;
			case 'm':
			{
				if (c >= 100)
				{
					inc_player_value(player, 'xp', 1000, MAX_XP);
					writelog('She says yes! You and Violet are now wed.');
					set_player_value(player, 'seenviolet', 1);
					set_player_value(player, 'marriedto', 'Violet');
				}
			}
			break;
		}
		
		writelog('');
	}
	else
	{
		writelog('');
		writelog('You feel you had better not go too fast, maybe tomorrow.');
	}
}

function handle_seth(s)
{
	let c = get_player_value(player, 'charm');
	if (player_value_not_found == 1) { c = 0; }
	
	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) lvl = 1;

	let flirted = get_player_value(player, 'seenviolet'); // reusing variable for seth
	if (player_value_not_found == 1) flirted = 0;
	
	if (flirted == 0)
	{
		writelog('');
		
		switch (s)
		{
			case 'w':
			{
				if (c >= 1)
				{
					let xp_earned = 5 * lvl;
					inc_player_value(player, 'xp', xp_earned, MAX_XP);
					
					writelog('`%You wink at Seth seductively..');
					writelog('He blushes and smiles!!');
					writelog('You are making progress with him!');
					writelog('');
					writelog('You receive '+xp_earned+' experience!');
					
					set_player_value(player, 'seenviolet', 1);
				}
			}
			break;
			case 'k':
			{
				if (c >= 2)
				{
					inc_player_value(player, 'xp', 10, MAX_XP);
					writelog('You succeed!');
					set_player_value(player, 'seenviolet', 1);
				}
			}
			break;
			case 'p':
			{
				if (c >= 4)
				{
					inc_player_value(player, 'xp', 20, MAX_XP);
					writelog('You succeed!');
					set_player_value(player, 'seenviolet', 1);
				}
			}
			break;
			case 's':
			{
				if (c >= 8)
				{
					inc_player_value(player, 'xp', 30, MAX_XP);
					writelog('You succeed!');
					set_player_value(player, 'seenviolet', 1);
				}
			}
			break;
			case 'g':
			{
				if (c >= 16)
				{
					inc_player_value(player, 'xp', 40, MAX_XP);
					writelog('You succeed!');
					set_player_value(player, 'seenviolet', 1);
				}
			}
			break;
			case 'c':
			{
				if (c >= 32 && getRandomInt(100) > 70)
				{
					writelog('You take Seth upstairs.');
					inc_player_value(player, 'xp', 240, MAX_XP);
					inc_player_value(player, 'kids', 1, MAX_VALUE);
					inc_player_value(player, 'lays', 1, MAX_VALUE);
					set_player_value(player, 'seenviolet', 1);
				}
				else
				{
					writelog('You turn on the charm, moving your body seductively');
					writelog('against him, you ask him to come upstairs with you..');
					writelog('');
					writelog('He tells you he has a headache!');
					writelog('You are very disappointed.');
				}
			}
			break;
			case 'm':
			{
				if (c >= 100)
				{
					inc_player_value(player, 'xp', 1000, MAX_XP);
					writelog('He says yes! You and Seth are now wed.');
					set_player_value(player, 'seenviolet', 1);
					set_player_value(player, 'marriedto', 'Seth');
				}
			}
			break;
		}
		
		writelog('');
	}
	else
	{
		writelog('');
		writelog('The Bard seems occupied..Maybe tomorrow...');
	}
}

function is_married(s)
{
	for(let i=0; i < players.length; i++)
	{
		if (players[i].marriedto == s)
		{
			return players[i].name;
		}
	}
	return '';
}

function menu_get_room()
{
	writelog('');
	writelog('Get a room for '+room_cost+' gold? [N] : ');
	writelog('');
}

function menu_dark_cloak()
{
	writelog('`%              Dark Cloak Tavern');
	writelog('`1-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('A blazing fire warms your heart as well as your body');
	writelog('in this fragrant roadhouse. Many a wary traveler has');
	writelog('had the good fortune to find this cozy hostel, to');
	writelog('escape the harsh reality of the dense forest for a');
	writelog('few moments. You notice someone has etched something');
	writelog('in the table you are sitting at.');
	writelog('');
	writelog('(`5C`2)onverse with The Patrons   (`5D`2)aily News');
	writelog('(`5E`2)xamine Etchings In Table   (`5Y`2)our Stats');
	writelog('(`5T`2)alk with Bartender         (`5G`2)amble With Locals');
	writelog('(`5R`2)eturn To Forest');
	writelog('');
	build_menu_string('DarkCloak Tavern', 'C,E,T,V,D,G,R', 0);
	display_your_command();
}

function talk_bartender()
{
	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) lvl = 1;
	
	if (lvl == 1)
	{
		writelog('');
		writelog('You find the bartender and ask him if he will talk');
		writelog('privately with you.');
		writelog('');
		writelog('"I don\'t recall ever hearing the name');
		writelog(player+'`% before! Get outta my face!');
		writelog('');
	}
	else
	{
		writelog('  Legend of the Red Dragon - Bartender');
		writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
		writelog('The bartender escorts you into a back room.');
		writelog('"I have heard yer name before kid... what do ya');
		writelog(' want to talk about?"');
		writelog('');

		let sex = get_player_value(player, 'sex');
		if (player_value_not_found == 1) sex = 0;

		if (sex == 0) writelog('(V)iolet');
		else writelog('(S)eth');

		writelog('(G)ems');
		writelog('(B)ribe');
		writelog('(C)hange your name');
		writelog('(R)eturn to Bar');
		writelog('');
		writelog('"Well?" The bartender inquires. (? for menu)');
		writelog('');
		display_your_command();
	}
}

function menu_bartender_gems()
{
	let g = get_player_value(player, 'gems');
	if (player_value_not_found == 1) g = 0;
	
	if (g == 0) { writelog('You have no gems.'); writelog(''); return; }
	
	max_buy_drinks = parseInt(g / 2);
	
	writelog('"You have Gems, eh? I\'ll give ya a pint of magic');
	writelog(' elixir for two."');
	writelog('Buy how many elixirs? ['+max_buy_drinks+'] : ');
}

function menu_bartender_gems_buy()
{
	writelog('The bartender retrieves a steaming tankard from the');
	writelog('back room. Before you drink it, what do you');
	writelog('wish for?');
	writelog('');
	writelog('(H)it Points');
	writelog('(S)trength');
	writelog('(V)itality');
	writelog('');
	display_your_command();
}

function menu_bartender_gems_drank()
{
	writelog('YOU DRINK THE BREW AND YOUR SOUL REJOICES!');
}

function menu_bartender_bribe()
{
	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) lvl = 1;
	bartender_bribe = lvl * 1600;
	
	writelog('"Ahh..Bribe...Now you are speaking my language friend!');
	writelog('I will let you borrow my room keys...on one condition..');
	writelog('That ya pay me '+bartender_bribe+' gold!!" Deal? [N] :');
	writelog('');
}

function menu_bartender_no_bribe()
{
	writelog('"Fine..Forget I offered that deal to you.."');
	writelog('');
}

function menu_bartender_yes_bribe()
{
	let gold = get_player_value(player, 'gold');
	if (player_value_not_found == 1) gold=0;
	
	if (gold < bartender_bribe)
	{
		writelog('"Hey! You slobbering idiot! You don\'t have');
		writelog(' that much gold!"');
		writelog('');
	}
	else
	{
		dec_player_value(player, 'gold', bartender_bribe, 0);
		current=menu_slaughter;
		draw_menu(1);
	}
}

function menu_slaughter()
{
	let xp = get_player_value(player, 'xp');
	if (player_value_not_found == 1) xp = 0;
	
	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) lvl = 1;

	menu_list();
	
	writelog('');
	writelog('"What next, kid?"');
	writelog('');
	writelog('(L)ist Warriors in the Inn');
	writelog('(S)laughter Warriors in the Inn');
	writelog('(R)eturn to Bar');
	writelog('');
	display_your_command();
}

function menu_slaughter_fail()
{
	writelog('That warrior is not staying at the Inn today,');
	writelog('he is probably in the fields.');
	writelog('');
}

function menu_slaughter_success()
{
	writelog('todo: implement player slaughter');
}

function menu_bartender_changename()
{
	let lvl = get_player_value(player, 'level');
	if (player_value_not_found == 1) lvl = 1;
	change_name_cost = lvl * 500;
	
	writelog('"Ya wanna change your name, eh? Yeah..');
	writelog(player+'`% the warrior does sound kinda funny..');
	writelog('it would cost ya '+change_name_cost+' gold... Deal?');
	writelog('Change your name? [N] ');
	writelog('');
}

function menu_bartender_no_namechange()
{
	writelog('Fine...Keep your stupid name...See if I care...');
	writelog('');
}

function menu_bartender_yes_namechange()
{
	writelog('');
	writelog('What would you like as an alias?');
	writelog('NAME: ');
	writelog('');
}

function menu_bartender_confirm_namechange()
{
	writelog('"'+name_to_change+'? That\'s kinda flaky, you sure?" [Y] : ');
	writelog('');
}

function menu_bartender_fail_namechange()
{
	writelog('Hey! You stupid fool! You don\'t have that much gold!');
	writelog('');
}

function menu_bartender_accept_namechange()
{
	set_player_value(player, 'name', name_to_change);
	
	if (name_to_change)
	{
		player = name_to_change;
		writelog('Done! You are now '+player);
		writelog('');
		writelog('<MORE>');
	}
	else
	{
		writelog('Invalid name.');
		writelog('');
		writelog('<MORE>');
	}
}

function menu_bartender_violet()
{
	writelog('"Ya want to know about Violet do ya? She is every');
	writelog('warrior\'s wet dream...But forget it, Lad, she only');
	writelog('goes for the type of guy who would help old people...');
	writelog('');
}

function menu_bartender_seth()
{
	writelog('"Ya want to know about Seth Able the Bard, eh? Well..');
	writelog('He has a good voice, and can really play that');
	writelog('mandolin. I don\'t think he would go for your type');
	writelog('tho, he likes the type of girl that would help an');
	writelog('old man or something... A lot of Charm is what you');
	writelog('would need. However, I could sure go for your type.');
	writelog('Har har har!');
	writelog('');
}

function talk_dbartender()
{
	writelog('Talking To Chance');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You seat yourself next to the bartender,');
	writelog('for some reason you like him.');
	writelog('');
	writelog('(C)hange Profession');
	writelog('(L)earn About Your Enemies');
	writelog('(T)alk About Colors');
	writelog('(P)ractice The Art Of Color');
	writelog('(R)eturn');
	writelog('');
	display_your_command();
}

function examine_detch()
{
	writelog('Dark Cloak Tavern - Examine Etchings');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	
	for(let i=0; i < players.length; i++)
	{
		let lays = players[i]['lays'];
		if (lays > 0)
		{
			writelog(players[i]['name'] + '`% has ' + lays + ' lays');
		}
	}
	
	writelog('');
	writelog('<MORE>');
}

function dark_gamble()
{
	let gd = get_player_value(player, 'gold');
	if (player_value_not_found == 1) gd = 0;
	
	writelog('Gamble');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('How much do you want to wager of '+gd+'? [1 for all] ');
}

function got_room()
{
	writelog('  The Room At The Inn');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You are escorted to a small but cozy room in the Inn.');
	writelog('You relax on the soft bed, and soon fall asleep, still');
	writelog('wearing your armour.');
	writelog('');
	writelog('RETURNING TO THE MUNDANE WORLD...');
	writelog('');
	writelog('+++ATH NO CARRIER');
	writelog('');
}

function weird_event()
{
	let found = getRandomInt(12)+1;
	
	inc_player_value(player, 'gems', found, MAX_VALUE);
	
	writelog('                 ** WIERD EVENT **');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You are heading into the forest, when you hear the');
	writelog('voice of angels singing.');
	writelog('');
	writelog('You follow the sound for some time - when you are');
	writelog('about to give up...');
	writelog('');
	writelog('You find...'+found+' Gems!');
	writelog('');
	writelog('<MORE>');
}

function creepy_event()
{
	writelog('                 ** CREEPY EVENT **');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('Your quest is interrupted by a strange wailing noise.');
	writelog('');
	writelog('Closer inspection reveals the errie howl seems to be');
	writelog('coming from a nearby cave.');
	writelog('');
	writelog('<MORE>');
}

function creepy_olivia()
{
	writelog('WAIT A SEC!');
	writelog('');
	writelog('It\'s just your old pal Olivia the bodyless woman.');
	writelog('');
	writelog('Olivia greets you with a head hug.');
	writelog('');
	writelog('(G)et inside her head');
	writelog('(A)sk for a kiss.');
	writelog('');
	writelog('What will it be? [G] : ');
}

function olivia_ask()
{
	writelog('                 A FREUDIAN SLIP   ');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('"Watcha thinkin?" you ask politely.');
	writelog('');
	writelog('Olivia nudges herself to a better speaking position.');
	writelog('');
	writelog('"Well. I was thinking about when I had a body. A very');
	writelog('beautiful one if I do say myself. Men followed me like');
	writelog('flies on honey. Especially one man. A the time he was');
	writelog('a town crier at Penyon Manor.');
	writelog('');
	writelog('It is because of him I am like this..You see, he.."');
	writelog('');
	writelog('"Getting bored here. Gotta go, see ya," you break');
	writelog('in rudely.');
	writelog('');
	writelog('You travel back to the forest entrance.');
	writelog('');
	writelog('<MORE>');
}

function olivia_kiss()
{
	writelog('todo; olivia kiss');
	writelog('');
}

function dwarf_meeting()
{
	writelog('A meeting of chance.');
	writelog('');
	writelog('A sly looking dwarf hops out of the brush.');
	writelog('');
	writelog('"How about a game, friend?"');
	writelog('');
	writelog('(G)ive the game a chance');
	writelog('(T)ell the Dwarf to screw off');
	writelog('');
	display_your_command();
}

function dwarf_exit()
{
	writelog('');
	writelog('"Your loss, kid. Forget you ever saw me!"');
	writelog('');
	writelog('<MORE>');
}

function dwarf_yes()
{
	// handle splits
	// handle play again
}

function dwarf_no()
{
	// handle no on splits
	// handle no on play again
}

function dwarf_hit()
{
	clearlog();
	blackjack_card_display[2]=[];
	blackjack_card_display[3]=[];
	blackjack_draw();
	blackjack_show_player_card();
	draw_menu(1);
	blackjack_calculate_winner();
}

function dwarf_stay()
{
	if (blackjack_game_over) return;
	if (blackjack_cansplit) blackjack_cansplit=0;
	if (blackjack_has_split)
	{
		blackjack_has_split=0;
		blackjack_checksplit=1;
		dwarf_game_status = "Stayed 1st split";
		return;
	}
	blackjack_game_over=1;
	blackjack_dealer_logic();
}

function shuffle_array(array)
{
	let count = array.length, randomnumber, temp;
	while(count)
	{
		randomnumber = Math.random() * count-- | 0;
		temp = array[count];
		array[count] = array[randomnumber];
		array[randomnumber] = temp;
	}
}

function blackjack_create_card(suit, card)
{
	let points = 0;
	if (card > 10) points = 10;
	else if (card == 1) points = 11;
	else points = card;
	blackjack_cards.push([suit, card, points]);
}

function blackjack_generate_deck(clr)
{
	if (clr) blackjack_cards=[];
	for(let i=1; i < 5; i++)
	{
		for(let j=1; j < 14; j++)
		{
			blackjack_create_card(i, j);
		}
	}
}

function blackjack_create_hand()
{
	blackjack_hand=[];
	blackjack_hand1points=0;
	blackjack_hand1points2=0;
	blackjack_dealer_hand=[];
	blackjack_dealerpoints=0;
}

function blackjack_get_card_value(value)
{
	switch (value)
	{
		case 1:  return 'A';
		case 10: return 'T';
		case 11: return 'J';
		case 12: return 'Q';
		case 13: return 'K';
	}
	return ''+value;
}

function blackjack_set_message(left,right)
{
	if (left != -1)
	{
		blackjack_left_msg_args[0] = blackjack_left_messages[left][0];
		blackjack_left_msg_args[1] = blackjack_left_messages[left][1];
		blackjack_left_msg_args[2] = blackjack_left_messages[left][2];
		blackjack_left_msg_args[3] = blackjack_left_messages[left][3];
		blackjack_left_msg_args[4] = blackjack_left_messages[left][4];
		blackjack_left_msg_args[5] = blackjack_left_messages[left][5];
		blackjack_left_msg_args[6] = blackjack_left_messages[left][6];
		blackjack_left_msg_args[7] = blackjack_left_messages[left][7];
		
		if (left == BLACKJACK_LEFT_MESSAGE_SPLIT_WINLOSE)
		{
			let amt = current_bet;
			let h  = 'win!';
			let h1 = 'wins!';
			let h2 = 'wins!';
			if (blackjack_busted1) h1 = 'loses';
			if (blackjack_busted2) h2 = 'loses';
			if (blackjack_busted1 && blackjack_busted2) { h='lost'; }
			else
			{
				if (blackjack_busted1) amt = parseInt(amt / 2);
				else if (blackjack_busted2) amt = parseInt(amt / 2);
			}

			blackjack_left_msg_args[0] = String.format(blackjack_left_messages[left][0], blackjack_dealer_score);
			blackjack_left_msg_args[1] = String.format(blackjack_left_messages[left][1], h1);
			blackjack_left_msg_args[2] = String.format(blackjack_left_messages[left][2], h2);
			blackjack_left_msg_args[3] = String.format(blackjack_left_messages[left][3], h);
			blackjack_left_msg_args[4] = String.format(blackjack_left_messages[left][4], amt);
			blackjack_left_msg_args[5] = String.format(blackjack_left_messages[left][5], 'Gold');
		}
		else if (left == BLACKJACK_LEFT_MESSAGE_WAGER)
		{
			if (current_bet < BLACKJACK_MIN_BET)
				blackjack_left_msg_args[3] = String.format(blackjack_left_messages[left][3], 'Too little!');
			else if (current_bet > BLACKJACK_MAX_BET)
				blackjack_left_msg_args[3] = String.format(blackjack_left_messages[left][3], 'Too much!');
			else
				blackjack_left_msg_args[3] = String.format(blackjack_left_messages[left][3], current_bet);
		}
		else if (left == BLACKJACK_LEFT_MESSAGE_PLAYER_BLACKJACK)
		{
			blackjack_left_msg_args[6] = String.format(blackjack_left_msg_args[6], current_bet);
		}
		else if (left == BLACKJACK_LEFT_MESSAGE_DEALER_BUSTED)
		{
			blackjack_left_msg_args[4] = String.format(blackjack_left_messages[left][4], current_bet);
		}
		else if (left == BLACKJACK_LEFT_MESSAGE_PLAYER_WINS)
		{
			blackjack_left_msg_args[5] = String.format(blackjack_left_messages[left][5], current_bet);
		}
		else if (left == BLACKJACK_LEFT_MESSAGE_HIT_OR_STAY_SPLIT)
		{
			let hb = ''; let hs = '';
			if (blackjack_busted1) { hs = '2'; hb = '1'; }
			else if (blackjack_busted2) { hs = '1'; hb = '2'; }
			blackjack_left_msg_args[0] = String.format(blackjack_left_messages[left][0], hb);
			blackjack_left_msg_args[4] = String.format(blackjack_left_messages[left][4], hs);
		}
	}
	if (right != -1) blackjack_current_right_message = blackjack_right_messages[right];
	
	draw_menu(1);
}

function blackjack_clear_message(left,right)
{
	if (left) blackjack_current_left_message='';
	if (right) blackjack_current_right_message='';
}

function blackjack_draw_card(n)
{
    if (blackjack_hand.length < CARD_INDEX_LIMIT)
	{
        let s = blackjack_cards[n][0];
        blackjack_cur_suit = s;
        blackjack_cur_value = blackjack_cards[n][1];
        blackjack_cur_points = blackjack_cards[n][2];
		blackjack_hand.push([s, blackjack_cur_value, blackjack_cur_points]);
        blackjack_hand1points += blackjack_cur_points;
        if (blackjack_cur_points == 11) blackjack_has_ace=1;
		return blackjack_get_card_value(blackjack_cur_value);
    }
    else
	{
        blackjack_cur_suit = -1;
        blackjack_cur_value = -1;
        blackjack_cur_points = -1;
        if (!blackjack_has_split)
		{
            blackjack_dealer_logic();
        }
    }
	return -1;
}

function blackjack_draw_for_dealer(n)
{
    if (blackjack_dealer_hand.length < CARD_INDEX_LIMIT)
	{
        let s = blackjack_cards[n][0];
        blackjack_deal_suit = s;
        blackjack_deal_value = blackjack_cards[n][1];
        blackjack_deal_points = blackjack_cards[n][2];
        blackjack_dealer_hand.push([s, blackjack_deal_value, blackjack_deal_points]);
        blackjack_dealerpoints += blackjack_deal_points;
		blackjack_dealer_score = blackjack_dealerpoints;
		return blackjack_get_card_value(blackjack_deal_value);
    }
    else {
        blackjack_cur_suit = -1;
        blackjack_cur_value = -1;
        blackjack_cur_points = -1;
    }
	return -1;
}

function blackjack_check_points()
{
	blackjack_player_score=blackjack_hand1points;

    if (blackjack_hand1points > 21)
	{
        if (blackjack_has_split)
		{
			blackjack_has_split=0;
			blackjack_checksplit=1;
			blackjack_busted1=1;
			blackjack_busted2=0;
			blackjack_set_message(BLACKJACK_LEFT_MESSAGE_HIT_OR_STAY_SPLIT, BLACKJACK_RIGHT_MESSAGE_HIT_OR_STAY);
			return 1;
		}
        else
		{
			blackjack_alive=0;
			blackjack_set_message(BLACKJACK_LEFT_MESSAGE_PLAYER_BUSTED, BLACKJACK_RIGHT_MESSAGE_YES_NO);
			return 0;
		}
    }
    return 1;
}

function blackjack_split_check()
{
    let hp = blackjack_hand1points;
    if (blackjack_checksplit) {
        if (blackjack_hand1points > blackjack_hand1points2) {
            if (blackjack_hand1points <= 21) hp=blackjack_hand1points;
            else hp=blackjack_hand1points2;
        }
        else if (blackjack_hand1points2 > blackjack_hand1points) {
            if (blackjack_hand1points2 <= 21) hp=blackjack_hand1points2;
            else hp=blackjack_hand1points;
        }
        else if (blackjack_hand1points == blackjack_hand1points2) hp=blackjack_hand1points;
        
        let dp = blackjack_dealerpoints;
        if (dp > 21) dp  = 0;
        
        let m = 1.0;
		
		if (blackjack_has_ace) m = 1.5;
        
        /*if (blackjack_hand1points > 21)
		{
		}
        else if (dp > blackjack_hand1points && dp <= 21 && blackjack_hand1points != dp)
		{
			
		}
        else
		{
		}
        
        if (hand1points2 > 21)
		{
		}
        else if (dp > hand1points2 && dp <= 21 && hand1points2 != dp)
		{
		}
        else
		{
		}*/
    }
    return hp;
}

function blackjack_check_dealer_points()
{
	blackjack_dealer_score = blackjack_dealerpoints;

    if (blackjack_dealerpoints > 21)
	{
		blackjack_split_check();
		blackjack_dealer_alive=0;
		blackjack_set_message(BLACKJACK_LEFT_MESSAGE_DEALER_BUSTED, BLACKJACK_RIGHT_MESSAGE_YES_NO);
		return 0;
	}

    return 1;
}

function blackjack_push()
{
}

function blackjack_dealer_stay()
{
}

function blackjack_calculate_winner()
{
    if (blackjack_result != WINNER_NONE) return;
	
	let result = blackjack_result;
	
	blackjack_dealer_score = blackjack_dealerpoints;
    
    let hp = blackjack_split_check();
    
    if (blackjack_dealerpoints > 21)
	{
		blackjack_dealer_alive = 0;
		blackjack_set_message(BLACKJACK_LEFT_MESSAGE_DEALER_BUSTED, BLACKJACK_RIGHT_MESSAGE_YES_NO);
		result=WINNER_PLAYER;
	}
    else if (hp > 21)
	{
		blackjack_set_message(BLACKJACK_LEFT_MESSAGE_PLAYER_BUSTED, BLACKJACK_RIGHT_MESSAGE_YES_NO);
		result=WINNER_DEALER;
	}
    else if (blackjack_dealerpoints == hp)
	{
		if (blackjack_dealerpoints >= 17)
		{
			blackjack_push();
			blackjack_set_message(BLACKJACK_LEFT_MESSAGE_PUSH, BLACKJACK_RIGHT_MESSAGE_YES_NO);
			blackjack_result=WINNER_DRAW;
		}
	}
    else if (blackjack_dealerpoints >= 17)
	{
		// stick on 17 and up
        blackjack_dealer_stay();
		
        if (blackjack_dealerpoints < hp)
		{
			blackjack_set_message(BLACKJACK_LEFT_MESSAGE_PLAYER_WINS, BLACKJACK_RIGHT_MESSAGE_YES_NO);
			blackjack_result=WINNER_PLAYER;
		}
        else if (blackjack_dealerpoints > hp)
		{
			blackjack_set_message(BLACKJACK_LEFT_MESSAGE_PLAYER_LOSES, BLACKJACK_RIGHT_MESSAGE_YES_NO);
			blackjack_result=WINNER_DEALER;
		}
        else
		{
			blackjack_push();
			blackjack_result=WINNER_DRAW;
		}
    }
    else if (blackjack_dealerpoints == 21 && hp < 21)
	{
		blackjack_dealer_stay();
		blackjack_set_message(BLACKJACK_LEFT_MESSAGE_PLAYER_LOSES, BLACKJACK_RIGHT_MESSAGE_YES_NO);
		result=WINNER_DEALER;
	}
    else if (blackjack_dealer_hand.length == CARD_INDEX_LIMIT)
	{
        if (blackjack_dealerpoints < hp && blackjack_dealerpoints < 21)
		{
			blackjack_dealer_stay();
			blackjack_set_message(BLACKJACK_LEFT_MESSAGE_PLAYER_WINS, BLACKJACK_RIGHT_MESSAGE_YES_NO);
			result=WINNER_PLAYER;
		}
        else if (blackjack_dealerpoints < 21 && hp == 21)
		{
			blackjack_dealer_stay();
			blackjack_set_message(BLACKJACK_LEFT_MESSAGE_PLAYER_WINS, BLACKJACK_RIGHT_MESSAGE_YES_NO);
			result=WINNER_PLAYER;
		}
        else if (blackjack_dealerpoints == hp)
		{
			blackjack_dealer_stay();
			blackjack_push();
			blackjack_set_message(BLACKJACK_LEFT_MESSAGE_PUSH, BLACKJACK_RIGHT_MESSAGE_YES_NO);
			result=WINNER_DRAW;
		}
        else if (blackjack_hand.length >= CARD_INDEX_LIMIT)
		{
            blackjack_dealer_stay();
			// print 5 card trick
            if (hp > blackjack_dealerpoints)
			{
				blackjack_set_message(BLACKJACK_LEFT_MESSAGE_PLAYER_WINS, BLACKJACK_RIGHT_MESSAGE_YES_NO);
				result=WINNER_PLAYER;
			}
            else if (hp == blackjack_dealerpoints)
			{
				blackjack_set_message(BLACKJACK_LEFT_MESSAGE_PUSH, BLACKJACK_RIGHT_MESSAGE_YES_NO);
				result=WINNER_DRAW;
			}
            else
			{
				blackjack_set_message(BLACKJACK_LEFT_MESSAGE_PLAYER_LOSES, BLACKJACK_RIGHT_MESSAGE_YES_NO);
				result=WINNER_DEALER;
			}
        }
    }
    else
	{
		// delay 1 second
	}
	
	blackjack_result = result;
	draw_menu(1);
}

function blackjack_dealer_logic()
{
    if (blackjack_alive)
    {
		blackjack_dealer_alive=1;
        
        if (blackjack_dealer_draw()) blackjack_show_dealer_card();
		
        blackjack_check_dealer_aces();

        if (blackjack_check_dealer_points() == 0)
		{
			blackjack_result=WINNER_PLAYER;
			blackjack_end_game();
			return;
		}
        
        blackjack_calculate_winner();

        if (blackjack_result != WINNER_NONE)
		{
			blackjack_end_game();
			return;
		}
        
        while (blackjack_dealer_alive && blackjack_result == WINNER_NONE)
        {
            if (blackjack_dealer_hand.length+1 < CARD_INDEX_LIMIT)
            {
                if (blackjack_dealer_draw())
				{
					blackjack_dealer_draw();
					blackjack_show_dealer_card();
				}
                
                blackjack_check_dealer_aces();
    
                if (blackjack_dealerpoints > 21)
                {
                    blackjack_dealer_alive=0;
                    blackjack_result=WINNER_PLAYER;
                    blackjack_split_check();
					blackjack_set_message(BLACKJACK_LEFT_MESSAGE_DEALER_BUSTED, BLACKJACK_RIGHT_MESSAGE_YES_NO);
                    blackjack_end_game();
                    return;
                }
                
                blackjack_calculate_winner();
    
                if (blackjack_result == WINNER_NONE)
                {
					//delay
                }
                else
                {
                    blackjack_dealer_alive=0;
                    blackjack_end_game();
                    return;
                }
            }
            else blackjack_dealer_stay();
        }
    }
    blackjack_end_game();
}

function blackjack_check_aces()
{
    if (blackjack_checksplit) return;
	
    let ch=0;
    if (blackjack_hand1points > 21)
	{
        for(let i=0; i < blackjack_hand.length; i++)
		{
            let h = blackjack_hand[i][2];
            if (h == 11 && !ch)
			{
				// high ace
				blackjack_hand[i][2] = 1;
                blackjack_hand1points -= 10;
                ch = 1;
            }
        }
    }
}

function blackjack_check_dealer_aces()
{
    let ch = 0;
    if (blackjack_dealerpoints > 21)
	{
        for(let i=0; i < blackjack_dealer_hand.length; i++)
		{
            let h = blackjack_dealer_hand[i][2];
            if (h == 11 && !ch)
			{
				// high ace
				blackjack_dealer_hand[i][2] = 1; // change it to a low ace
                blackjack_dealerpoints -= 10;
                ch = 1;
            }
        }
    }
}

function blackjack_reset()
{
	blackjack_cards=[];
	blackjack_hand=[];
	blackjack_hand2=[];
	blackjack_dealer_hand=[];
}

function blackjack_clear_player()
{
	
}

function blackjack_draw()
{
    blackjack_draw_card(blackjack_card_index);
    if (blackjack_cur_points == -1) return 0;
    blackjack_card_index++;
    return 1;
}

function blackjack_show_card()
{
	
}

function blackjack_end_game()
{
	
}

function blackjack_drawsame()
{
	
}

function blackjack_dealer_draw()
{
    blackjack_draw_for_dealer(blackjack_card_index);
    if (blackjack_cur_points == -1) return 0;
    blackjack_card_index++;
    return 1;
}

function blackjack_show_dealer_card()
{
	let top_index = 0;
	for(let i=0; i < blackjack_dealer_hand.length; i++)
	{
		let card = blackjack_dealer_hand[i];

		if ((i+1) % 2 == 0)
		{
			blackjack_disp_add_card(1, CARD_SHOW, card[1], card[0]);
		}
		else
		{
			let show = CARD_HIDE;
			if (blackjack_dealer_reveal[top_index] && top_index < 2) show = CARD_SHOW;
			blackjack_disp_add_card(0, show, card[1], card[0]);
			top_index++;
		}
	}
	
	draw_menu(1);
}

function blackjack_show_player_card()
{
	for(let i=0; i < blackjack_hand.length; i++)
	{
		let card = blackjack_hand[i];
		
		if ((i+1) % 2 == 0)
		{
			blackjack_disp_add_card(3, CARD_SHOW, card[1], card[0]);
		}
		else
		{
			blackjack_disp_add_card(2, CARD_SHOW, card[1], card[0]);
		}
	}
	
	draw_menu(1);
}

function blackjack_begin()
{
	blackjack_disp_clear();
    blackjack_reset();
    blackjack_clear_player();
    blackjack_game_over = blackjack_has_ace = blackjack_is_split_aces = blackjack_has_split = blackjack_checksplit = blackjack_cansplit = 0;
	blackjack_player_score = blackjack_dealer_score = -1;
    blackjack_result = WINNER_NONE;
    blackjack_card_index = 0;
	blackjack_cur_points=0;
    blackjack_generate_deck(1);
	shuffle_array(blackjack_cards);
    blackjack_create_hand();
	
	blackjack_dealer_reveal.push(0);
	blackjack_dealer_draw();
	blackjack_dealer_draw();
	blackjack_show_dealer_card();
	
	const TEST_SPLIT = 0;
    if (TEST_SPLIT)
	{
        blackjack_drawsame();
		blackjack_s1=CUR_VALUE;
		blackjack_show_card();
        blackjack_drawsame();
		blackjack_s2=CUR_VALUE;
		blackjack_show_card();
    }
    else
	{
        if (blackjack_draw())
		{
			blackjack_s1=blackjack_cur_value;
			blackjack_show_card();
		}
	
        if (blackjack_draw())
		{
			blackjack_s2=blackjack_cur_value;
			blackjack_show_card();
		}

		blackjack_show_player_card();
    }

    if (blackjack_hand1points == 21)
	{
		blackjack_player_score = blackjack_hand1points;

        if (blackjack_dealerpoints == blackjack_hand1points)
		{
			blackjack_set_message(BLACKJACK_LEFT_MESSAGE_PUSH, BLACKJACK_RIGHT_MESSAGE_YES_NO);
            blackjack_result=WINNER_NONE;
            blackjack_end_game();
            return;
        }
        else {
            blackjack_result=WINNER_PLAYER;
			blackjack_set_message(BLACKJACK_LEFT_MESSAGE_PLAYER_WINS, BLACKJACK_RIGHT_MESSAGE_YES_NO);
            blackjack_end_game();
            return;
        }
    }
    
    blackjack_check_aces();

    if (blackjack_s1 == blackjack_s2)
	{
		blackjack_cansplit=1;
		if (blackjack_s1 == 1) blackjack_is_split_aces=1;
	}
    
    blackjack_alive=blackjack_check_points();
}

function blackjack_clear_msg_args(left,right)
{
	if (left)  blackjack_left_msg_args = [ '',	'',	'',	'', '',	'',	'',	''];
	if (right) blackjack_right_msg_args = [ '', '', '', '', '', '', '', ''];
}

function blackjack_show_cards(row, cards)
{
	const spacer = '                              ';
	let extra_space = spacer.length;

	if (row == 0)
	{
		let line0 = '             ';
		let line1 = '             ';

		for(let i=0; i < cards.length; i++)
		{
			let hidden = cards[i][0];
			let card   = cards[i][1];
			let suit   = card_suits[cards[i][2]];

			if (hidden == CARD_HIDE)
			{
				line0 += padEnd(6+extra_space, hidden_playing_card[0], ' ');
				line1 += padEnd(6+extra_space, hidden_playing_card[1], ' ');
			}
			else if (hidden == CARD_SHOW)
			{
				line0 += padEnd(6+extra_space, revealed_playing_card[0], ' ');
				line1 += padEnd(6+extra_space, String.format(revealed_playing_card[1], card, suit), ' ');
			}
		}
		
		writelog(line0);
		writelog(line1);
	}
	else if (row == 1)
	{
		let line0 = '             ';
		let line1 = '             ';
		let line2 = '             ';
		let line3 = '             ';
		let line4 = '             ';

		for(let i=0; i < cards.length; i++)
		{
			let val    = parseInt(cards[i][1]);
			let card   = blackjack_get_card_value(val);
			let suit   = card_suits[parseInt(cards[i][2])-1];
			
			line0 += full_playing_card[0];
			line1 += padEnd(6+extra_space, String.format(full_playing_card[1], card, suit), ' ');
			line2 += full_playing_card[2];
			line3 += full_playing_card[3];
			line4 += full_playing_card[4];
		}
		
		writelog(line0);
		writelog(line1);
		writelog(line2);
		writelog(line3);
		writelog(line4);
	}
	else if (row == 2)
	{
		let line0 = String.format('║           ║');
		let line1 = String.format('║           ║');

		if (blackjack_left_msg_args[0] != '')
			line0 = String.format('║{0}║', padEnd(12, blackjack_left_msg_args[0], ' '));
		if (blackjack_left_msg_args[1] != '')
			line1 = String.format('║{0}║', padEnd(12, blackjack_left_msg_args[1], ' '));

		for(let i=0; i < cards.length; i++)
		{
			let val    = parseInt(cards[i][1]);
			let card   = blackjack_get_card_value(val);
			let suit   = card_suits[parseInt(cards[i][2])-1];
			line0 += padEnd(6, revealed_playing_card[0], ' ');
			line1 += padEnd(6, String.format(revealed_playing_card[1], card, suit), ' ');
		}
		
		writelog('╔═══════════╗'+spacer+'╔═══════════╗');
		writelog(line0);
		writelog(line1);
	}
	else if (row == 3)
	{
		let line2 = String.format('║           ║');
		let line3 = String.format('║           ║');
		let line4 = String.format('║           ║');
		let line5 = String.format('║           ║');
		let line6 = String.format('║           ║');
		let line7 = String.format('║           ║');
		let line8 = String.format('             ');
		let line9 = String.format('             ');
		
		if (blackjack_left_msg_args[2] != '')
			line2 = String.format('║{0}║', padEnd(12, blackjack_left_msg_args[2], ' '));
		if (blackjack_left_msg_args[3] != '')
			line3 = String.format('║{0}║', padEnd(12, blackjack_left_msg_args[3], ' '));
		if (blackjack_left_msg_args[4] != '')
			line4 = String.format('║{0}║', padEnd(12, blackjack_left_msg_args[4], ' '));
		if (blackjack_left_msg_args[5] != '')
			line5 = String.format('║{0}║', padEnd(12, blackjack_left_msg_args[5], ' '));
		if (blackjack_left_msg_args[6] != '')
			line6 = String.format('║{0}║', padEnd(12, blackjack_left_msg_args[6], ' '));
		if (blackjack_left_msg_args[7] != '')
			line7 = String.format('║{0}║', padEnd(12, blackjack_left_msg_args[7], ' '));

		for(let i=0; i < cards.length; i++)
		{
			let val    = parseInt(cards[i][1]);
			let card   = blackjack_get_card_value(val);
			let suit   = card_suits[parseInt(cards[i][2])-1];

			line2 += padEnd(6, full_playing_card[0], ' ');
			line3 += padEnd(6, String.format(full_playing_card[1], card, suit), ' ');
			line4 += padEnd(6, full_playing_card[2], ' ');
			line5 += padEnd(6, full_playing_card[3], ' ');
			line6 += padEnd(6, full_playing_card[4], ' ');
		}
		
		writelog(line2);
		writelog(line3);
		writelog(line4);
		writelog(line5);
		writelog(line6);
		
		let bet = current_bet;
		if (bet == -1) bet=200;
		writelog(String.format('╚═══════════╝         Bet: {0}            ╚═══════════╝',
			padEnd(5, ''+bet, ' ')));
	}
}

function blackjack_disp_clear()
{
	blackjack_card_display = [[], [], [], []];
}

function blackjack_disp_add_card(row, show, value, suit)
{
	if (row < 0 || row >= 4) return;
	blackjack_card_display[row].push([show, ''+value, suit]);
}

function dwarf_game()
{
	let gold = get_player_value(player, 'gold');
	if (player_value_not_found == 1) gold = 0;
	
	if (gold == 0)
	{
		writelog('');
		writelog('You don\'t have enough to bet.');
		writelog('');
		current=menu_forest;
		draw_menu(0);
		return;
	}

	let game_over = 0;
	
	// todo: handle calculating splits, double downs, etc
	switch (blackjack_result)
	{
		case WINNER_DEALER:
		{
			dwarf_game_status = 'Place new bet?';
			game_over = 1;
			status=buffer='200';
			dec_player_value(player, 'gold', current_bet, 0);
			current_bet = -1;
		}
		break;
		case WINNER_DRAW:
		{
			dwarf_game_status = 'Place new bet?';
			game_over = 1;
			status=buffer='200';
			current_bet = -1;
		}
		break;
		case WINNER_PLAYER:
		{
			dwarf_game_status = 'Place new bet?';
			game_over = 1;
			status=buffer='200';
			inc_player_value(player, 'gold', current_bet, MAX_VALUE);
			current_bet = -1;
		}
		break;
	}
	
	clearlog();
	blackjack_show_cards(0, blackjack_card_display[0]);
	blackjack_show_cards(1, blackjack_card_display[1]);
	blackjack_show_cards(2, blackjack_card_display[2]);
	blackjack_show_cards(3, blackjack_card_display[3]);
	writelog(String.format('Gold on hand: {0}', gold));
	writelog(String.format('Hand1: {0}                                    Dealer: {1}',
		blackjack_hand1points, blackjack_dealer_score));
	writelog(dwarf_game_status);

	if (game_over)
	{
		blackjack_result = WINNER_NONE;
	}
}

let dwarf_game_status = '';

function forest_hut()
{
	// forest events do not use up forest fights
	inc_player_value(player, 'fights', 1, MAX_VALUE);

	writelog('  Event In The Forest');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('While trekking thru the forest you come upon hut. ');
	writelog('');
	writelog('(K)nock On The Door');
	writelog('(B)ang On The Door');
	writelog('(L)eave It Be');
	writelog('');
	display_your_command();
}

function forest_hut_knock()
{
	if (skill_type('class') == 'Mystical')
	{
		writelog('');
		writelog('You politely knock on the knotted wooden door.');
		writelog('');
		writelog('You are about to leave, when you hear a voice above:');
		writelog('"Watcha doin down there Sonny?!" You look up to see');
		writelog('a wizened old man.');
		writelog('');
		writelog('"Tell ya what! I\'ll give ya a mystical lesson if');
		writelog('you can pass my test!" the old man giggles.');
		writelog('');
		writelog('<MORE>');
	}
	else
	{
		writelog('');
		writelog('No one seems to be home.');
		writelog('');
		writelog('<MORE>');
	}
}

function forest_hut_bang()
{
	writelog('');
	writelog('todo; bang');
	writelog('');
	writelog('<MORE>');
}

function forest_hut_leave()
{
	writelog('');
	writelog('You leave well enough alone.');
	writelog('');
	writelog('<MORE>');
}

function forest_hut_gamble()
{
	if (guess_my_number == -1)
	{
		guess_tries = MAX_GUESSES;
		guess_my_number = getRandomInt(100)+1;
		writelog('                   ** THE TEST **');
		writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
		writelog('"All right now! I\'m thinking of a number between');
		writelog('1 and 100. I\'ll give ya six guesses."');
		writelog('');
		writelog('(The old man leans out the window in anticipation)');
		writelog('');
	} 
	else
	{
		if (last_guess < 1 || last_guess > 100)
		{
			writelog('Invalid number: '+last_guess);
		}
		else
		{
			guess_tries--;
			
			if (last_guess < guess_my_number)
			{
				writelog('Guess '+(MAX_GUESSES - guess_tries)+' : '+last_guess);
				writelog('"The number is higher than that!"');
			}
			else if (last_guess > guess_my_number)
			{
				writelog('Guess '+(MAX_GUESSES - guess_tries)+' : '+last_guess);
				writelog('"The number is lower than that!"');
			}
			else if (last_guess == guess_my_number)
			{
				writelog('');
				writelog('"That\'s right! That\'s the number I was thinking of!');
				writelog(' You read my mind!" The old man nearly falls from');
				writelog('his window in his excitement!');
				writelog('');
				writelog('           ** YOU HAVE PASSED THE TEST **');
				writelog('');
				writelog('** YOUR CLASS SKILL IS RAISED BY ONE! **');
				writelog('');
				writelog('You now have '+skill+' '+skill_type('class')+' Skill / day.');
				writelog('');
				writelog('You nee two more lesson to learn a new skill.');
				writelog('');
				writelog('<MORE>');
				
				skill_level++;
				return;
			}

			if (guess_tries <= 0)
			{
				writelog('');
				writelog('The old man drops his head and shakes it sadly. You');
				writelog('notice small dandruff flakes drifting down from the');
				writelog('window. "No, no NO! The number was '+guess_my_number+' !');
				writelog('Geez! I won\'t teach such an unpromising student!');
				writelog('');
				writelog('He slams his window shut, and leaves you no recourse');
				writelog('but to leave.');
				writelog('');
				writelog('<MORE>');
			}
		}
	}
}

function dark_gamble_teeth()
{
}

function dark_gamble_number()
{
	if (guess_my_number == -1)
	{
		guess_tries = MAX_GUESSES;
		guess_my_number = getRandomInt(100)+1;
		writelog('                   ** GUESS **');
		writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
		writelog('"All right now! I\'m thinking of a number between');
		writelog('1 and 100. I\'ll give ya six guesses."');
		writelog('');
		writelog('(The old man leans out the window in anticipation)');
		writelog('');
	} 
	else
	{
		if (last_guess < 1 || last_guess > 100)
		{
			writelog('Invalid number: '+last_guess);
		}
		else
		{
			guess_tries--;
			
			if (last_guess < guess_my_number)
			{
				writelog('Guess '+(MAX_GUESSES - guess_tries)+' : '+last_guess);
				writelog('"The number is higher than that!"');
			}
			else if (last_guess > guess_my_number)
			{
				writelog('Guess '+(MAX_GUESSES - guess_tries)+' : '+last_guess);
				writelog('"The number is lower than that!"');
			}
			else if (last_guess == guess_my_number)
			{
				inc_player_value(player, 'gold', dark_wager * 2, MAX_VALUE);
				
				writelog('');
				writelog('"That\'s right! That\'s the number I was thinking of!');
				writelog('');
				return;
			}

			if (guess_tries <= 0)
			{
				writelog('You lost! You are out of guesses.');
				writelog('The number was '+guess_my_number);
				writelog('');
				writelog('<MORE>');
			}
		}
	}
}

function dark_gamble_knock()
{
}

function menu_flirt_seth()
{
	let gr = get_player_value(player, 'sex');
	if (player_value_not_found == 1) gr = 0;
	if (gr == 0) return;

	let seth_wife = is_married('Seth');
	if (seth_wife != '')
	{
		writelog('');
		writelog('Seth is currently married to '+seth_wife);
		writelog('');
	}
	else
	{
		writelog('');
		writelog('(N)ever mind');
		writelog('(W)ink');
		writelog('(F)lutter Eyelashes');
		writelog('(D)rop Hanky');
		writelog('(A)sk The Bard To Buy You a Drink');
		writelog('(K)iss the Bard Soundly');
		writelog('(C)ompletely Seduce The Bard');
		writelog('(M)arry Her');
		writelog('');
		writelog('Your choice? (? for menu) : ');
	}
}

function menu_hear_seth()
{
	let sex = get_player_value(player, 'sex');
	if (player_value_not_found == 1) sex = 0;
	
	writelog('The Legend of the Red Dragon - Seth Able The Bard');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('Seth Able eyes you as you sit down next to him.');
	
	if (sex == 0)
	{
		writelog('');
		writelog('(`0A`2)sk Seth Able to sing');
		writelog('(`0R`2)eturn to Bar');
	}
	else
	{
		writelog('You can\'t help but notice that Seth Able is a');
		writelog('very handsome, very well built individual.  You');
		writelog('notice many other women watching him also.');
		writelog('');
		writelog('(`0A`2)sk Seth Able to sing');
		writelog('(`0F`2)lirt with Seth');
		writelog('(`0R`2)eturn to Bar');
	}
	
	writelog('');
	writelog('Seth Able looks at you expectantly. (? for menu)');
	writelog('');
	display_your_command();
}

function menu_seth_sings()
{
	let h = get_player_value(player, 'seenbard');
	if (player_value_not_found == 1) { h = 0; }
	
	if (0 == h)
	{
		let sex = get_player_value(player, 'sex');
		if (player_value_not_found == 1) sex = 0;
		
		set_player_value(player, 'seenbard', 1);

		let song = [];
		
		if (sex == 0) song = seth_songs_m[getRandomInt(seth_songs_m.length)];
		else song = seth_songs_f[getRandomInt(seth_songs_f.length)];
		
		writelog('');
		writelog('(Seth Able clears his throat)');
		writelog('');
		for(let i=0; i < song.length; i++)
		{
			writelog(String.format(song[i], player));
		}
		writelog('');
		
		if (sex == 0)
		{
			let f = getRandomInt(3)+1;
			inc_player_value(player, 'fights', f, MAX_VALUE);
			writelog('`#YOU RECEIVE '+f+' MORE FOREST FIGHTS FOR TODAY!');
		}
		else
		{
			inc_player_value(player, 'charm', 1, MAX_VALUE);
			writelog('`#YOU RECEIVE A CHARM POINT!');
		}
		
		writelog('');
		writelog('<MORE>');
	}
	else
	{
		writelog('');
		writelog('`%"I\'m sorry, but my throat is too dry.. Perhaps tomorrow."');
		writelog('');
		writelog('<MORE>');
	}
}

function stat_line()
{
	let h = get_player_value(player, 'hp');
	if (player_value_not_found == 1) { h = -1; }

	let mh = get_player_value(player, 'maxhp');
	if (player_value_not_found == 1) { mh = -1; }

	let f = get_player_value(player, 'fights');
	if (player_value_not_found == 1) { f = -1; }

	let gd = get_player_value(player, 'gold');
	if (player_value_not_found == 1) { gd = -1; }
	
	let g = get_player_value(player, 'gems');
	if (player_value_not_found == 1) { g = -1; }
	
	writelog('HP: (`0'+h+'`2 of `0'+mh+'`2) Fights: `0'+f+'`2 Gold: `0'+gd+'`2 Gems: `0'+g);
}

function onConnect()
{
	load_data();
}

function parse_flashing_text(s, c, x, y)
{
	let st = s.search('@');
	if (st != -1)
	{
		flash_zones.push([x+st,y]);
		
		let last = st;
		for(let i=st+1; i < s.length && s[i] != '@'; i++)
		{
			flash_zones.push([x + (i - last), y]);
			last=i;
		}
	}
	else
	{
		drawText(s, c, x, y);
	}
}

function onUpdate()
{
	if (text_lines >= 19)
	{
		let d = text_buffer.length - 19;
		
		for(i=0; i < d; i++)
		{
			text_buffer.shift();
			text_lines--;
		}
		clearScreen();
	}

	flash_zones = [];
	for(let i=0; i < text_buffer.length; i++)
	{
		let dt = '';
		let ns = colorize_string(''+text_buffer[i]);
		if (ns.length > 0)
		{
			let c = 9;
			let x = 0;
			for(let j=0; j < ns.length; j++)
			{
				if (typeof ns[j] === 'string')
				{
					parse_flashing_text(ns[j], c, x, i);
					x += ns[j].length;
				}
				else
				{
					c=ns[j];
				}
			}
		}
		else
		{
			parse_flashing_text(''+text_buffer[i], 9, 0, i);
		}
	}
	
	if (--flash_interval < 20)
	{
		for(let i=0; i < flash_zones.length; i+=2)
		{
			let a = flash_zones[i];
			if (i+1 < flash_zones.length)
			{
				let b = flash_zones[i+1];
				let w = b[0] - a[0];
				let ts = '';
				
				for(let j=0; j < w; j++)
				{
					ts += ' ';
				}
				
				drawText(ts, 16, a[0], a[1]);
			}
		}
	}
	
	if (flash_interval < 0) flash_interval=40;
	
	drawText('> '+status, 9, 0, 19);
}

function menu_exit() {}
function weapon_buy_yn() {}
function armor_buy_yn() {}
function dark_add() {}
function inn_add() {}

function flirt_violet()
{
	let gr = get_player_value(player, 'sex');
	if (player_value_not_found == 1) gr = 0;
	if (gr != 0) return;
	
	let violet_husband = is_married('Violet');
	if (violet_husband != '')
	{
		writelog('');
		writelog('Violet is currently married to '+violet_husband);
		writelog('');
		writelog('Grizelda greets you instead...');
		writelog('You find yourself with a hand full of cellulite...');
		writelog('');
	}
	else
	{
		writelog('');
		writelog('(N)ever mind');
		writelog('(W)ink');
		writelog('(K)iss Her Hand');
		writelog('(P)eck Her On The Lips');
		writelog('(S)it Her On Your Lap');
		writelog('(G)rab Her Backside');
		writelog('(C)arry Her Upstairs');
		writelog('(M)arry Her');
		writelog('');
		writelog('Your choice? (? for menu) : ');
	}
}

function pick_dark_gamble()
{
	/*let r = getRandomInt(100);
	if (r < 30)
	{
		current=dark_gamble_knock;
		draw_menu(1);
	}
	else if (r < 60)
	{
		current=dark_gamble_teeth;
		draw_menu(1);
	}
	else
	{*/
		last_guess = -2;
		guess_my_number = -1;
		current=dark_gamble_number;
		draw_menu(1);
	//}
}

function menu_baraks_house()
{
	writelog(' Visiting A Friend');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('Feeling a might lonely, you decide to pay a visit to a');
	writelog('dear friend. It\'s no short journey and you are quite');
	writelog('tired when you arrive.');
	writelog('');
	writelog('(K)nock on the door');
	writelog('(W)alk in like you own the place');
	writelog('(H)ead back to town');
	writelog('');
	writelog('You decide to... [K] : ');
}

function menu_baraks_headback()
{
	writelog('');
	writelog('You decide maybe you should have called first - and');
	writelog('trudge back home.');
}

function menu_baraks_walkin()
{
	writelog(' Uh oh...');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You saunter in like you own the place. Barak stares');
	writelog('at you in wonder as you help yourself to some meat');
	writelog('and cheese sitting on the table.');
	writelog('"You insolent pubby! You will die for this." the');
	writelog('bearded man growls.');
	writelog(' (A)ppologize and leave him be');
	writelog(' (K)ick him in the shin and have a good laugh');
	writelog('');
	writelog('You decide to... [A] : ');
}

function menu_baraks_apologize()
{
	// todo; not the actual text
	writelog('');
	writelog('"Oh, I thought you weren\'t home. My apologies."');
	writelog('');
	writelog('Barak throws you out of the house. You land in');
	writelog('a pile of manure.');
	
	dec_player_value(player, 'charm', 1, 0);
}

function menu_baraks_kick()
{
	writelog('');
	writelog('You kick him a good one!');
	writelog('He screams in pain!');
	writelog('');
	writelog('You help yourself to another chunk of bread, and');
	writelog('laugh so hard at Barak small pieces fly out of');
	writelog('your mouth and pummel him.');
	writelog('');
	writelog('"No more!" Barak shrieks in a rather high pitched');
	writelog('voice.');
	writelog('');
	writelog('You laugh. "Give me your most valuable possesion,');
	writelog('you hairy fool." you demand.');
	writelog('');
	writelog('"Alright! I\'ll give you a flask of my Ultra Ale.');
	
	let maxhp = get_player_value(player, 'maxhp');
	if (player_value_not_found == 1) maxhp = 15;
	
	inc_player_value(player, 'hp', parseInt(maxhp * 0.25), MAX_VALUE);
}

function menu_baraks_knock()
{
	writelog(' Visiting Old Friends');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('Barak opens the door!');
	writelog('');
	writelog('"Whadaya ya want, kid?" Barak asks harshly.');
	writelog('');
	writelog('(J)ust wanted to shoot the breeze, friend!');
	writelog('(C)an I borrow a cup of sugard, neighbor?');
	writelog('(Y)our beard went out of style centuries ago.');
	writelog('');
	writelog('You decide to say... [J] : ');
}

function menu_baraks_borrow()
{
	writelog(' Borrowing sugar..');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog(' todo');
	// supposed to be the same chase game
	// menu options are You animal! and Laugh
	// you animal starts the chase
	// laughing gives you 1 gem and ends the visit to barak's for the day
}

function menu_baraks_shoot_breeze()
{
	writelog(' Chatting With Barak');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('"Shoot the breeze?" Barak asks, obviously puzzled.');
	writelog('');
	writelog('(C)an I read some of your books?');
	writelog('(W)ant to play a game?');
	writelog('');
	writelog('You decide to say... [W] : ');
}

function menu_baraks_insult()
{
	writelog('');
	writelog('todo');
	//mom shows up
	//Agree
	// A HAIRY PREDICAMENT
	//successful hits gives xp
	//Tell
	//Get knocked down to 1HP. Visit ends
}

function menu_baraks_play()
{
	writelog('');
	writelog('"Game? Ok - Uh, want to play \'let\'s clean out');
	writelog(' the basement\'?');
	writelog('');
	writelog('(O)k, uh, that sounds like a really fun game.');
	writelog('(F)orget it. I\'m not that stupid.');
	writelog('');
	writelog('You decide to... [O] : ');
}

function menu_baraks_fun()
{
	writelog('There are six chests to choose from:');
	writelog('');
	writelog('(1) (2) (3) (4) (5) (6)');
	writelog('');
	writelog('You choose ... : ');
}

function menu_baraks_nofun()
{
	writelog('');
	writelog('"You stupid brat!" scream Barak in a fit of rage.');
	writelog('"Get out my house!"');
	writelog('');
	writelog('You wonder if helping out would have been that');
	writelog('bad of an idea...');
	writelog('');
	writelog('YOU TRUDGE HOME, FEELING LIKE A LOSER.');
}

function menu_baraks_read()
{
	writelog('');
	writelog('"Books?! BOOKS?! You know I can\'t read!" Barak');
	writelog(' shouts, tears streaming out of his eyes.');
	writelog('');
	writelog('(L)augh ......... at poor Barak.');
	writelog('(O)ffer to read him a story.');
	writelog('');
	writelog('You decide to say... [O] : ');
}

function menu_baraks_offer_story()
{
	barak_selected_book = getRandomInt(baraks_books.length);
	
	writelog('');
	writelog('"You will?" pitifully, wiping his nose. "Will');
	writelog(' you read this to me?"');
	writelog('');
	writelog('Barak shows you a book of....'+baraks_books[barak_selected_book]+'.');
	writelog('');
	writelog('You are non-plussed, but agree to read it.');
	writelog('');
}

function menu_baraks_start_reading()
{
	let key = baraks_books[barak_selected_book];
	let pages = baraks_books[key];

	writelog(' Story time with Barak');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');

	for(let i=0; i < pages.length; i++)
	{
		writelog(pages[i]);
	}

	writelog('');

	if (getRandomInt(100) > 70)
	{
		writelog('YOU LEARN SOMETHING FROM THE DRIVEL.');

		let perk = baraks_books_perks[key];
		if (perk[0] == 'hp')
		{
			inc_player_value(player, 'maxhp', 1, MAX_VALUE);
		}
		else if (skill_type('class') == perk[0])
		{
			let c = get_player_value(player, 'class');
			if (player_value_not_found == 1) c = 0;
			if (c == 0) inc_player_value(player, 'usesd', 1, MAX_VALUE);
			else if (c == 1) inc_player_value(player, 'usesm', 1, MAX_VALUE);
			else if (c == 2) inc_player_value(player, 'usest', 1, MAX_VALUE);
		}
	}
	
	writelog('');
	writelog('You put down the book. "Please, '+player.trim()+'!');
	writelog('Read more!" Barak whines.');
	writelog('');
	writelog('<MORE>^H^H^H^H You smile. "Nah, I gotta go.');
	writelog('See you later."');
	writelog('');
}

function menu_baraks_laugh()
{
	writelog('');
	writelog('You can\'t stop yourself from bellowing out in');
	writelog('laughter. Barak\'s face falls. Then turns to');
	writelog('stone.');
	writelog('');
	writelog('He then pulls out an Able\'s Sword!');
	writelog('');
	writelog('Barak Hunts you down like a dog.');
	writelog('');
	
	// todo; apparently there is a chase here w/ treasure but i don't know the details
	writelog(' YOU ARE DEFEATED.');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('Barak laughs as warm blood flows down your cheek.');
	writelog('Maybe next time?');
	writelog('');
	writelog('YOU FEEL AWFULLY WEAK.');
	
	set_player_value(player, 'hp', 1);
}

function show_enter_screen()
{
	writelog('              `0L`2egend `0O`2f The `0R`2ed `0D`2ragon');
	writelog('');
	writelog('     The current game has been running `0'+days_run+' `2days.');
	writelog('  Players are deleted after `0'+DELETION_GRACE_PERIOD_DAYS+' `2days of inactivity.');
	writelog('');
	writelog('            (`0E`2)nter the realm of the Dragon');
	writelog('            (`0I`2)nstructions');
	writelog('            (`0L`2)ist Warriors');
	writelog('            (`0Q`2)uit back to BBS');
	writelog('');
	writelog('            Your choice, warrior? [`0E`2]: ');
}

function create_new_player(name)
{
	if (players == undefined) players = [];
	
	let classd=0;
	let ud=0;
	let classm=0;
	let um=0;
	let classt=0;
	let ut=0;
	
	switch (chosen_class)
	{
		case 0: classd=1; ud=1; break;
		case 1: classm=1; um=1; break;
		case 2: classt=1; ut=1; break;
	}
	
	players.push(
	{
		'name'       :name,
		'str'        :10,
		'def'        : 1,
		'weapon'     :'Stick',
		'weapon_num' :1,
		'armor'      :'Coat',
		'armor_num'  :1,
		'kids'       :0,
		'horse'      :0,
		'gold'       :0, // gold in hand
		'bank'       :0, // gold in bank
		'lays'       :0,
		'xp'         :1,
		'seen_master':0,
		'fights'     :FOREST_FIGHTS_PER_DAY, // forest fights
		'pfights'    :HUMAN_FIGHTS_PER_DAY,   // human fights
		'seen_dragon':0,
		'class'      :chosen_class,	// active class
		'classd'     :classd,		// for multi-mastering d
		'classm'     :classm,		// for multi-mastering m
		'classt'     :classt,		// for multi-mastering t
		'usesd'      :ud,
		'usesm'      :um,
		'usest'      :ut,
		'dead'       :0,
		'pkills'     :0,
		'marriedto'  :'',
		'highspirits':1,
		'lastseen'   :-1,
		'level'      :1,
		'hp'         :20,
		'maxhp'      :20,
		'sex'        :chosen_gender,
		'gems'       :0,
		'charm'      :1,
		'seenviolet' :0,
		'won'        :0,
		'stayinn'    :0,
		'seenbard'   :0,
		'flirted'    :0,
		'fairies'    :0,
		'mastered'   :-1,
		'mastered2'  :-1,
		'mastered3'  :-1,
		'baraks_visited_today' :0
	});
}

function menu_login()
{
	writelog('Name or handle :');
}

function menu_joining()
{
	writelog('Joining The Game');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You have never visited the realm before. Do you want');
	writelog('to join this place of Dragons, Knights, Magic, Friends');
	writelog('& Foes and Good & Evil?');
	writelog('');
	writelog('(Y)es');
	writelog('(N)o');
	writelog('');
	writelog('Your choice? [Y] : ');
}

function menu_pick_gender()
{
	writelog('');
	writelog('And your gender? (M/F) [M] : ');
}

function menu_pick_class()
{
	writelog('');
	writelog('`%As you remember your childhood, you remember...');
	writelog('');
	writelog('(`5K`2)illing A Lot Of Woodland Creatures');
	writelog('(`5D`2)abbling In The Mystical Forces');
	writelog('(`5L`2)ying, Cheating, And Stealing From The Blind');
	writelog('');
	writelog('Pick one (`0K,D,L`2) : ');
}

function display_login_info()
{
	if (player_arrival == '') { player_arrival = formatAMPM(new Date()); }
	
	let extra_chars = 0;
	for(let j=0; j < player.length; j++) { if (player[j] == '`') { extra_chars+=2; } }
	
	writelog('`%           Warriors In The Realm Now');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog(' `0'+padEnd(16+extra_chars-1, player.trim(), ' ')+'`2 Arrived At    `%'+player_arrival);
	writelog('');
	writelog('`0Waking up is slow. You blame lastnights ale....');
	writelog('');

	if (getRandomInt(100) > 70)
	{
		set_player_value(player, 'highspirits', 0);
		writelog('You are in `0low`2 spirits today.');
	}
	else
	{
		set_player_value(player, 'highspirits', 1);
		writelog('You are in `0high`2 spirits today.');
	}

	let horse = get_player_value(player, 'horse');
	if (player_value_not_found == 1) horse = 0;
	
	if (horse > 0)
	{
		writelog('');
		writelog('@`4**@`% You ready your horse @`4**@');
	}

	writelog('');
	writelog('You wake up early, strap your Stick to your back, and');
	writelog('head out to the Town Square seeking adventure fame honor');
	writelog('');

	let type = skill_type('class');
	if (type == 'Thief')
	{
		writelog('For being a Pilferer, you get an extra use point!');
	}
	else
	{
		writelog('For being a '+type+', you get an extra use point!');
	}

	writelog('');
	writelog('<MORE>');
}

function display_the_way()
{
	switch (chosen_class)
	{
		case 0:
			writelog('');
			writelog('Now that you\'ve grown up, you have decided to study');
			writelog('the way of the Death Knights. All beginners want the');
			writelog('power to use their body and weapon as one. To inflict');
			writelog('twice the damage with the finesse only a warrior of');
			writelog('perfect mind can do.');
			writelog('');
		break;
		case 1:
			writelog('');
			writelog('You have always wanted to explain the unexplainable.');
			writelog('To understand the powerful forces that rule the earth.');
			writelog('To tame the beast that oversees all things. Of course,');
			writelog('having the power to burn someone by making a gesture');
			writelog('wouldn\'t hurt.');
			writelog('');
		break;
		case 2:
			writelog('');
			writelog('You decide to follow your instincts. To get better at');
			writelog('what you\'ve always done best. So you decide to lead a');
			writelog('dishonest lifestyle. Of course, your ultimate goal will');
			writelog('always be to join the Master Thieves Guild. To arrive,');
			writelog('remember one thing, "Even thieves have honor."');
			writelog('');
		break;
	}

	display_login_info();
}

function quitting_game()
{
	writelog('Quitting To The Fields...');
	writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
	writelog('You find a comfortable place to sleep under a small tree...');
	writelog('');
	writelog('RETURNING TO THE MUNDANE WORLD...');
	writelog('');
	current=menu_exit;
	draw_menu(0);
}

function find_player(target)
{
	for(let i=0; i < players.length; i++)
	{
		if (target == players[i]['name'])
		{
			return i;
		}
	}
	return -1;
}

function set_player_value(name, key, value)
{
	let p = find_player(name);
	if (p != -1)
	{
		players[p][key] = value;
		save_data();
		return 1;
	}
	return 0;
}

function get_player_value(name, key)
{
	player_value_not_found = 0;
	let p = find_player(name);
	if (p != -1) { return players[p][key]; }
	player_value_not_found = 1;
	return -1;
}

function inc_player_value(name, key, inc, maxval)
{
	let v = get_player_value(name, key);
	if (0 == player_value_not_found)
	{
		v += inc;
		if (v > maxval) { v = maxval; }
		
		set_player_value(name, key, v);
		
		return v;
	}
	
	return -1;
}

function dec_player_value(name, key, dec, minval)
{
	let v = get_player_value(name, key);
	if (0 == player_value_not_found)
	{
		v -= dec;
		if (v < minval) { v = minval; }
		
		if (set_player_value(name, key, v) == 1)
		{
			return v;
		}
	}
	return -1;
}

function draw_menu(c)
{
	if (c == 1) { clearlog(); }
	current();
	save_data();
}

function quit_main()
{
	clearlog();
	writelog('');
	writelog('Your very soul aches as you wake up from your');
	writelog('favorite dream.');
	writelog('');
	writelog('RETURNING TO THE MUNDANE WORLD...');
	writelog('');
	current=menu_exit;
	draw_menu(0);
	//r1.close;
}

function menu_finish_login()
{
	display_login_info();
}

function colorize_string(s)
{
	if (s[0] == '=') return [s.substring(1)];
	
	const color_table = {'1':2, '2':9, '3':4, '4':5, '5':6, '6':7, '7':8, '8':0, '9':10,
						 '0':11, '!':12,
						 '&':13, // @ is missing so i swapped it out for this
						 '#':14,
						 'S':15, // $ is missing so i swapped it out for this
						 '%':16};
	let ns = [9];
	let starts_with = s[0] == '`';
	let split = s.split('`');
	
	if (s.indexOf('`') != -1)
	{
		for(let i=0; i < s.length; i++)
		{
			if (i < s.length && s[i] == '`')
			{
				if (s[i+1] == '`')
				{
					ns.push('`');
					i++;
				}
				else
				{
					let c = color_table[s[++i]];
					if (c != undefined) ns.push(c);
				}
			}
			else
			{
				ns.push(s[i]);
			}
		}
	
		return ns;
	}
	return [];
}




function mainLOOP()
{

        //show_banner();
		players = default_players;
        current=menu_main;
        draw_menu(1);
        display_your_command();

}        
        
      
    
    //let dead = get_player_value(player, 'dead');
    //if (player_value_not_found == 1) { dead = 0; }
    
    //if (dead == 1)
    //{
    //    current = menu_exit();
    //    draw_menu(0);
    //    
    //}


mainLOOP();



function onInput(key)
{

	//let k = fromChr(key).toLowerCase();
	let k = String(key).toLowerCase();
	if (current == menu_main)
	{
		if (k == '?')
		{
			draw_menu(1);
		}
		
		
		
		if (k == 'f')
		{
			last_menu=current;
			current=menu_forest;
			draw_menu(1);
		}
		else if (k == 'k') //k
		{
			handle_wbuy=0;
			handle_wsell=0;
			last_menu=current;
			current=menu_weapons;
			draw_menu(1);
		}
		else if (k == 'h') //h
		{
			last_menu = current;
			current = menu_heal;
			draw_menu(1);
		}
		else if (k == 'i') //i
		{
			last_menu=current;
			current=menu_inn;
			draw_menu(1);
		}
		else if (k == 'y') //y
		{
			last_menu=current;
			handled_bank=0;
			current=menu_bank;
			draw_menu(1);
		}
		else if (k == 'w') //w
		{
			last_menu=current;
			current=menu_mail;
			draw_menu(1);
		}
		else if (k == 'c')  //c
		{
			last_menu=current;
			current=menu_conj;
			draw_menu(1);
		}
		else if (k == 'x') //x
		{
			writelog('');
			writelog('NOT IMPLEMENTED');
			status='TODO: expert mode';
			draw_menu(0);
		}
		else if (k == 'p') //p
		{
			last_menu=current;
			current=menu_people;
			draw_menu(1);
		}
		else if (k == 'm') //m
		{
			last_menu=current;
			current=menu_message;
			draw_menu(1);
			writelog('');
			writelog('NOT IMPLEMENTED');
			writelog('');
			draw_menu(0);
			current = last_menu;
			display_your_command();	
		}
		else if (k == 'a')  //a
		{
			handle_abuy=0;
			handle_asell=0;
			last_menu=current;
			current=menu_armor;
			draw_menu(1);
		}
		else if (k == 'v') //v
		{
			last_menu=current;
			current=menu_stats;
			draw_menu(1);
			
			//current=menu_main;
			//draw_menu(0);
			display_your_command();
		}
		else if (k == 't') //t
		{
			fill_master_data();
			last_menu=current;
			current=menu_training;
			draw_menu(1);
			display_your_command();
		}
		else if (k == 'l') //l
		{
			last_menu=current;
			current=menu_list;
			draw_menu(1);
		}
		else if (k == 'd') //d
		{
			last_menu=current;
			current=menu_news;
			draw_menu(1);
			current=menu_main;
			draw_menu(0);
		}
		else if (k == 'o') //o
		{
			buffer='';
			clearStatus();
			other_menu_index=0;
			//last_menu=current;
			//current=menu_other;
			writelog('');
			writelog('NOT IMPLEMENTED');
			writelog('');
			draw_menu(0);
		}
		else if (k == 's') //s
		{
			//last_menu=current;
			//current = menu_slaughter;
			//draw_menu(1);
			writelog('');
			writelog('NOT IMPLEMENTED');
			writelog('');
			draw_menu(0);
		}
		else if (k == '0') // cheat for testing to get to dark cloak, todo; remove
		{
			last_menu=current;
			current = menu_dark_cloak;
			draw_menu(1);
		}
		else if (k == 'g')
		{
			//status=buffer='200';
			//current=dwarf_game;
			//draw_menu(1);
		}
		else if (k == 'q')
		{
			current=quitting_game;
			draw_menu(1);
		}
	}
	else if (current == menu_other)
	{
		if (key != 10)
		{
			if (key != 0)
			{
				if (key == 8)
				{
					clearStatus();
					buffer = buffer.substring(0, buffer.length - 1);
					status = buffer;
					return;
				}
				buffer += fromChr(key);
				status=buffer;
			}
			return;
		}
		else if (buffer == '')
		{
			if (other_menu_index < igms.length) buffer = 'n';
			else buffer = 'q';
		}

		if (buffer == 'n')
		{
			if (other_menu_index < igms.length) draw_menu(1);
		}
		else if (buffer == 'q')
		{
			current=menu_main;
			draw_menu(1);
		}
		else if (buffer == 'b')
		{
			other_menu_index -= OTHER_MENU_SIZE*2;
			draw_menu(1);
		}
		else
		{
			other_menu_index = 0;
			let choice = parseInt(buffer);
			if (choice == '1')
			{
				let visited = get_player_value(player, 'baraks_visited_today');
				if (player_value_not_found == 1) visited=0;
				if (!visited)
				{
					set_player_value(player, 'baraks_visited_today', 1);
					current=menu_baraks_house;
					draw_menu(1);
				}
				else
				{
					clearlog();
					writelog(' Visiting A Friend');
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
					writelog(' You like Barak and all - But you feel a might too');
					writelog(' weary to make the trip. Maybe tomorrow.');
					writelog('');
					writelog('<MORE>');
				}
			}
		}
		
		buffer='';
		clearStatus();
	}
	else if (current == menu_baraks_house)
	{
		if (k == 'k' || key == 10)
		{
			current=menu_baraks_knock;
			draw_menu(1);
		}
		else if (k == 'w')
		{
			current=menu_baraks_walkin;
			draw_menu(1);
		}
		else if (k == 'h')
		{
			current=menu_baraks_headback;
			draw_menu(0);
		}
	}
	else if (current == menu_baraks_walkin)
	{
		if (k == 'a' || key == 10)
		{
			current=menu_baraks_apologize;
			draw_menu(0);
		}
		else if (k == 'k')
		{
			current=menu_baraks_kick;
			draw_menu(0);
		}
	}
	else if (current == menu_baraks_knock)
	{
		if (k == 'j' || key == 10)
		{
			current=menu_baraks_shoot_breeze;
			draw_menu(1);
		}
		else if (k == 'c')
		{
			current=menu_baraks_borrow;
			draw_menu(1);
		}
		else if (k == 'y')
		{
			current=menu_baraks_insult;
			draw_menu(0);
		}
	}
	else if (current == menu_baraks_borrow)
	{
		current=menu_other;
		draw_menu(1);
	}
	else if (current == menu_baraks_shoot_breeze)
	{
		if (k == 'w' || key == 10)
		{
			current=menu_baraks_play;
			draw_menu(0);
		}
		else if (k == 'c')
		{
			current=menu_baraks_read;
			draw_menu(1);
		}
		else if (k == 'y')
		{
			current=menu_baraks_insult;
			draw_menu(1);
		}
	}
	else if (current == menu_baraks_headback)
	{
		current=menu_other;
		draw_menu(1);
	}
	else if (current == menu_baraks_apologize)
	{
		current=menu_other;
		draw_menu(1);
	}
	else if (current == menu_baraks_kick)
	{
		current=menu_other;
		draw_menu(1);
	}
	else if (current == menu_baraks_insult)
	{
		current=menu_other;
		draw_menu(1);
	}
	else if (current == menu_baraks_play)
	{
		if (k == 'o' || key == 10)
		{
			barak_earned_gold=0;
			let lvl = get_player_value(player, 'level');
			if (player_value_not_found == 1) lvl = 1;
			let max_gold = 200 * lvl; // just eyeballing this, not official
			let crazy_mother = getRandomInt(6);
			baraks_chests = [];
			for(let i=0; i < 6; i++)
			{
				if (i == crazy_mother) baraks_chests.push(-1);
				else baraks_chests.push(getRandomInt(max_gold)+25);
			}
			current=menu_baraks_fun;
			draw_menu(1);
		}
		else if (k == 'f')
		{
			current=menu_baraks_nofun;
			draw_menu(1);
		}
	}
	else if (current == menu_baraks_fun)
	{
		if (k == 'n')
		{
			inc_player_value(player, 'gold', barak_earned_gold, MAX_VALUE);
			writelog('You made off with '+barak_earned_gold+' gold!');
			writelog('');
			current=menu_other;
			draw_menu(0);
		}
		else
		{
			let ki = parseInt(k);
			if (ki >= 1 && ki <= 6)
			{
				let reward = baraks_chests[ki-1];
				if (reward == -1)
				{
					// todo; not the official message, i couldn't find it
					writelog('Out pops Barak\'s crazy mother.');
					writelog('She chases you out of the home!');
					writelog('Barak\'s mom takes back what you\'ve stolen.');
					writelog('');
					barak_earned_gold=0;
					current=menu_other;
					draw_menu(0);
				}
				else if (reward > 0)
				{
					barak_earned_gold += reward;
					writelog('You find '+reward+' in the chest!');
					writelog('Choose another... or N to stop. ');
				}
			}
		}
	}
	else if (current == menu_baraks_nofun)
	{
		current=menu_other;
		draw_menu(1);
	}
	else if (current == menu_baraks_read)
	{
		if (k == 'o' || key == 10)
		{
			current=menu_baraks_offer_story;
			draw_menu(1);
		}
		else if (k == 'l')
		{
			current=menu_baraks_laugh;
			draw_menu(1);
		}
	}
	else if (current == menu_baraks_offer_story)
	{
		current=menu_other;
		draw_menu(1);
	}
	else if (current == menu_baraks_laugh)
	{
		current=menu_other;
		draw_menu(1);
	}
	else if (current == menu_slaughter)
	{
		if (k == 'r' || key == 10)
		{
			current=last_menu;
			draw_menu(1);
		}
		else if (k == 's')
		{
			current=menu_slaughter_fail;
			draw_menu(0);
		}
		else if (k == 'l')
		{
			current=menu_slaughter;
			draw_menu(1);
			display_your_command();
			
		}
	}
	else if (current == menu_slaughter_fail)
	{
		current = last_menu;
		draw_menu(1);
	}
	else if (current == menu_slaughter_success)
	{
		current = last_menu;
		draw_menu(1);
	}
	else if (current == menu_training_fight)
	{
		if (master_handled == 1)
		{
			last_menu=menu_main;
			current = menu_main;
			draw_menu(1);
		}
		else
		{
			if (k == 'a' || key == 10) //a or enter
			{
				clearlog();
				master_attackedby();
				//current = last_menu;
				//draw_menu(0);
				//display_your_command();
			}
			else if (k == 's') //s
			{
				fill_master_data();
				last_menu = menu_training_fight;
				current = menu_stats;
				draw_menu(1);
			}
			else if (k == 'd' || k == 'm' || k == 't')
			{
				writelog('');
				writelog('** '+skill_type('class')+' Skills **');
				writelog('');
				writelog('Your honor stops you from using the more unorthodox methods of');
				writelog('battle against your teacher.');
				writelog('');
				writelog('');
				draw_menu(0);
				display_your_command();
			}
			else if (k == 'r') //r
			{
				current = menu_main;
				draw_menu(1);
			}
		}
	}
	//else if (current == menu_training_question)
	//{
	//	last_menu = menu_main;
	//	current = menu_training;
	//	draw_menu(1);
	//}
	else if (current == menu_training)
 	{
		if (k == 'q') //q
		{
			last_menu = menu_training;
			current = menu_training_question;
			draw_menu(1);
			current = last_menu;
			draw_menu(0);
			display_your_command();


		}
		else if (k == 'a') //a
		{
			let ms = get_player_value(player, 'seen_master');
			if (player_value_not_found == 1) { ms = 0; }
			
			if (ms == 1)
			{
				clearlog();
				writelog('  Fighting Your Master');
				writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
				writelog('"I\'d like to battle again, but it is late my son."');
				writelog(master+' tells you. You figure you will try again');
				writelog('tomorrow.');
				writelog('');
				writelog('Your master is '+master);
				writelog('');
				writelog('<MORE>');
				return;
			}
			
			let x = get_player_value(player, 'xp');
			if (player_value_not_found == 1) { x = 0; }
			
			let needed = get_xpneeded();
			if (x < needed)
			{
				let w = get_player_value(player, 'weapon');
				if (player_value_not_found == 1) { w = ''; }
				
				clearlog();
				writelog('  Fighting Your Master');
				writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
				writelog('You are escorted down the hallway and into the arena.');
				writelog('');
				writelog('THE BATTLE BEGINS!');
				writelog('');
				writelog('You raise your '+w+' to strike! You wonder why');
				writelog('everyone is looking at you with grins...');
				writelog('');
				writelog('Your weapon is gone! You are holding air!');
				writelog('');
				writelog('You meekly accept the fact that you are not ready');
				writelog('for your testing.');
				writelog('');
				writelog('Your master is '+master);
				writelog('');
				//writelog('<MORE>');
				//return;
			current = menu_training_fight;
			draw_menu(1);
			display_your_command();
	
			}
	
		}
		else if (k == 'v') //v
		{
			writelog('');
			writelog('TBD');
			writelog('');
			draw_menu(0);
			display_your_command();
			//todo:visit hall
		}
		else if (k == 'r' || key == 10) //r or enter
		{
			current = menu_main;
			draw_menu(1);
		}
	}
	else if (current == dark_add)
	{
		if (key == 10) //enter
		{
			if (buffer.length > 75) buffer = buffer.substring(0, 75);
			current=menu_dark_convo;
			dark_new_convo.push(player);
			dark_new_convo.push(' ' + buffer);
			buffer='';
			clearStatus();
			save_data();
			current = menu_dark_convo;
			draw_menu(1);
		}
		else if (key != 0)
		{
			if (key == 8)
			{
				clearStatus();
				buffer = buffer.substring(0, buffer.length - 1);
				status = buffer;
				return;
			}
			buffer += fromChr(key);
			status=buffer;
		}
	}
	else if (current == menu_dark_convo)
	{
		if (k == 'c' || key == 10)  //c or enter
		{
			last_menu=menu_main;
			current=menu_dark_cloak;
			draw_menu(1);
		}
		else if (k == 'a')  //a
		{
			last_menu=menu_dark_convo;
			current=dark_add;
			clearlog();
			writelog('');
			writelog('Share your feelings now.. (Max 75 char!)');
			writelog('');
			writelog('>');
		}
	}
	else if (current == menu_dark_cloak)
	{
		if (k == 'c')  //c
		{
			last_menu=menu_dark_cloak;
			current=menu_dark_convo;
			draw_menu(1);
		}
		else if (k == 'e') // e
		{
			last_menu=menu_dark_cloak;
			current=examine_detch;
			draw_menu(1);
		}
		else if (k == 't') //t
		{
			last_menu=menu_dark_cloak;
			current=talk_dbartender;
			draw_menu(1);
		}
		else if (k == 'd') //d
		{
			last_menu=menu_dark_cloak;
			current=menu_news;
			draw_menu(1);
		}
		else if (k == 'y') //y
		{
			last_menu=menu_dark_cloak;
			current=menu_stats;
			draw_menu(1);
		}
		else if (k == 'g') //g
		{
			let gd = get_player_value(player, 'gold');
			if (player_value_not_found == 1) { gd = 0; }

			if (gd > 0)
			{
				dark_wager=0;
				status=buffer='';
				last_menu=menu_dark_cloak;
				current=dark_gamble;
				draw_menu(1);
			}
			else
			{
				writelog('');
				writelog('Come back when you have some gold.');
				writelog('');
				
				last_menu = menu_dark_cloak;
				draw_menu(0);
			}
		}
		else if (k == 'r' || key == 10) //r or enter
		{
			current=last_menu;
			draw_menu(1);
		}
	}
	else if (current == dark_gamble)
	{
		if (key == 10)  //enter
		{
			let gd = get_player_value(player, 'gold');
			if (player_value_not_found == 1) { gd = 0; }
			
			let bet_amount = parseInt(buffer);
			status = buffer = '';
			
			if (bet_amount == 0)
			{
				current=menu_dark_cloak;
				draw_menu(1);
			}
			else if (bet_amount == 1)
			{
				if (gd > 0)
				{
					dark_wager = gd;
					
					set_player_value(player, 'gold', 0);

					pick_dark_gamble();
				}
			}
			else
			{
				if (gd >= bet_amount)
				{
					dark_wager = bet_amount;
					
					dec_player_value(player, 'gold', dark_wager, 0);
					
					pick_dark_gamble();
				}
				else
				{
					buffer='';
					clearStatus();
				}
			}
		}
		else if (key == 8) // backspace
		{
			if (buffer != '')
			{
				buffer = buffer.substring(0, buffer.length-1);
				clearStatus();
				status = buffer;
			}
		}
		else
		{
			buffer += fromChr(key);
			status = buffer;
		}
	}
	else if (current == dark_gamble_knock)
	{
	}
	else if (current == dark_gamble_number)
	{
		if (last_guess == guess_my_number || guess_tries <= 0)
		{
			if (key == 10)
			{
				current = menu_dark_cloak;
				draw_menu(1);
			}
		}
		else
		{
			if (key == 10)
			{
				last_guess = parseInt(buffer);
				buffer='';
				status='      ';
				draw_menu(0);
			}
			else if (key == 8) // backspace
			{
				if (buffer != '')
				{
					buffer = buffer.substring(0, buffer.length-1);
					clearStatus();
					status = buffer;
				}
			}
			else
			{
				buffer += fromChr(key);
				status = buffer;
			}
		}
	}
	else if (current == dark_gamble_teeth)
	{
	}
	else if (current == talk_dbartender)
	{
		if (entering_target == 1)
		{
			if (key == 10) // enter
			{
				let p = find_player(buffer);
				if (buffer != '' && p != -1)
				{
					dec_player_value(player, 'gems', 2, 0);
					clearlog();
					
					let horse = 'None';
					let h = players[p]['horse'];
					if (h == 1) { horse='White'; } else {horse='Black'; }
					
					writelog('This is what I know about '+buffer);
					writelog('');
					writelog(' Strength: '+players[p]['str']);
					writelog(' Defense : '+players[p]['def']);
					writelog(' Weapon  : '+players[p]['weapon']);
					writelog(' Armour  : '+players[p]['armor']);
					writelog(' Children: '+players[p]['kids']);
					writelog(' Horse   : '+horse);
					writelog(' Bank    : '+players[p]['bank']);
					writelog('');
					writelog('<MORE>');
				}
				else
				{
					writelog('Could not find '+buffer);
					writelog('');
					writelog('<MORE>');
				}
				buffer = status = '';
				entering_target=0;
			}
			else
			{
				if (key == 8)
				{
					clearStatus();
					buffer = buffer.substring(0, buffer.length - 1);
					status = buffer;
					return;
				}
				buffer += fromChr(key);
				status = buffer;
			}
		}
		else if (switching_profession == 0)
		{
			if (k == 'c') //c
			{
				let type = skill_type('class');
				
				if (type == 'Death Knight')
				{
					writelog('(M)ystical Knight');
					writelog('(T)hief');
				}
				else if (type == 'Mystical')
				{
					writelog('(D)eath Knight');
					writelog('(T)hief');
				}
				else if (type == 'Thief')
				{
					writelog('(D)eath Knight');
					writelog('(M)ystical Knight');
				}
				switching_profession=1;
			}
			else if (k == 'l') //l
			{
				let g = get_player_value(player, 'gems');
				if (player_value_not_found == 1) { g = 0; }
				
				if (g >= 2)
				{
					buffer='';
					entering_target = 1;
					writelog('Pick a target: ');
				}
				else
				{
					writelog('');
					writelog('Not enough gems, requires 2.');
					writelog('');
					writelog('<MORE>');
				}
			}
			else if (k == 't') //t
			{
				writelog('"C`3o`4l`5o`6r`7s`8!`%", Chance laughs, "They are easy."');
				writelog('');
				writelog('``1 ``2 ``3 ``4 ``5 ``6 ``7 ``8 ``9 ``0 ``! ``& ``# ``S ``%');
				writelog('`1^^ `2^^ `3^^ `4^^ `5^^ `6^^ `7^^ `8^^ `9^^ `0^^ `!^^ `&^^ `#^^ `S^^ `%^^');
				writelog('');
				writelog('``5Colors are ``%FUN``5! would look like...');
				writelog('');
				writelog('`5Colors are `%FUN`5! would look like...');
				writelog('');
				writelog('"Using that symbol and a number, you can make');
				writelog('any color. They don\'t work in mail, but try \'em');
				writelog('talking to people or write it in the dirt."');
				writelog('');
			}
			else if (k == 'p') //p
			{
				writelog('');
				writelog('');
				writelog('<MORE>');
			}
			else if (k == 'r' || key == 10) // r or enter
			{
				current=last_menu;
				draw_menu(1);
			}
			else status=key;
		}
		else
		{
			if (k == 'd') //d
			{
				switching_profession = 0;
				skill = 0;
				writelog('');
				writelog('New Profession: '+skill_type('class'));
				writelog('');
				writelog('<MORE>');
			}
			else if (k == 'm') //m
			{
				switching_profession = 0;
				skill = 1;
				writelog('');
				writelog('New Profession: '+skill_type('class'));
				writelog('');
				writelog('<MORE>');
			}
			else if (k == 't') //t
			{
				switching_profession = 0;
				skill = 2;
				writelog('');
				writelog('New Profession: '+skill_type('class'));
				writelog('');
				writelog('<MORE>');
			}
			else
			{
				switching_profession = 0;
				current=last_menu;
				draw_menu(1);
			}
		}
	}
	else if (current == examine_detch)
	{
		current=last_menu;
		draw_menu(1);
	}
	else if (current == inn_add)
	{
		if (key == 10) //enter
		{
			if (buffer.length > 75) buffer = buffer.substring(0, 75);
			current=menu_inn_convo;
			inn_new_convo.push(player);
			inn_new_convo.push(buffer);
			buffer='';
			clearStatus();
			save_data();
			current = menu_inn_convo;
			draw_menu(1);
		}
		else if (key != 0)
		{
			if (key == 8)
			{
				clearStatus();
				buffer = buffer.substring(0, buffer.length - 1);
				status = buffer;
				return;
			}
			buffer += fromChr(key);
			status = buffer;
		}
	}
	else if (current == menu_inn_convo)
	{
		if (k == 'c' || key == 10)  //c or enter
		{
			last_menu=menu_main;
			current=menu_inn;
			draw_menu(1);
		}
		else if (k == 'a')  //a
		{
			last_menu=menu_inn_convo;
			current=inn_add;
			clearlog();
			writelog('');
			writelog('Share your feelings now.. (Max 75 char!)');
			writelog('');
			writelog('>');
		}
	}
	else if (current == menu_exit)
	{
	}
	else if (current == flirt_violet)
	{
		if (k == 'n' || key == 10) // enter or n
		{
			current=menu_inn;
			draw_menu(1);
		}
		else
		{
			handle_violet(k);
		}
	}
	else if (current == got_room) {}
	else if (current == menu_get_room)
	{
		if (key == 121) //y
		{
			let gd = get_player_value(player, 'gold');
			if (player_value_not_found == 1) { gd = 0; }
			
			if (gd >= room_cost)
			{
				dec_player_value(player, 'gold', room_cost, 0);
				set_player_value(player, 'stayinn', 1);
				current = got_room;
				draw_menu(1);
			}
			else
			{
				writelog('');
				writelog('You do not have enough gold.');
				writelog('');
				writelog('<MORE>');
			}
		}
		else if (key == 110 || key == 10) //n or enter
		{
			current=last_menu;
			draw_menu(1);
		}
		else
		{
			status = key;
		}
	}
	else if (current == menu_bartender_gems_drank)
	{
		current=talk_bartender;
		draw_menu(1);
	}
	else if (current == menu_bartender_no_bribe)
	{
		current=talk_bartender;
		draw_menu(1);
	}
	else if (current == menu_bartender_bribe)
	{
		if (k == 'n' || key == 10)
		{
			current=menu_bartender_no_bribe;
			draw_menu(0);
		}
		else if (k == 'y')
		{
			current=menu_bartender_yes_bribe;
			draw_menu(0);
		}
	}
	else if (current == menu_bartender_gems_buy)
	{
		if (k == 'h')
		{
			inc_player_value(player, 'maxhp', drinks_requested, MAX_VALUE);
			current = menu_bartender_gems_drank;
			draw_menu(0);
		}
		else if (k == 's')
		{
			inc_player_value(player, 'str', drinks_requested, MAX_VALUE);
			current = menu_bartender_gems_drank;
			draw_menu(0);
		}
		else if (k == 'v')
		{
			inc_player_value(player, 'def', drinks_requested, MAX_VALUE);
			current = menu_bartender_gems_drank;
			draw_menu(0);
		}
	}
	else if (current == menu_bartender_gems)
	{
		if (key == 10) //enter
		{
			if (buffer == '') drinks_requested = max_buy_drinks;
			else drinks_requested = parseInt(buffer);
			
			if (drinks_requested >= 1)
			{
				dec_player_value(player, 'gems', drinks_requested * 2, 0);
				buffer='';
				clearStatus();
				current = menu_bartender_gems_buy;
				draw_menu(0);
			}
			else
			{
				buffer='';
				clearStatus();
				current = talk_bartender;
				draw_menu(1);
			}
		}
		else if (key != 0)
		{
			if (key == 8)
			{
				clearStatus();
				buffer = buffer.substring(0, buffer.length - 1);
				status = buffer;
				return;
			}
			buffer += fromChr(key);
			status=buffer;
		}
	}
	else if (current == menu_bartender_violet)
	{
		current=talk_bartender;
		draw_menu(1);
	}
	else if (current == menu_bartender_seth)
	{
		current=talk_bartender;
		draw_menu(1);
	}
	else if (current == menu_bartender_no_namechange)
	{
		current=talk_bartender;
		draw_menu(1);
	}
	else if (current == menu_bartender_confirm_namechange)
	{
		if (k == 'y' || key == 10) // enter or y
		{
			current=menu_bartender_accept_namechange;
			draw_menu(0);
		}
		else if (k == 'n')
		{
			current=menu_bartender_no_namechange;
			draw_menu(0);
		}
	}
	else if (current == menu_bartender_yes_namechange)
	{
		if (key == 10) //enter
		{
			if (buffer == '')
			{
				writelog('Try a longer name, bonehead!');
				writelog('');
				return;
			}
			
			if (buffer.length > 15) buffer = buffer.substring(0, 30);
			name_to_change = buffer;
			buffer='';
			clearStatus();
			current = menu_bartender_confirm_namechange;
			draw_menu(0);
		}
		else if (key != 0)
		{
			if (key == 8)
			{
				clearStatus();
				buffer = buffer.substring(0, buffer.length - 1);
				status = buffer;
				return;
			}
			buffer += fromChr(key);
			status=buffer;
		}
	}
	else if (current == menu_bartender_fail_namechange)
	{
		current=talk_bartender;
		draw_menu(1);
	}
	else if (current == menu_bartender_changename)
	{
		if (k == 'n' || key == 10) // enter or n
		{
			current=menu_bartender_no_namechange;
			draw_menu(0);
		}
		else if (k == 'y')
		{
			let gold = get_player_value(player, 'gold');
			if (player_value_not_found == 1) gold = 0;
			
			if (gold < change_name_cost)
			{
				current=menu_bartender_fail_namechange;
				draw_menu(0);
			}
			else
			{
				current=menu_bartender_yes_namechange;
				draw_menu(0);
			}
		}
	}
	else if (current == talk_bartender)
	{
		last_menu=talk_bartender;
		
		if (k == 'r' || key == 10) //enter or r
		{
			current=menu_inn;
			draw_menu(1);
		}
		else if (k == 'v')
		{
			let sex = get_player_value(player, 'sex');
			if (player_value_not_found == 1) sex = 0;
			if (sex == 0) current=menu_bartender_violet;
			else current=talk_bartender;
			draw_menu(0);
		}
		else if (k == 'g')
		{
			current=menu_bartender_gems;
			draw_menu(0);
		}
		else if (k == 'b')
		{
			current=menu_bartender_bribe;
			draw_menu(0);
		}
		else if (k == 'c')
		{
			current=menu_bartender_changename;
			draw_menu(0);
		}
		else if (k == 's')
		{
			let sex = get_player_value(player, 'sex');
			if (player_value_not_found == 1) sex = 0;
			if (sex == 1) current=menu_bartender_seth;
			else current=talk_bartender;
			draw_menu(0);
		}
		else if (k == '?')
		{
			current=talk_bartender;
			draw_menu(1);
		}
	}
	else if (current == menu_inn)
	{
		if (k == 'c')  //c
		{
			last_menu=menu_inn;
			current=menu_inn_convo;
			draw_menu(1);
		}
		else if (k == 'd') //d
		{
			last_menu=menu_inn;
			current=menu_news;
			draw_menu(1);
		}
		else if (k == 'f') //f
		{
			last_menu=menu_inn;
			current=flirt_violet;
			draw_menu(1);
		}
		else if (k == 't') //t
		{
			last_menu=menu_inn;
			current=talk_bartender;
			draw_menu(1);
		}
		else if (k == 'g') //g
		{
			last_menu=menu_inn;
			current=menu_get_room;
			draw_menu(1);
		}
		else if (k == 'v') //v
		{
			last_menu=menu_inn;
			current=menu_stats;
			draw_menu(1);
		}
		else if (k == 'h') //h
		{
			last_menu=menu_inn;
			current=menu_hear_seth;
			draw_menu(1);
		}
		else if (k == 'm') //m
		{
			last_menu=menu_inn;
			current=menu_message;
			draw_menu(1);
		}
		else if (k == 'r' || key == 10) //r or enter
		{
			current=menu_main;
			draw_menu(1);
		}
	}
	else if (current == menu_hear_seth)
	{
		if (k == 'r' || key == 10) //enter or r
		{
			current=menu_inn;
			draw_menu(1);
		}
		else if (k == 'a')
		{
			current=menu_seth_sings;
			draw_menu(0);
		}
		else if (k == 'f')
		{
			let sex = get_player_value(player, 'sex');
			if (player_value_not_found == 1) sex = 0;
			
			if (sex != 0)
			{
				current=menu_flirt_seth;
				draw_menu(1);
			}
		}
		else if (k == '?')
		{
			current=menu_hear_seth;
			draw_menu(1);
		}
	}
	else if (current == menu_seth_sings)
	{
		if (key == 10)
		{
			current=menu_hear_seth;
			draw_menu(1);
		}
	}
	else if (current == menu_flirt_seth)
	{
		if (k == 'n' || key == 10) // enter or n
		{
			current=menu_hear_seth;
			draw_menu(1);
		}
		else
		{
			handle_seth(k);
		}
	}
	else if (current == menu_news)
	{
		current=last_menu;
		draw_menu(1);
	}
	else if (current == menu_begin_heal)
	{
		status = key.toString();
		
		//if (key == 8) // backspace
		//{
		//	buffer = buffer.substring(0, buffer.length-1);
		//}
		//else if (key == 10) // enter
		//{
			let gd = get_player_value(player, 'gold');
			if (player_value_not_found == 1) { gd = 0; }
			
			let n = parseInt(status);
			
			let heal_cost = n*healamt();
			
			if (n == 0) { writelog('Cancelled heal'); writelog(''); }
			else if (gd < heal_cost) { writelog('Not enough gold.'); writelog(''); }
			else
			{
				let h = inc_player_value(player, 'hp', n, MAX_VALUE);

				let mh = get_player_value(player, 'maxhp');
				if (player_value_not_found == 1) { mh = 0; }

				if (h > mh)
				{
					set_player_value(player, 'hp', mh);
					h = get_player_value(player, 'hp');
					if (player_value_not_found == 1) { h = 0; }
				}

				gd = dec_player_value(player, 'gold', heal_cost, 0);

				writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
				writelog('');
				writelog('Done!');
				writelog('');
				writelog('HP: ('+h+' of '+mh+') Gold: '+gd);
				writelog('(it costs '+healamt()+' to heal 1 hitpoint)');
				writelog('');
				writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
			}
			
			buffer = '';
			
			current = last_menu;
			draw_menu(0);
		//}
		//else
		//{
		//	buffer += fromChr(key);
		//}
		
		status = buffer;
	}
	else if (current == menu_heal)
	{
		if (k == 'h') //h
		{
			let h = get_player_value(player, 'hp');
			if (player_value_not_found == -1) { h = 0; }

			let mh = get_player_value(player, 'maxhp');
			if (player_value_not_found == -1) { mh = 0; }

			let gd = get_player_value(player, 'gold');
			if (player_value_not_found == -1) { gd = 0; }
			
			clearlog();
			if (h < mh)
			{
				let n = mh - h;
				let heal_cost = n * healamt();
				
				if (gd < heal_cost)
				{
					writelog('  Healers');
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
					writelog('Not enough gold.');
					writelog('');
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
				}
				else
				{
					set_player_value(player, 'hp', mh);
					dec_player_value(player, 'gold', heal_cost, 0);
					
					writelog('  Healers');
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
					writelog('');
					writelog(n+' hit points are healed and you feel much better.');
					writelog('');
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
				}
			}
			else
			{
				writelog('  Healers');
				writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
				writelog('"You look fine to us!" the healers tell you.');
				writelog('');
				writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
			}

			current = last_menu;
			draw_menu(0);
		}
		else if (k == 'c') //c
		{
			let h = get_player_value(player, 'hp');
			if (player_value_not_found == 1) { h = 0; }

			let mh = get_player_value(player, 'maxhp');
			if (player_value_not_found == 1) { mh = 0; }
			
			if (h < mh)
			{
				current = menu_begin_heal;
				draw_menu(1);
			}
			else
			{
				clearlog();
				writelog('');
				writelog('You look fine to us.');
				writelog('');
				writelog('<MORE>');
			}
		}
		else if (k == 'r' || key == 10) //r
		{
			current=last_menu;
			draw_menu(1);
		}
	}
	else if (current == menu_bank)
	{
		if (k == 'w') //w
		{
			handled_bank=0;
			current=menu_withdraw;
			draw_menu(1);
			display_your_command();
		}
		else if (k == 'd') //d
		{
			handled_bank=0;
			current=menu_deposit;
			draw_menu(1);
			display_your_command();
		}
		else if (k == 't') //t
		{
			handled_bank=0;
			current=menu_transfer;
			draw_menu(1);
			display_your_command();
		}
		else if (k == '2')
		{
			let f = get_player_value(player, 'fairies');
			if (player_value_not_found == 1) { f = 0; }
			
			if (f > 0)
			{
				if (skill_type('class') == 'Thief')
				{
					current=rob_bank;
					draw_menu(1);
				}
				else
				{
					writelog('');
					writelog('Nothing happens.');
					writelog('');
				}
			}
		}
		else if (k == 'r' || key == 10) //r
		{
			current=menu_main;
			draw_menu(1);
		}
	}
	else if (current == menu_withdraw)
	{
		status = key.toString();
		
		//if (key == 8) // backspace
		//{
		//	buffer = buffer.substring(0, buffer.length-1);
		//}
		//else if (key == 10) // enter
		//{
			if (handled_bank == 1)
			{
				current = menu_main;
				draw_menu(1);
			}
			else
			{
				let bk = get_player_value(player, 'bank');
				if (player_value_not_found == 1) { bk = 0; }
				
				//if (buffer == '') n = 0;
				let n = parseInt(status);
				
				if (n == 1)
				{
					n = bk;
					
					let gd = inc_player_value(player, 'gold', n, MAX_VALUE);
					set_player_value(player, 'bank', 0);
					
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
					writelog('');
					writelog('Done! '+n+' withdrew.');
					writelog('');
					writelog('Gold In Hand: '+gd+' Gold In Bank: 0');
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
					handled_bank=1;
					current = menu_bank;
					draw_menu(0);
				}
				else if (n == 0)
				{
					current = menu_main;
					draw_menu(1);
				}
				else if (bk < n)
				{
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
					writelog('');
					writelog('Not enough gold.');
					writelog('');
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
					current = menu_bank;
					draw_menu(0);
				}
				else
				{
					bk = dec_player_value(player, 'bank', n, 0);
					let gd = inc_player_value(player, 'gold', n, MAX_VALUE);
					
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
					writelog('');
					writelog('Done! '+n+' withdrew.');
					writelog('');
					writelog('Gold In Hand: '+gd+' Gold In Bank: '+bk);
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
					handled_bank=1;
					current = menu_bank;
					draw_menu(0);
				}
				
				buffer = '';
			}
		//}
		//else
		//{
		//	buffer += fromChr(key);
		//}
		
		status = buffer;
	}
	else if (current == menu_deposit)
	{
		status = key.toString();
		console.log('status: '+status);
		//let n = status;
		
		//if (key == 8) // backspace
		//{
		//	buffer = buffer.substring(0, buffer.length-1);
		//}
		//else if (key == 10) // enter
		//{
			if (handled_bank == 1)
			{
				buffer='';
				clearStatus();
				current = menu_main;
				draw_menu(1);
			}
			else
			{
				let gd = get_player_value(player, 'gold');
				if (player_value_not_found == 1) { gd = 0; }

				let bk = get_player_value(player, 'bank');
				if (player_value_not_found == 1) { bk = 0; }
				
				//let n = 0;
				//if (buffer == '') n=0;
				//else n = parseInt(buffer);
				
				if (status == '1')
				{
					status = gd;
					//console.log('Depositing all gold: '+status);
					
					let bk = inc_player_value(player, 'bank', parseInt(status), MAX_VALUE);
					set_player_value(player, 'gold', 0);
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
					writelog('');
					writelog('Done! '+status+' deposited.');
					writelog('');
					writelog('Gold In Hand: 0 Gold In Bank: '+bk);
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
					handled_bank=1;
					current = menu_bank;
					draw_menu(0);
				}
				else if (status == '0')
				{
					current = menu_main;
					draw_menu(1);
				}
				else if (gd < status)
				{
					//buffer = '';
					//status = 'Not enough gold.';
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
					writelog('');
					writelog('Not enough gold.');
					writelog('');
					writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
					handled_bank=1;
					current = menu_bank;
					draw_menu(0);
				}
				else
				{
					let bk = inc_player_value(player, 'bank', parseInt(status), MAX_VALUE);

					let gd = dec_player_value(player, 'gold', parseInt(status), 0);
					if (player_value_not_found == 1) { gd = 0; }

					writelog('');
					writelog('Done! '+status+' deposited.');
					writelog('');
					writelog('Gold In Hand: '+gd+' Gold In Bank: '+bk);
					writelog('');
					handled_bank=1;
					current = menu_bank;
					draw_menu(0);
				}
				
				buffer = '';
			}
		//}
		//else
		//{
		//	buffer += fromChr(key);
		//}
		
		status = buffer;
	}
	else if (current == menu_transfer)
	{
		current = menu_main;
		draw_menu(1);
	}
	//else if (current == menu_stats)
	//{
		
	//		current = last_menu;
	//		draw_menu(0);
		
	//}
	else if (current == menu_weapons)
	{
		if (k == 'y') //y
		{
			last_menu=menu_weapons;
			current=menu_stats;
			draw_menu(1);
			current = last_menu;
			draw_menu(0);
			display_your_command();
			
		}
		else if (k == 'b') //b
		{
			handle_wbuy=0;
			last_menu=current;
			current = menu_weapon_buy;
			draw_menu(1);
			display_your_command2(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']);
		}
		else if (k == 's') //s
		{
			handle_wsell=0;
			last_menu=current;
			current = menu_weapon_sell;
			draw_menu(1);
			display_your_command2(['Y', 'N','y','n']);
		}
		else if (k == 'r' || key == 10) //r or enter
		{
			last_menu = menu_main;
			current = menu_main;
			draw_menu(1);
		}
	}
	else if (current == menu_weapon_sell)
	{
		
		
		let w = get_player_value(player, 'weapon');
		if (player_value_not_found == 1) { w = ''; }
		
		if (w == '')
		{
			current = menu_main;
			draw_menu(1);
		}
		else
		{
			if (k == 'y') //y
			{
				set_player_value(player, 'weapon', '');
				inc_player_value(player, 'gold', weapon_price, MAX_VALUE);
				console.log(' ');
				console.log('weapon sold for '+weapon_price);
				console.log(' ');	
				current = menu_main;
				draw_menu(0);
			}
			else if (k == 'n' || key == 10)
			{
				current = menu_main;
				draw_menu(1);
				
			}
		}
	}
	else if (current == weapon_buy_yn)
	{
		if (k == 'y') //y
		{
			dec_player_value(player, 'gold', weapon_cost, 0);
			set_player_value(player, 'weapon', weapon_choice);
			current = menu_main;
			draw_menu(1);
			display_your_command();
		}
		else if (k == 'n' )
		{
			current = menu_main;
			draw_menu(1);
			display_your_command();
		}
		buffer='';
		status='';
	}
	else if (current == menu_weapon_buy)
	{
		//if (key == 8) // backspace
		//{
		//	buffer = buffer.substring(0, buffer.length-1);
		//}
		//else if (key == 10) // enter
		//{
			if (handle_wbuy == 1)
			{
				buffer='';
				status = '';
				current = menu_main;
				draw_menu(1);
			}
			else
			{
				//n = parseInt(buffer);
				
				//if (n == 0)
				//{
				//	current = menu_main;
				//	draw_menu(1);
				//}
				//else if (n < 16)
				//{
					let gd = get_player_value(player, 'gold');
					if (player_value_not_found == 1) { gd = 0; }
					
					let w = get_player_value(player, 'weapon');
					if (player_value_not_found == 1) { w = ''; }
					
					buffer='';
					let wprice = weapons[(k-1) * 4 + 1];
					
					if (gd >= wprice)
					{
						clearlog();
						writelog('  King Arthurs Weapons');
						writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
						
						if (w != '')
						{
							writelog(' "You fool! You already have a weapon, and you');
							writelog(' can\'t carry two!" You realize he is right.');
							writelog('');
							current = menu_weapon_buy;
							draw_menu(0);
							display_your_command();
							handle_wbuy = 1;
						}
						else
						{
							weapon_cost = wprice;
							weapon_choice = weapons[(k-1) * 4];
							
							writelog('  "Hmmm I will sell you my FAVORITE '+weapon_choice);
							writelog('   for '+weapon_cost+'"');
							writelog('  Buy it? [Y,N] : ');
							writelog('');
							
							current = weapon_buy_yn;
							draw_menu(0);
							display_your_command2(['Y', 'N','y','n']);
							
						}
					}
					else
					{
						buffer = '';
						writelog('');
						writelog('');
						writelog('Not enough gold.');
						writelog('');
						writelog('');
						handle_wbuy=1;
						current = menu_weapon_buy;
						draw_menu(0);
						display_your_command();
					}
				//}
				//else
				//{
				//	buffer = '';
				//	writelog('Invalid selection.');
				//	handle_wbuy=1;
				//	return;
				//}
				
				buffer = '';
			}
		//}
		//else
		//{
		//	buffer += fromChr(key);
		//}
		
		status = buffer;
	}
	else if (current == menu_armor)
	{
		if (k == 'y') //y
		{
			last_menu=menu_armor;
			current=menu_stats;
			draw_menu(1);
			current = last_menu;
			draw_menu(0);
			display_your_command();

		}
		else if (k == 'b') //b
		{
			handle_abuy=0;
			last_menu=menu_armor;
			current = menu_armor_buy;
			draw_menu(1);
			display_your_command();
		}
		else if (k == 's') //s
		{
			handle_asell=0;
			last_menu=menu_armor;
			current = menu_armor_sell;
			draw_menu(1);
			display_your_command();
		}
		else if (k == 'r' || key == 10) //r or enter
		{
			last_menu = menu_main;
			current = menu_main;
			draw_menu(1);
		}
	}
	else if (current == menu_armor_sell)
	{
		let a = get_player_value(player, 'armor');
		if (player_value_not_found == 1) { a = 0; }
		
		if (a == '')
		{
			current = menu_armor;
			draw_menu(1);
		}
		else
		{
			if (k == 'y') //y
			{
				set_player_value(player, 'armor', '');
				inc_player_value(player, 'gold', armor_price);
				writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
				writelog(' ');
				writelog(' "'+a+'" sold for '+armor_price);
				writelog(' ');
				writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
				current = last_menu;
				draw_menu(0);
			}
			else if (k == 'n' || key == 10)
			{
				current = last_menu;
				draw_menu(1);
			}
		}
	}
	else if (current == armor_buy_yn)
	{
		if (k == 'y') //y
		{
			dec_player_value(player, 'gold', armor_cost, 0);
			set_player_value(player, 'armor', armor_choice);
			writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');

			writelog(' ');
			writelog('You bought the '+armor_choice+' for '+armor_cost+' gold.');
			writelog(' ');
			writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');	
			current = last_menu;
			draw_menu(0);
		}
		else if (k == 'n' || key == 10)
		{
			current = last_menu;
			draw_menu(0);
		}
		buffer='';
		status='';
	}
	else if (current == menu_armor_buy)
	{
		//if (key == 8) // backspace
		//{
		//	buffer = buffer.substring(0, buffer.length-1);
		//}
		//else if (key == 10) // enter
		//{
			if (handle_abuy == 1)
			{
				buffer='';
				//clearStatus();
				current = menu_main;
				draw_menu(1);
			}
			else
			{
				let n = parseInt(key.toString());
				
				if (n == 0)
				{
					current = menu_main;
					draw_menu(1);
				}
				else if (n < 16)
				{
					let gd = get_player_value(player, 'gold');
					if (player_value_not_found == 1) { gd = 0; }

					let a = get_player_value(player, 'armor');
					if (player_value_not_found == 1) { a = ''; }
					
					buffer='';
					let wprice = armors[(n-1) * 4 + 1];
					
					if (gd >= wprice)
					{
						clearlog();
						writelog('  Abduls Armour');
						writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
						
						if (a != '')
						{
							writelog(' "You fool! You already have an armour, and you');
							writelog(' can\'t carry two!" You realize he is right.');
							writelog('');
							writelog('-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-═-');
							//writelog('<MORE>');
							handle_abuy = 1;
							current = menu_armor_buy;
							draw_menu(0);
							display_your_command();
						}
						else
						{
							armor_cost = wprice;
							armor_choice = armors[(n-1) * 4];
							
							writelog('  "Hmmm I will sell you my FAVORITE '+armor_choice);
							writelog('   for '+armor_cost+'"');
							writelog('  Buy it? [Y,N] : ');
							writelog('');
							
							current = armor_buy_yn;
							draw_menu(0);
							display_your_command();
							return;
						}
					}
					else
					{
						buffer = '';
						writelog('Not enough gold.');
						handle_abuy=1;
						display_your_command();
						return;
					}
				}
				else
				{
					buffer = '';
					writelog('Invalid selection.');
					handle_abuy=1;
					display_your_command();
					return;
				}
				
				buffer = '';
			}
		//}
		//else
		//{
		//	buffer += fromChr(key);
		//}
		
		status = buffer;
	}
	else if (current == menu_fairy1)
	{
		if (key == 10)
		{
			if (getRandomInt(100) >= 10) { current = menu_fairy2; }
			else { current = menu_fairy3; }
			draw_menu(1);
		}
	}
	else if (current == menu_fairy_blessing)
	{
		if (key == 10)
		{
			current = menu_forest;
			draw_menu(1);
		}
	}
	else if (current == menu_fairy_catch)
	{
		if (key == 10)
		{
			current = menu_forest;
			draw_menu(1);
		}
	}
	else if (current == menu_fairy2)
	{
		if (k == 'a' || key == 10)
		{
			last_menu = menu_forest;
			current = menu_fairy_blessing;
			draw_menu(1);
		}
		else if (k == 't')
		{
			last_menu = menu_forest;
			current = menu_fairy_catch;
			draw_menu(1);
		}
	}
	else if (current == menu_fairy3)
	{
		if (key == 10)
		{
			current = menu_forest;
			draw_menu(1);
		}
	}
	else if (current == menu_refreshed)
	{
		if (key == 10) // enter
		{
			current=menu_forest;
			draw_menu(1);
		}
	}
	else if (current == menu_save_girl_pager)
	{
		current=menu_save_girl_pager;
		draw_menu(1);
	}
	else if (current == menu_scroll_save)
	{
		if (key != 0 && k == 'c' || k == 'f' || k == 'g' || k == 'p' || k == 'd')
		{
			save_target_dest = fromChr(key);
			current = menu_save_at;
			draw_menu(1);
		}
	}
	else if (current == menu_hag_no_gem)
	{
		if (key == 10) //enter
		{
			current=menu_forest;
			draw_menu(1);
		}
	}
	else if (current == menu_hag_yes_gem)
	{
		if (key == 10) //enter
		{
			current=menu_forest;
			draw_menu(1);
		}
	}
	else if (current == menu_old_hag)
	{
		if (k == 'n' || key == 10) //enter or n
		{
			current=menu_hag_no_gem;
			draw_menu(1);
		}
		else if (k == 'y')
		{
			current=menu_hag_yes_gem;
			draw_menu(1);
		}
	}
	else if (current == menu_forest_scroll)
	{
		if (k == 's' || key == 10) //enter
		{
			current=menu_scroll_save;
			draw_menu(1);
		}
		else if (k == 'i')
		{
			current=menu_forest;
			draw_menu(1);
		}
	}
	else if (current == menu_charm_gain_event_yes)
	{
		current=menu_forest;
		draw_menu(1);
	}
	else if (current == menu_charm_gain_event_no)
	{
		current=menu_forest;
		draw_menu(1);
	}
	else if (current == menu_charm_loss_event)
	{
		current=menu_forest;
		draw_menu(1);
	}
	else if (current == menu_charm_pretty_event)
	{
		current=menu_forest;
		draw_menu(1);
	}
	else if (current == menu_charm_gain_event)
	{
		if (k == 'y' || key == 10) // y or enter
		{
			current = menu_charm_gain_event_yes;
			draw_menu(1);
		}
		else
		{
			current = menu_charm_gain_event_no;
			draw_menu(1);
		}
	}
	else if (current == menu_forest_sack)
	{
		if (key == 10) // enter
		{
			current=menu_forest;
			draw_menu(1);
		}
	}
	else if (current == dwarf_game)
	{
		if (current_bet == -1)
		{
			if (key == 10) //enter
			{
				let gold = get_player_value(player, 'gold');
				if (player_value_not_found == 1) gold = 0;
				
				let bet=parseInt(buffer);
				if (isNaN(bet)) bet = 200;

				if (bet > gold)
				{
					bet_error = 'invalid';
					current=dwarf_game;
					draw_menu(1);
					return;
				}

				if (bet < 200)
				{
					bet_error = 'low';
					current=dwarf_game;
					draw_menu(1);
					return;
				}
				
				if (bet > 5000)
				{
					bet_error = 'high';
					current=dwarf_game;
					draw_menu(1);
					return;
				}
				
				dwarf_game_status='';
				blackjack_clear_msg_args(1,1);
				current_bet = bet;
				buffer='';
				clearStatus();
				draw_menu(1);
				blackjack_begin();
			}
			else if (key != 0)
			{
				if (key == 8)
				{
					clearStatus();
					buffer = buffer.substring(0, buffer.length - 1);
					status = buffer;
					return;
				}
				if (buffer == '200')
				{
					clearStatus();
					status = buffer = '';
				}
				buffer += fromChr(key);
				status=buffer;
			}
		}
		else
		{
			if (k == 'h') // hit
			{
				dwarf_hit();
			}
			else if (k == 's') // stay
			{
				dwarf_stay();
			}
			else if (k == 'y') // yes
			{
				dwarf_yes();
			}
			else if (k == 'n') // no
			{
				dwarf_no();
			}
		}
	}
	else if (current == dwarf_meeting)
	{
		if (key == 10 && dwarf_should_play)
		{
			dwarf_should_play=0;
			current = dwarf_game;
			draw_menu(0);
		}
		else if (k == 'g')
		{
			dwarf_should_play=1;
			writelog('"Exellent!" the dwarf exclaims as he pulls out');
			writelog('a makeshift black jack table!');
			writelog('');
			writelog('"As for the rules... I have to stay on a 17.');
			writelog('You can double down on a 9, 10, or 11, and I');
			writelog('do allow splitting pairs multiple times."');
			writelog('');
			writelog('You rub your chin - with any luck you\'ll');
			writelog('double your money...');
			writelog('');
			writelog('<MORE>');
		}
		else if (k == 't')
		{
			writelog('');
			writelog('todo; say no to game');
			writelog('');
			current = menu_forest;
			draw_menu(0);
		}
	}
	else if (current == menu_ride_horse)
	{
		if (key == 10) // enter
		{
			current=menu_dark_cloak;
			draw_menu(1);
		}
	}
	else if (current == menu_forest)
	{
		if (k == 'j') // j
		{
			let sp = get_player_value(player, 'highspirits');
			if (player_value_not_found == 1) { sp = SPIRITS_HIGH; }
			
			if (sp == SPIRITS_HIGH)
			{
				cheat = '';
				JENNIE = 'j';
			}
			else
			{
				writelog('');
				writelog('Your spirits are low, try again tomorrow.');
				writelog('');
			}
		}
		else if (JENNIE != '')    
		{
			if (JENNIE == 'jennie')
			{
				if (key == 10) // enter
				{
					writelog('');
					if (cheat == 'fair' || cheat == 'nice' || cheat == 'star')
					{
						writelog('While that is true...Nothing happens.');
					}
					else if (cheat == 'babe')
					{
						writelog('Extra forest fight.');
						inc_player_value(player, 'fights', 1, MAX_VALUE);
					}
					else if (cheat == 'foxy')
					{
						writelog('You gain a Gem.');
						inc_player_value(player, 'gems', 1, MAX_VALUE);
					}
					else if (cheat == 'lady')
					{
						let lvl = get_player_value(player, 'level');
						if (player_value_not_found == 1) { lvl = 0; }
						
						let amt = lvl * 1000;
						writelog('You receive some Gold: ' + amt);
						inc_player_value(player, 'gold', amt, MAX_VALUE);
					}
					else if (cheat == 'sexy')
					{
						writelog('You gain an extra user fight.');
						inc_player_value(player, 'pfights', 1, MAX_VALUE);
					}
					else if (cheat == 'hott')
					{
						writelog('Your Hit Points increase by 20%.');
						
						let mh = get_player_value(player, 'maxhp');
						if (player_value_not_found == 1) { mh = 0; }
						
						mh = inc_player_value(player, 'maxhp', parseInt(mh * 0.2), MAX_VALUE);
						set_player_value(player, 'hp', mh);
					}
					else if (cheat == 'cool')
					{
						let mh = get_player_value(player, 'maxhp');
						if (player_value_not_found == 1) { mh = 0; }
						
						let h = get_player_value(player, 'hp');
						if (player_value_not_found == 1) { h = 0; }
						
						if (h < mh)
						{
							writelog('You gain an extra charm point.');
							inc_player_value(player, 'charm', 1, MAX_VALUE);
						}
						else
						{
							writelog('Nothing happens.');
						}
					}
					else if (cheat == 'gift')  
					{
						if (skill_type('class') == 'Mystical')
						{
							writelog('todo; Replenished Mystical Skills');
						}
					}
					else if (cheat == 'ugly')
					{
						writelog('You have been returned to 1 hp.');
						set_player_value(player, 'hp', 1);
					}
					else if (cheat == 'dung')
					{
						writelog('You are turned into a frog.');
					}
					else
					{
						writelog('You do not understand her.');
					}
					writelog('');
					JENNIE='';
				}
				else
				{
					cheat += k;
				}
			}
			else
			{
				if (k == 'e')  { JENNIE += 'e'; }
				else if (k == 'n') { JENNIE += 'n'; }
				else if (k == 'i') { JENNIE += 'i'; }
				else { JENNIE = ''; }
				
				if (JENNIE == 'jennie')
				{
					set_player_value(player, 'highspirits', SPIRITS_LOW);
					writelog('');
					writelog('Jennie? Jennie Garth? Describe her:');
					writelog('');
				}
			}
		}
		else if (k == 'l') //l
		{
			let rnd = getRandomInt(100);
			
			if (rnd >= 98) //2% chance - not official, i eyeballed this
			{
				current = menu_fairy1;
				draw_menu(1);
			}
			else if (rnd >= 97) //1% chance - not official, i eyeballed this
			{
				current = menu_charm_gain_event;
				draw_menu(1);
			}
			else if (rnd >= 96) // 1% chance - not official, i eyeballed this
			{
				current = menu_forest_scroll;
				draw_menu(1);
			}
			else if (rnd >= 94) // 2% chance - not official, i eyeballed this
			{
				current = menu_refreshed;
				draw_menu(1);
			}
			else if (rnd >= 93) // 1% chance - not official, i eyeballed this
			{
				current = menu_forest_sack;
				draw_menu(1);
			}
			else if (rnd >= 91) // 2% chance - not official, i eyeballed this
			{
				current = menu_old_hag;
				draw_menu(1);
			}
			else if (rnd >= 89) // 2% chance of darkcloak tavern - not official i eyeballed this
			{
				current=menu_dark_cloak;
				draw_menu(1);
			}
			//else if (rnd >= 87) // 2% chance of dwarf encounter
			//{
			//	current=dwarf_meeting;
			//	draw_menu(1);
			//}
			else
			{
				let f = get_player_value(player, 'fights');
				if (player_value_not_found == 1) { f = 0; }
				
				if (f-1 >= 0)
				{
					clearlog();
					
					dec_player_value(player, 'fights', 1, 0);
					
					let lvl = get_player_value(player, 'level');
					if (player_value_not_found == 1) { lvl = 1; }
					
					get_monster(getRandomInt(11) + ((lvl-1)*11));
					
					writelog('**FIGHT**');
					writelog('You have encountered '+monster+'!!');
					writelog('');
					
					let first = getRandomInt(100);
					if (first > 70) { first = 1; writelog('Your skill allows you to get the first strike.'); }
					else { first = 0; writelog('The enemy surprised you!'); attackedby(); }
					
					current = encounterby;
					draw_menu(0);
				}
				else
				{
					writelog('You are out of fights for today. Come back tomorrow.');
					writelog('');
					display_your_command();
					
				}
			}
		}
		else if (k == 'h') //h
		{
			last_menu = menu_forest;
			current = menu_heal;
			draw_menu(1);
		}
		else if (k == 't') // t
		{
			let horse = get_player_value(player, 'horse');
			if (player_value_not_found == 1) horse = HORSE_NONE;
			
			if (horse != HORSE_NONE)
			{
				last_menu = menu_forest;
				current = menu_ride_horse;
				draw_menu(0);
			}
			else
			{
				last_menu = menu_forest;
				current = menu_forest;
				draw_menu(1);
			}
		}
		else if (k == 'b')
		{
			let gp = get_player_value(player, 'gold');
			if (player_value_not_found == 1) gp = 0;
			
			if (gp > 0)
			{
				writelog('');
				writelog('`%You throw your gold pouch up into the air gleefully.');
				writelog('');
				writelog('`0AN UGLY VULTURE@`4GRABS`0@IT IN MID AIR!');
				writelog('');

				inc_player_value(player, 'bank', gp, MAX_VALUE);
				set_player_value(player, 'gold', 0);
			}
			else
			{
				draw_menu(0);
			}
		}
		else if (k == '?')
		{
			draw_menu(0);
		}
		else if (k == 'q' || k == 'r' || key == 10) //r or enter
		{
			writelog('');
			status = '';
			current = menu_main;
			draw_menu(1);
		}
	}
	else if (current == encounterby)
	{
		last_menu=encounterby;
		
		if (monster_hp <= 0)
		{
			current = menu_forest;
			draw_menu(1);
			return;
		}
		
		if (k == 'a' || key == 10) //a
		{
			clearlog();
			perform_attack();
		}
		else if (k == 'r') //r
		{
			current = menu_forest;
			draw_menu(1);
		}
		else if (k == 'd' || k == 'm' || k == 't')
		{
			perform_skill();
		}
		else if (k == 's') //s
		{
			last_menu = encounterby;
			current = menu_stats;
			draw_menu(1);
			current = last_menu;
			draw_menu(0);
			
		}
	}
	else if (current == menu_list)
	{
		current=last_menu;
		draw_menu(1);
	}
	else if (current == menu_pick_gender)
	{
		let picked = -1;
		if (k == 'm' || key == 10) picked=0;
		else if (k == 'f') picked=1;
		if (picked != -1)
		{
			chosen_gender=picked;
			writelog('With a name like "'+player+'`%", no one will believe it.');
			current=menu_pick_class;
			draw_menu(0);
		}
	}
	else if (current == menu_pick_class)
	{
		let picked = -1;
		if (k == 'k') picked=0;
		else if (k == 'd') picked=1;
		else if (k == 'l') picked=2;
		if (picked != -1)
		{
			chosen_class=picked;
			create_new_player(player);
			save_data();
			load_data();
			current=display_the_way;
			draw_menu(1);
		}
	}
	else if (current == display_the_way)
	{
		show_banner=1;
		current = menu_main;
		clearlog();
		perform_draw_banner();
	}
	else if (current == menu_joining)
	{
		if (k == 'y' || key == 10)
		{
			current=menu_pick_gender;
			draw_menu(0);
		}
		else if (k == 'n')
		{
			quit_main();
		}
	}
	else if (current == show_enter_screen)
	{
		if (k == 'e' || key == 10)
		{
			if (showing_instructions)
			{
				if (instruction_page < 2)
				{
					instruction_page++;
					clearlog();
					for(let i=0; i < instruction_manual[instruction_page].length; i++)
					{
						writelog(instruction_manual[instruction_page][i]);
					}
					return;
				}
				instruction_page=showing_instructions=0;
				draw_menu(1);
			}
			else
			{
				player = buffer || 'SYSOP';
				if (player === 'UNSET' || player === '') buffer='SYSOP';
				else buffer=player;
				status=buffer;
				last_menu=current;
				current=menu_login;
				draw_menu(0);
			}
		}
		else if (k == 'i')
		{
			if (!showing_instructions)
			{
				showing_instructions=1;
				clearlog();
				for(let i=0; i < instruction_manual[instruction_page].length; i++)
				{
					writelog(instruction_manual[instruction_page][i]);
				}
			}
		}
		else if (k == 'l')
		{
			last_menu=current;
			current=menu_list;
			draw_menu(1);
		}
		else if (k == 'q')
		{
			quit_main();
		}
	}
	else if (current == menu_login)
	{
		if (key == 10) //enter
		{
			if (buffer.length > 15) buffer = buffer.substring(0, 30);
			
			let pi = find_player(buffer);
			if (pi == -1)
			{
				player = buffer || 'SYSOP';
				buffer='';
				clearStatus();
				current=menu_joining;
				draw_menu(1);
			}
			else
			{
				player = buffer || 'SYSOP';
				buffer='';
				clearStatus();
				save_data();
				load_data();
				show_banner=1;
				current = menu_finish_login;
				draw_menu(1);
			}
		}
		else if (key != 0)
		{
			if (key == 8)
			{
				clearStatus();
				buffer = buffer.substring(0, buffer.length - 1);
				status = buffer;
				return;
			}
			if (buffer == 'SYSOP') 
			{
				clearStatus();
				status = buffer = '';
			}
			buffer += fromChr(key);
			status=buffer;
		}
	}
	else if (current == menu_finish_login)
	{
		if (key == 10)
		{
			current = menu_main;
			clearlog();
			perform_draw_banner();
		}
	}
	else if (current == list_mystical_skills)
	{
		let m = get_player_value(player, 'classm');
		if (player_value_not_found == 1) m = -1;
		
		let um = get_player_value(player, 'usesm');
		if (player_value_not_found == 1) um = 0;

		if (m <= 0)
		{
			writelog('Err: Invalid skill. This should never happen.');
			return;
		}
		
		if (key == 10) // nothing
		{
			current=last_menu;
			draw_menu(0);
		}
		else if (k == 'p') // pinch
		{
			if (um >= 1)
			{
				dec_player_value(player, 'usesm', 1, 0);
				monster_hp = use_mystical_pinch(monster, monster_weapon, monster_hp, monster_str,
					monster_death, monster_xp, monster_gp, -1);
			}
		}
		else if (k == 'd') // disappear
		{
			if (um >= 4)
			{
				dec_player_value(player, 'usesm', 4, 0);
				writelog('');
				writelog('You imagine yourself being in a different');
				writelog('part of the forest, and begin to concentrate.');
				writelog('The next instant you are standing in a cool');
				writelog('glade, nowhere to concentrate. The next instant');
				writelog('you are standing in a cool glade, nowhere near');
				writelog('your enemy. You almost laugh remembering');
				writelog(String.format('{0}\'s befuddled face.', monster));
				writelog('<MORE>');

				current = menu_forest;
				draw_menu(0);
			}
		}
		else if (k == 'h') // heat wave
		{
			if (um >= 8)
			{
				dec_player_value(player, 'usesm', 8, 0);
				monster_hp = use_heatwave(monster, monster_weapon, monster_hp, monster_str,
					monster_death, monster_xp, monster_gp);
			}
		}
		else if (k == 'l') // light shield
		{
			if (um >= 12)
			{
				dec_player_value(player, 'usesm', 12, 0);
				is_shielded=1;
				// not the official msg, need to look it up
				writelog('You can light shield on yourself.');
			}
		}
		else if (k == 's') // shatter
		{
			if (um >= 16)
			{
				dec_player_value(player, 'usesm', 16, 0);
				monster_hp = use_shatter(monster, monster_weapon, monster_hp, monster_str,
					monster_death, monster_xp, monster_gp);
			}
		}
		else if (k == 'm') // mind heal
		{
			if (um >= 20)
			{
				dec_player_value(player, 'usesm', 20, 0);
				let maxhp = get_player_value(player, 'maxhp');
				if (player_value_not_found == 1) maxhp = 15;
				set_player_value(player, 'hp', maxhp);
				// not the official msg, need to look it up
				writelog('You use your mind to heal yourself fully.');
			}
		}
		
		if (monster_hp <= 0)
		{
			current=encounterby;
		}
	}
	else
	{
		if (key != 0)
		{
			current = menu_main;
			draw_menu(1);
		}
	}
}

function getRandomInt(range) { return Math.floor(Math.random() * range); }

function getRandomFloat(min, max, decimals)
{
	const str = (Math.random() * (max - min) + min).toFixed(decimals);
	return parseFloat(str);
}

function fromChr(c) { return String.fromCharCode(c); }

function findData(a, s) { return a.indexOf(s); }

function findArray(a, s)
{
	for(let i=0; i < a.length; i++)
	{
		if (a[i] == s)
		{
			return i;
		}
	}
	return -1;
}
