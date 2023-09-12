import { createContext } from "react";

const ToastContext = createContext({
  showToast: (message, cssClass) => {},
  hideToast: () => {},
});

export default ToastContext;
