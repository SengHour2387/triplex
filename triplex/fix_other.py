import sys

with open('lib/features/profile/presentation/screens/other_profile_screen.dart', 'r') as f:
    text = f.read()

text = text.replace('''        AdaptiveSnackBar.show(
          context,
          message: 'Error toggling follow: ${e.toString()}',
          type: AdaptiveSnackBarType.error,
        );''', '''        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error toggling follow: ${e.toString()}'), backgroundColor: Colors.red),
        );''')

with open('lib/features/profile/presentation/screens/other_profile_screen.dart', 'w') as f:
    f.write(text)
