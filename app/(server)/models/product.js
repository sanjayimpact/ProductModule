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
    publish_status:{
  type:String,
trim:true,
enum:['Online Store','Other'],

    },
    page_title:
    {
        type:String,
        trim:true,
    },
    meta_description:{
        type:String,
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
        type:mongoose.Schema.Types.ObjectId,

        ref:'Brand',
       

    },
    tag_id:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Tag',
        default:[]
    }],
    producttype_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'ProductType',
        
    }

},{timestamps:true})
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);