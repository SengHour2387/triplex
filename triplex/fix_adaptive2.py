import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # AdaptiveButton.icon
    def repl_btn_icon(m):
        inner = m.group(1)
        # remove style
        inner = re.sub(r'style:\s*AdaptiveButtonStyle\.[a-zA-Z]+,?\s*', '', inner)
        return f'IconButton({inner})'
    content = re.sub(r'AdaptiveButton\.icon\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_btn_icon, content)

    # AdaptivePopupMenuButton.text<int> -> PopupMenuButton<int>
    content = content.replace("AdaptivePopupMenuButton.text<int>(", "PopupMenuButton<int>(itemBuilder: (context) => [")
    content = content.replace("AdaptivePopupMenuItem(label:", "PopupMenuItem(child: Text(")
    content = content.replace(", value:", "), value:")
    # Wait, the closing of PopupMenuButton might need a '])' but let's just do a hacky replace.
    # Actually, SettingsScreen uses AdaptivePopupMenuButton:
    # trailing: AdaptivePopupMenuButton.text<int>(
    #   onSelected: (val) { ... },
    #   items: const [
    #     AdaptivePopupMenuItem(label: "Light", value: 0), ...
    content = re.sub(
        r'AdaptivePopupMenuButton\.text<int>\([\s\S]*?onSelected:\s*(.*?),\s*items:\s*(const)?\s*\[([\s\S]*?)\]\s*,?\)',
        r'PopupMenuButton<int>(onSelected: \1, itemBuilder: (context) => [\3])',
        content
    )

    # AdaptiveSnackBar
    # AdaptiveSnackBar.show(context: context, title: "x", type: AdaptiveSnackBarType.error) -> ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("x")))
    def repl_snackbar(m):
        inner = m.group(1)
        title_match = re.search(r'title:\s*(".*?"|\'.*?\')', inner)
        title = title_match.group(1) if title_match else '""'
        # look for context
        ctx_match = re.search(r'context:\s*([a-zA-Z0-9_]+)', inner)
        ctx = ctx_match.group(1) if ctx_match else 'context'
        return f'ScaffoldMessenger.of({ctx}).showSnackBar(SnackBar(content: Text({title})))'
    content = re.sub(r'AdaptiveSnackBar\.show\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_snackbar, content)
    
    # AdaptiveAlertDialog
    # AdaptiveAlertDialog.show(context: context, title: "x", content: "y", actions: [AlertAction(...)]) 
    def repl_alert(m):
        inner = m.group(1)
        return f'showDialog(context: context, builder: (context) => AlertDialog({inner}))'
    content = re.sub(r'AdaptiveAlertDialog\.show\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_alert, content)
    
    # AlertAction -> TextButton
    def repl_alert_action(m):
        inner = m.group(1)
        label_match = re.search(r'label:\s*(".*?"|\'.*?\')', inner)
        label = label_match.group(1) if label_match else '""'
        on_pressed_match = re.search(r'onPressed:\s*([^,]+)', inner)
        on_pressed = on_pressed_match.group(1) if on_pressed_match else '() {}'
        return f'TextButton(onPressed: {on_pressed}, child: Text({label}))'
    content = re.sub(r'AlertAction\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_alert_action, content)

    # AdaptiveContextMenu -> PopupMenuButton
    def repl_context_menu(m):
        inner = m.group(1)
        # extract child and actions
        child_match = re.search(r'child:\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)', inner)
        actions_match = re.search(r'actions:\s*\[([\s\S]*?)\]', inner)
        if child_match and actions_match:
            child = child_match.group(1).strip()
            if child.endswith(','): child = child[:-1]
            actions = actions_match.group(1)
            return f'PopupMenuButton(child: {child}, itemBuilder: (context) => [{actions}])'
        return m.group(0)
    content = re.sub(r'AdaptiveContextMenu\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_context_menu, content)
    
    # AdaptiveContextMenuAction -> PopupMenuItem
    def repl_context_action(m):
        inner = m.group(1)
        label_match = re.search(r'label:\s*(".*?"|\'.*?\')', inner)
        label = label_match.group(1) if label_match else '""'
        on_pressed_match = re.search(r'onPressed:\s*([^,]+)', inner)
        on_pressed = on_pressed_match.group(1) if on_pressed_match else '() {}'
        return f'PopupMenuItem(onTap: {on_pressed}, child: Text({label}))'
    content = re.sub(r'AdaptiveContextMenuAction\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_context_action, content)

    # AdaptiveBadge
    def repl_badge(m):
        inner = m.group(1)
        label_match = re.search(r'label:\s*(".*?"|\'.*?\')', inner)
        label = label_match.group(1) if label_match else '""'
        return f'Badge(label: Text({label}))'
    content = re.sub(r'AdaptiveBadge\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_badge, content)

    # Fix remaining AdaptiveButton
    def repl_btn(m):
        inner = m.group(1)
        return f'CupertinoButton.filled({inner})'
    content = re.sub(r'AdaptiveButton\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_btn, content)

    # Clean up AdaptiveButtonStyle and sizes
    content = re.sub(r'style:\s*AdaptiveButtonStyle\.[a-zA-Z]+,?\s*', '', content)
    content = re.sub(r'size:\s*AdaptiveButtonSize\.[a-zA-Z]+,?\s*', '', content)
    
    # AdaptiveIcon
    content = content.replace("AdaptiveIcon(", "Icon(")
    # AdaptiveTextBox
    content = content.replace("AdaptiveTextBox(", "CupertinoTextField(")

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk('lib'):
    for f in files:
        if f.endswith('.dart'):
            process_file(os.path.join(root, f))
