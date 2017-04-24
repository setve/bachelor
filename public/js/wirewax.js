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
    var json = JSON.parse(data.data);
    console.log(json);
    if(json['speechKeywords'] != null) {
        var heading = document.createElement("h3");
        heading.innerHTML = "Speech keywords";
        document.querySelector("#json").appendChild(heading);
        let length = (json['speechKeywords']['length']);
        for(let i=0;i<length;i++){
            var text = document.createElement("li");
            text.innerHTML = json['speechKeywords'][i]['text'];
            document.querySelector("#json").appendChild(text);
//8056206console.log(json['speechKeywords'][i]['text'],json['speechKeywords'][i]['time']);
        }
    }
    if(json['textKeywords'] != null){
        var heading = document.createElement("h3");
        heading.innerHTML = "Text keywords";
        document.querySelector("#json").appendChild(heading);
        for(let i=0;i<length;i++){
            var text = document.createElement("li");
            text.innerHTML = json['textKeywords'][i]['text'];
            document.querySelector("#json").appendChild(text);
//8056206console.log(json['speechKeywords'][i]['text'],json['speechKeywords'][i]['time']);
        }
    }

});

socket.on('gotFaceResult', function (data) {
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
    socket.emit('getToken', {})
}

function getIdList() {
    socket.emit('getIdList', {
        token: localStorage.getItem('token')
    })
}

function showResultID() {

    var id = document.querySelector("#id").value;

    socket.emit('showResultWirewax', {
        data: "http://hobnob.wirewax.com/public/video/" + id,
        token: localStorage.getItem("token")
    })
}

function showFaceData() {

    var id = document.querySelector("#faceId").value;

    socket.emit('showResultWirewax', {
        data: "http://hobnob.wirewax.com/video/" + id + "/faces",
        token: localStorage.getItem("token")
    })
}

function startAnalyzing() {

      var data = {
            url: player.getVideoUrl(),
            token: localStorage.getItem('token')
        };

    socket.emit('startAnalyzingWirewax', {
        data: data
    })

}

function setVideo() {
    document.querySelector("#player").src = "https://www.youtube.com/embed/" + document.querySelector("#link").value
}

function showTimestampOnVideo(data) {
    player.seekTo(data)
}

document.querySelector("#getIdButton").addEventListener('click', getIdList);
document.querySelector("#faceButton").addEventListener('click', showFaceData);
document.querySelector("#setButton").addEventListener('click', setVideo);
document.querySelector("#startButton").addEventListener('click', startAnalyzing);
document.querySelector("#setIdButton").addEventListener('click', showResultID);
document.querySelector("#toggleButton").addEventListener('click', () => {drawToggle = !drawToggle});
window.addEventListener("load", startUp);
window.addEventListener("load", setupCanvas);
