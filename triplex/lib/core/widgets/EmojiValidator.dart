extension StringExtension on String {
bool containsEmoji() {
  final emojiRegex = RegExp(
    r'[\u{1F600}-\u{1F64F}]|' // Emoticons
    r'[\u{1F300}-\u{1F5FF}]|' // Misc symbols & pictographs
    r'[\u{1F680}-\u{1F6FF}]|' // Transport & map
    r'[\u{1F900}-\u{1F9FF}]|' // Supplemental symbols
    r'[\u{2600}-\u{26FF}]|'   // Misc symbols
    r'[\u{2700}-\u{27BF}]|'   // Dingbats
    r'[\u{1F1E6}-\u{1F1FF}]', // Flags
    unicode: true,
  );
  return emojiRegex.hasMatch(this);}}