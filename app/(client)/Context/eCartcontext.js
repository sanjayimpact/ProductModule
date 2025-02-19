"use client";
import { createContext, useState, useContext, useEffect } from "react";
import axios from 'axios';

// Cart context to manage cart items and total quantity
const ECartContext = createContext();

export const useECart = () => useContext(ECartContext);

 const ECartProvider = ({ children }) => {
const [products, setProducts] = useState([]);
const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/product"); // Adjust the endpoint
      setProducts(response.data.data);
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


  return (
    <ECartContext.Provider
      value={{
        products,
        deleteproducts,
        fetchProducts
      }}
    >
      {children}
    </ECartContext.Provider>
  );
};

export default ECartProvider;