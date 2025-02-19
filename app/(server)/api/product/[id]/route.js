import { NextResponse } from "next/server";
import { Product } from "@/app/(server)/models/product";
import { Variant } from "@/app/(server)/models/variant";
import { Variantdetail } from "@/app/(server)/models/variantdetail";

export const DELETE = async(req,{params})=>{

    try{ 
        //get the productid from the params
        const { id } = await params;
        
        if(!id){
            return NextResponse.json({message:"Id is not present",isSuccess:false},{status:404})
        }
        //check id is exists or not
        let checkid = await Product.findOne({_id:id});
        if(!checkid){
            return NextResponse.json({message:"Id not Exists",isSuccess:false},{status:404})
        }
       
        //check the variant and variant details
        let variantcheck = await Variant.findOne({product_id:id});
        if(!variantcheck){
            return NextResponse.json({message:"Variant not exists",isSuccess:false},{status:404})
        }
      
        let variantdetails = await Variantdetail.findOne({variant_id:variantcheck?._id});
        if(!variantdetails){
            return NextResponse.json({message:"Variant details not available",isSuccess:false},{status:404})
        }
        //delete the product
          
        await Variantdetail.deleteMany({variant_id:variantcheck?._id});
        await Variant.deleteMany({product_id:id});
        await Product.deleteOne({_id:id});

    
    
      
      return NextResponse.json({message:"Successfully Delete Product",isSuccess:true},{status:200})
    }catch(err){
        return NextResponse.json({message:err.message,isSuccess:false},{status:400})
    }
}

export const GET = async (req, { params }) => {
    try {
      const { id } = params;
  
      // ✅ Fetch the product by ID
      const product = await Product.findById(id);
      if (!product) {
        return NextResponse.json({ message: "Product not found" ,data:[]}, { status: 200});
      }
  
      // ✅ Fetch variants for the product
      const variants = await Variant.find({ product_id: id });
  
      // ✅ Fetch variant details for each variant
      const variantData = await Promise.all(
        variants.map(async (variant) => {
          const variantDetails = await Variantdetail.find({ variant_id: variant._id });
         
         
         
          return {
            ...variant._doc, // Spread variant data
            variantDetails, // Attach variant details
          };
        })
      );
  
      // ✅ Structure response
      const responseData = {
        ...product._doc, // Spread product data
        variants: variantData, // Attach variants with details
      };
  
      return NextResponse.json({
        message: "Successfully fetched",
        data: responseData,
      });
    } catch (err) {
      console.error("Error fetching product:", err);
      return NextResponse.json({ message: err.message }, { status: 500 });
    }
  };