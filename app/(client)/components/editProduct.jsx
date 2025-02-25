"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Divider,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  InputAdornment,
  FormLabel,
  FormGroup,

} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

import Variants from "./variants";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useECart } from "../Context/eCartcontext";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
// Custom hook to debounce a value
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function EditProductForm({ currentProduct }) {

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const { setshow, allbrands, vendorinput, selectedVendor, setvendorinput, setSelectedVendor, getBrands, selectedTags, setSelectedTags, setinputProducttype, setProductType, selectedProducttype, allProductType, getproducttype, productinput, getTags, alltags, inputvalue, setInputvalue } = useECart();
  const router = useRouter();

  const [editProduct, seteditProduct] = useState(true);
  const [lastCheckedSlug, setLastCheckedSlug] = useState("")
  const[removetag,setremovetag] = useState([]);
const[checkedtag,setchecked] = useState()

  // Initialize form data with currentProduct (if editing)
  const [formData, setFormData] = useState({
    title: currentProduct?.product_name || "",
    description: currentProduct?.product_description || "",
    // If you have at least one variant, use its price & sku; otherwise blank
    price: currentProduct?.variants?.[0]?.price || "",
    sku: currentProduct?.variants?.[0]?.sku || "",
    images: currentProduct?.featured_image ? [...currentProduct.featured_image] : [],
    status: currentProduct?.product_status || "",
    publish:currentProduct?.publish_status || "",
    slug: currentProduct?.product_slug || "",
    costprice: currentProduct?.variants?.[0]?.costprice || "",
    cprice: currentProduct?.variants?.[0]?.compareprice || "",
    Barcode: currentProduct?.variants?.[0]?.barcode,
    stocks: currentProduct?.variants?.[0]?.stock_Id?.stocks || 0,
    brandName: currentProduct?.brand_id?.brand_name,
    page_title:currentProduct?.page_title || "",
    meta_description:currentProduct?.meta_description || "",


  });
  const [removedImages, setRemovedImages] = useState([]);

  // States for errors, messages, etc. (unchanged)
  const [iserror, seterror] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // States for variants
  const [variants, setvariants] = useState([]);

  // 1) Local state to hold the combined “option name -> array of values”
  const [existingOptions, setExistingOptions] = useState([]);
  const [extractvariants, setExtractedVariants] = useState([]);

  // States for slug / sku checking (unchanged)
  let splitweight = currentProduct?.variants?.[0]?.weight.split(" ")[0];
    const [weight, setWeight] = useState( splitweight|| 0);
    const [unit, setUnit] = useState("kg");
    const totalWeight = `${weight} ${unit}`;
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState(false);
  const [checksku, setchecksku] = useState(false);
  const [skuError, setSkuError] = useState(false);
  const [options, setOptions] = useState([]);
  const [removeoptions, setremoveoptions] = useState([]);
  const [removevariation, setremovevariation] = useState([]);
  const [isTaxed, setIsTaxed] = useState(currentProduct?.variants?.[0]?.istax);
  // Debounce logic (unchanged)
  const computedSlug = formData.slug.toLowerCase().trim().replace(/\s+/g, "-");
  const debouncedSlug = useDebounce(computedSlug, 500);
  const computeSku = formData.sku.toUpperCase().trim().replace(/\s+/g, "-");
  const debouncedSku = useDebounce(computeSku, 500);

  const handlevendor = (e) => {
    const newValue = e?.target?.value || '';
    const values = newValue.replace(/[^a-zA-Z0-9_-]/g, '');



    setvendorinput(values)
  }
  const handleproductype = (e) => {
    const newValue = e?.target?.value || '';
    const values = newValue.replace(/[^a-zA-Z0-9_-]/g, '');



    setinputProducttype(values);
  }
  const handleinput = (e) => {

    const newValue = e.target.value;

    const values = newValue.replace(/[^a-zA-Z0-9_-]/g, '');

    setInputvalue(values);

  }
  const handleTagChange = (_, newValue) => {
    // Remove duplicates by converting to a Set and back to an array
    const uniqueTags = Array.from(new Set(newValue.map(tag => tag.tag_name)))
      .map(tag_name => newValue.find(tag => tag.tag_name === tag_name));
  
    // Find removed tag(s) by comparing old and new arrays
    const removedTags = selectedTags.find(tag => !uniqueTags.includes(tag));
  
    if (removedTags) {
      setremovetag((prev) => [...prev, removedTags]); // Store removed tag
    }
  
    setSelectedTags(uniqueTags); // Update selected tags with unique values
  };
  
  

  const Addnewtags = async () => {
    try {
      let addtag = await axios.post("/api/tag", { tag_name: inputvalue });

      getTags();
    } catch (err) {

    }


  }
  const Addnewvendor = async () => {
    try {
      let addbrand = await axios.post("/api/brand", { brand_name: vendorinput });
      
      getBrands();
    } catch (err) {

    }
  }

  const Addnewpt = async () => {
    try {
      let addbrand = await axios.post("/api/product_type", { product_type_name: productinput });
     
      getproducttype();
    } catch (err) {

    }
  }



  useEffect(() => {
    getBrands();
    getTags();
    getproducttype();

    if (currentProduct?.variants?.length) {
      // Set the entire variants array in state (unchanged)
      setvariants(currentProduct.variants);

      // Combine all option_values into a single object: { color: Set(), size: Set(), ... }
      let combinedOptions = {};


      currentProduct.variants.forEach((variant) => {





        // Each variant may have multiple "variantDetails"
        variant.variantDetails?.forEach((detail) => {
          // detail.option_values => { color: "blue", size: "l", pack: "1" }
          Object.entries(detail.option_values).forEach(([key, val]) => {
            if (!combinedOptions[key]) {
              combinedOptions[key] = new Set();
            }
            combinedOptions[key].add(val);
          });
        });

      });

      // Turn that into an array: [{ name: "color", value: ["blue", "red"] }, ...]
      const extractedOptions = Object.entries(combinedOptions)
        .map(([optionName, valSet]) => ({
          name: optionName,
          value: Array.from(valSet),
        }))
        .filter(option => !(option.name === 'Title' && option.value.includes('Default Title'))); // Filter out 'Title' with 'Default Title'


      // Put these into local state so we can pass them to <Variants />
      setExistingOptions(extractedOptions);

    }
  }, [currentProduct]);

  // Simple validation (unchanged)
  const validate = (field, value) => {
    const newErrors = { ...errors };
    if (field === "title" && !value) {
      newErrors.title = "Title is required";
    } else if (field === "price" && (!value || isNaN(value) || value <= 0)) {
      newErrors.price = "Price must be a positive number";
    } else if (field === "sku" && !value) {
      newErrors.sku = "SKU is required";

    }

    else if (field === "cprice" && (!value || isNaN(value) || value <= 0)) {
      newErrors.cprice = "Compare price must be a positive number"

    } else if (field === "costprice" && (!value || isNaN(value) || value <= 0)) {
      newErrors.costprice = "Cost price must be a positive number"

    }




    else if (field === "description" && !value) {
      newErrors.description = "Description is required"
    }
    else {
      delete newErrors[field];
    }
    setErrors(newErrors);
  };

  // Controlled fields (unchanged)
  const handleChange = (field) => (event) => {
    const { value } = event.target;
    let updatedValue = value;
    if(field==="page_title"  && value.length>70){
      return
    }
    if(field==="meta_description"  && value.length>160){
      return;
    }
    if(field==="description" && value.length>160){
      return;
    }

    
    if (field === "slug") {
      updatedValue = value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-");
    }
    if (field === "slug") {
      setSlugError(value.trim() === "")
    }


    setFormData((prev) => ({ ...prev, [field]: updatedValue }));
    validate(field, updatedValue);
  };

  // Image upload logic (unchanged)
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index) => {
    setFormData((prev) => {
      let newImages = [...prev.images];

      const removedImage = newImages[index];

      if (typeof removedImage === "string") {
        setRemovedImages((prevRemoved) => {

          if (!prevRemoved.includes(removedImage)) {
            const updatedRemovedImages = [...prevRemoved, removedImage];

            return updatedRemovedImages;
          }
          return prevRemoved;
        });
      }


      newImages.splice(index, 1);

      return { ...prev, images: newImages };
    });
  };




  const handleAddOptions = (values) => {
    setOptions(values)


  };
  const handleRemovedVariants = (values) => {
    setremovevariation(values);
  }

  const handlremoveOptions = (values) => {
    setremoveoptions(values);
  }

  // Handler for the new “variant details” coming from Variants
  const handleaddvariants = (values) => {

    setvariants(values);
  };

  // CREATE or UPDATE on submit
  const handleSubmit = async () => {
    

    const requiredFields = ["title"];
    let newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] =
          field.charAt(0).toUpperCase() + field.slice(1) + " is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("productId", currentProduct?._id);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("sku", formData.sku);
    formDataToSend.append("status", formData.status);
    formDataToSend.append("slug", formData.slug);
    formDataToSend.append("costprice", formData.costprice);
    formDataToSend.append("cprice", formData.cprice);
    formDataToSend.append("barcode", formData.Barcode);
    formDataToSend.append("istax", isTaxed);
    formDataToSend.append("weight", totalWeight);
    formDataToSend.append("publish", formData.publish);
    formDataToSend.append("page_title",formData.page_title);
    formDataToSend.append("meta_description",formData.meta_description);

    if (selectedVendor?._id && selectedVendor._id.trim() !== "") {
      formDataToSend.append("brand", selectedVendor._id);
    }
    
    if (selectedProducttype?._id && selectedProducttype._id.trim() !== "") {
      formDataToSend.append("product_type", selectedProducttype._id);
    }
    
    if(selectedTags.length>0){
    formDataToSend.append("tags",selectedTags.map((tag)=>tag?._id));
    }
    
    if(removetag.length>0){
      formDataToSend.append("removetag",removetag.map((item)=>item?._id));
    }


    // Append images



    removedImages.forEach((image, index) => {
      formDataToSend.append(`removedImages[${index}]`, image);
    });


    formData.images.forEach((image, index) => {
      if (image instanceof File) {
        formDataToSend.append(`images[${index}]`, image);
      }
    });

    // Append newly edited/added options
    options.forEach((option, index) => {
      formDataToSend.append(`options[${index}][name]`, option.name);
      formDataToSend.append(`options[${index}][value]`, option.value);
    });


    if (removeoptions && Object.keys(removeoptions).length > 0) {
      Object.entries(removeoptions).forEach(([optionName, details], index) => {
        details.values.forEach((value, valueIndex) => {
          formDataToSend.append(`removeoptions[${index}][name]`, optionName);
          formDataToSend.append(`removeoptions[${index}][values][${valueIndex}]`, value);
        });
      });
    }

    // Append variant data
    if (variants.length > 0) {
      variants.forEach((variant, index) => {
        // Only iterate if attributes exists and is an object
        if (variant.attributes && typeof variant.attributes === "object") {
          Object.entries(variant.attributes).forEach(([attrKey, attrValue]) => {
            formDataToSend.append(
              `variantdata[${index}][attributes][${attrKey}]`,
              attrValue
            );
          });
        }
        formDataToSend.append(
          `variantdata[${index}][price]`,
          variant.price ? variant.price : 0
        );
        formDataToSend.append(
          `variantdata[${index}][barcode]`,
          variant.barcode ? variant.barcode :''
        );
        formDataToSend.append(
          `variantdata[${index}][stock]`,
          variant.stock ? variant.stock : 0
        );
        formDataToSend.append(
          `variantdata[${index}][sku]`,
          variant.sku ? variant.sku : ""
        );
        formDataToSend.append(
          `variantdata[${index}][id]`,
          variant.id ? variant.id : null
        );
        formDataToSend.append(
          `variantdata[${index}][stockid]`,
          variant.stockid
          ? variant.stockid
          : null
        );
        formDataToSend.append(
          `variantdata[${index}][locationid]`,
          variant.
          locationid
          
          ? variant.
          locationid
          
          : null
        );


        if (variant.image) {
          if (variant.image instanceof File) {
            formDataToSend.append(`variantdata[${index}][image]`, variant.image);
          }
        }
      });
    }


    // Append removed variant data from removevariation state

    if (removevariation.length > 0) {
      removevariation.forEach((item) => {
        formDataToSend.append('removeVariations', item);
      });
    }

    // Debug log


    try {
      let senddata;
      // If editProduct = true and we have a currentProduct._id, do a PUT

      senddata = await axios.patch(
        `/api/product/`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );



      let { data } = senddata;
      if (data?.isSuccess) {
        setSnackbarOpen(true);
        setMessage(data?.message);
        router.push("/products");
        localStorage.setItem("activeTab", "Product");
      } else {
        seterror(true);
        setSnackbarOpen(true);
        setMessage(data?.message);
      }
    } catch (err) {
      setSnackbarOpen(true);
      setMessage(err?.message);
    }
  };


  const checkSkuAvailability = async (sku) => {
    if (!sku.trim()) return;
    if (sku === currentProduct?.variants?.[0]?.sku) {
      setSlugError(false);
      return;
    }

    setchecksku(true);
    try {
      const response = await axios.get(`/api/sku?sku=${sku}`);
      if (response.data.exists) {
        setSkuError(true);
        setTimeout(async () => {
          let newSku = sku;
          let attempt = 1;
          let isAvailable = false;

          while (!isAvailable) {
            // Use newSku here to check updated value in each iteration.
            const res = await axios.get(`/api/sku?sku=${newSku}`);
            if (!res.data.exists) {
              isAvailable = true;
            } else {
              newSku = `${sku}-${attempt}`;
              attempt++;
            }
          }

          setFormData((prev) => ({ ...prev, sku: newSku }));
          setSkuError(false); // Corrected from setSlugError(false)
          setchecksku(false);
        }, 2000);
      } else {
        // If SKU is available, update the formData
        setFormData((prev) => ({ ...prev, sku }));
        setSkuError(false);
        setchecksku(false);
      }
    } catch (error) {
      console.error("Error checking sku availability:", error);
      setchecksku(false);
    }
  };

  const checkSlugAvailability = async (slug) => {
    if (!slug.trim()) return;

    // If the slug is the same as the current product slug, no need to check availability
    if (slug === currentProduct?.product_slug) {
      setSlugError(false);
      return;
    }

    setCheckingSlug(true);

    try {
      const response = await axios.get(`/api/slug?slug=${slug}`);

      if (response.data.exists) {
        setSlugError(true);

        setTimeout(async () => {
          let newSlug = slug;
          let attempt = 1;
          let isAvailable = false;

          while (!isAvailable) {
            const res = await axios.get(`/api/slug?slug=${newSlug}`);
            if (!res.data.exists) {
              isAvailable = true;
            } else {
              newSlug = `${slug}-${attempt}`;
              attempt++;
            }
          }

          setFormData((prev) => ({ ...prev, slug: newSlug }));
          setSlugError(true);
          setCheckingSlug(false);
        }, 2000);
      } else {
        // If slug is available, update the formData
        setFormData((prev) => ({ ...prev, slug }));
        setSlugError(false);
        setCheckingSlug(false);
      }
    } catch (error) {
      console.error("Error checking slug availability:", error);
      setCheckingSlug(false);
    }
  };

  useEffect(() => {
    setSelectedVendor(allbrands.find((brand) => brand._id === currentProduct?.brand_id?._id) || null);
    setSelectedTags(selectedTags.length > 0 ? selectedTags : currentProduct?.tag_id || [])
    setProductType(allProductType.find((item) => currentProduct?.producttype_id?._id === item?._id) || null);
  }, [currentProduct, allProductType, allbrands]);
  useEffect(() => {

    if (debouncedSlug) {
      checkSlugAvailability(debouncedSlug);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSlug]);
useEffect(()=>{
  if (debouncedSku) {
    checkSkuAvailability(debouncedSku);
  }
},[debouncedSku])

  const goback = () => {
    setshow(false);
    localStorage.setItem('add', false)
    router.back()
  }


  return (
    <>

<Box display="flex" alignItems="center" justifyContent="space-between">
  <Box display="flex" alignItems="center">
    <IconButton onClick={goback}><ArrowBackIcon /></IconButton>
    <Typography variant="p" fontWeight="bold">update product</Typography>
  </Box>
  <Button variant="contained" color="success" sx={{
    borderRadius: 2,         // Adjust for the desired rounding
    px: 2,
    py: 0.5,
    fontSize:'12px',
    fontWeight: "bold",
    textTransform: "none",
    backgroundColor: "#333",  // Dark gray/black background
    color: "#fff",            // White text
    border: "1px solid #000", // Subtle border
    "&:hover": {
      backgroundColor: "#444", // Slightly lighter on hover
    },
  }} onClick={handleSubmit}>update</Button>
</Box>
      <Grid container spacing={2}>

        <Grid item xs={9}>
        
          <Typography variant="p" fontWeight="bold" >
           
          </Typography>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              my: 2,
              backgroundColor: "#ffffff",
              borderRadius: 2,
            }}
          >

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Product Name"
                  size="small"
                  fullWidth
                  variant="outlined"
                  placeholder="Enter product name"
                  value={formData.title}
                  onChange={handleChange("title")}
                  error={!!errors.title}
                  helperText={errors.title}
                />
              </Grid>



              <Grid item xs={6}>
                <TextField
                  label="Description"
                  size="small"
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={handleChange("description")}
                  error={!!errors.description}
                  helperText={errors.description}
                />
                 <Typography variant="caption" sx={{ display: "block", textAlign: "right", color: formData.description.length >= 160 ? "red" : "gray" }}>
                    {formData.description.length}/160
                  </Typography>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    border: "2px dashed #c4c4c4",
                    borderRadius: 1,
                    p: formData?.images?.length > 0 ? 1 : 4,
                    textAlign: "center",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      justifyContent:
                        formData?.images?.length > 0 ? "start" : "center",
                    }}
                  >
                    {formData?.images?.map((file, index) => {
                      let imageUrl = typeof file === "string" ? file : URL.createObjectURL(file);
                      return (
                        <Box key={index} sx={{ position: "relative" }}>
                          <Image src={imageUrl} alt="Preview" width={80} height={80} style={{ borderRadius: 8, objectFit: "cover" }} />
                          <IconButton onClick={() => removeImage(index)} size="small" sx={{ position: "absolute", top: -5, right: -5, background: "white" }}>
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Box>
                      );
                    })}
                    {formData.images.length < 5 && (
                      <Button variant="contained" component="label">
                        <AddPhotoAlternateIcon />
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          multiple
                          onChange={handleImageUpload}
                        />
                      </Button>
                    )}
                  </Box>
                </Box>
              </Grid>


            </Grid>
          </Paper>

          {/* price */}
          {options.length == 0 && (<Paper elevation={3}
            sx={{
              mt: 5,
              p: 2,

              backgroundColor: "#ffffff",
              borderRadius: 2,
            }}>
            <Typography variant="p" sx={{ fontWeight: "bold" }}>
              Pricing
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>


              <>
                <Grid item xs={4}>
                  <TextField
                    size="small"
                    label="Price"
                    fullWidth
                    variant="outlined"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={handleChange("price")}
                    error={!!errors.price}
                    helperText={errors.price}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    size="small"
                    label="Compare Price"
                    fullWidth
                    variant="outlined"
                    placeholder="compare price"
                    value={formData.cprice}
                    onChange={handleChange("cprice")}
                    error={!!errors.cprice}
                    helperText={errors.cprice}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    size="small"
                    label="Cost Price"
                    fullWidth
                    variant="outlined"
                    placeholder="cost price"
                    value={formData.costprice}
                    onChange={handleChange("costprice")}
                    error={!!errors.costprice}
                    helperText={errors.costprice}
                  />

                </Grid>

                <Grid item xs={4}>
                  <FormControlLabel
                    control={<Checkbox checked={isTaxed} onChange={(e) => setIsTaxed(e.target.checked)} />}
                    label="Charge tax on this product"
                  />
                </Grid>

              </>

            </Grid>

          </Paper>
          )}
          {options.length == 0 && (<Paper elevation={3}
            sx={{
              mt: 5,
              p: 2,

              backgroundColor: "#ffffff",
              borderRadius: 2,
            }}>
            <Typography variant="p" sx={{ fontWeight: "bold" }}>
              Inventory
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>


              <>

                <Grid item xs={4}>
                  <TextField
                    size="small"
                    label="Barcode"
                    fullWidth
                    variant="outlined"
                    placeholder="Barcode"
                    value={formData.Barcode}
                    onChange={handleChange("Barcode")}
                    error={!!errors.Barcode}
                    helperText={errors.Barcode}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    size="small"
                    label="SKU"
                    fullWidth
                    variant="outlined"
                    placeholder="Enter SKU"
                    value={formData.sku}
                    onChange={handleChange("sku")}
                    error={skuError || checksku}
                    helperText={
                      checksku
                        ? "Sku exists, generating new one..."
                        : skuError
                          ? "check availability"
                          : ""
                    }
                    InputProps={{
                      endAdornment: (

                        <IconButton
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, sku: generateRandomSKU() }))
                          }
                          edge="end"
                        >

                        </IconButton>

                      ),
                    }}
                  />

                </Grid>


                <Grid item xs={4}>
                  <TextField
                    size="small"
                    label="Stock Quantity"
                    fullWidth
                    variant="outlined"
                    placeholder="Stock"
                    value={formData.stocks}
                    onChange={handleChange("stocks")}
                    error={!!errors.stocks}
                    helperText={errors.stocks}
                  />

                </Grid>
              </>
            </Grid>

          </Paper>
          )}


{options.length==0 &&(<Paper  elevation={3}
        sx={{
          mt:5,
          p: 2,
        
          backgroundColor: "#ffffff",
          borderRadius: 2,
        }}>



          
           <Typography variant="p" sx={{ fontWeight: "bold" }}>
             Shipping
              </Typography>
    <Grid container spacing={2} sx={{ mt: 1 }}>
       
   
          <>
      
          <Grid item xs={6} style={{ display: "flex", alignItems: "center" }}>
      <TextField
        label="Weight"
        size="small"
        variant="outlined"
        value={weight}
        onChange={(e)=>setWeight(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Select
                value={unit}
                onChange={(e)=>setUnit(e.target.value)}
                size="small"
                variant="standard"
                disableUnderline
                style={{ minWidth: "40px" }}
              >
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="g">g</MenuItem>
              </Select>
            </InputAdornment>
          ),
        }}
      />
     
    </Grid>
          </>
    </Grid>
 
    </Paper>)}


          <Variants
            editProduct={editProduct}
            sku={formData?.sku}
            // 3) We pass in the combined existingOptions (already extracted)
            existingOptions={existingOptions}
            extractvariants={extractvariants}
            existingVariants={variants}
            handleAddOptions={handleAddOptions}
            handlremoveOptions={handlremoveOptions}
            handleaddvariants={handleaddvariants}
            price={formData?.price}
            stock={formData?.stocks}
            currentProduct={currentProduct}
            handleRemovedVariants={handleRemovedVariants}
            images={formData.images[0]}
            Barcode={formData.Barcode}
          />
          <Paper elevation={3}
            sx={{
              mt: 5,
              p: 2,

              backgroundColor: "#ffffff",
              borderRadius: 2,
            }}>
            <Typography variant="p" sx={{ fontWeight: "bold" }}>
              Search Engine Listing
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>


              <>

                <Grid item xs={6}>
                  <TextField
                    label="Product Slug"
                    size="small"
                    fullWidth
                    variant="outlined"
                    value={formData.slug || ""}
                    onChange={handleChange("slug")}
                    error={slugError || (formData.slug.trim() === "" && !checkingSlug)}
                    helperText={
                      checkingSlug
                        ? "Checking slug availability..."
                        : slugError
                          ? "This slug already exists. Generating a new one..."
                          : formData.slug.trim() === ""
                            ? "Slug is required"
                            : ""
                    }
                  />
                </Grid>

          <Grid item xs={6}>
  <TextField
    label="Page title"
    size="small"
    fullWidth
    variant="outlined"
    value={formData?.page_title} 
    onChange={handleChange("page_title")}
  />
      <Typography variant="caption" sx={{ display: "block", textAlign: "right", color: formData?.page_title.length >= 200 ? "red" : "gray" }}>
      {formData?.page_title.length}/70
    </Typography>
</Grid>

<Grid item xs={12}>
  <TextField
    label="Meta description"
    size="small"
    fullWidth
    variant="outlined"
    rows={4}
    multiline
    value={formData?.meta_description} 
    onChange={handleChange("meta_description")}
  />
    <Typography variant="caption" sx={{ display: "block", textAlign: "right", color: formData.meta_description.length >= 160 ? "red" : "gray" }}>
      {formData.meta_description.length}/160
    </Typography>
</Grid>



              </>
            </Grid>

          </Paper>




        </Grid>
        <Grid item xs={3} mt={2}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              backgroundColor: "#ffffff",
              borderRadius: 2,
            }}
          >
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Product Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleChange("status")}
                  label="Product Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                </Select>
              </FormControl>
            </Grid>



          </Paper>
          <Paper
        elevation={3}
        sx={{
          p: 2,
          mt:4,
          backgroundColor: "#ffffff",
          borderRadius: 2,
        }}
      >     <Typography variant="p" sx={{ fontWeight: "bold" }}>
Publishing
     </Typography>
     
      <Grid item xs={12} mt={1}>
        
      <FormControl component="fieldset">
  <FormLabel component="legend"  sx={{fontWeight:600, fontSize:'14px',color:'black'}}>Sales channels</FormLabel>
  <FormGroup>
    <FormControlLabel  className="custom_checkbox"
      control={
        <Checkbox 
        size="small"
          checked={formData.publish.includes("Online Store")}
          onChange={handleChange("publish")}
          value="Online Store"
        />
      }
      label="Online Store"
    />
    <FormControlLabel className="custom_checkbox"
      control={
        <Checkbox  sx={{fontSize:'12px'}}
         size="small"
          checked={formData.publish.includes("Other")}
          onChange={handleChange("publish")}
          value="Other"
        />
      }
      label="Other"
    />
  </FormGroup>
</FormControl>

          </Grid>
        </Paper>
          <Paper
            elevation={3}
            sx={{
              mt: 4,
              p: 2,
              backgroundColor: "#ffffff",
              borderRadius: 2,
            }}
          >     <Typography variant="p" sx={{ fontWeight: "bold" }}>
              Product organization
            </Typography>
            <Grid item xs={12} mt={2.5}>
              <Grid>
                {/* Product Type Autocomplete */}
                <Autocomplete
                  size="small"
                  options={allProductType}
                  value={selectedProducttype}
                  getOptionLabel={(option) => option.product_type_name || ""}
                  onInputChange={handleproductype}
                  onChange={(_, newValue) => setProductType(newValue)}
                  noOptionsText={
                    <Button onClick={Addnewpt}>
                      Add {productinput}
                    </Button>
                  }
                  renderOption={(props, option) => {
                    const { key, ...restProps } = props;
                    return (
                      <li key={key} {...restProps}>
                        {option?.product_type_name}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Product type" placeholder="Product type..." />
                  )}
                />

                {/* Vendor Autocomplete */}
                <Grid mt={4}>
                  <Autocomplete
                    size="small"
                    options={allbrands}
                    value={selectedVendor}
                    isOptionEqualToValue={(option, value) => option.brand_name === value.brand_name}
                    getOptionLabel={(option) => option.brand_name || ""}
                    onInputChange={handlevendor}
                    onChange={(_, newValue) => setSelectedVendor(newValue)}
                    noOptionsText={
                      <Button onClick={Addnewvendor}>
                        Add {vendorinput}
                      </Button>
                    }
                    renderOption={(props, option) => {
                      const { key, ...restProps } = props;
                      return (
                        <li key={key} {...restProps}>
                          {option?.brand_name}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" label="Vendor" placeholder="Select Vendor..." />
                    )}
                  />
                </Grid>

                {/* Tags Autocomplete */}
                <Grid mt={4}>
                  <Autocomplete
                    size="small"
                    multiple
                    options={alltags}
                    value={selectedTags}
                    isOptionEqualToValue={(option, value) => option.tag_name === value.tag_name}
                    getOptionLabel={(option) => option.tag_name || ""}
                    onInputChange={handleinput}
                    onChange={handleTagChange}
                    noOptionsText={
                      <Button onClick={Addnewtags}>
                        Add {inputvalue}
                      </Button>
                    }
                renderOption={(props, option, { selected }) => {
                   // Destructure the key out and pass it explicitly.
                   const { key, ...restProps } = props;
                   return (
                     <li key={key} {...restProps}>
                       <Checkbox
                         icon={icon}
                         checkedIcon={checkedIcon}
                         style={{ marginRight: 8 }}
                         checked={selected}
                       />
                       {option.tag_name}
                     </li>
                   );
                 }}
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" label="Tags" placeholder="Select tags..." />
                    )}
                  />
                </Grid>
              </Grid>


            </Grid>

          </Paper>
        </Grid>

      </Grid>


  

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={iserror ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%" }}
          onClose={() => setSnackbarOpen(false)}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}
