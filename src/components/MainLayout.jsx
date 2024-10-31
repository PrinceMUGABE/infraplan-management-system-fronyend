/* eslint-disable no-unused-vars */
import React from "react";
import Navbar from "./Navbar/Navbar.jsx";
import Hero from "./Hero/Hero";
// import BrandsLogo from "./BrandsLogo/BrandsLogo.jsx";
// import Services from "./Services/Services";
import Footer from "./Footer/Footer";
import About from "./about/About.jsx";
import Contact from "./contact/Contact.jsx";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Hero />
      {/* <BrandsLogo /> */}
      <About />
      {/* <Services /> */}
      <Contact />
      <br />
      <br />
      <Footer />
    </>
  );
};

export default MainLayout;