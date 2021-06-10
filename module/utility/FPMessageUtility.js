export class FPMessageUtility {
    
    /* What does data look like? 

    Attack Roll:   data = {
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
                    }

    Basic Roll:     data = {}
    */

    static createChatMessage(data) {

        
        const path = 'systems/fiveparsecs/templates/message/';
        let template = `${path}${data.rollType}_chat_message.hbs`;

            renderTemplate(template, data).then((msg)=>{
                ChatMessage.create({
                    user: game.user._id,
                    roll: data.roll,
                    type:CONST.CHAT_MESSAGE_TYPES.ROLL,
                    speaker: ChatMessage.getSpeaker(),
                    content: msg
                });
                
            });


    }
}