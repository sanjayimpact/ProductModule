import { NextResponse } from "next/server";
import { Product } from "../../models/product";
import { Variant } from "../../models/variant";
import { Variantdetail } from "../../models/variantdetail";
import connectDB from "../../lib/db";
import path from "path";
import fs from "fs";
import { Location } from "../../models/location";
import { Stock } from "../../models/stock";

//add products
export const POST = async (req, res) => {
  try {
    await connectDB();
    let isVariandetails;
    // ✅ Get FormData
    let stockid;

    let payload = await req.formData();

    let tags = payload.get("tags");

    let productType = payload.get("product_type") || " ";
    let alltags = tags?.split(",");
    const brand = payload.get("brand") || " ";

    // ✅ Extract Product Data
    const title = payload.get("title");
    const description = payload.get("description");
    const price = payload.get("price") || "0"; // Default price
    const sku = payload.get("sku") || ""; // Default SKU
    const status = payload.get("status") || "Draft"; // Default status
    const slug = payload.get("slug");
    const compareprice = payload.get("cprice") || "0";
    const costprice = payload.get("costprice") || "0";
    const Barcode = payload.get("Barcode") || " ";
    const isTax = payload.get("tax");
    const totalstock = payload.get("stocks");
    const weight = payload.get("weight");

    const publish_status = payload.get("publish");
    let page_title= payload.get("page_title");
   page_title= page_title || title;
   let meta_description = payload.get("meta_description");
   meta_description = meta_description || description;

    console.log(payload);
    // ✅ Process Images and Save Them Locally
    let featuredFilePaths = [];
    for (let [key, file] of payload.entries()) {
      if (key.startsWith("images[")) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = path.join("public/uploads", filename);

        // Save image locally
        fs.writeFileSync(filePath, buffer);
        featuredFilePaths.push(`/uploads/${filename}`);
      }
    }

    // ✅ Save Product
    const product = new Product({
      product_name: title,
      product_slug: slug,
      product_description: description,
      product_status: status,
      featured_image: featuredFilePaths,
      publish_status: publish_status,
      page_title: page_title ,
      meta_description: meta_description,
      // Only save `tag_id` if it has valid tags
      tag_id: alltags && alltags.length > 0 ? alltags : [],

      // Only save `brand_id` and `producttype_id` if valid, otherwise set to null
      brand_id: brand && brand.trim() !== "" ? brand : null,
      producttype_id:
        productType && productType.trim() !== "" ? productType : null,
    });

    await product.save();

    // ✅ Extract Options Dynamically
    const options = [];
    let optIndex = 0;
    // If no option is provided, add a default option.
    if (!payload.has(`options[${optIndex}][name]`)) {
      options.push({
        name: "Title",
        value: "Default Title",
      });
      isVariandetails = 0;
    }
    while (payload.has(`options[${optIndex}][name]`)) {
      options.push({
        name: payload.get(`options[${optIndex}][name]`),
        value: payload.get(`options[${optIndex}][value]`),
      });
      optIndex++;
      isVariandetails = 1;
    }
    if (totalstock) {
      //create a default location
      let defaultlocation = new Location({
        name: "default",
        address: "default address",
        isdefault: true,
      });
      let location = await defaultlocation.save();

      //create a stock for it
      let stock = new Stock({
        location_id: location?._id,
        stocks: totalstock,
        isdefault: true,
      });
      let stocks = await stock.save();

      stockid = stocks?._id;
    }

    // ✅ Process Variant Data from the Payload
    const savedVariants = [];
    // Check if any variant data is provided. If not, create an empty variant.
    if (!payload.has("variantdata[0][price]")) {
      // No variant data provided – create a default empty variant.
      const variantPrice = price;
      const variantStock = stockid;
      const variantImage = "";

      const attributes = {}; // no attributes

      const newVariant = new Variant({
        product_id: product._id,
        sku: sku, // SKU same as product
        price: variantPrice,
        compareprice: compareprice,
        barcode: Barcode,
        stock_Id: variantStock,
        costprice: costprice,
        variant_image: variantImage,
        isVariandetails: 0,
        istax: isTax,
        weight: weight,
        isdefault: true,
      });
      await newVariant.save();

      const variantDetail = new Variantdetail({
        variant_id: newVariant._id,
        Options: [], // no options
        option_values: {},
        isdefault: true,
      });
      await variantDetail.save();

      savedVariants.push(newVariant);
    } else {
      // Process each variant provided in the payload.
      let variantIndex = 0;
      while (payload.has(`variantdata[${variantIndex}][price]`)) {
        // Extract basic variant details
        const variantPrice =
          payload.get(`variantdata[${variantIndex}][price]`) || price;
        const variantStock = stockid;
        // payload.get(`variantdata[${variantIndex}][stock]`) || "0";
        const variantSku =
          payload.get(`variantdata[${variantIndex}][sku]`) ||
          (variantIndex === 0 ? sku : `${sku}-${variantIndex}`);

        // Process variant image (if provided)
        let variantImage = "";
        const file = payload.get(`variantdata[${variantIndex}][image]`);
        if (file && typeof file.arrayBuffer === "function") {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
          const filePath = path.join("public/uploads", filename);
          fs.writeFileSync(filePath, buffer);
          variantImage = `/uploads/${filename}`;
        }

        // Extract variant attributes
        let attributes = {};
        for (let [key, value] of payload.entries()) {
          const regex = new RegExp(
            `^variantdata\\[${variantIndex}\\]\\[attributes\\]\\[(.+)\\]$`
          );
          const match = key.match(regex);
          if (match) {
            const attrName = match[1];
            attributes[attrName] = value;
          }
        }

        // ✅ Create and Save Variant Document
        const newVariant = new Variant({
          product_id: product._id,
          sku: variantIndex === 0 ? sku : `${sku}-${variantIndex}`,
          price: variantPrice,
          costprice: costprice,
          barcode: Barcode,
          compareprice: compareprice,
          stock_Id: variantStock,
          variant_image: variantImage,
          isVariandetails: isVariandetails,
          istax: isTax,
          weight: weight,
          isdefault: variantIndex === 0 ? true : false,
        });
        await newVariant.save();

        // ✅ Save Variant Detail Document
        // Here, we assume the Variantdetail model stores the option names and their values.
        const variantDetail = new Variantdetail({
          variant_id: newVariant._id,
          Options: Object.keys(attributes), // e.g., ["color", "size"]
          option_values: attributes, // e.g., { color: "red", size: "l" }
          isdefault: variantIndex === 0 ? true : false,
        });
        await variantDetail.save();

        savedVariants.push(newVariant);
        variantIndex++;
      }
    }

    return NextResponse.json(
      {
        message: "Product successfully created with variants!",
        isSuccess: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error saving product:", err);
    return NextResponse.json(
      {
        error: "Error saving data",
        message: err.message,
        isSuccess: false,
      },
      { status: 500 }
    );
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
        let variants = await Variant.find({
          product_id: product._id,
          isVariandetails: 1,
        }).populate({ path: "stock_Id" });
        let stock = await Variant.find({
          product_id: product._id,
          isdefault: true,
        }).populate({ path: "stock_Id", select: "stocks" });
        let stocks = stock
          .map((variant) => variant.stock_Id)
          .filter((stock) => stock); // Removes null values

        let defaultstock = stocks[0]?.stocks || 0;
        let variantData = await Promise.all(
          variants.map(async (variant) => {
            let variantDetails = await Variantdetail.find({
              variant_id: variant._id,
            });

            return {
              ...variant._doc, // Spread variant data
              variantDetails, // Attach variant details
            };
          })
        );

        return {
          defaultstock,
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

export const PATCH = async (req, res) => {
  try {
    // Connect to the database
    await connectDB();
    let stockId;
    // Parse the incoming FormData
    const data = await req.formData();
  

    // Extract product fields from FormData
    const id = data.get("productId");
    const title = data.get("title");
    const description = data.get("description");
    const price = data.get("price");
    const status = data.get("status");
    const sku = data.get("sku");
    const slug = data.get("slug");
    const tax = data.get("istax");
    const costprice = data.get("costprice");
    const cprice = data.get("cprice");
    const barcode = data.get("barcode");
    const brandid = data.get("brand");
    const product_type = data.get("product_type");

    const publish_status =data.get("publish");
    let page_title= data.get("page_title");
   page_title= page_title || title;
   let meta_description = data.get("meta_description");
   meta_description = meta_description || description;
  




    const atags = new Set(data.get("tags")?.split(",") || []);
    const rtags = new Set(data.get("removetag")?.split(",") || []);

    // Check if the product exists
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(400)
        .json({ message: "Product not found", isSuccess: false });
    }
    const existingTags = new Set(
      (product.tag_id || []).map((id) => id.toString())
    );

    // Remove tags that are in rtags
    rtags.forEach((tag) => existingTags.delete(tag.toString())); // Ensure consistency in string format

    // Add only new unique tags
    atags.forEach((tag) => existingTags.add(tag.toString())); // Convert added tags to strings

    // Convert back to an array (if needed for MongoDB update)
    const updatedTags = Array.from(existingTags);

    // Update product details
    const updatedProduct = {
      product_name: title || product.product_name,
      product_description: description || product.product_description,
      product_slug: slug || product.product_slug,
      product_status: status || product.product_status,
      brand_id: brandid ? brandid : null,
      producttype_id: product_type ? product_type : null,
      tag_id: updatedTags,
      publish_status: publish_status || product.publish_status,
      page_title: page_title || product.page_title,
      meta_description: meta_description || product.meta_description,
    };

    // Process new images
    const featuredFilePaths = [];
    for (const [key, file] of data.entries()) {
      if (key.startsWith("images[")) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = path.join("public/uploads", filename);
        fs.writeFileSync(filePath, buffer);
        featuredFilePaths.push(`/uploads/${filename}`);
      }
    }

    // Add new images to the product
    if (featuredFilePaths.length > 0) {
      updatedProduct.featured_image = [
        ...product.featured_image,
        ...featuredFilePaths,
      ];
    }

    // Process removed images in product one
    const removedImages = [];
    let removeImgIndex = 0;
    while (data.has(`removedImages[${removeImgIndex}]`)) {
      removedImages.push(data.get(`removedImages[${removeImgIndex}]`));
      removeImgIndex++;
    }
    if (removedImages.length > 0) {
      updatedProduct.featured_image = product.featured_image.filter(
        (img) => !removedImages.includes(img)
      );
    }

    // Save the updated product
    await Product.findByIdAndUpdate(id, updatedProduct);

    // Process removed variants by id single variants
    let removevariantIdsToDelete = [];
    const removeVariations = data.getAll("removeVariations");
    if (removeVariations.length > 0) {
      const existingVariants = await Variant.find({ product_id: id });
      if (existingVariants.length === removeVariations.length) {
        // If all variants are to be removed, update the last one to default values
        const lastVariantId = removeVariations.pop();
        await Variant.findByIdAndUpdate(lastVariantId, {
          price: price || existingVariants[0].price,
          stock_Id: existingVariants[0].stock_Id,
          variant_image: "",
          sku: sku || existingVariants[0].sku,
          isVariandetails: 0,
          isdefault: true,
          costprice: costprice,
          compareprice: cprice,
          barcode: barcode,

          istax: tax,
        });
        await Variantdetail.findOneAndUpdate(
          { variant_id: lastVariantId },
          {
            Options: [],
            option_values: {},
            isdefault: true,
          }
        );
      }

      await Variantdetail.deleteMany({
        variant_id: { $in: removeVariations },
        isdefault: false,
      });
      await Variant.deleteMany({
        _id: { $in: removeVariations },
        isdefault: false,
      });
    }

    //delete multuple options

    const removeOptions = {};
    let removeIndex = 0;

    while (data.has(`removeoptions[${removeIndex}][name]`)) {
      const optionName = data.get(`removeoptions[${removeIndex}][name]`);
      let removedValues = [];

      let valueIndex = 0;
      while (data.has(`removeoptions[${removeIndex}][values][${valueIndex}]`)) {
        removedValues.push(
          data.get(`removeoptions[${removeIndex}][values][${valueIndex}]`)
        );
        valueIndex++;
      }
      // making a object of the values with the option name
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
          const variantIdsToDelete = variantsToDelete.map((v) =>
            v.variant_id.toString()
          );
          removevariantIdsToDelete.push(...variantIdsToDelete);
          if (variantIdsToDelete.length > 0) {
            const get = await Variant.deleteMany({
              _id: { $in: variantIdsToDelete },
              isdefault: false,
            });

            const details = await Variantdetail.deleteMany({
              variant_id: { $in: variantIdsToDelete },
              isdefault: false,
            }); // Deletes Variant details
            const updateVariant = await Variant.findOne({
              _id: { $in: variantIdsToDelete },
              isdefault: true,
            });

            const updateDetails = await Variantdetail.findOne({
              variant_id: { $in: variantIdsToDelete },
              isdefault: true,
            });

            if (updateVariant) {
              updateVariant.isVariandetails = 0;
              updateVariant.costprice = costprice;
              updateVariant.compareprice = cprice;
              updateVariant.barcode = barcode;
              updateVariant.istax = tax;

              await updateVariant.save();
            }
            if (updateDetails) {
              (updateDetails.Options = []), (updateDetails.option_values = {});
              await updateDetails.save();
            }
          }
        }
      }
    }
let findid = await Location.findOne({isdefault:true});

let lid = findid?._id;
    let locationid = data.get(`variantdata[0][locationid]`);
    if(locationid==='null'){
       locationid=lid;
    }
    let variantIndex = 0;
    while (data.has(`variantdata[${variantIndex}][price]`)) {
      const variantId = data.get(`variantdata[${variantIndex}][id]`);
      let stockId = data.get(`variantdata[${variantIndex}][stockid]`); // Get stockId

      const variantPrice =
        data.get(`variantdata[${variantIndex}][price]`) || price;
      const variantStock =
        data.get(`variantdata[${variantIndex}][stock]`) || "0";
      const variantbarcode =
        data.get(`variantdata[${variantIndex}][barcode]`) || " ";
      const variantsSku =
        data.get(`variantdata[${variantIndex}][sku]`) ||
        `${sku}-${variantIndex}`;

      let variantImage = "";

      // update the variant image
      const file = data.get(`variantdata[${variantIndex}][image]`);
      if (file && typeof file.arrayBuffer === "function") {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = path.join("public/uploads", filename);
        fs.writeFileSync(filePath, buffer);
        variantImage = `/uploads/${filename}`;
      } else {
        // If no new image, try to use the existing image if the variant exists
        if (variantId && variantId !== "null") {
          const existingVariant = await Variant.findById(variantId);
          if (existingVariant) {
            variantImage = existingVariant.variant_image;
          }
        }
      }

      // Extract variant attributes
      const attributes = {};
      for (const [key, value] of data.entries()) {
        const regex = new RegExp(
          `^variantdata\\[${variantIndex}\\]\\[attributes\\]\\[(.+)\\]$`
        );
        const match = key.match(regex);
        if (match) {
          attributes[match[1]] = value;
        }
      }

      if (!stockId || stockId === "null") {
        const newStock = new Stock({
          location_id: locationid,
          stocks: variantStock,
        });

        await newStock.save();
        console.log(newStock);
        stockId = newStock._id; // Assign newly created stockId
      } else {
        const updateStock = await Stock.findOneAndUpdate(
          { _id: stockId },
          { stocks: variantStock },
          { new: true }
        );
        console.log(updateStock);
      }

      // If variantId is "null" or not provided, create a new variant & variantdetail
      if (
        (!variantId || variantId === "null") &&
        !removevariantIdsToDelete.includes(variantId)
      ) {
        const newVariant = await Variant.create({
          product_id: id,
          price: variantPrice,
          stock_Id: stockId,
          variant_image: variantImage,
          sku: variantsSku,
          isVariandetails: 1,
          costprice: costprice,
          compareprice: cprice,
          barcode: variantbarcode,

          istax: tax,
        });
        await Variantdetail.create({
          variant_id: newVariant._id,
          Options: Object.keys(attributes),
          option_values: attributes,
        });
      } else if (!removevariantIdsToDelete.includes(variantId)) {
        const updatedVariant = await Variant.findOneAndUpdate(
          { _id: variantId },
          {
            prodct_id: id,
            price: variantPrice,
            stock_Id: stockId,
            variant_image: variantImage,
            sku: variantsSku,
            istax: tax,
            costprice: costprice,
            compareprice: cprice,
            barcode: variantbarcode,
            isVariandetails: Object.keys(attributes).length > 0 ? 1 : 0,
          },
          { new: true }
        );

        const updatedetails = await Variantdetail.findOneAndUpdate(
          { variant_id: updatedVariant._id },
          {
            Options: Object.keys(attributes),
            option_values: attributes,
          },
          { new: true }
        );
        console.log(updatedetails, "below one");
      }
      variantIndex++;
    }

    return NextResponse.json({
      message: "Update Successfully",
      isSuccess: true,
    });
  } catch (err) {
    console.error("Error updating product:", err);
    return NextResponse.json({
      error: "Error updating data",
      message: err.message,
      isSuccess: false,
    });
  }
};
