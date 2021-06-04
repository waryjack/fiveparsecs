export class FPItemSheet extends ItemSheet {

    get template() {
      /*   const path = 'systems/fiveparsecs/templates/item/';
        return `${path}${this.item.data.type}sheet.hbs`; */

        return 'systems/fiveparsecs/templates/item/itemsheet.hbs';

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

        return data;

    }
}