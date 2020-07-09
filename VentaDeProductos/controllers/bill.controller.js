'use strict'

var Bill = require('../models/bill.model');
var User = require('../models/user.model');
var Product = require('../models/product.model');

function generateBill(req, res) {
    var userId = req.params.idU;
    var bill = new Bill();

    User.findById(userId, (err, finded) => {
        if (err) {
            res.status(500).send({message:'Error general 1', err });
        } else if (finded) {
            if (finded.shopCar.length != 0) {
                var date = new Date();
                bill.client = finded.firstName + ' ' + finded.lastName;
                bill.date = date;
                bill.detail = finded.shopCar;

                bill.save((err, saved) => {
                    if (err) {
                        res.status(500).send({message:'Error general 2', err });
                    } else if (saved) {
                        finded.shopCar.forEach(product => {
                            Product.findOne({ name: product.name, brand: product.brand }, (err, found) => {
                                if (err) {
                                } else if (found) {
                                    Product.findByIdAndUpdate(found._id, { stock: found.stock - product.sold, totalSold: found.totalSold + product.sold}, (err, ok) => {
                                        if (err) {
                                            console.log('Error general 3', err);
                                        } else if (ok) {
                                            console.log('Stock actualizado');
                                        } else {
                                            console.log('Error al limpiar el carrito.');
                                        }
                                    })
                                } else {
                                    console.log('Error al actualizar stock principal.');
                                }
                            })
                        });

                        User.findByIdAndUpdate(userId, { $push: { bills: saved._id }}, { new: true }, (err, updated) => {
                            if (err) {
                                res.status(500).send({message:'Error general 4', err });
                            } else if (updated) {
                                User.findByIdAndUpdate(userId, {$pull:{shopCar:{}}}, {new:true}, (err, updated2)=>{
                                    if(err){
                                        res.status({message:'Error general 5',err});    
                                    }else if(updated2){
                                        
                                        Bill.findByIdAndUpdate(saved._id, {$set:{detail:{products:finded.shopCar}}}, (err, billDetail)=>{
                                            if(err){
                                                res.status(505).send({message:'Error general 6', err});
                                            }else if(billDetail){
                                                res.send({message:'Exitoso',billDetail});
                                            }else{
                                                res.status(404).send({message:'Error al buscar factura'});
                                            }
                                        }).populate('products');
                                        
                                    }else{
                                        res.status(404).send({message:'Error no esperado'});
                                    }
                                })
                            } else {
                                res.status(400).send({ message:'No se limpio el carrito'});
                            }
                        });
                    } else {
                        res.status(400).send({ message: 'No se guardo la factura' });
                    }
                });
            } else {
                res.status(400).send({ message: 'Sin productos en el carro de compras' })
            }
        } else {
            res.status(404).send({ message: 'Usuario no encontrado' });
        }
    });
}




module.exports = {
    generateBill
}