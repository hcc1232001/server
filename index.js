// var http = require("http");
var express = require("express");
var mysql = require('mysql');
var app = express();
// mqtt test
var mqtt = require('mqtt');
var clientId = {

  keepalive: 5,  
  clientId: clientId,  
  protocolId: 'MQTT',  
  protocolVersion: 4,  
  clean: true,  
  reconnectPeriod: 1000,  
  connectTimeout: 30 * 1000,  
  will: {
    topic: 'Will',  
    payload: 'Connection Closed unexpectedly :(',  
    qos: 0,  
    retain: false
  },
  rejectUnauthorized: false
};
var client  = mqtt.connect('mqtt://broker.mqttdashboard.com', {
  clientId: 'clientId-0yu4gIjmhr'
});

client.on('connect', function () {
  client.subscribe('ioioioio', function (err) {
    if (!err) {
      client.publish('ioioioio', 'Hello mqtt')
      // setInterval(function() {
      //   client.publish('presence', 'Hello mqtt');
      // }, 10000);
    } else {
      console.log(err);
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(topic.toString() + ' : ' +message.toString());
  // client.end()
})

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'city_gallery'
})
connection.connect();

app.get('/', function (req, res) {
  // res.send('Hello, World!');

// connection.query('SELECT username from ex402_user', function (err, rows, fields) {
//   if (err) throw err
  
//   console.log('number of users found: ', rows.length);
// })

  connection.query('SELECT * from ex402_user', function (err, rows, fields) {
    if (err) throw err
    
    res.send('number of users found: ' + JSON.stringify(rows));
  })

  // connection.end();

});

app.listen(3002, function () {
  console.log('Example app listening on port 3002!');
});

