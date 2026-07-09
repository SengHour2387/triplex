import 'dart:io';

import 'package:cupertino_native_better/components/button.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/core/widgets/EmojiValidator.dart';
import 'package:triplex/core/widgets/TextH.dart';
import 'package:triplex/features/accountCenter/Domain/Notifier/change_username_notifier.dart';
import 'package:triplex/features/auth/Domain/userModel.dart';
import 'package:triplex/features/profile/Domain/ProfileNotifier.dart';

class AccountCenterScreen extends ConsumerStatefulWidget {
  const AccountCenterScreen({super.key});

  @override
  ConsumerState<AccountCenterScreen> createState() => _AccountCenterScreenState();
}

class _AccountCenterScreenState extends ConsumerState<AccountCenterScreen> {

  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  UserModel? user;

  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    // TODO: implement initState
    super.initState();

    _usernameController.text = ref.read(profileProvider).value?.username??"";
    _emailController.text = ref.read(profileProvider).value?.email??"";

  }

  @override
  void dispose() {
    // TODO: implement dispose
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();

    super.dispose();
  }

  String? _emailValidator(String? value) {
    if (value != null) {

      if(value.containsEmoji()) {
        return "Emoji is not allowed";
      }
    } else {
      return "Can not be empty";
    }
    return null;
  }

  String? _usernameValidator(String? value) {

    if (value != null) {
      if(value.containsEmoji()) {
        return "Emoji is not allowed";
      }
    } else {
      return "Can not be empty";
    }
    return null;
  }

  Future<void> _saveForm() async {
    if (_formKey.currentState?.validate() ?? false) {
      try {
        await ref.read(
changeUsernameProvider.notifier)
            .changeUsername(_usernameController.text.trim(), _passwordController.text);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Done"))
          );
        }
      } catch (e) {
        // Error is shown via ref.listen below
      }
    }
  }

  @override
  Widget build(BuildContext context) {

    ref.watch(profileProvider).whenData((data) {
      user = data;
    });

    ref.listen<AsyncValue<void>>(
changeUsernameProvider, (previous, next) {
      next.whenOrNull(
        error: (err, _) {
          final message = err.toString().replaceFirst("Exception: ", "");
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(message),
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
          );
        },
      );
    });

    Size screenSize = MediaQuery.of(context).size;

    return Container(
      color: Theme.of(context).colorScheme.surface,
      height: screenSize.height,
      width: screenSize.width,
      child: Stack(
        children: [
          Form(
            key:_formKey,
            child: ListView(
              children: [
                const Hero(
                    tag: "account_center_title",
                    child: Material(type: .transparency,
                        child: TextH1("Account Center", padding: .symmetric(horizontal:10), maxLines: 1))
                ),
                Container(padding: .all(0),
                margin: .all(10),
                decoration: BoxDecoration(
                  borderRadius: .circular(24),
                  color: Theme.of(context).colorScheme.surfaceBright
                ),
                child: Column(
                  spacing: 15,
                  mainAxisSize: .min,
                  children: [
                    CupertinoTextFormFieldRow(
                      validator: _usernameValidator,
                  autovalidateMode: .onUserInteraction,
                  prefix: TextH6("Username:",padding: .only(left:10),fontWeight: .w600,),
                  controller: _usernameController,
                  keyboardType: .name,
                  decoration: BoxDecoration(),
                      padding: .all(10),),
                    CupertinoTextFormFieldRow(
                      validator: _emailValidator,
                      prefix: TextH6("Email:",padding: .only(left:10),fontWeight: .w600,),
                      controller: _emailController,
                      keyboardType: .emailAddress,
                      decoration: BoxDecoration(),
                      padding: .all(10),)
                  ],
                ),
                ),
                TextH6("Password is required in order to change your information",
                  fontSize: 12,textAlign: .center,
                  padding: EdgeInsetsGeometry.symmetric(horizontal: 10),),
                Container(
                  padding: .all(0),
                  margin: .all(10),
                  decoration: BoxDecoration(
                      borderRadius: .circular(24),
                      color: Theme.of(context).colorScheme.surfaceBright
                  ),
                  child: Column(
                    mainAxisSize: .min,
                    children: [
                      CupertinoTextFormFieldRow(
                        controller: _passwordController,
                        validator: _emailValidator,
                        prefix: TextH6("Password:",padding: .only(left:10),fontWeight: .w600,),
                        keyboardType: .visiblePassword,
                        obscureText: true,
                        decoration: BoxDecoration(),
                        padding: .all(10),)
                    ],
                  ),
                )
              ],
            ),
          ),

          Align(
            alignment: .bottomCenter,
            child: Padding(
                padding: .all(30),
              child:
              Platform.isIOS?
              CNButton(label: "Save",
              onPressed: _saveForm,
                tint: Colors.blue,
              config: CNButtonConfig(style: .prominentGlass,
              ),
                )
                  :
              CupertinoButton(
                minimumSize: Size(screenSize.width, 0),
                sizeStyle: .medium,
                  color: Colors.blue,
                  onPressed: _saveForm,
                  child: Text("Save")),
            )
          )
        ],
      ),
    );
  }
}
