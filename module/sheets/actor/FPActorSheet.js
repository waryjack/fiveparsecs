import { FPRollUtility } from "../../utility/FPRollUtility.js";
import { FPProcGen } from "../../utility/FPProcGen.js";


export class FPActorSheet extends ActorSheet {
    get template() {
        const path = 'systems/fiveparsecs/templates/actor/';
        return `${path}${this.actor.data.type}sheet.hbs`;
    }

    /**
     * @override
     */
    static get defaultOptions() {

            return mergeObject(super.defaultOptions, {
                classes: ['fp', 'sheet', 'actor', 'actor-sheet'],
                // width: 480,
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
         

         if(this.actor.type === "character" || this.actor.type === "enemy") {
          
            let gl = new Array();
            data.weapons = ownedItems.filter(function(item) {return item.type === "weapon"});
            data.gear = ownedItems.filter(function(item) {return item.type === "gear"});
            data.backgrounds = ownedItems.filter(item => item.type === "background");
            data.motivations = ownedItems.filter(item => item.type === "motivation");
            data.class = ownedItems.filter(item => item.type === "class");
            data.gearCount = data.gear.length - 1;
         } 
         
         if (this.actor.type === "crew") {
            data.assignedCrew = this._buildCrewData(ownedItems);
            data.worlds = ownedItems.filter(item => item.type === "world");
           
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

        html.find('.inline-edit').blur(this._inlineEdit.bind(this));

        html.find('.item-create').click(this._addItem.bind(this));

        html.find('.item-edit').click(this._editItem.bind(this));

        html.find('.item-delete').click(this._deleteItem.bind(this));

        html.find('.dice-roll').click(this._diceRoll.bind(this));

        html.find('.gen-bmc').click(this._generateBmc.bind(this));

        html.find('.refresh-crew').click(this._refreshCrewSheet.bind(this));

        html.find('.atk-roll').click(this._attackRoll.bind(this));

        html.find('.passthru-edit-crew-member').click(this._editCrewMember.bind(this));

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
        let imageSet = "d6";

            
        if (expr === "Reaction Roll") {
            const template = "systems/fiveparsecs/templates/roll/reactionroll.hbs";
            let data = {
                actor:this.actor,
                rollType:"reaction"
            }
            FPRollUtility.reactionRoll(template, data);

        } else if (expr === "custom") {

            const template = "systems/fiveparsecs/templates/roll/customroll.hbs";
            let data = {
                actor:this.actor,
                rollType:"custom"
            };
            // stub
            FPRollUtility.customRoll(template, data); 
        } else {

            const template = "systems/fiveparsecs/templates/roll/basicroll.hbs";

            if(expr === "1d10" ) { 
                imageSet = "d10"; 
            } else if (expr === "1d100") {
                imageSet = "d100";
            }

            let data = {
                actor:this.actor,
                expr:expr,
                rollType:"basic",
                imgs: imageSet
            }
            

            FPRollUtility.basicRoll(template, data);

        }

        // stub

    }

    _attackRoll(event){
        event.preventDefault();
        let element = event.currentTarget;
        let wpn_id = element.dataset.weaponId;
        let data = {};

        const baseDie = "d6";
        const template = "systems/fiveparsecs/templates/roll/attackroll.hbs";

        if(wpn_id === "brawl") {
            
            data = {
                a_name: this.actor.name,
                a_combat: this.actor.data.data.combat,
                w_name: "Brawl",
                w_range: "Melee",
                w_shots: 1,
                w_traits: "",
                w_dmg: "As weapon",
                die: baseDie
            }

        } else {
            
            let selectedWeapon = this.actor.items.filter(item => item.data._id == wpn_id)[0];

            const wName = selectedWeapon.name;
            const wShots = selectedWeapon.data.data.shots;
            const wDmg = selectedWeapon.data.data.damage;
            const wRange = selectedWeapon.data.data.range;
            const wTraits = selectedWeapon.data.data.traits;

         
            // No targeting yet, but target info should probably be obtained here and passed along

            data = {
                a_name: this.actor.name,
                a_combat: this.actor.data.data.data.combat,
                w_name: wName,
                w_range: wRange,
                w_shots: wShots,
                w_traits: wTraits,
                w_dmg: wDmg,
                die: baseDie,
            }
        }

        FPRollUtility.attackRoll(template, data);
        
    }

    _refreshCrewSheet(event){
        event.preventDefault();

        this.actor.sheet.render(true);
    }

    _inlineEditNotes(event){

        event.preventDefault();
        let element = event.currentTarget;

        return this.actor.update({"data.data.notes": element.innerText});

    }

    _inlineEdit(event){

        event.preventDefault();
        let element = event.currentTarget;
        let attribute = element.dataset.field;
        return this.actor.update({[attribute] : element.innerText});

    }

    _editItem(event) {
        event.preventDefault();
        let element = event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
        let crewId = element.closest(".item").dataset.crewId;
       
        let thisCrew = this.actor;
       
        let item = this.actor.items.get(itemId);

        if(element.dataset.type === "crew_actor"){

            const actorToEdit = game.actors.filter(function(actor) { return actor.data._id == crewId; });

            actorToEdit[0].sheet.render(true);

            //todo : update hook check for actor connection to crew, if so, re-render crew sheet using force "false"
            
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

        let d = new Dialog({
          title: "Delete This Item?",
          content: "<p>Are you sure you want to delete this item?</p>",
          buttons: {
           one: {
            icon: '<i class="fas fa-check"></i>',
            label: "Yes",
            callback: () => { this.actor.deleteOwnedItem(itemId); }
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

    _generateBmc(event) {
        event.preventDefault();

        let d = new Dialog({
            title: "Delete This Item?",
            content: "<p>This will add 3 new traits to this character. It will not replace existing traits.</p>",
            buttons: {
             one: {
              icon: '<i class="fas fa-check"></i>',
              label: "Continue",
              callback: () => { return FPProcGen.generateBMC(this.actor).then(bmc => this.actor.createEmbeddedDocuments("Item", bmc.map(i => i.toObject()))); }
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
          
       // return FPProcGen.generateBMC(this.actor).then(bmc => this.actor.createEmbeddedDocuments("Item", bmc.map(i => i.toObject())));

       // FPProcGen.generateBMC(this.actor).then(bmc => Item.create(bmc, {parent: this.actor, renderSheet:true}));
    }

    _buildCrewData(ownedItems) {
       
        let crewRoster = [];
        let gList = [];
        let assignedCrew = ownedItems.filter(function(item) {return item.type == "crew_assignment"});
   
        if (!Array.isArray(assignedCrew) || assignedCrew.length === 0) { console.log("No assigned crew"); return; }


        assignedCrew.forEach(crew => {
            // console.warn("All Actors: ", game.actors);
          
            let crewActor = game.actors.filter(function(actor) {return actor.data._id == crew.data.data.assigned_crew_actorId})[0];
           
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
                mbr_luck: crewActor.data.data.data.luck,
                mbr_xp: crewActor.data.data.data.xp,
                mbr_casualty: crewActor.data.data.data.casualty,
                mbr_captain: crewActor.data.data.data.captain

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
          
        });

        return crewRoster;

    }

    _editCrewMember(event) {
        // event.preventDefault();

        let element = event.currentTarget;
        let passthruAction = element.dataset.crewAction;

        // Pull crew assignment Item ID and get the ID of the related crew member
        let caId = element.closest(".item").dataset.itemId; // not used at this point
        let crewId = element.closest(".item").dataset.crewId;

        let actorToEdit = game.actors.filter(function(actor) { return actor.data._id == crewId; })[0];

        if (passthruAction === "toggle_captain") {
            let setCaptain = actorToEdit.data.data.data.captain;
           
            actorToEdit.update({"data.data.captain":!setCaptain}).then(() => this.actor.sheet.render(true));
        } else if (passthruAction === "toggle_casualty") {
            let setCasualty = actorToEdit.data.data.data.casualty;
            actorToEdit.update({"data.data.casualty":!setCasualty}).then(() => this.actor.sheet.render(true));
        } 
        
        return;
        
    }

    _generateEncounter(e) {
        e.preventDefault();
        return ui.notifications.warn("Non functional until tables are prepared");

        
    }
}