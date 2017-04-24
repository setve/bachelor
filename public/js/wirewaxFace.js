/**
 * Created by setve on 20/04/2017.
 */
window.wirewax.playerId = "video";

window.playVideo = function(){
    window.wirewax.triggerEvent(window.wirewax.events.triggers.PLAY);
}

window.pauseVideo = function(){
    window.wirewax.triggerEvent(window.wirewax.events.triggers.PAUSE);
}

window.seekVideo = function(){
    window.wirewax.triggerEvent(window.wirewax.events.triggers.SEEK, 20);
}

window.getCurrentTime = function(){
    window.wirewax.triggerEvent(window.wirewax.events.triggers.GET_CURRENT_TIME);
}

window.wirewax.addEventListener(window.wirewax.events.listeners.TAG_CLICK, function(data){
    console.log(data.data.tagData);
});

window.wirewax.addEventListener(window.wirewax.events.listeners.HAS_SEEKED, function(data){
    console.log(data);
});

window.wirewax.addEventListener(window.wirewax.events.listeners.RETURN_CURRENT_TIME, function(data){
    window.alert(data.data.currentTime);
});