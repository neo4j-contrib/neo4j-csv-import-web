// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function guidShort() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return "a" + s4() + s4() +  s4()  + s4() + s4() + s4() + s4() + s4();
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return "a" + s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

if (typeof exports === 'object') {
    module.exports.guid = guid;
    module.exports.guidShort = guidShort;
}