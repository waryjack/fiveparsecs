import { FPRollHelper } from "../../utility/FPRollHelper.js";

export class FPActorSheet extends ActorSheet {
    get template() {
        const path = 'systems/fiveparsecs/templates/actor/';
        return `${path}${this.actor.data.type}sheet.hbs`;
    }

    /**
     * @override
     */
    static get defaultOptions() {
        console.warn("defaultOptions actor: ", this.actor);

            return mergeObject(super.defaultOptions, {
                classes: ['fp', 'sheet', 'actor', 'actor-sheet'],
                width: 800,
                height: 400,
                left:75,
                tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheetbody", initial: "main"}],
                dragDrop: [{dragSelector: ".dragline", dropSelector: null}]
            });
  
    }
    
    /**
     * @override
     */
    getData() {
        const data = deepClone(this.actor.data);

         
         data.config = CONFIG.fiveparsecs; 
         let ownedItems = this.actor.items;
         data.actor = this.actor; 
         

         if(this.actor.type === "character") {
            let gl = new Array();
            data.weapons = ownedItems.filter(function(item) {return item.type == "weapon"});
            data.gear = ownedItems.filter(function(item) {return item.type == "gear"});
            data.gearCount = data.gear.length - 1;
         } 
         
         if (this.actor.type === "crew") {
            data.assignedCrew = this._buildCrewData(ownedItems);
            console.warn("Assigned Crew: ", data.assignedCrew);
         }

         return data;
    }

    /**
     * @override
     */
     activateListeners(html) {
        super.activateListeners(html);
        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        html.find('.inline-edit-notes').blur(this._inlineEditNotes.bind(this));
        html.find('.item-create').click(this._addItem.bind(this));

        html.find('.item-edit').click(this._editItem.bind(this));

        html.find('.item-delete').click(this._deleteItem.bind(this));

        html.find('.dice-roll').click(this._diceRoll.bind(this));

        /* Allows drag-drop to sidebar
        let handler = (ev) => this._onDragStart(ev);
        html.find('.item-name').each((i, item) => {
            if (item.dataset && item.dataset.itemId) {
                item.setAttribute('draggable', true);
                item.addEventListener('dragstart', handler, false);
            }
        }); */

    }

    _diceRoll(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let expr = element.dataset.diceBase;

        if (expr != "Reaction Roll") {
            const template = "systems/fiveparsecs/templates/roll/basicroll.hbs";

            let data = {
                actor:this.actor,
                expr:expr
            }
            

            FPRollHelper.roll(template, data);
        } else {
            const template = "systems/fiveparsecs/templates/roll/reactionroll.hbs";
            let data = {
                actor:this.actor,
            }
            FPRollHelper.reactionRoll(template, data);

        }

        // stub

    }

    _inlineEditNotes(event){

        event.preventDefault();
        let element = event.currentTarget;

        return this.actor.update({"data.data.notes": element.innerText});

    }
    _editItem(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let crewId = element.closest(".item").dataset.crewId;

        console.warn("crewId, itemId: ", crewId, itemId);

        let item = this.actor.items.get(itemId);

        if(element.dataset.type === "crew_actor"){

            const actorToEdit = game.actors.filter(function(actor) { return actor.data._id == crewId; });

            console.warn("Actor to edit: ", actorToEdit);

            actorToEdit[0].sheet.render(true);

        } else {

            item.sheet.render(true);

        }

    }

    _addItem(event) {
        
        event.preventDefault();
        console.warn("_addItem fired: ");
        
        var locString = "FP.ui.item.new";

        let element = event.currentTarget;

        let itemData  = {
            name: game.i18n.localize(locString),
            type: element.dataset.type,
        }

        return Item.create(itemData, {parent: this.actor, renderSheet:true});
    }

    _deleteItem(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;

        console.warn("triggered delete for item id: ", itemId);

        let d = new Dialog({
          title: "Delete This Item?",
          content: "<p>Are you sure you want to delete this item?</p>",
          buttons: {
           one: {
            icon: '<i class="fas fa-check"></i>',
            label: "Yes",
            callback: () => { this.actor.deleteEmbeddedDocuments("Item", itemId); }
           },
           two: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => { return; }
           }
          },
          default: "two",
          render: html => console.log("Register interactivity in the rendered dialog"),
          close: html => console.log("This always is logged no matter which option is chosen")
         });
         d.render(true);

    }

    _buildCrewData(ownedItems) {
        console.warn("Crew Owned Items: ", ownedItems);
        let crewRoster = [];
        let gList = [];
        let assignedCrew = ownedItems.filter(function(item) {return item.type == "crew_assignment"});
        console.warn("Assigned Crew: ", assignedCrew);
        if (!Array.isArray(assignedCrew) || assignedCrew.length === 0) { console.log("No assigned crew"); return; }


        assignedCrew.forEach(crew => {
            // console.warn("All Actors: ", game.actors);
            console.warn("This Actor ID: ", crew.data.data.assigned_crew_actorId);
            let crewActor = game.actors.filter(function(actor) {return actor.data._id == crew.data.data.assigned_crew_actorId})[0];
            console.warn("Current Actor: ", crewActor); 
            let mbr_weapons = {};

            // Build object with basic crewmember info  
            let crewMemberData = {
                mbr_item_id: crew.data._id,
                mbr_name: crewActor.name,
                mbr_id: crewActor.data._id,
                mbr_species: crewActor.data.data.data.species,
                mbr_reactions: crewActor.data.data.data.reactions,
                mbr_speed: crewActor.data.data.data.speed,
                mbr_combat: crewActor.data.data.data.combat,
                mbr_toughness: crewActor.data.data.data.toughness,
                mbr_savvy: crewActor.data.data.data.savvy,
                mbr_notes: crewActor.data.data.data.notes,
                mbr_luck: crewActor.data.data.data.luck

            };
            let crewMemberWeps = crewActor.items.filter(function(item) {return item.type == "weapon"});
            crewMemberWeps.forEach( wep => {
                let wepObject = {
                    name: wep.name,
                    range: wep.data.data.range,
                    shots: wep.data.data.shots,
                    dmg: wep.data.data.damage,
                    traits: wep.data.data.traits
                }
                setProperty(mbr_weapons, wep.name, wepObject);
            });

            let crewMemberGear = crewActor.items.filter(function(item) {return item.type == "gear"});
            crewMemberGear.forEach( gear => {
                gList.push(gear.name);
            }); 

            setProperty(crewMemberData, "mbr_gear", gList.toString());
            setProperty(crewMemberData, "mbr_weapons", mbr_weapons);
            crewRoster.push(crewMemberData);

            console.warn("Crew Member Data: ", crewMemberData); 
            console.warn("Crew Roster: ", crewRoster);
          
        });

        return crewRoster;

    }
}