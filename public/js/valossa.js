/**
 * Created by setve on 05/04/2017.
 */
var socket = io();

var player;

socket.on('doneAnalyzing', function (data) {
    console.log("ferdig å senda videoen til analysering")
    localStorage.setItem("ID", data.ID)
});

socket.on('connected', function () {
    console.log(socket.id)
});

socket.on('gotStatus', function (data) {
    var json = JSON.parse(data.data)
    console.log('duidcbduwbuyo', json)
    var tekst = document.createElement("p")
    tekst.innerHTML = JSON.stringify(json.status)
    document.querySelector("#json").appendChild(tekst)

});

socket.on('gotResult', function (data) {
    var json = JSON.parse(data.data)
    console.log(json)

    var text = document.createElement("p")
    text.innerHTML = 'Example of result from the analyzes: '
    document.querySelector("#json").appendChild(text)

    for (a = 0; a <= 10; a++) {
        var text = document.createElement("p")
        text.innerHTML = JSON.stringify(json.detections[a+1].label);
        document.querySelector("#json").appendChild(text)
    }

    var peopleArray = new Array(json.detections.length);
    for (var ele in json.detections) {
        if (json.detections[ele] != null && json.detections[ele].a && json.detections[ele].a.similar_to) {
            peopleArray[ele] = json.detections[ele]
            //console.log(json.detections[ele])
        }
    }
    localStorage.setItem('people', JSON.stringify(peopleArray))
    console.log(JSON.parse(localStorage.getItem('people')))
});

function skipTo(e) {
    player.seekTo(e.valueOf().toElement.value)
    console.log(e.valueOf().toElement.value)


}

function searchPeople() {
    var searchResult = document.querySelector('#search').value.toLowerCase();
    var names = JSON.parse(localStorage.getItem('people'))
    var divElement = document.querySelector("#json")

    while (divElement.firstChild) {
        divElement.removeChild(divElement.firstChild);
    }
    names.forEach(function (ele) {

        if (ele != null && ele.a.similar_to[0].name.toLowerCase().includes(searchResult)) {
            var text = document.createElement("p")
            text.innerHTML = JSON.stringify('The video includes: ' + ele.a.similar_to[0].name)
            divElement.appendChild(text)

            ele.occs.forEach(function (time) {
                var textTime = document.createElement("p")
                textTime.onclick = skipTo
                textTime.innerHTML = JSON.stringify('In the time: ' + time.ss + 's')
                textTime.id = "textTime"
                textTime.value = time.ss
                divElement.appendChild(textTime)
                divElement.appendChild(document.createElement("br"))

            })
        }
    })
}

function startUp() {
    player = new YT.Player('currentVideo', {
        videoId: 'T84se4fc4KU',
        events: {}
    });
    localStorage.setItem("APIkey", "ABf7LrVE3gGN8x7n8tAjTzhtMDStGnUgY9nKyiqA")
    if ((localStorage.getItem("ID"))) {
        document.querySelector("#startButton").disabled = false;
    }
}

function showResult() {
    console.log("show")
    socket.emit('showResult', {
        data: "https://api.val.ai/core/deepmetadata/beta-v0.8/job_results?api_key=" + localStorage.getItem("APIkey") + "&job_id=" + localStorage.getItem("ID")
    })
}

function showResultID() {
    console.log("show Result")

    var id = document.querySelector("#id").value;

    socket.emit('showResult', {
        data: "https://api.val.ai/core/deepmetadata/beta-v0.8/job_results?api_key=" + localStorage.getItem("APIkey") + "&job_id=" + id
    })
}

function startAnalyzing() {
    console.log("starta analysen")

    var data;

    if (document.querySelector("#currentVideo").src == "https://www.youtube.com/embed/MeTQplAmuTU") {
        data = JSON.stringify({
            "api_key": localStorage.getItem("APIkey"), "media": {
                "video": {
                    "url": "https://www.youtube.com/watch?v=Rrw4eRzWBX4"

                }

            }
        });
    }
    else {
        data = JSON.stringify({
            "api_key": localStorage.getItem("APIkey"), "media": {
                "video": {
                    "url": "https://www.youtube.com/watch?v=" + document.querySelector("#link").value

                }

            }
        });
    }

    socket.emit('startAnalyzing', {
        data: data
    })

}

function getStatus() {
    socket.emit('getStatus', {
        data: "https://api.val.ai/core/deepmetadata/beta-v0.8/job_status?api_key=" + localStorage.getItem("APIkey") + "&job_id=" + localStorage.getItem("ID")
    })
}

function setVideo() {
    document.querySelector("#currentVideo").src = "https://www.youtube.com/embed/" + document.querySelector("#link").value
}

document.querySelector("#resultButton").addEventListener('click', showResult);
document.querySelector("#setButton").addEventListener('click', setVideo);
document.querySelector("#statusButton").addEventListener('click', getStatus);
document.querySelector("#startButton").addEventListener('click', startAnalyzing);
document.querySelector("#setIdButton").addEventListener('click', showResultID);
document.querySelector("#searchButton").addEventListener('click', searchPeople)
window.addEventListener("load", startUp);