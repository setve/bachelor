var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var ffmpeg = require('fluent-ffmpeg');
var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var request = require('request')
const Speech = require('@google-cloud/speech');

const fs = require('fs');

var debug = require('debug')('expressapp');

var app = express();

var server = require('http').createServer(app);

var io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 8002);

app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.raw({type: 'audio/wav', limit: '50mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

server.listen(app.get('port'));

var timers = {};

function convert(start, slutt, input, output, callback) {
    console.log(input);
    ffmpeg(input)
        .format('flac')
        .duration(slutt)
        .seek(start)
        .audioChannels(1)
        .audioFrequency(16000)
        .output(output)
        .on('end', function () {
            console.log('conversion ended');
            callback(null);
        }).on('error', function (err) {
        console.log('error: ', err);
        callback(err);
    }).run();
}

var translater = (counter, data, socket) => {

    var speechResult = "";

    convert(counter+1, counter + 10, data, './output.flac', function (err) {
        if (!err) {
            console.log('conversion complete')

            // Instantiates a client
            const speech = Speech("speech-api-154807");

            const options = {
                "config": {
                    // Configure these settings based on the audio you're transcribing
                    encoding: 'FLAC',
                    sampleRateHertz: 16000,
                    languageCode: 'no-NO',
                },
                interimResults: false,
                singleUtterance: false,
            };

            // Create a recognize stream
            const recognizeStream = speech.createRecognizeStream(options)
                    .on('error', (error) => {
                        console.log(error)
                        io.to(socket.id).emit('done', {
                            text: speechResult
                        });
                    } )
                    .on('data', (data) => {
                        console.log(data)
            if (data.speechEventType == "SPEECH_EVENT_UNSPECIFIED") {
                console.log("Ferdig ", data.results);
                speechResult += data.results
            }
        })
        .on('end', () => {
            io.to(socket.id).emit('done', {
                text: speechResult
            });
                console.log('end');
        });

            // Stream an audio file from disk to the Speech API
            fs.createReadStream('./output.flac').pipe(recognizeStream);
        }
    })
};


io.on('connection', function (socket) {

    console.log('a user connected: ' + socket.id);
    io.emit('connected');
//Wirewax code
    socket.on('getToken', function (data) {
        request({
            method: "POST",
            url: "http://hobnob.wirewax.com/oauth/token",

            headers: {
                'Content-Type': "application/x-www-form-urlencoded",
                'Authorization': "Basic NDpaVnJERXRJSW5hbEl0SmhocEptYlRWWXltRGdiR3hQcw=="
            },

            form: {
                grant_type: "password",
                username: "sebastian.tveita@vimond.com",
                password: "fjellnatur8"
            }
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                console.log(response.statusCode, body)
                var json = JSON.parse(body);
                io.to(socket.id).emit('gotToken', {
                    token: json.access_token
                })
            }
        })

    });

    socket.on('showResultWirewax', function (data) {
        request({
            method: "GET",
            url: data.data,

            headers: {
                'Authorization': "Bearer " + data.token
            }

        }, function (error, response, body) {
            if (error) {
                console.log("Error", error)
            } else {
                console.log(response.statusCode, body)
                if (data.data.includes("/faces")) {
                    io.to(socket.id).emit('gotFaceResult',  {
                        data: body
                    })
                }
                else {
                    console.log("got normal result")
                    io.to(socket.id).emit('gotResult', {
                        data: body
                    })
                }
            }
        })
    })

    socket.on('startAnalyzingWirewax', function (data) {
        console.log("Starta analysen med url", data.data.url)
        request({
            method: "POST",
            url: "http://hobnob.wirewax.com/Video",

            headers: {
                'Authorization': "Bearer " + data.data.token
            },

            form: {
                url: data.data.url
            }


        }, function (error, response, body) {
            if (error) {
                console.log("error", error);
            } else {
                console.log(response.statusCode, body)
                io.to(socket.id).emit('doneAnalyzing', {
                    body: body
                })
            }
        })

    })

    socket.on('getIdList', function (data) {
        request({
                method: "GET",
                url: "http://hobnob.wirewax.com/public/video",

                headers: {
                    'Authorization': "Bearer " + data.token
                }
            }, function (error, response, body) {
                if (error) {
                    console.log("Error", error)
                } else {
                    console.log(response.statusCode, body)
                    io.to(socket.id).emit('gotResult',  {
                        data: body
                    })
                }
            }

        )

    })
//Valossa code
    socket.on('getStatus', function (data) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", data.data, true);
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.status == 200 && xmlHttp.readyState == 4) {
                io.to(socket.id).emit('gotStatus', {
                    data: xmlHttp.responseText
                })
            } else {
                console.log("Fekk ein feil", xmlHttp.status)
                //console.log("ERROR", xmlHttp.responseText)
            }
        }
        xmlHttp.send();

    })

    socket.on('startAnalyzing', function (data) {

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", "https://api.val.ai/core/deepmetadata/beta-v0.8/new_job", true);

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.status == 200) {
                console.log("ferdig")
                var json = JSON.parse(xmlHttp.responseText);
                io.to(socket.id).emit('doneAnalyzing', {
                    ID: json.job_id
                })
                console.log(json.job_id)
            } else {
                console.log("ERROR", xmlHttp.response)
            }
        }
        xmlHttp.send(data.data)
    })

    socket.on('showResult', function (data) {
        console.log("start show")
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", data.data, true);
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.status == 200 && xmlHttp.readyState == 4) {
                io.to(socket.id).emit('gotResult', {
                    data: xmlHttp.responseText
                })
            } else {
                console.log("Fekk ein feil", xmlHttp.status)
                //console.log("ERROR", xmlHttp.responseText)
            }
        }
        xmlHttp.send();
    })
//Watson image code
    var visual_recognition = new VisualRecognitionV3({
        api_key: '8feeacc50d39cc15387b88fc217995dac506f868',
        version_date: '2016-05-19'
    });

    socket.on('getInfo', function (data) {
        var params = {
            images_file: fs.createReadStream(data.src)
        };

        visual_recognition.classify(params, function (err, res) {
            if (err)
                console.log(err);
            else {
                io.to(socket.id).emit('retrievedInfo', {
                    res: res.images[0].classifiers[0].classes
                })
            }

        });

    })

    socket.on('getInfoFile', function (data) {
        var params = {
            images_file: data.data
        };

        visual_recognition.classify(params, function (err, res) {
            if (err)
                console.log(err);
            else {
                io.to(socket.id).emit('retrievedInfo', {
                    res: res.images[0].classifiers[0].classes
                })
            }

        });

    })
//Google-speech code
    socket.on('pause', function () {
        clearInterval(timers[socket.id])
    });

    socket.on('continue', function (data) {
        translater(Math.ceil(data.time), data.src, socket);
        var internalCounter = Math.ceil(data.time);
        timers[socket.id] = setInterval(() => {
                translater(internalCounter + 10, data.src, socket);
        internalCounter = internalCounter + 10;
    }, 9 * 1000);
    });

    socket.on('translate', function (data) {
        console.log("kom inn i translate", data.src);
        translater(0, data.src, socket);
        var internalCounter = 0;
        timers[socket.id] = setInterval(() => {
                translater(internalCounter + 10, data.src, socket);
        internalCounter = internalCounter + 10;
    }, 10 * 1000);
    })

});