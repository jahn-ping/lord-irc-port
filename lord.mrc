; ============================================================
; LORD - Legend of the Red Dragon
; mIRC Port v0.1
; ============================================================

; Load data files
; TODO: Create separate .inc files for data
; TODO: Create separate .inc files for functions

; ============================================================
; CONFIGURATION
; ============================================================
alias lord.version { return 0.1 }
alias lord.datafile { return lord_data.ini }
alias lord.playersdir { return lord_players/ }

; ============================================================
; DATA - Monsters (name,weapon,str,hp,gold,xp,death)
; Stored as pipe-delimited string
; ============================================================
alias lord.monsters {
  return Small Thief|Small Dagger|6|9|56|2|You disembowel the little thieving menace!|Rude Boy|Cudgel|3|7|7|3|You quietly watch as the very Rude Boy bleeds to death.|Old Man|Cane|5|13|73|4|You finish him off, by tripping him with his own cane.|Large Green Rat|Sharp Teeth|3|4|32|1|A well placed step ends this small rodents life.|Wild Boar|Sharp Tusks|10|9|58|5|You impale the boar between the eyes!|Ugly Old Hag|Garlic Breath|6|9|109|4|You emotionally crush the hag, by calling her ugly!|Large Mosquito|Blood Sucker|2|3|46|2|With a sharp slap, you end the Mosquitos life.|Bran The Warrior|Short Sword|12|15|234|10|After a hardy duel, Bran lies at your feet, dead.|Evil Wretch|Finger Nail|7|12|76|3|With a swift boot to her head, you kill her.|Small Bear|Claws|9|7|154|6|After a swift battle, you stand holding the Bears heart!|Small Troll|Uglyness|6|14|87|5|This battle reminds you how of how much you hate trolls.|Green Python|Dripping Fangs|13|17|80|6|You tie the mighty snake's carcass to a tree.|Gath The Barbarian|Huge Spiked Club|12|13|134|9|You knock Gath down, ignoring his constant groaning.|Evil Wood Nymph|Flirtatios Behavior|15|10|160|11|You shudder to think of what would have happened, had you given in.|Fedrick The Limping Baboon|Scary Faces|8|23|97|6|Fredrick will never grunt in anyones face again.|Wild Man|Hands|13|14|134|8|Pitting your wisdom against his brawn has one this battle.|Brorandia The Viking|Hugely Spiked Mace|21|18|330|20|You consider this a message to her people, "STAY AWAY!".|Huge Bald Man|Glare From Forehead|19|19|311|16|It wasn't even a close battle, you slaughtered him.|Senile Senior Citizen|Crazy Ravings|13|11|270|13|You may have just knocked some sense into this old man.|Membrain Man|Strange Ooze|10|16|190|11|The monstrosity has been slain.|Bent River Dryad|Pouring Waterfall|12|16|150|9|The Dryad is "All wet".|Rock Man|Large Stones|8|27|300|12|You have shattered the Rock Mans head!|Lazy Bum|Unwashed Body Odor|19|29|380|18|"This was a bum deal" You think to yourself.|Two Headed Rotwieler|Twin Barking|18|32|384|17|You have silenced the mutt, once and for all.|Purple Monchichi|Continous Whining|14|29|763|23|You cant help but realize you have just killed a real loser.|Bone|Terrible Smoke Smell|27|11|432|16|Now that you have killed Bone, maybe he will get a life.|Red Neck|Awfull Country Slang|19|16|563|19|The dismembered body causes a churning in your stomach.|Winged Demon Of Death|Red Glare|42|23|830|28|You cut off the Demons head, to be sure of its death.|Black Owl|Hooked Beak|28|29|711|26|A well placed blow knocks the winged creature to the ground.|Muscled Midget|Low Punch|26|19|870|32|You laugh as the small man falls to the ground.|Headbanger Of The West|Ear Shattering Noises|23|27|245|43|You slay the rowdy noise maker and destroy his evil machines.|Morbid Walker|Endless Walking|28|10|764|9|Even lying dead on its back, it is still walking.|Magical Evil Gnome|Spell Of Fire|24|25|638|28|The Gnome's small body is covered in a deep red blood.|Death Dog|Teeth|36|52|1150|36|You rejoice as the dog wimpers for the very last time.|Weak Orc|Spiked Club|27|32|900|25|A solid blow removes the Orcs head!|Dark Elf|Small bow|43|57|1070|33|The Elf falls at your feet, dead.|Evil Hobbit|Smoking Pipe|35|95|1240|46|The Hobbit will never bother anyone again!|Short Goblin|Short Sword|34|45|768|24|A quick lunge renders him dead!|Huge Black Bear|Razor Claws|67|48|1765|76|You bearly beat the Huge Bear.|Rabid Wolf|Deathlock Fangs|45|39|1400|43|You pull the dogs lifeless body off you.|Young Wizard|Weak Magic|64|35|1754|64|This Wizard will never cast another spell!|Mud Man|Mud Balls|56|65|870|43|You chop up the Mud Man into sushi!|Death Jester|Horrible Jokes|34|46|1343|32|You feel no pity for the Jester, his jokes being as bad as they were.|Rock Man|Large Stones|87|54|1754|76|You have shattered the Rock Mans head!|Pandion Knight|Orkos Broadsword|64|59|3100|98|You are elated in the knowledge that you both fought honorably.|Jabba|Whiplashing Tail|61|198|2384|137|The fat thing falls down, never to squirm again.|Manoken Sloth|Dripping Paws|54|69|2452|97|You have cut him down, spraying a nearby tree with blood.|Trojan Warrior|Twin Swords|73|87|3432|154|You watch, as the ants claim his body.|Misfit The Ugly|Strange Ideas|75|89|2563|120|You cut him cleanly down the middle, in a masterfull stroke.|George Of The Jungle|Echoing Screams|56|43|2230|128|You thought the story of George was a myth, until now.|Silent Death|Pale Smoke|113|98|4711|230|Instead of spilling blood, the creature seems filled with only air.|Bald Medusa|Glare Of Stone|78|120|4000|256|You are lucky you didnt look at her... Man was she ugly!|Black Alligator|Extra Sharp Teeth|65|65|3245|123|With a single stroke, you sever the creatures head right off.|Clancy Son Of Emporer Len|Spiked Bull Whip|52|324|4764|324|Its a pity so many new warriors get so proud.|Black Sorcerer|Spell Of Lightning|86|25|2838|154|Thats the last spell this Sorcerer will ever cast!|Iron Warrior|3 Iron|100|253|6542|364|You have bent the Iron warriors Iron!|Black Soul|Black Candle|112|432|5865|432|You have released the black soul.|Gold Man|Rock Arm|86|354|8964|493|You kick the body of the Gold man to reveal some change.|Screaming Zombie|Gaping Mouth Full Of Teeth|98|286|5322|354|The battle has rendered the zombie even more unatractive then he was.|Satans Helper|Pack Of Lies|112|165|7543|453|Apparently you have seen through the Devils evil tricks.|Wild Stallion|Hoofs|78|245|4643|532|You only wish you could have spared the animals life.|Belar|Fists Of Rage|120|352|9432|565|Not even Belar can stop you!|Empty Armour|Cutting Wind|67|390|6431|432|The whole battle leaves you with a strange chill.|Raging Lion|Teeth And Claws|98|274|3643|365|You rip the jaw bone off the magnificient animal!|Huge Stone Warrior|Rock Fist|112|232|4942|543|There is nothing left of the stone warrior, except a few pebbles.|Magical Evil Gnome|Spell Of Fire|89|234|6384|321|The Gnomes small body is covered in a deep red blood.|Emporer Len|Lightning Bull Whip|210|432|12043|764|His last words were.. "I have failed to avenge my son."|Night Hawk|Blood Red Talons|220|675|10433|686|Your last swing pulls the bird out of the air.|Charging Rhinoceros|Rather Large Horn|187|454|9853|654|You finally fell the huge beast, not without a few scratches.|Goblin Pygmy|Death Squeeze|165|576|13252|754|You laugh at the little Goblin's puny attack.|Goliath|Six Fingered Fist|243|343|14322|898|Now you know how David felt.|Angry Liontaur|Arms And Teeth|187|495|13259|753|You have laid this mythical beast to rest.|Fallen Angel|Throwing Halos|154|654|12339|483|You slay the Angel, then watch as it gets sucked down into the ground.|Wicked Wombat|The Dark Wombats Curse|198|464|13283|786|It's hard to believe a little wombat like that could be so much trouble.|Massive Dinosaur|Gaping Jaws|200|986|16753|1204|The earth shakes as the huge beast falls to the ground.|Swiss Butcher|Meat Cleaver|230|453|8363|532|You're glad you won...You really didn't want the haircut.|Death Gnome|Touch Of Death|270|232|10000|654|You watch as the animals pick away at his flesh.|Screeching Witch|Spell Of Ice|300|674|19753|2283|You have silenced the witch's infernal screeching.|Rundorig|Poison Claws|330|675|17853|2748|Rundorig, once your friend, now lays dead before you.|Wheeler|Annoying Laugh|250|786|23433|1980|You rip the wheeler's wheels clean off!|Death Knight|Huge Silver Sword|287|674|21923|4282|The Death knight finally falls, not only wounded, but dead.|Werewolf|Fangs|230|543|19474|3853|You have slaughtered the Werewolf.|Fire Ork|FireBall|267|674|24933|3942|You have put out this Fire Orks flame!|Wans Beast|Crushing Embrace|193|1243|17141|2432|The hairy thing has finally stopped moving.|Lord Mathese|Fencing Sword|245|875|24935|2422|You have wiped the sneer off his face once and for all.|King Vidion|Long Sword Of Death|400|1243|28575|6764|You feel lucky to have lived, things could have gone sour.|Baby Dragon|Dragon Smoke|176|2322|25863|3675|This Baby Dragon will never grow up.|Death Gnome|Touch Of Death|356|870|31638|2300|You watch as the animals pick away at his flesh.|Pink Elephant|Stomping|434|1232|33844|7843|You have witnessed the Pink Elephant.|Gwendolens Nightmare|Dreams|490|764|35846|8232|This is the first Nightmare you have put to sleep.|Flying Cobra|Poison Fangs|400|1123|37694|8433|The creature falls to the ground with a sickening thud.|Rentakis Pet|Gaping Maw|556|987|37584|9854|You vow to find Rentaki and tell him what you think about his new pet.|Ernest Brown|Knee|432|2488|34833|9754|Ernest has finally learned his lesson it seems.|Scallian Rap|Way Of Hurting People|601|788|22430|6784|Scallians dead...Looks like you took out the trash.|Apeman|Hairy Hands|498|1283|38955|7202|The battle is over...Nothing is left but blood and hair.|Hemo-Glob|Weak Insults|212|1232|27853|4432|The battle is over.. And you really didn't find him particularly scary.|FrankenMoose|Butting Head|455|1221|31221|5433|That Moose was a perversion of nature!|Earth Shaker|Earthquake|767|985|37565|7432|The battle is over...And it looks like you shook him up.|Gollums Wrath|Ring Of Invisibility|621|2344|42533|13544|Gollums ring apparently wasn't powerfull enough.|Toraks Son Korak|Sword Of Lightning|921|1384|46575|13877|You have slain the son of a God!|Brand The Wanderer|Fighting Quarter Staff|643|2788|38755|13744|Brand will wander no more.|The Grimest Reaper|White Sickle|878|1674|39844|14237|You have killed that which was already dead. Odd.|Death Dealer|Stare Of Paralization|765|1764|47333|13877|The Death Dealer has been delt his last hand.|Tiger Of The Deep Jungle|Eye Of The Tiger|587|3101|43933|9766|The Tiger's cubs weep over their dead mother.|Sweet Looking Little Girl|Demon Strike|989|1232|52322|14534|If it wasn't for her manners, you might have got along with her.|Floating Evil Eye|Evil Stare|776|2232|43233|13455|You really didn't like the look of that Eye.|Slock|Swamp Slime|744|1675|56444|14333|Walking away from the battle, you nearly slip on the thing's slime.|Adult Gold Dragon|Dragon Fire|565|3222|56444|15364|He was strong, but you were stronger.|Kill Joy|Terrible Stench|988|3222|168844|25766|Kill Joy has fallen, and can't get up.|Black Sorcerer|Spell Of Lightning|86|25|2838|187|Thats the last spell this Sorcerer will ever cast!|Gorma The Leper|Contagous Desease|1132|2766|168774|26333|It looks like the lepers fighting stratagy has fallen apart.|Shogun Warrior|Japanese Nortaki|1143|3878|165433|26555|He was tough, but not nearly tough enough.|Apparently Weak Old Woman|GODS HAMMER|1543|1878|173522|37762|You pull back the old womans hood, to reveal an eyeless skull.|Ables Creature|Bear Hug|985|2455|176775|28222|That was a mighty creature. Created by a mighty man.|White Bear Of Lore|Snow Of Death|1344|1875|65544|16775|The White Bear Of Lore DOES exist you've found. Too bad it's now dead.|Mountain|Landslide|1544|1284|186454|38774|You have knocked the mountain to the ground. Now it IS the ground.|Sheena The Shapechanger|Deadly Illusions|1463|1898|165755|26655|Sheena is now a quivering mass of flesh. Her last shapechange.|ShadowStormWarrior|Mystical Storm|1655|2767|162445|26181|The storm is over, and the sunshine greets you as the victor.|Madman|Chant Of Insanity|1265|1764|149564|25665|Madman must have been mad to think he could beat you!|Vegetable Creature|Pickled Cabbage|111|172|4838|2187|For once you finished off your greens.|Cyclops Warrior|Fire Eye|1744|2899|204000|49299|The dead Cyclop's one eye stares at you blank.|Corinthian Giant|De-rooted Tree|2400|2544|336643|60333|You hope the giant has brothers, more sport for you.|The Screaming Eunuch|High Pitched Voice|1488|2877|197888|78884|If it wasn't for his ugly features, you thought he looked female.|Black Warlock|Satanic Choruses|1366|2767|168483|58989|You have slain Satan's only son.|Kal Torak|Cthrek Goru|876|6666|447774|94663|You have slain a God! You ARE great!|The Mighty Shadow|Shadow Axe|1633|2332|176333|51655|The mighty Shadow is now only a Shadow of his former self.|Black Unicorn|Shredding Horn|1899|1587|336693|41738|You have felled the Unicorn.|Mutated Black Widow|Venom Bite|2575|1276|434370|98993|A well placed stomp ends this Spider's life.|Humongous Black Wyre|Death Talons|1166|3453|653834|76000|The Wyre's dead carcass covers the whole field!|The Wizard Of Darkness|Chant Of Insanity|1497|1383|224964|39878|This Wizard of Darkness will never bother you again.|Great Ogre Of The North|Spiked Steel Mace|1800|2878|524838|112833|No one is going to call him The "Great" Ogre Of The North again.
}

; ============================================================
; DATA - Weapons (name|cost|attack|str_needed)
; ============================================================
alias lord.weapons {
  return Stick|200|5|0|Dagger|1000|10|0|Short Sword|3000|20|15|Long Sword|10000|30|22|Huge Axe|30000|40|32|Bone Cruncher|100000|60|44|Twin Swords|150000|80|64|Power Axe|200000|120|99|Ables Sword|400000|180|149|Wans Weapon|1000000|250|224|Spear of Gold|4000000|350|334|Crystal Shard|1000000|500|334|Niras Teeth|40000000|800|334|Blood Sword|100000000|1200|334|Death Sword|400000000|1800|334
}

; ============================================================
; DATA - Armors (name|cost|defense|str_needed)
; ============================================================
alias lord.armors {
  return Coat|200|1|0|Heavy Coat|1000|3|0|Leather Vest|3000|10|2|Bronze Armor|10000|15|5|Iron Armor|30000|25|10|Graphite Armor|100000|35|20|Erdricks Armor|150000|50|35|Armor of Death|200000|75|57|Ables Armor|400000|100|92|Full Body Armor|1000000|150|152|Blood Armor|4000000|225|232|Magic Protection|10000000|300|232|Belars Armor|40000000|400|232|Golden Armor|100000000|600|232|Armor of Love|400000000|1000|232
}

; ============================================================
; DATA - Level Gains (level|hp|str|def|xp_needed) x12
; ============================================================
alias lord.gains {
  return 1|20|10|1|1|2|10|5|2|100|3|15|7|3|400|4|20|10|5|1000|5|30|12|10|4000|6|50|20|15|10000|7|75|35|22|40000|8|125|50|35|100000|9|185|75|60|400000|10|250|110|80|1000000|11|350|150|120|4000000|12|550|200|150|10000000
}

; ============================================================
; DATA - Masters (name|hp|str|weapon|greeting)
; ============================================================
alias lord.masters {
  return Halder|30|10|Short Sword|Halder: Although I may not look muscular, I ain't all that weak.|Barak|50|10|Battle Axe|You are now level two, and a respected warrior.|Aragorn|100|10|Twin Swords|You are now level three, and you are becoming well known.|Olodrin|120|10|Power Axe|You are now level four.|Sandtiger|140|10|Blessed Sword|You are now level five. Not bad.|Sparhawk|160|10|Double Bladed Sword|You are level six! Vengeance is yours!|Atsuko Sensei|180|10|Huge Curved Blade|Even in my country, you would be considered a good warrior.|Aladdin|190|10|Shiny Lamp|You are now level eight.|Prince Caspian|200|10|Flashing Rapier|You are now level nine.|Gandalf|210|10|Huge Fireballs|You are now level ten. A true honor!|Turgon|220|10|Ables Sword|I am Turgon, son. The greatest warrior in the realm.
}

; ============================================================
; UTILITY FUNCTIONS
; ============================================================

; Get random number between min and max
alias lord.random {
  var %min = $1
  var %max = $2
  if (%min > %max) { var %tmp = %min | var %min = %max | var %max = %tmp }
  var %range = %max - %min + 1
  var %result = $int($calc(($r(0,100000) / 100000) * %range + %min))
  return %result
}

; Parse token from monster data (7 fields per monster)
alias lord.monster.name { return $gettok($lord.monsters, $calc(($1 - 1) * 7 + 1), 124) }
alias lord.monster.weapon { return $gettok($lord.monsters, $calc(($1 - 1) * 7 + 2), 124) }
alias lord.monster.str { return $gettok($lord.monsters, $calc(($1 - 1) * 7 + 3), 124) }
alias lord.monster.hp { return $gettok($lord.monsters, $calc(($1 - 1) * 7 + 4), 124) }
alias lord.monster.gold { return $gettok($lord.monsters, $calc(($1 - 1) * 7 + 5), 124) }
alias lord.monster.xp { return $gettok($lord.monsters, $calc(($1 - 1) * 7 + 6), 124) }
alias lord.monster.death { return $gettok($lord.monsters, $calc(($1 - 1) * 7 + 7), 124) }

; Get weapon data (4 fields per weapon)
alias lord.weapon.name { return $gettok($lord.weapons, $calc(($1 - 1) * 4 + 1), 124) }
alias lord.weapon.cost { return $gettok($lord.weapons, $calc(($1 - 1) * 4 + 2), 124) }
alias lord.weapon.attack { return $gettok($lord.weapons, $calc(($1 - 1) * 4 + 3), 124) }
alias lord.weapon.strreq { return $gettok($lord.weapons, $calc(($1 - 1) * 4 + 4), 124) }

; Get armor data (4 fields per armor)
alias lord.armor.name { return $gettok($lord.armors, $calc(($1 - 1) * 4 + 1), 124) }
alias lord.armor.cost { return $gettok($lord.armors, $calc(($1 - 1) * 4 + 2), 124) }
alias lord.armor.def { return $gettok($lord.armors, $calc(($1 - 1) * 4 + 3), 124) }
alias lord.armor.strreq { return $gettok($lord.armors, $calc(($1 - 1) * 4 + 4), 124) }

; Get level gains (5 fields per level)
alias lord.gain.hp { return $gettok($lord.gains, $calc(($1 - 1) * 5 + 2), 124) }
alias lord.gain.str { return $gettok($lord.gains, $calc(($1 - 1) * 5 + 3), 124) }
alias lord.gain.def { return $gettok($lord.gains, $calc(($1 - 1) * 5 + 4), 124) }
alias lord.gain.xp { return $gettok($lord.gains, $calc(($1 - 1) * 5 + 5), 124) }

; Count monsters
alias lord.monster.count { return $calc($numtok($lord.monsters, 124) / 7) }

; ============================================================
; PLAYER DATA FUNCTIONS
; ============================================================

; Check if player exists
alias lord.player.exists {
  var %nick = $1
  return $exists($lord.playersdir $+ %nick $+ .ini)
}

; Get player variable
alias lord.player.get {
  var %nick = $1
  var %field = $2
  return $readini($lord.playersdir $+ %nick $+ .ini, Player, %field)
}

; Set player variable
alias lord.player.set {
  var %nick = $1
  var %field = $2
  var %value = $3
  writeini -n $lord.playersdir $+ %nick $+ .ini Player %field %value
}

; Increment player variable
alias lord.player.inc {
  var %nick = $1
  var %field = $2
  var %amount = $3
  var %max = $4
  var %current = $lord.player.get(%nick, %field)
  var %new = $calc(%current + %amount)
  if (%max != $null) && (%new > %max) var %new = %max
  $lord.player.set(%nick, %field, %new)
  return %new
}

; Decrement player variable (min 0)
alias lord.player.dec {
  var %nick = $1
  var %field = $2
  var %amount = $3
  var %current = $lord.player.get(%nick, %field)
  var %new = $calc(%current - %amount)
  if (%new < 0) var %new = 0
  $lord.player.set(%nick, %field, %new)
  return %new
}

; Create new player
alias lord.player.create {
  var %nick = $1
  var %name = $2
  var %class = $3
  var %sex = $4

  ; Create player directory if needed
  if (!$exists($lord.playersdir)) mkdir $lord.playersdir

  ; Set basic info
  $lord.player.set(%nick, name, %name)
  $lord.player.set(%nick, class, %class)
  $lord.player.set(%nick, sex, %sex)
  $lord.player.set(%nick, level, 1)
  $lord.player.set(%nick, hp, 20)
  $lord.player.set(%nick, maxhp, 20)
  $lord.player.set(%nick, str, 10)
  $lord.player.set(%nick, def, 1)
  $lord.player.set(%nick, weapon, Stick)
  $lord.player.set(%nick, weapon_num, 1)
  $lord.player.set(%nick, armor, Coat)
  $lord.player.set(%nick, armor_num, 1)
  $lord.player.set(%nick, gold, 6000)
  $lord.player.set(%nick, bank, 0)
  $lord.player.set(%nick, gems, 0)
  $lord.player.set(%nick, xp, 1)
  $lord.player.set(%nick, fights, 500)
  $lord.player.set(%nick, pfights, 3)
  $lord.player.set(%nick, dead, 0)
  $lord.player.set(%nick, charm, 1)
  $lord.player.set(%nick, horse, 0)
  $lord.player.set(%nick, lays, 0)
  $lord.player.set(%nick, marriedto, none)
  $lord.player.set(%nick, fairies, 0)
  $lord.player.set(%nick, seen_master, 0)
  $lord.player.set(%nick, seen_dragon, 0)
  $lord.player.set(%nick, seenviolet, 0)
  $lord.player.set(%nick, flirted, 0)
  $lord.player.set(%nick, stayinn, 0)
  $lord.player.set(%nick, classd, 1)
  $lord.player.set(%nick, classm, 0)
  $lord.player.set(%nick, classt, 0)
  $lord.player.set(%nick, usesd, 1)
  $lord.player.set(%nick, usesm, 0)
  $lord.player.set(%nick, usest, 0)
  $lord.player.set(%nick, mastered, -1)
  $lord.player.set(%nick, mastered2, -1)
  $lord.player.set(%nick, mastered3, -1)
  $lord.player.set(%nick, baraks_visited_today, 0)

  return $true
}

; ============================================================
; GAME STATE MANAGEMENT
; ============================================================

; Set current game state for a user
alias lord.state.set {
  var %nick = $1
  var %state = $2
  writeini -n $lord.datafile State %nick %state
}

; Get current game state for a user
alias lord.state.get {
  var %nick = $1
  return $readini($lord.datafile, State, %nick)
}

; Set temporary game variable for a user
alias lord.temp.set {
  var %nick = $1
  var %var = $2
  var %value = $3-
  writeini -n $lord.datafile Temp $+ %nick %var %value
}

; Get temporary game variable for a user
alias lord.temp.get {
  var %nick = $1
  var %var = $2
  return $readini($lord.datafile, Temp $+ %nick, %var)
}

; Clear temporary variables for a user
alias lord.temp.clear {
  var %nick = $1
  var %file = $lord.datafile
  ; Remove temp section for user
  var %section = Temp $+ %nick
  ; mIRC doesn't have easy section delete, so we just overwrite
  writeini -n %file %section _clear 1
}

; ============================================================
; DISPLAY FUNCTIONS
; ============================================================

; Send message to user (via notice or msg)
alias lord.msg {
  var %target = $1
  var %text = $2-
  if ($me != $null) {
    .notice %target %text
  }
}

; Send multi-line text
alias lord.lines {
  var %target = $1
  var %i = 2
  while (%i <= $0) {
    $lord.msg(%target, $($ $+ %i, 2))
    inc %i
  }
}

; ============================================================
; MAIN MENU
; ============================================================
alias lord.menu.main {
  var %nick = $1
  var %level = $lord.player.get(%nick, level)
  var %hp = $lord.player.get(%nick, hp)
  var %maxhp = $lord.player.get(%nick, maxhp)
  var %gold = $lord.player.get(%nick, gold)
  var %fights = $lord.player.get(%nick, fights)
  var %name = $lord.player.get(%nick, name)
  var %sex = $lord.player.get(%nick, sex)

  var %sextext = $iif(%sex == 0, His, Her)

  $lord.msg(%nick, $+($chr(3),$chr(48),$chr(44),$chr(49),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124)))
  $lord.msg(%nick, $+($chr(3),$chr(48),$chr(44),$chr(49),Legend Of The Red Dragon - v,$lord.version))
  $lord.msg(%nick, $+($chr(3),$chr(48),$chr(44),$chr(49),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124)))
  $lord.msg(%nick, $+(%name, - Level %level warrior - HP: %hp/%maxhp - Gold: %gold - Fights: %fights))
  $lord.msg(%nick, $+($chr(3),$chr(48),$chr(44),$chr(49),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124),$chr(124),$chr(66),$chr(124)))
  $lord.msg(%nick, $str(-,50))
  $lord.msg(%nick, (F)ight    (S)tats    (W)eapons    (A)rmor)
  $lord.msg(%nick, (B)ank     (I)nn      (T)avern     (P)eople)
  $lord.msg(%nick, (C)asino   (H)ealer   (N)ews       (?)Help)
  $lord.msg(%nick, $str(-,50))
  $lord.msg(%nick, Choose your action:)

  $lord.state.set(%nick, main)
}

; ============================================================
; STATS SCREEN
; ============================================================
alias lord.menu.stats {
  var %nick = $1
  var %name = $lord.player.get(%nick, name)
  var %level = $lord.player.get(%nick, level)
  var %hp = $lord.player.get(%nick, hp)
  var %maxhp = $lord.player.get(%nick, maxhp)
  var %str = $lord.player.get(%nick, str)
  var %def = $lord.player.get(%nick, def)
  var %xp = $lord.player.get(%nick, xp)
  var %gold = $lord.player.get(%nick, gold)
  var %bank = $lord.player.get(%nick, bank)
  var %gems = $lord.player.get(%nick, gems)
  var %weapon = $lord.player.get(%nick, weapon)
  var %armor = $lord.player.get(%nick, armor)
  var %fights = $lord.player.get(%nick, fights)
  var %pfights = $lord.player.get(%nick, pfights)
  var %sex = $lord.player.get(%nick, sex)
  var %class = $lord.player.get(%nick, class)
  var %charm = $lord.player.get(%nick, charm)
  var %fairies = $lord.player.get(%nick, fairies)
  var %horse = $lord.player.get(%nick, horse)

  ; Calculate XP needed for next level
  var %nextxp = $lord.gain.xp(%level)
  var %xpprogress = $calc(%xp * 100 / %nextxp)

  ; Class name
  var %classname = $iif(%class == 0, Warrior, $iif(%class == 1, Death Knight, $iif(%class == 2, Mystic, Thief)))

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, $+(%name, - Level %level %classname))
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, HP: %hp/%maxhp  Str: %str  Def: %def  Charm: %charm)
  $lord.msg(%nick, Gold: %gold  Bank: %bank  Gems: %gems)
  $lord.msg(%nick, Weapon: %weapon  Armor: %armor)
  $lord.msg(%nick, Fights: %fights  Player Fights: %pfights)
  $lord.msg(%nick, Experience: %xp/%nextxp ($left($str(-,$int(%xpprogress)),$int(%xpprogress)) $+ $chr(62)) $+ ))
  $lord.msg(%nick, Fairies: %fairies  Horse: $iif(%horse,$iif(%horse == 1, White, Black), None))
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, Press (M) to return to main menu)
  $lord.msg(%nick, $+($str(-,40)))

  $lord.state.set(%nick, stats)
}

; ============================================================
; FOREST FIGHTING
; ============================================================
alias lord.forest.fight {
  var %nick = $1

  ; Check for fights
  var %fights = $lord.player.get(%nick, fights)
  if (%fights <= 0) {
    $lord.msg(%nick, You have no more forest fights today!)
    $lord.msg(%nick, Come back tomorrow or stay at the Inn.)
    $lord.menu.main(%nick)
    return
  }

  ; Decrement fights
  $lord.player.dec(%nick, fights, 1)

  ; Get random monster based on level
  var %level = $lord.player.get(%nick, level)
  var %maxmonster = $lord.monster.count
  ; Scale monster difficulty with level
  var %monsterindex = $lord.random(1, $min(%maxmonster, %level * 10))

  ; Get monster data
  var %mname = $lord.monster.name(%monsterindex)
  var %mweapon = $lord.monster.weapon(%monsterindex)
  var %mstr = $lord.monster.str(%monsterindex)
  var %mhp = $lord.monster.hp(%monsterindex)
  var %mgold = $lord.monster.gold(%monsterindex)
  var %mxp = $lord.monster.xp(%monsterindex)
  var %mdeath = $lord.monster.death(%monsterindex)

  ; Store monster data in temp
  $lord.temp.set(%nick, monster_name, %mname)
  $lord.temp.set(%nick, monster_weapon, %mweapon)
  $lord.temp.set(%nick, monster_str, %mstr)
  $lord.temp.set(%nick, monster_hp, %mhp)
  $lord.temp.set(%nick, monster_gold, %mgold)
  $lord.temp.set(%nick, monster_xp, %mxp)
  $lord.temp.set(%nick, monster_death, %mdeath)
  $lord.temp.set(%nick, monster_index, %monsterindex)

  ; Display encounter
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, $+ A wild %mname appears!)
  $lord.msg(%nick, $+ It wields a %mweapon and has %mhp HP.)
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, (A)ttack    (R)un    (P)ower Move)

  $lord.state.set(%nick, fight)
}

alias lord.fight.attack {
  var %nick = $1

  ; Get player stats
  var %pstr = $lord.player.get(%nick, str)
  var %weaponnum = $lord.player.get(%nick, weapon_num)
  var %pattack = $lord.weapon.attack(%weaponnum)

  ; Get monster stats
  var %mhp = $lord.temp.get(%nick, monster_hp)
  var %mstr = $lord.temp.get(%nick, monster_str)
  var %mname = $lord.temp.get(%nick, monster_name)
  var %mweapon = $lord.temp.get(%nick, monster_weapon)

  ; Calculate player damage
  var %pdamage = $lord.random(1, %pstr) + %pattack

  ; Check for power move (10% chance)
  if ($lord.random(1, 100) >= 90) {
    var %multiplier = $lord.random(15, 55) / 10
    var %pdamage = $int($calc(%pstr * %multiplier + %pattack * %multiplier))
    $lord.msg(%nick, $+($chr(3),$chr(48),$chr(48),$chr(44),$chr(49),$chr(52), ** POWER MOVE! **))
  }

  ; Apply damage to monster
  var %newhp = %mhp - %pdamage
  $lord.temp.set(%nick, monster_hp, %newhp)

  $lord.msg(%nick, You hit %mname for %pdamage damage!)

  ; Check if monster died
  if (%newhp <= 0) {
    $lord.fight.win(%nick)
    return
  }

  ; Monster attacks back
  var %armornum = $lord.player.get(%nick, armor_num)
  var %pdef = $lord.armor.def(%armornum)
  var %mdamage = $lord.random(1, %mstr) - %pdef
  if (%mdamage < 0) var %mdamage = 0

  ; Apply damage to player
  var %php = $lord.player.get(%nick, hp)
  var %newphp = %php - %mdamage
  $lord.player.set(%nick, hp, %newphp)

  if (%mdamage > 0) {
    $lord.msg(%nick, %mname hits you with %mweapon for %mdamage damage!)
  }
  else {
    $lord.msg(%nick, %mname misses!)
  }

  ; Check if player died
  if (%newphp <= 0) {
    $lord.fight.lose(%nick)
    return
  }

  ; Continue fight
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, Your HP: %newphp - Monster HP: %newhp)
  $lord.msg(%nick, (A)ttack    (R)un    (P)ower Move)

  $lord.state.set(%nick, fight)
}

alias lord.fight.run {
  var %nick = $1

  ; 25% chance to fail running
  if ($lord.random(1, 100) <= 25) {
    $lord.msg(%nick, You failed to escape!)
    $lord.msg(%nick, The monster attacks!)

    ; Monster attacks
    var %mstr = $lord.temp.get(%nick, monster_str)
    var %mweapon = $lord.temp.get(%nick, monster_weapon)
    var %mname = $lord.temp.get(%nick, monster_name)
    var %armornum = $lord.player.get(%nick, armor_num)
    var %pdef = $lord.armor.def(%armornum)
    var %mdamage = $lord.random(1, %mstr) - %pdef
    if (%mdamage < 0) var %mdamage = 0

    var %php = $lord.player.get(%nick, hp)
    var %newphp = %php - %mdamage
    $lord.player.set(%nick, hp, %newphp)

    if (%mdamage > 0) {
      $lord.msg(%nick, %mname hits you with %mweapon for %mdamage damage!)
    }

    if (%newphp <= 0) {
      $lord.fight.lose(%nick)
      return
    }
  }
  else {
    $lord.msg(%nick, You escaped!)
  }

  $lord.menu.main(%nick)
}

alias lord.fight.power {
  var %nick = $1

  ; Get player stats
  var %pstr = $lord.player.get(%nick, str)
  var %weaponnum = $lord.player.get(%nick, weapon_num)
  var %pattack = $lord.weapon.attack(%weaponnum)

  ; Get monster stats
  var %mhp = $lord.temp.get(%nick, monster_hp)
  var %mstr = $lord.temp.get(%nick, monster_str)
  var %mname = $lord.temp.get(%nick, monster_name)
  var %mweapon = $lord.temp.get(%nick, monster_weapon)

  ; Power move is 1.5x - 5.5x damage
  var %multiplier = $lord.random(15, 55) / 10
  var %pdamage = $int($calc(%pstr * %multiplier + %pattack * %multiplier))

  ; Monster attacks back for full damage
  var %armornum = $lord.player.get(%nick, armor_num)
  var %pdef = $lord.armor.def(%armornum)
  var %mdamage = $lord.random(1, %mstr)

  ; Apply damage to monster
  var %newhp = %mhp - %pdamage
  $lord.temp.set(%nick, monster_hp, %newhp)

  ; Apply damage to player
  var %php = $lord.player.get(%nick, hp)
  var %newphp = %php - %mdamage
  $lord.player.set(%nick, hp, %newphp)

  $lord.msg(%nick, $+($chr(3),$chr(48),$chr(48),$chr(44),$chr(49),$chr(52), ** POWER MOVE! **))
  $lord.msg(%nick, You hit %mname for %pdamage damage!)

  if (%mdamage > 0) {
    $lord.msg(%nick, %mname hits you with %mweapon for %mdamage damage!)
  }

  ; Check outcomes
  if (%newhp <= 0) {
    $lord.fight.win(%nick)
    return
  }
  if (%newphp <= 0) {
    $lord.fight.lose(%nick)
    return
  }

  ; Continue fight
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, Your HP: %newphp - Monster HP: %newhp)
  $lord.msg(%nick, (A)ttack    (R)un    (P)ower Move)

  $lord.state.set(%nick, fight)
}

alias lord.fight.win {
  var %nick = $1

  var %mgold = $lord.temp.get(%nick, monster_gold)
  var %mxp = $lord.temp.get(%nick, monster_xp)
  var %mname = $lord.temp.get(%nick, monster_name)
  var %mdeath = $lord.temp.get(%nick, monster_death)

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, %mdeath)
  $lord.msg(%nick, You have killed %mname!)
  $lord.msg(%nick, You receive %mgold gold and %mxp experience!)

  ; Award gold and XP
  $lord.player.inc(%nick, gold, %mgold, 9999999)
  $lord.player.inc(%nick, xp, %mxp, 2147483647)

  ; Check for level up
  $lord.check.levelup(%nick)

  ; Clear temp
  $lord.temp.clear(%nick)

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, (M)ain Menu    (F)ight Again)

  $lord.state.set(%nick, fight_win)
}

alias lord.fight.lose {
  var %nick = $1

  var %mname = $lord.temp.get(%nick, monster_name)

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, You have been killed by %mname!)
  $lord.msg(%nick, You lost some gold on hand...)
  $lord.msg(%nick, You wake up at the Inn, healed but shaken.)

  ; Reset HP
  $lord.player.set(%nick, hp, $lord.player.get(%nick, maxhp))

  ; Lose some gold (10%)
  var %gold = $lord.player.get(%nick, gold)
  var %lost = $int($calc(%gold * 0.1))
  $lord.player.dec(%nick, gold, %lost)

  ; Mark as dead temporarily
  $lord.player.set(%nick, dead, 1)

  ; Clear temp
  $lord.temp.clear(%nick)

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, Press (M) to return to main menu)

  $lord.state.set(%nick, dead)
}

; ============================================================
; LEVEL UP CHECK
; ============================================================
alias lord.check.levelup {
  var %nick = $1
  var %level = $lord.player.get(%nick, level)
  var %xp = $lord.player.get(%nick, xp)

  ; Check XP needed for current level
  var %nextxp = $lord.gain.xp(%level)

  if (%xp >= %nextxp && %level < 12) {
    ; Level up!
    var %newlevel = %level + 1
    var %hp = $lord.gain.hp(%newlevel)
    var %str = $lord.gain.str(%newlevel)
    var %def = $lord.gain.def(%newlevel)

    $lord.player.set(%nick, level, %newlevel)
    $lord.player.set(%nick, hp, %hp)
    $lord.player.set(%nick, maxhp, %hp)
    $lord.player.set(%nick, str, %str)
    $lord.player.set(%nick, def, %def)

    $lord.msg(%nick, $+($chr(3),$chr(48),$chr(48),$chr(44),$chr(49),$chr(52), ********** LEVEL UP! **********))
    $lord.msg(%nick, You are now level %newlevel!)
    $lord.msg(%nick, HP: %hp  Str: %str  Def: %def)
    $lord.msg(%nick, $+($chr(3),$chr(48),$chr(48),$chr(44),$chr(49),$chr(52), *********************************))
  }
}

; ============================================================
; WEAPON SHOP
; ============================================================
alias lord.menu.weapons {
  var %nick = $1
  var %gold = $lord.player.get(%nick, gold)
  var %str = $lord.player.get(%nick, str)
  var %currentweapon = $lord.player.get(%nick, weapon_num)

  $lord.msg(%nick, $+($str(-,50)))
  $lord.msg(%nick, Weapons Shop)
  $lord.msg(%nick, Your gold: %gold)
  $lord.msg(%nick, $+($str(-,50)))

  ; List weapons (15 total)
  var %i = 1
  while (%i <= 15) {
    var %name = $lord.weapon.name(%i)
    var %cost = $lord.weapon.cost(%i)
    var %attack = $lord.weapon.attack(%i)
    var %req = $lord.weapon.strreq(%i)
    var %equipped = $iif(%i == %currentweapon, [EQUIPPED], )

    if (%str >= %req) {
      $lord.msg(%nick, $+((,%i,) %name %equipped - %attack ATK - %cost gold)
    }
    else {
      $lord.msg(%nick, $+((,%i,) %name - %attack ATK - %cost gold [Str %req Req])
    }
    inc %i
  }

  $lord.msg(%nick, $+($str(-,50)))
  $lord.msg(%nick, (B)uy    (S)ell    (M)ain Menu)

  $lord.state.set(%nick, weapons)
}

alias lord.weapon.buy {
  var %nick = $1
  var %choice = $2

  if (%choice < 1 || %choice > 15) {
    $lord.msg(%nick, Invalid choice.)
    $lord.menu.weapons(%nick)
    return
  }

  var %name = $lord.weapon.name(%choice)
  var %cost = $lord.weapon.cost(%choice)
  var %req = $lord.weapon.strreq(%choice)
  var %gold = $lord.player.get(%nick, gold)
  var %str = $lord.player.get(%nick, str)

  if (%str < %req) {
    $lord.msg(%nick, You need %req strength to wield this weapon!)
    $lord.menu.weapons(%nick)
    return
  }

  if (%gold < %cost) {
    $lord.msg(%nick, You don't have enough gold!)
    $lord.msg(%nick, Cost: %cost - You have: %gold)
    $lord.menu.weapons(%nick)
    return
  }

  ; Buy weapon
  $lord.player.dec(%nick, gold, %cost)
  $lord.player.set(%nick, weapon, %name)
  $lord.player.set(%nick, weapon_num, %choice)

  $lord.msg(%nick, You purchased %name for %cost gold!)
  $lord.menu.weapons(%nick)
}

alias lord.weapon.sell {
  var %nick = $1
  var %choice = $2

  if (%choice < 1 || %choice > 15) {
    $lord.msg(%nick, Invalid choice.)
    $lord.menu.weapons(%nick)
    return
  }

  var %name = $lord.weapon.name(%choice)
  var %sellprice = $int($calc($lord.weapon.cost(%choice) * 0.5))

  ; Buy back player's weapon
  $lord.player.inc(%nick, gold, %sellprice)
  $lord.player.set(%nick, weapon, %name)
  $lord.player.set(%nick, weapon_num, %choice)

  $lord.msg(%nick, You sold your weapon for %sellprice gold!)
  $lord.menu.weapons(%nick)
}

; ============================================================
; ARMOR SHOP
; ============================================================
alias lord.menu.armor {
  var %nick = $1
  var %gold = $lord.player.get(%nick, gold)
  var %str = $lord.player.get(%nick, str)
  var %currentarmor = $lord.player.get(%nick, armor_num)

  $lord.msg(%nick, $+($str(-,50)))
  $lord.msg(%nick, Armor Shop)
  $lord.msg(%nick, Your gold: %gold)
  $lord.msg(%nick, $+($str(-,50)))

  ; List armors (15 total)
  var %i = 1
  while (%i <= 15) {
    var %name = $lord.armor.name(%i)
    var %cost = $lord.armor.cost(%i)
    var %def = $lord.armor.def(%i)
    var %req = $lord.armor.strreq(%i)
    var %equipped = $iif(%i == %currentarmor, [EQUIPPED], )

    if (%str >= %req) {
      $lord.msg(%nick, $+((,%i,) %name %equipped - %def DEF - %cost gold)
    }
    else {
      $lord.msg(%nick, $+((,%i,) %name - %def DEF - %cost gold [Str %req Req])
    }
    inc %i
  }

  $lord.msg(%nick, $+($str(-,50)))
  $lord.msg(%nick, (B)uy    (S)ell    (M)ain Menu)

  $lord.state.set(%nick, armor)
}

alias lord.armor.buy {
  var %nick = $1
  var %choice = $2

  if (%choice < 1 || %choice > 15) {
    $lord.msg(%nick, Invalid choice.)
    $lord.menu.armor(%nick)
    return
  }

  var %name = $lord.armor.name(%choice)
  var %cost = $lord.armor.cost(%choice)
  var %req = $lord.armor.strreq(%choice)
  var %gold = $lord.player.get(%nick, gold)
  var %str = $lord.player.get(%nick, str)

  if (%str < %req) {
    $lord.msg(%nick, You need %req strength to wear this armor!)
    $lord.menu.armor(%nick)
    return
  }

  if (%gold < %cost) {
    $lord.msg(%nick, You don't have enough gold!)
    $lord.msg(%nick, Cost: %cost - You have: %gold)
    $lord.menu.armor(%nick)
    return
  }

  ; Buy armor
  $lord.player.dec(%nick, gold, %cost)
  $lord.player.set(%nick, armor, %name)
  $lord.player.set(%nick, armor_num, %choice)

  $lord.msg(%nick, You purchased %name for %cost gold!)
  $lord.menu.armor(%nick)
}

alias lord.armor.sell {
  var %nick = $1
  var %choice = $2

  if (%choice < 1 || %choice > 15) {
    $lord.msg(%nick, Invalid choice.)
    $lord.menu.armor(%nick)
    return
  }

  var %name = $lord.armor.name(%choice)
  var %sellprice = $int($calc($lord.armor.cost(%choice) * 0.5))

  ; Buy back player's armor
  $lord.player.inc(%nick, gold, %sellprice)
  $lord.player.set(%nick, armor, %name)
  $lord.player.set(%nick, armor_num, %choice)

  $lord.msg(%nick, You sold your armor for %sellprice gold!)
  $lord.menu.armor(%nick)
}

; ============================================================
; BANK
; ============================================================
alias lord.menu.bank {
  var %nick = $1
  var %gold = $lord.player.get(%nick, gold)
  var %bank = $lord.player.get(%nick, bank)

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, The Bank of LORD)
  $lord.msg(%nick, Gold on hand: %gold)
  $lord.msg(%nick, Gold in bank: %bank)
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, (D)eposit    (W)ithdraw    (M)ain Menu)

  $lord.state.set(%nick, bank)
}

alias lord.bank.deposit {
  var %nick = $1
  var %amount = $2
  var %gold = $lord.player.get(%nick, gold)

  if (%amount == 0 || %amount > %gold) {
    $lord.msg(%nick, Invalid amount or insufficient funds!)
    $lord.menu.bank(%nick)
    return
  }

  $lord.player.dec(%nick, gold, %amount)
  $lord.player.inc(%nick, bank, %amount)

  $lord.msg(%nick, You deposited %amount gold.)
  $lord.msg(%nick, Bank balance: $lord.player.get(%nick, bank))
  $lord.menu.bank(%nick)
}

alias lord.bank.withdraw {
  var %nick = $1
  var %amount = $2
  var %bank = $lord.player.get(%nick, bank)

  if (%amount == 0 || %amount > %bank) {
    $lord.msg(%nick, Invalid amount or insufficient funds!)
    $lord.menu.bank(%nick)
    return
  }

  $lord.player.dec(%nick, bank, %amount)
  $lord.player.inc(%nick, gold, %amount)

  $lord.msg(%nick, You withdrew %amount gold.)
  $lord.msg(%nick, Gold on hand: $lord.player.get(%nick, gold))
  $lord.menu.bank(%nick)
}

; ============================================================
; HEALER
; ============================================================
alias lord.menu.healer {
  var %nick = $1
  var %hp = $lord.player.get(%nick, hp)
  var %maxhp = $lord.player.get(%nick, maxhp)
  var %gold = $lord.player.get(%nick, gold)
  var %level = $lord.player.get(%nick, level)

  var %cost = $calc(%level * 5)

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, Town Healer)
  $lord.msg(%nick, Your HP: %hp/%maxhp)
  $lord.msg(%nick, Heal cost: %cost gold)
  $lord.msg(%nick, Your gold: %gold)
  $lord.msg(%nick, $+($str(-,40)))

  if (%hp >= %maxhp) {
    $lord.msg(%nick, You are already at full health!)
  }
  else {
    $lord.msg(%nick, (H)eal yourself)
  }
  $lord.msg(%nick, (M)ain Menu)

  $lord.state.set(%nick, healer)
}

alias lord.healer.heal {
  var %nick = $1
  var %hp = $lord.player.get(%nick, hp)
  var %maxhp = $lord.player.get(%nick, maxhp)
  var %gold = $lord.player.get(%nick, gold)
  var %level = $lord.player.get(%nick, level)
  var %cost = $calc(%level * 5)

  if (%hp >= %maxhp) {
    $lord.msg(%nick, You are already at full health!)
    $lord.menu.healer(%nick)
    return
  }

  if (%gold < %cost) {
    $lord.msg(%nick, You don't have enough gold!)
    $lord.msg(%nick, Cost: %cost - You have: %gold)
    $lord.menu.healer(%nick)
    return
  }

  $lord.player.dec(%nick, gold, %cost)
  $lord.player.set(%nick, hp, %maxhp)

  $lord.msg(%nick, The healer restores you to full health!)
  $lord.msg(%nick, HP: %maxhp/%maxhp)
  $lord.menu.healer(%nick)
}

; ============================================================
; INN
; ============================================================
alias lord.menu.inn {
  var %nick = $1
  var %gold = $lord.player.get(%nick, gold)
  var %stayinn = $lord.player.get(%nick, stayinn)

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, The Inn)
  $lord.msg(%nick, Your gold: %gold)
  $lord.msg(%nick, $+($str(-,40)))

  if (%stayinn == 1) {
    $lord.msg(%nick, You are currently staying at the inn.)
    $lord.msg(%nick, You are safe from most attacks.)
  }
  else {
    $lord.msg(%nick, Room rate: 400 gold/night)
    $lord.msg(%nick, (S)tay the night)
  }
  $lord.msg(%nick, (T)alk to patrons)
  $lord.msg(%nick, (M)ain Menu)

  $lord.state.set(%nick, inn)
}

alias lord.inn.stay {
  var %nick = $1
  var %gold = $lord.player.get(%nick, gold)

  if (%gold < 400) {
    $lord.msg(%nick, You don't have enough gold!)
    $lord.msg(%nick, Cost: 400 - You have: %gold)
    $lord.menu.inn(%nick)
    return
  }

  $lord.player.dec(%nick, gold, 400)
  $lord.player.set(%nick, stayinn, 1)
  $lord.player.set(%nick, hp, $lord.player.get(%nick, maxhp))

  $lord.msg(%nick, You rent a room for the night.)
  $lord.msg(%nick, You are fully healed and safe from attacks!)
  $lord.msg(%nick, You wake up refreshed and ready to fight!)
  $lord.menu.inn(%nick)
}

; ============================================================
; DARK CLOAK TAVERN
; ============================================================
alias lord.menu.tavern {
  var %nick = $1

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, The Dark Cloak Tavern)
  $lord.msg(%nick, A shadowy establishment filled with mercenaries.)
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, (T)alk to Chance (Bartender)
  $lord.msg(%nick, (G)amble with locals)
  $lord.msg(%nick, (M)ain Menu)

  $lord.state.set(%nick, tavern)
}

; ============================================================
; PEOPLE ONLINE (Placeholder)
; ============================================================
alias lord.menu.people {
  var %nick = $1

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, People Currently Online)
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, (None currently - this is a placeholder))
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, (M)ain Menu)

  $lord.state.set(%nick, people)
}

; ============================================================
; NEWS (Placeholder)
; ============================================================
alias lord.menu.news {
  var %nick = $1

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, Daily Happenings)
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, A peaceful day in the realm... (placeholder))
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, (M)ain Menu)

  $lord.state.set(%nick, news)
}

; ============================================================
; CASINO (Blackjack - Placeholder)
; ============================================================
alias lord.menu.casino {
  var %nick = $1
  var %gold = $lord.player.get(%nick, gold)

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, LORD Casino - Blackjack")
  $lord.msg(%nick, Your gold: %gold)
  $lord.msg(%nick, Minimum bet: 200 - Maximum bet: 5000)
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, (Coming soon!)
  $lord.msg(%nick, (M)ain Menu)

  $lord.state.set(%nick, casino)
}

; ============================================================
; CHARACTER CREATION
; ============================================================
alias lord.menu.create {
  var %nick = $1

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, Create Your Character)
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, Enter your warrior name:)
  $lord.msg(%nick, $+((1-20 chars, no colors))

  $lord.state.set(%nick, create_name)
}

alias lord.create.name {
  var %nick = $1
  var %name = $2

  if ($len(%name) < 1 || $len(%name) > 20) {
    $lord.msg(%nick, Name must be 1-20 characters!)
    $lord.menu.create(%nick)
    return
  }

  $lord.temp.set(%nick, create_name, %name)
  $lord.msg(%nick, Name set to: %name)
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, Select your class:)
  $lord.msg(%nick, (1) Warrior - Balanced fighter)
  $lord.msg(%nick, (2) Death Knight - Strong attacker, uses stamina)
  $lord.msg(%nick, (3) Mystic - Magical abilities)
  $lord.msg(%nick, (4) Thief - Stealth and cunning)

  $lord.state.set(%nick, create_class)
}

alias lord.create.class {
  var %nick = $1
  var %choice = $2

  if (%choice < 1 || %choice > 4) {
    $lord.msg(%nick, Invalid choice!)
    $lord.msg(%nick, (1) Warrior (2) Death Knight (3) Mystic (4) Thief)
    return
  }

  $lord.temp.set(%nick, create_class, $calc(%choice - 1))
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, Select your gender:)
  $lord.msg(%nick, (M)ale    (F)emale)

  $lord.state.set(%nick, create_sex)
}

alias lord.create.sex {
  var %nick = $1
  var %sex = $iif($upper($2) == M, 0, 1)

  var %name = $lord.temp.get(%nick, create_name)
  var %class = $lord.temp.get(%nick, create_class)

  $lord.player.create(%nick, %name, %class, %sex)

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, Character Created!)
  $lord.msg(%nick, Name: %name)
  $lord.msg(%nick, Class: $iif(%class == 0, Warrior, $iif(%class == 1, Death Knight, $iif(%class == 2, Mystic, Thief))))
  $lord.msg(%nick, Gender: $iif(%sex == 0, Male, Female))
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, Welcome to LORD! Press any key to continue...)

  $lord.temp.clear(%nick)
  $lord.state.set(%nick, created)
}

; ============================================================
; LOGIN
; ============================================================
alias lord.login {
  var %nick = $1

  if ($lord.player.exists(%nick)) {
    $lord.msg(%nick, Welcome back, %nick $+ !)
    $lord.msg(%nick, Loading your character...)

    ; Refill fights (daily reset)
    $lord.player.set(%nick, fights, 500)
    $lord.player.set(%nick, pfights, 3)

    ; Clear death flag
    if ($lord.player.get(%nick, dead) == 1) {
      $lord.player.set(%nick, dead, 0)
      $lord.msg(%nick, You have recovered from your previous death...)
    }

    $lord.menu.main(%nick)
  }
  else {
    $lord.msg(%nick, $+($str(-,40)))
    $lord.msg(%nick, Welcome to Legend of the Red Dragon!)
    $lord.msg(%nick, No character found for %nick $+ .)
    $lord.msg(%nick, $+($str(-,40)))
    $lord.msg(%nick, (N)ew Character    (Q)uit)

    $lord.state.set(%nick, login)
  }
}

; ============================================================
; MAIN COMMAND HANDLER
; ============================================================
alias lord.command {
  var %nick = $1
  var %cmd = $upper($2)
  var %param = $3-

  var %state = $lord.state.get(%nick)

  ; Handle based on state
  if (%state == login) {
    if (%cmd == N) {
      $lord.menu.create(%nick)
    }
    return
  }

  if (%state == create_name) {
    $lord.create.name(%nick, $2-)
    return
  }

  if (%state == create_class) {
    $lord.create.class(%nick, %cmd)
    return
  }

  if (%state == create_sex) {
    $lord.create.sex(%nick, %cmd)
    return
  }

  if (%state == created) {
    $lord.menu.main(%nick)
    return
  }

  if (%state == main) {
    if (%cmd == F) { $lord.forest.fight(%nick) | return }
    if (%cmd == S) { $lord.menu.stats(%nick) | return }
    if (%cmd == W) { $lord.menu.weapons(%nick) | return }
    if (%cmd == A) { $lord.menu.armor(%nick) | return }
    if (%cmd == B) { $lord.menu.bank(%nick) | return }
    if (%cmd == I) { $lord.menu.inn(%nick) | return }
    if (%cmd == T) { $lord.menu.tavern(%nick) | return }
    if (%cmd == P) { $lord.menu.people(%nick) | return }
    if (%cmd == H) { $lord.menu.healer(%nick) | return }
    if (%cmd == N) { $lord.menu.news(%nick) | return }
    if (%cmd == C) { $lord.menu.casino(%nick) | return }
    if (%cmd == ?) { $lord.menu.help(%nick) | return }
    return
  }

  if (%state == stats) {
    if (%cmd == M) { $lord.menu.main(%nick) | return }
    return
  }

  if (%state == fight) {
    if (%cmd == A) { $lord.fight.attack(%nick) | return }
    if (%cmd == R) { $lord.fight.run(%nick) | return }
    if (%cmd == P) { $lord.fight.power(%nick) | return }
    if (%cmd == M) { $lord.menu.main(%nick) | return }
    return
  }

  if (%state == fight_win) {
    if (%cmd == M) { $lord.menu.main(%nick) | return }
    if (%cmd == F) { $lord.forest.fight(%nick) | return }
    return
  }

  if (%state == dead) {
    if (%cmd == M) { $lord.menu.main(%nick) | return }
    return
  }

  if (%state == weapons) {
    if (%cmd == M) { $lord.menu.main(%nick) | return }
    if (%cmd == B) {
      $lord.temp.set(%nick, weapon_action, buy)
      $lord.msg(%nick, Enter weapon number to buy:)
      $lord.state.set(%nick, weapons_buy)
      return
    }
    if (%cmd == S) {
      $lord.temp.set(%nick, weapon_action, sell)
      $lord.msg(%nick, Enter weapon number to sell:)
      $lord.state.set(%nick, weapons_sell)
      return
    }
    return
  }

  if (%state == weapons_buy) {
    var %choice = $int(%cmd)
    if (%choice >= 1 && %choice <= 15) {
      $lord.weapon.buy(%nick, %choice)
    }
    else {
      $lord.msg(%nick, Invalid weapon number!)
      $lord.menu.weapons(%nick)
    }
    return
  }

  if (%state == weapons_sell) {
    var %choice = $int(%cmd)
    if (%choice >= 1 && %choice <= 15) {
      $lord.weapon.sell(%nick, %choice)
    }
    else {
      $lord.msg(%nick, Invalid weapon number!)
      $lord.menu.weapons(%nick)
    }
    return
  }

  if (%state == armor) {
    if (%cmd == M) { $lord.menu.main(%nick) | return }
    if (%cmd == B) {
      $lord.temp.set(%nick, armor_action, buy)
      $lord.msg(%nick, Enter armor number to buy:)
      $lord.state.set(%nick, armor_buy)
      return
    }
    if (%cmd == S) {
      $lord.temp.set(%nick, armor_action, sell)
      $lord.msg(%nick, Enter armor number to sell:)
      $lord.state.set(%nick, armor_sell)
      return
    }
    return
  }

  if (%state == armor_buy) {
    var %choice = $int(%cmd)
    if (%choice >= 1 && %choice <= 15) {
      $lord.armor.buy(%nick, %choice)
    }
    else {
      $lord.msg(%nick, Invalid armor number!)
      $lord.menu.armor(%nick)
    }
    return
  }

  if (%state == armor_sell) {
    var %choice = $int(%cmd)
    if (%choice >= 1 && %choice <= 15) {
      $lord.armor.sell(%nick, %choice)
    }
    else {
      $lord.msg(%nick, Invalid armor number!)
      $lord.menu.armor(%nick)
    }
    return
  }

  if (%state == bank) {
    if (%cmd == M) { $lord.menu.main(%nick) | return }
    if (%cmd == D) {
      $lord.msg(%nick, Enter amount to deposit:)
      $lord.state.set(%nick, bank_deposit)
      return
    }
    if (%cmd == W) {
      $lord.msg(%nick, Enter amount to withdraw:)
      $lord.state.set(%nick, bank_withdraw)
      return
    }
    return
  }

  if (%state == bank_deposit) {
    var %amount = $int(%cmd)
    $lord.bank.deposit(%nick, %amount)
    return
  }

  if (%state == bank_withdraw) {
    var %amount = $int(%cmd)
    $lord.bank.withdraw(%nick, %amount)
    return
  }

  if (%state == healer) {
    if (%cmd == M) { $lord.menu.main(%nick) | return }
    if (%cmd == H) { $lord.healer.heal(%nick) | return }
    return
  }

  if (%state == inn) {
    if (%cmd == M) { $lord.menu.main(%nick) | return }
    if (%cmd == S) { $lord.inn.stay(%nick) | return }
    return
  }

  if (%state == tavern) {
    if (%cmd == M) { $lord.menu.main(%nick) | return }
    return
  }

  if (%state == people) {
    if (%cmd == M) { $lord.menu.main(%nick) | return }
    return
  }

  if (%state == news) {
    if (%cmd == M) { $lord.menu.main(%nick) | return }
    return
  }

  if (%state == casino) {
    if (%cmd == M) { $lord.menu.main(%nick) | return }
    return
  }
}

; ============================================================
; HELP MENU
; ============================================================
alias lord.menu.help {
  var %nick = $1

  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, LORD - Help")
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, Combat: Fight monsters in the forest to earn gold and XP.)
  $lord.msg(%nick, Level up to get stronger and face tougher foes.)
  $lord.msg(%nick, Visit the weapon and armor shops to upgrade your gear.)
  $lord.msg(%nick, Stay at the Inn to heal and be safe from attacks.)
  $lord.msg(%nick, The ultimate goal: Slay the Red Dragon!)
  $lord.msg(%nick, $+($str(-,40)))
  $lord.msg(%nick, Press (M) to return to main menu)

  $lord.state.set(%nick, help)
}

; ============================================================
; IRC EVENT HANDLERS
; ============================================================

; Private message handler
on 1:TEXT:*:?: {
  var %nick = $nick
  var %text = $strip($1-)
  var %cmd = $gettok(%text, 1, 32)

  ; Check if this is a LORD command
  if ($left(%cmd, 1) == $chr(33)) {
    var %lordcmd = $right(%cmd, -1)
    $lord.command(%nick, %lordcmd, $gettok(%text, 2-, 32))
  }
  else {
    ; Just forward to command handler
    $lord.command(%nick, %cmd, $gettok(%text, 2-, 32))
  }
}

; Channel message handler (optional - for channel play)
on 1:TEXT:*:#: {
  var %nick = $nick
  var %text = $strip($1-)
  var %cmd = $gettok(%text, 1, 32)

  ; Check if addressed to bot
  if ($left(%text, $len($me + $chr(58))) == $me + $chr(58)) {
    var %text = $right(%text, $calc(-1 * ($len($me) + 1)))
    var %cmd = $gettok(%text, 1, 32)
    $lord.command(%nick, %cmd, $gettok(%text, 2-, 32))
  }
}

; Join event - greet player
on 1:JOIN:#: {
  if ($nick == $me) return
  $lord.login($nick)
}

; Load message
on 1:LOAD: {
  echo -a LORD - Legend of the Red Dragon v $+ $lord.version loaded!
  echo -a Type /lord to start playing.
}

; ============================================================
; COMMAND ALIAS
; ============================================================
alias lord {
  if ($nick != $null) {
    $lord.login($nick)
  }
  else {
    echo -a LORD: Use this command in a channel or query to start playing.
  }
}
