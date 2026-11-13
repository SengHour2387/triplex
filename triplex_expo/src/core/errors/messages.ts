/**
 * User-facing text for the backend's error codes (`triplex_node/api_doc.md` §5).
 * Codes not listed here fall back to a generic message for their HTTP status, so a new
 * backend code never shows raw `domain/snake_case` text to the user.
 */
const MESSAGES: Record<string, string> = {
  // auth
  'auth/missing_token': 'Please sign in to continue.',
  'auth/invalid_token': 'Your session has expired. Please sign in again.',
  'auth/missing_refresh_token': 'Your session has expired. Please sign in again.',
  'auth/invalid_refresh_token': 'Your session has expired. Please sign in again.',
  'auth/token_revoked': 'Your account details changed. Please sign in again.',
  'auth/user_not_found': 'Your session has expired. Please sign in again.',
  'auth/session_expired': 'Your session has expired. Please sign in again.',
  'auth/login_invalid_email_password': 'Incorrect email or password.',
  'auth/register_missing_fields': 'Please fill in every field.',
  'auth/register_empty_fields': 'Please fill in every field.',
  'auth/register_email_username_exists': 'That email or username is already taken.',

  // profile
  'profile/user_not_found': "We couldn't find that account.",
  'profile/no_file_uploaded': 'Choose a photo to upload.',
  'profile/change_username_invalid_format':
    'Usernames are 3–30 characters: letters, numbers and underscores.',
  'profile/change_username_missing_fields': 'Enter a new username.',
  'profile/change_username_username_taken': 'That username is already taken.',
  'profile/change_email_email_taken': 'That email is already in use.',
  'profile/change_email_invalid_format': 'Enter a valid email address.',
  'profile/change_email_invalid_password': 'That password is incorrect.',
  'profile/change_email_missing_fields': 'Enter your new email and your password.',
  'profile/change_email_user_not_found': "We couldn't find your account. Please sign in again.",

  // posts & comments
  'post/not_found': 'That post is no longer available.',
  'post/already_deleted': 'That post was already deleted.',
  'post/content_required': 'Write something before posting.',
  'post/unauthorized': "You can't change someone else's post.",
  'comment/not_found': 'That comment is no longer available.',
  'comment/parent_not_found': 'The comment you replied to is no longer available.',
  'comment/already_deleted': 'That comment was already deleted.',
  'comment/content_required': 'Write something before commenting.',
  'comment/unauthorized': "You can't delete someone else's comment.",

  // social
  'user/not_found': "We couldn't find that user.",
  'user/cannot_follow_self': "You can't follow yourself.",

  // trips & map
  'trip_plan/not_found': "We couldn't find that trip plan.",
  'trip_plan/not_found_or_unauthorized': "We couldn't find that trip plan.",
  'trip_plan/title_required': 'Give your trip a title.',
  'map/details_not_found': "We couldn't find that place.",

  // reactions
  'reaction/invalid_type': "That reaction isn't supported.",
};

export const messageForCode = (code: string): string | undefined => MESSAGES[code];
