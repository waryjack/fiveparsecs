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
        width: 775,
        height: 200,
        left:120,
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
        

         if(this.actor.type == "character") {
            data.weapons = ownedItems.filter(function(item) {return item.type == "weapon"});
            data.gear = ownedItems.filter(function(item) {return item.type == "gear"});
         } 
         
         if (this.actor.type == "crew") {
            data.assignedCrew = this._buildCrewData(ownedItems);
            console.warn("Assigned Crew: ", data.assignedCrew);
         }

         return data;
    }

    _buildCrewData(ownedItems) {

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
                mbr_name: crewActor.name,
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