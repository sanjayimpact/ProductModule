import mongoose from "mongoose";
const stockSchema = new mongoose.Schema({
    location_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Location"
    },
    variant_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Variant"
    },
    stocks:{
        type:Number,
        default:0
    },
    shop_id:{
        type:Number,
        default:0
    }

},{timestamps:true})
