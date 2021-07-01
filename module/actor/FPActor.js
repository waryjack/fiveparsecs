import { FPProcGen } from "../utility/FPProcGen.js";
import { FPTurnLogger } from "../utility/FPTurnLogger.js";
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
                        outcome = game.i18n.localize("FP.campaign_turn.flee.flee_fail");
                    } else {
                        outcome = game.i18n.localize("FP.campaign_turn.flee.flee_success");
                    }
                }; break;
            case "rnd-battle":
                {
                    outcome = game.i18n.localize("FP.campaign_turn.flee.flee_either");
                    this.createBattle("invasion", true);
                }; break;
            case "custom-battle":
                {  
                    outcome = game.i18n.localize("FP.campaign_turn.flee.flee_either");
                    this.createBattle("invasion", false);
                }; break;
        }

        this.update({'data.campaign_turn.flee_outcome':outcome});
    }

    handleTravel(action) {
        console.warn("Entered handleTravel");
        let auto = game.settings.get("fiveparsecs", "autoGenerate");
        if(auto){
            FPProcGen.getTravelEvents().then(te => {
                console.warn("ProcGen result for travel: ", te);
                this.update({'data.campaign_turn.travel.travel_event':te});
            });

        } else {
            new Dialog({
                title:game.i18n.localize("FP.campaign_turn.travel.event"),
                content: "<table><tr><th>Travel Event</th><td><input type='text' id='tev' class='fp text-input' style='width:100%' data-dtype='String'/></td></tr></table>",
                buttons: {
                    roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("FP.ui.general.continue"),
                    callback: (html) => {
                    //  console.log("passed html: ", html); 
                        let tev = html.find('#tev').val();
                        
                        return this.update({"data.campaign_turn.travel.travel_event":tev});
                        }
                    },
                    close: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("FP.ui.general.cancel"),
                    callback: () => { console.log("Clicked Cancel"); return; }
                    }
                },
                default: "close"
            }).render(true);
        }
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
        
        let bankBal = this.data.data.credits;
        let currDebt = this.data.data.debt;
        let currHull = this.data.data.hull;
        let maxHull = this.data.data.hullmax;
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

            if (debtPmt > 0) { debtText = game.i18n.localize("FP.campaign_turn.upkeep.upkp_debt_paid"); }
            if (payroll > 0) { payText = `You paid ${payroll} Credits to your crew for their upkeep.`; }
            if (repairs > 0) { repText = `You paid ${repair} Credits toward ship repairs.`; }
            if (med > 0) { medText = `You paid ${med} Credits for medical care for your crew.`; }

            console.warn("New BankBal (totalPmts): ", bankBal, totalPmts);
            this.update({
                "data.debt":currDebt, 
                "data.credits":bankBal, 
                "data.hull":currHull,
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
        let ctFinalArray = [];

        let finalPatronText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.nofind_default");
        let finalTrainText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.notrain_default");
        let finalTradeText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.notrade_default");
        let finalRecruitText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.norecruit_default");
        let finalExploreText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.noexplore_default");
        let finalTrackText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.notrack_default");
        let finalRepairText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.norepair_default");
        let finalDecoyText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.nodecoy_default");
        
        let ctFinalText = "";

        const stdPatronText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.find_sfx");
        const stdTrainText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.train_sfx");
        const stdTradeText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.trade_sfx");
        const stdRecruitText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.recruit_sfx");
        const stdExploreText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.explore_sfx");
        const stdTrackText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.track_sfx");
        const stdRepairText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.repair_sfx");
        const stdDecoyText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.decoy_sfx");

        const join = game.i18n.localize("FP.ui.general.andjoin");

        console.warn("Task Assignments: ", assignments);

        if (autoGen) {
            FPProcGen.getCrewTaskResults(assignments).then(ctr => {
                this.update({"data.campaign_turn.crew_tasks.ct_final_result":ctr});
            });
        } else {
            if (assignments.finders.length) {
                finalPatronText = assignments.finders.join(join) + ((assignments.findOutcome != "" && typeof(assignments.findOutcome !== "undefined")) ? " "+assignments.findOutcome : stdPatronText);
            }
            if (assignments.trainers.length) {
                finalTrainText = assignments.trainers.join(join) + ((assignments.trainOutcome != "" && typeof(assignments.trainOutcome !== "undefined")) ? " "+assignments.trainOucome : stdTrainText);
            }
            if (assignments.traders.length) {
                finalTradeText = assignments.traders.join(join) + ((assignments.tradeOutcome != "" && typeof(assignments.tradeOutcome !== "undefined")) ? " "+assignments.tradeOutcome : stdTradeText);
            }
            if (assignments.recruiters.length) {
                finalRecruitText = assignments.recruiters.join(join) + ((assignments.recruitOutcome != "" && typeof(assignments.recruitOutcome !== "undefined")) ? " "+assignments.tradeOutcome : stdRecruitText);
            }
            if (assignments.explorers.length) {
                finalExploreText = assignments.explorers.join(join) + ((assignments.exploreOutcome != "" && typeof(assignments.recruitOutcome !== "undefined")) ? " "+assignments.exploreOutcome : stdExploreText);
            }
            if (assignments.trackers.length) {
                finalTrackText = assignments.trackers.join(join) + ((assignments.trackOutcome != "" && typeof(assignments.trackOutcome !== "undefined")) ? " "+assignments.trackOutcome : stdTrackText);
            }
            if (assignments.repairers.length) { 
                finalRepairText = assignments.repairers.join(join) + ((assignments.repairOutcome != "" && typeof(assignments.repairOutcome !== "undefined")) ? " "+assignments.repairOutcom : stdRepairText);
            }
            if (assignments.decoys.length) {
                finalDecoyText = assignment.decoys.join(join) + ((assignments.decoyOutcome != "" && typeof(assignments.decoyOutcome !== "undefined")) ? " "+assignments.decoyOutcome : stdDecoyText);
            }
            ctFinalArray.push(finalPatronText,finalTrainText,finalTradeText,finalRecruitText,finalExploreText,
                finalTrackText,finalRepairText,finalDecoyText);
    
            ctFinalText = ctFinalArray.join("<br/>");
            this.update({"data.campaign_turn.crew_tasks.ct_final_result":ctFinalText});
            
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
                return ui.notifications.warn(game.i18n.localize("FP.campaign_turn.battles.foundbyrival_false"));
            }
        } else if (type === "Invasion") {
            this.createBattle("Invasion", false);
        } else if (!autoGen) { // No automatic generation
            this.createBattle(type, false);
        } else {
            new Dialog({
                title:game.i18n.localize("FP.ui.rolldialog.crewsize"),
                content: "<div class='form-group'><table><tr><th>Crew size for this Battle</th><td><input id='crewsize' type='text' value='5' data-dtype='Number'/></td></tr></table></div>",
                buttons: {
                    roll: {
                     icon: '<i class="fas fa-check"></i>',
                     label: game.i18n.localize("FP.ui.general.continue"),
                     callback: (html) => {
                      //  console.log("passed html: ", html); 
                      let crewSize = html.find('#crewsize').val();
                      console.warn("Crewsize: ", crewSize);
                      this.createBattle(type, random, crewSize);
                     }
                    },
                    close: {
                     icon: '<i class="fas fa-times"></i>',
                     label: game.i18n.localize("FP.ui.general.cancel"),
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

        // switch based on random, custom, or known world selection
        switch(random) {
            case 0:
                {

                   /* let itemData = {
                        name: "Random World #" + new Roll("1d999").evaluate({async:false}).result,
                        type: "world"
                    }*/

                    FPProcGen.generateWorld(activeWorldArray).then((worldData) => {
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
                   if(Array.isArray(activeWorldArray) && activeWorldArray.length > 0) {
                        let currentWorld = activeWorldArray[0];
                        console.warn("Current World: ", currentWorld);
                        currentWorld.update({"data.active":false}).then(() => {
                            return Item.create(itemData, {parent:this, renderSheet:true});
                        });
                    } else {
                        return Item.create(itemData, {parent:this, renderSheet:true});
                    }; break;
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

    resetCampaignTurn(log) {

        const blank = this._getBlankCt();
        console.warn("Logging? ", log);
        if (log === "yes") {
            // Check to make sure
            

            FPTurnLogger.logCampaignTurn(this, blank).then(() => {
                let battList = this.items.filter(i => i.type === "battle");
                let jobList = this.items.filter(i => i.type === "patron_job");
                let delIds = [];
                console.warn("jobList: ", jobList);
                battList.forEach(b => {
                    delIds.push(b.data._id);
    
                });
                jobList.forEach(j => {
                    delIds.push(j.data._id);
                }); 
                
                this.deleteEmbeddedDocuments("Item", delIds);
                this.update({"data.campaign_turn":blank});
                this.update({"data.campaign_turn.crew_tasks.ct_final_result":""});
            });
        } else {

            

            let battList = this.items.filter(i => i.type === "battle");
            let jobList = this.items.filter(i => i.type === "patron_job");
            let delIds = [];
            
            battList.forEach(b => {
                delIds.push(b.data._id);

            });
            jobList.forEach(j => {
                delIds.push(j.data._id);
            }); 
            this.update({"data.campaign_turn":blank});
           
           
            this.deleteEmbeddedDocuments("Item", delIds);

                // reset turn data
            
        }
    }

    _getBlankCt() {
        const blank = {
                turn_id:"",
                flee:false,
                flee_outcome:"",
                travel:{
                    traveling:false,
                    travel_event:"",
                    departing:""
                },
                arrival:{
                    followed:false,
                    arrival_complete:false,
                    arriving:""
                },
                upkeep:{
                    debt:false,
                    debt_paid:0,
                    payroll:false,
                    payroll_paid:0,
                    ship_repair:false,
                    repair_cost:0,
                    upkeep_complete:false,
                    upkeep_text:"",
                    debt_text:"",
                    payroll_text:"",
                    repair_text:"",
                    med_text:""
                },
                crew_tasks:{
                    patron_result:"",
                    train_result:"",
                    trade_result:"",
                    recruit_result:"",
                    recruits:0,
                    explore_result:"",
                    track_result:"",
                    decoy_result:"",
                    repair_result:"",
                    ct_final_result:"",
                },
                post_battle:{
                    riv:"",
                    pat:"",
                    qst:"",
                    pay:"",
                    fnd:"",
                    inv:"",
                    cev:"",
                    loot:""
                },
                battles:[],
                jobs:[],
                complete:false,
                logged:false
        }

        return blank;
    }

}