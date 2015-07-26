# socket-requests

A simple wrapper around [socket.io](http://socket.io/) for sending requests that generate multiple responses.

## Installation

	npm install socket-requests

## Usage

Set up your `socket.io` like normal. Then do this:

```javascript
// client
var request = require('socket-requests').request;
var socket = io('http://localhost:5000/'); // as usual

request(socket, 'ping-pong', { query: "Ping" }, function (response) {
	console.log(response);
}).then(function (responses) {
	console.log(responses);
});
```

```javascript
// server
var listen = require('socket-requests').listen;

io.on('connection', function (socket) {
	listen(socket, 'ping-pong', (request, send) => {
		send(request.query + ' pong.', true);

		setTimeout(function () {
			send('Puff!');
		}, 1000);
	});
});
```

The above example will print the following on the client:

	Ping pong.
	Puff!
	[ "Ping pong." , "Puff!" ]

## API

### `function listen(socket, name, handler)`

This is the server-side part. Listen on the socket for events of type `name`, sending their data to the handler. 

#### Multiple responses via `send` callback

The handler receives a callback for replying to the request as the second parameter. The callback is of signature

	function send (result, keepalive = false) { /* ... */ }

If `keepalive` is true, there are more responses to come, otherwise the client is notified about the end of the response stream.

#### Single reponse via return value or promise

If the handler returns a value, this value is sent to the client. The handler may also return a promise, whose return value is sent to the client upon resolution. Both cases terminate the response stream, so return `undefined` in your handler if you use the `send` callback asynchronously and cannot make sure to resolve your handler Promise only after you have sent your last response.

### `function request(socket, name, request [, partialResultHandler] )`

This function enriches the passed `request` data with a timestamp and sends it through the socket. Every subsequent response on that socket matching `event` that contains the original request's timestamp is considered a reply to the request. All responses are collected in an array. The function returns a promise that is resolved with the array of responses once the server sends no `keepalive`, hence signals the response stream to terminate.

If a `partialResultHandler` is supplied, it is called once for every reponse to the request.



### Usage without Socket.IO

Since this is a simple wrapper using only `.on`, `.off` and `.emit` functions, you can simply use this library with any node standard EventEmitter, as seen in the examples.
