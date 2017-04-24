/**
 * Created by setve on 05/04/2017.
 */
var socket = io();

var pause = false;


document.querySelector('#videoPlayer').addEventListener('play', translateAudio);
document.querySelector('#videoPlayer').addEventListener('pause', onPause);
window.addEventListener('unload', onPause);
document.querySelector('#videoPlayer').seeked = skipping;

socket.on('done', function (text) {
    if (!(text.text === "")) {
        document.querySelector('#transcript').innerHTML = text.text
    }
});

function skipping() {
    socket.emit('continue', {
        src: "public/media/Hagefest i Slottsparken- Velkomsttale - Kong Harald.mp4",
        time: document.querySelector('#videoPlayer').currentTime
    });
}

function onPause() {
    socket.emit('pause')
}

function translateAudio() {
    if (pause == false) {
        pause = true;
        socket.emit('translate', {
                src: "public/media/Hagefest i Slottsparken- Velkomsttale - Kong Harald.mp4",

            }
        );
    }

    else {
        console.log("du forsatte spelinga")
        socket.emit('continue', {
                src: "public/media/Steve Jobs Inspirational Speech - 1 Minute Motivation.mp4",
                time: document.querySelector('#videoPlayer').currentTime
            }
        );
    }
}
