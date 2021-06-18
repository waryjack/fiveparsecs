export class FPJob {

    constructor() {
        this._id = randomId();
        this._name = "";
        this.data = {
            patron_type:"",
            danger_pay:"",
            time_frame:"",
            benefits:"",
            hazards:"",
            conditions:""
        };
    }


    get id() {
        return this._id;
    }

    generateJob() {


    }

}