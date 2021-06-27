import { FPMessageUtility } from "./FPMessageUtility.js";
import { FP } from "../config.js";

export class FPRollUtility {


    static upkeepDialog(template, data) {

        console.warn("upkeep data: ", data); 

        renderTemplate(template, data).then(dlg => {
            new Dialog({
                title: "Upkeep & Payments",
                content: dlg,
                buttons: {
                    roll: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Continue",
                        callback: (html) => {
                            let debtPayment = Number(html.find('#debt-pay').val());
                            let crewPayment = Number(html.find('#crew-pay').val());
                            let repairPayment = Number(html.find('#repair-pay').val());
                            let medPayment = Number(html.find('#med-pay').val());

                            return data.actor.handleUpkeep(debtPayment, crewPayment, repairPayment, medPayment);
                        }
                    },
                    close: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => { console.log("Clicked Cancel"); return; }
                    }


                }


            }).render(true);

        });
    }


    static crewTaskDialog(template, data) {

        console.warn("data to crew tasks: ", data);

        renderTemplate(template, data).then(dlg => {
            new Dialog({
                title: "Crew Tasks",
                content: dlg,
                buttons: {
                    roll: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Continue",
                        callback: (html) => {
                            let taskAssignments = {};
                            taskAssignments.finders = new Array();
                            if (html.find("#finder1").val() != "") { taskAssignments.finders.push(html.find("#finder1").val()); }
                            if (html.find("#finder2").val() != "") { taskAssignments.finders.push(html.find("#finder2").val()); }
                            
                            taskAssignments.trainers = new Array(); 
                            if (html.find("#trainer1").val() != "") { taskAssignments.trainers.push(html.find("#trainer1").val())}
                            if (html.find("#trainer2").val() != "") { taskAssignments.trainers.push(html.find("#trainer2").val())}

                            taskAssignments.traders = new Array();
                            if (html.find("#trader1").val() != "") { taskAssignments.trainers.push(html.find("#trader1").val())}
                            if (html.find("#trader2").val() != "") { taskAssignments.trainers.push(html.find("#trader2").val())}

                            taskAssignments.recruiters = new Array();
                            if (html.find("#recruiter1").val() != "") {taskAssignments.recruiters.push(html.find("#recruiter1").val())}
                            if (html.find("#recruiter2").val() != "") {taskAssignments.recruiters.push(html.find("#recruiter2").val())}

                            taskAssignments.explorers = new Array();
                            if (html.find("#explorer1").val() != "") {taskAssignments.explorers.push(html.find("#explorer1").val())}
                            if (html.find("#explorer2").val() != "") {taskAssignments.explorers.push(html.find("#explorer2").val())}

                            taskAssignments.trackers = new Array();
                            if (html.find("#tracker1").val() != "") {taskAssignments.trackers.push(html.find("#tracker1").val())}
                            if (html.find("#tracker2").val() != "") {taskAssignments.trackers.push(html.find("#tracker2").val())}
                            
                            taskAssignments.repairers = new Array();
                            if (html.find("#repairer1").val() != "") {taskAssignments.repairers.push(html.find("#repairer1").val())}
                            if (html.find("#repairer2").val() != "") {taskAssignments.repairers.push(html.find("#repairer2").val())}

                            taskAssignments.decoys = new Array();
                            if (html.find("#decoy1").val() != "") {taskAssignments.decoys.push(html.find("#decoy1").val())}
                            if (html.find("#decoy2").val() != "") {taskAssignments.decoys.push(html.find("#decoy2").val())}

                            return data.actor.handleCrewTasks(taskAssignments);
                        }
                    },
                    close: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => { console.log("Clicked Cancel"); return; }
                    }


                }


            }).render(true);

        });
    }

    static basicRoll(template, data) {
        /**
         * Data Structure
         * data = {
                actor:this.actor (the actor bound to the sheet)
                expr:expr (the dice expression, from the click handler)
                rollType:"basic"
            }
         */
        
        renderTemplate(template, data).then((dlg) => {
            new Dialog({
                title:"Dice Roll",
                content: dlg,
                buttons: {
                    roll: {
                     icon: '<i class="fas fa-check"></i>',
                     label: "Roll!",
                     callback: (html) => {
                      //  console.log("passed html: ", html); 
                      data.bonus = html.find('#bonus').val();
                      data.malus = html.find('#penalty').val();

                      let finalExpr = data.expr + "+" + data.bonus + "+" + data.malus;

                      let r = new Roll(finalExpr);

                      let rollInfo = FPRollUtility.processRoll(r, data);
                      
                      FPMessageUtility.createChatMessage(rollInfo);
                     }
                    },
                    close: {
                     icon: '<i class="fas fa-times"></i>',
                     label: "Cancel",
                     callback: () => { console.log("Clicked Cancel"); return; }
                    }
                   },
                default: "close"
            }).render(true);

        });
    }

    /**
     * 
     * @param {*} template : the hbs file that is the template for the roll dialog
     * @param {*} data : information to render the template with
     * 
     * Creates a dialog for an attack roll, showing weapon, combat value, and 
     */
    static attackRoll(template, data) {
        /* Incoming argument data:
        
                data.a_name: Actor name
                data.a_combat: actor combat value
                data.w_name: weapon name
                data.w_range: weapon range
                data.w_shots: weapon shots
                data.w_traits: weapon traits
                data.w_dmg: weapon damage value
                data.die: "d6"
                
            }
        */

        data.rollType = "attack";
 
        renderTemplate(template, data).then((dlg) => {
            new Dialog({
                title:"Attack Roll",
                content: dlg,
                buttons: {
                    roll: {
                     icon: '<i class="fas fa-check"></i>',
                     label: "Roll!",
                     callback: (html) => {
                      //  console.log("passed html: ", html); 
                      let dieType = data.die;
                      let shots = data.w_shots;
                      let extraDice = html.find('#extraDice').val();
                      data.bonus = html.find('#bonus').val();
                      data.malus = html.find('#penalty').val();

                      let totalDice = parseInt(shots) + parseInt(extraDice);

                      let finalExpr = totalDice + dieType + "+" + data.a_combat + "+" + data.bonus + "+" + data.malus;

                      let r = new Roll(finalExpr);

                      let rollInfo = FPRollUtility.processRoll(r, data);

                      FPMessageUtility.createChatMessage(rollInfo);
                     }
                    },
                    close: {
                     icon: '<i class="fas fa-times"></i>',
                     label: "Cancel",
                     callback: () => { console.log("Clicked Cancel"); return; }
                    }
                   },
                default: "close"
            }).render(true);

        });
    }

    static reactionRoll(template, data) {
        
        let crew = data.actor;

        const crewMembers = crew.items.filter(item => item.type == "crew_assignment");

        const crewCount = crewMembers.length;

        let expr = crewCount + "d6";


    }

    static customRoll(template, data) {

        data.rollType = "custom"; 

        renderTemplate(template, data).then((dlg) => {
            new Dialog({
                title:"Custom Roll",
                content: dlg,
                buttons: {
                    roll: {
                     icon: '<i class="fas fa-check"></i>',
                     label: "Roll!",
                     callback: (html) => {
                      //  console.log("passed html: ", html); 
                      let numDice = html.find('#cr-num-dice').val();

                      if (numDice < 1) {
                          console.warn("Can't roll fewer than 1 die");
                          numDice = 1;
                      }

                      let baseDice = html.find('#cr-die-type').val();
                      data.bonus = html.find('#bonus').val();
                      data.malus = html.find('#penalty').val();

                      let finalExpr = numDice + baseDice + "+" + data.bonus + "+" + data.malus;

                      let r = new Roll(finalExpr);
                      let rollInfo = FPRollUtility.processRoll(r, data);

                      FPMessageUtility.createChatMessage(rollInfo);
                     }
                    },
                    close: {
                     icon: '<i class="fas fa-times"></i>',
                     label: "Cancel",
                     callback: () => { console.log("Clicked Cancel"); return; }
                    }
                   },
                default: "close"
            }).render(true);

        });




    }

    /**
     * 
     * @param {Roll} roll 
     * @param {object} data : data about the roll based on actor and item stats
     * @returns {object} : data to turn into a chat message
     * 
     * Takes information from a roll dialog and processes the roll and builds a data object 
     * for creation of a custom chat message. The data returned is based on the type of roll (attack, basic roll, etc).
     * 
     * If attack type is unknown, it will default to just outputting the roll as a standard chat message.
     */

    static processRoll(roll, data) {

        roll.evaluate({async:false});

        let diceArray = new Array();
        let diceImageSet = "d6";
        // do a rolltype switch here; build data, and return it?

        switch(data.rollType) {

            case "attack":

                diceArray = FPRollUtility.buildDiceImageArray(roll);

                data.results = diceArray;
                data.roll = roll;
                data.totalMod = parseInt(data.a_combat) + parseInt(data.bonus) - parseInt(data.malus);

             
                break;

            case "custom":
            case "basic":

                if (data.imgs === "d100") {

                    if(roll.total < 10) {
                        let dImgCode = "d10_"+roll.total;
                        diceArray.push(
                            CONFIG.fiveparsecs.DICE_IMAGE.D10.d10_0,
                            CONFIG.fiveparsecs.DICE_IMAGE.D10[dImgCode]);
                    } else {
                        let tensDigit = String(roll.total)[0];
                        let onesDigit = String(roll.total)[1];

                        let tImgCode = "d10_"+tensDigit;
                        let oImgCode = "d10_"+onesDigit;

                        diceArray.push(
                            CONFIG.fiveparsecs.DICE_IMAGE.D10[tImgCode],
                            CONFIG.fiveparsecs.DICE_IMAGE.D10[oImgCode]);

                    }
                } else {
                    diceArray = FPRollUtility.buildDiceImageArray(roll);
                }
                
                data.results = diceArray;
                data.roll = roll;
                data.totalMod = parseInt(data.bonus) - parseInt(data.malus);

                break; // placeholder

            default: roll.toMessage(); break;

        }

        // FPMessageUtility.createChatMessage(data, rollType);
       return data;

    }

    static buildDiceImageArray(roll) {

        let diceImageArray = new Array();

        roll.dice.forEach(die => {

            let configCode = "";
            let imgCode = "";

            switch (die.faces) {
                case 4: configCode = "D4"; imgCode = "d4_"; break;
                case 6: configCode = "D6"; imgCode = "d6_"; break;
                case 8: configCode = "D8"; imgCode = "d8_";break;
                case 10: configCode = "D10"; imgCode = "d10_"; break;
                case 12: configCode = "D12"; imgCode = "d12_"; break;
                case 20: configCode = "D20"; imgCode = "d20_"; break;
            }

            die.values.forEach(value => {
                let imgCodeComplete = imgCode + value;
                let diceImageUrl = CONFIG.fiveparsecs.DICE_IMAGE[configCode][imgCodeComplete];
                
                diceImageArray.push(diceImageUrl);
            });




        });

        return diceImageArray; 

    }


}