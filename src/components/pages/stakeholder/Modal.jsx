/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// Modal.js
import React from "react";

function Modal({ isVisible, onClose, children }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white rounded-lg p-6 w-11/12 h-5/6 sm:w-1/2 sm:h-1/2 lg:w-2/3 lg:h-2/3 xl:w-1/2 xl:h-1/2 overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-700 font-bold text-xl"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
