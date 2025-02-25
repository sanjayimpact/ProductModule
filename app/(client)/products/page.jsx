
"use client";
import { useEffect, useState } from "react";
import { useECart } from "../Context/eCartcontext";
import { useRouter } from "next/navigation";
import Styles from './product.module.css'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,

  Dialog,
  DialogTitle,
  DialogContent,

  IconButton,
  Snackbar, Alert
} from "@mui/material";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EditProductForm from "../components/editProduct";
import Image from "next/image";


const Product = () => {

  const { products, deleteproducts, fetchProducts ,setshow} = useECart();
  const [iserror, seterror] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [message, setMessage] = useState("");
const router = useRouter();




  // Handle Edit Product
  const handleEditClick = (product) => {

    setshow(true);
    setCurrentProduct(product);
 router.push(`/products/${product?._id}`)
    setEditOpen(true);
  };



  // Handle Delete Product
  const handleDeleteProduct = async (id) => {
    try {
      let send = await deleteproducts(id);
      if (send?.isSuccess) {
        setSnackbarOpen(true);
        setMessage(send?.message);
        router.push('/products')
        fetchProducts();
      }
      else {
        setSnackbarOpen(true);
        setMessage(send?.message);
        router.push('/products')
        seterror(true);
      }
    } catch (err) { }
  };
  useEffect(() => {
    fetchProducts()
    if(products.length===0){
      setshow(false);
      localStorage.setItem('add',false)
    }
  }, [])
useEffect(()=>{
  setshow(false);
  localStorage.setItem('add',false)
},[])
  return (
    <>
      <Box sx={{  }}>
   

        <TableContainer component={Paper} sx={{tableLayout:"fixed"}} >
          <Table>
            <TableHead  sx={{backgroundColor:"#f7f7f7"}}>
              <TableRow >
         
                <TableCell className={Styles.cellpadding}  ><strong>Product </strong></TableCell>
                <TableCell className={Styles.cellpadding}><strong>Status</strong></TableCell>
               
         
                <TableCell className={Styles.cellpadding}><strong>Inventory</strong></TableCell>

             
                <TableCell className={Styles.cellpadding}><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {products.length > 0 ? (
    products.map((product) => (
      <TableRow onClick={() => handleEditClick(product)} sx={{ cursor: 'pointer' }} key={product._id}>
        {/* Product Image */}
        <TableCell  className={Styles.customtable} >
        <div  className={Styles.textstyle}>
        <Image 
            src={product?.featured_image[0] || "/placeholder.jpg"}
            alt={product?.product_name}
            width={50}
            height={50}
            style={{ borderRadius: "5px" }}
          /> {product.product_name}
        </div>
        </TableCell>

      
        <TableCell>
  <div
    style={{
      width:'30%',textAlign:'center',
      backgroundColor: product.product_status === "Draft" ? "#D5EBFF" :
        product.product_status === "Active" ? "#affebf" : "transparent",
      padding: '5px', // Optional: to add padding if needed
      borderRadius: '10px' // Optional: to round the corners if desired
    }}
  >
    {product.product_status}
  </div>
</TableCell>


        {/* Total Variations Count */}
        <TableCell sx={{ color: product?.variants?.length > 0 ? 'black':'gray' }}>
  {product?.variants?.length > 0
    ? `${product.variants.reduce((total, variant) => total + (variant?.stock_Id?.stocks || 0), 0)} in stock for ${product.variants.length} variants`
    : `${product?.defaultstock || 0} in stock`} {/* Show defaultStock if no variants exist */}
</TableCell>

    

        {/* Actions */}
        <TableCell>
          <IconButton color="error" onClick={() => handleDeleteProduct(product._id)}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={6} align="center">
        No products available.
      </TableCell>
    </TableRow>
  )}
</TableBody>

          </Table>
        </TableContainer>

      



      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={800}
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
};

export default Product;
