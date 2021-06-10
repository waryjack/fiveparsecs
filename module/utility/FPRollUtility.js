import { FPMessageUtility } from "./FPMessageUtility.js";

export class FPRollUtility {

    static roll(template, data) {

        
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
                      let baseExpr = data.expr;
                      let bonus = html.find('#bonus').val();
                      let malus = html.find('#penalty').val();

                      let finalExpr = baseExpr + "+" + bonus + "+" + malus;

                      let r = new Roll(finalExpr);
                      ///processRoll(r);
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
     * @param {*} template : the hbs file that is the template for the roll dialog
     * @param {*} data : information to render the template with
     * 
     * Creates a dialog for an attack roll, showing weapon, combat value, and 
     */
    static attackRoll(template, data) {

        data.rollType = "attack";

        /*
            data = {
                a_name: this.actor.name,
                a_combat: this.actor.data.data.combat,
                w_name: wName,
                w_range: wRange,
                w_shots: wShots,
                w_traits: wTraits,
                die: baseDie,
                rollType: "attack"

            }

        */
        
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

                      let totalDice = Number(shots) + Number(extraDice);

                      console.warn("combat value: ", data.a_combat);

                      let finalExpr = totalDice + dieType + "+" + data.a_combat + "+" + data.bonus + "+" + data.malus;

                      console.warn("totaldice: ", totalDice);
                      console.warn("finalExpr");
                      let r = new Roll(finalExpr);

                      let rollInfo = FPRollUtility.processRoll(r, data);

                      console.warn("RollINfo from Process Roll: ", rollInfo);
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

        console.warn("Process Roll incoming roll, data", roll, data);

        roll.evaluate({async:false});

        const diceArray = new Array();

        // do a rolltype switch here; build data, and return it?

        switch(data.rollType) {

            case "attack":

                roll.dice.forEach(die => {
                    die.values.forEach(value => diceArray.push(value));
                });

                data.results = diceArray;
                data.roll = roll;
                data.totalMod = Number(data.a_combat) + Number(data.bonus) - Number(data.malus);

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
                roll.toMessage(); break; // placeholder

            default: roll.toMessage(); break;

        }

        // FPMessageUtility.createChatMessage(data, rollType);
       console.log("Finished Roll Process, would return data: ", data);
       return data;

    }


}