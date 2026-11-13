import sys

with open('lib/features/create/presentation/screens/trip_plan_screen.dart', 'r') as f:
    text = f.read()

text = text.replace('hintText: "Title",', 'hint: "Title", borderless: true,')

with open('lib/features/create/presentation/screens/trip_plan_screen.dart', 'w') as f:
    f.write(text)

