import { createSlice } from '@reduxjs/toolkit';

export type snackbarAction = {
    type: string
    payload: {
        message: string;
        severity: string
    }
}

const initialState = {
    open: false,
    severity: 'info',
    message: '',
}

export const snackbarSlice = createSlice({
    name: 'snackbar',
    initialState,
    reducers: {
        openSnackbar: (state, action: snackbarAction) => {
            console.log('open snackbar');

            state.open = true;
            state.message = action.payload.message;
            state.severity = action.payload.severity;
        },
        closeSnackbar: (state) => {
            console.log('close snackbar');

            state.open = false;
            state.message = '';
            state.severity = 'info';
        },
    },
});

export const { openSnackbar, closeSnackbar } = snackbarSlice.actions;

export default snackbarSlice.reducer;
