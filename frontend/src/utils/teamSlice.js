import { createSlice } from "@reduxjs/toolkit";

const teamSlice = createSlice({
    name:"teamSlice",
    initialState:{},
    reducers:{
        addTeamMembers:(state,action) => {
            return action.payload;
        },
        removeTeamMembers:(state,action) => {
            return null;
        },
        
    }
})

export const {addTeamMembers,removeTeamMembers} = teamSlice.actions;
export default teamSlice.reducer;