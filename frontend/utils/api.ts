// Backend URL - You can change this in one place
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090';

// Helper to get token from localStorage safely
const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['x-auth-token'] = token;
    }
  }
  return headers;
};

// Helper to get token for payload body/query
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
};

export const api = {
  // --- Auth ---
  register: async (userData: any) => {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  login: async (credentials: any) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  // --- Profile ---
  getUserAndProfile: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/get_user_and_profile?token=${token}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.json();
  },

  updateUserProfile: async (userData: any) => {
    const res = await fetch(`${API_BASE_URL}/user_update`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...userData, token: getToken() }),
    });
    return res.json();
  },

  updateProfileData: async (profileData: any) => {
    const res = await fetch(`${API_BASE_URL}/update_profile_data`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...profileData, token: getToken() }),
    });
    return res.json();
  },

  uploadProfilePicture: async (formData: FormData) => {
    // Append token to Form Data
    formData.append('token', getToken());
    const res = await fetch(`${API_BASE_URL}/update_profile_picture`, {
      method: 'POST',
      // No Content-Type header needed for FormData; browser sets it automatically
      body: formData,
    });
    return res.json();
  },

  getAllUserProfiles: async () => {
    const res = await fetch(`${API_BASE_URL}/user/get_all_user_profile`, {
      method: 'GET',
    });
    return res.json();
  },

  downloadResume: async (userId: string) => {
    const res = await fetch(`${API_BASE_URL}/user/download_resume?id=${userId}`, {
      method: 'GET',
    });
    return res.json();
  },

  // --- Connections ---
  sendConnectionRequest: async (connectionId: string) => {
    const res = await fetch(`${API_BASE_URL}/user/send_connection_request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ connectionId, token: getToken() }),
    });
    return res.json();
  },

  getSentRequests: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/user/getConnectionRequests?token=${token}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.json();
  },

  getIncomingRequests: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/user/user_connection_request?token=${token}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.json();
  },

  acceptConnectionRequest: async (requestId: string, action_type: 'accept' | 'reject') => {
    const res = await fetch(`${API_BASE_URL}/user/accept_connection_request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ requestId, action_type, token: getToken() }),
    });
    return res.json();
  },

  // --- Posts ---
  getAllPosts: async () => {
    const res = await fetch(`${API_BASE_URL}/posts`, {
      method: 'GET',
    });
    return res.json();
  },

  createPost: async (formData: FormData) => {
    formData.append('token', getToken());
    const res = await fetch(`${API_BASE_URL}/post`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  deletePost: async (postId: string) => {
    const res = await fetch(`${API_BASE_URL}/delete_post`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ post_id: postId, token: getToken() }),
    });
    return res.json();
  },

  likePost: async (postId: string) => {
    const res = await fetch(`${API_BASE_URL}/increment_post_like`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ post_id: postId }),
    });
    return res.json();
  },

  // --- Comments ---
  getComments: async (postId: string) => {
    const res = await fetch(`${API_BASE_URL}/get_comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ post_id: postId }),
    });
    return res.json();
  },

  addComment: async (postId: string, commentBody: string) => {
    const res = await fetch(`${API_BASE_URL}/comment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ post_id: postId, commentBody, token: getToken() }),
    });
    return res.json();
  },

  deleteComment: async (commentId: string) => {
    const res = await fetch(`${API_BASE_URL}/delete_comment`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ comment_id: commentId, token: getToken() }),
    });
    return res.json();
  },
};
