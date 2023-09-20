# **Pokéclicker Scripts**
[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FEphenia%2FPokeclicker-Scripts&count_bg=%23CE4993&title_bg=%23555555&icon=pokemon.svg&icon_color=%23FFD700&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)
[![GitHub stars](https://img.shields.io/github/stars/Ephenia/Pokeclicker-Scripts?logo=apache%20spark&logoColor=gold)](https://github.com/Ephenia/Pokeclicker-Scripts/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Ephenia/Pokeclicker-Scripts?color=%23AA4A44)](https://github.com/Ephenia/Pokeclicker-Scripts/issues)
[![GitHub forks](https://img.shields.io/github/forks/Ephenia/Pokeclicker-Scripts?color=40826d)](https://github.com/Ephenia/Pokeclicker-Scripts/network)

**UPDATE: April 18th, 2023**

[PLEASE READ](https://github.com/Ephenia/Pokeclicker-Scripts/issues/298)

It's very important for the future of the project in general and how things will be like going forward.

**Troubleshooting (READ BEFORE POSTING)**

[Using the Script Fixer Upper](https://github.com/Ephenia/Pokeclicker-Scripts/issues/214)<br/>
[Issue Guidelines](https://github.com/Ephenia/Pokeclicker-Scripts/issues/119)

**Only** use scripts if you have read and understood their descriptions!

<hr>

Various scripts & enhancements for the game [Pokéclicker](https://www.pokeclicker.com/).

These are originally created and intended for the use of the browser extension known as [Tampermonkey](https://www.tampermonkey.net/). These should be compatible with any Script Manager, however. If you have a Script Manager installed, such as Tampermonkey, you can click on the One-Click install to easily install any scripts here.

If you are looking to use these scripts on the client version of Pokéclicker ([Pokéclicker Desktop](//github.com/RedSparr0w/Pokeclicker-desktop)), replace the <strong>app.asar</strong> file in the client with the [modified version from this repository](//github.com/Ephenia/Pokeclicker-Scripts/tree/master/desktop). For detailed instructions, see [here](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/desktop/README.md).

**If you are looking to have something specific created or have any inquiries, feel free to contact me directly (contact info on profile) OR [open and create an issue](https://github.com/Ephenia/Pokeclicker-Scripts/issues).**

<a href="https://discord.gg/nfbT8zJSkd" target="_blank"><img src="https://discordapp.com/api/guilds/950947559474618440/widget.png?style=banner2" alt="Discord Banner 2"/></a>

You may also [join my Discord server](https://discord.gg/nfbT8zJSkd) (can also click the banner above), be sure to grab the `PokeClicker` role from the `#pick-your-roles` channel to gain access to the Pokéclicker section.

**Please do make sure that you read the [Issues and PR Guidelines found here](//github.com/Ephenia/Pokeclicker-Scripts/issues/119) if you are wanting to open an issue, or if you wish to contribute to the project.**

**More scripts and things that I create will be added in due time, when I am interested and or am motivated enough to work. Remember, that I do this all free of charge and ask for literally nothing in return. I mainly created this project to simply share my passion for this game and show ways that it can be improved and or be more fun.**

**Vanilla scripts** are purely for automation or other QoL things.<br>
**Custom scripts** are able to do or change things that aren't within the bounds of the vanilla game or they may be considered more cheaty.

# Vanilla Scripts
1. [**Additional Visual Settings** ](#additional-visual-settings)
2. [**Auto Battle Frontier** ](#auto-battle-frontier)
3. [**Auto Battle Items** ](#auto-battle-items)
4. [**Catch Filter Fantasia** ](#catch-filter-fantasia)
5. [**Enhanced Auto Clicker** ](#enhanced-auto-clicker)
6. [**Enhanced Auto Hatchery** ](#enhanced-auto-hatchery)
7. [**Enhanced Auto Mine** ](#enhanced-auto-mine)
8. [**Simple Auto Farmer** ](#simple-auto-farmer)
9. [**Script Fixer Upper**](#script-fixer-upper)
10. [**Script Handler** (Included in desktop/app.asar)](#script-manager)
# Custom Scripts
1. [**Auto Quest Completer** ](#auto-quest-completer)
9. [**Auto Safari Zone** ](#auto-safari-zone)
2. [**Catch Speed Adjuster** ](#catch-speed-adjuster)
3. [**Challenge Mode Changer** ](#challenge-mode-changer)
4. [**Discord Code Generator** ](#discord-code-generator)
5. [**Infinite Seasonal Events** ](#infinite-seasonal-events)
6. [**Oak Items Unlimited** ](#oak-iems-unlimited)
7. [**Omega Protein Gains** ](#omega-protein-gains)
7. [**Overnight Berry Growth** ](#overnight-berry-growth)
8. [**Perky Pokerus Pandemic** ](#perky-pokerus-pandemic)
9. [**Simple Weather Changer** ](#simple-weather-changer)
10. [**Auto Safari Zone** ](//github.com/Ephenia/Pokeclicker-Scripts#custom-auto-safari-zone-auto-safarizoneuserjs-one-click-install)

```diff
- Note: Please backup your saves before using any and all scripts that would be here!!!
- Note: All scripts here would be 100% compatible with one another!!!
- Note: Feel free to open an issue if you find any bugs/issues as these aren't fully tested!!!
- Note: in case it isn't mention below, all user set settings with these scripts are saved and persist even upon game close!!!
```

<hr>

<h2 id="additional-visual-settings">Additional Visual Settings (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/additionalvisualsettings.user.js">additionalvisualsettings.user.js</a>) (<a href="//github.com/Ephenia/Pokeclicker-Scripts/raw/master/additionalvisualsettings.user.js">One-Click Install</a>)</h2>
This script adds new options to customize the game's graphics alongside a handful of other quality of life features.

### **Visual Settings**

The added visual settings are found in the Scripts settings tab. Several of these new options are shown here:<br>

![](https://i.imgur.com/sWlhKlx.png)

I made these options as a hacky way to help save on some performance, especially when you are idling and leaving the game open for longer periods of time. This ends up removing these HTML elements that are constantly getting updated, so that the DOM is less flooded. After enabling any of these options, you will have to change routes for these settings to take effect. When disabling, you will have to go to something like a Town/Dungeon then back to a route for these to start working again.

As of 1.3 there is now an option for disabling all notifications, this may be especially helpful if you are using Enhanced Auto Mine. This may also cause some popups and other things to not appear (such as trying to manually Skip layers in the Underground). You can still hear when you get shinies using this, but you won't be able to see what shiny you received. I have not fully tested this, so feel free to experiment with this setting.

### **Convenience features**

The script adds various buttons for quicker navigation and quality of life.

• Quick Settings, Inventory, and Pokédex buttons, found to the left of the Start Menu.<br/>
• Quick Dock, Gyms, and Dungeons buttons, found above the Town Map so you don't have to search for them. The Gyms and Dungeons buttons show all in the current region.<br/>
• Optimize vitamins buttons, found in the all vitamins menu. This feature uses the optimal combination of vitamins for your current region on the pokemon you select (assuming you have enough). It looks like a set of scales: ⚖

<hr>

<h2 id="auto-battle-frontier">Auto Battle Frontier (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/autobattlefrontier.user.js">autobattlefrontier.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/autobattlefrontier.user.js">One-Click Install</a>)</h2>
This script adds in a stage resetter to the Battle Frontier.<br>

![](https://github.com/Ephenia/Pokeclicker-Scripts/assets/12092270/3e2200c4-294d-4a9f-9351-b03ff0d2bd96)

You can specify a maximum stage in the input box on the right. When you complete that stage, you will earn the Battle Points and money for failing the stage, and then restart from the beginning. This allows you stay inside the Battle Frontier indefinitely farming BP while fully AFK.

The Max Attacks mode restarts the Battle Frontier when you reach a stage with battles that you cannot defeat in the specified number of attacks, allowing you to loop through the early stages for quicker farming. The button toggles through 1 attack, 2 attacks, and disabling the mode. Max Attacks is an enhancement of the previous One Click mode: the two-attack mode is slightly more efficient for farming BP.

<hr>

<h2 id="auto-battle-items">Auto Battle Items (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/autobattleitems.user.js">autobattleitems.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/autobattleitems.user.js">One-Click Install</a>)</h2>
This script adds in automation for Battle Items:<br>

![image](https://user-images.githubusercontent.com/26987203/178172097-3f733731-a15d-4ed9-b82a-f8476a39a4ff.png)

It's quite simple how it works, and this also aims to be efficient as possible.

You can click the area of the specific Battle Item's quantity to toggle its automation. By default, they are all red, but when toggled on they will turn green.

When active, Battle Items will be bought as long as you've unlocked the earliest Town Shop that sells said Battle Items, also if you currently possess an exact quantity of 0 of them as well. Battle items will also only be bought when there is no price penalty involved with them. This means you would need to be battling Pokémon to keep the base price of them down.

Battle Items will automatically be used when you have at least 1 available, as you would expect.

<hr>

<h2 id="catch-filter-fantasia">Catch Filter Fantasia (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/catchfilterfantasia.user.js">catchfilterfantasia.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/catchfilterfantasia.user.js">One-Click Install</a>)</h2>
So, this script would be adding a Filter button to the Pokeballs section:

![image](https://user-images.githubusercontent.com/26987203/170853489-de1f9304-9a91-45d1-aa0e-904f5c1709ed.png)

When you open the Filter, it will bring you to the all brand new Catch Filter:

![image](https://user-images.githubusercontent.com/26987203/170853561-4d0fe3e0-73e7-4dee-af93-cd50c69ccdde.png)

So, how this works is when you have the Catch Filter on, basically the Catch Filter would somewhat be overriding the normal ball selection that you'll find (as shown in the 1st screenshot) and what we've always been used to.

You can now better think of the normal ball selection as a "default" ball selection for things when you have the Catch Filter active.

Now, to start using the Catch Filter, it should be pretty easy and straight forward.

You can start typing a Pokémon's name (can be case-insensitive) that you'd like to filter, like so:

![image](https://user-images.githubusercontent.com/26987203/170853705-8798099c-ae29-42f1-a775-8d1864640ee0.png)

To filter a Pokémon, you can click on them:

![image](https://user-images.githubusercontent.com/26987203/170853732-86a3adbd-4a37-4557-bced-1ab5f7cb134c.png)

The green indicates that they are filtered. When a Pokémon is filtered, **that means that they are allowed to be caught**.

To the right, you will see 2 Pokéballs.

When they are blank (default), then the Pokéballs being used to capture their normal and shiny variation will be set to whatever you have as a default selection normally (as shown in the 1st screenshot).

The left Pokéball is for the normal variation of the specified Pokémon.

The right Pokéball is for the shiny variation of the specified Pokémon.

To select the Pokéball you want to capture the specified Pokémon, you must click the Pokéball. Clicking the Pokéball will cycle through all the available Pokéballs. Right-clicking the Pokéball will also reset/clear it back to default, that's if you don't cycle through all the options by clicking or don't want to.

Here's an example:

![image](https://user-images.githubusercontent.com/26987203/170853904-ed1d86de-0dc2-4b48-b60d-859bcdb5aff0.png)

Here I have normal Eevees encountered set to be caught with normal Pokéballs, however if a shiny Eevee appears, then it will be attempted to be caught with an Ultra Ball.

Remember, this will only work if the Catch Filter is on AND it is highlighted green. Simple and straight forward, yes? Good.

Now, there are type catching filters:

![image](https://user-images.githubusercontent.com/26987203/170853970-a1c50d8c-3f47-4cc4-ae9b-218d6578cf2a.png)

If you turn these on, then Pokémon that match the specified type(s) will be caught. Yes, both single and dual typing Pokémon are accounted for here. So, for example, if you have only the Flying type filter on, then a Pidgey will still get caught because one of its types just so happens to be Flying type.

Now, an important thing to note. This is **VERY** important.

**When you have the type filters on, these type filters will ignore Pokémon that you have filtered or not regardless. That's if the typing(s) are matching said Pokémon.**

**On top of that, if you have any Pokéballs specified on Pokémon in your filters, then these Pokémon will be attempted to be caught using the balls that you have set on them.**

**This means that you should be mindful of what Pokéballs that you're setting specifically on specific Pokémon.**

Another thing to know too, is if you set a Pokéball that you have 0 quantity of to a Pokémon to be caught with, then the Pokéball that they will be caught with will resort to what you have set to as default settings (as shown in the 1st screenshot).

I think this would cover mostly everything, but if there are any other questions too, then I can answer them.

I think the rest of the buttons there are self-explanatory, and you guys can have fun testing that stuff out and playing around with it.

<hr>

<h2 id="enhanced-auto-clicker">Enhanced Auto Clicker (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/enhancedautoclicker.user.js">enhancedautoclicker.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/enhancedautoclicker.user.js">One-Click Install</a>)</h2>
This script is based on one originally created by <b>Ivan Lay</b>, which [can be found here](//github.com/ivanlay/pokeclicker-automator). 

<img width="608" src="https://user-images.githubusercontent.com/12092270/229034199-21bb914c-d6c3-4d97-bc4a-4521052a2740.png">

The main Auto Clicker button can be found under your currencies. Clicking it toggles the Auto Clicker on/off without the need of a refresh. This setting will also save and persist through page refresh/close.

You can also adjust the number of clicks made per second. Higher click rates still max out at 20 enemies defeated per second, as the Auto Clicker makes multiple clicks simultaneously to reduce lag. Please note that while older script versions allowed you to set the Auto Clicker to up to 1000 clicks per second, this setting and its resulting click measurements <strong>were not</strong> accurate. The game engine cannot support speeds that high and the current version should provide similar performance.

The Auto Clicker button displays various statistics while running:<br>

<strong>• Clicker Efficiency</strong> - How close the Auto Clicker is to its maximum speed. The closer to 100%, the better.<br>
<strong>• Clicks/s</strong> or <strong>DPS</strong> - The number of clicks per second or click damage per second the Auto Clicker is producing.<br>
<strong>• Req. Clicks</strong> or <strong>Req. Click Damage</strong> - The number of clicks or click attack necessary to one-shot enemies in the current route, gym, or dungeon. The color changes depending on whether you meet the requirement. This ignores dungeon boss health and health bonuses from dungeon chests.<br>
<strong>• Enemy/s</strong> - How many enemies you are defeating per second.<br>

You can switch between clicks and damage display modes in the settings menu. Statistics are averaged over the last ten seconds, reset upon changing locations.

### **Auto Gym**

The Auto Gym feature is found below the Auto Click button. Some notes about how this works:

• Auto Gym will only work while the Auto Clicker is active.<br>
• Auto Gym when activated will automatically fight the Gym in the town you are in.<br>
• There is a dropdown to the right of the Auto Gym button which is meant for Elite Fours and other towns with multiple gyms. The number that you set this to determines which gym or Elite Four member you will fight. For example, if you set it to #5 while at a Pokemon League, you will fight the Champion. However, if you set Auto Gym to fight a gym you have not yet unlocked, you will instead end up fighting the last unlocked gym in that town (if one exists) until you restart Auto Gym or select a different gym to fight. 

### **Auto Dungeon**

The Auto Dungeon feature is found below the Auto Click button. Some notes about how this works:

• Auto Dungeon will only work while the Auto Clicker is active.<br>
• Auto Dungeon when activated will automatically explore the current dungeon, or begin exploring a dungeon whose entrance you are at. 
• There are two dropdowns to the right of the Auto Dungeon button. The first chooses between two modes:<br><br>
<strong>"F" for Farm mode</strong> - this runs through the dungeon in its entirety and fights all the enemies, saving the boss for last. It now waits to open chests until right before the boss fight for faster clearing.<br/>
<strong>"B" for Boss mode</strong> - this tries to clear the dungeon as fast as possible to fight the boss. If you have unlocked Flash for a dungeon, this mode will now use it to find the boss while visiting as few columns as possible. It does not include pathfinding that uses information, like the location of the boss, not visible to the player.
• The second dropdown determines which chests, if any, Auto Dungeon will open. If you choose a tier of chest, Auto Dungeon will open chests of that tier or greater right before fighting the boss. In Farm mode it will open every chest of those tiers; in Boss mode it will open chests that were already visited or are visible with Flash. When "None" is selected, Auto Dungeon will predictably not open chests.

### **Graphics settings**

The Auto Clicker now includes graphics settings for Auto Gym and Auto Dungeon to save on performance, similar to those in the Additional Visual Settings script. These settings are located along with the statistics display mode setting in the Visual Settings tab of the settings menu. These disable most gym graphics while Auto Gym is running and most dungeon graphics while Auto Dungeon is running, respectively.

```diff
- Note: the Auto Clicker runs every 0.05 seconds.
- Note: statistics are checked and updated every 1 second while the Auto Clicker is active.
```

<hr>

<h2 id="enhanced-auto-hatchery">Enhanced Auto Hatchery (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/enhancedautohatchery.user.js">enhancedautohatchery.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/enhancedautohatchery.user.js">One-Click Install</a>)</h2>
This script is based on one created by <b>Ivan Lay & Drak</b> which [can be found over here](//greasyfork.org/en/scripts/432768-auto-hatchery-edit-pokeclicker-com).

The Auto Hatchery automatically hatches eggs and places new eggs/fossils in the hatchery. 

![](https://i.imgur.com/VpL6TTr.png)

This button on the main-screen hatchery display toggles the Auto Hatchery.

![](https://github.com/Ephenia/Pokeclicker-Scripts/assets/12092270/acc89fd5-c559-4e21-a86b-ff2661f7bf3d)

These buttons inside the hatchery control the various Auto Hatchery modes, which activate in the following order.

• PKRS Mode tries to spread Pokerus. If you have an uninfected pokemon and a contagious pokemon that share a type, it will put them in the hatchery together.<br/>
• Auto Egg hatches eggs (the items), if you have any.<br/>
• Auto Fossil revives fossils, if you have any. When in Shiny Fossils mode, it will ignore fossils for which you already have the corresponding shiny.<br/>

If none of the above modes are enabled or have targets, the Auto Hatchery will select the first pokemon (in hatchery sort order) that matches your hatchery filters. If none match, it will select the first possible pokemon.

<hr>

<h2 id="enhanced-auto-mine">Enhanced Auto Mine (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/enhancedautomine.user.js">enhancedautomine.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/enhancedautomine.user.js">One-Click Install</a>)</h2>
This script was originally created by <b>Ivan Lay</b> and [can be found over here](//github.com/ivanlay/pokeclicker-automator).

This I had worked quite a bit on, and I'm quite happy with what it's capable of doing. This is far bigger and does a lot more than Ivan Lay's script. However, since I was using it and was inspired, I decided to make an auto miner that's as efficient as possible instead.

What this script adds is a new top row below the mining layer, as shown:<br>

![](https://user-images.githubusercontent.com/12092270/184208280-9ef59caf-5b0f-402a-be12-049cdad8beb3.png)

There's a lot to go over and explained with this Auto Miner, but I'll try my best to explain it all:

**• Auto Mine** - This will turn the Auto Miner On/Off. The Auto Miner uses bombs to automatically mine.<br>
**• Auto Small Restore** - This will automatically buy and use Small Restores when low on energy (only while Auto Mine is running). It will only buy them when there are no Restores in your inventory and when they cost 30,000 (base price). Knowing that, this is best used anywhere you can one-shot Pokémon, so the price penalty in the Shop is constantly decreasing.<br>
**• 1st Input Field** - The money amount below which the script will stop auto-buying Small Restores, so it won't drain all your money.<br>
**• Dropdown Menu** - This menu lets you choose a type of item for the Treasure Hunter mode. While you have skips available, the Treasure Hunter will survey layers and skip them if they contain too few of your desired item type. The Treasure Hunter's default setting skips layers with too few total items.<br>
**• 2nd Input Field** - The minimum number of your desired item type (or total items) for the Treasure Hunter. If the layer has fewer of the set item type the Treasure Hunter will skip it. Set this field to 0 to not skip any layers.<br>

As of 1.1 this also includes 2 more additional features into the Treasures tab of the Underground as shown below:<br>

![](https://i.imgur.com/H0btTjL.png)

<strong>• Auto Sell Treasure</strong> - This will automatically sell any and all treasures that would give you Diamonds upon successfully mining an Underground layer.<br>
<strong>• Auto Sell Plate</strong> - This will automatically sell any and all plates that would give you gems upon successfully mining an Underground layer.

```diff
- Note: the Auto Miner runs once every 1 second.
```

<hr>
  
<h2 id="simple-auto-farmer">Simple Auto Farmer (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/main/simpleautofarmer.user.js">simpleautofarmer.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/simpleautofarmer.user.js">One-Click Install</a>)</h2>
This script is a simple Auto Farmer which adds 4 new buttons below the Plant and Harvest all buttons as shown:<br>

![](https://i.imgur.com/ei7lR95.png)

• Auto Farm will plant the berry that you have selected.<br/>
• Auto Harvest will harvest all ripe berries.<br/>
• Auto Replant will wait for ripe berries to be close to withering before harvesting, then replant the same kind of berry in that plot. This can be especially useful for mutating berries.<br/>
• Auto Mulch will wait for mulch to be close to running out, then use the same kind of mulch on that plot.

The Auto Farmer runs even while the farm window is closed. It also now saves your berry selection when the game restarts, to avoid farming interruptions.

```diff
- Note: the Auto Farmer runs once every 1 second.
- Note: Auto Replant cannot be used alongside Auto Plant or Auto Harvest.
```

<hr>

<h2 id="script-fixer-upper">Script Fixer Upper (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/scriptfixerupper.user.js">scriptfixerupper.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/scriptfixerupper.user.js">One-Click Install</a>)</h2>

This script resets the settings of all your other installed scripts. It is intended **only** for troubleshooting and fixing buggy behavior, as described [here](//github.com/Ephenia/Pokeclicker-Scripts/issues/214).

When you open the game with this script installed, it will bring up a confirmation box asking if you are sure you want to proceed. Confirming will remove **all** non-game data from localStorage, including any data from other people's scripts. While this should not affect your save data, you should make backups first just to be safe.

This script should be your first step if you are experiencing bugs, especially after a script update. Otherwise you should **never** have this script enabled. Asking about a pop-up that resets your scripts is a clear sign of using scripts without first checking what they do! Don't do this!

<hr>

<h2 id="script-manager">Script manager (Exclusive to the desktop client) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/desktop/">app.asar</a>)</h2>

This script provides desktop client support for userscripts, allowing you to run or disable userscripts like a userscript manager browser extension does. All the scripts in this repository are supported and are by default automatically downloaded and updated. It can also run other userscripts that you install. Options are located in the <strong>Scripts</strong> tab in the game's settings menu. 

This script is only compatible with the desktop client. For detailed instructions on installing and using the script manager, see [here](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/desktop/).

<img width="840" alt="Script manager options" src="https://github.com/Ephenia/Pokeclicker-Scripts/assets/12092270/dc19411e-c565-48cb-8be6-6ac9b8abe17b">

<hr>

<h2 id="auto-quest-completer">[Custom] Auto Quest Completer (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/autoquestcompleter.user.js">autoquestcompleter.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/autoquestcompleter.user.js">One-Click Install</a>)</h2>
This script automatically completes and starts quests and can be toggled with this button:<br>

![image](https://i.imgur.com/3AYaNes.png)

The script now has settings in the Settings menu that let you customize its behavior.

• <strong>Max quest slots</strong> — Overrides the number of quests you can have active simultaneously, anywhere from just 1 to all 10 quests.</br>
• <strong>Quest reset timer</strong> — Choose a period of time (in minutes) to refresh your quests after if any are incomplete. Turn the timer on and off with the button at the bottom of the quest display.
• <strong>Preferred quest types</strong> — Choose which quest types to prioritize. The script will automatically refresh your quests if all current preferred quests have been completed, though it will claim any unpreferred quests that happen to complete. If you are using fewer than 10 quest slots, prioritized quests will be selected first.

<hr>

<h2 id="auto-safari-zone">[Custom] Auto Safari Zone (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/autosafarizone.user.js">autosafarizone.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/autosafarizone.user.js">One-Click Install</a>)</h2>

This script automatically explores the Safari Zone and Friend Safari, catching Pokémon and collecting items for you. You can activate the script while in the window for either Safari.

The script also has the following options:
<strong>• Auto Pick Items</strong> - Pick up items when only one ball is left (enabled by default)
<strong>• Auto Throw Bait</strong> - Throws berries when seeking uncaught or contagious Pokémon, or regular bait if you need a bait achievement. 
<strong>• Auto Seek New</strong> - Prioritizes catching uncaught Pokémon.
<strong>• Auto Seek PKRS</strong> - Prioritizes catching contagious Pokémon (below 50 EVs).
<strong>• Auto Fast Anim</strong> - Increases the speed of many animations. Stacks with the Safari Level speed bonuses.

The auto bait setting will never use your last berry. The script will always use optimal berries to catch shiny Pokémon, whether or not auto bait is enabled.

<hr>

<h2 id="catch-speed-adjuster">[Custom] Catch Speed Adjuster (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/catchspeedadjuster.user.js">catchspeedadjuster.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/catchspeedadjuster.user.js">One-Click Install</a>)</h2>
This script adds in a new option found below your Pokéballs:<br>

![image](https://i.imgur.com/C6aVzND.png)

This currently will make all of your Pokéballs catch Pokémon at 0 delay (basically catch Pokémon as fast as you can defeat them).

<hr>

<h2 id="challenge-mode-changer">[Custom] Challenge Mode Changer (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/challengemodechanger.user.js">challengemodechanger.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/challengemodechanger.user.js">One-Click Install</a>)</h2>
This script changes how Challenges work:<br>

![image](https://i.imgur.com/zsPsiSg.png)

This makes it so that you can click the actual buttons and makes them able to enable/disable their respective challenges.

Most of the Challenges should update and take immediate effect. However, there may be wonky and unexpected side effects with certain Challenges, as this would still need testing and this is new to us all.

Also, yes, changing these will give you the respective Challenge ribbons on your player card or remove them. It's no different from activating Challenges on a completely fresh save.

<hr>
  
<h2 id="discord-code-generator">[Custom] Discord Code Generator (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/discordcodegenerator.user.js">discordcodegenerator.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/discordcodegenerator.user.js">One-Click Install</a>)</h2>
This script will let you generate infinite amounts of Discord codes for all of the exclusive Pokémon locked behind Pokéclicker's Discord bot:<br>

![image](https://i.imgur.com/5Agit4Q.png)

You can claim as many Pokémon as you want just by clicking buttons, and they are also generated no differently than normal.
  
This also would **NOT** require you to link up a Discord account (for those without an account or prefer to not use Discord).

This script also works while offline.

<hr>
  
<h2 id="infinite-seasonal-events">[Custom] Infinite Seasonal Events (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/infiniteseasonalevents.user.js">infiniteseasonalevents.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/infiniteseasonalevents.user.js">One-Click Install</a>)</h2>
This script adds in a new settings option to the top of the Start Menu:<br>

![image](https://user-images.githubusercontent.com/26987203/139570136-78e45d86-97ce-4fec-aa31-3459fbf19e04.png)

This will give you access to all of the seasonal events in the game:<br>

![image](https://user-images.githubusercontent.com/26987203/139570151-70f47769-40b1-4ec4-aa15-9eac50f33b39.png)

The events also show all the Pokémon that are brought along with them.

You can click on them to start any event that you desire. You are also able to activate more than 1 event simultaneously. They can be toggled on or off at any time. These events will run basically without end, at least not ending at any time you would really have to worry about.

There may be some other cool or neat custom events added in with this as well.

<hr>

<h2 id="oak-items-unlimited">[Custom] Oak Items Unlimited (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/oakitemsunlimited.user.js">oakitemsunlimited.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/oakitemsunlimited.user.js">One-Click Install</a>)</h2>
This script removes the limit for the amount of Oak Items that you're able to equip:<br>

![image](https://i.imgur.com/0Peh94W.png)

All items are able to work together just fine, including leveling simultaneously with each other. Also, this is fully compaitable and functional with Loadouts.

This also removes any requirements needed to unlock any Oak Item slots, meaning you get the max number of slots given to you on a fresh save.

<hr>

<h2 id="omega-protein-gains">[Custom] Omega Protein Gains (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/omegaproteingains.user.js">omegaproteingains.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/omegaproteingains.user.js">One-Click Install</a>)</h2>
This script removes the limit for the amount of Proteins that you're able to use on Pokémon:<br>

![image](https://i.imgur.com/2kXCzUA.png)

I haven't tested the limits of how many Proteins you can give, but it should practically be infinite.

<hr>

<h2 id="overnight-berry-growth">[Custom] Overnight Berry Growth (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/overnightberrygrowth.user.js">overnightberrygrowth.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/overnightberrygrowth.user.js">One-Click Install</a>)</h2>
This script allows berries to grow while the game is closed, simulating their growth when the game loads. No mutations occur, aside from Kebia replanting, and Farm Hands are not active. Withered berries can replant as normal, but the script will ignore replanted berries to avoid lag. You can choose between three modes in the settings: 

- Until ripe: Berries will only grow until they are ripe and no time will pass for already-ripe berries. The default mode.
- Until withered: Berries will continue aging once they are ripe and may wither.
- Harvest before withering: Berries will continue aging once they are ripe, but the script harvests berries right before they would wither (during offline growth only).

<hr>

<h2 id="perky-pokerus-pandemic">[Custom] Perky Pokerus Pandemic (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/perkypokeruspandemic.user.js">perkypokeruspandemic.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/perkypokeruspandemic.user.js">One-Click Install</a>)</h2>
This script makes Pokérus spread inside the Hatchery without needing your Starter Pokémon inside for this to be accomplished.

This script will run and work automatically without needing to do anything else.

<hr>

<h2 id="simple-weather-changer">[Custom] Simple Weather Changer (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/simpleweatherchanger.user.js">simpleweatherchanger.user.js</a>) (<a href="https://github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/simpleweatherchanger.user.js">One-Click Install</a>)</h2>
This script lets you freely edit the weather of the region you are currently in with this button:<br>

![image](https://i.imgur.com/2cBIfyH.png)

In addition it will also prevent the weather from changing and will remember you choice when reloading the game

<br>

<hr>

## **[Custom] Auto Safari** ([autosafarizone.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/autosafarizone.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/autosafarizone.user.js))
This script automatically explores the Safari Zone and Friend Safari, catching Pokémon and collecting items. You can activate the script while in the menu for either.

The script also has the following options:
<strong>• Auto Pick Items</strong> - Pick up items when only one ball is left (enabled by default)
<strong>• Auto Throw Bait</strong> - Throws berries when seeking uncaught or contagious Pokémon, or regular bait if you need a bait achievement. 
<strong>• Auto Seek New</strong> - Prioritizes catching uncaught Pokémon.
<strong>• Auto Seek PKRS</strong> - Prioritizes catching contagious Pokémon (below 50 EVs).
<strong>• Auto Fast Anim</strong> - Increases the speed of many animations. Stacks with the Safari Level speed bonuses.

The auto bait setting will never use your last berry. The script will always use optimal berries to catch shiny Pokémon, whether or not auto bait is enabled.

<br>

<hr>

<b>More to be added soon.</b>
