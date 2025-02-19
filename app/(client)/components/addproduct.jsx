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
  InputAdornment, // <-- Added InputAdornment here
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Variants from "./variants";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Custom hook to debounce a value
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductForm() {

  const generateRandomSKU = () => {
    let length = 5; // Set desired length
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sku = '';
    
    for (let i = 0; i < length; i++) {
        let randomIndex = Math.floor(Math.random() * chars.length);
        sku += chars[randomIndex];
    }
    
    return sku.toUpperCase();
  };
  

  const router = useRouter();

  // Added slug field in formData
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    sku: "",
    images: [],
    status: "",
    slug: "",
  });

  const [iserror, seterror] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // States for options and variants
  const [options, setOptions] = useState([]);
  const [variants, setvariants] = useState([]);
  
  // States for slug checking
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState(false);

  const [checksku, setchecksku] = useState(false);
  const [skuError, setSkuError] = useState(false);

  // Debounce the computed slug based on the title.
  const computedSlug = formData.title.toLowerCase().trim().replace(/\s+/g, "-");
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
    } else {
      delete newErrors[field];
    }
    setErrors(newErrors);
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    validate(field, value);
  };

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

  // Handler for options coming from Variants component
  const handleAddOptions = (values) => {
    setOptions(values);
  };

  // Handler for variants coming from Variants component
  const handleaddvariants = (values) => {
    setvariants(values);
  };

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

    // Prepare form data for submission
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("sku", formData.sku);
    formDataToSend.append("status", formData.status);
    formDataToSend.append("slug", formData.slug);

    // Append images
    formData.images.forEach((image, index) => {
      formDataToSend.append(`images[${index}]`, image);
    });

    // Append options
    options.forEach((option, index) => {
      formDataToSend.append(`options[${index}][name]`, option.name);
      formDataToSend.append(`options[${index}][value]`, option.value);
    });
console.log(variants);
    // Append variant data
    variants.forEach((variant, index) => {
      formDataToSend.append(`variantdata[${index}][price]`, variant.price);
      formDataToSend.append(`variantdata[${index}][stock]`, variant.stock);
      formDataToSend.append(`variantdata[${index}][image]`, variant.image);
      formDataToSend.append(`variantdata[${index}][sku]`, variant.sku);
    });

    // Debug log the form data
    for (let [key, value] of formDataToSend.entries()) {
      if (key.startsWith("images")) {
        console.log(`${key}:`, value.name);
      } else {
        console.log(`${key}:`, value);
      }
    }

    try {
      let senddata = await axios.post("/api/product", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      let { data } = senddata;
      if (data?.isSuccess) {
        setSnackbarOpen(true);
        setMessage(data?.message);
        
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

  useEffect(() => {
    if (debouncedSlug) {
      checkSlugAvailability(debouncedSlug);
    }
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSlug]);

  useEffect(() => {
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

  return (
    <>
      {/* Product Form Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          backgroundColor: "#ffffff",
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Add Product
        </Typography>
        <Divider sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid item xs={6}>
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
              label="Product Slug"
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
          <Grid item xs={4}>
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
        </Grid>
      </Paper>

      {/* Variants Section */}
      <Variants
        handleAddOptions={handleAddOptions}
        handleaddvariants={handleaddvariants}
        price={formData?.price}
        images={formData.images[0]}
        sku = {formData.sku}
      />

      <Grid item xs={12} textAlign="end" marginTop={2}>
        <Button
          variant="contained"
          color="success"
          sx={{ p: 1, borderRadius: 1.5 }}
          onClick={handleSubmit}
        >
          Save
        </Button>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
