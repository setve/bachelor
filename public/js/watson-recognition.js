/**
 * Created by setve on 05/04/2017.
 */
var socket = io();

socket.on('retrievedInfo', function (data) {
    var divElement = document.querySelector('#text');
    while (divElement.firstChild) {
        divElement.removeChild(divElement.firstChild);
    }
    for (var obj in data.res) {
        console.log(data.res[obj].class)
        divElement.appendChild(document.createElement("p").appendChild(document.createTextNode("Tag: " + JSON.stringify(data.res[obj].class) + ", Score: " + JSON.stringify(data.res[obj].score))))
        divElement.appendChild(document.createElement("br"))
    }

});

function getImageInfo(src) {
    socket.emit('getInfo', {
        src: src
    })
}

function readURL(input) {
    document.querySelector("#image4").hidden = false;
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#image4')
                .attr('src', e.target.result)
            socket.emit('getInfoFile', {
                data: input.files[0]
            })
        };
        reader.readAsDataURL(input.files[0]);

    }
}

document.querySelector('#image1').addEventListener('click', function () {
    getImageInfo('./public/media/HDR-Canon-Rebel-XT-Processing-Sample.jpg')
});
document.querySelector('#image2').addEventListener('click', function () {
    getImageInfo('./public/media/People-and-Faces-5.jpg')
});
document.querySelector('#image3').addEventListener('click', function () {
    getImageInfo('./public/media/Lichtenstein_img_processing_test.png')
});
