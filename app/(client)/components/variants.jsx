
"use client"
import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
  TextField,
  IconButton,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InventoryTable from "./Variantdetails";

const Variants = ({handleAddOptions, handleaddvariants,price,Barcode,images,editProduct, existingOptions,handlremoveOptions,extractvariants,currentProduct ,handleRemovedVariants,sku}) => {


  const [addOption, setAddOption] = useState(false);
  const [options, setOptions] = useState([]);
  const[remove,setremove] = useState([]);
  const [newOption, setNewOption] = useState({ name: "", value: "" });
  const [variantErrors, setVariantErrors] = useState({ name: "", value: "" });
  const [editingIndex, setEditingIndex] = useState(null);

  // Predefined option names
  const optionnames = [
    { id: "1", name: "color" },
    { id: "2", name: "size" },
    { id: "3", name: "pack" },
  ];
  useEffect(() => {
    if (existingOptions && existingOptions.length > 0) {
      setOptions(existingOptions);
    }
  }, [existingOptions]);
  const handleAddOption = () => {
  
    let errors = { name: "", value: "" };
    let isValid = true;

    // Validate option name is selected
    if (!newOption.name.trim()) {
      errors.name = "Option name is required";
      isValid = false;
    } else {
      // Check for duplicate option names (case-insensitive)
      const duplicate = options.some(
        (opt, index) =>
          opt.name.toLowerCase() === newOption.name.toLowerCase() &&
          index !== editingIndex
      );
      if (duplicate) {
        errors.name = "This option is already added";
        isValid = false;
      }
    }

    // Validate option values are provided and process them to remove trailing slashes
    if (!newOption.value.trim()) {
      errors.value = "Option values are required";
      isValid = false;
    } else {
      // Process tokens: trim and remove a trailing slash if present
      const tokens = newOption.value.split(",").map((val) => {
        let token = val.trim();
        if (token.endsWith("/")) {
          token = token.slice(0, -1).trim();
        }
        return token;
      });

      // Validate that option values do not contain special characters
      const invalidRegex = /[@#%$^&*()]/;
      const lowerTokens = tokens.map((token) => token.toLowerCase());
      const invalidToken = lowerTokens.find((token) => invalidRegex.test(token));
      if (invalidToken) {
        errors.value =
          "Special characters are not allowed in option values";
        isValid = false;
      }
    }

    if (!isValid) {
      setVariantErrors(errors);
      return;
    }

    // Format values: remove trailing slashes, convert to lower case, and filter out empties
    const formattedValues = Array.from(
      new Set(
        newOption.value
          .split(",")
          .map((val) => {
            let token = val.trim();
            if (token.endsWith("/")) {
              token = token.slice(0, -1).trim();
            }
            return token.toLowerCase();
          })
          .filter((val) => val !== "")
      )
    );

    if (editingIndex !== null) {
      const updatedOptions = [...options];
      updatedOptions[editingIndex] = { ...newOption, value: formattedValues };
      setOptions(updatedOptions);
      setEditingIndex(null);
    } else {
      setOptions([...options, { ...newOption, value: formattedValues }]);
    }

    setNewOption({ name: "", value: "" });
    setVariantErrors({});
    setAddOption(false);
  };
  
  const handleEditOption = (index) => {
    const optionToEdit = options[index];
    setNewOption({ name: optionToEdit.name, value: optionToEdit.value.join(", ") });
    setEditingIndex(index);
    setAddOption(true);
  };
  const handleRemoveOption = (index) => {
    const updatedOptions = [...options];
    const optionName = updatedOptions[index].name;
    const removedValues = updatedOptions[index].value;  // Get the values to be removed
  
    // Update `setRemove` to store removed values for the option
    setremove((prev) => ({
      ...prev,
      [optionName]: {
        name: optionName,
        values: prev?.[optionName]?.values
          ? [...prev[optionName].values, ...removedValues] // Append removed values to existing array
          : [...removedValues], // Create new array if first removal
      },
    }));
  
    // Remove the option from the updated options array
    updatedOptions.splice(index, 1);
  
    setOptions(updatedOptions);
  };
  

  const handleRemoveVariantValue = (optionIndex, valueIndex) => {
    const updatedOptions = [...options];

    const optionName = updatedOptions[optionIndex].name;
  const removedValue = updatedOptions[optionIndex].value[valueIndex];
  setremove((prev) => ({
    ...prev,
    [optionName]: {
      name: optionName,
      values: prev?.[optionName]?.values
        ? [...prev[optionName].values, removedValue] // Append new value to existing array
        : [removedValue], // Create new array if first removal
    },
  }));
    updatedOptions[optionIndex].value.splice(valueIndex, 1);

   

    if (updatedOptions[optionIndex].value.length === 0) {
      updatedOptions.splice(optionIndex, 1);
    }

    setOptions(updatedOptions);
  };

  const handleInputChange = (field, value) => {
    // For option values, validate special characters on input after removing any trailing slash
    if (field === "value") {
      const invalidRegex = /[@#%$^&*()]/;
      const tokens = value.split(",").map((val) => {
        let token = val.trim();
        if (token.endsWith("/")) {
          token = token.slice(0, -1).trim();
        }
        return token;
      });
      const lowerTokens = tokens.map((token) => token.toLowerCase());
      const invalidToken = lowerTokens.find((token) => invalidRegex.test(token));
      setVariantErrors((prevErrors) => ({
        ...prevErrors,
        value: invalidToken
          ? "Special characters are not allowed "
          : "",
      }));
    }

    setNewOption({ ...newOption, [field]: value });
  };

  const handleCancelAddOption = () => {
    setAddOption(false);
    setNewOption({ name: "", value: "" });
    setVariantErrors({});
    setEditingIndex(null);
  };

  useEffect(() => {
    handleAddOptions(options);
  }, [options]);

  useEffect(()=>{
    if(editProduct){

      handlremoveOptions(remove)
    }

  },[remove])

  return (
    <>
      <Paper elevation={3} sx={{ p: 2, mt: 5, backgroundColor: "#ffffff", borderRadius: 2 }}>
        <Typography variant="p" sx={{ fontWeight: "bold", mb: 3 }}>
          Variants
        </Typography>

        {/* Display Existing Variants */}
        {options.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {options.map((option, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  p: 1.5,
                  mb: 1,
                  backgroundColor: "#f9f9f9",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {option.name}:
                  </Typography>
                  {option.value.map((val, valIndex) => (
                    <Chip
                      key={valIndex}
                      label={val}
                      onDelete={() => handleRemoveVariantValue(index, valIndex)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Box>
                  <IconButton color="primary" onClick={() => handleEditOption(index)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleRemoveOption(index)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Add New Variant */}
        <Grid container spacing={3} pt={3}>
          {!addOption && (
            <Grid item xs={4}>
              <Box
              
                sx={{
                  width:"100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  padding: "8px 16px",
                  backgroundColor: "#f9f9f9",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
                onClick={() => setAddOption(true)}
              >
                <AddCircleOutlineIcon sx={{ color: "#757575", marginRight: 1 }} />
                <Typography variant="body1">
                  {options.length > 0 ? "Add another Option" : "Add options like size or color"}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Variant Input Fields */}
          {addOption && (
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mb: 3,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  p: 2,
                  backgroundColor: "#ffffff",
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={5}>
                    <FormControl fullWidth size="small" error={!!variantErrors.name}>
                      <InputLabel id="option-name-label">Option Name</InputLabel>
                      <Select
                        labelId="option-name-label"
                        label="Option Name"
                        value={newOption.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      >
                        {optionnames.map((option) => (
                          <MenuItem
                            key={option.id}
                            value={option.name}
                            disabled={
                              options.some(
                                (opt, index) =>
                                  opt.name.toLowerCase() === option.name.toLowerCase() &&
                                  index !== editingIndex
                              )
                            }
                          >
                            {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {variantErrors.name && <FormHelperText>{variantErrors.name}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      label="Option Values (comma-separated)"
                      size="small"
                      fullWidth
                      value={newOption.value}
                      onChange={(e) => handleInputChange("value", e.target.value)}
                      error={!!variantErrors.value}
                      helperText={variantErrors.value}
                    />
                  </Grid>
                  <Grid item xs={2} sx={{ display: "flex", justifyContent: "center" }}>
                    <IconButton color="error" onClick={handleCancelAddOption}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "end" }}>
                  <Button onClick={handleAddOption} variant="contained" size="small">
                    {editingIndex !== null ? "Update" : "Done"}
                  </Button>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
      {options.length > 0 && <InventoryTable Barcode  ={Barcode}  sku={sku} currentProduct={currentProduct} handleRemovedVariants={handleRemovedVariants} extractvariants={extractvariants} handleaddvariants={handleaddvariants} options={options} price={price} images = {images} editProduct = {editProduct}/>}
    </>
  );
};

export default Variants;
