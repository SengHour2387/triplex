import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:triplex/app.dart';

void main() {
  testWidgets('App starts without crashing', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: App()));
  });
}
