import { FPBattle } from "./FPBattle.js";
import { FPJob } from "./FPJob.js";
import { FPWorld } from "./FPWorld.js";

export class FPCampaignTurn {

    constructor(sheet) {
        this._sheet = sheet;
        this._id = randomID();
        this._name = "";
        this.data = {
            world:"",
            fleeing:false,
            travel:{
                completed:false,
                event:""
            },
            arrival:{
                rival_followed:"unknown"
            },
            upkeep:{
                crew_paid:false,
                debt_paid:false
            },
            crew_tasks:{
                patron_found:false,
                patron_count:0,
                trained:false,
                traded:false,
                recruited:false,
                explored:false,
                tracked_rivals:false,
                decoyed_rivals:false,
                repaired:false
            },
            jobs:[],
            assigned_equipment:false,
            rumors:{
                checked_rumors:false,
                gained_quest:false
            },
            rival_attack:{
                checked_rival_attack:false,
                rivals_attack:false
            },
            battles:[]
        };     
    }

    /**
     * Getters & Setters
     */

    get id() {
        return this._id;
    }

    get sheet() {
        return this._sheet;
    }

    get name() {
        return this._name;
    }

    set name(newName) {
        this._name = newName;
    }

    addBattle() {
        let battle = new FPBattle(this._id);
        this.data.battles.push(battle.getId());
    }

    /**
     * Saves current state of the campaign turn to game.settings for persistence.
     */

    async persistState() {
        

    }

}




