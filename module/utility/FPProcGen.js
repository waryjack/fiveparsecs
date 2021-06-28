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

    static async generateWorld() {

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
        const pType = pDraw.results[0].data.text;

        // Get Danger Pay
        let dpExpr = "1d10 + " + (pType === "Corporation") ? "1": "0";
        let dpRoll = new Roll(dpExpr).evaluate({async:false});
        let dpDraw = await tblDangerPay.draw({displayChat:false, roll:dpRoll});
        let dpRes = dpDraw.results[0].data.text;

        // Get Time Frame
        let tfExpr = "1d10 + " + (pType === "Secretive Group") ? "1" : "0";
        let tfRoll = new Roll(tfExpr).evaluate({async:false});
        let tfDraw = await tblTimeFrame.draw({displayChat:false, roll:tfRoll});
        let tfRes = tfDraw.results[0].data.text;

        let bhcRoll = parseInt(new Roll("1d10").evaluate({async:false}).result);
        // Get 
        switch(pType){
            case "Corporation": {
                if (bhcRoll >= 5) {
                    let cndDraw = await tblConditions.draw({displayChat:false});
                    cndRes = cndDraw.results[0].data.text;
                }
                if (bhcRoll >= 8) {
                    let hazDraw = await tblHazards.draw({dispalyChat:false});
                    let benDraw = await tblBenefits.draw({displayChat:false});
                    hazRes = hazDraw.results[0].data.text;
                    benRes = benDraw.results[0].data.text;

                }
                break;
            }
            case "Wealthy Individual": {
                if (bhcRoll >= 5) {
                    let benDraw = await tblBenefits.draw({displayChat:false});
                    benRes = benDraw.results[0].data.text;
                }
                if (bhcRoll >= 8) {
                    let hazDraw = await tblHazards.draw({dispalyChat:false});
                    let cndDraw = await tblConditions.draw({displayChat:false});
                    cndRes = cndDraw.results[0].data.text;
                    hazRes = hazDraw.results[0].data.text;
                }
                break;
            }
            case "Secretive Group": {
                if (bhcRoll >= 5) {
                    let hazDraw = await tblHazards.draw({dispalyChat:false});
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
            case "Local Government":
            case "Sector Government":
            case "Private Organization":
            case "Private Organisation": {
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
                outcome:"unknown",
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
    static async getCrewTaskResults(task, crew) {
        let crewTaskResult = "";
        const tblTrade = game.tables.filter(t => t.name === "Trade")[0];
        const tblExplore = game.tables.filter(t => t.name === "Explore")[0];


        switch(task) {
            case "find": {
                let r = new Roll("1d6").evaluate({async:false}).result;
                r = parseInt(r) + crew.length;
                if (r < 5) {
                    crewTaskResult = `No Patrons are looking for a crew to hire. (Roll: ${r})`;
                } else if (r >= 6) {
                    crewTaskResult = `2 Patrons are looking for a crew to hire. (Roll: ${r})`;
                } else {
                    crewTaskResult = `1 Patron is looking for a crew to hire. (Roll: ${r})`;
                }
                break;
            }
            case "trade": {
                let items = [];
                for(let i = 0; i < crew.length; i++){
                    let tradeDraw = await tblTrade.draw({displayChat:false});
                    let tradeItem = tradeDraw.results[0].data.text;
                    items.push(tradeItem);
                }
                crewTaskResult = items.join(" and ");
                break;
            } 
            case "explore": {
                let results = [];
                for(let i = 0; i < crew.length; i++) {
                    let expDraw = await tblExplore.draw({displayChat:false});
                    let expRes = expDraw.results[0].data.text;
                    results.push(expRes);
                }
                crewTaskResult = results.join(" and ");
                break;
                
            }
            case "track": {
                let troll = new Roll("1d6").evaluate({async:false}).result;
                troll = parseInt(troll) + crew.length;
                if (troll >= 6) {
                    crewTaskResult = "discovered one of your Rivals on-planet. (Roll: " + troll +")";
                } else {
                    crewTaskResult = "but did not locate any Rivals on-planet. (Roll: " + troll + ")";
                }
                break;
            }
            case "repair":{
                break; 
            }
        }

        console.warn("FPProcGen Crew Task Results: ", crewTaskResult);
        return crewTaskResult;

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
        // Post Battle Tables
        const tblFinds = game.tables.filter(t => t.name === "Battlefield Finds")[0];

        // Events Tables
        const tblCampEvents = game.tables.filter(t => t.name === "Campaign Events")[0];

        // Loot Tables
        const tblLoot = game.tables.filter(t => t.name === "Loot")[0];
        const tblWeapons = game.tables.filter(t => t.name === "Weapon Category")[0];
        const tblGear = game.tables.filter(t => t.name === "Gear Category")[0];

        // Default Response
        let rivText = "No changes to your Rivals.";
        let patText = "No changes to your Patrons."; 
        let questText = "No changes to quest status.";
        let payText = "No mission pay determined.";
        let findText = "No battlefield finds.";
        let invText = "Invasion Status: No invasion pending.";
        let campEventText = "No campaign events.";
        let lootText = "No loot.";
        let bfRes = "";
     
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

            findText = "Battlefield finds: " + bfRes;
        }

        if (pbData.invasion === "yes") {
            let invEv = 0;
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
                let ltDrawRoll = new Roll("1d100").evaluate({async:false}).result;

                if (ltDrawRoll >= 26 && ltDrawRoll <= 35) {
                    let ltDraw1 = await tblWeapons.draw({displayChat:false});
                    let ltDraw2 = await tblWeapons.draw({displayChat:false});
                    let ltRes1 = ltDraw1.results[0].data.text + " (damaged)";
                    let ltRes2 = ltDraw2.results[0].data.text + " (damaged)";
                    lootArray.push(ltRes1, ltRes2);
                } else if (ltDrawRoll >=46 && ltDrawRoll <= 65) {
                    let ltDraw1 = await tblGear.draw({displayChat:false});
                    let ltDraw2 = await tblGear.draw({displayChat:false});
                    let ltRes1 = ltDraw1.results[0].data.text + " (damaged)";
                    let ltRes2 = ltDraw2.results[0].data.text + " (damaged)";
                    lootArray.push(ltRes1, ltRes2);
                } else {
                    let ltDraw = await tblLoot.draw({displayChat:false, roll:ltDrawRoll});
                    let ltRes = ltDraw.results[0].data.text;
                    lootArray.push(ltRes);
                }
            }

            lootText += lootArray.join(", ");
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