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
        width: 480,
        height: 200,
        tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheetbody", initial: "main"}],
        dragDrop: [{dragSelector: ".dragline", dropSelector: null}]
        });
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
}