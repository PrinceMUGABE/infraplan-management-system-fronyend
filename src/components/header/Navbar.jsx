/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react'
import { FaBars } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";

function Navbar({sidebarToggle, setSidebarToggle}) {
    return (
        <nav className=' bg-gray-300 flex px-4 py-3 justify-between'>

            <div className=' flex items-center text-xl'>
                <FaBars className=' text-black me-4 cursor-pointer' onClick={()=> setSidebarToggle(!sidebarToggle)} />
                {/* <span className='text-white font-semibold'>Policy M.System</span> */}

            </div>

            <div className=' flex items-center gap-x-5'>

                {/* <div className=' relative md:w-56'>
                    <span className=' relative md:absolute inset-y-0  left-0 flex items-center pl-2'>
                        <button className=' p-1 focus:outline-none text-white md:text-black'>
                            <FaSearch />

                        </button>
                    </span>
                    <input className=' w-full px-4 py-1 pl-12 rounded shadow outline-none hidden md:block' type="text" name="" id="" />
                </div> */}

                {/* Notification */}

                <div className=' text-black'><FaBell /></div>

                {/* Profile */}

                <div className=''>
                    <button className=' text-black group'>
                        <FaUserCircle className=' w-6 h-6 mt-1' />

                        <div className=' z-10 hidden absolute bg-white rounded-lg shadow w-32 group-focus:block right-0 '>
                            <ul className='py-2 text-sm text-gray-950'>
                                <li><a href="">Profile</a></li>
                                <li><a href="">Settings</a></li>
                                <li><a href="">Logout</a></li>

                            </ul>
                        </div>

                    </button>

                </div>



            </div>




        </nav>
    )
}

export default Navbar
