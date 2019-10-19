module.exports.randomString = getRandomString

function getRandomString(length) {
    var result = '';
    var choice = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ0123456789';
    for (var i = 0; i < length; i++) {
        result += choice.charAt(Math.floor(Math.random() * choice.length));
    }
    return result;
}
