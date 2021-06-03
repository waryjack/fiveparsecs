export class FPActorSheet extends ActorSheet {
    get template() {
        const path = 'systems/fiveparsecs/templates/actor/';
        return `${path}${this.actor.data.type}sheet.hbs`;
    }

    /**
     * @override
     */
     static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        classes: ['fp', 'sheet', 'actor', 'actor-sheet'],
        width: 775,
        height: 200,
        left:120,
        tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheetbody", initial: "main"}],
        dragDrop: [{dragSelector: ".dragline", dropSelector: null}]
        });
    }
    
    /**
     * @override
     */
    getData() {
        const data = deepClone(this.actor.data);

         
         data.config = CONFIG.fiveparsecs; 
         let ownedItems = this.actor.items;
         data.actor = this.actor; 

         return data;
    }
}