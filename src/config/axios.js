
import axios from "axios";

const clienteAxios = axios.create({
    // baseURL: ''
    baseURL: 'https://mineria-backend-beta.onrender.com',
    withCredentials: true // Incluir cookies en las solicitudes
});

export default clienteAxios;