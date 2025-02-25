
import { NextResponse } from "next/server";
import { Stock } from "../../models/stock";
export const POST = async(req)=>{
    let payload = await req.json();

    try{
       const {stocks} = payload;
    let existingstock = await Stock.find({location_id:location_id,shop_id:1});
    if(existingstock.length>0){
        return NextResponse.json({message:"Address already exists",isSuccess:false},{status:400});
    }
    else{
        let Stocks = new Stock({stocks:stocks});
        await Stocks.save();
    }
        return NextResponse.json({message:"Address created successfully",isSuccess:true},{status:200});

    }catch(err){
        console.log(err);
        return NextResponse.json({message:err.message},{status:500});
    }
}
export const GET = async(req)=>{
    
    try{
        let stocks = await Stock.find({shop_id:1});
        if(tags){
            return NextResponse.json({data:stocks,message:"Stock fetched successfully"},{status:200});
        }
        return NextResponse.json({message:"No Stock found"},{status:404});
         
    }catch(err){
        return NextResponse.json({message:err.message},{status:500});
    }
}