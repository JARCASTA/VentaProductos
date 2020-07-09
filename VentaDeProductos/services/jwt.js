'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'Clave_que_nadie_debe_saber';

exports.createToken = (user) =>{
    var payload = {
        sub: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        phone: user.phone,
        email:user.email,
        role:user.role,
        iat: moment().unix(),
        exp: moment().add(4, 'hours').unix()
    }
    return jwt.encode(payload, key)
}