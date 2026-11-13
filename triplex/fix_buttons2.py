import sys
import re

def fix(path):
    with open(path, 'r') as f:
        text = f.read()

    # native_location_picker.dart
    text = re.sub(
        r'AdaptiveButton\.icon\(\s*// label: "Use this point",\s*icon: (.*?),\s*style: AdaptiveButtonStyle\.tinted,\s*color: (.*?),\s*onPressed: \(\) {',
        r'IconButton(icon: Icon(\1, color: \2), onPressed: () {', text
    )
    text = re.sub(
        r'AdaptiveButton\.icon\(\s*// label: "Use this place",\s*icon: (.*?),\s*style: AdaptiveButtonStyle\.tinted,\s*color: (.*?),\s*onPressed: \(\) {',
        r'IconButton(icon: Icon(\1, color: \2), onPressed: () {', text
    )
    text = re.sub(
        r'AdaptiveButton\.icon\(\s*onPressed: _centerOnUserLocation,\s*icon: (.*?),\s*\)',
        r'IconButton(onPressed: _centerOnUserLocation, icon: Icon(\1))', text
    )

    with open(path, 'w') as f:
        f.write(text)

fix('lib/features/map/presentation/screens/native_location_picker.dart')

def fix_loc(path):
    with open(path, 'r') as f:
        text = f.read()
    text = text.replace('icon: Icons.location_on_rounded,', '')
    with open(path, 'w') as f:
        f.write(text)

fix_loc('lib/features/map/presentation/screens/location_picker_screen.dart')

