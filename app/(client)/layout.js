import { Dashboard } from "@mui/icons-material";
import DashboardLayout from "./components/dashboardlayout";
import  ECartProvider from "./Context/eCartcontext";
export default function RootLayout({ children }) {
  return (
<div>
<ECartProvider>

<DashboardLayout  children= {children}/>

</ECartProvider>

  

</div>
    
  );
}
