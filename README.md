# fiveparsecs
Foundry System for Five Parsecs from Home

## Wot's all this then?

This is the shell for a FoundryVTT system to play *Five Parsecs from Home*, a solo/duo procedurally generated wargame from Modiphius Entertainment. The initial pass on the system will be low-automation, getting the basic dice rolling functions, items and characters (actors, in Foundry VTT parlance) working at a basic level. 

I intend to leave openings for increased automation of the game regarding the procedural generation steps for each campaign turn, and resolution of combat, but the first step is getting a basic framework established.

## Roadmap of Sorts

Next up: Campaign Turn tracker (part of the *Crew* sheet): track the stages of your current Campaign Turn, including handling upkeep, crew tasks, job creation, and world details. Ideally, at the end of a campaign turn, you'll click "log this" and it will generate a new Journal entry for that campaign turn. 

Future: combat automation with target selection and hit resolving, casualty counts, battle events. 

## Status

* Minimally playable / usable
* All random generation of encounters, characters, and so forth must be done using the core rulebook. 
* Some actor capabilities (like saving throws) aren't implemented yet; best to add them in the "Notes" area. 
* There is no automation of combat - attacks can be rolled by clicking on the relevant dice roll icon or on the icon next to the weapon entry, but there's no automation of range, hit checks, damage checks, or anything like that yet. 

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
