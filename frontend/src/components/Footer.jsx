import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* ------ Left section ------ */}
        <div>
          <img className="mb-5 w-40" src={assets.logo} alt="" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corporis
            accusamus impedit error, aliquam rerum tenetur sapiente nihil nulla
            voluptatibus fuga ut, dolores provident facere, ipsam nam quo
            corrupti eius autem!
          </p>
        </div>

        {/* ------ Center section ------ */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY </p>
          <ul className=" flex flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About Us</li>
            <li>Contact Us</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* ------ Right section ------ */}
        <div>
          <p className="text-xl font-medium mb-5">Get in touch</p>
          <ul className=" flex flex-col gap-2 text-gray-600">
            <li>+8801690188720</li>
            <li>test@gmail.com</li>
          </ul>
        </div>
      </div>
      <div>
        {/* ------ Copyright text ------ */}
        <hr />
        <p className="py-5 text-sm text-center">
          Copyright2024@Bangladesh_Hospital-All rights reserved.{" "}
        </p>
      </div>
    </div>
  );
};

export default Footer;
