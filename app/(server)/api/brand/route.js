
import { NextResponse } from "next/server";
import { Brand } from "../../models/brand";
export const POST = async(req)=>{
    let payload = await req.json();

    try{
       const {brand_name} = payload;
    let existingtag = await Brand.find({brand_name:brand_name,shop_id:1});
    if(existingtag.length>0){
        return NextResponse.json({message:"Brand already exists",isSuccess:false},{status:400});
    }
    else{
        let Brands = new Brand({brand_name:brand_name});
        await Brands.save();
    }
        return NextResponse.json({message:"Brand created successfully",isSuccess:true},{status:200});

    }catch(err){
        console.log(err);
        return NextResponse.json({message:err.message},{status:500});
    }
}
export const GET = async(req)=>{
    
    try{
        let tags = await Brand.find({shop_id:1});
        if(tags){
            return NextResponse.json({data:tags,message:"Brand fetched successfully",isSuccess:true},{status:200});
        }
        return NextResponse.json({message:"No Brand found"},{status:404});
         
    }catch(err){
        return NextResponse.json({message:err.message},{status:500});
    }
}