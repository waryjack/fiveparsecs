export class FPTurnLogger {

    static async logCampaignTurn(crew, battles, world) {

        const data = crew.data.data.campaign_turn;
        data.numbattles = battles.length;
        




    }

}