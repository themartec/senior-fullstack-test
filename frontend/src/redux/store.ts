import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import authReducer from './auth'
import snackbarReducer from './snackbar';
import postReducer from './post';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        snackBar: snackbarReducer,
        post: postReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        }),
})

// default store dispatch will use ThunkDispatch type ! 
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
