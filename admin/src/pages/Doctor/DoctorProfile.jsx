import React from "react";
import { useContext } from "react";
import { useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } =
    useContext(DoctorContext);
  const { currency } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);

  const updateDoctorProfile = async () => {
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available,
      };
      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        updateData,
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  const calculateWidth = (text) => `${Math.max(150, text.length * 8)}px`;
  return (
    profileData && (
      <div>
        <div className="flex flex-col gap-4 m-5">
          <div>
            <img
              className="bg-primary/80 w-full sm:max-w-64 rounded-lg"
              src={profileData.image}
              alt=""
            />
          </div>
          <div className="flex-1 border border-r-stone-100 rounded-lg p-8 py-7 bg-white">
            {/* Doctors Information */}
            <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
              {profileData.name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <p>
                {profileData.degree} - {profileData.speciality}
              </p>
              <button className="py-0.5 px-2 border text-sm rounded-full">
                {profileData.experience}
              </button>
            </div>
            {/* Doctor About */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3">
                About:
              </p>
              <p className="text-sm text-gray-600 max-w-[700px] mt-1">
                {profileData.about}
              </p>
            </div>
            <p className="text-gray-600 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-800">
                {currency}{" "}
                {isEdit ? (
                  <input
                    className="bg-gray-50 font-medium max-w-60 pl-1 mt-4 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ width: calculateWidth(profileData.fees) }}
                    type="number"
                    value={profileData.fees}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        fees: e.target.value,
                      }))
                    }
                  />
                ) : (
                  profileData.fees
                )}
              </span>
            </p>
            <div className="flex gap-2 py-2">
              <p>Address:</p>
              {isEdit ? (
                <p className="flex-row space-y-1">
                  <input
                    className="bg-gray-50 w-full pl-1 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line1: e.target.value },
                      }))
                    }
                    value={profileData.address.line1}
                    type="text"
                  />
                  <br />
                  <input
                    className="bg-gray-50 w-full pl-1 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line2: e.target.value },
                      }))
                    }
                    value={profileData.address.line2}
                    type="text"
                  />
                </p>
              ) : (
                <p className="text-gray-500">
                  {profileData.address.line1}
                  <br />
                  {profileData.address.line2}
                </p>
              )}
            </div>
            <div className="flex gap-1 pt-2">
              <input
                onChange={() =>
                  isEdit &&
                  setProfileData((prev) => ({
                    ...prev,
                    available: !prev.available,
                  }))
                }
                checked={profileData.available}
                type="checkbox"
                name=""
                id=""
              />
              <label htmlFor="">Available</label>
            </div>
            <div className="mt-5">
              {isEdit ? (
                <button
                  className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
                  onClick={updateDoctorProfile}
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
        </div>
      </div>
    )
  );
};

export default DoctorProfile;
