// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout.jsx";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";
import VerifyPassword from "./components/auth/VerifyPassword.jsx";
import Layout from "./components/admin/Layout.jsx";


// user
import ResetPassword from "./components/auth/ResetPassword.jsx";
import ChangePassword from "./components/auth/ChangePassword.jsx";
import Home from "./components/pages/admin/Home.jsx";
import Users from "./components/pages/admin/users/Users.jsx";
import EditUser from "./components/pages/admin/users/EditUsers.jsx";
import AdminCreateUser from "./components/pages/admin/users/CreateUser.jsx";
import ManagePlanners from "./components/pages/admin/users/Planners.jsx";
import EditPlanner from "./components/pages/admin/users/EditEnginner.jsx";
import ManageEngineers from "./components/pages/admin/users/Engineers.jsx";
import EditEngineer from "./components/pages/admin/users/EditEnginner.jsx";
import ManageStakeholders from "./components/pages/admin/users/Stakeholders.jsx";
import EditStakeholder from "./components/pages/admin/users/EditStakeholder.jsx";
import ManageProjects from "./components/pages/admin/project/Projects.jsx"
import Editproject from "./components/pages/admin/project/EditProject.jsx";
import ManageProjectsInPlan from "./components/pages/admin/projectUnderPlan/ProjectsInPlan";





const App = () => {
  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in",
      delay: 100,
    });


    AOS.refresh();
  }, []);

  return (
    <div className="bg-white dark:bg-black dark:text-white text-black overflow-x-hidden">
      <BrowserRouter>
        <Routes>

          {/* Home view */}
          <Route path="/" element={<MainLayout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/verifypassword" element={<VerifyPassword />} />
          <Route path="/passwordreset"  element={<ResetPassword />} />
          <Route path="/changePassword" element={<ChangePassword />} />

           {/* End Home view */}

            {/* Admin */}

          <Route path="/admin" element={<Layout />} >
            <Route index element={<Home />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/createUser" element={<AdminCreateUser />} />
            <Route path="/admin/edituser/:id" element={<EditUser />} />

            <Route path="/admin/planners" element={<ManagePlanners />} />
            <Route path="/admin/editplanner/:id" element={<EditPlanner />} />

            <Route path="/admin/engineers" element={<ManageEngineers />} />
            <Route path="/admin/editengineer/:id" element={<EditEngineer />} />

            <Route path="/admin/stakeholders" element={<ManageStakeholders />} />
            <Route path="/admin/editStakeholder/:id" element={<EditStakeholder />} />

            <Route path="/admin/projects" element={<ManageProjects />} />
            <Route path="/admin/editProject/:id" element={<Editproject />} />

            <Route path="/admin/plannedProjects" element={<ManageProjectsInPlan />} />

  
          </Route>

           {/* End of Admin route*/}

        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
