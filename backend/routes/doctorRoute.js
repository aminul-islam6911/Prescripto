import express from "express";
import {
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile
} from "../controller/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";
import { authRateLimiter } from "../middlewares/rateLimiters.js";
import { logout, refreshToken } from "../controller/authController.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", authRateLimiter, loginDoctor);
doctorRouter.post("/refresh-token", authRateLimiter, refreshToken("doctor"));
doctorRouter.post("/logout", logout("doctor"));
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);

export default doctorRouter;
