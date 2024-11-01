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
import Planner_Layout from "./components/pages/planner/Layout.jsx";

import PrivateRoute from "./components/ProtectRoutes.jsx";
import PlannerHome from "./components/pages/planner/Home.jsx";
import Stakeholder_Layout from "./components/pages/stakeholder/Layout.jsx";
import Stakeholer_Home from "./components/pages/stakeholder/Home.jsx";
import Engineer_Layout from "./components/pages/engineer/Layout.jsx";
import Enginner_Home from "./components/pages/engineer/Home.jsx";
import Engineer_Manage_Planned_projects from "./components/pages/engineer/PlannedProjects.jsx";
import PlannerManageProjectPlans from "./components/pages/planner/MyProjectPlans.jsx";

import StakeholderManageFundedProjects from "./components/pages/stakeholder/MyProjects.jsx";
import AdminManageStakeholder_Application from "./components/pages/admin/stakeholder_applications.jsx";
import AdminManageEngineer_Application from "./components/pages/admin/enginner_applications.jsx"





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


          <Route path="/admin" element={<PrivateRoute><Layout /></PrivateRoute>} >
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
            <Route path="/admin/stakeholder_applications" element={<AdminManageStakeholder_Application />} />
            <Route path="/admin/engineerApplications" element={<AdminManageEngineer_Application />} />

  
          </Route>

           {/* End of Admin route*/}


            {/* Start of Planner routes route*/}
            <Route path="/planner" element={<PrivateRoute><Planner_Layout /></PrivateRoute>} >
              <Route index element={<PlannerHome />} />
              <Route path="/planner/projects" element={<PlannerManageProjectPlans />} />
        
           </Route>
           {/* Ends of Planner routes route*/}

           {/* Start of Stakeholder routes route*/}
           <Route path="/stakeholder" element={<PrivateRoute><Stakeholder_Layout /></PrivateRoute>} >
              <Route index element={<Stakeholer_Home />} />
              <Route path="/stakeholder/projects" element={<StakeholderManageFundedProjects />} />
        
           </Route>
           {/* Ends of Stakeholder routes route*/} 


           {/* Start of Engineer routes route*/}
           <Route path="/engineer" element={<PrivateRoute><Engineer_Layout /></PrivateRoute>} >
              <Route index element={<Enginner_Home />} />
              <Route path="projects" element={<Engineer_Manage_Planned_projects />} />
        
           </Route>
           {/* Ends of Engineer routes route*/} 




        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
