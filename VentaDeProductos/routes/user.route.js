'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var authenticade = require('../middlewares/authenticade');
var api = express.Router();

api.post('/saveUser', userController.createUser);
api.get('/listUsers/:idU', authenticade.ensureAuthAdmin, userController.getUsers);
api.put('/editUser/:idU', authenticade.ensureAuth, userController.updateUser);
api.delete('/deleteUser/:idU', authenticade.ensureAuth, userController.deleteUser);

api.post('/login', userController.login);
api.put('/shopCar/:idU/:idP', authenticade.ensureAuth, userController.addProductToShopCar);
api.get('/listCategories/:idU', authenticade.ensureAuth, userController.getCategories);
api.post('/searchProduct/:idU', authenticade.ensureAuth, userController.searchProduct);
api.get('/seeBills/:idU', authenticade.ensureAuth, userController.seeBills);
api.get('/byPrice/:idU',authenticade.ensureAuth, userController.byPrice);
api.get('/outStock/:idU', authenticade.ensureAuth, userController.outStock);

module.exports = api;