export const preloadHandlebarsTemplates = async function() {
    return loadTemplates([

        //Selects

        "systems/fiveparsecs/templates/partials/battle/battletypeselect.hbs",

        //Campaign Turn Partials for Crew Sheet
        "systems/fiveparsecs/templates/partials/campaign/arrival.hbs",
        "systems/fiveparsecs/templates/partials/campaign/battle.hbs",
        "systems/fiveparsecs/templates/partials/campaign/campaignturn.hbs",
        "systems/fiveparsecs/templates/partials/campaign/crew_tasks.hbs",
        "systems/fiveparsecs/templates/partials/campaign/flee_invasion.hbs",
        "systems/fiveparsecs/templates/partials/campaign/jobs.hbs",
        "systems/fiveparsecs/templates/partials/campaign/travel.hbs",
        "systems/fiveparsecs/templates/partials/campaign/upkeep.hbs",
        "systems/fiveparsecs/templates/partials/campaign/postbattle.hbs",
        "systems/fiveparsecs/templates/partials/campaign/patrontypeselect.hbs",

        // sheet partials
        "systems/fiveparsecs/templates/partials/sheet/dice_roll_block.hbs", 

        // rolls
        

    ]);
}