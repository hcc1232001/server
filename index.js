// mqtt test
const mqtt = require('mqtt');

// test mqtt using broker from this site
// http://www.hivemq.com/demos/websocket-client/?
// const host = 'tcp://10.0.0.2:1884';
// mqtt server
// const host = 'mqtt://iot.eclipse.org:1883';
// mqtt through ws
const host = 'ws://iot.eclipse.org:80/ws';
// a unique random string
const clientId = 'eaca4d1b-34fc-487f-9fd0-ebdcb55322ff';

const options = {
  keepalive: 10,
  clientId: clientId,
  // protocol but not protocolId?
  // protocolId: 'mqtt',
  protocol: 'ws',
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

const mqttClient = mqtt.connect(host, options);
mqttClient.on('connect', function() {
  console.log('connect');
  mqttClient.subscribe(
    'Popsense/People',
    { qos: 0 }, 
    function(err) {
      if (err) {
        console.log('subscribe "Popsense/People" failed');
      }
    }
  );
  mqttClient.subscribe(
    'Popsense/Product',
    { qos: 0 }, 
    function(err) {
      if (err) {
        console.log('subscribe "Popsense/Product" failed');
      }
    }
  );
})

mqttClient.on('close', function() {
  console.log(clientId + 'disconnected');
});

mqttClient.on('message', function(topic, message) {
  const messageStr = message.toString();
  const messageJSON = JSON.parse(messageStr);
  // console.log('typeof' + " :\n" + typeof(messageStr));
  console.log(topic + " :\n" + JSON.stringify(messageJSON, null, '  '));
})

mqttClient.on('error', function(err) {
  console.log(err);
  mqttClient.end();
});