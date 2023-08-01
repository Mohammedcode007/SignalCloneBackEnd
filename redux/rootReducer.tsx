// redux/rootReducer.js

import { combineReducers } from 'redux';
import mainReducer from './mainSlice';

const rootReducer = combineReducers({
    mainReducer: mainReducer,
});

export default rootReducer;
