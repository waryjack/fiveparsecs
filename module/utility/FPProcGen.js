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
        if (game.settings.get("FP", "Wild Galaxy")) { newTrait_2 = await worldTraits.draw({displayChat:false}); }
        newName = await planetNames.draw({displayChat:false});

        if (licenseRoll > 4) { licenseReqd = true; }

        generatedTraits = {
            genName: newName,
            genTrait_1: newTrait_1,
            genTrait_2: newTrait_2,
            genLicensing: licenseReqd
        }

    }

    static async generateWorld() {
        //sample placeholder 
        let worldData = {
                    active:true,
                    licensing:true,
                    invaders:"Scary Aliens",
                    invasion_progress:"Impending",
                    traits:"Sample, example, demonstration"
            
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

        let base_enemies = 0;
        let bonus_enemies = "As enemy type";
        let specs = 0;
        let uniques = 0;
        let enemyCount = 0;
        let rivalAttackType = "N/A";
        let uniqueType = "";
        // Battle Table Setup

        console.warn("BattleType: ", battleType);

        const tblRivalAttack = game.tables.filter(table => table.name === "Rival Attack Type")[0];
        const tblUniques = game.tables.filter(table => table.name === "Unique Individuals")[0];
        
        const tblSights = game.tables.filter(table => table.name === `Notable Sights-${battleType}`)[0];
        const tblEnemyCat = game.tables.filter(table => table.name === `Opposition-${battleType}`)[0];
        const tblDeploy = game.tables.filter(table => table.name === `Deployment-${battleType}`)[0];
        const tblObjective = game.tables.filter(table => table.name === `Objective-${battleType}`)[0];        

        console.warn("Enemy Category Table: ", tblEnemyCat);
        const enemyCat = await tblEnemyCat.draw({displayChat:false});
        let enemyCatText = enemyCat.results[0].data.text;
        console.warn("Enemy Category: ", enemyCatText);
        const tblEnemySubtype = game.tables.filter(table => table.name === enemyCatText)[0];
        
        // Draw info from the random tables

        let deployCond = await tblDeploy.draw({displayChat:false});
        let sights = await tblSights.draw({displayChat:false});
        let objective = await tblObjective.draw({displayChat:false});
        let enemySubCat = await tblEnemySubtype.draw({displayChat:false});
       
        deployCond = deployCond.results[0].data.text;
        sights = (battleType != "Invasion") ? sights.results[0].data.text : "None";
        objective = objective.results[0].data.text;
        enemySubCat = enemySubCat.results[0].data.text;

        if (crewsize < 5) {
            base_enemies = new Roll("2d6kl1").evaluate({async:false}).result;
        } else if (crewsize > 5) {
            base_enemies = new Roll("2d6kh1").evaluate({async:false}).result;
        } else {
            base_enemies = new Roll("1d6").evaluate({async:false}).result;
        }

        enemyCount = base_enemies; // convenience redundancy

        if (enemyCount < 3) {
            specs = 0;
        } else if (enemyCount > 6) {
            specs = 2;
        } else {
            specs = 1;
        }

        if (battleType != "invasion" && enemyCat != "Roving Threats") {
            const uniqueCheck = new Roll("2d6").evaluate().result;
            if(uniqueCheck > 8) {
                uniques = 1;
                uniqueType = await tblUniques.draw({displayChat:false});
                uniqueType = uniqueType.results[0].data.text;
            }
        }

        console.warn("Draws: ", deployCond, objective, sights, enemyCat, enemySubCat, uniqueType);

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
                    element: enemyCat,
                    element_subtype: enemySubCat
            }
            
        }

        return battleData;
    }

}