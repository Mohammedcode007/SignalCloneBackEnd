// redux/usersSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rooms: [],
  join:[],
  exitMessageContent:'',
  notify:0
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
    addTonotify: (state, action) => {
      state.notify=action.payload
    },
    // removeFromnotify: (state, action) => {
    //   const notifyToRemove = action.payload;
    //   state.notify = state.notify.filter(room => room.id !== roomIdToRemove);
    // },
    setjoin: (state, action) => {
      state.join.push(action.payload);
    },
    setexitMessageContent: (state, action) => {
      state.exitMessageContent=action.payload;
    },
  },
});

export const { addToActive,setjoin,setexitMessageContent,removeFromActive,addTonotify } = mainSlice.actions;
export default mainSlice.reducer;