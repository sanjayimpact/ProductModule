import mongoose from 'mongoose';

const varianSchema = new mongoose.Schema({
    price:{
        type: String,
  

    },
    compareprice:{
       type:String,
    },
    sku:{
        type:String,
 
        unique:true

    },
    costprice:{
        type:String,
    },
    barcode:{
      type:String,
      
    },
    product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    stock_Id:{
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
    },
    istax:{
        type:Boolean,
        default:false
    },
    isdefault:{
        type:Boolean,
        enum:[true,false],
        default:false
    },
    weight:{
        type:String,
        trim:true,
    }
},{timestamps:true});
export const Variant = mongoose.models.Variant || mongoose.model('Variant', varianSchema);