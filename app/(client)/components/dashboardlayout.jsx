"use client"
import { useState ,useEffect} from "react";
import { AppBar, Box, Button, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from "@mui/material";
import { Menu as MenuIcon, Home as HomeIcon, Dashboard as DashboardIcon, Settings as SettingsIcon, Logout as LogoutIcon } from "@mui/icons-material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useRouter } from "next/navigation";
import ProductForm from "./addproduct";
import UnsavedProductBar from "./unsavedBar";
import { useECart } from "../Context/eCartcontext";
const drawerWidth = 240;

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const[activeTab,setactivetab] = useState("")
 
  const router = useRouter();
  const{show,setshow} = useECart();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
   
  

    { text: "Products", icon: <AddShoppingCartIcon /> },
  ];

  const handleclick = (text) => {
    // Save the active tab in localStorage
    localStorage.setItem('activeTab', text);
  
    switch(text) {
     
      case "Products":
        router.push('/products');
        setactivetab(text);
        break;
      default:
        break;
    }
  }
  
  // On page load or component mount, check the localStorage for the active tab
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      setactivetab(savedTab); // Set the active tab from localStorage
    if (savedTab === "Products") {
        router.push('/products');
      }
    }
  }, [activeTab]);
  
const OpenAddproduct = ()=>{
setshow(true);
localStorage.setItem('add',true);
  router.push('/products/new') 



}
useEffect(()=>{
  let item = localStorage.getItem('add');


},[])

const closeProduct = () => {
  router.push('/products') 

  setshow(false); // Change the state to hide the form
};
  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          My Dashboard
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map(({ text, icon }) => (
          <ListItem
            key={text}
            sx={{
              cursor: "pointer",
              bgcolor: activeTab === text ? "primary.main" : "transparent", // Active tab background blue
              color: activeTab === text ? "white" : "black", // Change text color when active
             
            
            }}
            onClick={() => handleclick (text)}
          >
            <ListItemIcon sx={{ color: activeTab === text ? "white" : "inherit" }}>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <>


    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Top Navbar */}
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px`, background:"#1a1a1a " } }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {activeTab}
          </Typography>
          <div style={{
        display:'flex',
        justifyContent:'center',
        position:'absolute',
        width:"100%",
        top:'11px',
        zIndex:999
       }}>
       {/* <UnsavedProductBar></UnsavedProductBar> */}
       </div>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: drawerWidth } }}>
          {drawer}
        </Drawer>

        <Drawer variant="permanent" sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { width: drawerWidth } }} open>
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
  
      <Box  component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } ,position:"relative", zIndex:0 }}>
        
        <Toolbar /> {/* Space for AppBar */}
    
  {show?'':      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
  <Button
  variant="contained"
 
  onClick={OpenAddproduct}
  sx={{
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
  }}
>
  Add Product
</Button>
    </Box>}
     {children}  
      </Box>
    </Box>
    </>
  );
}
