# **Pokeclicker Scripts**

Various scripts & enhancements for the game [Pokéclicker](https://www.pokeclicker.com/).

These are created and intended for the use of the browser extension known as [Tampermonkey](https://www.tampermonkey.net/).

**If you are looking to have something specific created or have any inquiries feel free to contact me (contact info on profile). More scripts and things that I create will be added in due time.**

## **Simple Auto Farmer** ([sinpleautofarmer.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/main/simpleautofarmer.js))
This script is for a simplistic Auto Farmer which adds 2 new buttons below the Plant and Harvest all buttons as shown:<br>

![](https://i.imgur.com/9Y4ad5B.png)

Auto Farm will plant the berry that you have selected and will harvest all of them as well when they are ready. Auto mulch works in conjunction with Auto Farm, so Auto Farm must be on for Auto Mulch to work. With Auto Mulch it will use the Mulch that you have selected as well. This will also work with the Farm window closed, and these settings will persist upon refresh/browser close.

I plan to update this Auto Farmer with some additional features later on.

## **Additional Visual Settings** ([additionalvisualsettings.js](//github.com/Ephenia/Pokeclicker-Scripts/blob/master/additionalvisualsettings.js))
This script adds new options in the Visual settings tab. These new options are shown here:<br>

![](https://i.imgur.com/sWlhKlx.png)

Why I made these options is for making a hacky way to help save on some performance, especially when you are idling and leaving the game open for longer periods of time. This ends up removing these HTML elements that are constantly and endlessly getting updated so the DOM is less flooded. After enabling any of these options, you will have to change routes for these settings to take effect. When disabling, you will have to go to something like a Town/Dungeon then back to a route for these to start working again.

This script also includes support for a quick Settings button as shown below:<br>

![](https://i.imgur.com/GHt61hr.png)

To gear icon to the left of the Start Menu.
<hr>
<b>More to be added soon.</b>
