import { FPProcGen } from "../utility/FPProcGen.js";
export class FPActor extends Actor {
    
    /**
     * @override
     */

    prepareBaseData() {
        super.prepareBaseData();
        const actorData = this.data;
        
        if(this.type === "character" || this.type === "enemy") {
            this._prepareCharacterData(actorData);
        } else if (this.type === "crew") {
            this._prepareCrewData(actorData);
        }
    }

    /**
     * @param {@} actorData 
     */
    _prepareCharacterData(actorData) {
        super.prepareDerivedData();
        const data = actorData.data;

    }

    /**
     * 
     * @param {*} actorData 
     */
    _prepareCrewData(actorData) {
        super.prepareDerivedData(); 
        const data = actorData.data;
    }

    // Campaign Turn Methods

    async newCampaignTurn(log) {
        turnData = this.data.data;
        if(log) {
          await logCampaign(turnData);
          //clear journal info here
        } else {
            // clear journal info 
        }

    }

    handleFleeInvasion(action){
        let outcome = "";

        
        switch(action) {
            case "flee-invasion":
                {
                    let r = new Roll("2d6").evaluate({async:false}).result;
                    if (r < 8) {
                        outcome = "Unable to escape invading forces!";
                    } else {
                        outcome = "Successfully escaped invading forces!";
                    }
                }; break;
            case "rnd-battle":
                {
                    outcome = "Unable to escape / chose to stay and fight.";
                    this.createBattle("invasion", true);
                }; break;
            case "custom-battle":
                {  
                    outcome = "Unable to escape / chose to stay and fight."
                    this.createBattle("invasion", false);
                }; break;
        }

        this.update({'data.campaign_turn.flee_outcome':outcome});
    }

    handleTravel(action) {

    }

    handleArrival(action) {
        let follow = new Roll("1d6").evaluate({async:false}).result;
        console.warn("Arrival Follow Check result: ", follow);
        if (follow > 5) {
            this.data.data.campaign_turn.arrival.followed = true;
        }
        switch(action) {
            case "arrive-rnd-world": {
                this.createWorld(0);
            }; break;
            case "arrive-custom-world":{
                this.createWorld(1);
            }; break;
            case "arrive-known-world":{
                this.createWorld(2);
            }; break;
        }

        this.update({"data.campaign_turn.arrival.followed":true})
    }

    handleUpkeep(action) {

    }

    handleCrewTask(action) {

    }

    addJob(action, type){
        return ui.notifications.warn("Not implemented yet");
    }

    addBattle(type, random) {
        let rivalCheck = new Roll("1d6").evaluate({async:false}).result;
        if (type === "Rival"){
            if (rivalCheck < 3) {
                this.createBattle("Rival", false); // rival battles should be custom setups
            } else {
                return ui.notifications.warn("No Rivals Found You");
            }
        } else if (type === "Invasion") {
            this.createBattle("Invasion", false);
        } else {
            new Dialog({
                title:"Crew Size",
                content: "<div class='form-group'><table><tr><th>Crew size for this Battle</th><td><input id='crewsize' type='text' value='5' data-dtype='Number'/></td></tr></table></div>",
                buttons: {
                    roll: {
                     icon: '<i class="fas fa-check"></i>',
                     label: "Roll!",
                     callback: (html) => {
                      //  console.log("passed html: ", html); 
                      let crewSize = html.find('#crewsize').val();
                      console.warn("Crewsize: ", crewSize);
                      this.createBattle(type, random, crewSize);
                     }
                    },
                    close: {
                     icon: '<i class="fas fa-times"></i>',
                     label: "Cancel",
                     callback: () => { console.log("Clicked Cancel"); return; }
                    }
                   },
                default: "close"
            }).render(true);
        }
    }

    /**
     * 
     * @param {Int} random 0 = random world; 1 = custom world; 2 = return to known world
     */
    createWorld(random) {
        // Get the active world
        let activeWorldArray = this.items.filter(i => i.type === "world" && i.data.data.active);

        if(Array.isArray(activeWorldArray) && activeWorldArray.length > 0) {
            let currentWorld = activeWorldArray[0];
            console.warn("Current World: ", currentWorld);
            currentWorld.update({"data.active":false});
        }
        // set it to Inactive
        

        // switch based on random, custom, or known world selection
        switch(random) {
            case 0:
                {
                    let itemData = {
                        name: "Random World #" + new Roll("1d999").evaluate({async:false}).result,
                        type: "world"
                    }

                    FPProcGen.generateWorld().then((worldData) => itemData.data = worldData);
                    console.warn("Generated world data: ", itemData);
                    return Item.create(itemData, {parent:this, renderSheet:false});
                }
            case 1:
                {
                    let itemData = {
                        name: "New World",
                        type: "world",
                        data: {
                            active:true
                        }
                    }
                   console.warn("Custom world data: ", itemData);
                    return Item.create(itemData, {parent:this, renderSheet:true});
                }
            case 2:
                {
                    // dialog to select existing world here
                    return ui.notifications.warn("Not yet implemented");
                }
            
        }
    }

    /**
     * Creates a random or custom battle item to be added to the campaign turn
     * 
     * @param {String} type the type of battle being fought (invasion, rival, patron, etc.)
     * @param {Boolean} random if true, generates a random battle; if false, opens the Item sheet for battles to custom-create
     * @returns 
     */
    createBattle(type, random, crewsize){
        if(random){
            let itemData = {
                name: type + " Battle",
                type: "battle",
                data: {}
            }

                // return ui.notifications.warn("Generate Random Battle Here");
                FPProcGen.generateBattle(type, crewsize).then(battleData => {
                    itemData.data = battleData;
                    return Item.create(itemData, {parent:this, renderSheet:false});
                });
          
        } else {
            let itemData  = {
                name: type + " Battle",
                type: "battle"
            }
            return Item.create(itemData, {parent: this, renderSheet:true});
        }
    }

}