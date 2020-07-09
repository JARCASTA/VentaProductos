'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = Schema({
    name: String,
    stock: Number,
    price: Number,
    totalSold: Number,
    categories:[{
        categorieId: [{type: Schema.Types.ObjectId, ref: 'category'}],
        name: String
    }]
})

module.exports = mongoose.model('product', productSchema);