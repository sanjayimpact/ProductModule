import mongoose from 'mongoose';

const varianSchema = new mongoose.Schema({
    price:{
        type: String,
  

    },
    sku:{
        type:String,
 
        unique:true

    },
    product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    stock_quantity:{
        type:Number,
        default:0
    },
    variant_image:{
        type:String,
        trim:true
    },
    shop_id:{
        type:Number,
        // type:mongoose.Schema.Types.ObjectId,
        // ref: 'Shop',
        default:1
    },
    isVariandetails:{
        type:Number,
        default:0
    }
},{timestamps:true});
export const Variant = mongoose.models.Variant || mongoose.model('Variant', varianSchema);