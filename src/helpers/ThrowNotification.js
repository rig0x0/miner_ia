import { Slide, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export const throwNotification = (message, type) => {
    switch (type) {
        case "success":
            toast.success(message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                transition: Slide,
                theme: "light",
            });
            break;
        case "error":
            toast.error(message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                transition: Slide,
                theme: "light",
            });
            break;
        case "info":
            console.log("notificacion Info")
        default:
            console.log('default')
            break;
    }
}