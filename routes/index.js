/**
 * Created by setve on 03/02/2017.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/', function(req, res) {});

router.get('/ping', function (req, res) {
    res.send("pong")
})

module.exports = router;