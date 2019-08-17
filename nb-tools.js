window.nb5 = {
    data: {},
    set: function(varName, value) {
        window.parent.postMessage(
            {action: 'set', varName: varName, val: value},
            "*")
    },
    get: function(varName, defaultVal) {
        if (window.nb5.data.hasOwnProperty(varName)) {
            return window.nb5.data[varName];
        }
        else {
            return defaultVal;
        }
    },
    sub: function() {
        console.log('adding event listener in frame');
        window.addEventListener("message", function(event) {
            let msg = event.data;
            console.log('in event listener: ', msg, window.nb5);
            if (msg.action == 'publish') {
                window.nb5.data[msg.varName] = msg.val;
            }
        }, false);
    },
    getAll: function(varName) {
        console.log("in nb5.get()");
        window.parent.postMessage({
            action: 'getAll',
            varName: varName,
        }, "*");
        function handler(event) {
            if (event.data.action == 'getAllResponse') {
                window.removeEventListener('message', handler, false);
                window.nb5.data = event.data.val;
                if (window.nb5Ready) {
                    window.nb5Ready();
                }
            }
        }
        window.addEventListener('message', handler, '*');
    }
}

window.nb5.sub();
window.nb5.getAll();
