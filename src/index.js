export function listen(socket, name, handler) {
    socket.on(name, async request => {
        function send (result, keepalive = false) {
            socket.emit(name, { request, result, keepalive });
        }

        if (handler.length >= 2) {
            handler(request, send);
        } else {
            let result = handler(request);

            if (typeof result.then === 'function') {
                result = await result;
            }

            send(result);
        }
    });
}

export function request(socket, name, request, partialResultHandler) {
    return new Promise((resolve, reject) => {
        let sentTimestamp = new Date().getTime();
        let results = [];

        request.timestamp = sentTimestamp;

        socket.emit(name, request);

        socket.on(name, function listener (response) {
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
