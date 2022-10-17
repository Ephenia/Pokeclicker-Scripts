# **Pokéclicker Scripts**

[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FEphenia%2FPokeclicker-Scripts&count_bg=%23CE4993&title_bg=%23555555&icon=pokemon.svg&icon_color=%23FFD700&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)
[![GitHub stars](https://img.shields.io/github/stars/Ephenia/Pokeclicker-Scripts?logo=apache%20spark&logoColor=gold)](https://github.com/Ephenia/Pokeclicker-Scripts/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/Ephenia/Pokeclicker-Scripts?color=%23AA4A44)](https://github.com/Ephenia/Pokeclicker-Scripts/issues)
[![GitHub forks](https://img.shields.io/github/forks/Ephenia/Pokeclicker-Scripts?color=40826d)](https://github.com/Ephenia/Pokeclicker-Scripts/network)

Various scripts & enhancements for the game [Pokéclicker](https://www.pokeclicker.com/).

These are originally created and intended for the use of the browser extension known as [Tampermonkey](https://www.tampermonkey.net/). These should be compatible with any Script Manager, however. If you have a Script Manager installed, such as Tampermonkey, you can click on the One-Click install to easily install any scripts here.

If you are looking to use these scripts on the client version of Pokéclicker ([Pokéclicker Desktop](//github.com/RedSparr0w/Pokeclicker-desktop)), move the <strong>app.asar</strong> from the [desktop folder in the repository](//github.com/Ephenia/Pokeclicker-Scripts/tree/master/desktop) to <strong>C:\Users\\{your user}\AppData\Local\Programs\pokeclicker-desktop\resources</strong> and replace the existing one.

**If you are looking to have something specific created or have any inquiries, feel free to contact me directly (contact info on profile) OR [open and create an issue](https://github.com/Ephenia/Pokeclicker-Scripts/issues).**

<a href="https://discord.gg/nfbT8zJSkd" target="_blank"><img src="https://discordapp.com/api/guilds/950947559474618440/widget.png?style=banner2" alt="Discord Banner 2"/></a>

You may also [join my Discord server](https://discord.gg/nfbT8zJSkd) (can also click the banner above), be sure to grab the `PokeClicker` role from the `#pick-your-roles` channel to gain access to the Pokéclicker section.

**Please do make sure that you read the [Issues and PR Guidelines found here](//github.com/Ephenia/Pokeclicker-Scripts/issues/119) if you are wanting to open an issue, or if you wish to contribute to the project.**

**More scripts and things that I create will be added in due time, when I am interested and or am motivated enough to work. Remember, that I do this all free of charge and ask for literally nothing in return. I mainly created this project to simply share my passion for this game and show ways that it can be improved and or be more fun.**

**Vanilla scripts** are purely for automation or other QoL things.<br>
**Custom scripts** are able to do or change things that aren't within the bounds of the vanilla game or they may be considered more cheaty.

## Vanilla Scripts

1. [**Additional Visual Settings**](//github.com/Ephenia/Pokeclicker-Scripts#additional-visual-settings-additionalvisualsettingsuserjs-one-click-install)
2. [**Auto Battle Frontier**](//github.com/Ephenia/Pokeclicker-Scripts#auto-battle-frontier-autobattlefrontieruserjs-one-click-install)
3. [**Auto Battle Items**](//github.com/Ephenia/Pokeclicker-Scripts#auto-battle-items-autobattleitemsuserjs-one-click-install)
4. [**Catch Filter Fantasia**](//github.com/Ephenia/Pokeclicker-Scripts#catch-filter-fantasia-catchfilterfantasiauserjs-one-click-install)
5. [**Enhanced Auto Clicker**](//github.com/Ephenia/Pokeclicker-Scripts#enhanced-auto-clicker-enhancedautoclickeruserjs-one-click-install)
6. [**Enhanced Auto Hatchery**](//github.com/Ephenia/Pokeclicker-Scripts#enhanced-auto-hatchery-enhancedautohatcheryuserjs-one-click-install)
7. [**Enhanced Auto Mine**](//github.com/Ephenia/Pokeclicker-Scripts#enhanced-auto-mine-enhancedautomineuserjs-one-click-install)
8. [**Simple Auto Farmer**](//github.com/Ephenia/Pokeclicker-Scripts#simple-auto-farmer-simpleautofarmeruserjs-one-click-install)
9. [**Script Handler** (Included in desktop/app.asar)](//github.com/Ephenia/Pokeclicker-Scripts#script-manager-exclusive-to-the-desktop-client-appasar)

## Custom Scripts

1. [**Auto Quest Completer**](//github.com/Ephenia/Pokeclicker-Scripts#custom-auto-quest-completer-autoquestcompleteruserjs-one-click-install)
2. [**Catch Speed Adjuster**](//github.com/Ephenia/Pokeclicker-Scripts#custom-catch-speed-adjuster-catchspeedadjusteruserjs-one-click-install)s
3. [**Challenge Mode Changer**](//github.com/Ephenia/Pokeclicker-Scripts#custom-challenge-mode-changer-challengemodechangeruserjs-one-click-install)
4. [**Discord Code Generator**](//github.com/Ephenia/Pokeclicker-Scripts#custom-discord-code-generator-discordcodegeneratoruserjs-one-click-install)
5. [**Infinite Seasonal Events**](//github.com/Ephenia/Pokeclicker-Scripts#custom-infinite-seasonal-events-infiniteseasonaleventsuserjs-one-click-install)
6. [**Oak Items Unlimited**](//github.com/Ephenia/Pokeclicker-Scripts#custom-oak-iems-unlimited-oakitemsunlimiteduserjs-one-click-install)
7. [**Omega Protein Gains**](//github.com/Ephenia/Pokeclicker-Scripts#custom-omega-protein-gains-omegaproteingainsuserjs-one-click-install)
8. [**Perky Pokerus Pandemic**](//github.com/Ephenia/Pokeclicker-Scripts#custom-perky-pokerus-pandemic-perkypokeruspandemicuserjs-one-click-install)
9. [**Simple Weather Changer**](//github.com/Ephenia/Pokeclicker-Scripts#custom-simple-weather-changer-simpleweatherchangeruserjs-one-click-install)

```diff
- Note: Please backup your saves before using any and all scripts that would be here!!!
- Note: All scripts here would be 100% compatible with one another!!!
- Note: Feel free to open an issue if you find any bugs/issues as these aren't fully tested!!!
- Note: in case it isn't mention below, all user set settings with these scripts are saved and persist even upon game close!!!
```

<hr>

### **Additional Visual Settings** ([additionalvisualsettings.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/additionalvisualsettings.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/additionalvisualsettings.user.js))

This script adds new options in the Visual settings tab. These new options are shown here:<br>

![image](https://i.imgur.com/sWlhKlx.png)

I made these options as a hacky way to help save on some performance, especially when you are idling and leaving the game open for longer periods of time. This ends up removing these HTML elements that are constantly getting updated, so that the DOM is less flooded. After enabling any of these options, you will have to change routes for these settings to take effect. When disabling, you will have to go to something like a Town/Dungeon then back to a route for these to start working again.

This script also includes support for a quick Settings button, as shown below:<br>

![image](https://i.imgur.com/GHt61hr.png)

The gear icon to the left of the Start Menu that you see here.

![image](https://i.imgur.com/8H1ZeBV.png)

As of 1.3 there is now an option for disabling all notifications, this may be especially helpful if you are using Enhanced Auto Mine. This may also cause some popups and other things to not appear (such as trying to manually Skip layers in the Underground). You can still hear when you get shinies using this, but you won't be able to see what shiny you received. I have not fully tested this, so feel free to experiment with this setting.

Additionally it now features a button above the map to quickly open the dock so you don't have to search for it, especially useful is alola.

<hr>

### **Auto Battle Frontier** ([autobattlefrontier.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/autobattlefrontier.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/autobattlefrontier.user.js))

This script adds in a stage resetter to the Battle Frontier:<br>

![image](https://i.imgur.com/Tl6ljbp.png)

When you reach and complete the specified stage, you will earn the Battle Points and Money you would have earned if you had failed the stage, then you are reset to the beginning.

This will effectively allow you to infinitely farm and stay inside the Battle Frontier while being fully AFK.

<hr>

### **Auto Battle Items** ([autobattleitems.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/autobattleitems.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/autobattleitems.user.js))

This script adds in automation for Battle Items:<br>

![image](https://user-images.githubusercontent.com/26987203/178172097-3f733731-a15d-4ed9-b82a-f8476a39a4ff.png)

It's quite simple how it works, and this also aims to be efficient as possible.

You can click the area of the specific Battle Item's quantity to toggle its automation. By default, they are all red, but when toggled on they will turn green.

When active, Battle Items will be bought as long as you've unlocked the earliest Town Shop that sells said Battle Items, also if you currently possess an exact quantity of 0 of them as well. Battle items will also only be bought when there is no price penalty involved with them. This means you would need to be battling Pokémon to keep the base price of them down.

Battle Items will automatically be used when you have at least 1 available, as you would expect.

<hr>

### **Catch Filter Fantasia** ([catchfilterfantasia.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/catchfilterfantasia.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/catchfilterfantasia.user.js))

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

### **Enhanced Auto Clicker** ([enhancedautoclicker.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/enhancedautoclicker.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/enhancedautoclicker.user.js))

This script was originally created by <b>Ivan Lay</b> and [can be found over here](//github.com/ivanlay/pokeclicker-automator).

This script currently features quite a lot more over the old one. This enhanced version mainly adds in a button to toggle the Auto Clicker on/off without the need of a refresh. This setting will also save and persist through refresh/browser close.

The button can be found under your currencies, as shown here:<br>

![image](https://user-images.githubusercontent.com/26987203/139553777-6c8fbeb9-6ebf-4884-9b60-04bbc218d148.png)

I have also added 4 new values to the auto clicker component:<br>

<strong>• Auto Click DPS</strong> - This will tell you the total amount of click damage that you're dealing per second while the Auto Clicker is active.<br>
<strong>• Req. DPS</strong> - This will tell you the total required amount of click damage (Auto Click DPS) needed for you to 1 shot the route and fully cap out the red (health) bar.<br>
<strong>• Enemy/s</strong> - How many enemies you are defeating per second through the use of the Auto Clicker and it being currently active (20 is cap).

<strong>Auto Click DPS will always show in Gold. Required DPS will change color depending on if you meet it or not.</strong><br>

> <strong>As of 1.4 the Auto Gym feature has been released and is found below the Auto Click button. Some notes about how this works:</strong><br><br>
• Auto Gym will only work while the Auto Clicker is active.<br>
• Auto Gym when activated will automatically fight the Gym in the town you are in or the one you visited last (if it has a Gym).<br>
• There is a dropdown to the right of the Auto Gym button which is meant for Elite Fours. The number that you set this to will be which Elite Four member you will fight (or at least try to). So for example, if you set this to #5 then you will be fighting the Champion or at least that's what Auto Gym's priority will be. This means Auto Gym will also automatically fight through all the Elite Four preceding the one you set it to if they were undefeated previously.

<br>

> <strong>As of 1.5 the Auto Dungeon feature has been released which can be seen below the Auto Click button. Some notes about how this works:</strong><br><br>
• Auto Dungeon will only work while the Auto Clicker is active.<br>
• Auto Dungeon when activated will automatically fight the current dungeon, the last dungeon you've visited or the dungeon in the one in the last town you were in (if it has one).<br>
• There is a dropdown to the right of the Auto Dungeon button which contains 2 modes:<br><br>
<strong>"F" for Farm Mode</strong> - this will run through the dungeon in its entirety and fight all the enemies as well as loot all the chests. The boss will be saved for last.<br>
<strong>"B" for Boss Rusher</strong> - this will try to clear the dungeon as fast as possible and rush the Boss. The Boss will always be the top priority, chests will not be opened as they increase enemy hp, making clearing slower. Note that this currently does not include pathfinding, so it will only fight the Boss if it is adjecent to a visited tile.

<br>

```diff
- Note: the Auto Clicker runs every 0.05 seconds.
- Note: statistics are checked and updated every 1 second while the Auto Clicker is active.
```

I thought that these were some neat and useful additions to add. I hope that you guys would like them as well. I spent a lot of time on these especially with creating Auto Dungeon.

<hr>

### **Enhanced Auto Hatchery** ([enhancedautohatchery.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/enhancedautohatchery.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/enhancedautohatchery.user.js))

This script was originally created by <b>Ivan Lay & Drak</b> and [can be found over here](//greasyfork.org/en/scripts/432768-auto-hatchery-edit-pokeclicker-com).

I wanted to take and re-make this script, not only to make it be another enhanced version of a script to add to the list, but also to fix and improve upon the original. Also, I found that the auto placement of store bought eggs & fossils wasn't working for me in the other script, so I re-wrote the entire code to hopefully make it a lot better as well as future-proof.

Anyway, here's what this script adds:<br>

![image](https://i.imgur.com/VpL6TTr.png)

A button that will toggle On/Off the auto hatching of eggs.

There is also this as well:<br>

![image](https://i.imgur.com/J0QvYc2.png)

When you open up the Daycare, you will see another button for automatically placing store bought eggs as well as fossils that you have dug up. This will randomly place what you have inside the Hatchery, and it will also prioritize placing them if you have any of the two available.

```diff
- Note: the Auto Hatchery runs every 0.05 seconds.
```

<hr>

### **Enhanced Auto Mine** ([enhancedautomine.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/enhancedautomine.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/enhancedautomine.user.js))

This script was originally created by <b>Ivan Lay</b> and [can be found over here](//github.com/ivanlay/pokeclicker-automator).

This I had worked quite a bit on, and I'm quite happy with what it's capable of doing. This is far bigger and does a lot more than Ivan Lay's script. However, since I was using it and was inspired, I decided to make an auto miner that's as efficient as possible instead.

What this script adds is a new top row below the mining layer, as shown:<br>

![image](https://i.imgur.com/0DzjmOM.png)

There's a lot to go over and explained with this Auto Miner, but I'll try my best to explain it all:

**• Auto Mine** - This will turn the Auto Miner On/Off. The Auto Miner uses bombs to automatically mine.<br>
**• Auto Small Restore** - This will automatically use Small Restores as well as buy them while it's active (only when Auto Mine is running). It will also only ever buy them when you have 0 Small Restores and when they cost 30,000 (base price). Knowing that, this is best used anywhere you can one-shot Pokémon (so the price penalty in the Shop is constantly decreasing).<br>
**• 1st Input Field** - Here you can enter a money value at which Small Restores should stop Auto Buying. This will help you not drain your money.<br>
**• 2nd Input Field** - This is basically an Auto Skipper. You can enter the minimum value of items you would like to look for in new layers. If there are fewer items in a layer than your desired input, it will be skipped (if you have any skips available).

As of 1.1 this also includes 2 more additional features into the Treasures tab of the Underground as shown below:<br>

![image](https://i.imgur.com/H0btTjL.png)

<strong>• Auto Sell Treasure</strong> - This will automatically sell any and all treasures that would give you Diamonds upon successfully mining an Underground layer.<br>
<strong>• Auto Sell Plate</strong> - This will automatically sell any and all plates that would give you gems upon successfully mining an Underground layer.

```diff
- Note: the Auto Miner runs once every 1 second.
```

<hr>

### **Simple Auto Farmer** ([simpleautofarmer.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/main/simpleautofarmer.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/simpleautofarmer.user.js))

This script is a simple Auto Farmer which adds 2 new buttons below the Plant and Harvest all buttons as shown:<br>

![image](https://i.imgur.com/9Y4ad5B.png)

Auto Farm will plant the berry that you have selected and harvest all berries when they are ready. Auto mulch works in conjunction with Auto Farm, so Auto Farm must be on for Auto Mulch to work. With Auto Mulch it will use the mulch that you have selected on the entire field. This will also work with the Farm window closed, and these settings will persist upon refresh/browser close.

```diff
- Note: the Auto Farmer runs once every 1 second.
```

I plan to update this Auto Farmer with some additional features later on.

<hr>

### **Script manager (Exclusive to the desktop client)** ([app.asar](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/desktop/app.asar))

This script manages all other loaded scripts that succsessfully subscribe to it. All the scripts in this repository are automatically managed.
This is mostly intended to be used in the desktop client as tampermonkey already allows to toggle scripts in a manner similar to this.
Options are located in the <strong>Scripts</strong> tab in the settings

![image](https://i.imgur.com/R5zT9RH.png)

If you wish to manage your custom script through this one add something along the lines of:

![image](https://i.imgur.com/3PvNQCb.png)

Your load function should look something like this:

![image](https://i.imgur.com/lvdzrBH.png)

<hr>

### **[Custom] Auto Quest Completer** ([autoquestcompleter.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/autoquestcompleter.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/autoquestcompleter.user.js))

This script automatically completes and starts quests and can be toggled with this button:<br>

![image](https://i.imgur.com/3AYaNes.png)

It also is able to ignore the limit of quests you can enable at once, letting you complete all 10 at the same time.

<hr>

### **[Custom] Catch Speed Adjuster** ([catchspeedadjuster.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/catchspeedadjuster.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/catchspeedadjuster.user.js))

This script adds in a new option found below your Pokéballs:<br>

![image](https://i.imgur.com/C6aVzND.png)

This currently will make all of your Pokéballs catch Pokémon at 0 delay (basically catch Pokémon as fast as you can defeat them).

<hr>

### **[Custom] Challenge Mode Changer** ([challengemodechanger.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/challengemodechanger.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/challengemodechanger.user.js))

This script changes how Challenges work:<br>

![image](https://i.imgur.com/zsPsiSg.png)

This makes it so that you can click the actual buttons and makes them able to enable/disable their respective challenges.

Most of the Challenges should update and take immediate effect. However, there may be wonky and unexpected side effects with certain Challenges, as this would still need testing and this is new to us all.

Also, yes, changing these will give you the respective Challenge ribbons on your player card or remove them. It's no different from activating Challenges on a completely fresh save.

<hr>

### **[Custom] Discord Code Generator** ([discordcodegenerator.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/discordcodegenerator.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/discordcodegenerator.user.js))

This script will let you generate infinite amounts of Discord codes for all of the exclusive Pokémon locked behind Pokéclicker's Discord bot:<br>

![image](https://i.imgur.com/5Agit4Q.png)

You can claim as many Pokémon as you want just by clicking buttons, and they are also generated no differently than normal.

This also would **NOT** require you to link up a Discord account (for those without an account or prefer to not use Discord).

This script also works while offline.

<hr>

### **[Custom] Infinite Seasonal Events** ([infiniteseasonalevents.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/infiniteseasonalevents.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/infiniteseasonalevents.user.js))

This script adds in a new settings option to the top of the Start Menu:<br>

![image](https://user-images.githubusercontent.com/26987203/139570136-78e45d86-97ce-4fec-aa31-3459fbf19e04.png)

This will give you access to all of the seasonal events in the game:<br>

![image](https://user-images.githubusercontent.com/26987203/139570151-70f47769-40b1-4ec4-aa15-9eac50f33b39.png)

The events also show all the Pokémon that are brought along with them.

You can click on them to start any event that you desire. You are also able to activate more than 1 event simultaneously. They can be toggled on or off at any time. These events will run basically without end, at least not ending at any time you would really have to worry about.

There may be some other cool or neat custom events added in with this as well.

<hr>

### **[Custom] Oak Iems Unlimited** ([oakitemsunlimited.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/oakitemsunlimited.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/oakitemsunlimited.user.js))

This script removes the limit for the amount of Oak Items that you're able to equip:<br>

![image](https://i.imgur.com/0Peh94W.png)

All items are able to work together just fine, including leveling simultaneously with each other. Also, this is fully compaitable and functional with Loadouts.

This also removes any requirements needed to unlock any Oak Item slots, meaning you get the max number of slots given to you on a fresh save.

<hr>

### **[Custom] Omega Protein Gains** ([omegaproteingains.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/omegaproteingains.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/omegaproteingains.user.js))

This script removes the limit for the amount of Proteins that you're able to use on Pokémon:<br>

![image](https://i.imgur.com/2kXCzUA.png)

I haven't tested the limits of how many Proteins you can give, but it should practically be infinite.

<hr>

### **[Custom] Perky Pokerus Pandemic** ([perkypokeruspandemic.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/perkypokeruspandemic.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/perkypokeruspandemic.user.js))

This script makes Pokérus spread inside the Hatchery without needing your Starter Pokémon inside for this to be accomplished.

This script will run and work automatically without needing to do anything else.

<hr>

### **[Custom] Simple Weather Changer** ([simpleweatherchanger.user.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/simpleweatherchanger.user.js)) ([One-Click Install](//github.com/Ephenia/Pokeclicker-Scripts/raw/master/custom/simpleweatherchanger.user.js))

This script lets you freely edit the weather of the region you are currently in with this button:<br>

![image](https://i.imgur.com/2cBIfyH.png)

In addition it will also prevent the weather from changing and will remember you choice when reloading the game

<hr>

<b>More to be added soon.</b>
