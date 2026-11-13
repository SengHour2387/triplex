import sys
import re

def fix_file(path, rules):
    with open(path, 'r') as f:
        text = f.read()
    orig = text
    for old, new in rules:
        if callable(old):
            text = old(text)
        else:
            text = text.replace(old, new)
    if text != orig:
        with open(path, 'w') as f:
            f.write(text)

# create_screen.dart
def fix_create(text):
    # gap(AppDimensions.padding.xxx) or similar.
    # Actually, we can just replace `gap(AppDimensions.padding.something)` with `gap(16)`
    text = re.sub(r'gap\([^)]+\)', 'gap(16)', text)
    # The error says "argument type 'Size' can't be assigned to 'double?'"
    # Actually, if gap is a function, maybe they have `Gap(AppDimensions...)`? No, it's `gap(AppDimensions...)`. Let's just fix it properly.
    text = re.sub(r'maxDays: _tripPlan\?\.duration \?\? 0', r'maxDays: _tripPlan?.duration ?? 1', text)
    text = re.sub(r'_duration = _tripPlan\?\.duration;', r'_duration = _tripPlan?.duration ?? 1;', text)
    return text

fix_file('lib/features/create/presentation/screens/create_screen.dart', [(fix_create, None)])

# media_screen.dart
def fix_media(text):
    text = re.sub(r'decoration:\s*InputDecoration\(hintText:\s*(.*?),\s*border:\s*InputBorder\.none\),', r'placeholder: \1, decoration: BoxDecoration(border: Border.all(color: Colors.transparent)),', text)
    return text
fix_file('lib/features/create/presentation/screens/media_screen.dart', [(fix_media, None)])

# trip_plan_screen.dart
def fix_trip(text):
    text = re.sub(r'decoration:\s*InputDecoration\(hintText:\s*(.*?),\s*border:\s*InputBorder\.none\),', r'placeholder: \1, decoration: BoxDecoration(border: Border.all(color: Colors.transparent)),', text)
    text = text.replace('decoration: InputDecoration(border: InputBorder.none),', 'decoration: BoxDecoration(border: Border.all(color: Colors.transparent)),')
    return text
fix_file('lib/features/create/presentation/screens/trip_plan_screen.dart', [(fix_trip, None)])

# AdaptiveButton
def fix_btn(text):
    text = re.sub(r'AdaptiveButton\.icon\(\s*icon:\s*([^,]+),\s*style:\s*AdaptiveButtonStyle\.[^,]+,\s*onPressed:\s*([^,]+),?\s*\)', r'IconButton(icon: Icon(\1), onPressed: \2)', text)
    text = re.sub(r'AdaptiveButton\.icon\(\s*icon:\s*([^,]+),\s*onPressed:\s*([^,]+),?\s*\)', r'IconButton(icon: Icon(\1), onPressed: \2)', text)
    return text

for p in [
    'lib/features/create/presentation/widgets/media_card_widget.dart',
    'lib/features/map/presentation/screens/google_webview_map.dart',
    'lib/features/map/presentation/screens/location_picker_screen.dart',
    'lib/features/map/presentation/screens/native_location_picker.dart',
]:
    fix_file(p, [(fix_btn, None)])

