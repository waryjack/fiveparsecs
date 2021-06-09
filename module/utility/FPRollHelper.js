export class FPRollHelper {

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

    static attackRoll(template, data) {
        
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
                      let die = data.die;
                      let shots = data.shots;
                      let extraDice = html.find('#extraDice').val();
                      let bonus = html.find('#bonus').val();
                      let malus = html.find('#penalty').val();
                      let totalDice = Number(shots) + Number(extraDice);

                      let finalExpr = totalDice + die + "+" + bonus + "+" + malus;

                      let r = new Roll(finalExpr);

                      FPRollHelper.processRoll(r, data.weapon, finalExpr);
                     /*  r.evaluate({async:false});

                      const rDice = r.dice;
                      const diceArray = new Array();
              
                      rDice.forEach((die) => {
              
                          die.values.forEach(value => diceArray.push(value));
                          
                      });
              
                      console.warn(diceArray.toString());
              
                      r.toMessage(); */
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

    static processRoll(r, weapon, shots, rollType) {

        r.evaluate({async:false});

        const rDice = r.dice;
        const diceArray = new Array();

        if(rollType === "attack") {
            rDice.forEach((die) => {

                die.values.forEach(value => diceArray.push(value));
                
            });
        }

        console.warn(diceArray.toString());

        let data = {
            results: diceArray,
            roll: r,
            shots: shots,
            rollType: rollType
        }


        // FPMessageUtility.createChatMessage(data, rollType);
        r.toMessage();

    }


}