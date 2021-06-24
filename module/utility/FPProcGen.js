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

}