"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import Image from "next/image";
import DeleteIcon from "@mui/icons-material/Delete";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);


  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}


const InventoryTable = ({
  options,
  handleaddvariants,
  price,
  images,
  Barcode,
  handleRemovedVariants,
  currentProduct,sku,stock 

}) => {
  const [groupedOptions, setGroupedOptions] = useState({});
  const [variantData, setVariantData] = useState([]);
  const [removedVariants, setRemovedVariants] = useState([]);
    const [checksku, setchecksku] = useState(false);
    const [skuError, setSkuError] = useState(false);
  const computeSku = variantData?.sku?.toUpperCase().trim().replace(/\s+/g, "-");
  const debouncedSku = useDebounce(computeSku, 500);

  // ✅ Convert uploaded image to URL (For preview purposes)
  // ;
  // ✅ Group options dynamically when options change
  useEffect(() => {
    const grouped = options.reduce((acc, option) => {
      let values = option.value;
      acc[option.name] = Array.isArray(values)
        ? values
        : values.split(",").map((v) => v.trim());
      return acc;
    }, {});
    setGroupedOptions(grouped);
  }, [options]);

  // ✅ When currentProduct.variants exist, map them properly into variantData
  useEffect(() => {
    if (currentProduct?.variants?.length) {
 
  
      const formattedVariants = currentProduct.variants.map((variant, index) => {
      
  
        return {
          id: variant._id || index, // Use _id if available, otherwise index
          attributes: variant.variantDetails
            ? variant.variantDetails.reduce((acc, detail) => {
                return { ...acc, ...detail.option_values }; // Merging attributes
              }, {})
            : {},
          preview: variant.variant_image || "",
          image: variant.variant_image || "",
          price: variant.price || price || 0,
          stock: variant.stock_Id.stocks || stock || 0,
          sku: variant.sku || sku || "",
          barcode: Barcode || variant.barcode || "",

        };
      });
  
      setVariantData(formattedVariants);
      generateVariants();
    } else {
      generateVariants(); // If no variants exist, generate new ones
    }
  }, [currentProduct, groupedOptions]);
  

 
 // ✅ Generate variant combinations from options & include images from currentProduct
const generateVariants = () => {
  const optionKeys = Object.keys(groupedOptions);
  const optionValues = Object.values(groupedOptions).filter((arr) => arr.length > 0);

  if (optionValues.length === 0) {
    setVariantData([]);
    return;
  }

  const allCombinations = optionValues.reduce((acc, curr) => {
    if (acc.length === 0) return curr.map((item) => [item]);
    return acc.flatMap((prev) => curr.map((item) => [...prev, item]));
  }, []);

  const formattedVariants = allCombinations.map((variantArray, index) => {
    const variantObject = {};
    variantArray.forEach((value, i) => {
      variantObject[optionKeys[i]] = value;
    });

    // ✅ Get Image from Database if available
    const existingVariant = currentProduct?.variants?.[index];

    return {
      id: existingVariant?._id,
      attributes: variantObject,
      image: "", // Will be updated when user uploads new image
      preview: existingVariant?.variant_image || "", // ✅ Show database image in preview
      price: existingVariant?.price || price || 0,
      stock: existingVariant?.stock_Id?.stocks || stock  || 0,
      sku: existingVariant?.sku || (index === 0 ? sku : `${sku}-${index}`) || " ",
      stockid:existingVariant?.stock_Id?._id,
      locationid:existingVariant?.stock_Id?.location_id,
      barcode:existingVariant?.barcode || Barcode || "",
    };
  });

  setVariantData(formattedVariants);
};


  // ✅ Handle Image Upload for each variant
  const handleImageChange = (event, index) => {
    const file = event.target.files[0];
  
    if (file) {
      const previewURL = URL.createObjectURL(file); // ✅ Generate preview URL
  
      setVariantData((prevData) =>
        prevData.map((item, i) =>
          i === index ? { ...item, image: file, preview: previewURL } : item
        )
      );
    }
  };
  const checkSkuAvailability = async (sku, index) => {
    if (!sku.trim()) return;
    const currentVariant = variantData[index];
  
    // ✅ Skip check if SKU is unchanged
    if (currentVariant?.sku === sku) return;
    
    setchecksku(true); // Show loading indicator
  
    try {
      let newSku = sku.toUpperCase().trim().replace(/\s+/g, "-");
      let attempt = 1;
      let isAvailable = false;
  
      // ✅ Loop until we find a unique SKU
      while (!isAvailable) {
        const response = await axios.get(`/api/sku?sku=${newSku}`);
  
        // Check if the SKU already exists in the database (response from API)
        if (!response.data.exists && !variantData.some((variant) => variant.sku === newSku)) {
          isAvailable = true;
        } else {
          newSku = `${sku}-${attempt}`; // Create a new SKU if the previous one exists
          attempt++;
        }
      }
  
      // ✅ Update the SKU in state after finding a unique one
      setVariantData((prevData) =>
        prevData.map((item, i) => (i === index ? { ...item, sku: newSku } : item))
      );
  
      setSkuError(false);
    } catch (error) {
      console.error("Error checking SKU availability:", error);
      setSkuError(true);
    } finally {
      setchecksku(false);
    }
  };
  


  

  // ✅ Handle price, stock, and SKU changes
  const handleChange = (index, field, value) => {
    if (field === "sku") {
      checkSkuAvailability(value, index); // Check SKU when changed
    }
  
    if (field === "price") {
      const regex = /^(?!.*[ _])\d*\.?\d{0,2}$/;
      if (!regex.test(value)) {
        return; // Exit if input is invalid
      }
    }
  
    setVariantData((prevData) =>
      prevData.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };
  

  // ✅ Send updated variant data to parent component

  const handledelete = (index,id) => {
   
    setRemovedVariants((prev) => {
      if (id !== undefined && id !== null) {
        return [...prev.filter((item) => item !== undefined && item !== null), id];
      }
      return prev;
    });
    
   

    


    
    // Remove the variant from the local state
    setVariantData((prevVariants) => prevVariants.filter((_, i) => i !== index));
  };
  
  useEffect(() => {
    if (handleRemovedVariants) {
      handleRemovedVariants(removedVariants);
    }
  }, [removedVariants, handleRemovedVariants]);
  useEffect(() => {
  
    handleaddvariants(variantData);
 
  }, [variantData]);
  useEffect(() => {
    if (debouncedSku) {
      checkSkuAvailability(debouncedSku);
    }
  }, [debouncedSku]);
  
  return (
    <Box sx={{ mt: 5 }}>
      <TableContainer component={Paper} sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", p: 3,textAlign:'center' }}>
          Variants Details
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">Image</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">Variant</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">Price</Typography>
              </TableCell>
              
              <TableCell>
                <Typography variant="body2" fontWeight="bold">Available Stock</Typography>
              </TableCell>
           
           
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">SKU</Typography>
                </TableCell>
            
              <TableCell>
                <Typography variant="body2" fontWeight="bold">BarCode</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {variantData.length > 0 ? (
              variantData.map((variant, index) => (
                <TableRow key={index}>
                  {/* Image Upload */}
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, index)}
                        style={{ display: "none" }}
                        id={`image-upload-${index}`}
                      />
                      <label htmlFor={`image-upload-${index}`}>
                        <Image
                          src={variant.preview || "https://fakeimg.pl/50x50"}
                          alt="Upload"
                          width={50}
                          height={50}
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            cursor: "pointer",
                            border: "1px dashed #ccc",
                            borderRadius: 8,
                          }}
                        />
                      </label>
                    </Box>
                  </TableCell>

                  {/* Variant Attributes */}
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {Object.entries(variant.attributes).map(([key, value], idx, arr) => (
                        <span key={key}>
                          <strong>{key}:</strong> {value} {idx < arr.length - 1 && " / "}
                        </span>
                      ))}
                    </Box>
                  </TableCell>

                  {/* Price Input */}
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="₹ 0.00"
                      value={variant.price}
                      onChange={(e) => handleChange(index, "price", e.target.value)}
                      inputProps={{ style: { textAlign: "right" } }}
                    />
                  </TableCell>

                  {/* Stock Input */}
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleChange(index, "stock", e.target.value)}
                      inputProps={{ min: 0, style: { textAlign: "center" } }}
                    />
                  </TableCell>

                  {/* SKU Input */}
                
                  <TableCell>
  <TextField
    variant="outlined"
    size="small"
    value={variant.sku}
    onChange={(e) => handleChange(index, "sku", e.target.value)}
    error={skuError || checksku}
    helperText={
      checksku
        ? "Sku exists, generating new one..."
        : skuError
        ? "check availability"
        : ""
    }
    inputProps={{ style: { textAlign: "center" } }}
  />
</TableCell>
                  <TableCell>
  <TextField 
    variant="outlined"
    size="small"
    value={ variant.barcode || Barcode }
    onChange={(e) => handleChange(index, "barcode", e.target.value)}
  
  />
</TableCell>
<TableCell>
<IconButton onClick={()=>handledelete(index,variant.id)} color="error"  size="small">
                    <DeleteIcon />
                  </IconButton>
</TableCell>

                  
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No variants available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoryTable;
