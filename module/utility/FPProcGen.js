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

    static async generateBattle(battleType) {

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

        let base_enemies = Number(new Roll("1d6").evaluate({async:false}).result);

        let battleData = {
            type: battleType,
            rival_name: "None",
            rival_type: "None",
            deployment: "Brief engagement",
            objective: "Move through",
            notable_sights: "Documentation",
            complete:false,
            outcome:"unknown",
            opposition: {
                base_number: base_enemies,
                bonus_number: 1,
                specialists: 0,
                uniques: 0,
                element: "Hired Muscle",
                element_subtype: "Guild Troops",
                basic_weapon: "Colony Rifle",
                spec_weapon: "Power Claw"
            }
        }

        return battleData;
    }

}