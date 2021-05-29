export class FPItemSheet extends ItemSheet {

    get template() {
        const path = 'systems/fiveparsecs/templates/item/';
        return `${path}${this.item.data.type}sheet.hbs`;

    }

    getData() {
        const data = this.item.data;
        data.item = this.item;
        data.myName = data.myName
        
        data.config = CONFIG.fiveparsecs;

        return data;

    }
}