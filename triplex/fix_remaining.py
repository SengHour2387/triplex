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

# 1. create_screen.dart (gap Size -> double, int? -> int for duration)
# `gap(24)` but gap expects double, they might have `gap(AppDimensions.padding.large)` where large is Size? Wait, `gap` is a function taking double. `AppDimensions.padding.large` is probably used. Let's just fix it.
def fix_create_screen(text):
    text = re.sub(r'gap\((AppDimensions.*?\.large)\)', r'gap(24.0)', text)
    text = re.sub(r'gap\((AppDimensions.*?\.medium)\)', r'gap(16.0)', text)
    text = re.sub(r'gap\((AppDimensions.*?\.small)\)', r'gap(8.0)', text)
    text = re.sub(r'gap\((AppDimensions.*?\.extraLarge)\)', r'gap(32.0)', text)
    text = re.sub(r'gap\(Size\(.*?\)\)', r'gap(16.0)', text) # fallback
    
    # maxDays: _tripPlan?.maxDays ?? 0 (int? -> int)
    text = re.sub(r'maxDays: _tripPlan\?\.duration \?\? 0', r'maxDays: _tripPlan?.duration ?? 1', text)
    text = re.sub(r'_duration = _tripPlan\?\.duration;', r'_duration = _tripPlan?.duration ?? 1;', text)
    return text

fix_file('lib/features/create/presentation/screens/create_screen.dart', [(fix_create_screen, None)])

# 2. media_screen.dart & trip_plan_screen.dart: `AdaptiveTextField` with `borderless: true` and `hint: ...`
# Let's replace AdaptiveTextField -> TextField, borderless -> Decoration, hint -> InputDecoration
def fix_textfield(text):
    text = text.replace('borderless: true,', '')
    text = text.replace('borderless: false,', '')
    text = re.sub(r'hint:\s*(\'[^\']*\'|"[^"]*"),', r'decoration: InputDecoration(hintText: \1, border: InputBorder.none),', text)
    return text

fix_file('lib/features/create/presentation/screens/media_screen.dart', [(fix_textfield, None)])
fix_file('lib/features/create/presentation/screens/trip_plan_screen.dart', [(fix_textfield, None)])

# 3. AdaptiveButton.icon -> IconButton
def fix_adaptive_button(text):
    text = re.sub(
        r'AdaptiveButton\.icon\(\s*icon:\s*([^,]+),\s*(style:\s*AdaptiveButtonStyle\.[^,]+,\s*)?onPressed:\s*((?:[^)(]+|\([^)(]*\))*),\s*\)',
        r'IconButton(icon: const Icon(\1), onPressed: \3)',
        text
    )
    # Without trailing comma
    text = re.sub(
        r'AdaptiveButton\.icon\(\s*icon:\s*([^,]+),\s*(style:\s*AdaptiveButtonStyle\.[^,]+,\s*)?onPressed:\s*((?:[^)(]+|\([^)(]*\))*)\)',
        r'IconButton(icon: const Icon(\1), onPressed: \3)',
        text
    )
    return text

files_with_adaptive_button = [
    'lib/features/create/presentation/widgets/media_card_widget.dart',
    'lib/features/map/presentation/screens/google_webview_map.dart',
    'lib/features/map/presentation/screens/location_picker_screen.dart',
    'lib/features/map/presentation/screens/native_location_picker.dart',
    'lib/features/profile/presentation/widgets/user_list_sheet.dart', # if any missed
]
for p in files_with_adaptive_button:
    fix_file(p, [(fix_adaptive_button, None)])

# 4. other_profile_screen.dart AdaptiveSnackBar
def fix_other_profile(text):
    text = text.replace('''        AdaptiveSnackBar.show(
          context,
          message: 'Error toggling follow: ${e.toString()}',
          type: AdaptiveSnackBarType.error,
        );''', '''        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error toggling follow: ${e.toString()}'), backgroundColor: Colors.red),
        );''')
    # Maybe some other spacing?
    text = re.sub(r'AdaptiveSnackBar\.show\(\s*context,\s*message:\s*(.*?),\s*type:\s*AdaptiveSnackBarType\.error,\s*\);',
                  r'ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(\1), backgroundColor: Colors.red));', text)
    return text
fix_file('lib/features/profile/presentation/screens/other_profile_screen.dart', [(fix_other_profile, None)])

# 5. drafts_screen.dart loadDrafts -> refresh
def fix_drafts(text):
    text = text.replace('.loadDrafts()', '.refresh()')
    return text
fix_file('lib/features/profile/presentation/screens/drafts_screen.dart', [(fix_drafts, None)])

print("Done")
