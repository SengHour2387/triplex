// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $CachedUsersTable extends CachedUsers
    with TableInfo<$CachedUsersTable, CachedUser> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CachedUsersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _usernameMeta = const VerificationMeta(
    'username',
  );
  @override
  late final GeneratedColumn<String> username = GeneratedColumn<String>(
    'username',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _emailMeta = const VerificationMeta('email');
  @override
  late final GeneratedColumn<String> email = GeneratedColumn<String>(
    'email',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _avatarUrlMeta = const VerificationMeta(
    'avatarUrl',
  );
  @override
  late final GeneratedColumn<String> avatarUrl = GeneratedColumn<String>(
    'avatar_url',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [id, username, email, avatarUrl];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'cached_users';
  @override
  VerificationContext validateIntegrity(
    Insertable<CachedUser> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('username')) {
      context.handle(
        _usernameMeta,
        username.isAcceptableOrUnknown(data['username']!, _usernameMeta),
      );
    } else if (isInserting) {
      context.missing(_usernameMeta);
    }
    if (data.containsKey('email')) {
      context.handle(
        _emailMeta,
        email.isAcceptableOrUnknown(data['email']!, _emailMeta),
      );
    } else if (isInserting) {
      context.missing(_emailMeta);
    }
    if (data.containsKey('avatar_url')) {
      context.handle(
        _avatarUrlMeta,
        avatarUrl.isAcceptableOrUnknown(data['avatar_url']!, _avatarUrlMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CachedUser map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CachedUser(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      username: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}username'],
      )!,
      email: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}email'],
      )!,
      avatarUrl: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}avatar_url'],
      ),
    );
  }

  @override
  $CachedUsersTable createAlias(String alias) {
    return $CachedUsersTable(attachedDatabase, alias);
  }
}

class CachedUser extends DataClass implements Insertable<CachedUser> {
  final String id;
  final String username;
  final String email;
  final String? avatarUrl;
  const CachedUser({
    required this.id,
    required this.username,
    required this.email,
    this.avatarUrl,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['username'] = Variable<String>(username);
    map['email'] = Variable<String>(email);
    if (!nullToAbsent || avatarUrl != null) {
      map['avatar_url'] = Variable<String>(avatarUrl);
    }
    return map;
  }

  CachedUsersCompanion toCompanion(bool nullToAbsent) {
    return CachedUsersCompanion(
      id: Value(id),
      username: Value(username),
      email: Value(email),
      avatarUrl: avatarUrl == null && nullToAbsent
          ? const Value.absent()
          : Value(avatarUrl),
    );
  }

  factory CachedUser.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CachedUser(
      id: serializer.fromJson<String>(json['id']),
      username: serializer.fromJson<String>(json['username']),
      email: serializer.fromJson<String>(json['email']),
      avatarUrl: serializer.fromJson<String?>(json['avatarUrl']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'username': serializer.toJson<String>(username),
      'email': serializer.toJson<String>(email),
      'avatarUrl': serializer.toJson<String?>(avatarUrl),
    };
  }

  CachedUser copyWith({
    String? id,
    String? username,
    String? email,
    Value<String?> avatarUrl = const Value.absent(),
  }) =>
      CachedUser(
        id: id ?? this.id,
        username: username ?? this.username,
        email: email ?? this.email,
        avatarUrl: avatarUrl.present ? avatarUrl.value : this.avatarUrl,
      );
  CachedUser copyWithCompanion(CachedUsersCompanion data) {
    return CachedUser(
      id: data.id.present ? data.id.value : this.id,
      username: data.username.present ? data.username.value : this.username,
      email: data.email.present ? data.email.value : this.email,
      avatarUrl: data.avatarUrl.present ? data.avatarUrl.value : this.avatarUrl,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CachedUser(')
          ..write('id: $id, ')
          ..write('username: $username, ')
          ..write('email: $email, ')
          ..write('avatarUrl: $avatarUrl')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, username, email, avatarUrl);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CachedUser &&
          other.id == this.id &&
          other.username == this.username &&
          other.email == this.email &&
          other.avatarUrl == this.avatarUrl);
}

class CachedUsersCompanion extends UpdateCompanion<CachedUser> {
  final Value<String> id;
  final Value<String> username;
  final Value<String> email;
  final Value<String?> avatarUrl;
  final Value<int> rowid;
  const CachedUsersCompanion({
    this.id = const Value.absent(),
    this.username = const Value.absent(),
    this.email = const Value.absent(),
    this.avatarUrl = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  CachedUsersCompanion.insert({
    required String id,
    required String username,
    required String email,
    this.avatarUrl = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        username = Value(username),
        email = Value(email);
  static Insertable<CachedUser> custom({
    Expression<String>? id,
    Expression<String>? username,
    Expression<String>? email,
    Expression<String>? avatarUrl,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (username != null) 'username': username,
      if (email != null) 'email': email,
      if (avatarUrl != null) 'avatar_url': avatarUrl,
      if (rowid != null) 'rowid': rowid,
    });
  }

  CachedUsersCompanion copyWith({
    Value<String>? id,
    Value<String>? username,
    Value<String>? email,
    Value<String?>? avatarUrl,
    Value<int>? rowid,
  }) {
    return CachedUsersCompanion(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (username.present) {
      map['username'] = Variable<String>(username.value);
    }
    if (email.present) {
      map['email'] = Variable<String>(email.value);
    }
    if (avatarUrl.present) {
      map['avatar_url'] = Variable<String>(avatarUrl.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CachedUsersCompanion(')
          ..write('id: $id, ')
          ..write('username: $username, ')
          ..write('email: $email, ')
          ..write('avatarUrl: $avatarUrl, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $CachedPostsTable extends CachedPosts
    with TableInfo<$CachedPostsTable, CachedPost> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CachedPostsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _typeMeta = const VerificationMeta('type');
  @override
  late final GeneratedColumn<String> type = GeneratedColumn<String>(
    'type',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _captionMeta = const VerificationMeta(
    'caption',
  );
  @override
  late final GeneratedColumn<String> caption = GeneratedColumn<String>(
    'caption',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _userIdMeta = const VerificationMeta('userId');
  @override
  late final GeneratedColumn<String> userId = GeneratedColumn<String>(
    'user_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'REFERENCES cached_users (id)',
    ),
  );
  static const VerificationMeta _tripPlanJsonMeta = const VerificationMeta(
    'tripPlanJson',
  );
  @override
  late final GeneratedColumn<String> tripPlanJson = GeneratedColumn<String>(
    'trip_plan_json',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _repostIdMeta = const VerificationMeta(
    'repostId',
  );
  @override
  late final GeneratedColumn<String> repostId = GeneratedColumn<String>(
    'repost_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _repostedPostJsonMeta = const VerificationMeta(
    'repostedPostJson',
  );
  @override
  late final GeneratedColumn<String> repostedPostJson = GeneratedColumn<String>(
    'reposted_post_json',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
        id,
        type,
        caption,
        createdAt,
        updatedAt,
        userId,
        tripPlanJson,
        repostId,
        repostedPostJson,
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'cached_posts';
  @override
  VerificationContext validateIntegrity(
    Insertable<CachedPost> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('type')) {
      context.handle(
        _typeMeta,
        type.isAcceptableOrUnknown(data['type']!, _typeMeta),
      );
    } else if (isInserting) {
      context.missing(_typeMeta);
    }
    if (data.containsKey('caption')) {
      context.handle(
        _captionMeta,
        caption.isAcceptableOrUnknown(data['caption']!, _captionMeta),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('user_id')) {
      context.handle(
        _userIdMeta,
        userId.isAcceptableOrUnknown(data['user_id']!, _userIdMeta),
      );
    } else if (isInserting) {
      context.missing(_userIdMeta);
    }
    if (data.containsKey('trip_plan_json')) {
      context.handle(
        _tripPlanJsonMeta,
        tripPlanJson.isAcceptableOrUnknown(
          data['trip_plan_json']!,
          _tripPlanJsonMeta,
        ),
      );
    }
    if (data.containsKey('repost_id')) {
      context.handle(
        _repostIdMeta,
        repostId.isAcceptableOrUnknown(data['repost_id']!, _repostIdMeta),
      );
    }
    if (data.containsKey('reposted_post_json')) {
      context.handle(
        _repostedPostJsonMeta,
        repostedPostJson.isAcceptableOrUnknown(
          data['reposted_post_json']!,
          _repostedPostJsonMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CachedPost map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CachedPost(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      type: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}type'],
      )!,
      caption: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}caption'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}updated_at'],
      )!,
      userId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}user_id'],
      )!,
      tripPlanJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}trip_plan_json'],
      ),
      repostId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}repost_id'],
      ),
      repostedPostJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}reposted_post_json'],
      ),
    );
  }

  @override
  $CachedPostsTable createAlias(String alias) {
    return $CachedPostsTable(attachedDatabase, alias);
  }
}

class CachedPost extends DataClass implements Insertable<CachedPost> {
  final String id;
  final String type;
  final String? caption;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String userId;
  final String? tripPlanJson;
  final String? repostId;
  final String? repostedPostJson;
  const CachedPost({
    required this.id,
    required this.type,
    this.caption,
    required this.createdAt,
    required this.updatedAt,
    required this.userId,
    this.tripPlanJson,
    this.repostId,
    this.repostedPostJson,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['type'] = Variable<String>(type);
    if (!nullToAbsent || caption != null) {
      map['caption'] = Variable<String>(caption);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['user_id'] = Variable<String>(userId);
    if (!nullToAbsent || tripPlanJson != null) {
      map['trip_plan_json'] = Variable<String>(tripPlanJson);
    }
    if (!nullToAbsent || repostId != null) {
      map['repost_id'] = Variable<String>(repostId);
    }
    if (!nullToAbsent || repostedPostJson != null) {
      map['reposted_post_json'] = Variable<String>(repostedPostJson);
    }
    return map;
  }

  CachedPostsCompanion toCompanion(bool nullToAbsent) {
    return CachedPostsCompanion(
      id: Value(id),
      type: Value(type),
      caption: caption == null && nullToAbsent
          ? const Value.absent()
          : Value(caption),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      userId: Value(userId),
      tripPlanJson: tripPlanJson == null && nullToAbsent
          ? const Value.absent()
          : Value(tripPlanJson),
      repostId: repostId == null && nullToAbsent
          ? const Value.absent()
          : Value(repostId),
      repostedPostJson: repostedPostJson == null && nullToAbsent
          ? const Value.absent()
          : Value(repostedPostJson),
    );
  }

  factory CachedPost.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CachedPost(
      id: serializer.fromJson<String>(json['id']),
      type: serializer.fromJson<String>(json['type']),
      caption: serializer.fromJson<String?>(json['caption']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      userId: serializer.fromJson<String>(json['userId']),
      tripPlanJson: serializer.fromJson<String?>(json['tripPlanJson']),
      repostId: serializer.fromJson<String?>(json['repostId']),
      repostedPostJson: serializer.fromJson<String?>(json['repostedPostJson']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'type': serializer.toJson<String>(type),
      'caption': serializer.toJson<String?>(caption),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'userId': serializer.toJson<String>(userId),
      'tripPlanJson': serializer.toJson<String?>(tripPlanJson),
      'repostId': serializer.toJson<String?>(repostId),
      'repostedPostJson': serializer.toJson<String?>(repostedPostJson),
    };
  }

  CachedPost copyWith({
    String? id,
    String? type,
    Value<String?> caption = const Value.absent(),
    DateTime? createdAt,
    DateTime? updatedAt,
    String? userId,
    Value<String?> tripPlanJson = const Value.absent(),
    Value<String?> repostId = const Value.absent(),
    Value<String?> repostedPostJson = const Value.absent(),
  }) =>
      CachedPost(
        id: id ?? this.id,
        type: type ?? this.type,
        caption: caption.present ? caption.value : this.caption,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        userId: userId ?? this.userId,
        tripPlanJson:
            tripPlanJson.present ? tripPlanJson.value : this.tripPlanJson,
        repostId: repostId.present ? repostId.value : this.repostId,
        repostedPostJson: repostedPostJson.present
            ? repostedPostJson.value
            : this.repostedPostJson,
      );
  CachedPost copyWithCompanion(CachedPostsCompanion data) {
    return CachedPost(
      id: data.id.present ? data.id.value : this.id,
      type: data.type.present ? data.type.value : this.type,
      caption: data.caption.present ? data.caption.value : this.caption,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      userId: data.userId.present ? data.userId.value : this.userId,
      tripPlanJson: data.tripPlanJson.present
          ? data.tripPlanJson.value
          : this.tripPlanJson,
      repostId: data.repostId.present ? data.repostId.value : this.repostId,
      repostedPostJson: data.repostedPostJson.present
          ? data.repostedPostJson.value
          : this.repostedPostJson,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CachedPost(')
          ..write('id: $id, ')
          ..write('type: $type, ')
          ..write('caption: $caption, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('userId: $userId, ')
          ..write('tripPlanJson: $tripPlanJson, ')
          ..write('repostId: $repostId, ')
          ..write('repostedPostJson: $repostedPostJson')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
        id,
        type,
        caption,
        createdAt,
        updatedAt,
        userId,
        tripPlanJson,
        repostId,
        repostedPostJson,
      );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CachedPost &&
          other.id == this.id &&
          other.type == this.type &&
          other.caption == this.caption &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.userId == this.userId &&
          other.tripPlanJson == this.tripPlanJson &&
          other.repostId == this.repostId &&
          other.repostedPostJson == this.repostedPostJson);
}

class CachedPostsCompanion extends UpdateCompanion<CachedPost> {
  final Value<String> id;
  final Value<String> type;
  final Value<String?> caption;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<String> userId;
  final Value<String?> tripPlanJson;
  final Value<String?> repostId;
  final Value<String?> repostedPostJson;
  final Value<int> rowid;
  const CachedPostsCompanion({
    this.id = const Value.absent(),
    this.type = const Value.absent(),
    this.caption = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.userId = const Value.absent(),
    this.tripPlanJson = const Value.absent(),
    this.repostId = const Value.absent(),
    this.repostedPostJson = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  CachedPostsCompanion.insert({
    required String id,
    required String type,
    this.caption = const Value.absent(),
    required DateTime createdAt,
    required DateTime updatedAt,
    required String userId,
    this.tripPlanJson = const Value.absent(),
    this.repostId = const Value.absent(),
    this.repostedPostJson = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        type = Value(type),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt),
        userId = Value(userId);
  static Insertable<CachedPost> custom({
    Expression<String>? id,
    Expression<String>? type,
    Expression<String>? caption,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<String>? userId,
    Expression<String>? tripPlanJson,
    Expression<String>? repostId,
    Expression<String>? repostedPostJson,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (type != null) 'type': type,
      if (caption != null) 'caption': caption,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (userId != null) 'user_id': userId,
      if (tripPlanJson != null) 'trip_plan_json': tripPlanJson,
      if (repostId != null) 'repost_id': repostId,
      if (repostedPostJson != null) 'reposted_post_json': repostedPostJson,
      if (rowid != null) 'rowid': rowid,
    });
  }

  CachedPostsCompanion copyWith({
    Value<String>? id,
    Value<String>? type,
    Value<String?>? caption,
    Value<DateTime>? createdAt,
    Value<DateTime>? updatedAt,
    Value<String>? userId,
    Value<String?>? tripPlanJson,
    Value<String?>? repostId,
    Value<String?>? repostedPostJson,
    Value<int>? rowid,
  }) {
    return CachedPostsCompanion(
      id: id ?? this.id,
      type: type ?? this.type,
      caption: caption ?? this.caption,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      userId: userId ?? this.userId,
      tripPlanJson: tripPlanJson ?? this.tripPlanJson,
      repostId: repostId ?? this.repostId,
      repostedPostJson: repostedPostJson ?? this.repostedPostJson,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (type.present) {
      map['type'] = Variable<String>(type.value);
    }
    if (caption.present) {
      map['caption'] = Variable<String>(caption.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (userId.present) {
      map['user_id'] = Variable<String>(userId.value);
    }
    if (tripPlanJson.present) {
      map['trip_plan_json'] = Variable<String>(tripPlanJson.value);
    }
    if (repostId.present) {
      map['repost_id'] = Variable<String>(repostId.value);
    }
    if (repostedPostJson.present) {
      map['reposted_post_json'] = Variable<String>(repostedPostJson.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CachedPostsCompanion(')
          ..write('id: $id, ')
          ..write('type: $type, ')
          ..write('caption: $caption, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('userId: $userId, ')
          ..write('tripPlanJson: $tripPlanJson, ')
          ..write('repostId: $repostId, ')
          ..write('repostedPostJson: $repostedPostJson, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $CachedUsersTable cachedUsers = $CachedUsersTable(this);
  late final $CachedPostsTable cachedPosts = $CachedPostsTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
        cachedUsers,
        cachedPosts,
      ];
}

typedef $$CachedUsersTableCreateCompanionBuilder = CachedUsersCompanion
    Function({
  required String id,
  required String username,
  required String email,
  Value<String?> avatarUrl,
  Value<int> rowid,
});
typedef $$CachedUsersTableUpdateCompanionBuilder = CachedUsersCompanion
    Function({
  Value<String> id,
  Value<String> username,
  Value<String> email,
  Value<String?> avatarUrl,
  Value<int> rowid,
});

final class $$CachedUsersTableReferences
    extends BaseReferences<_$AppDatabase, $CachedUsersTable, CachedUser> {
  $$CachedUsersTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<$CachedPostsTable, List<CachedPost>>
      _cachedPostsRefsTable(_$AppDatabase db) => MultiTypedResultKey.fromTable(
            db.cachedPosts,
            aliasName:
                $_aliasNameGenerator(db.cachedUsers.id, db.cachedPosts.userId),
          );

  $$CachedPostsTableProcessedTableManager get cachedPostsRefs {
    final manager = $$CachedPostsTableTableManager(
      $_db,
      $_db.cachedPosts,
    ).filter((f) => f.userId.id.sqlEquals($_itemColumn<String>('id')!));

    final cache = $_typedResult.readTableOrNull(_cachedPostsRefsTable($_db));
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: cache),
    );
  }
}

class $$CachedUsersTableFilterComposer
    extends Composer<_$AppDatabase, $CachedUsersTable> {
  $$CachedUsersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
        column: $table.id,
        builder: (column) => ColumnFilters(column),
      );

  ColumnFilters<String> get username => $composableBuilder(
        column: $table.username,
        builder: (column) => ColumnFilters(column),
      );

  ColumnFilters<String> get email => $composableBuilder(
        column: $table.email,
        builder: (column) => ColumnFilters(column),
      );

  ColumnFilters<String> get avatarUrl => $composableBuilder(
        column: $table.avatarUrl,
        builder: (column) => ColumnFilters(column),
      );

  Expression<bool> cachedPostsRefs(
    Expression<bool> Function($$CachedPostsTableFilterComposer f) f,
  ) {
    final $$CachedPostsTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.cachedPosts,
      getReferencedColumn: (t) => t.userId,
      builder: (
        joinBuilder, {
        $addJoinBuilderToRootComposer,
        $removeJoinBuilderFromRootComposer,
      }) =>
          $$CachedPostsTableFilterComposer(
        $db: $db,
        $table: $db.cachedPosts,
        $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
        joinBuilder: joinBuilder,
        $removeJoinBuilderFromRootComposer: $removeJoinBuilderFromRootComposer,
      ),
    );
    return f(composer);
  }
}

class $$CachedUsersTableOrderingComposer
    extends Composer<_$AppDatabase, $CachedUsersTable> {
  $$CachedUsersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
        column: $table.id,
        builder: (column) => ColumnOrderings(column),
      );

  ColumnOrderings<String> get username => $composableBuilder(
        column: $table.username,
        builder: (column) => ColumnOrderings(column),
      );

  ColumnOrderings<String> get email => $composableBuilder(
        column: $table.email,
        builder: (column) => ColumnOrderings(column),
      );

  ColumnOrderings<String> get avatarUrl => $composableBuilder(
        column: $table.avatarUrl,
        builder: (column) => ColumnOrderings(column),
      );
}

class $$CachedUsersTableAnnotationComposer
    extends Composer<_$AppDatabase, $CachedUsersTable> {
  $$CachedUsersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get username =>
      $composableBuilder(column: $table.username, builder: (column) => column);

  GeneratedColumn<String> get email =>
      $composableBuilder(column: $table.email, builder: (column) => column);

  GeneratedColumn<String> get avatarUrl =>
      $composableBuilder(column: $table.avatarUrl, builder: (column) => column);

  Expression<T> cachedPostsRefs<T extends Object>(
    Expression<T> Function($$CachedPostsTableAnnotationComposer a) f,
  ) {
    final $$CachedPostsTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.id,
      referencedTable: $db.cachedPosts,
      getReferencedColumn: (t) => t.userId,
      builder: (
        joinBuilder, {
        $addJoinBuilderToRootComposer,
        $removeJoinBuilderFromRootComposer,
      }) =>
          $$CachedPostsTableAnnotationComposer(
        $db: $db,
        $table: $db.cachedPosts,
        $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
        joinBuilder: joinBuilder,
        $removeJoinBuilderFromRootComposer: $removeJoinBuilderFromRootComposer,
      ),
    );
    return f(composer);
  }
}

class $$CachedUsersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $CachedUsersTable,
    CachedUser,
    $$CachedUsersTableFilterComposer,
    $$CachedUsersTableOrderingComposer,
    $$CachedUsersTableAnnotationComposer,
    $$CachedUsersTableCreateCompanionBuilder,
    $$CachedUsersTableUpdateCompanionBuilder,
    (CachedUser, $$CachedUsersTableReferences),
    CachedUser,
    PrefetchHooks Function({bool cachedPostsRefs})> {
  $$CachedUsersTableTableManager(_$AppDatabase db, $CachedUsersTable table)
      : super(
          TableManagerState(
            db: db,
            table: table,
            createFilteringComposer: () =>
                $$CachedUsersTableFilterComposer($db: db, $table: table),
            createOrderingComposer: () =>
                $$CachedUsersTableOrderingComposer($db: db, $table: table),
            createComputedFieldComposer: () =>
                $$CachedUsersTableAnnotationComposer($db: db, $table: table),
            updateCompanionCallback: ({
              Value<String> id = const Value.absent(),
              Value<String> username = const Value.absent(),
              Value<String> email = const Value.absent(),
              Value<String?> avatarUrl = const Value.absent(),
              Value<int> rowid = const Value.absent(),
            }) =>
                CachedUsersCompanion(
              id: id,
              username: username,
              email: email,
              avatarUrl: avatarUrl,
              rowid: rowid,
            ),
            createCompanionCallback: ({
              required String id,
              required String username,
              required String email,
              Value<String?> avatarUrl = const Value.absent(),
              Value<int> rowid = const Value.absent(),
            }) =>
                CachedUsersCompanion.insert(
              id: id,
              username: username,
              email: email,
              avatarUrl: avatarUrl,
              rowid: rowid,
            ),
            withReferenceMapper: (p0) => p0
                .map(
                  (e) => (
                    e.readTable(table),
                    $$CachedUsersTableReferences(db, table, e),
                  ),
                )
                .toList(),
            prefetchHooksCallback: ({cachedPostsRefs = false}) {
              return PrefetchHooks(
                db: db,
                explicitlyWatchedTables: [if (cachedPostsRefs) db.cachedPosts],
                addJoins: null,
                getPrefetchedDataCallback: (items) async {
                  return [
                    if (cachedPostsRefs)
                      await $_getPrefetchedData<CachedUser, $CachedUsersTable,
                          CachedPost>(
                        currentTable: table,
                        referencedTable: $$CachedUsersTableReferences
                            ._cachedPostsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$CachedUsersTableReferences(
                          db,
                          table,
                          p0,
                        ).cachedPostsRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.userId == item.id),
                        typedResults: items,
                      ),
                  ];
                },
              );
            },
          ),
        );
}

typedef $$CachedUsersTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $CachedUsersTable,
    CachedUser,
    $$CachedUsersTableFilterComposer,
    $$CachedUsersTableOrderingComposer,
    $$CachedUsersTableAnnotationComposer,
    $$CachedUsersTableCreateCompanionBuilder,
    $$CachedUsersTableUpdateCompanionBuilder,
    (CachedUser, $$CachedUsersTableReferences),
    CachedUser,
    PrefetchHooks Function({bool cachedPostsRefs})>;
typedef $$CachedPostsTableCreateCompanionBuilder = CachedPostsCompanion
    Function({
  required String id,
  required String type,
  Value<String?> caption,
  required DateTime createdAt,
  required DateTime updatedAt,
  required String userId,
  Value<String?> tripPlanJson,
  Value<String?> repostId,
  Value<String?> repostedPostJson,
  Value<int> rowid,
});
typedef $$CachedPostsTableUpdateCompanionBuilder = CachedPostsCompanion
    Function({
  Value<String> id,
  Value<String> type,
  Value<String?> caption,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<String> userId,
  Value<String?> tripPlanJson,
  Value<String?> repostId,
  Value<String?> repostedPostJson,
  Value<int> rowid,
});

final class $$CachedPostsTableReferences
    extends BaseReferences<_$AppDatabase, $CachedPostsTable, CachedPost> {
  $$CachedPostsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $CachedUsersTable _userIdTable(_$AppDatabase db) =>
      db.cachedUsers.createAlias(
        $_aliasNameGenerator(db.cachedPosts.userId, db.cachedUsers.id),
      );

  $$CachedUsersTableProcessedTableManager get userId {
    final $_column = $_itemColumn<String>('user_id')!;

    final manager = $$CachedUsersTableTableManager(
      $_db,
      $_db.cachedUsers,
    ).filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_userIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
      manager.$state.copyWith(prefetchedData: [item]),
    );
  }
}

class $$CachedPostsTableFilterComposer
    extends Composer<_$AppDatabase, $CachedPostsTable> {
  $$CachedPostsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
        column: $table.id,
        builder: (column) => ColumnFilters(column),
      );

  ColumnFilters<String> get type => $composableBuilder(
        column: $table.type,
        builder: (column) => ColumnFilters(column),
      );

  ColumnFilters<String> get caption => $composableBuilder(
        column: $table.caption,
        builder: (column) => ColumnFilters(column),
      );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
        column: $table.createdAt,
        builder: (column) => ColumnFilters(column),
      );

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
        column: $table.updatedAt,
        builder: (column) => ColumnFilters(column),
      );

  ColumnFilters<String> get tripPlanJson => $composableBuilder(
        column: $table.tripPlanJson,
        builder: (column) => ColumnFilters(column),
      );

  ColumnFilters<String> get repostId => $composableBuilder(
        column: $table.repostId,
        builder: (column) => ColumnFilters(column),
      );

  ColumnFilters<String> get repostedPostJson => $composableBuilder(
        column: $table.repostedPostJson,
        builder: (column) => ColumnFilters(column),
      );

  $$CachedUsersTableFilterComposer get userId {
    final $$CachedUsersTableFilterComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.userId,
      referencedTable: $db.cachedUsers,
      getReferencedColumn: (t) => t.id,
      builder: (
        joinBuilder, {
        $addJoinBuilderToRootComposer,
        $removeJoinBuilderFromRootComposer,
      }) =>
          $$CachedUsersTableFilterComposer(
        $db: $db,
        $table: $db.cachedUsers,
        $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
        joinBuilder: joinBuilder,
        $removeJoinBuilderFromRootComposer: $removeJoinBuilderFromRootComposer,
      ),
    );
    return composer;
  }
}

class $$CachedPostsTableOrderingComposer
    extends Composer<_$AppDatabase, $CachedPostsTable> {
  $$CachedPostsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
        column: $table.id,
        builder: (column) => ColumnOrderings(column),
      );

  ColumnOrderings<String> get type => $composableBuilder(
        column: $table.type,
        builder: (column) => ColumnOrderings(column),
      );

  ColumnOrderings<String> get caption => $composableBuilder(
        column: $table.caption,
        builder: (column) => ColumnOrderings(column),
      );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
        column: $table.createdAt,
        builder: (column) => ColumnOrderings(column),
      );

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
        column: $table.updatedAt,
        builder: (column) => ColumnOrderings(column),
      );

  ColumnOrderings<String> get tripPlanJson => $composableBuilder(
        column: $table.tripPlanJson,
        builder: (column) => ColumnOrderings(column),
      );

  ColumnOrderings<String> get repostId => $composableBuilder(
        column: $table.repostId,
        builder: (column) => ColumnOrderings(column),
      );

  ColumnOrderings<String> get repostedPostJson => $composableBuilder(
        column: $table.repostedPostJson,
        builder: (column) => ColumnOrderings(column),
      );

  $$CachedUsersTableOrderingComposer get userId {
    final $$CachedUsersTableOrderingComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.userId,
      referencedTable: $db.cachedUsers,
      getReferencedColumn: (t) => t.id,
      builder: (
        joinBuilder, {
        $addJoinBuilderToRootComposer,
        $removeJoinBuilderFromRootComposer,
      }) =>
          $$CachedUsersTableOrderingComposer(
        $db: $db,
        $table: $db.cachedUsers,
        $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
        joinBuilder: joinBuilder,
        $removeJoinBuilderFromRootComposer: $removeJoinBuilderFromRootComposer,
      ),
    );
    return composer;
  }
}

class $$CachedPostsTableAnnotationComposer
    extends Composer<_$AppDatabase, $CachedPostsTable> {
  $$CachedPostsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get type =>
      $composableBuilder(column: $table.type, builder: (column) => column);

  GeneratedColumn<String> get caption =>
      $composableBuilder(column: $table.caption, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<String> get tripPlanJson => $composableBuilder(
        column: $table.tripPlanJson,
        builder: (column) => column,
      );

  GeneratedColumn<String> get repostId =>
      $composableBuilder(column: $table.repostId, builder: (column) => column);

  GeneratedColumn<String> get repostedPostJson => $composableBuilder(
        column: $table.repostedPostJson,
        builder: (column) => column,
      );

  $$CachedUsersTableAnnotationComposer get userId {
    final $$CachedUsersTableAnnotationComposer composer = $composerBuilder(
      composer: this,
      getCurrentColumn: (t) => t.userId,
      referencedTable: $db.cachedUsers,
      getReferencedColumn: (t) => t.id,
      builder: (
        joinBuilder, {
        $addJoinBuilderToRootComposer,
        $removeJoinBuilderFromRootComposer,
      }) =>
          $$CachedUsersTableAnnotationComposer(
        $db: $db,
        $table: $db.cachedUsers,
        $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
        joinBuilder: joinBuilder,
        $removeJoinBuilderFromRootComposer: $removeJoinBuilderFromRootComposer,
      ),
    );
    return composer;
  }
}

class $$CachedPostsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $CachedPostsTable,
    CachedPost,
    $$CachedPostsTableFilterComposer,
    $$CachedPostsTableOrderingComposer,
    $$CachedPostsTableAnnotationComposer,
    $$CachedPostsTableCreateCompanionBuilder,
    $$CachedPostsTableUpdateCompanionBuilder,
    (CachedPost, $$CachedPostsTableReferences),
    CachedPost,
    PrefetchHooks Function({bool userId})> {
  $$CachedPostsTableTableManager(_$AppDatabase db, $CachedPostsTable table)
      : super(
          TableManagerState(
            db: db,
            table: table,
            createFilteringComposer: () =>
                $$CachedPostsTableFilterComposer($db: db, $table: table),
            createOrderingComposer: () =>
                $$CachedPostsTableOrderingComposer($db: db, $table: table),
            createComputedFieldComposer: () =>
                $$CachedPostsTableAnnotationComposer($db: db, $table: table),
            updateCompanionCallback: ({
              Value<String> id = const Value.absent(),
              Value<String> type = const Value.absent(),
              Value<String?> caption = const Value.absent(),
              Value<DateTime> createdAt = const Value.absent(),
              Value<DateTime> updatedAt = const Value.absent(),
              Value<String> userId = const Value.absent(),
              Value<String?> tripPlanJson = const Value.absent(),
              Value<String?> repostId = const Value.absent(),
              Value<String?> repostedPostJson = const Value.absent(),
              Value<int> rowid = const Value.absent(),
            }) =>
                CachedPostsCompanion(
              id: id,
              type: type,
              caption: caption,
              createdAt: createdAt,
              updatedAt: updatedAt,
              userId: userId,
              tripPlanJson: tripPlanJson,
              repostId: repostId,
              repostedPostJson: repostedPostJson,
              rowid: rowid,
            ),
            createCompanionCallback: ({
              required String id,
              required String type,
              Value<String?> caption = const Value.absent(),
              required DateTime createdAt,
              required DateTime updatedAt,
              required String userId,
              Value<String?> tripPlanJson = const Value.absent(),
              Value<String?> repostId = const Value.absent(),
              Value<String?> repostedPostJson = const Value.absent(),
              Value<int> rowid = const Value.absent(),
            }) =>
                CachedPostsCompanion.insert(
              id: id,
              type: type,
              caption: caption,
              createdAt: createdAt,
              updatedAt: updatedAt,
              userId: userId,
              tripPlanJson: tripPlanJson,
              repostId: repostId,
              repostedPostJson: repostedPostJson,
              rowid: rowid,
            ),
            withReferenceMapper: (p0) => p0
                .map(
                  (e) => (
                    e.readTable(table),
                    $$CachedPostsTableReferences(db, table, e),
                  ),
                )
                .toList(),
            prefetchHooksCallback: ({userId = false}) {
              return PrefetchHooks(
                db: db,
                explicitlyWatchedTables: [],
                addJoins: <
                    T extends TableManagerState<
                        dynamic,
                        dynamic,
                        dynamic,
                        dynamic,
                        dynamic,
                        dynamic,
                        dynamic,
                        dynamic,
                        dynamic,
                        dynamic,
                        dynamic>>(state) {
                  if (userId) {
                    state = state.withJoin(
                      currentTable: table,
                      currentColumn: table.userId,
                      referencedTable:
                          $$CachedPostsTableReferences._userIdTable(db),
                      referencedColumn:
                          $$CachedPostsTableReferences._userIdTable(db).id,
                    ) as T;
                  }

                  return state;
                },
                getPrefetchedDataCallback: (items) async {
                  return [];
                },
              );
            },
          ),
        );
}

typedef $$CachedPostsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $CachedPostsTable,
    CachedPost,
    $$CachedPostsTableFilterComposer,
    $$CachedPostsTableOrderingComposer,
    $$CachedPostsTableAnnotationComposer,
    $$CachedPostsTableCreateCompanionBuilder,
    $$CachedPostsTableUpdateCompanionBuilder,
    (CachedPost, $$CachedPostsTableReferences),
    CachedPost,
    PrefetchHooks Function({bool userId})>;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$CachedUsersTableTableManager get cachedUsers =>
      $$CachedUsersTableTableManager(_db, _db.cachedUsers);
  $$CachedPostsTableTableManager get cachedPosts =>
      $$CachedPostsTableTableManager(_db, _db.cachedPosts);
}
