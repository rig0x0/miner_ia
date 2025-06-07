
import axios from "axios";

const clienteAxios = axios.create({
    // baseURL: ''
    baseURL: 'http://localhost:8000',
    withCredentials: true // Incluir cookies en las solicitudes
});

export default clienteAxios;