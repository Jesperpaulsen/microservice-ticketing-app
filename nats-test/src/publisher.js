"use strict";
exports.__esModule = true;
var node_nats_streaming_1 = require("node-nats-streaming");
var stan = node_nats_streaming_1["default"].connect('ticketing', 'abc', {
    url: 'http://ticketing.dev:4222'
});
stan.on('connect', function () {
    console.log('publisher connected to nats');
});
