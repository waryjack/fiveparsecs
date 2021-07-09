export class FPProcGen {

    static async getPostBattleResults(pbData) {
        let rivText = "No changes to your Rivals.";
        let patText = "No changes to your Patrons."; 
        let questText = "No changes to quest status.";
        let payText = "No mission pay determined.";
        let findText = "No battlefield finds.";
        let invText = "Invasion Status: No invasion pending.";
        let campEventText = "No campaign events.";
        let lootText = "No loot.";
    
        rivText = (pbData.rivOutcome != "" && typeof(pbData.rivOutcome !== "undefined")) ? "Rival Status: " + pbData.rivOutcome : rivText;
        patText = (pbData.patOutcome != "" && typeof(pbData.patOutcome !== "undefined")) ? "Patron Status: " + pbData.patOutcome : patText;
        questText = (pbData.qstOutcome != "" && typeof(pbData.qstOutcome !== "undefined")) ? "Quest Status: " + pbData.qstOutcome : questText;
        payText = (pbData.payOutcome != "" && typeof(pbData.payOutcome !== "undefined")) ? "Mission Pay: " + pbData.payOutcome : payText;
        findText = (pbData.findOutcome != "" && typeof(pbData.findOutcome !== "undefined")) ? "Battlefield Finds: "+pbData.findOutcome : findText;
        invText = (pbData.invOutcome != "" && typeof(pbData.invOutcome !== "undefined")) ? "Invasion Status: "+pbData.invOutcome : invText;
        campEventText = (pbData.cevOutcome != "" && typeof(pbData.cevOutcome !== "undefined")) ? "Campaign Event: "+pbData.cevOutcome : campEventText;
        lootText = (pbData.lootOutcome != "" && typeof(pbData.lootOutcome !== "undefined")) ? "Loot: "+ pbData.lootOutcome : lootText;

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