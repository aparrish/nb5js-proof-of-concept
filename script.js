
currentElem = null;

function makeCell(kind) {
    let d = createDiv();
    d.addClass('cell');
    d.addClass(kind);
    let edit;
    let rendered;
    let output;
    switch (select('#celltype').value()) {
        case 'md':
            edit = createElement('textarea');
            edit.elt.placeholder = "im a markdown cell yay";
            edit.attribute('cols', 80);
            edit.attribute('rows', 3);
            edit.addClass('edit');
            output = createDiv("");
            output.addClass('output');
            rendered = createDiv("");
            rendered.addClass('rendered');
            break;
        case 'js':
            edit = createElement('textarea');
            edit.attribute('cols', 80);
            edit.attribute('rows', 3);
            edit.elt.placeholder = "/* js cell */"
            edit.addClass('edit');
            output = createDiv("");
            output.addClass('output');
            rendered = createDiv("");
            rendered.addClass('rendered');
            break;
        case 'p5':
            edit = createElement('textarea');
            edit.attribute('cols', 80);
            edit.attribute('rows', 3);
            edit.elt.placeholder = "function setup() {}";
            edit.addClass('edit');
            output = createDiv("");
            output.addClass('output');
            rendered = createDiv("");
            rendered.addClass('rendered');
            break;
    }
    edit.parent(d);
    rendered.parent(d);
    output.parent(d);
    rendered.style('display', 'none');
    d.attribute('tabindex', 0);
    d.elt.addEventListener('focus', function(e) {
        for (let el of selectAll('.cell')) {
            el.removeClass('cell-focused');
        }
        currentElem = d;
        currentElem.addClass('cell-focused');
    });
    d.elt.focus();
    return d;
}

function makeP5Frame(s) {
    let sDoc = `<html><head><script src='http://localhost:8000/nb-tools.js'></script><script src='https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/p5.js'></script></head><body><script type='text/javascript'>${s}</script></body></html>`;
    let srcEncoded = btoa(sDoc);
    let srcUrl = `data:text/html;base64,${srcEncoded}`;
    let iframe = createElement('iframe');
    iframe.attribute('width', '250');
    iframe.attribute('height', '250');
    iframe.attribute('src', srcUrl);
    return iframe;
}

function setup() {
    noCanvas();
    select('#addButton').mouseClicked(addCell);
    select('#playButton').mouseClicked(runActiveCell);
    select('#cutButton').mouseClicked(deleteActiveCell);
}
function addCell() {
    let d = makeCell(select('#celltype').value());
    d.parent('nbcontainer');
}
function runActiveCell() {
    console.log(currentElem);
    let src = select('.edit', currentElem).elt.value
    if (currentElem.hasClass('md')) {
        console.log("would render md");
    }
    else if (currentElem.hasClass('js')) {
        let outdiv = select('.output', currentElem);
        try {
            let output = eval(src);
            outdiv.html(output);
        }
        catch (e) {
            outdiv.html(e.message);
        }
    }
    else if (currentElem.hasClass('p5')) {
        let frame = makeP5Frame(src);
        select('.output', currentElem).html('');
        select('.output', currentElem).child(frame);
    }
}

function deleteActiveCell() {
    currentElem.remove();
}

window.addEventListener("message", receiveMessage, false);
function receiveMessage(event) {
    let msg = event.data;
    console.log("in receiveMessage", event);
    if (msg.action == 'set') {
        publishToAll(msg.varName, msg.val);
    }
    else if (msg.action == 'getAll') {
        event.source.postMessage(
            {action: 'getAllResponse', val: window.nb5.data}, "*");
    }
}

function publishToAll(varName, val) {
    console.log('publishing...');
    for (let i = 0; i < window.frames.length; i++) {
        window.frames[i].postMessage(
            {action: 'publish', varName: varName, val: val}, '*');
    }
}

window.nb5 = {
    data: {},
    set: function(varName, val) {
        console.log('hi?');
        publishToAll(varName, val);
        window.nb5.data[varName] = val;
        return val;
    },
    get: function(varName) {
        return window.nb5.data[varName];
    }
};
