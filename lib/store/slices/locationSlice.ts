// lib/store/slices/locationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
    province: string;
    city: string;
}

const initialState: LocationState = {
    province: '',
    city: '',
};

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        setLocation: (state, action: PayloadAction<{ province: string; city: string }>) => {
            state.province = action.payload.province;
            state.city = action.payload.city;
        },
        resetLocation: (state) => {
            state.province = '';
            state.city = '';
        },
    },
});

export const { setLocation, resetLocation } = locationSlice.actions;
export default locationSlice.reducer;