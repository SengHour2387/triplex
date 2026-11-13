import sys

def replace_in_file(path, replacements):
    with open(path, 'r') as f:
        text = f.read()
    for old, new in replacements:
        text = text.replace(old, new)
    with open(path, 'w') as f:
        f.write(text)

replace_in_file('lib/features/create/presentation/widgets/media_card_widget.dart', [
    ('''AdaptiveButton.icon(
                      icon: Icons.fullscreen_rounded,
                      color: Colors.white,
                      style: AdaptiveButtonStyle.plain,
                      onPressed: () {''', '''IconButton(
                      icon: const Icon(Icons.fullscreen_rounded, color: Colors.white),
                      onPressed: () {'''),
    ('''AdaptiveButton.icon(
                      icon: Icons.remove_rounded,
                      color: CupertinoColors.destructiveRed,
                      style: AdaptiveButtonStyle.plain,
                      onPressed: () {''', '''IconButton(
                      icon: const Icon(Icons.remove_rounded, color: CupertinoColors.destructiveRed),
                      onPressed: () {''')
])

replace_in_file('lib/features/map/presentation/screens/google_webview_map.dart', [
    ('''AdaptiveButton.icon(
                onPressed: _centerOnUserLocation,
                icon: Icons.location_on_rounded,
              )''', '''IconButton(
                onPressed: _centerOnUserLocation,
                icon: const Icon(Icons.location_on_rounded),
              )''')
])

replace_in_file('lib/features/map/presentation/screens/location_picker_screen.dart', [
    ('''AdaptiveButton.icon(
                  onPressed: () {''', '''IconButton(
                  icon: const Icon(Icons.location_on_rounded),
                  onPressed: () {''')
])
# Wait, for location_picker_screen.dart, the `icon:` was probably after `onPressed:` or on the next lines. Let me just use regex for it.

