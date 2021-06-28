export class FPTurnLogger {

    static async logCampaignTurn(crew) {

        const data = crew.data.data.campaign_turn;
        
        let battleTextArray = [];
        let jobTextArray = [];

        let world = crew.items.filter(i => i.type === "world" && i.data.data.active)[0];
        let battles = crew.items.filter(i => i.type === "battle");
        let jobs = crew.items.filter(i => i.type === "patron_job");
        let numBattles = battles.length;
        let numJobs = jobs.length;

        battles.forEach(b => {
            battleTextArray.push(`<b>Battle</b>: ${b.data.data.type} / Objective: ${b.data.data.objective} / Opposition: ${b.data.data.opposition.element_subtype} / Outcome ${b.data.data.outcome}`);
        });

        jobs.forEach(j => {
            jobTextArray.push(`<b>Patron</b>: ${j.data.data.patron_type} / Danger Pay: ${j.data.data.danger_pay} / Time Frame: ${j.data.data.time_frame} / BHC: ${j.data.data.benefits}, ${j.data.data.hazards}, ${j.data.data.conditions}`);
        });

        let finalBattleText = battleTextArray.join("<br/>");
        let finalJobText = jobTextArray.join("<br/>");

        let journalEntryHtml = `<h2>Travel</h2>
                                <strong>Event: </strong>${data.travel.travel_event}
                                <h2>Arrival</h2>
                                <ul>
                                <li>World: ${world.name}</li>
                                <li>Traits: ${world.data.data.traits}</li>
                                <li>Licensing: ${world.data.data.licensing}</li>
                                </ul>
                                <h2>Upkeep</h2>
                                <ul>
                                <li>Debt: ${data.upkeep.debt_text}</li>
                                <li>Payroll: ${data.upkeep.payroll_text}</li>
                                <li>Ship Repairs: ${data.upkeep.repair_text}</li>
                                <li>Medical Care: ${data.upkeep.med_text}</li>
                                </ul>
                                <h2>Crew Tasks</h2>
                                <ul>
                                <li>Patron Search: ${data.crew_tasks.patron_searchers}</li>
                                <li>Training: ${data.crew_tasks.trainees}</li>
                                <li>Trading: ${data.crew_tasks.trade_result}</li>
                                <li>Recruiting: ${data.crew_tasks.trade_result}</li>
                                <li>Exploring: ${data.crew_tasks.explore_result}</li>
                                <li>Repairing Gear: ${data.crew_tasks.repair_result}</li>
                                <li>Tracking Rivals: ${data.crew_tasks.track_result}</li>
                                <li>Decoying Rivals: ${data.crew_tasks.decoy_result}</li>
                                </ul>
                                <h2>Patron Jobs</h2>
                                <p>The crew had ${numJobs} patron jobs available:</p>
                                <p>${finalJobText}</p>
                                <h2>Missions & Battles</h2>
                                <p>The crew had ${numBattles} missions they could pursue: </p>
                                <p>${finalBattleText}</p>
                                <h2>Post-Battle Report</h2>
                                <ul>
                                <li>Rival Status: ${data.post_battle.riv}</li>
                                <li>Patron Status: ${data.post_battle.pat}</li>
                                <li>Quest Status: ${data.post_battle.qst}</li>
                                <li>${data.post_battle.pay}</li>
                                <li>${data.post_battle.fnd}</li>
                                <li>${data.post_battle.inv}</li>
                                <li>${data.post_battle.cev}</li>
                                <li>${data.post_battle.loot}</li>
                                </ul>`;

        
        let loggedEntry = {
            name: "Campaign Log: " + world.name,
            content: journalEntryHtml,
        }
        //const entry = new JournalEntryData(loggedEntry);

        return JournalEntry.create(loggedEntry); 




    }

}
