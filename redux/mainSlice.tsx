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
    removeFromActive: (state, action) => {
      const roomIdToRemove = action.payload;
      state.rooms = state.rooms.filter(room => room.id !== roomIdToRemove);
    },
    setjoin: (state, action) => {
      state.join.push(action.payload);
    },
    setexitMessageContent: (state, action) => {
      state.exitMessageContent=action.payload;
    },
  },
});

export const { addToActive,setjoin,setexitMessageContent,removeFromActive } = mainSlice.actions;
export default mainSlice.reducer;