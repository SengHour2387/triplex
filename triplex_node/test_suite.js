import pool from './db.js';
import app from './app.js';

const PORT = 3099;
let server;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✅ ${message}`);
}

async function request(endpoint, options = {}) {
  const url = `http://127.0.0.1:${PORT}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = { raw: text };
  }
  return { status: res.status, data: json };
}

async function runTests() {
  console.log('\n🚀 Starting Test Suite for Reactions, Comments, and Replies...\n');

  // Start temporary test server
  await new Promise((resolve) => {
    server = app.listen(PORT, '127.0.0.1', () => {
      console.log(`Test server running on port ${PORT}`);
      resolve();
    });
  });

  try {
    // 0. Cleanup any old test users
    await pool.query("DELETE FROM users WHERE email IN ('test_user_a@test.com', 'test_user_b@test.com')");

    // 1. Register User A
    console.log('\n--- 1. Register User A & B ---');
    const regA = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: 'test_usera_' + Date.now().toString().slice(-4),
        email: 'test_user_a@test.com',
        password: 'Password123!'
      })
    });
    assert(regA.status === 201, `User A registered (status: ${regA.status})`);
    const tokenA = regA.data.accessToken;
    const userA = regA.data.user;

    // Register User B
    const regB = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: 'test_userb_' + Date.now().toString().slice(-4),
        email: 'test_user_b@test.com',
        password: 'Password123!'
      })
    });
    assert(regB.status === 201, `User B registered (status: ${regB.status})`);
    const tokenB = regB.data.accessToken;
    const userB = regB.data.user;

    // 2. User A creates a post
    console.log('\n--- 2. Create Post ---');
    const postRes = await request('/api/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        type: 'media',
        caption: 'Hello testing scalable reactions and comments!'
      })
    });
    assert(postRes.status === 201, `Post created by User A (status: ${postRes.status})`);
    const postId = postRes.data.data.id;

    // 3. Reactions on Post
    console.log('\n--- 3. Post Reactions ---');
    // User A reacts with default 'like'
    const reactA = await request(`/api/likes/${postId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ type: 'like' })
    });
    assert(reactA.status === 200, `User A reacted with 'like' (status: ${reactA.status})`);
    assert(reactA.data.my_reactions.includes('like'), 'User A my_reactions includes like');
    assert(reactA.data.my_reaction === 'like', 'User A my_reaction is like');
    assert(reactA.data.is_liked === true, 'User A is_liked is true');

    // Fetch feed as User A -> verify is_liked and my_reaction are preserved on refresh
    const feedA = await request('/api/posts/feed', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(feedA.status === 200, 'Fetched feed as User A');
    const feedPostA = feedA.data.data.find(p => p.id === postId);
    assert(feedPostA.is_liked === true, 'Feed post is_liked is true for User A');
    assert(feedPostA.my_reaction === 'like', 'Feed post my_reaction is like for User A');

    // User A switches reaction from 'like' to 'love' (reaction switching in-place, count remains 1)
    const switchA = await request(`/api/likes/${postId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ type: 'love' })
    });
    assert(switchA.status === 200, 'User A switched reaction to love');
    assert(switchA.data.my_reaction === 'love', 'User A my_reaction updated to love');
    assert(switchA.data.likes_count === 1, `Post likes_count is still 1 after switching reaction (found: ${switchA.data.likes_count})`);

    // Fetch feed again to verify switch is reflected in refreshed feed
    const feedAAfterSwitch = await request('/api/posts/feed', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const feedPostAfterSwitch = feedAAfterSwitch.data.data.find(p => p.id === postId);
    assert(feedPostAfterSwitch.is_liked === true, 'Feed post is_liked remains true');
    assert(feedPostAfterSwitch.my_reaction === 'love', 'Feed post my_reaction updated to love on refresh');

    // User B reacts with 'haha'
    const reactB = await request(`/api/likes/${postId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ type: 'haha' })
    });
    assert(reactB.status === 200, 'User B reacted with haha');
    assert(reactB.data.reactions.length === 2, 'Two reaction types exist now (love, haha)');

    // Fetch all reactions for post
    const getReactions = await request(`/api/likes/${postId}/likes`);
    assert(getReactions.status === 200, 'Fetched post reactions');
    assert(getReactions.data.reactions.length === 2, `Grouped reactions count is 2 (found: ${getReactions.data.reactions.length})`);
    assert(getReactions.data.total === 2, `Total reactions user list count is 2`);

    // Check post counter sync via trigger
    const postDetails = await request(`/api/posts/${postId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(postDetails.data.data.likes_count === 2, `Post likes_count is 2 via DB trigger (found: ${postDetails.data.data.likes_count})`);
    assert(postDetails.data.data.is_liked === true, `Post is_liked is true for User A`);
    assert(postDetails.data.data.my_reaction === 'love', `Post my_reaction is love for User A`);

    // User B removes 'haha' reaction
    const unreactB = await request(`/api/likes/${postId}/like`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ type: 'haha' })
    });
    assert(unreactB.status === 200, 'User B removed haha reaction');
    assert(unreactB.data.is_liked === false, 'User B is_liked is false after remove');
    assert(unreactB.data.my_reaction === null, 'User B my_reaction is null after remove');

    const postDetailsAfterRemove = await request(`/api/posts/${postId}`);
    assert(postDetailsAfterRemove.data.data.likes_count === 1, `Post likes_count decremented to 1 via trigger (found: ${postDetailsAfterRemove.data.data.likes_count})`);

    // User A removes reaction
    const unreactA = await request(`/api/likes/${postId}/like`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(unreactA.status === 200, 'User A removed reaction');
    const postDetailsUnreactAll = await request(`/api/posts/${postId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(postDetailsUnreactAll.data.data.likes_count === 0, 'Post likes_count decremented to 0');
    assert(postDetailsUnreactAll.data.data.is_liked === false, 'User A sees is_liked: false');
    assert(postDetailsUnreactAll.data.data.my_reaction === null, 'User A sees my_reaction: null');

    // 4. Comments & Replies
    console.log('\n--- 4. Comments & Replies ---');
    // User B adds top-level comment
    const commentRes = await request(`/api/comments/${postId}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({
        content: 'This is a top-level comment from User B!'
      })
    });
    assert(commentRes.status === 201, `Top-level comment created (status: ${commentRes.status})`);
    const commentId = commentRes.data.data.id;
    assert(commentRes.data.data.parent_comment_id === null, 'Comment parent_comment_id is null');

    // Verify post comments_count trigger
    const postAfterComment = await request(`/api/posts/${postId}`);
    assert(postAfterComment.data.data.comments_count === 1, `Post comments_count incremented to 1 (found: ${postAfterComment.data.data.comments_count})`);

    // User A replies to User B's comment
    const replyRes = await request(`/api/comments/${commentId}/replies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        content: 'Thanks User B, here is a reply from User A!'
      })
    });
    assert(replyRes.status === 201, `Reply created (status: ${replyRes.status})`);
    const replyId = replyRes.data.data.id;
    assert(replyRes.data.data.parent_comment_id === commentId, 'Reply parent_comment_id matches parent comment');

    // Verify parent comment's replies_count trigger
    const commentsList = await request(`/api/comments/${postId}/comments`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(commentsList.status === 200, 'Fetched top-level comments');
    assert(commentsList.data.data.length === 1, `Only top-level comment in list (found length: ${commentsList.data.data.length})`);
    assert(commentsList.data.data[0].replies_count === 1, `Parent comment replies_count is 1 (found: ${commentsList.data.data[0].replies_count})`);

    // Post comments_count should still be 1 (replies don't count towards top-level post comment count)
    const postAfterReply = await request(`/api/posts/${postId}`);
    assert(postAfterReply.data.data.comments_count === 1, `Post comments_count remains 1`);

    // Lazy load replies
    const repliesList = await request(`/api/comments/${commentId}/replies`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(repliesList.status === 200, 'Fetched replies for comment');
    assert(repliesList.data.data.length === 1, 'Replies count is 1');
    assert(repliesList.data.data[0].content === 'Thanks User B, here is a reply from User A!', 'Reply content matches');

    // 5. Comment Reactions
    console.log('\n--- 5. Comment Reactions ---');
    // User B reacts to User A's reply with 'love'
    const reactReply = await request(`/api/comments/${replyId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ type: 'love' })
    });
    assert(reactReply.status === 200, `User B reacted to User A's reply with love`);
    assert(reactReply.data.my_reaction === 'love', 'User B sees my_reaction: love');

    // Verify reply likes_count via trigger & is_reacted when User B fetches replies
    const repliesAuthedB = await request(`/api/comments/${commentId}/replies`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(repliesAuthedB.data.data[0].likes_count === 1, `Reply likes_count is 1 via DB trigger`);
    assert(repliesAuthedB.data.data[0].is_reacted === true, `User B sees is_reacted: true on reply`);
    assert(repliesAuthedB.data.data[0].my_reaction === 'love', `User B sees my_reaction: 'love' on reply`);

    // User B switches comment reaction to 'haha'
    const switchReplyReaction = await request(`/api/comments/${replyId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ type: 'haha' })
    });
    assert(switchReplyReaction.status === 200, `User B switched reply reaction to haha`);
    assert(switchReplyReaction.data.my_reaction === 'haha', 'User B sees my_reaction: haha');

    // User B removes reaction
    const unreactReply = await request(`/api/comments/${replyId}/like`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(unreactReply.status === 200, 'User B removed reaction from reply');

    const repliesAfterUnreact = await request(`/api/comments/${commentId}/replies`);
    assert(repliesAfterUnreact.data.data[0].likes_count === 0, `Reply likes_count decremented to 0`);

    // 6. Soft Deletion of Comment
    console.log('\n--- 6. Soft Delete Comment ---');
    const delComment = await request(`/api/comments/comment/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(delComment.status === 200, 'User B soft-deleted their comment');

    // Verify soft-deleted comment structure in comments list
    const commentsAfterDel = await request(`/api/comments/${postId}/comments`);
    assert(commentsAfterDel.data.data.length === 1, 'Comment row still exists');
    assert(commentsAfterDel.data.data[0].is_deleted === true, 'is_deleted is true');
    assert(commentsAfterDel.data.data[0].content === null, 'content is null/masked for deleted comment');
    assert(commentsAfterDel.data.data[0].user === null, 'user is null/masked for deleted comment');

    // Verify replies are NOT orphaned and still accessible
    const repliesAfterParentDel = await request(`/api/comments/${commentId}/replies`);
    assert(repliesAfterParentDel.data.data.length === 1, 'Reply is still intact under deleted parent');
    assert(repliesAfterParentDel.data.data[0].content === 'Thanks User B, here is a reply from User A!', 'Reply content preserved');

    // 7. Visit Other Profile, Follow / Unfollow, and User Posts
    console.log('\n--- 7. Visit Other Profile & Follow Flow ---');
    // User B visits User A's profile by ID
    const visitProfileById = await request(`/api/users/profile/${userA.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(visitProfileById.status === 200, 'User B fetched User A profile by ID');
    assert(visitProfileById.data.user.username === userA.username, 'Profile username matches');
    assert(visitProfileById.data.user.is_following === false, 'User B is not following User A yet');
    assert(visitProfileById.data.user.is_self === false, 'User A is not self for User B');
    assert(visitProfileById.data.user.postsCount >= 1, 'Profile has postsCount');

    // User B visits User A's profile by Username
    const visitProfileByUsername = await request(`/api/users/profile/${userA.username}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(visitProfileByUsername.status === 200, 'User B fetched User A profile by username');
    assert(visitProfileByUsername.data.user.id === userA.id, 'Resolved correct user ID from username');

    // User B follows User A
    const followRes = await request(`/api/users/follow/${userA.username}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(followRes.status === 200, 'User B followed User A');
    assert(followRes.data.is_following === true, 'Follow response has is_following: true');
    assert(followRes.data.followersCount === 1, 'Followers count is 1');

    // User B checks User A's profile again -> is_following must be true
    const visitProfileAfterFollow = await request(`/api/users/profile/${userA.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(visitProfileAfterFollow.data.user.is_following === true, 'is_following is now true');
    assert(visitProfileAfterFollow.data.user.followersCount === 1, 'followersCount is 1');

    // Check User A followers list
    const followersList = await request(`/api/users/${userA.id}/followers`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(followersList.status === 200, 'Fetched followers list');
    assert(followersList.data.followers.length === 1, 'Followers list has 1 item');
    assert(followersList.data.followers[0].username === userB.username, 'Follower is User B');

    // Check User B following list
    const followingList = await request(`/api/users/${userB.id}/following`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(followingList.status === 200, 'Fetched following list');
    assert(followingList.data.following.length === 1, 'Following list has 1 item');
    assert(followingList.data.following[0].username === userA.username, 'Following User A');

    // Fetch User A's posts by username
    const userAPosts = await request(`/api/posts/user/${userA.username}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(userAPosts.status === 200, 'Fetched User A posts by username');
    assert(userAPosts.data.data.length >= 1, 'User A posts list contains posts');

    // User B unfollows User A
    const unfollowRes = await request(`/api/users/unfollow/${userA.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(unfollowRes.status === 200, 'User B unfollowed User A');
    assert(unfollowRes.data.is_following === false, 'is_following is now false');
    assert(unfollowRes.data.followersCount === 0, 'followersCount is back to 0');

    // 8. Delete Post (Soft delete)
    console.log('\n--- 8. Soft Delete Post ---');
    const delPost = await request(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(delPost.status === 200, 'User A soft-deleted their post');

    const getDelPost = await request(`/api/posts/${postId}`);
    assert(getDelPost.status === 404, 'Post no longer returned in GET /posts/:postId');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉\n');
  } finally {
    // Cleanup
    try {
      await pool.query("DELETE FROM users WHERE email IN ('test_user_a@test.com', 'test_user_b@test.com')");
    } catch (e) {}
    if (server) {
      server.close();
    }
    await pool.end();
  }
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
