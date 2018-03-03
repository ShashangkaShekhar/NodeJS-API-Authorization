
function generateSecurityToken(actionType, loggedUser) {
    var model = {
        username: loggedUser,
        key: actionType,
        userAgent: navigator.userAgent.replace(/ \.NET.+;/, '')
    };

    var message = [model.username, model.userAgent].join(':');
    var hash = CryptoJS.HmacSHA256(message, model.key);
    var token = CryptoJS.enc.Base64.stringify(hash);
    var tokenId = [model.username, model.key].join(':');
    var tokenGenerated = CryptoJS.enc.Utf8.parse([token, tokenId].join(':'));

    return CryptoJS.enc.Base64.stringify(tokenGenerated);
};