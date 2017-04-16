// Original code omitted for simplicity of code sample
// ...

    eventDelegate: function(eventData) {
        switch (eventData.eventType) {
            case ig.EVENT_TYPE.GAME_OBJECT_EXITED_Y_BOUNDS:
            	console.log('exited y bounds');
                this.sendMessage(ig.BASE_ENTITY_MSGS.EXITED_SCREEN_Y_BOUNDS);
                break;
                
            case ig.EVENT_TYPE.PLAYER_CONTROL_ACTIVATED:
            	ig.game.inputManager.addObserver(this.platformPhysics, this.platformPhysics.processInput);
            	break;
            	
            case ig.EVENT_TYPE.PLAYER_CONTROL_DEACTIVATED:
            	ig.game.inputManager.removeObserver(this.platformPhysics, this.platformPhysics.processInput);
            	break;
            
            default:
                break;
        }
    }
