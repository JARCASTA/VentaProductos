 'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var billSchema = Schema({
    client:String,
    date: Date,
    detail:{
        products:[{
            name:String,
            sold:Number,
            price: Number
        }],
    total: Number
    }
})

module.exports = mongoose.model('bill', billSchema)