'use strict'

var Product = require('../models/product.model');
var Categorie = require('../models/category.model');


function createProduct(req, res){
    var userId = req.params.idU;
    var product = new Product();
    var params = req.body;

    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        if(params.name && params.stock && params.price){
            Product.findOne({name: params.name}, (err, finded)=>{
                if(err){
                    res.status(500).send({message:'Error general 1', err});
                }else if(finded){
                    res.send({message:'Nombre ya registrado'});
                }else{
                    product.name = params.name;
                    product.stock = params.stock;
                    product.price = params.price;
                    product.totalSold = 0;

                    product.save((err, saved)=>{
                        if(err){
                            res.status(500).send({message:'Error general 3', err});
                        }else if(saved){
                                res.send({message:'Producto guardado', saved});
                        }else{
                            res.status(404).send({message:'Error inesperado 2'});
                        }
                    })
                }
            })
        }else{
            res.status(418).send({message:'Ingrese los parametros solicitados'});
        }
    }
}

function getProducts(req, res){
    var userId = req.params.idU;

    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        Product.find({}, (err, finded)=>{
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

function updateProduct(req, res){
    var userId = req.params.idU;
    var productId = req.params.idP;
    var params = req.body;

    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        Product.findByIdAndUpdate(productId, params, {new:true},  (err, updated)=>{
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

function deleteProduct(req, res){
    var userId = req.params.idU;
    var productId = req.params.idP;

    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        Product.findByIdAndRemove(productId, (err, deleted)=>{
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

function ProductToCategory(req, res){
    var userId = req.params.idU;
    var productId = req.params.idP;
    var categorieIdc = req.params.idC;

    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
            Categorie.findById(categorieIdc, (err, finded)=>{
                if(err){
                    res.status(500).send({message:'Error general 1', err});
                }else if(finded){
                    Product.findOne({_id:productId, categories:{$elemMatch:{categorieId:categorieIdc, name:finded.name}}}, (err, productFinded)=>{
                        if(err){
                            res.status(500).send({message:'Error general 2', err});     
                        }else if(productFinded){
                            res.send({message:'El producto ya tiene una categoria asignada'});
                        }else{
                            Categorie.findById(categorieIdc, (err, categorieFinded)=>{
                                if(err){
                                    res.status(500).send({message:'Error general 3', err});
                                }else if(categorieFinded){
                                    Product.findByIdAndUpdate(productId,{$push:{categories:{categorieId:categorieIdc, name:finded.name}}}, {new:true},(err, productUpdated)=>{
                                        if(err){
                                            res.status(500).send({message:'Error general 4',err});
                                        }else if(productUpdated){
                                            Categorie.findByIdAndUpdate(categorieIdc, {$push:{products:{productId:productId, name:productUpdated.name}}}, {new:true}, (err, categorieUpdated)=>{
                                                if(err){
                                                    res.status({message:'Error general 5', err});
                                                }else if(categorieUpdated){
                                                    res.send({message:'Exitoso', productUpdated});
                                                }else{
                                                    res.send({message:'Error no esperado 2'})
                                                }
                                            })
                                        }else{
                                            res.send({message:'Error no esperado 1'});
                                        }
                                    })
                                }else{
                                    res.status(404).send({message:'La categoria no existe'});
                                }
                            })
                        }
                    })
                }else{
                    res.status(404).send({message:'No se encontro la categoria'});
                }
            })
    }
}

function removeProductFromCategorie(req, res){
    var userId = req.params.idU;
    var productId = req.params.idP;
    var categorieId = req.params.idC;

    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de rute'});
    }else{
        Product.findById(productId, (err, finded)=>{
            if(err){
                res.status(500).send({message:'Error general 1',err});
            }else if(finded){
                Categorie.findById(categorieId, (err, categorieFinded)=>{
                    if(err){
                        res.status(500).send({message:'Error general 2', err});
                    }else if(categorieFinded){
                        Product.findByIdAndUpdate(productId, {$pull:{categories:{categorieId:categorieId}}}, {new:true}, (err, updated)=>{
                            if(err){
                                res.status(500).send({message:'Error general 3', err});
                            }else if(updated){
                                Categorie.findByIdAndUpdate(categorieId, {$pull:{products:{productId:productId}}},{new:true},(err, categorieUpdated)=>{
                                    if(err){
                                        res.status(500).send({message:'Error general 4', err});
                                    }else if(categorieUpdated){
                                        res.send({message:'Exitoso', updated});
                                    }else{
                                        res.status(404).send({message:'Categoria no encontrada'});
                                    }
                                })
                            }else{
                                res.status(404).send({message:'Error no esperado', updated, err});
                            }
                        })
                    }else{
                        res.status(404).send({message:'Categoria no encontrada'});
                    }
                })
            }else{
                res.status(404).send({message:'No se encontro el producto'});
            }
        })
    }
}

module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    ProductToCategory,
    removeProductFromCategorie
}