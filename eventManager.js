ig.module(
    'game.managers.eventManager'
)


.requires(
    'impact.game'
)


.defines(function () {


NXEventManager = ig.Class.extend({
    eventListenerMap: null,
    eventQueues: null,
    activeQueueIdx: 0,
 
    
    staticInstantiate: function () {
        if (NXEventManagerSingleton.instance == null) {
            return null;
        }
        else {
        	console.log('Attempted to init another event manager. Returning current event manager instance.');
            return NXEventManagerSingleton.instance;
        }
    },
    
    
    init: function () {
    	assert(NXEventManagerSingleton.instance == null, 'Attempted to create another instance of the Event Manager singleton.');
    	console.log('Event managed init\'d');
    	
        this.eventListenerMap = {};
        this.eventQueues = [new Array(), new Array()];
        this.activeQueueIdx = 0;
        
        NXEventManagerSingleton.instance = this;
    },
    
    
    addListener: function(delegate, eventType) {
        if (this.eventListenerMap[eventType] == null) {
            this.eventListenerMap[eventType] = new Array();
        }
 
        var eventDelegateList = this.eventListenerMap[eventType];
        
        for (var i = 0; i < eventDelegateList.length; i++) {
            if (eventDelegateList[i] === delegate) {
                assert(false, 'Attempted to add the same delegate twice for eventType:' + eventType);
                return;
            }
        }
        
        eventDelegateList.push(delegate);
    }, 
    
    
    // TODO - PD 20150928 - Careful with the removeListener method, we may have to add lazy delete in case
    // The event queue gets modified while its in the update loop. See the UI manager for an example pattern.
    removeListener: function(delegate, eventType) {
        var eventDelegateList = this.eventListenerMap[eventType];
        assert(eventDelegateList != null, 'Attempting to remove listener from delegate list with no events mapped for event type:' + eventType);
        
        for (var i = 0; i < eventDelegateList.length; i++) {
            if (eventDelegateList[i] === delegate) {
                eventDelegateList.splice(i, 1);
                return;
            }
        }
        
        assert(false, 'Attempted to remove nonexistant delegate for event type:' + eventType);
    },
    
    
    triggerEvent: function (eventTriggered) {
        var eventDelegateList = this.eventListenerMap[eventTriggered.eventType];
 
        if (eventDelegateList == null) {
            console.log('Event type: ' + eventTriggered.eventType + ' currently has no listeners');
            return;
        }
        
        for (var i = 0; i < eventDelegateList.length; i++) {
            var delegate = eventDelegateList[i];
            delegate.eventDelegate(eventTriggered);
        }
    },
    
    
    queueEvent: function (eventQueued) {
        if (this.eventListenerMap[eventQueued.eventType] != null) {
            var activeQueue = this.eventQueues[this.activeQueueIdx];
            
            activeQueue.push(eventQueued);
        }
        else {
            console.log('Skipping event:' + eventQueued.eventType + '. No delegates registered');
        }
    },
    
    
    queueEventByType: function (eventTypeQueued) {
        switch (eventTypeQueued) {
            case ig.EVENT_TYPE.PLAYER_ENTERED_BOSS_AREA:
                this.queueEvent(new NXEventPlayerEnteredBossArea());
                break;
            
            case ig.EVENT_TYPE.LOCK_CAMERA:
                this.queueEvent(new NXEventLockCamera());
                break;
                
            case ig.EVENT_TYPE.END_OF_LEVEL_REACHED:
            	this.queueEvent(new NXEventEndOfLevelReached());
	            break;
	            
	        case ig.EVENT_TYPE.BRAWLER_AREA_REACHED:
	        	this.queueEvent(new NXEventBrawlerAreaReached());
	        	break;
            
            default:
                assert(false, 'Could not find event to queue:' + eventTypeQueued);
                break;
        }
    },
    
    
    // abortEvent: function () {} - Not implemented for now
    // checkListener: function () {} - Not implemented for now
    
    
    update: function (dt) {
        var activeQueue = this.eventQueues[this.activeQueueIdx];
        
        // Swap queues and clear new queue out for next use
        this.activeQueueIdx = (this.activeQueueIdx + 1 ) % 2;       // Two active queues for now
        this.eventQueues[this.activeQueueIdx] = new Array();
        
        for (var i = 0; i < activeQueue.length; i++) {
            var eventToProcess = activeQueue[i];
            var eventDelegateList = this.eventListenerMap[eventToProcess.eventType];
            
            assert(eventDelegateList != null, 'EventDelegateList somehow empty in NXEventManager update().');

	        // TODO - PD 20150925 - We should be cautious about events causing listeners to be removed while an event is being processed.
	        // The issue hasn't come up yet, but I've added a new issue to the backlog.
            for (var j = 0; j < eventDelegateList.length; j++) {
                var delegate = eventDelegateList[j];
                delegate.eventDelegate(eventToProcess);
            }
        }
        
        // Implement Lazy delete here
        // for i to eventsToRemove
        // ...
        // end for
    }
    
    
});


// *** Events ***

ig.EVENT_TYPE = {
    'BASE':     0,
    'TEST':     1,
    'PLAYER_GAME_OVER':             10,
    'PLAYER_ENTERED_BOSS_AREA':     11,
    'PLAYER_CONTROL_ACTIVATED':		12,
    
// Rest of original code omitted for simplicity of code sample
// ...


NXEvent = ig.Class.extend({
    eventType: ig.EVENT_TYPE.BASE,
});



NXEventPlayerEnteredBossArea = NXEvent.extend({
   init: function () {
        this.eventType = ig.EVENT_TYPE.PLAYER_ENTERED_BOSS_AREA;
   }    
});



NXEventPlayerControlActivated = NXEvent.extend({
	init: function() {
		this.eventType = ig.EVENT_TYPE.PLAYER_CONTROL_ACTIVATED;
	}
});



NXEventPlayerControlDeactivated = NXEvent.extend({
	init: function() {
		this.eventType = ig.EVENT_TYPE.PLAYER_CONTROL_DEACTIVATED;
	}
});



NXEventGameObjectLeftScreenYBounds = NXEvent.extend({
    entityRef: null,
    
    init: function (entityRef) {
        this.eventType = ig.EVENT_TYPE.GAME_OBJECT_EXITED_Y_BOUNDS;
        this.entityRef = entityRef;
    }
});


// Rest of original code omitted for simplicity of code sample
// ...


NXEventManagerSingleton = {instance:null};
