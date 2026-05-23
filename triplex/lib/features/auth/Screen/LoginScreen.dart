import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/core/widgets/OutLineTextField.dart';
import 'package:triplex/features/auth/Domain/AuthNotifier.dart';
import 'package:triplex/features/auth/Screen/RegisterScreen.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(authNotifierProvider, (previous, next) {
      if (next.hasValue &&
          next.value != null &&
          Navigator.of(context).canPop()) {
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    });

    final authState = ref.watch(authNotifierProvider);

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Spacer(flex: 2),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "TripleX",
                  style: TextStyle(
                    fontFamily: "logo_font",
                    fontSize: 46,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 10,
                  ),
                ),
                Text(
                  "by T3MPLEX",
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
                ),
              ],
            ),
            const Spacer(),
            const Text("Login to your account", style: TextStyle(fontSize: 18)),
            const SizedBox(height: 20),
            OutlineTextField(
              controller: _emailController,
              label: const Text("Username or Email"),
              textInputType: TextInputType.text,
            ),
            OutlineTextField(
              controller: _passwordController,
              label: const Text("Password"),
              textInputType: TextInputType.visiblePassword,
              hide: true,
            ),
            if (authState.hasError)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Text(
                  authState.error.toString().replaceFirst('Exception: ', ''),
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text("New here?"),
                TextButton(
                  onPressed: authState.isLoading
                      ? null
                      : () {
                          if (Navigator.of(context).canPop()) {
                            Navigator.of(context).pop();
                            return;
                          }

                          Navigator.push(
                            context,
                            CupertinoPageRoute(
                              builder: (context) => const RegisterScreen(),
                            ),
                          );
                        },
                  child: const Text("Create a new account"),
                ),
              ],
            ),
            const Spacer(),
            ElevatedButton(
              style: ButtonStyle(
                backgroundColor: WidgetStateProperty.all(
                  Theme.of(context).colorScheme.onSurface,
                ),
                foregroundColor: WidgetStateProperty.all(
                  Theme.of(context).colorScheme.surface,
                ),
              ),
              onPressed: authState.isLoading
                  ? null
                  : () {
                      ref
                          .read(authNotifierProvider.notifier)
                          .login(
                            _emailController.text.trim(),
                            _passwordController.text,
                          );
                    },
              child: authState.isLoading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text("Login"),
            ),
            const Spacer(flex: 2),
          ],
        ),
      ),
    );
  }
}
