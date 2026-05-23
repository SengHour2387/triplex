import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:triplex/core/widgets/TextH.dart';

class AccountCenterScreen extends StatefulWidget {
  const AccountCenterScreen({super.key});

  @override
  State<AccountCenterScreen> createState() => _AccountCenterScreenState();
}

class _AccountCenterScreenState extends State<AccountCenterScreen> {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Theme.of(context).colorScheme.surface,
      child: ListView(
        children: [
          TextH1("AccountCenter")
        ],
      ),
    );
  }
}
