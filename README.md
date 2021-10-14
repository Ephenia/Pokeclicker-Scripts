# **Pokeclicker Scripts**

Various scripts & enhancements for the game [Pokéclicker](https://www.pokeclicker.com/).

These are created and intended for the use of the browser extension known as [Tampermonkey](https://www.tampermonkey.net/).

**If you are looking to have something specific created or have any inquiries, feel free to contact me (contact info on profile). More scripts and things that I create will be added in due time.**

```diff
- Note: all scripts here would be 100% compatible with one another!!!
```

<hr>

## **Additional Visual Settings** ([additionalvisualsettings.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/additionalvisualsettings.js))
This script adds new options in the Visual settings tab. These new options are shown here:<br>

![](https://i.imgur.com/sWlhKlx.png)

Why I made these options is for making a hacky way to help save on some performance, especially when you are idling and leaving the game open for longer periods of time. This ends up removing these HTML elements that are constantly and endlessly getting updated, so that the DOM is less flooded. After enabling any of these options, you will have to change routes for these settings to take effect. When disabling, you will have to go to something like a Town/Dungeon then back to a route for these to start working again.

This script also includes support for a quick Settings button, as shown below:<br>

![](https://i.imgur.com/GHt61hr.png)

The gear icon to the left of the Start Menu that you see there.

<hr>

## **Enhanced Auto Clicker** ([enhancedautoclicker.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/enhancedautoclicker.js))
This script was originally created by <b>Ivan Lay</b> and [can be found over here](//github.com/ivanlay/pokeclicker-automator).

This script currently features quite a lot more over the old one. This enhanced version mainly will add in a button to toggle the Auto Clicker on/off without the need of a refresh. This setting will also save and persist through refresh/browser close as well.

The button can be found under your currencies, as shown here:<br>

![](https://i.imgur.com/S4hZVlC.png)

What has also been added with my enhanced version are 3 additional things as well, these are as follows:<br>

<strong>• Auto Click DPS</strong> - This will tell you the total amount of click damage that you're dealing per second while the Auto Clicker is active.<br>
<strong>• Req. DPS</strong> - This will tell you the total required amount of click damage (Auto Click DPS) needed for you to 1 shot the route and fully cap out the red (health) bar.<br>
<strong>• Enemy/s</strong> - How many enemies you are defeating per second through the use of the Auto Clicker and it being currently active (20 is cap).

```diff
- Note: all these are checked and updated every 1 second while the Auto Clicker is active.
```

I thought that these were some neat and useful additions to add. I hope that you guys would like them as well. I feel that it's a lot easier to see and gauge your efficiency on a route much easier and where the best place would be to go for you.

<hr>

## **Simple Auto Farmer** ([sinpleautofarmer.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/main/simpleautofarmer.js))
This script is for a simplistic Auto Farmer which adds 2 new buttons below the Plant and Harvest all buttons as shown:<br>

![](https://i.imgur.com/9Y4ad5B.png)

Auto Farm will plant the berry that you have selected and will harvest all of them as well when they are ready. Auto mulch works in conjunction with Auto Farm, so Auto Farm must be on for Auto Mulch to work. With Auto Mulch it will use the Mulch that you have selected as well. This will also work with the Farm window closed, and these settings will persist upon refresh/browser close.

```diff
- Note: If you have this script active and haven't unlocked Farm yet, you will need to refresh currently for this to work once you do unlock Farm.
```

I plan to update this Auto Farmer with some additional features later on.

<hr>

<b>More to be added soon.</b>
