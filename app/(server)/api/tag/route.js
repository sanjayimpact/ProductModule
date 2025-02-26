import { Tag } from "../../models/tags";
import { NextResponse } from "next/server";
export const POST = async(req)=>{
    let payload = await req.json();

    try{
       const {tag_name} = payload;
    let existingtag = await Tag.find({tag_name:tag_name,shop_id:1});
    if(existingtag.length>0){
        return NextResponse.json({message:"Tag already exists",isSuccess:false},{status:400});
    }
    else{
        let tag = new Tag({tag_name:tag_name});
        await tag.save();
    }
        return NextResponse.json({message:"Tag created successfully",isSuccess:true},{status:200});

    }catch(err){
        console.log(err);
        return NextResponse.json({message:err.message},{status:500});
    }
}
export const GET = async(req)=>{
    
    try{
        let tags = await Tag.find({shop_id:1});
        if(tags){
            return NextResponse.json({data:tags,message:"Tags fetched successfully" ,isSuccess:true},{status:200});
        }
        return NextResponse.json({message:"No tags found"},{status:404});
         
    }catch(err){
        return NextResponse.json({message:err.message},{status:500});
    }
}