// redux/rootReducer.js

import { combineReducers } from 'redux';
import mainReducer from './mainSlice';
import themeReducer from './themeReducer';

const rootReducer = combineReducers({
    mainReducer: mainReducer,
    theme: themeReducer,

});

export default rootReducer;
