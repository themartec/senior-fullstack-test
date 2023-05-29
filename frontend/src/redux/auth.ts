import { createSlice, ThunkAction } from "@reduxjs/toolkit";
import { AppThunk, store } from "./store";
import apiService, { setAuthToken } from "../lib/apiService";
import { openSnackbar } from "./snackbar";

const localToken = window.localStorage.getItem('token');
const user = window.localStorage.getItem('user');

if (localToken) {
    setAuthToken(localToken);
    console.log('Go to dashboard');

    if (window.location.pathname === '/login' || window.location.pathname === '/register') {
        window.location.href = '/auction';
    }
} else {
    console.log('Go to login page');
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

const initialState = {
    token: localToken || null,
    isAuthenticated: false,
    isLoading: false,
    user: user ? JSON.parse(user) : null
};

// HOW TO APP EFFECT Frontend
export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        userLoading: (state) => {
            state.isLoading = true;
        },
        loginSuccess: (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.token = action.payload.token;
            // not set info yet, we will use API info to get user info later
            //
            //set the header with the token
            setAuthToken(action.payload.token)
            window.localStorage.setItem('token', action.payload.token);
        },
        loadProfileSuccess: (state, action) => {
            state.user = action.payload.data;
            window.localStorage.setItem('user', JSON.stringify(action.payload.data));
        },
        logoutSuccess: (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('user');

            window.location.href = '/';
        },
        registerSuccess: (state, action) => {
            window.location.href = '/';
        },

    },
});

export const { userLoading, loginSuccess, logoutSuccess, registerSuccess, loadProfileSuccess } = authSlice.actions;


// HOW TO APP CALL Backend & interact with another store reducers

// write async actions !!!
// using thunk middleware to dispatch async actions & interact with store (fetch API)
// use useDispatch hook to dispatch actions later in components

interface LoginData {
    identify: string;
    password: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export const login = (input: LoginData): AppThunk => async (dispatch, getState) => {
    // dispatch userLoading action
    dispatch(userLoading());

    // fetch API
    const response = await apiService.post('/auth/login', { ...input }).then((response) => {
        const data = response.data.data;

        // dispatch loginSuccess action
        dispatch(loginSuccess(data));
        dispatch(openSnackbar({
            message: 'Login success!',
            severity: 'success',
        }));

        dispatch(loadProfile(() => {
            window.location.href = '/auction';
        }));

    }).catch((err) => {
        dispatch(openSnackbar({
            message: err.message,
            severity: 'error',
        }));
    });
};

export const loadProfile = (cb: Function): AppThunk => async (dispatch, getState) => {
    // dispatch userLoading action
    dispatch(userLoading());

    // fetch API
    const response = await apiService.get('/auth/profile');

    const data = await response.data;

    // dispatch loadProfileSuccess action
    dispatch(loadProfileSuccess(data));

    cb && cb();
}

export const logout = (): AppThunk => async (dispatch, getState) => {
    // dispatch userLoading action
    dispatch(userLoading());

    // fetch API
    const response = await apiService.post('/auth/logout');

    const data = await response.data;

    // dispatch logoutSuccess action
    dispatch(logoutSuccess());
};

export const register = (input: RegisterData): AppThunk => async (dispatch, getState) => {
    //check is logined
    const { auth } = getState();

    if (auth.isAuthenticated) {
        return;
    }

    // fetch API
    apiService.post('/auth/register', { ...input }).then((response) => {
        const data = response.data;

        dispatch(openSnackbar({
            message: 'Successfully registered, redirect to login page in 5s',
            severity: 'success',
        }));

        // we not gonna login user after registration, we will redirect to login page instead
        setTimeout(() => {
            dispatch(registerSuccess(data))
        }, 5000);
    }).catch((error) => {
        dispatch(openSnackbar({
            message: error.response.data.message,
            severity: 'error',
        }));
    });
};

export const deposit = (amount: number, cb: Function): AppThunk => async (dispatch, getState) => {
    // dispatch userLoading action
    dispatch(userLoading());

    // fetch API
    const response = await apiService.post('/wallet/deposit', { amount });

    const data = await response.data;

    dispatch(openSnackbar({
        message: 'Successfully deposited!',
        severity: 'success',
    }));

    // dispatch loadProfileSuccess action
    store.dispatch(loadProfile(() => { }))

    cb && cb();
};

export const loginFacebook = (user: any, loginResponse: any): AppThunk => async (dispatch, getState) => {

    //send access token to backend to extend the token to long live token
    const res = await apiService.post('/auth/save-token', {
        type: 'facebook',
        name: user.name,
        _token: loginResponse.accessToken
    })

    if (res) {
        dispatch(loadProfile(() => { }));

        dispatch(openSnackbar({
            message: 'Successfully login via Facebook!',
            severity: 'success',
        }));
    }
}

export const loginLinkedin = (user: any, loginResponse: any): AppThunk => async (dispatch, getState) => {
    const res = await apiService.post('/auth/save-token', {
        type: 'linkedin',
        name: user.name,
        _token: loginResponse.accessToken
    })

    if (res) {
        dispatch(loadProfile(() => { }));

        dispatch(openSnackbar({
            message: 'Successfully login via Linkedin!',
            severity: 'success',
        }));
    }
}

export default authSlice.reducer;