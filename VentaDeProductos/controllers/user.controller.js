'use strict'

var User = require('../models/user.model');
var Product = require('../models/product.model');
var Category = require('../models/category.model');
var Bill = require('../models/bill.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

function createUser(req, res){
    var user = new User();
    var params = req.body;

    if(params.firstName && params.userName && params.phone && params.email && params.password){
        User.findOne({$or:[{userName: params.userName}, {phone:params.phone}, {email:params.email}]}, (err, finded)=>{
            if(err){
                res.status(500).send({message:'Error general 1', err});
            }else if(finded){
                res.send({message:'Usuario, telefono o correo ya utilizados'});
            }else{
                user.firstName = params.firstName;
                user.lastName = params.lastName;
                user.userName = params.userName;
                user.phone = params.phone;
                user.email = params.email;
                user.role = 'USER';

                bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                    if(err){
                        res.status(500).send({message:'Error general 2', err});
                    }else if(passwordHash){
                        user.password = passwordHash;

                        user.save((err, saved)=>{
                            if(err){
                                res.status(500).send({message:'Error general 3', err});
                            }else if(saved){
                                res.send({message:'Usuario guardado', saved});
                            }else{
                                res.status(404).send({message:'Error inesperado 2'});
                            }
                        })
                    }else{
                        res.status(404).send({message:'Error no esperado 1'});
                    }
                })
            }
        })
    }else{
        res.status(418).send({message:'Ingrese los parametros solicitados'});
    }
}

function getUsers(req, res){
    var userId = req.params.idU;

    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        User.find({}, (err, finded)=>{
            if(err){
                res.status(500).send({message:'Error general 1', err});
            }else if(finded){
                res.send({message:'Se encontraron los siguientes usuarios', finded});
            }else{
                res.status(404).send({message:'No se encontraron usuarios'});
            }
        })
    }
}


function login(req, res){
    var params = req.body;

    if(params.userName || params.email){
        if(params.password){
            User.findOne({$or:[{userName: params.userName}, {email:params.email}]}, (err, finded)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(finded){
                    bcrypt.compare(params.password, finded.password, (err, passwordOk)=>{
                        if(err){
                            res.status(500).send({message:'Error al comparar'});
                        }else if(passwordOk){
                            if(params.getToken = true){
                                res.send({token: jwt.createToken(finded)});
                            }else{
                                res.send({message:'Bienvenido', user:finded});
                            }
                        }
                    })
                }else{
                    res.send({message:'Datos de usuario incorrectos'});
                }
            })
        }else{
            res.send({message:'Ingrese su contrasenia'});
        }
    }else{
        res.send({message:'Ingrese su usuario o correo'});
    }
}

function updateUser(req, res){
    var userId = req.params.idU;
    var params = req.body;

    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        User.findByIdAndUpdate(userId, params, {new:true},  (err, updated)=>{
            if(err){
                res.status(500).send({message:'Error general 1'});
            }else if(updated){
                res.send({message:'Actualizado correctamente', updated});
            }else{
                res.status(404).send({message:'Error no esperado'});
            }
        })
    }
}

function deleteUser(req, res){
    var userId = req.params.idU;
    
    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        User.findByIdAndRemove(userId, (err, deleted)=>{
            if(err){
                res.status(500).send({message:'Error general 1', err});
            }else if(deleted){
                res.send({message:'Eliminado exitosamente', deleted});
            }else{
                res.status(404).send({message:'Error no esperado'});
            }
        })
    }
}

function addProductToShopCar(req, res){
    var userId = req.params.idU;
    var productId = req.params.idP;
    var quantity = req.body;

    if( userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        Product.findById(productId, (err,finded)=>{
            if(err){
                res.status(500).send({message:'Error general 1', err});
            }else if(finded){
                var price = finded.price;
                var totalPrice = quantity.total * price;
                var comprobar =  finded.stock - quantity.total;
                if(comprobar >= 0){
                    User.findById(userId, (err, findedUser)=>{
                        if(err){
                            res.status(500).send({message:'Error general 3', err});
                        }else if(findedUser){
                            User.findOne({findedUser:{shopCar:{productId:productId}}}, (err, findedUser2)=>{
                                if(err){
                                    res.status(500).send({message:'Error general 4',err})
                                }else if(findedUser2){
                                    console.log(finded._id, {findedUser:{shopCar:{productId:productId}}}, "1");
                                    User.findByIdAndUpdate(userId, {$set:{shopCar:{productId:finded._id, name:finded.name, sold: quantity.total, price:totalPrice}}}, (err, updated)=>{
                                        if(err){
                                            res.status(500).send({message:'Error general 2', err});
                                        }else if(updated){
                                            res.send({message:'Se añadio el producto al carrito de compras'});
                                        }else{
                                            res.status(404).send({message:'Usuario no encontrado'});
                                        }
                                    });
                                }else{
                                    console.log(finded._id, {findedUser:{shopCar:{productId:productId}}},"2");
                                    User.findByIdAndUpdate(userId, {$push:{shopCar:{productId:finded._id, name:finded.name, sold: quantity.total, price:totalPrice}}}, (err, updated)=>{
                                        if(err){
                                            res.status(500).send({message:'Error general 2', err});
                                        }else if(updated){
                                            res.send({message:'Se añadio el producto al carrito de compras'});
                                        }else{
                                            res.status(404).send({message:'Usuario no encontrado'});
                                        }
                                    });    
                                }
                            })

                            }else{
                                res.status(404).send({message:'No se encontro nada'});
                            }

                        
                    })

            }else{
                res.send({message:'No hay suficientes productos'});
            }
        }else{
            res.status(404).send({message:'Producto no encontrado'});
        }
        })
    }
}

function getCategories(req, res){
    var userId = req.params.idU;

    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        Category.find({}, (err, finded)=>{
            if(err){
                res.status(500).send({message:'Error general 1', err});
            }else if(finded){
                res.send({categories:finded});
            }else{
                res.status(404).send({message:'No se encontraron categorias'});
            }
        })
    }
}

function searchProduct(req, res){
    var params = req.body;
    var userId = req.params.idU;

    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'})
    }else{
            Product.find({$or:[{'name': {$regex:params.search, $options: 'i'}}]}, (err, finded)=>{
                if(err){
                    res.status(500).send({message: 'Error general', err});
                }else if(finded){
                    res.send({employees:finded});
                }else{
                    res.send({message: 'Sin registros'});
                }
            }).populate('product');
    }
}

function seeBills(req,res){
    var userId = req.params.idU;

    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        User.findById(userId, (err, finded)=>{
            if(err){
                res.status(500).send({message:'Error general 1',err});
            }else if(finded){
                Bill.populate(finded, {path:'bills'}, (err, billFinded)=>{
                    if(err){
                        res.status(500).send({message:'Error general 2',err});
                    }else if(billFinded){
                        res.send({billFinded});
                        console.log('Mostar');
                    }else{
                        res.status(404).send({message:'No se encontraron facturas'});
                    }
                })
            }else{
                res.status(404).send({message:'No se encontraron facturas'});
            }
        }).populate('bill', 'bill');
    }
}


function byPrice(req, res){
    var userId = req.params.idU;

    if(userId != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta'});
    }else{
        Product.find({},(err, finded)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(finded){
                res.send({Productos:finded});
            }else{
                res.status(404).send({message:'No se encontraron productos'});
            }
        }).sort({totalSold:-1})
    }
}

function outStock(req, res){
    var userId = req.params.idU;

    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        Product.find({totalSold:0}, (err, finded)=>{
            if(err){
                res.status(500).send({message:'Error general 1', err});
            }else if(finded){
                res.send({message:'Se encontraron los siguientes productos', finded});
            }else{
                res.status(404).send({message:'No se encontraron productos'});
            }
        })
    }
}

module.exports = {
    createUser,
    getUsers,
    updateUser,
    deleteUser,
    login,
    addProductToShopCar,
    getCategories,
    searchProduct,
    seeBills,
    byPrice,
    outStock 
}