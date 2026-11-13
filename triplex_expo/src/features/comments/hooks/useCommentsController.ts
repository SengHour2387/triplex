import { useCallback, useMemo, useRef, useState } from 'react';
import type { TextInput } from 'react-native';

import { useAuthStore } from '../../auth/store/authStore';
import { threadRoot, type Comment } from '../model/comment';
import { useAddComment } from './useCommentMutations';

/**
 * Everything the comments UI keeps while it is open — shared by the sheet and the post screen: the draft,
 * who it replies to, which threads are expanded. The *data* is in the query cache; this is only the user's
 * intent. Writing clears the box at once (the comment appears optimistically); if the server refuses, the
 * text comes back so nothing the user wrote is lost.
 */
export function useCommentsController(postId: string) {
  const user = useAuthStore((s) => s.user);
  const addComment = useAddComment();
  const [draft, setDraft] = useState('');
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const me = useMemo(
    () => (user ? { id: user.id, username: user.username, name: user.name?.trim() || null, avatarUrl: user.avatar_url?.trim() || null } : null),
    [user],
  );

  const toggleThread = useCallback((commentId: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(commentId)) next.add(commentId);
      return next;
    });
  }, []);

  /** Reply to a comment — or to a reply, which attaches to its top-level comment. Opens that thread so the reply shows up. */
  const startReply = useCallback((comment: Comment) => {
    setReplyTarget(comment);
    setExpanded((current) => new Set(current).add(threadRoot(comment)));
    inputRef.current?.focus();
  }, []);
  const cancelReply = useCallback(() => setReplyTarget(null), []);

  const submit = useCallback(async () => {
    const content = draft.trim();
    if (!content || !me || submitting) return;
    const target = replyTarget;
    setDraft('');
    setReplyTarget(null);
    setSubmitting(true);
    const saved = await addComment({ postId, replyTo: target, content, author: me });
    setSubmitting(false);
    if (!saved) {
      // Put back what the user wrote (unless they already started something new).
      setDraft((current) => (current === '' ? content : current));
      setReplyTarget((current) => current ?? target);
    }
  }, [draft, me, submitting, replyTarget, addComment, postId]);

  return { me, inputRef, draft, setDraft, replyTarget, startReply, cancelReply, expanded, toggleThread, submit, submitting };
}

export type CommentsController = ReturnType<typeof useCommentsController>;
