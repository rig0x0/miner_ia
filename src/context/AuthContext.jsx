import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { authReducer } from './AuthReducer';

const AuthContext = createContext();

const initialState = {
    isAuthenticated: false,
    user: null,
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Verificar la autenticación al cargar la aplicación
    useEffect(() => {
        checkAuth();
    }, []);

    // Función para iniciar sesión
    const login = async (credentials) => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                credentials: 'include',  // Incluye las cookies
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });
            if (response.ok) {
                const data = await response.json();
                dispatch({ type: 'LOGIN', payload: { user: data.user } });
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Función para cerrar sesión
    const logout = async () => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',  // Incluye las cookies
            });
            dispatch({ type: 'LOGOUT' });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Función para verificar la autenticación
    const checkAuth = async () => {
        try {
            const response = await fetch('/api/me', {
                credentials: 'include',  // Incluye las cookies
            });
            if (response.ok) {
                const data = await response.json();
                dispatch({ type: 'CHECK_AUTH', payload: { isAuthenticated: true, user: data.user } });
            } else {
                dispatch({ type: 'CHECK_AUTH', payload: { isAuthenticated: false, user: null } });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);