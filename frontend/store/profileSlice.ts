import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProfileState {
  profiles: any[];
  myProfile: any | null;
}

const initialState: ProfileState = {
  profiles: [],
  myProfile: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfiles: (state, action: PayloadAction<any[]>) => {
      state.profiles = action.payload;
    },
    setMyProfile: (state, action: PayloadAction<any>) => {
      state.myProfile = action.payload;
    },
    updateMyProfileData: (state, action: PayloadAction<any>) => {
      if (state.myProfile) {
        state.myProfile = { ...state.myProfile, ...action.payload };
      }
    },
  },
});

export const { setProfiles, setMyProfile, updateMyProfileData } = profileSlice.actions;
export default profileSlice.reducer;
