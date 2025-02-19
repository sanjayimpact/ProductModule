import { NextResponse } from "next/server";
import { Product } from "../../models/product";
import { Variant } from "../../models/variant";
import { Variantdetail } from "../../models/variantdetail";
import connectDB from "../../lib/db";
import multer from "multer";
import { promisify } from "util"; 
import path from "path";
import fs from "fs";



// Function to generate all possible variant combinations
const generateVariants = (options) => {
  const keys = options.map((option) => option.name);
  const values = options.map((option) => option.value.split(",")); // Split values by ","

  const cartesianProduct = (arrays) => {
    return arrays.reduce(
      (acc, curr) =>
        acc.flatMap((accItem) => curr.map((currItem) => [...accItem, currItem])),
      [[]]
    );
  };

  const combinations = cartesianProduct(values);
  return combinations.map((combination, index) =>
    keys.reduce((acc, key, i) => ({ ...acc, [key]: combination[i] }), { index })
  );
};






//add products
export const POST = async (req, res) => {
  try {
    await connectDB();
let isVariandetails;
    // ✅ Get FormData
    let payload = await req.formData();


    // ✅ Extract Product Data
    const title = payload.get("title");
    const description = payload.get("description");
    const price = payload.get("price") || "0"; // Default price
    const sku = payload.get("sku") || ""; // Default empty SKU
    const status = payload.get("status") || "Draft"; // Default status
    const slug = payload.get("slug");

    let files = [];
    let feturedfilePaths = [];
    for (let [key, file] of payload.entries()) {
      if (key.startsWith("images[")) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = path.join("public/uploads", filename);

        // Save image locally
        fs.writeFileSync(filePath, buffer);
        feturedfilePaths.push(`/uploads/${filename}`);
      }
      
    }

 
  
    
  


    // ✅ Save Product
    const product = new Product({
      product_name: title,
      product_slug: slug,
      product_description: description,
      product_status: status,
      featured_image:feturedfilePaths,
    });
    await product.save();

    // ✅ Extract Options Dynamically
    const options = [];
    let optIndex = 0;
if(!payload.has(`options[${optIndex}][name]`)){
     options.push({
      name:"Title",
      value:"Default Title"
     })
     isVariandetails=0;
    }
  

    while (payload.has(`options[${optIndex}][name]`)) {
      options.push({
        name: payload.get(`options[${optIndex}][name]`),
        value: payload.get(`options[${optIndex}][value]`),
      });
      optIndex++;
      isVariandetails=1;
    }

    // ✅ Generate Variants Automatically
    const generatedVariants = generateVariants(options);

    // ✅ Save Variants and Variant Details
    const savedVariants = [];
    for (const variant of generatedVariants) {
      // ✅ Extract variant details
      const variantPrice = payload.get(`variantdata[${variant.index}][price]`) || price;
      const variantStock = payload.get(`variantdata[${variant.index}][stock]`) || "0";
      let variantImage = ""; // Initialize empty image path
    
      // ✅ Check if an image exists for this variant
      const file = payload.get(`variantdata[${variant.index}][image]`);
    
      if (file && typeof file.arrayBuffer === "function") {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = path.join("public/uploads", filename);
    
        // Save the file locally
        fs.writeFileSync(filePath, buffer);
    
        // Save relative path for MongoDB
        variantImage = `/uploads/${filename}`;
      }
    
      // ✅ Create and Save Variant
      const newVariant = new Variant({
        product_id: product._id,
        sku: variant.index === 0 ? sku : `${sku}-${variant.index}`,
        price: variantPrice,
        stock_quantity: variantStock,
        variant_image: variantImage,
        isVariandetails:isVariandetails // ✅ Store saved image path
      });
    
      await newVariant.save();
    
      // ✅ Save Variant Details
      const variantDetail = new Variantdetail({
        variant_id: newVariant._id,
        Options: Object.keys(variant).filter((key) => key !== "index"),
        option_values: Object.fromEntries(
          Object.entries(variant).filter(([key]) => key !== "index"))
      });
    
      await variantDetail.save();
      savedVariants.push(newVariant);
    }
    
    return NextResponse.json({
      message: "Product successfully created!",
    
      isSuccess:true
    },{ status: 200 });
  } catch (err) {
    console.error("Error saving product:", err);
    return NextResponse.json({ error: "Error saving data", message: err.message,isSuccess:false}, { status: 500 });
  }
};


// get the product
export const GET = async () => {
  try {
  

    // ✅ Fetch all products
    let products = await Product.find({});

    // ✅ Fetch variants and variant details for each product
    let responseData = await Promise.all(
      products.map(async (product) => {
        let variants = await Variant.find({ product_id: product._id ,isVariandetails:1});

        let variantData = await Promise.all(
          variants.map(async (variant) => {
            let variantDetails = await Variantdetail.find({ variant_id: variant._id });

            return {
              ...variant._doc, // Spread variant data
              variantDetails, // Attach variant details
            };
          })
        );

        return {
          ...product._doc, // Spread product data
          variants: variantData, // Attach variants with details
        };
      })
    );

    return NextResponse.json({
      message: "Successfully fetched",
      data: responseData,
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};


// update products
export const PATCH = async (req, res) => {
  try {
    let isVariandetails;
    let variantStock;
    let variantPrice;
    const data = await req.formData();
    const id = data.get("productId");


    const title = data.get("title");
    const description = data.get("description");
    const price = data.get("price");
    const status = data.get("status");
    const sku = data.get("sku");
    const slug = data.get("slug");

    // ✅ Check if product exists
    let check = await Product.findOne({ _id: id });
    if (!check) {
      return NextResponse.json(
        { message: "Product not found", isSuccess: false },
        { status: 400 }
      );
    }   
     let feturedfilePaths = [];
    for (let [key, file] of data.entries()) {
      if (key.startsWith("images[")) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = path.join("public/uploads", filename);

        // Save image locally
        fs.writeFileSync(filePath, buffer);
        feturedfilePaths.push(`/uploads/${filename}`);
      }
      
    }

    // ✅ Check if at least one variant exists
    let checkvariant = await Variant.findOne({ product_id: id });
    if (!checkvariant) {
      return NextResponse.json(
        { message: "Variant not found", isSuccess: false },
        { status: 400 }
      );
    }

    // ✅ Check if variant details exist
    let variantdetails = await Variantdetail.findOne({
      variant_id: checkvariant?._id,
    });
    if (!variantdetails) {
      return NextResponse.json(
        { message: "Variant details not found", isSuccess: false },
        { status: 400 }
      );
    }
 //code for remove the images 
 const removedImages =[];
 let removeIndexx=0;
 while(data.has(`removedImages[${removeIndexx}]`)){

removedImages.push(data.get(`removedImages[${removeIndexx}]`));
removeIndexx++;
 }


 if(removedImages.length>0){
  
  let find = await Product.updateOne({_id:id},{$pull:{ featured_image:{$in:removedImages}}});


 }


    // ✅ Update the product
    await Product.updateOne(
      { _id: id }, // Ensure only the correct product is updated
      {
        $set: {
          product_name: title,
          product_description: description,
          product_slug: slug,
          product_status: status,
         
         
        },
        $push: { featured_image: feturedfilePaths }
      }
    );

  



    // ✅ Extract options dynamically
    const options = [];
    let optIndex = 0;


    
    
    while (data.has(`options[${optIndex}][name]`)) {
      options.push({
        name: data.get(`options[${optIndex}][name]`),
        value: data.get(`options[${optIndex}][value]`),
      });
      optIndex++;
      isVariandetails = 1;
    }
    if (options.length === 0) {
      isVariandetails = 0; 
      variantStock = 0;
      variantPrice = 0; // Set isVariandetails to 0 if no options are selected
     console.log("hello");
     await Variant.findOneAndDelete({product_id:id});
     
   
    }
    // ✅ Extract removed options dynamically
    const removeOptions = {};
    let removeIndex = 0;
    while (data.has(`removeoptions[${removeIndex}][name]`)) {
      const optionName = data.get(`removeoptions[${removeIndex}][name]`);
      let removedValues = [];

      let valueIndex = 0;
      while (data.has(`removeoptions[${removeIndex}][values][${valueIndex}]`)) {
        removedValues.push(data.get(`removeoptions[${removeIndex}][values][${valueIndex}]`));
        valueIndex++;
      }

      removeOptions[optionName] = removedValues;
      removeIndex++;
    }


    // ✅ Delete Variants that Match Removed Options
    if (Object.keys(removeOptions).length > 0) {
      for (const [optionName, removedValues] of Object.entries(removeOptions)) {
        // Find all variants with matching option values to delete
        const variantsToDelete = await Variantdetail.find({
          [`option_values.${optionName}`]: { $in: removedValues },
        });

        if (variantsToDelete.length > 0) {
          // Extract variant IDs to delete
          const variantIdsToDelete = variantsToDelete.map((v) => v.variant_id);
          
          // Delete the variants from both collections
          await Variant.deleteMany({ _id: { $in: variantIdsToDelete } });
          await Variant.deleteOne({_id:variantIdsToDelete});
          await Variantdetail.deleteMany({ variant_id: { $in: variantIdsToDelete } });

       
        }
      }
    }

    // ✅ Generate new variants from updated options
    const generatedVariants = generateVariants(options);
 

    const savedVariants = [];

    for (const variant of generatedVariants) {
      // Get the correct index to fetch price and stock data
       variantPrice =
        data.get(`variantdata[${variant.index}][price]`) || price;
   variantStock =
        data.get(`variantdata[${variant.index}][stock]`) || "0";
    
        let   variantImage = ""; // Set empty by default
      const file = data.get(`variantdata[${variant.index}][image]`);
    
      if (file && typeof file.arrayBuffer === "function") {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = path.join("public/uploads", filename);
    
        // Save the file locally
        fs.writeFileSync(filePath, buffer);
    
        // Save relative path for MongoDB
        variantImage = `/uploads/${filename}`;
      } else {
        // ✅ Preserve existing image if no new image is uploaded
        const existingVariant = await Variant.findOne({
          product_id: id,
          sku: variant.index === 0 ? sku : `${sku}-${variant.index}`,
        });
    
        if (existingVariant) {
          variantImage = existingVariant.variant_image; // Keep old image
        }
      }
    
      // ✅ Update existing variant or create a new one
      let updatedVariant = await Variant.findOneAndUpdate(
        { product_id: id, sku: variant.index === 0 ? sku : `${sku}-${variant.index}` },
        {
          $set: {
            price: variantPrice,
            stock_quantity: variantStock,
            variant_image: variantImage,
            isVariandetails:isVariandetails // ✅ Retain old image if no new one is uploaded
          },
        },
        { new: true, upsert: true }
      );
    
      // ✅ Update Variant Details
      await Variantdetail.findOneAndUpdate(
        { variant_id: updatedVariant._id },
        {
          $set: {
            Options: Object.keys(variant).filter((key) => key !== "index"),
            option_values: Object.fromEntries(
              Object.entries(variant).filter(([key]) => key !== "index")
            ),
          },
        },
        { new: true, upsert: true }
      );
    
      savedVariants.push(updatedVariant);
    }

    return NextResponse.json(
      { message: "Update Successfully", isSuccess: true },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating product:", err);
    return NextResponse.json(
      { error: "Error updating data", message: err.message, isSuccess: false },
      { status: 500 }
    );
  }
};


// delete product 
