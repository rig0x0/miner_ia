import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../config/axios';  // Importar la instancia de axios
import { authReducer } from './AuthReducer';
import { useNavigate } from 'react-router';

const AuthContext = createContext();

const initialState = {
    isAuthenticated: false,
    user: null,
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const queryClient = useQueryClient();

    const navigate = useNavigate();

    // Función para iniciar sesión usando React Query y axios
    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            const formData = new FormData();
            formData.append('username', credentials.username);
            formData.append('password', credentials.password);

            const response = await axios.post('/auth/token', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response)

            return response.data;   
        },

        onSuccess: (data) => {
            dispatch({ type: 'LOGIN', payload: { user: data.user } });

            // Pendiente a cambiar a /dashboard
            navigate("/usuarios", { replace: true });
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.detail || "Error al iniciar sesión";
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
        },

    }
    );

    // Función para cerrar sesión usando React Query y axios
    const logoutMutation = useMutation({
        mutationFn: async () => {
            await axios.post('/auth/logout');
        },

        onSuccess: () => {
            dispatch({ type: 'LOGOUT' });
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
            const response = await axios.get('/auth/me');
            return response.data;
        },
        onSuccess: (data) => {
            dispatch({ type: 'CHECK_AUTH', payload: { isAuthenticated: true, user: data.user } });
        },
        onError: () => {
            dispatch({ type: 'CHECK_AUTH', payload: { isAuthenticated: false, user: null } });
        },
        retry: false,  // No reintentar automáticamente en caso de error
    });


    // Función para limpiar errores
    const clearError = () => {
        loginMutation.reset();  // Reinicia el estado de la mutación de login
        logoutMutation.reset(); // Reinicia el estado de la mutación de logout
        // queryClient.removeQueries(['checkAuth']); // Elimina la consulta de autenticación de la caché
    };

    // Verificar la autenticación al cargar la aplicación
    useEffect(() => {
        checkAuthQuery.refetch();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login: loginMutation.mutate,
                logout: logoutMutation.mutate,
                isLoadingLogin: loginMutation.isPending,
                isLoadingLogout: logoutMutation.isPending,
                isLoadingCheckAuth: loginMutation.isPending,
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