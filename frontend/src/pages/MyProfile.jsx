import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } =
    useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);

      image && formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const calculateWidth = (text) => `${Math.max(150, text.length * 8)}px`;

  return (
    userData && (
      <div className="max-w-lg flex flex-col gap-2 text-sm pt-5">
        {isEdit ? (
          <label htmlFor="image">
            <div className="inline-block relative cursor-pointer">
              <img
                className="w-36 rounded opacity-75"
                src={image ? URL.createObjectURL(image) : userData.image}
                alt=""
              />
              <img
                className="w-10 absolute bottom-12 right-12"
                src={image ? "" : assets.upload_icon}
                alt=""
              />
            </div>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="image"
              hidden
            />
          </label>
        ) : (
          <img className="w-36 rounded" src={userData.image} alt="" />
        )}

        {isEdit ? (
          <input
            className="bg-gray-50 font-medium text-3xl max-w-60 mt-4 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            value={userData.name}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        ) : (
          <p className="font-medium text-3xl text-neutral-800 mt-4">
            {userData.name}
          </p>
        )}
        <hr className="bg-zinc-400 h-[1px] border-none" />
        <div>
          <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Email Id:</p>
            <p className="text-blue-500">{userData.email}</p>
            {/* <p className="font-medium">Phone:</p>
          {isEdit ? (
            <input className="bg-gray-50 max-w-52 border border-gray-500"
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, phone: e.target.value }))
              }
              value={userData.phone}
              type="text"
            />
          ) : (
            <p className="text-blue-500">{userData.phone}</p>
          )} */}
            <p className="font-medium">Phone:</p>
            {isEdit ? (
              <div className="relative inline-block">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 font-bold text-gray-700">
                  +880
                </span>
                <input
                  className="bg-gray-50 pl-12 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ width: calculateWidth(userData.phone) }}
                  onChange={(e) => {
                    // Remove non-digit characters and limit to 10 digits
                    const input = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setUserData((prev) => ({ ...prev, phone: input }));
                  }}
                  value={userData.phone}
                  type="text"
                />
              </div>
            ) : (
              <p className="text-blue-500">+880 {userData.phone}</p>
            )}
            <p className="font-medium">Address:</p>
            {isEdit ? (
              <p className="flex-row space-y-1">
                <input
                  className="bg-gray-50 w-full pl-1 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }))
                  }
                  value={userData.address.line1}
                  type="text"
                />
                <br />
                <input
                  className="bg-gray-50 w-full pl-1 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value },
                    }))
                  }
                  value={userData.address.line2}
                  type="text"
                />
              </p>
            ) : (
              <p className="text-gray-500">
                {userData.address.line1}
                <br />
                {userData.address.line2}
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
          <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
            <p className="font-medium">Gender:</p>
            {isEdit ? (
              <select
                className="bg-gray-50 max-w-20 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, gender: e.target.value }))
                }
                value={userData.gender}
              >
                <option value="Not Selected">Not Selected</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : (
              <p className="text-gray-500">{userData.gender}</p>
            )}
            <p className="font-medium">Birthday:</p>
            {isEdit ? (
              <input
                className="bg-gray-50 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ width: calculateWidth(userData.dob) }}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, dob: e.target.value }))
                }
                value={userData.dob}
                type="date"
              />
            ) : (
              <p className="text-gray-500">{userData.dob}</p>
            )}
          </div>
        </div>
        <div className="mt-5">
          {isEdit ? (
            <button
              className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={updateUserProfileData}
            >
              Save Information
            </button>
          ) : (
            <button
              className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
              onClick={() => setIsEdit(true)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    )
  );
};

export default MyProfile;
