import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage for web
import { combineReducers } from "redux";
import userReducer from "./userSlice";
import teamReducer from "./teamSlice";
import statusReducer from "./teamStatus"

// 1. Combine your reducers
const rootReducer = combineReducers({
  userSlice: userReducer,
  teamSlice: teamReducer,
  teamStatusSlice:statusReducer,
});

// 2. Create persist config
const persistConfig = {
  key: "root",
  storage,
};

// 3. Wrap rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Configure the store with the persisted reducer
const Store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

const persistor = persistStore(Store);

export { Store, persistor };
