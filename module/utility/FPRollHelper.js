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

    static reactionRoll(template, data) {
        
        let crew = data.actor;

        const crewMembers = crew.items.filter(item => item.type == "crew_assignment");

        const crewCount = crewMembers.length;

        let expr = crewCount + "d6";


    }


}