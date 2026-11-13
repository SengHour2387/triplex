import 'dart:convert';
import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqlite3_flutter_libs/sqlite3_flutter_libs.dart';
import 'package:triplex/features/auth/domain/user_model.dart';
import 'package:triplex/features/feed/domain/models/post_model.dart';

part 'app_database.g.dart';

/// Cached user profiles for offline feed display.
class CachedUsers extends Table {
  TextColumn get id => text()();
  TextColumn get username => text()();
  TextColumn get email => text()();
  TextColumn get avatarUrl => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Cached feed posts for offline-first display.
/// Trip plan and nested repost data are stored as serialized JSON to avoid complex joins.
class CachedPosts extends Table {
  TextColumn get id => text()();
  TextColumn get type => text()();
  TextColumn get caption => text().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
  TextColumn get userId => text().references(CachedUsers, #id)();
  TextColumn get tripPlanJson => text().nullable()();
  TextColumn get repostId => text().nullable()();
  TextColumn get repostedPostJson => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

@DriftDatabase(tables: [CachedUsers, CachedPosts])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  // ── Feed Cache Operations ───────────────────────────────────────────────

  /// Returns all cached feed posts, ordered by creation date (newest first).
  Future<List<PostModel>> getCachedFeed() async {
    final query = select(cachedPosts).join([
      innerJoin(cachedUsers, cachedUsers.id.equalsExp(cachedPosts.userId)),
    ])
      ..orderBy([OrderingTerm.desc(cachedPosts.createdAt)]);

    final rows = await query.get();
    return rows.map((row) {
      final post = row.readTable(cachedPosts);
      final user = row.readTable(cachedUsers);

      FeedTripPlanModel? tripPlan;
      if (post.tripPlanJson != null) {
        tripPlan = FeedTripPlanModel.fromJson(
          jsonDecode(post.tripPlanJson!) as Map<String, dynamic>,
        );
      }

      PostModel? repostedPost;
      if (post.repostedPostJson != null) {
        repostedPost = PostModel.fromJson(
          jsonDecode(post.repostedPostJson!) as Map<String, dynamic>,
        );
      }

      return PostModel(
        id: post.id,
        type: post.type,
        caption: post.caption,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: UserModel(
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        ),
        tripPlan: tripPlan,
        repostId: post.repostId,
        repostedPost: repostedPost,
      );
    }).toList();
  }

  /// Upserts a list of posts and their associated users into the cache.
  Future<void> cacheFeedPosts(List<PostModel> posts) async {
    await batch((batch) {
      // Upsert users first (referenced by posts)
      for (final post in posts) {
        batch.insert(
          cachedUsers,
          CachedUsersCompanion.insert(
            id: post.user.id,
            username: post.user.username,
            email: post.user.email,
            avatarUrl: Value(post.user.avatarUrl),
          ),
          mode: InsertMode.insertOrReplace,
        );
      }
      // Then upsert posts
      for (final post in posts) {
        batch.insert(
          cachedPosts,
          CachedPostsCompanion.insert(
            id: post.id,
            type: post.type,
            caption: Value(post.caption),
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            userId: post.user.id,
            tripPlanJson: Value(
              post.tripPlan != null
                  ? jsonEncode(post.tripPlan!.toJson())
                  : null,
            ),
            repostId: Value(post.repostId),
            repostedPostJson: Value(
              post.repostedPost != null
                  ? jsonEncode(post.repostedPost!.toJson())
                  : null,
            ),
          ),
          mode: InsertMode.insertOrReplace,
        );
      }
    });
  }

  /// Removes all cached feed posts.
  Future<void> clearFeedCache() async {
    await delete(cachedPosts).go();
  }

  /// Removes all cached data (posts + users). Called on logout.
  Future<void> clearAllCaches() async {
    await transaction(() async {
      await delete(cachedPosts).go();
      await delete(cachedUsers).go();
    });
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'triplex_cache.sqlite'));

    if (Platform.isAndroid) {
      await applyWorkaroundToOpenSqlite3OnOldAndroidVersions();
    }

    return NativeDatabase.createInBackground(file);
  });
}
