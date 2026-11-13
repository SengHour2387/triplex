import { ComposerBar } from '../../../design-system';
import type { CommentsController } from '../hooks/useCommentsController';

/** The comments' composer bar, wired to the controller: writes a comment, or a reply once "Reply" was tapped. */
export function CommentComposer({ controller }: { controller: CommentsController }) {
  const { me, inputRef, draft, setDraft, replyTarget, cancelReply, submit, submitting } = controller;
  const replyingTo = replyTarget?.author?.username ?? null;
  return (
    <ComposerBar
      ref={inputRef}
      testID="comment-input"
      value={draft}
      onChangeText={setDraft}
      onSubmit={() => void submit()}
      submitting={submitting}
      placeholder={replyingTo ? `Reply to @${replyingTo}…` : 'Add a comment…'}
      sendLabel="Send comment"
      avatar={{ uri: me?.avatarUrl ?? null, name: me?.username ?? '' }}
      replyingTo={replyingTo}
      onCancelReply={cancelReply}
    />
  );
}
