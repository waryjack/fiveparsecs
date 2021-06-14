// Imports

import { preloadHandlebarsTemplates } from "./templates.js";
import { registerSettings } from "./settings.js";
import { FP } from "./config.js";
import { FPActor } from "./actor/FPActor.js";
import { FPActorSheet } from "./sheets/actor/FPActorSheet.js";
import { FPItemSheet } from "./sheets/item/FPItemSheet.js";

Hooks.once("init", () => {
    console.log("fiveparsecs | Initializing Five Parsecs System");

    CONFIG.fiveparsecs = FP; 

    // Add namespace in global

    game.FP = {
        FPActor,
        FPActorSheet,
        FPItemSheet,
        // FPCombat,
        registerSettings
    };


    // Unregister core sheets
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);

    // Register System sheets
    Actors.registerSheet("fiveparsecs", FPActorSheet, { makeDefault:true });

    Items.registerSheet("fiveparsecs", FPItemSheet, { makeDefault:true });

    CONFIG.debug.hooks = true;

    CONFIG.Actor.documentClass = FPActor;
    // CONFIG.Combat.documentClass = FPCombat;


    // Register system settings
    registerSettings();

    // Register partials templates
    preloadHandlebarsTemplates();

    // Register handlebar helpers
    Handlebars.registerHelper('ife', function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("times", function(n, content) {
       let result = "";
       if (n==0 || n == null) return;
       for (let i = 0; i < n; i++) {
           result += content.fn(i)
       }

       return result;

    });

    //uppercases; needs work
    Handlebars.registerHelper("proper", function(content) {
        let result = "";

        result = content[0].toUpperCase() + content.substring(1);

        return result;

    });

    Handlebars.registerHelper("minus", function(arg1, arg2) {
        let result = arg1 - arg2;

        return result;
    });

    Handlebars.registerHelper("render", function(arg1){

        return new Handlebars.SafeString(arg1);
    });

    // Checks whether a game setting is active
    Handlebars.registerHelper("setting", function(arg){
        // console.warn("Passed Setting Name: ", arg);
        if (arg == "" || arg == "non" || arg == undefined) { return ; }
        return game.settings.get('ewhen', arg);
    });

    
    Handlebars.registerHelper("concat", function(...args){
        let result = "";
        for (let a of args) {
            result += a;
        }

        return result;
    });

    Handlebars.registerHelper("getCustomName", function(a) {
        if (a == "none" || a == "None" || a == "") { return; }
        let result = "Name";
        let truncA = a.substring(0,3);
        result = truncA+result;
       // console.warn("Custom Name", result);
        return result;
    });

    Handlebars.registerHelper("and", function(a, b){
        return (a && b);
    });

    Handlebars.registerHelper("or", function(a, b){
        return (a || b);
    });

    Handlebars.registerHelper("contains", function(a, b){
        if (a.indexOf(b) !== -1) {
            return true;
        } else {
            return false;
        }
    });
});

/**
 * Item Hooks - update, delete, make sure to adjust stats
 * for armor and so forth, initiative.
 *
 * Todo - consolidate and move to method(s) in EWActor?
 */

Hooks.on('updateItem', function(actor, item, changed){

});


// should probably become preDeleteOwnedItem, to handle it before
// the item actually vanishes from the inventory

Hooks.on('deleteItem', function(actor, item){ 

});

/**
 * Chat Display Hooks
 */

// Add the necessary tooltip toggles

Hooks.on('renderChatMessage', (app, html) => {

   /* html.on('click', '.taskroll-msg', event => {
        event.preventDefault();
        // NOTE: This depends on the exact card template HTML structure.
        $(event.currentTarget).siblings('.taskroll-tt').slideToggle("fast");
     });

     html.on('click', '.taskroll-info', event => {
        event.preventDefault();
        // NOTE: This depends on the exact card template HTML structure.
        $(event.currentTarget).siblings('.taskroll-tt').slideToggle("fast");
     });
     */
    
});

/**
 * Initiative / Combat Hooks
 */

// Convert initiative to Everywhen Priority "ladder" if setting active
Hooks.on('updateCombatant', function(combat, changed, diff) {

    console.warn("Combat object: ", combat); 
    console.warn("changed: ", changed);
    console.warn("diff: ", diff);

    //changed.initiative = newInit;
});


/**
 * Actor / Token Hooks
 */

Hooks.on('updateToken', function(token, changed, diff){

    console.log("Also Updating Token: ", token.name, token._id);

});

Hooks.on('preCreateItem', function(item, data) {
    // console.warn("first argument: ", item, "second arg", data);
    console.warn("item type: ", item.type);
     if (item.type == "weapon") {
         item.data.update({"img":"icons/svg/sword.svg"});
     }
 
 });
 
 Hooks.on('preCreateOwnedItem', function(item, data) {
    // console.warn("first argument: ", item, "second arg", data);
    if (item.type == "weapon") {
        item.data.update({"img":"icons/svg/sword.svg"});
    } 
 
 });

 Hooks.on('closeFPActorSheet', function(actorSheet, sheetData) {

    let sheetActorId = actorSheet.actor.data._id;

    let allOwnedCrewAssignments = [];
    const allCrews = game.actors.filter(a => a.type === "crew");
    
    allCrews.forEach(c => {
        let crewItems = c.items.filter(i => i.type === "crew_assignment");
       
        crewItems.forEach(ci => allOwnedCrewAssignments.push(ci));

    }); 


    let thisActorAssignments = allOwnedCrewAssignments.filter((a) => a.data.data.assigned_crew_actorId === sheetActorId);

    thisActorAssignments.forEach(a => {
        let parentCrew = a.parent;
        parentCrew.sheet.render(false);
    })

 });

