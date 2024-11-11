import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);
  return (
    <div className="w-full m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b">
          <p className="flex justify-center">No.</p>
          <p className="flex justify-center">Patient</p>
          <p className="flex justify-center">Payment</p>
          <p className="flex justify-center">Age</p>
          <p className="flex justify-center">Date & Time</p>
          <p className="flex justify-center">Fees</p>
          <p className="flex justify-center">Action</p>
        </div>
        {appointments.reverse().map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-200"
            key={index}
          >
            <p className="flex justify-center max-sm:hidden">{index + 1}</p>
            <div className="flex items-center justify-center gap-2">
              <img
                className="w-8 rounded-full"
                src={item.userData.image}
                alt=""
              />
              <p>{item.userData.name}</p>
            </div>
            <div className="flex justify-center">
              <p className="inline text-xs border border-primary px-2 rounded-full">
                {item.payment ? "ONLINE" : "CASH"}
              </p>
            </div>
            <p className="flex justify-center max-sm:hidden">
              {calculateAge(item.userData.dob)}
            </p>
            <p className="flex justify-center">
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>
            <p className="flex justify-center">
              {currency}
              {item.amount}
            </p>
            {item.cancelled ? (
              <p className="flex justify-center text-red-400 text-sm font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="flex justify-center text-green-400 text-sm font-medium">Complete</p>
            ) : (
              <div className="flex justify-center">
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt=""
                />
                <img
                  onClick={() => completeAppointment(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.tick_icon}
                  alt=""
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
