
import axios from "axios";

const clienteAxios = axios.create({
    // baseURL: ''
    baseURL: 'http://127.0.0.1:8000',
    withCredentials: true // Incluir cookies en las solicitudes
});

export default clienteAxios;