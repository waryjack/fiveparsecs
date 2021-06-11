import { FPMessageUtility } from "./FPMessageUtility.js";
import { FP } from "../config.js";

export class FPRollUtility {

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

                      console.warn("combat value: ", data.a_combat);

                      let finalExpr = totalDice + dieType + "+" + data.a_combat + "+" + data.bonus + "+" + data.malus;

                      console.warn("totaldice: ", totalDice);
                      console.warn("finalExpr");
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
                      }

                      let baseDice = html.find('#cr-die-type').val();
                      let bonus = html.find('#bonus').val();
                      let malus = html.find('#penalty').val();

                      let finalExpr = numDice + baseDice + "+" + bonus + "+" + malus;

                      let r = new Roll(finalExpr);
                      r.evaluate({async:false});
                      r.toMessage();
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

        const diceArray = new Array();
        let diceImageSet = "d6";
        // do a rolltype switch here; build data, and return it?

        switch(data.rollType) {

            case "attack":

               /* roll.dice.forEach(die => {
                    die.values.forEach(value => diceArray.push(value));
                }); */

                roll.dice.forEach(die => {
                    die.values.forEach(value => {
                        let dImgCode = "d6_"+value;
                        let diceImageUrl = CONFIG.fiveparsecs.DICE_IMAGE.D6[dImgCode];
                        
                        diceArray.push(diceImageUrl);
                    });
                });

                data.results = diceArray;
                data.roll = roll;
                data.totalMod = parseInt(data.a_combat) + parseInt(data.bonus) - parseInt(data.malus);

                /* What does data look like? 
                    data = {
                        a_name: this.actor.name,
                        a_combat: this.actor.data.data.combat,
                        w_name: wName,
                        w_range: wRange,
                        w_shots: wShots,
                        w_traits: wTraits,
                        die: baseDie,
                        rollType: "attack",
                        results: diceArray,
                        roll: roll
                */
                break;

            case "basic":

                /**
                 * let data = {
                    actor:this.actor,
                    expr:expr,
                    rollType:"basic"
                }
                */

                if(data.imgs === "d6") {
                   

                    roll.dice.forEach(die => {
                        die.values.forEach(value => {
                            let dImgCode = "d6_"+value;
                            let diceImageUrl = CONFIG.fiveparsecs.DICE_IMAGE.D6[dImgCode];
                            
                            diceArray.push(diceImageUrl);
                        });
                    });
                    /*
                    roll.dice.forEach(die => {
                        die.values.forEach(value => {
                            diceArray.push(value);
                        });
                    });
                    */
                } else if (data.imgs === "d10") {

                    roll.dice.forEach(die => {
                        die.values.forEach(value => {
                            let dImgCode = "d10_"+value;
                            let diceImageUrl = CONFIG.fiveparsecs.DICE_IMAGE.D10[dImgCode];
                            
                            diceArray.push(diceImageUrl);
                        });
                    });
                } else if (data.imgs === "d100") {

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


}