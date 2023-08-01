// redux/usersSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rooms: [],
  time:''
};

const mainSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addToActive: (state, action) => {
      state.rooms.push(action.payload);
    },
    setTime: (state, action) => {
      state.time=action.payload;
    },
  },
});

export const { addToActive,setTime } = mainSlice.actions;
export default mainSlice.reducer;