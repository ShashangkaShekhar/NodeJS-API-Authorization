var utf8 = require('utf8');
var crypto = require('crypto');
var dbService = require('./dbService');

var encConfig = {
    hType: "sha256",
    eType: "base64",
    cEnc: "ascii"
};

var validateToken = function (req, res, next) {
    var token = req.headers['x-access-token'];
    var userAgent = req.headers['user-agent'];

    var key = utf8.encode(new Buffer(token, encConfig.eType.toString()).toString(encConfig.cEnc));
    const parts = key.split(':');
    var keymodel = {};

    if (parts.length === 3) {
        keymodel = {
            clientToken: parts[0],
            userid: parts[1],
            actionType: parts[2],
            useragent: userAgent
        };
    }

    //Generate Token Server-Side
    var message = [keymodel.userid, keymodel.useragent].join(':').toString();
    var sec_key = keymodel.actionType;
    var servertoken = crypto.createHmac(encConfig.hType.toString(), sec_key).update(message).digest(encConfig.eType.toString());

    //Validate Token
    if (keymodel.clientToken == servertoken) {
        var query = "[UserAuthorization] '" + keymodel.userid + "', '" + keymodel.actionType + "'";
        dbService.executeQuery(query, function (data, err) {
            if (err) {
                throw err;
            } else {
                var response = data.recordset[0].result;
                if (response == 'true') {
                    next();
                }
                else {
                    return res.status(403).send({ message: 'Authorization Failed!! You are not Permitted!!' });
                }
            }
        });
    }
    else {
        return res.status(404).send({ message: 'Invalid Token!!' });
    }
}

module.exports = validateToken;