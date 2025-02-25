"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,

  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  FormLabel,
  FormGroup,// <-- Added InputAdornment here
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Variants from "./variants";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { generateRandomSKU } from "../utils/helper";
import { useECart } from "../Context/eCartcontext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

import useDebounce from "../hooks/useDebounce";
import { addproductype, addtag, addvendor, getBrands, getproducttype, getTags } from "../utils/api/products";
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;



// Custom hook to debounce a value


export default function ProductForm() {
const{setshow,alltags,vendorinput,setvendorinput,allbrands,selectedVendor, setSelectedVendor,selectedTags, setSelectedTags,setinputProducttype,setProductType,selectedProducttype,allProductType,productinput,setalltags,setallProductType,setallbrands,options, setOptions,variants, setvariants,setremovevariation,setremoveoptions} = useECart();

  



  const router = useRouter();

  // Added slug field in formData
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    sku: "",
    images: [],
    status: "Draft",
    slug: "",
    cprice:"",
    costprice:"",
    Barcode:"",
    stocks:"",
    tags:"",
    publish:"Online Store",
    page_title:"",
    meta_description:""
  });
  const [page_title,setPagetitle] = useState("");
 
  const[metadescription,setMetadescription]=useState(formData?.description);
  const [weight, setWeight] = useState(0);
  const [unit, setUnit] = useState("kg");
  const totalWeight = `${weight} ${unit}`;
  const[inputvalue,setInputvalue] = useState(null);
  const [isTaxed, setIsTaxed] = useState(false);
  const [iserror, seterror] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // States for options and variants
 

 
  // States for slug checking
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState(false);

  const [checksku, setchecksku] = useState(false);
  const [skuError, setSkuError] = useState(false);

  // Debounce the computed slug based on the title.
  const computedSlug = formData.title
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")  // Replace any non-alphanumeric character with a hyphen
  .replace(/^-+|-+$/g, ""); // Remove leading or trailing hyphens



  const debouncedSlug = useDebounce(computedSlug, 500);
  const computeSku = formData.sku.toUpperCase().trim().replace(/\s+/g, "-");
  const debouncedSku = useDebounce(computeSku, 500);

  // When the debounced slug changes, check for its availability.
  // create a random alphanumeric sku

    const checkSkuAvailability = async (sku) => {
      if (!sku.trim()) return;
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
            setSlugError(false);
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

  // Simple validation
  const validate = (field, value) => {
    const newErrors = { ...errors };
    if (field === "title" && !value) {
      newErrors.title = "Title is required";
    } else if (field === "price" && (!value || isNaN(value) || value <= 0)) {
      newErrors.price = "Price must be a positive number";
    } else if (field === "sku" && !value) {
      newErrors.sku = "SKU is required";

    }else if(field ==="cprice" &&(!value || isNaN(value) || value <= 0)){
      newErrors.cprice = "Compare price must be a positive number"
    
    }else if(field ==="costprice" &&(!value || isNaN(value) || value <= 0)){
      newErrors.costprice = "Cost price must be a positive number"
    
    
    }else if(field ==="stocks" &&(!value || isNaN(value) || value <= 0)){
      newErrors.stocks = "stocks must be a positive number"
    
    }
    else if (field === "Barcode" && (!value || value.length < 10)) {
      newErrors.Barcode = "Barcode must be at least 10 characters";
    } 
    
    else {
      delete newErrors[field];
    }
    setErrors(newErrors);
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;

   if(field==="description" && value.length > 160){
    return;
   }

    if(field==="title"){
      setPagetitle(value);
    }
    if(field==="description"){
      

      setMetadescription(value);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    validate(field, value);
  };

//for vendor
  const handlevendor = (e)=>{
    const newValue = e?.target?.value|| " ";
    const values = newValue.replace(/[^a-zA-Z0-9_-]/g, '');
 
    setvendorinput(values)
  }

  //for tags
  const handleinput = (e)=>{

    const newValue = e?.target?.value || ' ';

const values = newValue.replace(/[^a-zA-Z0-9_-]/g, '');

    setInputvalue (values);
   
  }

  //for producttype

  const  handleproductype=(e)=>{
    const newValue = e?.target?.value|| " ";
    const values = newValue.replace(/[^a-zA-Z0-9_-]/g, '');

 

setinputProducttype (values);
  }


  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };



  const handleSubmit = async () => {

    const requiredFields = ["title"];
    let newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] =
          field.charAt(0).toUpperCase() + field.slice(1) + " is required *";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare form data for submission
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("sku", formData.sku);
    formDataToSend.append("status", formData.status);
    formDataToSend.append("slug", formData.slug);
    formDataToSend.append("cprice",formData?.cprice);
    formDataToSend.append("costprice",formData?.costprice);
    formDataToSend.append("Barcode",formData?.Barcode);
    formDataToSend.append("tax",isTaxed);
    formDataToSend.append("stocks",formData?.stocks);
    formDataToSend.append("weight",totalWeight);
    formDataToSend.append("publish",formData.publish);
    formDataToSend.append("page_title",page_title);

    formDataToSend.append("meta_description",metadescription);
    if (selectedVendor?._id && selectedVendor._id.trim() !== "") {
      formDataToSend.append("brand", selectedVendor._id);
    }
    
    if (selectedProducttype?._id && selectedProducttype._id.trim() !== "") {
      formDataToSend.append("product_type", selectedProducttype._id);
    }
    
    if(selectedTags.length>0){
    formDataToSend.append("tags",selectedTags.map((tag)=>tag?._id));
    }
    

    // Append images
    formData.images.forEach((image, index) => {
      formDataToSend.append(`images[${index}]`, image);
    });

    // Append options
    options.forEach((option, index) => {
      formDataToSend.append(`options[${index}][name]`, option.name);
      formDataToSend.append(`options[${index}][value]`, option.value);
    });

    // Append variant data
    variants.forEach((variant, index) => {
      // Append each attribute (for example, color and size) under a nested key
      Object.entries(variant.attributes).forEach(([attrKey, attrValue]) => {
        formDataToSend.append(`variantdata[${index}][attributes][${attrKey}]`, attrValue);
      });
      // Append the other fields
      formDataToSend.append(`variantdata[${index}][price]`, variant.price);
      formDataToSend.append(`variantdata[${index}][stock]`, variant.stock);
      formDataToSend.append(`variantdata[${index}][image]`, variant.image);
      formDataToSend.append(`variantdata[${index}][sku]`, variant.sku);
    });
    
    // Debug log the form data


    try {
      let senddata = await axios.post("/api/product", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      let { data } = senddata;
      if (data?.isSuccess) {
        setSnackbarOpen(true);
        setMessage(data?.message);
        setSelectedVendor('');
        setSelectedTags([]);
        setProductType('');
        setvariants([])
        setOptions([])
        setremovevariation([])
        setremoveoptions([])
        localStorage.setItem("activeTab", "product");
        setTimeout(()=>{
          router.push("/products");
        },500)
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
const goback = ()=>{
  setshow(false);
  localStorage.setItem('add',false)
  router.back()
}
  useEffect(() => {
    if (debouncedSlug) {
      checkSlugAvailability(debouncedSlug);
    }
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSlug]);

const getBTP=async()=>{
  try{
     let tags = await getTags();
  
     if(tags.isSuccess){
       setalltags(tags?.data);

     }
     let brands = await getBrands();
     if(brands.isSuccess){
       setallbrands(brands?.data);

     }
     
     let productTypes = await getproducttype();
      if(productTypes.isSuccess){
        setallProductType(productTypes?.data)

      }
  }catch(err){  
    console.log(err);
  }
}

  useEffect(() => {
    getBTP();
    setSelectedVendor('');
    setSelectedTags([]);
    setProductType('');
    if (debouncedSku) {
      checkSkuAvailability(debouncedSku);
    }
  }, [debouncedSku]);

  // Auto-generate a random SKU on mount if none is set
  useEffect(() => {
    if (!formData.sku) {
      setFormData((prev) => ({ ...prev, sku: generateRandomSKU() }));
    }
  }, []);


const Addnewtags=async()=>{
 try{
   let senddata = await addtag(inputvalue);
    getBTP();
 }catch(err){

 }

 
}
const Addnewvendor = async()=>{
  try{
   let senddata = await addvendor(vendorinput);
   

   getBTP();
  }catch(err){
 
  }
}

const Addnewpt =async()=>{
  try{
    let senddata= await addproductype(productinput);
    getBTP();
  }catch(err){
 
  }
}
  
  return (
    <>

      {/* Product Form Section */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
  <Box display="flex" alignItems="center">
    <IconButton onClick={goback}><ArrowBackIcon /></IconButton>
    <Typography variant="p" fontWeight="bold">Add Product</Typography>
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
  }} onClick={handleSubmit}>Save</Button>
</Box>

     <Grid container spacing={2}  >
      
   
      <Grid item xs={9} >
     

      <Paper
        elevation={3}
        sx={{
          p: 2,
          my:2,
          backgroundColor: "#ffffff",
          borderRadius: 2,
        }}
      >
       <Box sx={{ display: "flex", alignItems: "center"}}>
 
</Box>
        
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
                p: formData.images.length > 0 ? 1 : 4,
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
                    formData.images.length > 0 ? "start" : "center",
                }}
              >
                {formData.images.map((file, index) => (
                  <Box key={index} sx={{ position: "relative" }}>
                    <Image
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      width={80}
                      height={80}
                      style={{ borderRadius: 8, objectFit: "cover" }}
                    />
                    <IconButton
                      onClick={() => removeImage(index)}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        background: "white",
                      }}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                ))}
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
      {options.length==0 &&(  <Paper  elevation={3}
        sx={{
          mt:5,
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
          <FormControlLabel className="custom_tax"
  control={<Checkbox size="small" checked={isTaxed} onChange={(e)=>setIsTaxed(e.target.checked)} />}
  label="Charge tax on this product"
/>
          </Grid>

          </>
       
    </Grid>
 
    </Paper>
  )}
    {options.length==0 &&(   <Paper  elevation={3}
        sx={{
          mt:5,
          p: 2,
        
          backgroundColor: "#ffffff",
          borderRadius: 2,
        }}>
           <Typography variant="p" sx={{ fontWeight: "bold" }}>
               Inventory
              </Typography>
    <Grid container spacing={2} sx={{ mt: 1 }}>
       
   
          <>
         
      
          <Grid item xs={4} >
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
          <Grid item xs={4} >
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
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, sku: generateRandomSKU() }))
                      }
                      edge="end"
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs = {4}>
          <TextField
          type="Number"
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
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d*\.?\d{0,2}$/.test(value)) {
            setWeight(value);
          }
        }}
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
   
      
        price={formData.price}
        images={formData.images[0]}
        sku = {formData.sku}
        Barcode={formData.Barcode}
        stock = {formData?.stocks}


      />
        <Paper  elevation={3}
        sx={{
          mt:5,
          p: 2,
        
          backgroundColor: "#ffffff",
          borderRadius: 2,
        }}>



          
           <Typography variant="p" sx={{ fontWeight: "bold" }}>
              Search Engine Listing
              </Typography>
    <Grid container spacing={2} sx={{ mt: 1 }}>
       
   
          <>
      
         
          <Grid item xs={12}>
  <TextField
    label="Page title"
    size="small"
    fullWidth
    variant="outlined"
    value={page_title} 
    onChange={(e) => {
      if (e.target.value.length <= 70) {
        setPagetitle(e.target.value);
      }
    }}
  />
   <Typography variant="caption" sx={{ display: "block", textAlign: "right", color: page_title.length >= 70 ? "red" : "gray" }}>
    {page_title.length}/70
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
    value={metadescription} 
    onChange={(e) => {
      if (e.target.value.length <= 160) {
        setMetadescription(e.target.value);
      }
    }}
  />
   <Typography variant="caption" sx={{ display: "block", textAlign: "right", color: metadescription.length >= 160 ? "red" : "gray" }}>
    {metadescription.length}/160
  </Typography>
</Grid>
<Grid item xs={12}>
            
            <TextField
              label="URL handle"
              size="small"
              fullWidth
              variant="outlined"
              // Show the updated slug from formData; fallback to computed slug
              value={formData.slug || computedSlug}
              disabled
              error={slugError || checkingSlug} // When true, helperText appears in red
              helperText={
                checkingSlug
                  ? "Slug exists, generating new one..."
                  : slugError
                  ? "check availability"
                  : ""
              }
            />
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
      >     <Typography variant="p" sx={{ fontWeight: "bold" }}>
Status
     </Typography>
     
      <Grid item xs={12} mt={2.5}>
        
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
          mt:4,
          p: 2,
          backgroundColor: "#ffffff",
          borderRadius: 2,
        }}
      >     <Typography variant="p" sx={{ fontWeight: "bold" }}>
Product organization
     </Typography>
     
      <Grid item xs={12} mt={2.5}>
     <Grid>
    
 <Autocomplete
     size="small" 
  options={allProductType}
  value={selectedProducttype}
  getOptionLabel={(option) => option.product_type_name || ""}
  onInputChange={handleproductype}
  onChange={(_, newValue) => {
    setProductType(newValue);
  }}
  noOptionsText={
    <Button onClick={ Addnewpt}>
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
    <TextField
      {...params}
      variant="outlined"
      label="Product type"
      placeholder="Product type..."
    />
  )}
/>


     </Grid>
     <Grid mt={4}>
     <Autocomplete
     size="small" 
  options={allbrands}
  value={selectedVendor}
  getOptionLabel={(option) => option.brand_name || ""}
  onInputChange={handlevendor}
  onChange={(_, newValue) => {
    setSelectedVendor(newValue);
  }}
  noOptionsText={
    <Button onClick={ Addnewvendor}>
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
    <TextField
      {...params}
      variant="outlined"
      label="Vendor"
      placeholder="Select Vendor..."
    />
  )}
/>

     </Grid>
     <Grid mt={4}>
    
           
           <Autocomplete
           size="small"
  multiple
  options={alltags}
  value={selectedTags}
  getOptionLabel={(option) => option.tag_name || ""}
  onInputChange={handleinput}
  onChange={(_, newValue) => {
    setSelectedTags(newValue);
  }}
  noOptionsText={
    <Button
      onClick={Addnewtags}
    >
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
    <TextField
      {...params}
      variant="outlined"
      label="Tags"
      placeholder="Select tags..."
    />
  )}
/>

     </Grid>
         
          </Grid>
        </Paper>
      </Grid>
     </Grid>

      {/* Variants Section */}
      

   
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
