import axios from 'axios';


//fetch product
export const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/product"); // Adjust the endpoint
      return response.data;

     
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

//delete product
  export const deleteproducts = async(id)=>{
    try {
        const deletedata = await axios.delete(`/api/product/${id}`); // Adjust API endpoint
        return deletedata.data;
        
  
      } catch (error) {
        console.error("Error deleting product:", error);
      }
  }

//get all the tags
export const getTags = async()=>{
  try{
       let response = await axios.get("/api/tag");
       return response?.data;
    
  }catch(err){
    console.error("Error fetching tags:", err);
  }
}

//get all brands
export const getBrands = async()=>{
  try{
    let response = await axios.get("/api/brand");
    return response?.data;

  }catch(err){
    console.log(err);
  }
}


//get productType
export const getproducttype = async()=>{
  try{
    let response = await axios.get("/api/product_type");
    return response?.data;

  }catch(err){
    console.log(err);
  }
}

//add tag
export const addtag = async(inputvalue)=>{
    try{
        let response = await axios.post("/api/tag",{tag_name:inputvalue});
        return response.data;

    }catch(err){
        console.log(err);
    }
}
//add brand
export const addvendor = async(vendorinput)=>{
    try{
        let response = await axios.post("/api/brand",{brand_name:vendorinput});
        return response.data;

    }catch(err){
        console.log(err);
    }
}
//add productType

export const addproductype = async(productinput)=>{
    try{
        let response = await axios.post("/api/product_type",{product_type_name:productinput});
        return response.data;

    }catch(err){
        console.log(err);
    }
}
