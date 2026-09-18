import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface JobState {
  jobs: any[];
}

const initialState: JobState = {
  jobs: [],
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<any[]>) => {
      state.jobs = action.payload;
    },
  },
});

export const { setJobs } = jobSlice.actions;
export default jobSlice.reducer;
