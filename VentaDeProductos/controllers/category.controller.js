'use strict'

var Category = require('../models/category.model');
var Product = require('../models/product.model');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;


function saveCategory(req,res){
    var category = new Category();
    var userId = req.params.idU;
    var params = req.body;

    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        if(params.name){
            Category.findOne({name:params.name}, (err, finded)=>{
                if(err){
                    res.status(500).send({message:'Error general 1', err});
                }else if(finded){
                    res.send({message:'Categoria ya existente'});
                }else{
                    category.name = params.name;

                    category.save(category, (err, saved)=>{
                        if(err){
                            res.status(500).send({message:'Error general 2', err});
                        }else if(saved){
                            res.send({message:'Categoria guardada', saved});
                        }else{
                            res.status(418).send({message:'No se pudo guardar la categoria'});
                        }
                    })
                }
            })
        }else{
            res.send({message:'Ingrese los parametros necesarios'});
        }
    }

}

function updateCategory(req, res){
    var userId = req.params.idU;
    var categoryId = req.params.idC;
    var params = req.body;

    if(userId != req.user.sub){
        res.status(403).send({message:'Sin permisos de ruta'});
    }else{
        Category.findOne({name:params.name}, (err, finded)=>{
            if(err){
                res.status(500).send({message:'Error general 1', err});
            }else if(finded){
                res.status(418).send({message:'Nombre de categoria ya existente'});
            }else{
                Category.findByIdAndUpdate(categoryId, params, {new:true}, (err, updated)=>{
                    if(err){
                        res.status(500).send({message:'Error general 2', err});
                    }else if(updated){
                        res.send({message:'Actualizado correctamente', updated});
                    }else{
                        res.send({message:'Error no esperado'});
                    }
                })
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


function deleteCategory(req,res){
    var categoryIdc = req.params.idC;
    
    
    Category.findOne({name: 'Por defecto'}, (err,finded)=>{
        if(err){
            res.status(500).send({message: 'Error general 1 ',err});
        }else if(finded){
            var findedId = finded._id;
            console.log(findedId, categoryIdc)
            Product.updateMany({categorieId:[new ObjectId(categoryIdc)]}, {$push:{categories:{categorieId:findedId,name:finded.name}}} , {new: true}, (err,updated)=>{
                if(err){
                    res.status(500).send({message: 'Error general 2 ', err});
                }else if(updated){
                    Product.updateMany({categories:{$elemMatch:{categorieId:{_id:new ObjectId(categoryIdc)}}}}, {$push:{categories:{categorieId:findedId,name:finded.name}}} , {new: true}, (err,updated2)=>{
                        if(err){
                            res.status(500).send({message: 'Error general 3 ', err});
                        }else if(updated2){
                            Category.findByIdAndDelete(categoryIdc, (err, deleted)=>{
                                if(err){
                                    res.status(500).send({message:'Error general 4', err});
                                }else if(deleted){
                                    Product.updateMany({categories:{$elemMatch:{categorieId:{_id:new ObjectId(categoryIdc)}}}},{$pull:{categories:{categorieId:categoryIdc,name:deleted.name}}} , (err, exito)=>{
                                        if(err){
                                            res.status(500).send({message:'Error general 5', err});
                                        }else if(exito){
                                            res.send({message:'Se elimino la siguiente categoria:',deleted});
                                        }else{
                                            res.status(403).send({message:'Error no esperado'});
                                        }
                                    })
                                }else{
                                    res.status(403).send({message:'Error al eliminar la categoria'});
                                }
                            })
                        }else{
                            res.status(418).send({message: 'Categoria no existente'});
                        }
                    })
                }else{
                    res.status(418).send({message: 'Error al actualizar los productos'});
                }
            })
        }else{
            res.status(404).send({message: 'No se encontro la categoria por defecto'});
        }
    })
}




module.exports = {
    saveCategory,
    updateCategory,
    getCategories,
    deleteCategory
}