'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = ({
    firstName:String,
    lastName:String,
    userName:String,
    password:String,
    phone: String,
    email: String,
    role:String,
    bills:[{type: Schema.Types.ObjectId, ref: 'bills'}],
    shopCar:[{
        productId:String,
        name:String,
        sold:Number,
        price:Number
    }]
})

module.exports = mongoose.model('user', userSchema);