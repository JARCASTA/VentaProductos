'use strict'

var express = require('express');
var api = express.Router();
var billController = require('../controllers/bill.controller');
var authenticade = require('../middlewares/authenticade');

api.post('/generateBill/:idU', authenticade.ensureAuth, billController.generateBill);

module.exports = api;