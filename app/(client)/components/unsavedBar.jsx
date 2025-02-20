import React from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function UnsavedProductBar() {
  return (
   <>


  <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#303030",   // Dark background
        color: "#fff",                // White text
        borderRadius: 3,             // Rounded corners (adjust as needed)
        p: 0.5,                         // Padding inside the bar
        width: "50%",               // Full width, or set a max-width if you prefer
      }}
    >
      {/* Left side: Icon + Label */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
        <WarningAmberIcon fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 500 ,  fontSize:'12px',}}>
          Unsaved product
        </Typography>
      </Box>

      {/* Right side: Discard & Save buttons */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1,  }}>
        <Button
          variant="text"
          sx={{
            fontSize:'12px',
            color: "#E3E3E3",        // Lighter text color
            textTransform: "none",
            backgroundColor:"#4c4c4c"
        
          }}
        >
          Discard
        </Button>
        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: 3,            // Slightly rounded button
            backgroundColor: "#fff",    // White background
            color: "#000", 
            fontSize:'12px',             // Black text for contrast
            "&:hover": {
              backgroundColor: "#f2f2f2", // Slightly darker on hover
            },
          }}
        >
          Save
        </Button>
      </Box>
    </Box>


   </>
  );
}
