import { createSlice } from '@reduxjs/toolkit';
import { AppThunk } from './store';
import apiService from '../lib/apiService';
import { openSnackbar } from './snackbar';
import { IPost } from '../../../backend/src/model/post';

const initialState = {
    posts: [],
    totalCount: 0,
    isLoading: false
}

export const postSlice = createSlice({
    name: 'post',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        successGetData: (state, action) => {
            state.posts = action.payload.posts;
            state.totalCount = action.payload.totalCount;
            state.isLoading = false;
        }
    },
});

export const { successGetData, setLoading } = postSlice.actions;

export const newPost = (content: string, cb: Function): AppThunk => async (dispatch, getState) => {
    try {
        await apiService.post('/post', {
            content: content
        })

        dispatch(openSnackbar({
            message: 'Successfully created a new post!',
            severity: 'success',
        }));

        cb && cb();
    } catch (err) {
        console.log(err);
    }
}

export const syncInsight = (): AppThunk => async (dispatch, getState) => {
    try {
        await apiService.post('/post/sync-insight');

        dispatch(openSnackbar({
            message: 'Successfully synced insights!',
            severity: 'success',
        }));
    } catch (err) {
        console.log(err);
    }
}

export const getPosts = (page: number, pageSize: number): AppThunk => async (dispatch, getState) => {
    dispatch(setLoading(true));
    const response: any = await apiService.get('/post', {
        params: {
            page: page,
            pageSize: pageSize
        }
    })

    // create loading effect for demo
    setTimeout(() => {
        const posts: IPost[] = response.data.items;
        const totalCount: number = response.data.total

        dispatch(successGetData({
            posts,
            totalCount
        }))
    }, 500);

}

export default postSlice.reducer;