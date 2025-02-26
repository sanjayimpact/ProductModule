"use client";
import { createContext, useState, useContext, useEffect } from "react";
import axios from 'axios';

// Cart context to manage cart items and total quantity
const ECartContext = createContext();

export const useECart = () => useContext(ECartContext);
const ECartProvider = ({ children }) => {
  const [products, setProducts] = useState([]);

  const[show,setshow] = useState(false);
  const[alltags,setalltags]  =useState([])
  const[ allProductType,setallProductType]  =useState([])
 const[inputvalue,setInputvalue] = useState(null);
  const[vendorinput,setvendorinput] = useState(null);
  const[allbrands,setallbrands] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
const [selectedTags, setSelectedTags] = useState([]);
const[productinput,setinputProducttype] = useState(null);
const [selectedProducttype,setProductType] = useState(null);
const [variants, setvariants] = useState([]);
  const [removevariation, setremovevariation] = useState([]);
 const [options, setOptions] = useState([]);
  const [removeoptions, setremoveoptions] = useState([]);
 const handleAddOptions = (values) => {
  setOptions(values);
};
 
const handleaddvariants = (values) => {
  setvariants(values);
};
const handleRemovedVariants = (values) => {
  setremovevariation(values);
}


const handlremoveOptions = (values) => {
  setremoveoptions(values);
}

  return (
    <ECartContext.Provider
      value={{
        
        products,setalltags,setallProductType,setallbrands,
       show,setshow,alltags,vendorinput,setvendorinput,allbrands,selectedVendor, setSelectedVendor,selectedTags, setSelectedTags,setinputProducttype,inputvalue,setInputvalue,selectedProducttype,setProductType,allProductType,productinput,options, setOptions,handleAddOptions,variants, setvariants,handleaddvariants,removevariation, setremovevariation,handleRemovedVariants,removeoptions, setremoveoptions,handlremoveOptions
      }}
    >
      {children}
    </ECartContext.Provider>
  );
};

export default ECartProvider;