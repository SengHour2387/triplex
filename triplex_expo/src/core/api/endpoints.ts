export const Endpoints = {
  // Health
  health: 'health',

  // Authentication
  auth: {
    register: 'auth/register',
    login: 'auth/login',
    loginUsername: 'auth/login-username',
    refresh: 'auth/refresh',
  },

  // Profile & Settings
  profile: {
    me: 'profile/me',
    checkUsername: 'profile/check-username',
    profilePicture: 'profile/profile-picture',
    changeUsername: 'profile/change-username',
    changeEmail: 'profile/change-email',
  },

  // Users & Social Relationships
  users: {
    profile: (userId: string) => `users/profile/${userId}`,
    updateProfile: 'users/profile',
    follow: (userId: string) => `users/follow/${userId}`,
    unfollow: (userId: string) => `users/unfollow/${userId}`,
    followers: (userId: string) => `users/${userId}/followers`,
    following: (userId: string) => `users/${userId}/following`,
  },

  // Map & Google Places
  map: {
    autocomplete: 'map/autocomplete',
    details: (placeId: string) => `map/details/${placeId}`,
    detailsById: 'map/details-by-id',
  },

  // Trip Plans
  tripPlans: {
    list: 'trip-plans',
    create: 'trip-plans',
    getById: (id: string) => `trip-plans/${id}`,
    delete: (id: string) => `trip-plans/${id}`,
  },

  // Posts & Feed
  posts: {
    feed: 'posts/feed',
    create: 'posts',
    getById: (postId: string) => `posts/${postId}`,
    byUser: (userId: string) => `posts/user/${userId}`,
    update: (postId: string) => `posts/${postId}`,
    delete: (postId: string) => `posts/${postId}`,
    repost: (postId: string) => `posts/${postId}/repost`,
  },

  // Comments
  comments: {
    list: (postId: string) => `comments/${postId}/comments`,
    create: (postId: string) => `comments/${postId}/comments`,
    replies: (commentId: string) => `comments/${commentId}/replies`,
    react: (commentId: string) => `comments/${commentId}/like`,
    // Soft delete. (The route really is `comments/comment/:id` — `comments/:id` is not a route.)
    delete: (commentId: string) => `comments/comment/${commentId}`,
  },

  // Reactions (api_doc §3.9) — `POST` sets / switches, `DELETE` removes, `GET .../likes` lists.
  likes: {
    react: (postId: string) => `likes/${postId}/like`,
    list: (postId: string) => `likes/${postId}/likes`,
  },
} as const;
