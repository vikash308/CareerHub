import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConnectionState {
  sentRequests: any[];
  incomingRequests: any[];
}

const initialState: ConnectionState = {
  sentRequests: [],
  incomingRequests: [],
};

const connectionSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    setSentRequests: (state, action: PayloadAction<any[]>) => {
      state.sentRequests = action.payload;
    },
    setIncomingRequests: (state, action: PayloadAction<any[]>) => {
      state.incomingRequests = action.payload;
    },
    removeIncomingRequest: (state, action: PayloadAction<string>) => {
      state.incomingRequests = state.incomingRequests.filter((req) => req._id !== action.payload);
    },
  },
});

export const { setSentRequests, setIncomingRequests, removeIncomingRequest } = connectionSlice.actions;
export default connectionSlice.reducer;
