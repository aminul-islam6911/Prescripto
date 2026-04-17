import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/user/forgot-password", {
        email,
      });
      if (data.success) {
        toast.success("Reset link sent to your email");
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold">Forgot Password</p>
        <p>Enter your email to receive a reset link</p>
        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>
        <button type="submit" className="bg-primary text-white w-full py-2 my-2 rounded-md text-base" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        <p>
          Remember your password?{" "}
          <span onClick={() => navigate("/login")} className="text-primary underline cursor-pointer">
            Login here
          </span>
        </p>
      </div>
    </form>
  );
};

export default ForgotPassword;
