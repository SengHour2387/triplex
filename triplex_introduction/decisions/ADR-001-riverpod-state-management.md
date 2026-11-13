# ADR-001: Riverpod v3 for State Management & Dependency Injection

**Date:** 2026-08-26  
**Status:** Accepted  
**Deciders:** Project team

---

## Context

The Triplex Flutter app needs a robust, testable, and scalable state management solution that also handles dependency injection (DI) cleanly. The team evaluated several options.

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| `Provider` | Simple, official | No DI, hard to test, deprecated path |
| `Bloc/Cubit` | Explicit, popular | Verbose boilerplate, no built-in DI |
| `Riverpod v3` | DI + state in one, code-gen, testable, scoped | Learning curve |
| `GetX` | Low boilerplate | Anti-pattern, opinionated, poor testability |

## Decision

**Riverpod v3** with `riverpod_annotation` and `riverpod_generator` (code generation via `build_runner`).

## Consequences

- All providers and notifiers use `@riverpod` annotation.
- Code generation must be run after any provider change: `dart run build_runner build -d`
- Each generated file has a corresponding `.g.dart` file — **never edit `.g.dart` files manually**.
- Business logic lives in `_$NotifierName` classes in `domain/` layer.
- Providers marked `@Riverpod(keepAlive: true)` persist for the app lifetime (used for Dio, AuthInterceptor).

## Pattern Reference

```dart
// domain/[feature]_notifier.dart
@riverpod
class MyFeatureNotifier extends _$MyFeatureNotifier {
  @override
  Future<MyModel?> build() async { ... }

  Future<void> someAction() async { ... }
}
```
