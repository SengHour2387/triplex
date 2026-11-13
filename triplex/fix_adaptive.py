import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    content = content.replace("import 'package:adaptive_platform_ui/adaptive_platform_ui.dart';", "import 'package:flutter/cupertino.dart';")
    
    # AdaptiveButton -> CupertinoButton.filled or regular
    # Need to handle arguments like style, minSize, label, onPressed
    # We will just write a regex that matches AdaptiveButton(...)
    
    def repl_button(m):
        inner = m.group(1)
        # Extract label string
        label_match = re.search(r'label:\s*(".*?"|\'.*?\')', inner)
        label = label_match.group(1) if label_match else '""'
        
        # Remove label, style, minSize, icon
        new_inner = re.sub(r'label:\s*(".*?"|\'.*?\'),?\s*', '', inner)
        new_inner = re.sub(r'style:\s*AdaptiveButtonStyle\.[a-zA-Z]+,?\s*', '', new_inner)
        new_inner = re.sub(r'minSize:\s*Size\([0-9.,\s]+\),?\s*', '', new_inner)
        new_inner = re.sub(r'size:\s*AdaptiveButtonSize\.[a-zA-Z]+,?\s*', '', new_inner)
        new_inner = re.sub(r'icon:\s*Icon\([^)]+\),?\s*', '', new_inner)
        
        return f'CupertinoButton.filled(\n  child: Text({label}),\n  {new_inner})'
        
    content = re.sub(r'AdaptiveButton\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_button, content)

    # AdaptiveSegmentedControl
    def repl_segmented(m):
        inner = m.group(1)
        # Extract labels
        labels_match = re.search(r'labels:\s*const\s*\[(.*?)\]', inner)
        if labels_match:
            labels_str = labels_match.group(1)
            labels = [l.strip() for l in labels_str.split(',') if l.strip()]
            children_map = []
            for i, l in enumerate(labels):
                children_map.append(f"{i}: Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text({l}))")
            children_str = "{" + ", ".join(children_map) + "}"
            new_inner = inner.replace(labels_match.group(0), f'children: {children_str}')
            new_inner = new_inner.replace('selectedIndex:', 'groupValue:')
            return f'CupertinoSlidingSegmentedControl<int>({new_inner})'
        return m.group(0)

    content = re.sub(r'AdaptiveSegmentedControl\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_segmented, content)

    # AdaptiveScaffold
    content = content.replace("AdaptiveScaffold(", "Scaffold(")

    # AdaptiveTextBox
    def repl_textbox(m):
        inner = m.group(1)
        inner = inner.replace('placeholder:', 'placeholder:')
        return f'CupertinoTextField({inner})'
    content = re.sub(r'AdaptiveTextBox\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_textbox, content)

    # AdaptiveTopBlur -> SliverFixedExtentList? Or just Container?
    content = content.replace("AdaptiveTopBlur()", "SliverToBoxAdapter(child: SizedBox(height: 100))")
    
    # AdaptiveAppBar
    content = content.replace("AdaptiveAppBar(", "CupertinoNavigationBar(")
    
    # AdaptiveAppBarAction -> CupertinoButton
    def repl_appbar_action(m):
        inner = m.group(1)
        # Extract icon and onPressed
        icon = re.search(r'icon:\s*(Icon\([^)]+\))', inner)
        on_pressed = re.search(r'onPressed:\s*([^,]+)', inner)
        if icon and on_pressed:
            return f'CupertinoButton(padding: EdgeInsets.zero, onPressed: {on_pressed.group(1)}, child: {icon.group(1)})'
        return m.group(0)
    content = re.sub(r'AdaptiveAppBarAction\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_appbar_action, content)

    # AdaptiveCard
    content = re.sub(r'AdaptiveCard\(', r'Card(', content)

    # AdaptiveListTile -> ListTile
    content = re.sub(r'AdaptiveListTile\(', r'ListTile(', content)
    
    # AdaptiveContextMenu -> PopupMenuButton
    # AdaptiveAlertDialog -> AlertDialog

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk('lib'):
    for f in files:
        if f.endswith('.dart'):
            process_file(os.path.join(root, f))
