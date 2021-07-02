export class FPTurnLogger {

    static async logCampaignTurn(crew, blank) {

        
        const data = crew.data.data.campaign_turn;
        console.warn("Logger data: ", data);
        console.warn("Logger just one data: ", crew.data.campaign_turn);
        let battleTextArray = [];
        let jobTextArray = [];

        let world = crew.items.filter(i => i.type === "world" && i.data.data.active)[0];
        let battles = crew.items.filter(i => i.type === "battle");
        let jobs = crew.items.filter(i => i.type === "patron_job");
        let numBattles = battles.length;
        let numJobs = jobs.length;

        battles.forEach(b => {
            battleTextArray.push(`<b>${game.i18n.localize("FP.log.battle")}</b>: ${b.data.data.type} 
                                    / ${game.i18n.localize("FP.log.obj")}: ${b.data.data.objective} 
                                    / ${game.i18n.localize("FP.log.oppo")}: ${b.data.data.opposition.element_subtype} (${b.data.data.opposition.element}) 
                                    / ${game.i18n.localize("FP.log.outcome")} ${b.data.data.outcome}`);
        });

        jobs.forEach(j => {
            let job_done = (j.data.data.complete) ? "Yes" : "No";
            jobTextArray.push(`<b>${game.i18n.localize("FP.log.patron")}</b>: ${j.data.data.patron_type}
                                 / ${game.i18n.localize("FP.log.dpay")}: ${j.data.data.danger_pay} 
                                 / ${game.i18n.localize("FP.log.time")}: ${j.data.data.time_frame} 
                                 / ${game.i18n.localize("FP.log.bhc")}: ${j.data.data.benefits}, ${j.data.data.hazards}, ${j.data.data.conditions} 
                                 / ${game.i18n.localize("FP.log.done")}: ${job_done}`);
        });

        let finalBattleText = battleTextArray.join("<br/>");
        let finalJobText = jobTextArray.join("<br/>");
        let journalEntryHtml = game.i18n.format("FP.log.log_block",
                                                {
                                                    fledInv:data.flee_outcome,
                                                    travel_event:data.travel.travel_event,
                                                    thisWorld:world.name,
                                                    thisWorldTraits:world.data.data.traits,
                                                    thisWorldLicensing:world.data.data.licensing,
                                                    debt_text:data.upkeep.debt_text,
                                                    payroll_text:data.upkeep.payroll_text,
                                                    repair_text:data.upkeep.repair_text,
                                                    med_text:data.upkeep.med_text,
                                                    ct_final_text:data.crew_tasks.ct_final_text,
                                                    jobcount:numJobs,
                                                    joblog:finalJobText,
                                                    battcount:numBattles,
                                                    battlog:finalBattleText,
                                                    riv:data.post_battle.riv,
                                                    pat:data.post_battle.pat,
                                                    inv:data.post_battle.inv,
                                                    cev:data.post_battle.cev,
                                                    loot:data.post_battle.loot
                                                });
        
        let loggedEntry = {
            name: crew.name + " Campaign Log: " + world.name,
            content: journalEntryHtml,
        }
        //const entry = new JournalEntryData(loggedEntry);
        // crew.update({"data.campaign_turn":blank});
        return JournalEntry.create(loggedEntry); 




    }

}
