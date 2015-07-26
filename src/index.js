export function listen(socket, name, handler) {
	socket.on(`sr-${name}`, async request => {
		function send (result, keepalive = false) {
			socket.emit(`sr+${name}`, { request, result, keepalive });
		}

		let result = handler(request, send);

		if (typeof result.then === 'function') {
			result = await result;
		}

		send(result);
	});
}

export function request(socket, name, request, partialResultHandler) {
	return new Promise((resolve, reject) => {
		let sentTimestamp = new Date().getTime();
		let results = [];

		request.timestamp = sentTimestamp;

		socket.emit(`sr-${name}`, request);

		socket.on(`sr+${name}`, function listener (response) {
			if (response.request.timestamp == sentTimestamp) {
				if (partialResultHandler) {
					partialResultHandler(response.result);
				}

				results.push(response.result);

				if (!response.keepalive) {
					socket.off(listener);
					resolve(results);
				}
			}
		});
	});
}
