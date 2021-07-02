export class FPProcGen {



    static async generateBMC(actor) {
        const bmcArray = new Array();
        const bg = game.tables.filter(table => table.name === "Backgrounds")[0];
        const mo = game.tables.filter(table => table.name === "Motivations")[0];
        const cl = game.tables.filter(table => table.name === "Class")[0];

        if(bg === undefined || mo === undefined || cl === undefined) {
            return ui.notifications.error("You must create tables for Backgrounds, Motivations, and Class before using this feature.")
        }
        let newBg = await bg.draw({displayChat:false});
        let newMo = await mo.draw({displayChat:false});
        let newCl = await cl.draw({displayChat:false});
        
        bmcArray.push(
            game.items.filter(item => item.data._id === newBg.results[0].data.resultId)[0], 
            game.items.filter(item => item.data._id === newMo.results[0].data.resultId)[0],
            game.items.filter(item => item.data._id === newCl.results[0].data.resultId)[0]    
        );
      
        
        return bmcArray;

    }

    static async generateWorldTraits(world) {
        let generatedTraits = {};
        let licenseRoll = new Roll("1d6").evaluate().result;
        let licenseReqd = false;
        let newTrait_1 = "";
        let newTrait_2 = "";
        let newName = "";

        const worldTraits = game.tables.filter(t => t.name === "World Traits")[0];
        const planetNames = game.tables.filter(t => t.name === "Planet Names")[0];

        if(worldTraits === undefined || planetNames === undefined) {
            return ui.notifications.error("You must create tables titled World Traits and Planet Names to automatically generate world traits");
        }
        
        newTrait_1 = await worldTraits.draw({displayChat:false});
        newTrait_2 = await worldTraits.draw({displayChat:false});
        // if (game.settings.get("FP", "Wild Galaxy")) { newTrait_2 = await worldTraits.draw({displayChat:false}); }
        newName = await planetNames.draw({displayChat:false});

        if (licenseRoll > 4) { licenseReqd = true; }

        generatedTraits = {
            genName: newName.results[0].data.text,
            genTrait_1: newTrait_1.results[0].data.text,
            genTrait_2: newTrait_2.results[0].data.text,
            genLicensing: licenseReqd
        }

        return generatedTraits;

    }

    static async generateWorld(activeWorldArray) {

        // deactivate current world
        if(Array.isArray(activeWorldArray) && activeWorldArray.length > 0) {
            let currentWorld = activeWorldArray[0];
            console.warn("Current World: ", currentWorld);
            await currentWorld.update({"data.active":false});
        }

        // create world traits
        let genWorldStats = await FPProcGen.generateWorldTraits();

        //sample placeholder 
        let worldData = {
            name: genWorldStats.genName,
            type: "world",
            data:{
                active:true,
                licensing:genWorldStats.genLicensing,
                invaders:"None",
                inv_progress:"N/A",
                traits: genWorldStats.genTrait_1 + ", " + genWorldStats.genTrait_2
            }
        }

        return worldData;
    }

    static async generateJob() {
        const tblPatron = game.tables.filter(t => t.name === "Patron")[0];
        const tblDangerPay = game.tables.filter(t => t.name === "Danger Pay")[0];
        const tblTimeFrame = game.tables.filter(t => t.name === "Time Frame")[0];
        const tblBenefits = game.tables.filter(t => t.name === "Benefits")[0];
        const tblHazards = game.tables.filter(t => t.name === "Hazards")[0];
        const tblConditions = game.tables.filter(t => t.name === "Conditions")[0];
        let cndRes = "None";
        let benRes = "None";
        let hazRes = "None";

        // Get Patron Type
        const pDraw = await tblPatron.draw({displayChat:false});
        console.log("patron table draw: ", pDraw);
        const pType = pDraw.results[0].data.text;
        const pRoll = pDraw.roll.total;

        // Get Danger Pay
        let dpExpr = "1d10 + " + (pRoll <= 2) ? "1": "0";
        let dpRoll = new Roll(dpExpr).evaluate({async:false});
        let dpDraw = await tblDangerPay.draw({displayChat:false, roll:dpRoll});
        let dpRes = dpDraw.results[0].data.text;

        // Get Time Frame
        let tfExpr = "1d10 + " + (pRoll === 10) ? "1" : "0";
        let tfRoll = new Roll(tfExpr).evaluate({async:false});
        let tfDraw = await tblTimeFrame.draw({displayChat:false, roll:tfRoll});
        let tfRes = tfDraw.results[0].data.text;

        let bhcRoll = parseInt(new Roll("1d10").evaluate({async:false}).result);
        // Get 
        switch(pType){
            case 1:
            case 2: {
                if (bhcRoll >= 5) {
                    let cndDraw = await tblConditions.draw({displayChat:false});
                    cndRes = cndDraw.results[0].data.text;
                }
                if (bhcRoll >= 8) {
                    let hazDraw = await tblHazards.draw({displayChat:false});
                    let benDraw = await tblBenefits.draw({displayChat:false});
                    hazRes = hazDraw.results[0].data.text;
                    benRes = benDraw.results[0].data.text;

                }
                break;
            }
            case 6:
            case 7: {
                if (bhcRoll >= 5) {
                    let benDraw = await tblBenefits.draw({displayChat:false});
                    benRes = benDraw.results[0].data.text;
                }
                if (bhcRoll >= 8) {
                    let hazDraw = await tblHazards.draw({displayChat:false});
                    let cndDraw = await tblConditions.draw({displayChat:false});
                    cndRes = cndDraw.results[0].data.text;
                    hazRes = hazDraw.results[0].data.text;
                }
                break;
            }
            case 10: {
                if (bhcRoll >= 5) {
                    let hazDraw = await tblHazards.draw({displayChat:false});
                    hazRes = hazDraw.results[0].data.text;
                }
                if (bhcRoll >= 8) { 
                    let cndDraw = await tblConditions.draw({displayChat:false});
                    let benDraw = await tblBenefits.draw({displayChat:false});
                    benRes = benDraw.results[0].data.text;
                    cndRes = cndDraw.results[0].data.text;
                }
                break;
            }
            default: {
                if (bhcRoll >= 8) { 
                    let cndDraw = await tblConditions.draw({displayChat:false});
                    let benDraw = await tblBenefits.draw({displayChat:false});
                    let hazDraw = await tblHazards.draw({displayChat:false});
                    hazRes = hazDraw.results[0].data.text;
                    benRes = benDraw.results[0].data.text;
                    cndRes = cndDraw.results[0].data.text;
                }
                break;
            }
        }

        let jobData = {
            patron_type:pType,
            danger_pay:dpRes,
            time_frame:tfRes,
            benefits:benRes,
            hazards:hazRes,
            conditions:cndRes
        }

        return jobData;
    }

    static async generateBattle(battleType, crewsize) {

        // Battle Template

        /* "battle":{
            "type":"",
            "rival_name":"",
            "rival_type":"",
            "deployment":"",
            "objective":"",
            "notable_sights":"",
            "complete":false,
            "outcome":"",
            "opposition":{
                "base_number":0,
                "bonus_number":0,
                "specialists":0,
                "uniques":0,
                "element":"",
                "element_subtype":"",
                "basic_weapon":"",
                "spec_weapon":""
            }
        } */ 

        // Initialize basic variables
        console.warn("Battletype: ", battleType);
        let base_enemies = 0;
        let bonus_enemies = "As enemy type";
        let specs = 0;
        let uniques = 0;
        let enemyCount = 0;
        let rivalAttackType = "N/A";
        let uniqueType = "";
        let deployCond = "";
        let sights = "";
        let objective = "";
        let enemySubCat = "";
        let enemyCatText = "";
        
        
        // Get tables for random draws
        // const tblRivalAttack = game.tables.filter(table => table.name === "Rival Attack Type")[0];
        const tblUniques = game.tables.filter(table => table.name === "Unique Individuals")[0];
        
        const tblSights = game.tables.filter(table => table.name === `Notable Sights-${battleType}`)[0];
        const tblEnemyCat = game.tables.filter(table => table.name === `Opposition-${battleType}`)[0];
        const tblDeploy = game.tables.filter(table => table.name === `Deployment-${battleType}`)[0];
        const tblObjective = game.tables.filter(table => table.name === `Objective-${battleType}`)[0];   
        console.warn("enemy cat table: ", tblEnemyCat);     
        let ec = await tblEnemyCat.draw({displayChat:false});
        enemyCatText = ec.results[0].data.text;
        const tblEnemySubtype = game.tables.filter(table => table.name === enemyCatText)[0];
        
        // Make random draws, resolve to text results
        let dc = await tblDeploy.draw({displayChat:false});
        deployCond = dc.results[0].data.text;
        console.warn("Deploy Cond: ", deployCond);
        let ns = await tblSights.draw({displayChat:false})
        sights = ns.results[0].data.text;
        let ob = await tblObjective.draw({displayChat:false});
        objective = ob.results[0].data.text;
        let es = await tblEnemySubtype.draw({displayChat:false})
        enemySubCat = es.results[0].data.text;

        const enemyDetails = enemySubCat.split("/");
        let enemySpecificType = enemyDetails[0];
        let enemyNumbers = enemyDetails[1];

       

       
        sights = (battleType != "Invasion") ? sights : "None";
      
        // Determine base size of enemy squad
        if (crewsize < 5) {
            base_enemies = new Roll("2d6kl1").evaluate({async:false}).result;
        } else if (crewsize > 5) {
            base_enemies = new Roll("2d6kh1").evaluate({async:false}).result;
        } else {
            base_enemies = new Roll("1d6").evaluate({async:false}).result;
        }

       
        
        enemyCount = Number(base_enemies) + Number(enemyNumbers); // placeholding; might later do calcs based on enemies
        console.log("Base, Bonus, Final: ", base_enemies, enemyNumbers, enemyCount);
        // Determine number of specialists / lieutenants
        if (enemyCount < 3) {
            specs = 0;
        } else if (enemyCount > 6) {
            specs = 2;
        } else {
            specs = 1;
        }

        // Determine unique enemy presence
        if (battleType != "invasion" && enemyCatText != "Roving Threats") {
            const uniqueCheck = new Roll("2d6").evaluate().result;
            if(uniqueCheck > 8) {
                uniques = 1;
                let ut = await tblUniques.draw({displayChat:false})
                uniqueType = ut.results[0].data.text;
            }
        }

        // Create data for battle
        let battleData = {
        
                type: battleType,
                rival_name: "None",
                rival_attack_type: rivalAttackType,
                deployment: deployCond,
                objective: objective,
                notable_sights: sights,
                complete:false,
                outcome:"Unfought",
                opposition: {
                    base_number: enemyCount,
                    bonus_number: bonus_enemies,
                    specialists: specs,
                    uniques: uniques,
                    unique_type: uniqueType,
                    element: enemyCatText,
                    element_subtype: enemySpecificType
            }
            
        }

        /*
        let battleData = {
        
            type: "Patron",
            rival_name: "None",
            rival_attack_type: "N/A",
            deployment: "No Condition",
            objective: "Defend",
            notable_sights: "Documentation",
            complete:false,
            outcome:"unknown",
            opposition: {
                base_number: 4,
                bonus_number: 0,
                specialists: 0,
                uniques: 0,
                unique_type: "",
                element: "Criminal Element",
                element_subtype: "Starport Scum"
            }
        
        } */

        return battleData;
    }

    /**
     * 
     * @param {String} task the specific type of task, so it knows what to do!
     * @param {Array} crew the crew member names performing the task
     */
    static async getCrewTaskResults(assignments) {
        // text constants
        let autoGen = game.settings.get("fiveparsecs", "autoGenerate");
        let ctFinalArray = [];
        let ctFinalResultText = "";

        let finalPatronText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.nofind_default");
        let finalTrainText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.notrain_default");
        let finalTradeText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.notrade_default");
        let finalRecruitText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.norecruit_default");
        let finalExploreText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.noexplore_default");
        let finalTrackText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.notrack_default");
        let finalRepairText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.norepair_default");
        let finalDecoyText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.nodecoy_default");
       
        const stdPatronText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.find_sfx");
        const stdTrainText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.train_sfx");
        const stdTradeText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.trade_sfx");
        const stdRecruitText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.recruit_sfx");
        const stdExploreText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.explore_sfx");
        const stdTrackText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.track_sfx");
        const stdRepairText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.repair_sfx");
        const stdDecoyText = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.decoy_sfx");

        const join = game.i18n.localize("FP.ui.general.andjoin");
        
        const tblTrade = game.tables.filter(t => t.name === "Trade")[0];
        const tblExplore = game.tables.filter(t => t.name === "Explore")[0];

        if(assignments.finders.length) {
            let r = new Roll("1d6").evaluate({async:false}).result;
            let ftr = "";
            r = parseInt(r) + assignments.finders.length;
            if (r < 5) {
                ftr = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.nopat") + r + ")";
            } else if (r >= 6) {
                ftr = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.onepat") + r + ")";
            } else {
                ftr = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.twopat") + r + ")";
            }
            finalPatronText = assignments.finders.join(join) + stdPatronText + ftr;
        }

        if (assignments.trainers.length) {
            finalTrainText = assignments.trainers.join(join) + stdTrainText;
        } 

        if (assignments.traders.length) {
            let items = [];
            let ttr = "";
                for(let i = 0; i < assignments.traders.length; i++){
                    let tradeDraw = await tblTrade.draw({displayChat:false});
                    let tradeItem = tradeDraw.results[0].data.text;
                    items.push(tradeItem);
                }
            ttr = items.join(game.i18n.localize("FP.ui.general.andjoin"));
            finalTradeText = assignments.traders.join(join) + stdTradeText + ttr;
        }

        if (assignments.recruiters.length) {
            finalRecruitText = assignments.recruiters.join(join) + stdRecruitText;
        }

        if (assignments.explorers.length) {
             let results = [];
             let etr = "";
                for(let i = 0; i < assignments.explorers.length; i++) {
                    let expDraw = await tblExplore.draw({displayChat:false});
                    let expRes = expDraw.results[0].data.text;
                    results.push(expRes);
                }
                etr = results.join(game.i18n.localize("FP.ui.general.andjoin"));
                finalExploreText = assignments.explorers.join(join) + stdExploreText + etr;
        }

        if (assignments.trackers.length) {
            let troll = new Roll("1d6").evaluate({async:false}).result;
            let tkr = "";
            troll = parseInt(troll) + assignments.trackers.length;
            if (troll >= 6) {
                tkr = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.foundrival") + troll +")";
            } else {
                tkr = game.i18n.localize("FP.campaign_turn.crew_tasks.gen.foundnorival") + troll + ")";
            }
            
                finalTrackText = assignments.trackers.join(join) + stdTrackText + tkr;
        }

        if (assignments.repairers.length) { 
            finalRepairText = assignments.repairers.join(join) + stdRepairText;
        }
        if (assignments.decoys.length) {
            finalDecoyText = assignments.decoys.join(join) + stdDecoyText
        }

        ctFinalArray.push(finalPatronText,finalTrainText,finalTradeText,finalRecruitText,finalExploreText,
            finalTrackText,finalRepairText,finalDecoyText);

        let ctFinalText = ctFinalArray.join("<br/>");
        let safeText = new Handlebars.SafeString(ctFinalText);
        console.warn("SafeString, ctFinalText ", safeText.string, ctFinalText);
        // this.update({"data.campaign_turn.crew_tasks.ct_final_result":ctFinalText});

        console.warn("FPProcGen Crew Task Results: ", ctFinalText);
        return ctFinalText;

    }
    

    static async getTravelEvents() {
        
        
            const tblTravel = game.tables.filter(t => t.name === "Travel Events")[0];

            let teDraw = await tblTravel.draw({displayChat:false});
            console.warn("Travel Event Draw Roll Value: ", teDraw.roll.total);
            let teRes = teDraw.results[0].data.text;
            console.warn("teRes: ", teRes);
            return teRes;
       
    }

    static async getPostBattleResults(pbData) {
        let auto = game.settings.get("fiveparsecs", "autoGenerate");
        let rivText = "No changes to your Rivals.";
        let patText = "No changes to your Patrons."; 
        let questText = "No changes to quest status.";
        let payText = "No mission pay determined.";
        let findText = "No battlefield finds.";
        let invText = "Invasion Status: No invasion pending.";
        let campEventText = "No campaign events.";
        let lootText = "No loot.";
        let bfRes = "";
        let invEv = 0;

        if(auto){
            // Post Battle Tables
            const tblFinds = game.tables.filter(t => t.name === "Battlefield Finds")[0];

            // Events Tables
            const tblCampEvents = game.tables.filter(t => t.name === "Campaign Events")[0];

            // Loot Tables
            const tblLoot = game.tables.filter(t => t.name === "Loot")[0];
            const tblWeapons = game.tables.filter(t => t.name === "Weapon Category")[0];
            const tblGear = game.tables.filter(t => t.name === "Gear Category")[0];

            // Default Response
           
        
            if (pbData.rival === "yes") {
                let rr = new Roll("1d6").evaluate({async:false}).result;
                rr = parseInt(rr) + parseInt(pbData.rivbonus);
                if (pbData.existingRival) {
                    if (rr >= 4) {
                        rivText = "This Rival has had enough. You can remove them from your rivals list.";
                    }
                } else {
                    if (rr == 1) {
                        rivText = "You have gained a Rival on this planet.";
                    }
                }
            }

            if (pbData.patron === "yes") {
                patText = "You have gained a Patron on this planet.";
            }

            if (pbData.quest === "yes") {
                let qr = new Roll("1d6").evaluate({async:false}).result;
                qr = parseInt(qr) + parseInt(pbData.questbonus);

                if (qr <= 3) {
                    questText = "Quest Update: This was a dead end."
                } else if (qr > 3 && qr < 7) {
                    questText = "Quest Update: You are closer to the end of your quest (Gain 1 Quest Rumor).";
                } else {
                    questText = "Quest Update: Your next Quest mission will conclude your current quest.";
                }
            }

            if (pbData.getPaid === "yes") {
                let pr = "";
                if (pbData.questfinal) {
                    pr = new Roll("2d6kh").evaluate({async:false}).result;
                    pr = parseInt(pr) + parseInt(pbData.paybonus);
                } else {
                    pr = new Roll("1d6").evaluate({async:false}).result;
                    pr = parseInt(pr) + parseInt(pbData.paybonus);
                }

                payText = "Mission Pay: You earn " + pr + " Credits in mission pay. Remember to add Danger Pay and other bonuses when updating your Credit balance.";
            }

            if (pbData.finds === "yes") {
                let bfDraw = await tblFinds.draw({displayChat:false});
                bfRes = bfDraw.results[0].data.text;
                if ((bfDraw.total >= 26 && bfDraw.total <= 35) && pbData.invthreat) {
                    invEv = 1;
                }
                findText = "Battlefield finds: " + bfRes;
            }

            if (pbData.invasion === "yes") {
                
                let ir = new Roll("2d6").evaluate({displayChat:false}).result;

                ir = parseInt(ir) + parseInt(pbData.invbonus) + invEv;
                if (ir >= 9) {
                    invText = "Invasion Status: Invasion imminent! (Roll: " + ir + ")";
                } else {
                    invText = invText + "(Roll: " + ir +")";
                }
            }

            if (pbData.campevent === "yes") {
                let ceDraw = await tblCampEvents.draw({displayChat:false});
                let ceRes = ceDraw.results[0].data.text;
                campEventText = "Campaign Event: " + ceRes;
            }

            if (pbData.loot === "yes") {
                lootText = "Loot: ";
                let lootArray = [];
                for(let i = 0; i < parseInt(pbData.lootrolls); i++) {
                    // let ltDraw = await tblLoot.draw({displayChat:false});
                    let ltDrawRoll = new Roll("1d100").evaluate({async:false});
                    let ltr = ltDrawRoll.result;
                    console.warn("Loot table roll: ", ltDrawRoll, ltr);
                    if (ltr >= 26 && ltr <= 35) {
                        let ltDraw1 = await tblWeapons.draw({displayChat:false});
                        let ltDraw2 = await tblWeapons.draw({displayChat:false});
                        console.warn("Loot Table Draw: ", ltDraw1, ltDraw2);
                        let ltRes1 = ltDraw1.results[0].data.text + " (damaged)";
                        let ltRes2 = ltDraw2.results[0].data.text + " (damaged)";
                        lootArray.push(ltRes1, ltRes2);
                    } else if (ltr >=36 && ltr <= 45) {
                        let ltDraw1 = await tblGear.draw({displayChat:false});
                        let ltDraw2 = await tblGear.draw({displayChat:false});
                        console.warn("Loot Table Draw: ", ltDraw1, ltDraw2);
                        let ltRes1 = ltDraw1.results[0].data.text + " (damaged)";
                        let ltRes2 = ltDraw2.results[0].data.text + " (damaged)";
                        lootArray.push(ltRes1, ltRes2);
                    } else {
                        let ltDraw = await tblLoot.draw({displayChat:false, roll:ltDrawRoll});
                        console.warn("Loot Table Draw: ", ltDraw);
                        let ltRes = ltDraw.results[0].data.text;
                        lootArray.push(ltRes);
                    }
                }

                lootText += lootArray.join(", ");
            }
        } else {
        
            rivText = (pbData.rivOutcome != "" && typeof(pbData.rivOutcome !== "undefined")) ? "Rival Status: " + pbData.rivOutcome : rivText;
            patText = (pbData.patOutcome != "" && typeof(pbData.patOutcome !== "undefined")) ? "Patron Status: " + pbData.patOutcome : patText;
            questText = (pbData.qstOutcome != "" && typeof(pbData.qstOutcome !== "undefined")) ? "Quest Status: " + pbData.qstOutcome : questText;
            payText = (pbData.payOutcome != "" && typeof(pbData.payOutcome !== "undefined")) ? "Mission Pay: " + pbData.payOutcome : payText;
            findText = (pbData.findOutcome != "" && typeof(pbData.findOutcome !== "undefined")) ? "Battlefield Finds: "+pbData.findOutcome : findText;
            invText = (pbData.invOutcome != "" && typeof(pbData.invOutcome !== "undefined")) ? "Invasion Status: "+pbData.invOutcome : invText;
            campEventText = (pbData.cevOutcome != "" && typeof(pbData.cevOutcome !== "undefined")) ? "Campaign Event: "+pbData.cevOutcome : campEventText;
            lootText = (pbData.lootOutcome != "" && typeof(pbData.lootOutcome !== "undefined")) ? "Loot: "+ pbData.lootOutcome : lootText;
        }

        let afterActionReport = {
            rivText: rivText,
            patText: patText,
            questText: questText,
            payText: payText,
            findText: findText,
            invText: invText,
            campEventText: campEventText,
            lootText: lootText
        }

        return afterActionReport;
    }

}