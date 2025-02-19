import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    product_name:{
        type:String,
        trim:true,
        required:true

    },
    product_slug:{
        type:String,
        trim:true,
     
    },
    product_description:{
        type:String,
        trim:true
    },
    featured_image:{
        type:[String],
        default:[]
    },
    shop_id:{
        type:Number,

        default:1
    },
    product_status:{
        type:String,
        enum:['Active','Draft'],
        default:'Draft'
    },
    brand_id:{
        type:Number,

        default:1
    },
    tag_id:[{
        type:Number,
     
        default:1
    }],
    producttype_id:{
        type:Number,
      
        default:1   
    }

},{timestamps:true})
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);