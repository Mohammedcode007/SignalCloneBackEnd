// redux/usersSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rooms: [],
  join:[],
  exitMessageContent:''
};

const mainSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addToActive: (state, action) => {
      state.rooms.push(action.payload);
    },
    setjoin: (state, action) => {
      state.join.push(action.payload);
    },
    setexitMessageContent: (state, action) => {
      state.exitMessageContent=action.payload;
    },
  },
});

export const { addToActive,setjoin,setexitMessageContent } = mainSlice.actions;
export default mainSlice.reducer;