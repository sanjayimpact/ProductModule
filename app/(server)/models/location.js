import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true
    },
    address:{
        type:String,
        trim:true
    },
    shop_id:{
        type:Number,
        default:1
    },
    isdefault:{
        type:Boolean,
        default:false
    }


},{timestamps:true})