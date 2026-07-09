import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/core/widgets/OutLineTextField.dart';
import 'package:triplex/features/auth/Domain/AuthNotifier.dart';
import 'package:triplex/features/auth/Screen/LoginScreen.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

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
            const Text(
              "Register a new account",
              style: TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 20),
            OutlineTextField(
              controller: _usernameController,
              label: const Text("Username"),
              textInputType: TextInputType.text,
            ),
            OutlineTextField(
              controller: _emailController,
              label: const Text("Email"),
              textInputType: TextInputType.emailAddress,
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
                const Text("Already have an account?"),
                TextButton(
                  onPressed: authState.isLoading
                      ? null
                      : () {
                          Navigator.push(
                            context,
                            CupertinoPageRoute(
                              builder: (context) => const LoginScreen(),
                            ),
                          );
                        },
                  child: const Text("Login"),
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
                          .read(authProvider.notifier)
                          .register(
                            _emailController.text.trim(),
                            _usernameController.text.trim(),
                            _passwordController.text,
                          );
                    },
              child: authState.isLoading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text("Create"),
            ),
            const Spacer(flex: 2),
          ],
        ),
      ),
    );
  }
}
