# fiveparsecs
Foundry System for Five Parsecs from Home

## Wot's all this then?

This is the shell for a FoundryVTT system to play *Five Parsecs from Home*, a solo/duo procedurally generated wargame from Modiphius Entertainment. The initial pass on the system will be low-automation, getting the basic dice rolling functions, items and characters (actors, in Foundry VTT parlance) working at a basic level. 

Note: although the system will support random generation based on tables from the book, those tables must be created and populated **by the user**. This Five Parsecs Foundry System will not contain that content. 

## Roadmap of Sorts

Next up: 

* Character Creation Table (equipment, gear, etc.) support.
* Configurable game settings (difficulty, "Wild Galaxy", etc).
* Localization work.

Done: 

* Campaign Turn tracker (part of the *Crew* sheet)


## Status

* Random Generation of *most* parts of a Campaign Turn is now possible; **however**, this requires setting up a *ton* of tables in a specific way, and entering the data in a specific way. See the **Creating The Random Tables** section for details.
* At this point, the game is not localized for any language other than American English. Localization efforts will come in the future.
* Although random generation is possible, the system will not enforce limits or prevent "cheating" (like rolling multiple times until you get a battle setup that's super easy, etc.). Following the rules is the players' responsibility. 
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

# The Campaign Turn

A Campaign Turn tracker is now available. It lets you keep track of the following during a campaign turn:

1. Travel events
2. Worlds (which can be automatically generated or custom designed)
3. Upkeep
4. Crew Tasks
5. Jobs (automatically generated)
6. Battles (automatically generated)
7. Post-Battle Wrap Up

The campaign tracker can also write the campaign turn out to a Journal Entry, so you can keep a record of completed turns (you can write the turn out at any point, not just when you're done, but note that if you do, the turn tracker itself will be reset). 

## Using the Tracker

To execute a step in the turn, click the icon (or one of the icons) corresponding to the step. For example, to see if there's a travel event, click the "Travel" icon (if you're not traveling, well, don't click that!). 

Each step offers some automatic rolling on tables, if you've set up the tables according to the **Creating the Random Tables** section below. If you don't want to set them up, make sure to disable Automatic Generation in the System Settings dialog, or you'll have a bad time.

### Worlds in the Tracker

In the "Arrival" section you can generate a random world, a custom world, or (pending implementation) return to a known world. Some things to note: 

1. When you generate or create a world, it's added to your list of Known Worlds as well.
2. If you want to modify a world, click the "edit" icon - the pencil - next to its name.
3. If you delete the world, it is deleted completely, from both the campaign turn tracker *and* the list of known worlds.

### Jobs in the Tracker

You can create as many jobs as you want; they will each be listed in the tracker. Deleting the job removes it from the tracker. 

### Battles in the Tracker

You can likewise create multiple battles to choose from. Just click the relevant icon!

### Resetting the Turn

You can delete the turn - without logging it - by clicking the trash can icon at the top of the turn tracker. This erases everything *except* the existing world, in case you want to start a new turn but use that world. 

## Logging the Turn

When you complete a turn, you can click the Log Turn icon (the document icon) at the top of the screen to write the information in the turn tracker to a Journal Entry. This lets you keep track of your Crew's progress. Once logged, everything in the tracker *except* the current world is removed (that way, if you want to stay on that world, or are stuck there due to invasion, you don't lose it). 

# Creating the Random Tables

*Five Parsecs* uses dozens of tables to handle the procedural generation of game events, battles, loot, and so forth. Foundry supports Roll Tables, allowing the system to provide the random generation experience (with some limitations). However, for the system to work fully, it requires you to set up all of the tables and populate them--they are not pre-installed in the system.

Please note that (for the time being) you must create the tables with the **exact names indicated below.** The names are **case sensitive**. For populating the tables, you can hand-type them, or (and I recommend) use the EasyTable Foundry Module to speed data entry. For the most part, the text content can be whatever you like, but a couple tables require the entries to be formatted in a specific way (or the system will not display the results correctly). 

## Character Creation Tables

Not yet implemented.

## Travel and World Tables

Create and fill tables with the following names:

* Travel Events
* World Traits

You'll note that there is a table, *Planet Names*, that is automatically part of the game. It's just a list of randomly generated planet names. Feel free to change the list, but note that the table is required for full functionality.

## Battle Tables

Unfortunately, Foundry doesn't support multi-column tables, so the tables on pages 88 - 94 of the *Five Parsecs from Home* rule book have to be split into single tables, one for each type of mission (Opportunity, Patron, Quest, and Rival). That means, unfortunately, a lot of tables. 

Create and fill out the following tables:

### Deployment Conditions Tables

Base these on the Deployment Conditions table, page 88 of the *5PFH* core rules.

* Deployment-Opportunity
* Deployment-Patron
* Deployment-Quest
* Deployment-Rival

### Notable Sights Tables

* Notable Sights-Opportunity
* Notable Sights-Patron
* Notable Sights-Quest
* Notable Sights-Rival

### Objective Tables

From the tables on page 89 of the *5PFH* core rules.

* Objective-Opportunity
* Objective-Patron
* Objective-Quest
* Objective-Rival

### Opposition Tables

These tables determine the *category* of enemy in a battle. Use the values in the table on *5PFH* p. 94, titled "Enemy Encounter Category Tables.

* Opposition-Opportunity
* Opposition-Patron
* Opposition-Quest
* Opposition-Rival

### Enemy Tables

These tables are for the *specific* enemy faced in a battle. Create and fill out tables with the following names:

* Criminal Elements
* Hired Muscle
* Interested Parties
* Roving Threats
* Unique Individuals

**IMPORTANT**: for each of the above tables, the entry must be formatted like so: Enemy Type/Numbers (using the Numbers stat in the core book, but excluding the "+" sign). So for example, the entry for Unknown Mercs (page 96 in the core rules) would look like this in the table:

`Unknown Mercs/0`

If you leave off the / and the number, generation will still work, but the game won't be able to tell you how many enemies you are facing. 

## Crew Task Tables

* Trade
* Explore

## Jobs Tables

* Patron
* Danger Pay
* Time Frame
* Benefits
* Hazards
* Conditions

## Loot

Setting up the loot tables is the trickiest part, because it's a series of nested tables. These aren't too hard to set up in Foundry, fortunately. Use these steps to create the Loot table:

1. Set up the specific loot tables. These are the tables on pages 131-134 of the *5PFH* core rules that have *specific* items, not categories, in them. They will be named:

* Slug Weapons
* Energy Weapons
* Special Weapons
* Melee Weapons
* Grenades
* Gun Mods
* Gun Sights
* Protective Items
* Utility Items
* Consumables
* Implants
* Ship Items
* Rewards

2. Set up the Loot sub-category tables (these correspond to the Weapon Category subtable, p. 131, the Gear subtable, p. 132, and the Odds and Ends subtable, p. 133). They will be named:

* Weapon Category
* Gear Category -- note that this is *Gear Category*, not just *Gear*
* Odds and Ends

As you create these, you'll need to set each entry to point to the corresponding specific *table* created in step 1. Do it like this:

Open the table.


Click the "+" to add an entry.


In the entry type, select "Entity"


In the entity type drop-down, select "Roll Table"


In the text field, enter the *exact* name of the Roll Table you want to point to (so, for example, the Energy Weapons entry in the Weapons Category Table will point to the Energy Weapons *table* you created in step 1).

Repeat that process to link all of the specific loot item tables to their category tables.

3. Link the category tables to the main Loot table.

Create a table with the name **Loot**. Then, using the same process to link tables, link each of the sub-category tables created in Step 2 to the main Loot table. Make sure to link the Rewards table in there too!

**IMPORTANT**: The table in the rule book has a section for Damaged Gear and Damaged Weapons as well as regular gear and weapons. Instead of including them separately, expand the roll range of Weapon and Gear to include the damaged ones too. The system automatically handles damaged item drops. In other words, the ranges should be:

* Weapon: 1-35
* Gear: 36-65
* Odds and Ends: 66-80
* Rewards: 81-100