import 'dart:async';
import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/core/toast/toast_provider.dart';
import 'package:triplex/core/widgets/emoji_validator.dart';
import 'package:triplex/core/widgets/liquid_glass_shim.dart';
import 'package:triplex/core/widgets/text_h.dart';
import 'package:triplex/features/account_center/domain/change_email_notifier.dart';
import 'package:triplex/features/account_center/domain/change_username_notifier.dart';
import 'package:triplex/features/profile/domain/profile_notifier.dart';

enum _UsernameStatus { idle, checking, available, taken, invalid }

class AccountCenterScreen extends ConsumerStatefulWidget {
  const AccountCenterScreen({super.key});

  @override
  ConsumerState<AccountCenterScreen> createState() =>
      _AccountCenterScreenState();
}

class _AccountCenterScreenState extends ConsumerState<AccountCenterScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  Timer? _debounceTimer;
  _UsernameStatus _usernameStatus = _UsernameStatus.idle;
  bool _isSaving = false;

  String? _initialUsername;
  String? _initialEmail;

  static final RegExp _usernameRegex = RegExp(r'^[a-zA-Z0-9_]{3,30}$');
  static final RegExp _emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

  @override
  void initState() {
    super.initState();

    final currentUser = ref.read(profileProvider).value;
    _initialUsername = currentUser?.username ?? "";
    _initialEmail = currentUser?.email ?? "";

    _usernameController.text = _initialUsername!;
    _emailController.text = _initialEmail!;

    _usernameController.addListener(_onUsernameChanged);
    _emailController.addListener(_onFormFieldChanged);
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _usernameController.removeListener(_onUsernameChanged);
    _emailController.removeListener(_onFormFieldChanged);
    _usernameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _onFormFieldChanged() {
    if (mounted) setState(() {});
  }

  void _onUsernameChanged() {
    _debounceTimer?.cancel();
    final text = _usernameController.text.trim();

    if (text.isEmpty || text == _initialUsername) {
      if (mounted) {
        setState(() {
          _usernameStatus = _UsernameStatus.idle;
        });
      }
      return;
    }

    if (text.containsEmoji() || !_usernameRegex.hasMatch(text)) {
      if (mounted) {
        setState(() {
          _usernameStatus = _UsernameStatus.invalid;
        });
      }
      return;
    }

    if (mounted) {
      setState(() {
        _usernameStatus = _UsernameStatus.checking;
      });
    }

    _debounceTimer = Timer(const Duration(milliseconds: 400), () async {
      try {
        final available = await ref
            .read(changeUsernameProvider.notifier)
            .isUsernameAvailable(text);
        if (mounted && _usernameController.text.trim() == text) {
          setState(() {
            _usernameStatus =
                available ? _UsernameStatus.available : _UsernameStatus.taken;
          });
        }
      } catch (_) {
        if (mounted && _usernameController.text.trim() == text) {
          setState(() {
            _usernameStatus = _UsernameStatus.taken;
          });
        }
      }
    });
  }

  bool get _hasChanges {
    final currentUsername = _usernameController.text.trim();
    final currentEmail = _emailController.text.trim().toLowerCase();
    final originalUsername = (_initialUsername ?? "").trim();
    final originalEmail = (_initialEmail ?? "").trim().toLowerCase();

    return currentUsername != originalUsername || currentEmail != originalEmail;
  }

  bool get _canSave {
    if (!_hasChanges || _isSaving) return false;
    if (_usernameStatus == _UsernameStatus.checking ||
        _usernameStatus == _UsernameStatus.taken ||
        _usernameStatus == _UsernameStatus.invalid) {
      return false;
    }
    return true;
  }

  String? _usernameValidator(String? value) {
    if (value == null || value.trim().isEmpty) {
      return "Username cannot be empty";
    }
    final trimmed = value.trim();
    if (trimmed.containsEmoji()) {
      return "Emoji is not allowed";
    }
    if (!_usernameRegex.hasMatch(trimmed)) {
      return "3-30 characters (letters, numbers, underscores)";
    }
    if (_usernameStatus == _UsernameStatus.taken) {
      return "Username is already taken";
    }
    return null;
  }

  String? _emailValidator(String? value) {
    if (value == null || value.trim().isEmpty) {
      return "Email cannot be empty";
    }
    final trimmed = value.trim();
    if (trimmed.containsEmoji()) {
      return "Emoji is not allowed";
    }
    if (!_emailRegex.hasMatch(trimmed)) {
      return "Please enter a valid email address";
    }
    return null;
  }

  Future<void> _saveForm() async {
    FocusScope.of(context).unfocus();

    if (!(_formKey.currentState?.validate() ?? false)) return;

    final newUsername = _usernameController.text.trim();
    final newEmail = _emailController.text.trim().toLowerCase();
    final usernameChanged = newUsername != _initialUsername;
    final emailChanged = newEmail != (_initialEmail ?? "").toLowerCase();

    if (!usernameChanged && !emailChanged) {
      ref.read(toastProvider.notifier).showSuccess("No changes to save");
      return;
    }

    if (emailChanged) {
      final success = await showModalBottomSheet<bool>(
        useRootNavigator: true,
        useSafeArea: true,
        isScrollControlled: true,
        context: context,
        backgroundColor: Colors.transparent,
        barrierColor: Platform.isIOS ? Colors.transparent : Colors.black45,
        builder: (sheetContext) => _PasswordConfirmationSheet(
          newEmail: newEmail,
          onConfirm: (password) async {
            // First change username if needed
            if (usernameChanged) {
              await ref
                  .read(changeUsernameProvider.notifier)
                  .changeUsername(newUsername);
              _initialUsername = newUsername;
            }
            // Then change email
            await ref
                .read(changeEmailProvider.notifier)
                .changeEmail(newEmail, password);
            _initialEmail = newEmail;
          },
        ),
      );

      if (success == true && mounted) {
        ref
            .read(toastProvider.notifier)
            .showSuccess("Account updated successfully");
        setState(() {
          _usernameStatus = _UsernameStatus.idle;
        });
      }
      return;
    }

    // Only username changed
    setState(() => _isSaving = true);
    try {
      await ref
          .read(changeUsernameProvider.notifier)
          .changeUsername(newUsername);
      _initialUsername = newUsername;
      if (mounted) {
        setState(() {
          _isSaving = false;
          _usernameStatus = _UsernameStatus.idle;
        });
        ref
            .read(toastProvider.notifier)
            .showSuccess("Username updated successfully");
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        final message = e.toString().replaceFirst("Exception: ", "");
        ref.read(toastProvider.notifier).showError(message);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AsyncValue<void>>(changeUsernameProvider, (_, next) {
      next.whenOrNull(
        error: (err, _) {
          final message = err.toString().replaceFirst("Exception: ", "");
          ref.read(toastProvider.notifier).showError(message);
        },
      );
    });

    ref.listen<AsyncValue<void>>(changeEmailProvider, (_, next) {
      next.whenOrNull(
        error: (err, _) {
          final message = err.toString().replaceFirst("Exception: ", "");
          ref.read(toastProvider.notifier).showError(message);
        },
      );
    });

    final Size screenSize = MediaQuery.of(context).size;

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      behavior: HitTestBehavior.translucent,
      child: Container(
        color: Theme.of(context).colorScheme.surface,
        height: screenSize.height,
        width: screenSize.width,
        padding: const EdgeInsets.symmetric(horizontal: 15),
        child: Stack(
          children: [
            Form(
              key: _formKey,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  const Hero(
                    tag: "account_center_title",
                    child: Material(
                      type: MaterialType.transparency,
                      child: TextH1(
                        "Account Center",
                        padding:
                            EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                        maxLines: 1,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      color: Theme.of(context).colorScheme.surfaceBright,
                      boxShadow: [
                        BoxShadow(
                          offset: const Offset(0, 8),
                          blurRadius: 16,
                          color:
                              Theme.of(context).colorScheme.shadow.withAlpha(8),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CupertinoTextFormFieldRow(
                          validator: _usernameValidator,
                          autovalidateMode: AutovalidateMode.onUserInteraction,
                          prefix: const TextH6(
                            "Username:",
                            padding: EdgeInsets.only(left: 10),
                            fontWeight: FontWeight.w600,
                          ),
                          controller: _usernameController,
                          keyboardType: TextInputType.text,
                          textInputAction: TextInputAction.next,
                          decoration: const BoxDecoration(),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 8),
                          placeholder: "Enter username",
                        ),
                        if (_usernameStatus == _UsernameStatus.available)
                          const Padding(
                            padding:
                                EdgeInsets.only(left: 18, bottom: 6, right: 18),
                            child: Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                "Username is available",
                                style: TextStyle(
                                  fontSize: 12,
                                  color: CupertinoColors.systemGreen,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          )
                        else if (_usernameStatus == _UsernameStatus.taken)
                          const Padding(
                            padding:
                                EdgeInsets.only(left: 18, bottom: 6, right: 18),
                            child: Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                "Username is already taken",
                                style: TextStyle(
                                  fontSize: 12,
                                  color: CupertinoColors.systemRed,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          )
                        else if (_usernameStatus == _UsernameStatus.invalid)
                          const Padding(
                            padding:
                                EdgeInsets.only(left: 18, bottom: 6, right: 18),
                            child: Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                "3-30 letters, numbers, or underscores",
                                style: TextStyle(
                                  fontSize: 12,
                                  color: CupertinoColors.systemOrange,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ),
                        const Divider(
                          height: 1,
                          indent: 20,
                          endIndent: 20,
                          color: Colors.grey,
                        ),
                        CupertinoTextFormFieldRow(
                          validator: _emailValidator,
                          autovalidateMode: AutovalidateMode.onUserInteraction,
                          prefix: const TextH6(
                            "Email:",
                            padding: EdgeInsets.only(left: 10),
                            fontWeight: FontWeight.w600,
                          ),
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.done,
                          decoration: const BoxDecoration(),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 8),
                          placeholder: "Enter email address",
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Text(
                      "Changing your email address requires verifying your current password.",
                      style: TextStyle(
                        fontSize: 12,
                        color: Theme.of(context)
                            .colorScheme
                            .onSurface
                            .withAlpha(120),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Align(
              alignment: Alignment.bottomCenter,
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Opacity(
                    opacity: _canSave ? 1.0 : 0.4,
                    child: CupertinoButton.filled(
                      onPressed: _canSave ? _saveForm : () {},
                      color: Colors.blue,
                      child: Text(_isSaving ? "Saving..." : "Save Changes"),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PasswordConfirmationSheet extends StatefulWidget {
  final String newEmail;
  final Future<void> Function(String password) onConfirm;

  const _PasswordConfirmationSheet({
    required this.newEmail,
    required this.onConfirm,
  });

  @override
  State<_PasswordConfirmationSheet> createState() =>
      _PasswordConfirmationSheetState();
}

class _PasswordConfirmationSheetState
    extends State<_PasswordConfirmationSheet> {
  final TextEditingController _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleConfirm() async {
    final password = _passwordController.text.trim();
    if (password.isEmpty) {
      setState(() {
        _errorMessage = "Please enter your password";
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await widget.onConfirm(password);
      if (mounted) {
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString().replaceFirst("Exception: ", "");
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.fromLTRB(8, 8, 8, bottomInset + 8),
      child: Container(
        decoration: BoxDecoration(
          color: Platform.isIOS
              ? Colors.transparent
              : isDark
                  ? const Color(0xFF1E1E1E)
                  : Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(28),
            topRight: Radius.circular(28),
          ),
          boxShadow: Platform.isIOS
              ? []
              : [
                  BoxShadow(
                    color: Colors.black.withAlpha(50),
                    blurRadius: 14,
                    spreadRadius: 2,
                  ),
                ],
          border: Border.all(
            color: isDark
                ? Colors.white.withAlpha(25)
                : Colors.black.withAlpha(15),
          ),
        ),
        padding: const EdgeInsets.all(24),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 36,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.grey.withAlpha(100),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const TextH5(
                  "Confirm Password",
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                Text(
                  "Enter your password to change email to\n${widget.newEmail}",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color:
                        Theme.of(context).colorScheme.onSurface.withAlpha(150),
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.white.withAlpha(10)
                        : Colors.black.withAlpha(8),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: CupertinoTextFormFieldRow(
                          controller: _passwordController,
                          prefix: const TextH6(
                            "Password:",
                            padding: EdgeInsets.only(left: 6),
                            fontWeight: FontWeight.w600,
                          ),
                          keyboardType: TextInputType.visiblePassword,
                          obscureText: _obscurePassword,
                          decoration: const BoxDecoration(),
                          padding: const EdgeInsets.all(12),
                          placeholder: "Enter password",
                          onFieldSubmitted: (_) => _handleConfirm(),
                        ),
                      ),
                      IconButton(
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                        icon: Icon(
                          _obscurePassword
                              ? CupertinoIcons.eye_slash
                              : CupertinoIcons.eye,
                          size: 20,
                          color: Theme.of(context)
                              .colorScheme
                              .onSurface
                              .withAlpha(150),
                        ),
                      ),
                    ],
                  ),
                ),
                if (_errorMessage != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 10),
                    child: Text(
                      _errorMessage!,
                      style: const TextStyle(
                        fontSize: 13,
                        color: CupertinoColors.systemRed,
                        fontWeight: FontWeight.w500,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ).animate().shake(duration: 350.ms),
                const SizedBox(height: 20),
                IconButton(
                  // label: _isLoading ? "Verifying..." : "Confirm",
                  icon: const Icon(Icons.check),
                  color: CupertinoColors.systemBlue,
                  onPressed: _isLoading ? () {} : _handleConfirm,
                ),
              ],
            ),
          ),
        ),
      ).liquidGlass(shape: LiquidGlassShape.rect, cornerRadius: 42).animate(
        effects: [
          const ScaleEffect(
            curve: Curves.easeOutBack,
            duration: Duration(milliseconds: 400),
          ),
          const FadeEffect(),
        ],
      ),
    );
  }
}
