import { FPRollUtility } from "../../utility/FPRollUtility.js";
import { FPProcGen } from "../../utility/FPProcGen.js";

export class FPItemSheet extends ItemSheet {

    get template() {
      const path = 'systems/fiveparsecs/templates/item/';
        return `${path}${this.item.data.type}sheet.hbs`; 

    }

    /**
     * @override
     */
     static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        classes: ['fp', 'sheet', 'item', 'item-sheet'],
        width: 500,
        height: 300,
        tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheetbody", initial: "main"}],
        dragDrop: [{dragSelector: ".dragline", dropSelector: null}]
        });
    }
    
    /**
     * @override
     */
     activateListeners(html) {
        super.activateListeners(html);
        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        html.find('.gen-world').click(this._generateWorld.bind(this));

    }

    getData() {
        const data = this.item.data;
        data.item = this.item;
        data.myName = data.myName
        
        data.config = CONFIG.fiveparsecs;
        data.gameActors = game.actors; 

        if (this.item.type == "crew_assignment") {
            data.eligibleCrew = this._getEligibleActors();
        }

        return data;

    }

    _getEligibleActors() {
        let characters = game.actors.filter(function(actor) { return actor.type == "character"});
        let eligibleCrew = [];

        characters.forEach(char => {
            let charData = {
                eligibleName: char.name,
                eligibleId: char.data._id,
            }
            eligibleCrew.push(charData);
        }); 

        return eligibleCrew;
    }

    _generateWorld(e) {
        e.preventDefault();
        return ui.notifications.warn("Non functional until tables are prepared");
        
        return; // stubbing out until the 
        return FPProcGen._generateWorld(this.item).then(o => {

            let finalTraits = o.genTrait_1 + (o.genTrait_2 != "") ? ", " + o.genTrait_2 : "";
            this.item.update({
                              "data.data.traits" : finalTraits,
                              "data.data.licensing": o.licensing,
                              "name": o.genName
                            });
                            
        });
    }
}