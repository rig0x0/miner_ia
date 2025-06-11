import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../config/axios';  // Importar la instancia de axios
import { authReducer } from './AuthReducer';
import { useNavigate } from 'react-router';
import clienteAxios from '../config/axios';

const AuthContext = createContext();

const initialState = {
    isAuthenticated: false,
    user: null,
    isLoadingCheckAuth: true, // <-- importante para controlar el spinner
    error: null
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isInitialized, setIsInitialized] = useState(false);
    // Función para iniciar sesión usando React Query y axios
    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            const formData = new FormData();
            formData.append('username', credentials.username);
            formData.append('password', credentials.password);

            // No necesitamos la respuesta aquí, solo saber si fue exitosa
            const response = await clienteAxios.post('/auth/token', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            return response.data
        },
        // --- CORRECCIÓN CON ASYNC/AWAIT ---
        onSuccess: async (data) => {
            console.log(data)
            console.log("Login exitoso en el backend. Invalidando query para obtener datos de usuario...");

            // 1. USA AWAIT: Espera a que la query 'checkAuth' se complete después de ser invalidada.
            // Esto forza a la aplicación a esperar a que la llamada a /auth/me termine.
            await queryClient.invalidateQueries({ queryKey: ['checkAuth'] });

            // 2. SOLO DESPUÉS de que los datos del usuario se hayan recargado, navega.
            console.log("Datos del usuario actualizados en el estado. Redirigiendo...");
            switch (data.rol) {
                case "Supervisor General":
                    navigate("/dashboard", { replace: true });
                    break;
                case "Supervisor de Planta":
                    navigate("/dashboard", { replace: true });
                case "Supervisor de Ensayista":
                    navigate("/ensayes", { replace: true });
                    break;
                case "Ensayista":
                    navigate("/dashboard-ensayista", { replace: true });
                default:
                    break;
            }

        },

        onError: (error) => {
            const errorMessage = error.response?.data?.detail || "Error al iniciar sesión";
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
        },
    });

    // Función para cerrar sesión usando React Query y axios
    const logoutMutation = useMutation({
        mutationFn: async () => {
            const { data } = await clienteAxios.post('/auth/logout');
            return data
        },

        onSuccess: (data) => {
            console.log(data)
            dispatch({ type: 'LOGOUT' });
            // 2. Limpia toda la caché de React Query para eliminar datos del usuario anterior
            queryClient.clear();

            // 3. Redirige al usuario a la página de login
            navigate("/login", { replace: true });
        },

        onError: (error) => {
            console.error('Error:', error.response?.data?.detail || 'Logout failed');
        },
    }
    );

    // Función para verificar la autenticación usando React Query y axios
    const checkAuthQuery = useQuery({
        queryKey: ['checkAuth'],
        queryFn: async () => {
            const { data } = await clienteAxios.get('/auth/me');
            console.log(data)
            return data;
        },
        onSuccess: (data) => {
            console.log(data)
            dispatch({ type: 'LOGIN', payload: { isAuthenticated: true, user: data.user } });
        },
        onError: (error) => {
            console.log(error)
            dispatch({ type: 'LOGOUT' });
        },
        retry: false,  // No reintentar automáticamente en caso de error
        refetchOnWindowFocus: false
    });


    // Función para limpiar errores
    const clearError = () => {
        loginMutation.reset();  // Reinicia el estado de la mutación de login
        logoutMutation.reset(); // Reinicia el estado de la mutación de logout
        // queryClient.removeQueries(['checkAuth']); // Elimina la consulta de autenticación de la caché
    };

    useEffect(() => {
        if (checkAuthQuery.isSuccess && checkAuthQuery.data?.user) {
            dispatch({
                type: 'LOGIN',
                payload: {
                    isAuthenticated: true,
                    user: checkAuthQuery.data.user
                }
            });
            setIsInitialized(true);
        }

        if (checkAuthQuery.isError) {
            dispatch({ type: 'LOGOUT' });
            setIsInitialized(true);
        }
    }, [checkAuthQuery.isSuccess, checkAuthQuery.isError, checkAuthQuery.data]);

    return (
        <AuthContext.Provider
            value={{
                ...state,
                isInitialized,
                login: loginMutation.mutate,
                logout: logoutMutation.mutate,
                isLoadingLogin: loginMutation.isPending,
                isLoadingLogout: logoutMutation.isPending,
                // isLoadingCheckAuth: checkAuthQuery.isLoading,
                errorLogin: loginMutation.error,
                errorLogout: logoutMutation.error,
                errorCheckAuth: checkAuthQuery.error,
                clearError  // Función para limpiar errores
            }}
        >
            {children}
        </AuthContext.Provider>
    );


};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);