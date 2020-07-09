'use strict'

var categoryController = require('../controllers/category.controller');
var express = require('express');
var api = express.Router();
var authenticade = require('../middlewares/authenticade');

api.post('/saveCategory/:idU', authenticade.ensureAuthAdmin, categoryController.saveCategory);
api.put('/updateCategory/:idU/:idC', authenticade.ensureAuthAdmin, categoryController.updateCategory);
api.get('/listCategories/:idU', authenticade.ensureAuthAdmin, categoryController.getCategories);
api.delete('/removeCategory/:idU/:idC', authenticade.ensureAuthAdmin, categoryController.deleteCategory);

module.exports = api;