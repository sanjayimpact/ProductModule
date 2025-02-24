"use client";
import { createContext, useState, useContext, useEffect } from "react";
import axios from 'axios';

// Cart context to manage cart items and total quantity
const ECartContext = createContext();

export const useECart = () => useContext(ECartContext);
const ECartProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [options,setOptions] = useState([]);
  const [variants,setvariants] = useState([]);
  const[show,setshow] = useState(false);
  const[alltags,setalltags]  =useState([])
  const[ allProductType,setallProductType]  =useState([])

  const[vendorinput,setvendorinput] = useState(null);
  const[allbrands,setallbrands] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
const [selectedTags, setSelectedTags] = useState([]);
const[productinput,setinputProducttype] = useState(null);
const [selectedProducttype,setProductType] = useState(null);

const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/product"); // Adjust the endpoint
      setProducts(response.data.data);
      setshow(false);
      localStorage.setItem('add',false)
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };


  const deleteproducts = async(id)=>{
    try {
        const deletedata = await axios.delete(`/api/product/${id}`); // Adjust API endpoint
        return deletedata.data
        
  
      } catch (error) {
        console.error("Error deleting product:", error);
      }
  }

const getTags = async()=>{
  try{
       let response = await axios.get("/api/tag");

       setalltags(response?.data?.data);
  }catch(err){
    console.error("Error fetching tags:", err);
  }
}


const getBrands = async()=>{
  try{
    let response = await axios.get("/api/brand");
    setallbrands(response?.data?.data);
  }catch(err){
    console.log(err);
  }
}
const getproducttype = async()=>{
  try{
    let response = await axios.get("/api/product_type");
    setallProductType(response?.data?.data);
  }catch(err){
    console.log(err);
  }
}

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      sku: generateRandomSKU(), // regenerates a new SKU
      images: [],
      status: "Draft",
      slug: "",
      cprice: "",
      costprice: "",
      Barcode: ""
    });
    setErrors({});
    setOptions([]);
    setvariants([]);
  };


 
  return (
    <ECartContext.Provider
      value={{
        
        products,
        deleteproducts,
        fetchProducts,show,setshow,getTags,alltags,vendorinput,setvendorinput,getBrands,allbrands,selectedVendor, setSelectedVendor,selectedTags, setSelectedTags,setinputProducttype,selectedProducttype,setProductType,allProductType,getproducttype,productinput
      }}
    >
      {children}
    </ECartContext.Provider>
  );
};

export default ECartProvider;