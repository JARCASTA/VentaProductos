'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = Schema({
    name:String,
    products:[{
        productId:[{type: Schema.Types.ObjectId, ref: 'product'}],
        name:String
    }]
})

module.exports = mongoose.model('category', categorySchema);

