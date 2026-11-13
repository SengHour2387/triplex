import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # 1. Card(borderRadius: ..., padding: ...) -> Card(shape: RoundedRectangleBorder(borderRadius: ...), child: Padding(padding: ..., child: ...))
    # We will use regex to find Card(borderRadius: ..., padding: ..., child: ...)
    # Wait, the child could be anything, it's very hard with regex. 
    # Instead let's just find the exact occurrences.
    
    # 2. CupertinoButton.filled(child: Text(""), borderRadius: ..., label: ..., style: ...)
    # This specifically happens in other_profile_screen.dart
    content = re.sub(
        r'CupertinoButton\.filled\(\s*child:\s*Text\(""\),\s*borderRadius:\s*BorderRadius\.circular\((\d+)\),\s*label:\s*(.*?),\s*style:\s*(.*?),\s*onPressed:\s*(.*?),\s*\)',
        r'ElevatedButton(\n  onPressed: \4,\n  style: ElevatedButton.styleFrom(\n    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(\1)),\n  ),\n  child: Text(\2),\n)',
        content
    )
    
    # 3. AdaptiveBadge
    def repl_badge(m):
        inner = m.group(1)
        count_match = re.search(r'count:\s*([^,]+)', inner)
        count = count_match.group(1) if count_match else '""'
        bg_match = re.search(r'backgroundColor:\s*([^,]+)', inner)
        bg = bg_match.group(1) if bg_match else 'null'
        tc_match = re.search(r'textColor:\s*([^,]+)', inner)
        tc = tc_match.group(1) if tc_match else 'null'
        child_match = re.search(r'child:\s*(.*)', inner, re.DOTALL)
        child = child_match.group(1) if child_match else 'const SizedBox()'
        if child.endswith(','): child = child[:-1]
        
        return f'Badge(\n  label: Text({count}.toString(), style: TextStyle(color: {tc})),\n  backgroundColor: {bg},\n  child: {child},\n)'
    content = re.sub(r'AdaptiveBadge\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_badge, content)
    
    # 4. AdaptiveAlertDialog.show -> showDialog
    def repl_alert(m):
        inner = m.group(1)
        # extract context, title, message, actions
        ctx_match = re.search(r'context:\s*([^,]+)', inner)
        ctx = ctx_match.group(1) if ctx_match else 'context'
        
        title_match = re.search(r'title:\s*(".*?"|\'.*?\')', inner)
        title = title_match.group(1) if title_match else '""'
        
        msg_match = re.search(r'message:\s*(".*?"|\'.*?\')', inner)
        msg = msg_match.group(1) if msg_match else '""'
        
        actions_match = re.search(r'actions:\s*\[(.*?)\]', inner, re.DOTALL)
        actions = actions_match.group(1) if actions_match else ''
        
        return f'showDialog(context: {ctx}, builder: (context) => AlertDialog(title: Text({title}), content: Text({msg}), actions: [{actions}]))'
    content = re.sub(r'AdaptiveAlertDialog\.show\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_alert, content)
    
    # 5. AlertAction -> TextButton
    def repl_alert_action(m):
        inner = m.group(1)
        title_match = re.search(r'title:\s*(".*?"|\'.*?\')', inner)
        title = title_match.group(1) if title_match else '""'
        on_pressed_match = re.search(r'onPressed:\s*([^,]+)', inner)
        on_pressed = on_pressed_match.group(1) if on_pressed_match else '() {}'
        # ignore style
        return f'TextButton(onPressed: {on_pressed}, child: Text({title}))'
    content = re.sub(r'AlertAction\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_alert_action, content)
    
    # 6. AdaptiveSnackBar.show -> ScaffoldMessenger
    def repl_snackbar(m):
        inner = m.group(1)
        # extract context, message
        # context could be first positional argument or named. Let's assume positional context,
        parts = inner.split(',', 1)
        ctx = parts[0].strip()
        rest = parts[1]
        msg_match = re.search(r'message:\s*(.*?)(,|$)', rest)
        msg = msg_match.group(1) if msg_match else '""'
        # look for type
        type_match = re.search(r'type:\s*([^,]+)', rest)
        is_error = type_match and 'error' in type_match.group(1).lower()
        
        color_str = 'backgroundColor: Colors.red,' if is_error else ''
        return f'ScaffoldMessenger.of({ctx}).showSnackBar(SnackBar({color_str} content: Text({msg})))'
    content = re.sub(r'AdaptiveSnackBar\.show\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_snackbar, content)
    
    # 7. AdaptiveContextMenu -> PopupMenuButton
    def repl_context_menu(m):
        inner = m.group(1)
        child_match = re.search(r'child:\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)', inner)
        actions_match = re.search(r'actions:\s*\[([\s\S]*?)\]', inner)
        if child_match and actions_match:
            child = child_match.group(1).strip()
            if child.endswith(','): child = child[:-1]
            actions = actions_match.group(1)
            return f'PopupMenuButton(itemBuilder: (context) => [{actions}], child: {child})'
        return m.group(0)
    content = re.sub(r'AdaptiveContextMenu\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_context_menu, content)
    
    # 8. AdaptiveContextMenuAction -> PopupMenuItem
    def repl_context_action(m):
        inner = m.group(1)
        title_match = re.search(r'title:\s*(".*?"|\'.*?\')', inner)
        title = title_match.group(1) if title_match else '""'
        icon_match = re.search(r'icon:\s*([^,]+)', inner)
        icon = icon_match.group(1) if icon_match else 'null'
        on_pressed_match = re.search(r'onPressed:\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)', inner)
        on_pressed = on_pressed_match.group(1).strip() if on_pressed_match else '() {}'
        if on_pressed.endswith(','): on_pressed = on_pressed[:-1]
        
        return f'PopupMenuItem(onTap: {on_pressed}, child: Row(children: [Icon({icon}), SizedBox(width: 8), Text({title})]))'
    content = re.sub(r'AdaptiveContextMenuAction\(\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*)\)', repl_context_action, content)
    
    # 9. Fix Card(borderRadius: ..., padding: ...) using simple text replace since regex for child is hard.
    content = content.replace(
        "Card(\n          borderRadius: BorderRadius.circular(24),\n          padding: const EdgeInsets.all(16),",
        "Card(\n          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),\n          child: Padding(padding: const EdgeInsets.all(16),"
    )
    # The matching closing brace needs to be fixed. For draft_trip_plan_card, it's right before `} else {` or something, let's fix that manually.
    content = content.replace(
        "Card(\n                          borderRadius: BorderRadius.circular(24),\n                          padding: const EdgeInsets.all(28),",
        "Card(\n                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),\n                          child: Padding(padding: const EdgeInsets.all(28),"
    )
    content = content.replace(
        "Card(\n                borderRadius: BorderRadius.circular(24),\n                padding: const EdgeInsets.all(12),",
        "Card(\n                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),\n                child: Padding(padding: const EdgeInsets.all(12),"
    )

    # user_list_sheet AdaptiveButton.icon
    content = re.sub(
        r'AdaptiveButton\.icon\(\s*icon:\s*Icons\.close_rounded,\s*style:\s*AdaptiveButtonStyle\.plain,\s*onPressed:\s*(.*?),\s*\)',
        r'IconButton(icon: Icon(Icons.close_rounded), onPressed: \1)',
        content
    )
    
    # other_profile_screen.dart:368
    # Oh wait, we already handled CupertinoButton.filled with label in #2.

    # account_center_card.dart line 69
    # icon: CupertinoIcons.chevron_forward, 
    # The parameter icon expects Widget, but gets IconData.
    content = content.replace(
        "icon: CupertinoIcons.chevron_forward,",
        "icon: Icon(CupertinoIcons.chevron_forward),"
    )

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk('lib'):
    for f in files:
        if f.endswith('.dart'):
            process_file(os.path.join(root, f))
