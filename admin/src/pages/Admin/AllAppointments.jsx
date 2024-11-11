import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } =
    useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  return (
    <div className="w-full m-5 ">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b">
          <p className="flex items-center justify-center">#</p>
          <p className="flex items-center justify-center">Patient</p>
          <p className="flex items-center justify-center">Age</p>
          <p className="flex items-center justify-center">Date & Time</p>
          <p className="flex items-center justify-center">Doctor</p>
          <p className="flex items-center justify-center">Fees</p>
          <p className="flex items-center justify-center">Action</p>
        </div>

        {appointments.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-200"
            key={index}
          >
            <p className="flex items-center justify-center max-sm:hidden">
              {index + 1}
            </p>
            <div className="flex items-center justify-center gap-2">
              <img
                className="w-8 rounded-full"
                src={item.userData.image}
                alt=""
              />
              <p>{item.userData.name}</p>
            </div>
            <p className="flex items-center justify-center max-sm:hidden">
              {calculateAge(item.userData.dob)}
            </p>
            <p className="flex items-center justify-center">
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>
            <div className="flex items-center justify-center gap-2">
              <img
                className="w-8 rounded-full bg-gray-200"
                src={item.docData.image}
                alt=""
              />
              <p>{item.docData.name}</p>
            </div>
            <p className="flex items-center justify-center">
              {currency}
              {item.amount}
            </p>
            {item.cancelled ? (
              <p className="flex items-center justify-center text-red-400 text-sm font-medium">
                Cancelled
              </p>
            ) : (
              <img
                onClick={() => cancelAppointment(item._id)}
                className="w-10 cursor-pointer"
                src={assets.cancel_icon}
                alt=""
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAppointments;
