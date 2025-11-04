import { toast } from "react-toastify";


// error message toast
export const errorToastMsg = (message: any) => {
  toast.error(message, {
    position: "top-right",
    autoClose: false,
    hideProgressBar: true,
    closeOnClick: true,
  });
};

// success message toast
export const successMsg = (message: any) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
  });
};



