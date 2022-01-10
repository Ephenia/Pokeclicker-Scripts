# **Pokeclicker Scripts**

Various scripts & enhancements for the game [Pokéclicker](https://www.pokeclicker.com/).

These are originally created and intended for the use of the browser extension known as [Tampermonkey](https://www.tampermonkey.net/).

If you are looking to use these scripts on the client version of Pokeclicker (Pokeclicker Desktop), [please check out the Releases section](https://github.com/Ephenia/Pokeclicker-Scripts/releases).

**If you are looking to have something specific created or have any inquiries, feel free to contact me directly (contact info on profile) OR [open and create an issue](https://github.com/Ephenia/Pokeclicker-Scripts/issues). More scripts and things that I create will be added in due time.**

**Vanilla scripts** are purely for automation or other QoL things.<br>
**Custom scripts** are able to do or change things that aren't within the bounds of the vanilla game.

# Vanilla Scripts
1. [**Additional Visual Settings** ](//github.com/Ephenia/Pokeclicker-Scripts#additional-visual-settings-additionalvisualsettingsjs)
2. [**Enhanced Auto Clicker** ](//github.com/Ephenia/Pokeclicker-Scripts#enhanced-auto-clicker-enhancedautoclickerjs)
3. [**Enhanced Auto Hatchery** ](//github.com/Ephenia/Pokeclicker-Scripts#enhanced-auto-hatchery-enhancedautohatcheryjs)
4. [**Enhanced Auto Mine** ](//github.com/Ephenia/Pokeclicker-Scripts#enhanced-auto-mine-enhancedautominejs)
5. [**Simple Auto Farmer** ](//github.com/Ephenia/Pokeclicker-Scripts#simple-auto-farmer-sinpleautofarmerjs)
# Custom Scripts
1. [**Catch Speed Adjuster** ](//github.com/Ephenia/Pokeclicker-Scripts#custom-catch-speed-adjuster-catchspeedadjusterjs)
2. [**Infinite Seasonal Events** ](//github.com/Ephenia/Pokeclicker-Scripts#custom-infinite-seasonal-events-infiniteseasonaleventsjs)


```diff
- Note: all scripts here would be 100% compatible with one another!!!
- Note: feel free to open an issue if you find any bugs/issues as these aren't fully tested!!!
- Note: in case it isn't mention below, all user set settings with these scripts are saved and persist even upon browser close.
```

<hr>

## **Additional Visual Settings** ([additionalvisualsettings.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/additionalvisualsettings.js))
This script adds new options in the Visual settings tab. These new options are shown here:<br>

![](https://i.imgur.com/sWlhKlx.png)

Why I made these options is for making a hacky way to help save on some performance, especially when you are idling and leaving the game open for longer periods of time. This ends up removing these HTML elements that are constantly and endlessly getting updated, so that the DOM is less flooded. After enabling any of these options, you will have to change routes for these settings to take effect. When disabling, you will have to go to something like a Town/Dungeon then back to a route for these to start working again.

This script also includes support for a quick Settings button, as shown below:<br>

![](https://i.imgur.com/GHt61hr.png)

The gear icon to the left of the Start Menu that you see there.

![](https://i.imgur.com/8H1ZeBV.png)

As of 1.3 there is now an option for disabling all notifications, this may be good and helpful especially if you are using Enhanced Auto Mine. This may also cause some popups and other things not to appear (such as trying to manually Skip layers in the Underground). You can still also hear when you get shinies using this, but you won't be able to see what shiny you received. I have not fully tested this, so feel free to experiment with this setting.

<hr>

## **Enhanced Auto Clicker** ([enhancedautoclicker.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/enhancedautoclicker.js))
This script was originally created by <b>Ivan Lay</b> and [can be found over here](//github.com/ivanlay/pokeclicker-automator).

This script currently features quite a lot more over the old one. This enhanced version mainly will add in a button to toggle the Auto Clicker on/off without the need of a refresh. This setting will also save and persist through refresh/browser close as well.

The button can be found under your currencies, as shown here:<br>

![image](https://user-images.githubusercontent.com/26987203/139553777-6c8fbeb9-6ebf-4884-9b60-04bbc218d148.png)

What has also been added with my enhanced version are 4 additional things as well, these are as follows:<br>

<strong>• Auto Click DPS</strong> - This will tell you the total amount of click damage that you're dealing per second while the Auto Clicker is active.<br>
<strong>• Req. DPS</strong> - This will tell you the total required amount of click damage (Auto Click DPS) needed for you to 1 shot the route and fully cap out the red (health) bar.<br>
<strong>• Enemy/s</strong> - How many enemies you are defeating per second through the use of the Auto Clicker and it being currently active (20 is cap).

<strong>Auto Click DPS will always show in Gold. Required DPS will change color depending on if you meet it or not.</strong><br>

> <strong>As of 1.4 the Auto Gym feature has been released as well which can be seen below the Auto Click button. Some notes about how this works would be as follows:</strong><br><br>
• Auto Gym will only work while the Auto Clicker is active.<br>
• Auto Gym when activated will automatically fight the current Gym in the town that you're at or automatically fight the Gym in the town that you've last visited (if it has a Gym).<br>
• There is a dropdown to the right of the Auto Gym button which is meant for Elite Fours. The number that you set this to will be which Elite Four member that you will fight (or at least try to). So for example, if you set this to #5 then you will be fighting the Champion or at least that's what Auto Gym's priority will be. This means Auto Gym will also automatically fight through the Elite Four if you would be fighting an Elite Four for the first time as well.

<br>

> <strong>As of 1.5 the Auto Dungeon feature has been released as well which can be seen below the Auto Click button. Some notes about how this works would be as follows:</strong><br><br>
• Auto Dungeon will only work while the Auto Clicker is active.<br>
• Auto Dungeon when activated will automatically fight the current dungeon that you're at or will automatically fight the last dungeon that you've visited or dungeon in the town that you've last visited (if the town has a dungeon).<br>
• There is a dropdown to the right of the Auto Dungeon button which would contain 2 modes:<br><br>
<strong>"F" for Farm Mode</strong> - this will run through the dungeon in its entirety 100% and fight all the enemies as well as loot all the chests. The boss will be fought and always be saved for last.<br>
<strong>"B" for Boss Rusher</strong> - this will try to clear the dungeon as fast as possible and rush the Boss. The Boss will always be the top priority.

<br>

```diff
- Note: the Auto Clicker runs every 0.05 seconds.
- Note: statistics are checked and updated every 1 second while the Auto Clicker is active.
```

I thought that these were some neat and useful additions to add. I hope that you guys would like them as well. I spent a lot of time on these especially with creating Auto Dungeon.

<hr>

## **Enhanced Auto Hatchery** ([enhancedautohatchery.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/enhancedautohatchery.js))
This script was originally created by <b>Ivan Lay & Drak</b> and [can be found over here](//greasyfork.org/en/scripts/432768-auto-hatchery-edit-pokeclicker-com).

I wanted to take and re-make this script, not only to make it be another enhanced version of a script to add to the list, but also to fix and also improve upon the original. Also, I found that the auto placement of store bought eggs & fossils wasn't working for me in the other script, so I re-wrote the entire code for that to hopefully make it a lot better as well as future-proof.

Anyway, here's what this script is adding:<br>

![](https://i.imgur.com/VpL6TTr.png)

A button that will toggle On/Off the auto hatching of eggs.

There is also this as well:<br>

![](https://i.imgur.com/J0QvYc2.png)

When you open up the Daycare, you will see another button for automatically placing store bought eggs as well as fossils that you have dug up. This will randomly place what you have inside the Hatchery, and it will also prioritize placing them if you have any of the two available.

```diff
- Note: the Auto Hatchery runs every 0.05 seconds.
- Note: If you have this script active and haven't unlocked Hatchery yet, you will need to refresh currently for this to work once you do unlock the Hatchery.
```

<hr>

## **Enhanced Auto Mine** ([enhancedautomine.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/enhancedautomine.js))
This script was originally created by <b>Ivan Lay</b> and [can be found over here](//github.com/ivanlay/pokeclicker-automator).

This I had worked quite a bit on, and I'm quite happy with what it's capable of doing. This is far greater and does a lot more than Ivan Lay's script. However, since I was using it and was inspired, I decided to make an auto miner that's efficient as possible instead.

What this script adds is a new top row below the mining layer, as shown:<br>

![](https://i.imgur.com/0DzjmOM.png)

There's a lot to go over and explained with this Auto Miner, but I'll try my best to explain it all:

<strong>• Auto Mine</strong> - This will turn the Auto Miner On/Off. The Auto Miner uses bombs to automatically mine.<br>
> <strong>As of 1.2 there is now Auto Chisel implemented which will mine out layers when you've cleared out 50%> of the tiles in a layer. Later on, this will be something you will be able to change the threshold of and when it will occur.

<strong>• Auto Small Restore</strong> - This will automatically use Small Restores as well as buy them while it's active (only when Auto Mine is running). It will also only ever buy them when you have 0 Small Restores and when they also cost 30,000 (base price). Knowing that, this would be best used if you are anywhere that you are 1 shotting Pokémon (so the price penalty in the Shop is constantly decreasing).<br>
<strong>• 1st Input Field</strong> - Here you can enter a money value as to when Small Restores should stop Auto Buying. This will help you not drain your money and help manage it.<br>
<strong>• 2nd Input Field</strong> - This is basically an Auto Skipper. You can enter a minimum value here as to how many items that you would like to look for in new layers. If there are fewer items in a layer than your desired input, then the layer will be skipped (if you have any skips available).

As of 1.1 this also includes 2 more additional features into the Treasures tab of the Underground as shown below:<br>

![](https://i.imgur.com/H0btTjL.png)

<strong>• Auto Sell Treasure</strong> - This will automatically sell any and all treasures that would give you Diamonds upon successfully mining an Underground layer.<br>
<strong>• Auto Sell Plate</strong> - This will automatically sell any and all plates that would give you shards upon successfully mining an Underground layer.

```diff
- Note: the Auto Miner runs once every 1 second.
```

<hr>
  
## **Simple Auto Farmer** ([sinpleautofarmer.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/main/simpleautofarmer.js))
This script is for a simplistic Auto Farmer which adds 2 new buttons below the Plant and Harvest all buttons as shown:<br>

![](https://i.imgur.com/9Y4ad5B.png)

Auto Farm will plant the berry that you have selected and will harvest all of them as well when they are ready. Auto mulch works in conjunction with Auto Farm, so Auto Farm must be on for Auto Mulch to work. With Auto Mulch it will use the mulch that you have selected as well. This will also work with the Farm window closed, and these settings will persist upon refresh/browser close.

```diff
- Note: the Auto Farmer runs once every 1 second.
```

I plan to update this Auto Farmer with some additional features later on.

<hr>

## **[Custom] Catch Speed Adjuster** ([catchspeedadjuster.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/catchspeedadjuster.js))
This script adds in a new option found below your Pokéballs:<br>

![image](https://i.imgur.com/C6aVzND.png)

This currently will make all of your Pokéballs catch Pokemon at 0 delay (basically catch Pokémon as fast as you can defeat them).

<hr>
  
## **[Custom] Infinite Seasonal Events** ([infiniteseasonalevents.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/custom/infiniteseasonalevents.js))
This script adds in a new settings option to the top of the Start Menu:<br>

![image](https://user-images.githubusercontent.com/26987203/139570136-78e45d86-97ce-4fec-aa31-3459fbf19e04.png)

This will give you access to all of the seasonal events that there are in Pokeclicker:<br>

![image](https://user-images.githubusercontent.com/26987203/139570151-70f47769-40b1-4ec4-aa15-9eac50f33b39.png)

The events also show all the Pokemon that are brought along with them.

You can click on them to start any event that you desire. Also, you are able to activate more than 1 event simultaneously. You are also able to turn them off and end them at any time that you would want to as well. These events will run basically without end, at least not ending at any time that you would really ever have to worry about.

There may be some other cool or neat custom events added in with this as well.

<hr>

<b>More to be added soon.</b>
