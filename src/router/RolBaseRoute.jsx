import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export const RoleBasedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth(); // Solo necesitamos el usuario del contexto

    // Asumimos que la estructura del usuario es { ..., rol: { name: 'Supervisor General' } }
    // Usa optional chaining (?.) para evitar errores si user o user.rol es null.
    const userRole = user?.rol?.name;

    console.log(user)
    // 1. Comprueba si el rol del usuario está en la lista de roles permitidos.
    const isAuthorized = userRole && allowedRoles.includes(userRole);

    // 2. Si el rol no está autorizado, redirige a una página de "No Autorizado".
    //    Es mejor que redirigir al login, porque el usuario SÍ está logueado,
    //    simplemente no tiene permisos.
    if (!isAuthorized) {
        return <Navigate to="/unauthorized" replace />;
    }

    // 3. Si está autorizado, renderiza el componente hijo.
    return children;
};