'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'Clave_que_nadie_debe_saber';

exports.ensureAuth = (req, res, next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message:'Peticion sin autenticacion'})
    }else{
        var token = req.headers.authorization.replace(/['"]+/g, '')
        try{
            var payload = jwt.decode(token, key);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message:'Token expirado'});
            }
        }catch(ex){
            return res.status(404).send({message:'Token no valido'});
        }
        req.user = payload;
        next();
    }
}

exports.ensureAuthAdmin = (req, res, next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message:'Peticion sin autenticacion'});
    }else{
        var token = req.headers.authorization.replace(/['"]+/g, '');
        try{
            var payload = jwt.decode(token, key);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message:'Token expirado'});
            }else if(payload.role != 'ADMIN'){
                return res.status(401).send({message:'Sin permisos de ruta'});
            }
        }catch(ex){
            return res.status(404).send({message: 'Token no valido'});
        }
        req.user = payload;
        next();
    }  
}