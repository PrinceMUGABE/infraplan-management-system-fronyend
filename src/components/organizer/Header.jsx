import React, { useState, useEffect } from "react";
import { GoBell } from "react-icons/go";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (userData) {
      setUsername(userData.username);
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      <div>
        <h1 className="text-xs text-gray-500">Welcome Back!</h1>
        {/* <p className="text-xl text-black font-semibold">{username}</p> */}
      </div>
      <div className="flex items-center space-x-5">
    
        {/* <div className="relative">
          <button className="relative text-gray-600">
            <GoBell size={28} />
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex justify-center items-center bg-indigo-600 text-white font-semibold text-[10px] w-5 h-4 rounded-full border-2 border-white">
              9
            </span>
          </button>
        </div> */}
        <div className="relative">
          <div className=" flex gap-2">
            <div>
            <FaUserCircle className="w-8 h-8 rounded-full border-4 border-indigo-400 cursor-pointer" 
            onClick={toggleDropdown}
            />
              {/* <img
                
                // src='https://randomuser.me/api/portraits/women/50.jpg'
                alt="User"
                
              /> */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                  {/* <Link
                    to="/organizer/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-indigo-500 hover:text-white"
                  >
                    Profile
                  </Link> */}
                  <Link
                    to="/"
                    className="block px-4 py-2 text-gray-800 hover:bg-indigo-500 hover:text-white"
                  >
                    Logout
                  </Link>
                </div>
              )}
            </div>
            <p>{username}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
