import React, { useState, useCallback } from "react";
import CustomToast from "../components/CustomToast";
import ToastContext from "../contexts/ToastContext";

export const ToastProvider = ({ children }) => {
  const [toastInfo, setToastInfo] = useState({
    message: "",
    cssClass: "",
    visible: false,
  });

  const showToast = useCallback((message, cssClass) => {
    setToastInfo({
      message: message,
      cssClass: cssClass,
      visible: true,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToastInfo((prevState) => ({
      ...prevState,
      visible: false,
    }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toastInfo.visible && (
        <CustomToast
          message={toastInfo.message}
          className={toastInfo.cssClass}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};
