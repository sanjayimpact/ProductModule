
import { NextResponse } from "next/server";
import { ProductType } from "../../models/product_type";
export const POST = async(req)=>{
    let payload = await req.json();

    try{
       const {product_type_name} = payload;
    let existingtag = await ProductType.find({product_type_name:product_type_name,shop_id:1});
    if(existingtag.length>0){
        return NextResponse.json({message:"ProductType already exists",isSuccess:false},{status:400});
    }
    else{
        let Brands = new ProductType({product_type_name:product_type_name});
        await Brands.save();
    }
        return NextResponse.json({message:"ProductType created successfully",isSuccess:true},{status:200});

    }catch(err){
        console.log(err);
        return NextResponse.json({message:err.message},{status:500});
    }
}
export const GET = async(req)=>{
    
    try{
        let productType= await ProductType.find({shop_id:1});
        if(productType){
            return NextResponse.json({data:productType,message:"ProductType fetched successfully",isSuccess:true},{status:200});
        }
        return NextResponse.json({message:"No ProductType found"},{status:404});
         
    }catch(err){
        return NextResponse.json({message:err.message},{status:500});
    }
}