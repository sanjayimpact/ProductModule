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

} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

import Variants from "./variants";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useECart } from "../Context/eCartcontext";

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

  const { setshow } = useECart();
  const router = useRouter();

  const [editProduct, seteditProduct] = useState(true);
  const [lastCheckedSlug, setLastCheckedSlug] = useState("")



  // Initialize form data with currentProduct (if editing)
  const [formData, setFormData] = useState({
    title: currentProduct?.product_name || "",
    description: currentProduct?.product_description || "",
    // If you have at least one variant, use its price & sku; otherwise blank
    price: currentProduct?.variants?.[0]?.price || "",
    sku: currentProduct?.variants?.[0]?.sku || "",
    images: currentProduct?.featured_image ? [...currentProduct.featured_image] : [],
    status: currentProduct?.product_status || "",
    slug: currentProduct?.product_slug || "",
    costprice: currentProduct?.variants?.[0]?.costprice || "",
    cprice: currentProduct?.variants?.[0]?.
      compareprice || "",
    Barcode: currentProduct?.variants?.[0]?.barcode
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
  // const computeSku = formData.sku.toLowerCase().trim().replace(/\s+/g, "-");
  // const debouncedSku = useDebounce(computeSku, 500);


  useEffect(() => {
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


  // Handler for the new “options” coming from Variants
  // (This is where user edits or adds more options in the UI.)

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
    ;

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
    if (debouncedSlug) {
      checkSlugAvailability(debouncedSlug);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSlug]);

  const goback = () => {
    setshow(false);
    localStorage.setItem('add', false)
    router.back()
  }


  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={9}>
          <IconButton onClick={goback}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="p" fontWeight="bold" >
            Edit  Product
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
              </>
            </Grid>

          </Paper>
          )}



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
              </>
            </Grid>

          </Paper>




        </Grid>
        <Grid item xs={3} mt={7}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
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
        </Grid>

      </Grid>


      {/* Variants Section */}


      {/* You can add your SAVE button here if desired */}

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
