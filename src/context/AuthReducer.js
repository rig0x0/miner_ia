export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
            };
        case 'CHECK_AUTH':
            return {
                ...state,
                isAuthenticated: action.payload.isAuthenticated,
                user: action.payload.user,
            };
        default:
            return state;
    }
};