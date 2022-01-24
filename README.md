**Note**: This project is not regularly maintained; fixes and updates may be veeeeeery slow to happen. Like, months apart.

# fiveparsecs
Foundry System for Five Parsecs from Home

## What's all this then?

This is the shell for a FoundryVTT system to play *Five Parsecs from Home*, a solo/duo procedurally generated wargame from Modiphius Entertainment. This system is primarily an interactive character sheet and crew tracker, with built-in dice rolling. 

**Note**: because the core of the game is the procedural generation tables themselves, they **cannot** be included in the system and the system **cannot automate table rolls**. You must have a copy of the book to use this system.

## Latest News

* The latest alpha release includes the campaign tracker, styling updates, and fixes to missing items for characters. 

## Status

* Significant progress toward localization is made, but some hardcoded English strings exist.
* There is no automation of combat - attacks can be rolled by clicking on the relevant dice roll icon or on the icon next to the weapon entry, but there's no automation of range, hit checks, damage checks, or anything like that yet. That is for a future pass.

## Roadmap of Sorts

Next up: 

* Cleaning up dialogs, sheets for consistent look and feel (and better layout)
* Localization work.
* Ability to return to Known Worlds for a campaign turn.
* Combat automation: targeting, hit resolution, etc.

Done: 

* Campaign Turn tracker (part of the *Crew* sheet)

## Actor Types

Currently, there are three kinds of "character" in the game (what Foundy calls "Actors"):

* Character - these would be members of your crew; they're called "characters" in the system
* Enemy - these are opposition in encounters;
* Crew - this is your team; it is linked to individual characters

## Creating Characters and a Crew

Follow these steps to use this system. 

### 1. Create Characters.

Use the Actors tab of the sidebar to build characters. These are the adventurers who are part of your crew.

### 2. Create Weapons and other gear.

Use the Items tab to create weapons, gear, and so forth. I recommend setting up folders to keep things organized. Once created, you can drag them on to your *characters* to add them. 

### 3. Create your Crew.

Use the Actors tab to create an actor of type "crew." This will have a different character sheet, with the typical details of a Five Parsecs crew. 

### 4. Create "Crew Assignments"

In the items tab, there's a specific Item type called "crew_assignment." These are necessary to link your crew members with your crew. Here's how to use them.

1. Create an Item with the type "crew_assignment."
2. Select the crew member that this assignment is for in the drop-down list. It will list only characters (e.g., heroes)
3. Give the assignment a name, like "Assign _______".

### 5. Add Crewmembers to your crew.

From the Item list, *drag* the crew assignment(s) you've created on to the crew sheet. It will update to list crew member details, along with some icons to edit or remove crew members. **Note**: this is "display only" - to make changes to the crew member, hit the edit icon (the pencil) at the right-hand side of their entry. 

If you delete a crew member, don't worry - it will not delete the character *or* the crew_assignment item. It just removes it from the Crew sheet. 

## Worlds

The Crew sheet can also keep a log of worlds you've visited. Worlds are a type of **Item** in the game, and you can create them the same way you'd create a weapon or gear item--from the Items tab in the sidebar. Worlds are not yet randomly generated, so just fill out whatever you like.

To add a world to your crew log, drag it onto the crew sheet. It will show up in the "World Log" tab - click on "World Log" at the top of the crew sheet to view the world list. 

# The Campaign Turn

A Campaign Turn tracker is now available. It lets you keep track of the following during a campaign turn:

1. Travel events
2. Worlds
3. Upkeep
4. Crew Tasks
5. Jobs 
6. Battles 
7. Post-Battle Wrap Up

The campaign tracker can also write the campaign turn out to a Journal Entry, so you can keep a record of completed turns (you can write the turn out at any point, not just when you're done, but note that if you do, the turn tracker itself will be reset). 

## Using the Tracker

To execute a step in the turn, click the icon (or one of the icons) corresponding to the step. For example, to see if there's a travel event, click the "Travel" icon (if you're not traveling, well, don't click that!). 

### Worlds in the Tracker

In the "Arrival" section you can generate a random world, a custom world, or (pending implementation) return to a known world. Some things to note: 

1. When you create a world, it's added to your list of Known Worlds as well.
2. If you want to modify a world, click the "edit" icon - the pencil - next to its name.
3. If you delete the world, it is deleted completely, from both the campaign turn tracker *and* the list of known worlds.
4. If you create a new world while one is already listed, the new world replaces the existing one, which is moved to "known worlds." 

### Jobs in the Tracker

You can create as many jobs as you want; they will each be listed in the tracker. Deleting the job removes it from the tracker. 

### Battles in the Tracker

You can likewise create multiple battles to choose from. Just click the relevant icon!

### Resetting the Turn

You can delete the turn - without logging it - by clicking the trash can icon at the top of the turn tracker. This erases everything *except* the existing world, in case you want to start a new turn but use that world. 

## Logging the Turn

When you complete a turn, you can click the Log Turn icon (the document icon) at the top of the screen to write the information in the turn tracker to a Journal Entry. This lets you keep track of your Crew's progress. Once logged, everything in the tracker *except* the current world is removed (that way, if you want to stay on that world, or are stuck there due to invasion, you don't lose it). 
