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

    handleUpkeep(debtPmt, payroll, repairs, med) {
        let totalPmts = debtPmt + payroll + repairs + med;
        
        let bankBal = this.data.data.data.credits;
        let currDebt = this.data.data.data.debt;
        let currHull = this.data.data.data.hull;
        let maxHull = this.data.data.data.hullmax;
        let debtText = "No payments were made on the ship.";
        let payText = "The crew is awaiting payment.";
        let medText = "No medical care payments were made (or none were needed).";
        let repText = "No repairs were paid for (or none were needed).";

        console.warn("totalPmts, bankBal, currDebt, currHull, maxHull: ", totalPmts, bankBal, currDebt, currHull, maxHull);
        if (totalPmts > bankBal) {
             return ui.notifications.warn("You don't have sufficient credits to cover these expenses");
        } else {
            // Ship Debt
            bankBal -= debtPmt;
            currDebt -= debtPmt;
            (currDebt > 0) ? currDebt++ : currDebt = currDebt;
            // Crew Pay
            bankBal -= payroll;
            //Repairs
            bankBal -= repairs;
            let totalHullRepair = repairs + 1;
            currHull = Math.min(currHull + totalHullRepair, maxHull);
            // Medical Treatment
            bankBal -= med; 

            if (debtPmt > 0) { debtText = `You paid ${debtPmt} Credits toward your ship. You still owe ${currDebt} credits.`; }
            if (payroll > 0) { payText = `You paid ${payroll} Credits to your crew for their upkeep.`; }
            if (repairs > 0) { repText = `You paid ${repair} Credits toward ship repairs.`; }
            if (med > 0) { medText = `You paid ${med} Credits for medical care for your crew.`; }

            console.warn("New BankBal (totalPmts): ", bankBal, totalPmts);
            this.update({
                "data.data.debt":currDebt, 
                "data.data.credits":bankBal, 
                "data.data.hull":currHull,
                "data.campaign_turn.upkeep.debt_text":debtText,
                "data.campaign_turn.upkeep.payroll_text":payText,
                "data.campaign_turn.upkeep.repair_text":repText,
                "data.campaign_turn.upkeep.med_text":medText
            });
        }
    
    }

    /**
     * 
     * @param {Object} assignments data indicating which crew members are assigned to which Crew Task
     * @returns notification at this point
     */
    handleCrewTasks(assignments) {
        let autoGen = game.settings.get("fiveparsecs", "autoGenerate");

        let finalPatronText = "Nobody searched for a Patron.";
        let finalTrainText = "Nobody elected to train.";
        let finalTradeText = "No trading was conducted.";
        let finalRecruitText = "No recruiting was done.";
        let finalExploreText = "Nobody explored the area.";
        let finalTrackText = "Nobody looked for Rivals.";
        let finalRepairText = "Nobody repaired gear (or nothing needed repaired).";
        let finalDecoyText = "Nobody acted as a decoy (or no Rivals were in pursuit).";
        
        let findResultsText = ".";
        let tradeResultText = ".";
        let explorResultText = ".";
        let trackResultText = ".";
        let repairResultText = ".";
        let decoyResultText = ".";
        let trainResultText = ".";

        const stdPatronText = " searched for a Patron: ";
        const stdTrainText = " spent time training, and gained 1XP";
        const stdTradeText = " spent time trading: ";
        const stdRecruitText = " looked for new crewmembers to hire";
        const stdExploreText = " explored the area: ";
        const stdTrackText = " tried to track down a Rival: ";
        const stdRepairText = " worked on some broken gear";
        const stdDecoyText = " tried to throw some Rivals off your trail";

        console.warn("Task Assignments: ", assignments);

        if (autoGen) {
            if(assignments.finders.length) {
                FPProcGen.getCrewTaskResults("find", assignments.finders).then(ctr => {
                    console.warn("Finder Results: ", ctr);
                    finalPatronText = assignments.finders.join(" and ") + stdPatronText + ctr;
                    console.warn("finalPatronText within: "); 
                    this.update({"data.campaign_turn.crew_tasks.patron_searchers":finalPatronText})
                });
              
            }
            if (assignments.trainers.length) {
                finalTrainText = assignments.trainers.join(" and ") + stdTrainText;
                this.update({"data.campaign_turn.crew_tasks.trainees":finalTrainText});
            }
            if (assignments.traders.length) {
                
                FPProcGen.getCrewTaskResults("trade", assignments.traders).then(ctr => {
                    console.warn("Trade Results: ", ctr);
                    finalTradeText = assignments.traders.join(" and ") + stdTradeText + ctr;
                    this.update({"data.campaign_turn.crew_tasks.trade_result":finalTradeText});
                })
            }
            if (assignments.recruiters.length) {
                finalRecruitText = assignments.recruiters.join(" and ") + stdRecruitText;
                /* FPProcGen.getCrewTaskResults("recruit", recruiters).then(ctr => {
                    finalRecruitText = assignments.recruiters.join(" and ") + stdRecruitText + ", " + ctr;
                }) */ 
                this.update({"data.campaign_turn.crew_tasks.recruiter":finalRecruitText});
            }
            if (assignments.explorers.length) {
                
                FPProcGen.getCrewTaskResults("explore", assignments.explorers).then(ctr => {
                    console.warn("Explorers Results: ", ctr);
                    finalExploreText = assignments.explorers.join(" and ") + stdExploreText + ctr;
                    this.update({"data.campaign_turn.crew_tasks.explore_result":finalExploreText});
                })
            }
            if (assignments.trackers.length) {
                FPProcGen.getCrewTaskResults("track", assignments.trackers).then(ctr => {
                    finalTrackText = assignments.trackers.join(" and ") + stdTrackText + ctr;
                    this.update({"data.campaign_turn.crew_tasks.track_result":finalTrackText});
                })
                
            }
            if (assignments.repairers.length) { 
                finalRepairText = assignments.repairers.join(" and ") + stdRepairText;
                this.update({"data.campaign_turn.crew_tasks.repair_result":finalRepairText});
            }
            if (assignments.decoys.length) {
                finalDecoyText = assignments.decoys.join(" and ") + stdDecoyText
                this.update({"data.campaign_turn.crew_tasks.decoy_result":finalDecoyText});
            }

            // placeholder; much more complicated crap

        } else {
            if (assignments.finders.length) {
                finalPatronText = assignments.finders.join(" and ") + stdPatronText;
            }
            if (assignments.trainers.length) {
                finalTrainText = assignments.trainers.join(" and ") + stdTrainText;
            }
            if (assignments.traders.length) {
                finalTradeText = assignments.traders.join(" and ") + stdTradeText;
            }
            if (assignments.recruiters.length) {
                finalRecruitText = assignments.recruiters.join(" and ") + stdRecruitText;
            }
            if (assignments.explorers.length) {
                finalExploreText = assignments.explorers.join(" and ") + stdExploreText;
            }
            if (assignments.trackers.length) {
                finalTrackText = assignments.trackers.join(" and ") + stdTrackText;
            }
            if (assignments.repairers.length) { 
                finalRepairText = assignments.repairers.join(" and ") + stdRepairText;
            }
            if (assignments.decoys.length) {
                finalDecoyText = assignment.decoys.join(" and ") + stdDecoyText
            }

            this.update({
                "data.campaign_turn.crew_tasks.patron_searchers":finalPatronText,
                "data.campaign_turn.crew_tasks.trainees":finalTrainText,
                "data.campaign_turn.crew_tasks.trade_result":finalTradeText,
                "data.campaign_turn.crew_tasks.recruiters":finalRecruitText,
                "data.campaign_turn.crew_tasks.explore_result":finalExploreText,
                "data.campaign_turn.crew_tasks.track_result":finalTrackText,
                "data.campaign_turn.crew_tasks.decoy_result":finalDecoyText,
                "data.campaign_turn.crew_tasks.repair_result":finalRepairText,
            });
            
        }
       
    }

    addJob(action, type){

        let autoGen = game.settings.get("fiveparsecs", "autoGenerate");

        if(autoGen){
            FPProcGen.generateJob().then(jobData => {
                let itemData = {
                    name:"Patron Job",
                    type:"patron_job"
                }

                itemData.data = jobData;

                return Item.create(itemData, {parent:this, renderSheet:false});
            });
        } else {
           let itemData = {
                name:"Patron Job",
                type:"patron_job"
            }

            return Item.create(itemData, {parent:this, renderSheet:true});
        }
    }

    addBattle(type, random) {
        const autoGen = game.settings.get("fiveparsecs", "autoGenerate");
        let rivalCheck = new Roll("1d6").evaluate({async:false}).result;
        if (type === "Rival"){
            if (rivalCheck < 3) {
                this.createBattle("Rival", false); // rival battles should be custom setups
            } else {
                return ui.notifications.warn("No Rivals Found You");
            }
        } else if (type === "Invasion") {
            this.createBattle("Invasion", false);
        } else if (!autoGen) { // No automatic generation
            this.createBattle(type, false);
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

        // deactivate current world (only one world is active at a time)
        if(Array.isArray(activeWorldArray) && activeWorldArray.length > 0) {
            let currentWorld = activeWorldArray[0];
            console.warn("Current World: ", currentWorld);
            currentWorld.update({"data.active":false});
        }
     
        

        // switch based on random, custom, or known world selection
        switch(random) {
            case 0:
                {

                   /* let itemData = {
                        name: "Random World #" + new Roll("1d999").evaluate({async:false}).result,
                        type: "world"
                    }*/

                    FPProcGen.generateWorld().then((worldData) => {
                        return Item.create(worldData, {parent:this, renderSheet:false});
                    }); break;
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
                };
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

    postBattle(postData) {

        FPProcGen.getPostBattleResults(postData).then(pb => {
            this.update({
                "data.campaign_turn.post_battle.riv":pb.rivText,
                "data.campaign_turn.post_battle.pat":pb.patText,
                "data.campaign_turn.post_battle.qst":pb.questText,
                "data.campaign_turn.post_battle.pay":pb.payText,
                "data.campaign_turn.post_battle.inv":pb.invText,
                "data.campaign_turn.post_battle.fnd":pb.findText,
                "data.campaign_turn.post_battle.cev":pb.campEventText,
                "data.campaign_turn.post_battle.loot":pb.lootText
            })
        });
    }

    characterEvent() {

    }

    injuryEvent() {

    }


}