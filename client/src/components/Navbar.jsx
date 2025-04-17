import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "./images/logo.png"; // Import the logo image

const Menu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="flex justify-between items-center h-[13%] bg-gray-100 px-6 md:px-10">
        {/* Logo */}
        <div className="w-[20%] flex items-center">
          <img
            src={logo} // Updated src to point to the logo image
            alt="Logo"
            className="h-auto max-h-20 w-full w-auto object-contain" // Adjust height and width dynamically
          />
        </div>

        {/* Navigation Links */}
        <div
          className={`absolute top-20 left-0 bg-gray-100 w-full flex flex-col pl-10 gap-4 py-4 shadow-lg list-none z-20 transition-all duration-300 md:static md:flex-row md:gap-0 md:py-0 md:shadow-none md:w-[50%] md:h-full md:flex md:justify-evenly md:items-center md:list-none font-medium text-xl uppercase tracking-wide ${
            isMenuOpen ? "block" : "hidden"
          }`}
        >
          <li>
            <Link to="/Home" className="relative group" href="#">
              Home
              <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-blue-500 transition-all duration-300 ease-in-out group-hover:w-full"></span>
            </Link>
          </li>

          <li>
            <Link to="/About" className="relative group" href="#">
              About Us
              <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-blue-500 transition-all duration-300 ease-in-out group-hover:w-full"></span>
            </Link>
          </li>
          <li>
            <Link to="/Contact" className="relative group" href="#">
              Contact
              <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-blue-500 transition-all duration-300 ease-in-out group-hover:w-full"></span>
            </Link>
          </li>
        </div>

        {/* Login Button */}
        <div className="hidden md:flex w-[20%] justify-center">
          <Link
            to="/login"
            className="bg-blue-400 text-white text-xl md:text-2xl px-6 md:px-8 text-center py-1 rounded-3xl hover:bg-white hover:text-black  transition-all"
          >
            Login
          </Link>
        </div>

        {/* Hamburger Menu */}
        <div
          className="flex flex-col justify-center items-center md:hidden cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="w-8 h-1 bg-blue-500 mb-1"></div>
          <div className="w-8 h-1 bg-blue-500 mb-1"></div>
          <div className="w-8 h-1 bg-blue-500"></div>
        </div>
      </nav>
    </>
  );
};

export default Menu;