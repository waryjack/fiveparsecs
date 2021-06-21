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
            name: "Example random active world",
            type: "",
            data:{
                data:{
                    active:true,
                    licensing:true,
                    invaders:"Scary Aliens",
                    invasion_progress:"Impending",
                    traits:"Sample, example, demonstration"
                }
            }
        }

        return worldData;
    }

    static async generateBattle() {

        // build encounter data
        // create new encounter
        // output to chat and create journal entry? 

        return {};
    }

}