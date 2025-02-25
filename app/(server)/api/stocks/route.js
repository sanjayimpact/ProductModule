
import { NextResponse } from "next/server";
import { Location } from "../../models/location";
export const POST = async(req)=>{
    let payload = await req.json();

    try{
       const {name,address} = payload;
    let existingadd = await Location.find({address:address,shop_id:1});
    if(existingadd.length>0){
        return NextResponse.json({message:"Address already exists",isSuccess:false},{status:400});
    }
    else{
        let Address = new Location({name:name,address:address});
        await Address.save();
    }
        return NextResponse.json({message:"Address created successfully",isSuccess:true},{status:200});

    }catch(err){
        console.log(err);
        return NextResponse.json({message:err.message},{status:500});
    }
}
export const GET = async(req)=>{
    
    try{
        let address = await Location.find({shop_id:1});
        if(tags){
            return NextResponse.json({data:address,message:"Address fetched successfully"},{status:200});
        }
        return NextResponse.json({message:"No address found"},{status:404});
         
    }catch(err){
        return NextResponse.json({message:err.message},{status:500});
    }
}