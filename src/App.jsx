import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import React from "react";
import Menu from "./components/Navbar";
import '@fortawesome/fontawesome-free/css/all.min.css';
import SignUp from "./pages/Signup";
import Login from "./pages/Login"; 
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Teams from "./pages/Teams";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import ProjectDetails from "./components/ProjectDetails";

const Layout = ({ children }) => {
  const location = useLocation();
  const isSignUpPage = location.pathname === "/Signup" || location.pathname === "/Login";

  return (
    <div className="w-screen h-screen flex flex-col">
      {!isSignUpPage && (
        <div className="w-full h-[13%]">
          <Menu />
        </div>
      )}
      <div className={`w-full ${isSignUpPage ? "h-full" : "h-[86%]"} p-7 md:p-10`}>
        {children}
      </div>
      {!isSignUpPage}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/Home" element={<Home/>}/>
        <Route path="/Signup" element={<SignUp />} />
        <Route path="/Login" element={<Login />} />
        <Route path = "/About" element={<><Menu/><About/></>}/>
        <Route path = "/Projects" element={<><Menu/><Projects/></>}/>
        <Route path = "/Teams" element={<><Menu/><Teams/></>}/>
        <Route path = "/Contact" element={<><Menu/><Contact/></>}/>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
