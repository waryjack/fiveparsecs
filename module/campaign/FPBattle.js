export class FPBattle {

    constructor(campaignTurn) {

        this._campaignTurn = campaignTurn;
        this._id = randomId();
        this._name = "";

        this.data = {
            battle_created:false,
            type:"",
            rival_name:"",
            rival_type:"",
            deployment:"",
            objective:"",
            notable_sights:"",
            opposition:{
                num_enemies:0,
                spec_lt_present:0,
                unique_present:0,
                enemy_element:"",
                enemy_element_specific:"",
                basic_weapon:"",
                spec_weapon:""
            },
            outcome:""
        }
    }

    get id() {
        return this._id;
    }

    set name(newName) {
        this._name = newName;
    }

    get name() {
        return this._name;
    }

    generateBattle(battle_type){

    }

    async persistState() {
        // save this battle to game.settings.battles array
    }

}