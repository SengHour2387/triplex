import sys

with open('lib/features/create/presentation/screens/create_screen.dart', 'r') as f:
    text = f.read()

text = text.replace('minSize: const Size(80, 36),', '')
text = text.replace('index,', 'index ?? 0,')
text = text.replace('_segmentIndex = index;', '_segmentIndex = index ?? 0;')

with open('lib/features/create/presentation/screens/create_screen.dart', 'w') as f:
    f.write(text)

