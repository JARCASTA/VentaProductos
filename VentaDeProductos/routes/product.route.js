'use strict'

var express = require('express');
var productController = require('../controllers/product.controller');
var authenticade = require('../middlewares/authenticade');
var api = express.Router();

api.post('/saveProduct/:idU', authenticade.ensureAuthAdmin,productController.createProduct);
api.get('/getProducts/:idU', authenticade.ensureAuthAdmin, productController.getProducts);
api.put('/updateProduct/:idU/:idP', authenticade.ensureAuthAdmin, productController.updateProduct);
api.delete('/deleteProduct/:idU/:idP', authenticade.ensureAuthAdmin, productController.deleteProduct);

api.put('/productToCategory/:idU/:idP/:idC', authenticade.ensureAuthAdmin, productController.ProductToCategory);
api.put('/productRemoveCategory/:idU/:idP/:idC', authenticade.ensureAuthAdmin, productController.removeProductFromCategorie);

module.exports = api;