import re
import sys

def replace_card(m):
    # m.group(1) is borderRadius: ...
    # m.group(2) is padding: ...
    # m.group(3) is child: ...
    # Wait, the order might be different. Let's just grab the whole inner text.
    inner = m.group(1)
    # Find borderRadius
    br_match = re.search(r'borderRadius:\s*([^,]+),', inner)
    br = br_match.group(1) if br_match else None
    # Find padding
    pd_match = re.search(r'padding:\s*([^,]+),', inner)
    pd = pd_match.group(1) if pd_match else None
    
    if br and pd:
        # replace them in inner
        inner = re.sub(r'borderRadius:\s*[^,]+,', '', inner)
        inner = re.sub(r'padding:\s*[^,]+,', '', inner)
        child_match = re.search(r'child:\s*(.*)', inner, re.DOTALL)
        if child_match:
            child = child_match.group(1).strip()
            # If child has a trailing comma, wait... this might be hard with nested parentheses.
            pass
    return m.group(0) # Not reliable enough
