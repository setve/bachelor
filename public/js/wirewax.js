/**
 * Created by setve on 05/04/2017.
 */
var socket = io();

var player

var drawToggle = false;

socket.on('gotToken', function (data) {
    console.log('Token', data.token);
    localStorage.setItem("token", data.token);
})

socket.on('doneAnalyzing', function (data) {
    console.log("ferdig å senda videoen til analysering", data)
});

socket.on('connected', function () {
    console.log("socket id", socket.id)
});

socket.on('gotResult', function (data) {

    console.log(data);

    var json = JSON.parse(data.data)
    var tekst = document.createElement("p")
    tekst.innerHTML = JSON.stringify(json)
    document.querySelector("#json").appendChild(tekst)
    showTimestampOnVideo(json)
});

socket.on('gotFaceResult', function (data) {
    console.log("got face", data);
    var json = JSON.parse(data.data)
    localStorage.setItem('faceData', JSON.stringify(json.faces))
    var tekst = document.createElement("p")
    tekst.innerHTML = JSON.stringify(json.faces)
    json.faces.forEach(function (el) {
        console.log(el)
    });
    document.querySelector("#json").appendChild(tekst)

});

function draw(event) {
    console.log(drawToggle)
    if (drawToggle) {
        console.log("draw", event.data)
        if (event.data == 1) {
            var faceData = JSON.parse(localStorage.getItem('faceData'));
            console.log("started draw", faceData)
            var placeCounter = 0;
            var canvasHolder = document.querySelector('#myCanvas').getContext('2d');
            var intervalId = window.setInterval(function () {
                console.log("in loop", placeCounter)
                if (faceData[placeCounter].timeIn.toFixed(2) == player.getCurrentTime().toFixed(2)) {
                    canvasHolder.clearRect(0, 0, document.querySelector('#myCanvas').width, document.querySelector('#myCanvas').height);
                    // Do the drawing stuff 340 240
                    canvasHolder.strokeRect(faceData[placeCounter].x[0] * 330, faceData[placeCounter].y[0] * 230, faceData[placeCounter].w[0] * 250, faceData[placeCounter].h[0] * 550)
                    console.log("start draw", faceData[placeCounter].x[0], faceData[placeCounter].y[0], faceData[placeCounter].w[0], faceData[placeCounter].h[0])
                    canvasHolder.strokeStyle = 'red';
                    var drawCounter = 0;
                    // var animationId = requestAnimationFrame( function () {

                    /*var internalIntervalId=setInterval(function() {
                     //console.log("for each", drawCounter);
                     canvasHolder.clearRect(0, 0, document.querySelector('#myCanvas').width, document.querySelector('#myCanvas').height);
                     canvasHolder.strokeRect(faceData[placeCounter].x[drawCounter] * 400, faceData[placeCounter].y[drawCounter] * 225, faceData[placeCounter].w[drawCounter] * 250, faceData[placeCounter].h[drawCounter] * 500)
                     if (drawCounter == faceData[placeCounter].x.length-1)
                     clearInterval(internalIntervalId)
                     drawCounter++
                     }, 1000/24);*/

                    // if (faceData[placeCounter].x[drawCounter].length-1 == drawCounter)
                    //     console.log("stoppa")
                    //     cancelAnimationFrame(animationId)
                    //  drawCounter++
                    //})
                    //Move to next Object or stop the loop
                    if (placeCounter == faceData.length - 1) {
                        clearInterval(intervalId)
                    }
                    placeCounter++;
                }
            }, 1)


        }
    }
}

function setupCanvas(canvas, ctx, width, height, options) {
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.style.position = 'absolute';
    for (let property in options) {
        if (options.hasOwnProperty(property)) {
            canvas.style[property] = options[property];
        }
    }
    if (window.devicePixelRatio > 1) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
}

function startUp() {

    setupCanvas(document.querySelector('#myCanvas'), document.querySelector('#myCanvas').getContext('2d'), 400, 300)
    player = new YT.Player('player', {
        videoId: 'i2_6L7u578Q',
        events: {
            'onStateChange': draw
        }
    });
    console.log("Hallo")
    socket.emit('getToken', {})
}

function getIdList() {
    console.log("show")
    socket.emit('getIdList', {
        token: localStorage.getItem('token')
    })
}

function showResultID() {
    console.log("show Result")

    var id = document.querySelector("#id").value;

    socket.emit('showResultWirewax', {
        data: "http://hobnob.wirewax.com/public/video/" + id,
        token: localStorage.getItem("token")
    })
}

function showFaceData() {
    console.log("show Face")

    var id = document.querySelector("#faceId").value;

    socket.emit('showResultWirewax', {
        data: "http://hobnob.wirewax.com/video/" + id + "/faces",
        token: localStorage.getItem("token")
    })
}

function startAnalyzing() {

    var data;

    if (document.querySelector("#player").src == "https://www.youtube.com/embed/MeTQplAmuTU") {
        data = {
            url: "https://www.youtube.com/watch?v=MeTQplAmuTU",
            token: localStorage.getItem('token')
        };
    }
    else {
        data = {
            token: localStorage.getItem('token'),
            url: "https://www.youtube.com/watch?v=" + document.querySelector("#link").value
        };
    }

    socket.emit('startAnalyzingWirewax', {
        data: data
    })

}

function setVideo() {
    document.querySelector("#player").src = "https://www.youtube.com/embed/" + document.querySelector("#link").value
}

document.querySelector("#getIdButton").addEventListener('click', getIdList);
document.querySelector("#faceButton").addEventListener('click', showFaceData);
document.querySelector("#setButton").addEventListener('click', setVideo);
document.querySelector("#startButton").addEventListener('click', startAnalyzing);
document.querySelector("#setIdButton").addEventListener('click', showResultID);
document.querySelector("#toggleButton").addEventListener('click', () => {drawToggle = !drawToggle});
window.addEventListener("load", startUp);
window.addEventListener("load", setupCanvas);

function showTimestampOnVideo(data) {
    let time = parseInt(data['textKeywords'][49]['time']);
    document.querySelector("#player").src = "https://www.youtube.com/embed/T84se4fc4KU?start=" + time;

}