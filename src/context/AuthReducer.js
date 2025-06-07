export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                isLoadingCheckAuth: false, // <- Importante
                error: null,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                isLoadingCheckAuth: false, // <- También aquí
                error: null,
            };
        case 'CHECK_AUTH':
            return {
                ...state,
                isAuthenticated: action.payload.isAuthenticated,
                user: action.payload.user,
                isLoadingCheckAuth: false,
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                isLoadingCheckAuth: false, // <- Aquí también
            };
        default:
            return state;
    }
};