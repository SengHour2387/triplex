import Foundation

enum StopType: String, Codable {
    case start
    case waypoint
    case end
}

struct StopItemModel: Codable, Identifiable, Equatable {
    let id: String
    let title: String
    let role: StopType
    let location: String?
    let placeId: String?
    let latitude: Double?
    let longitude: Double?
    let description: String?
    let cost: Double?
    let currency: String?
    let sortOrder: Int?
    let createdAt: Date?
    let updatedAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id, title, role, location, placeId, latitude, longitude, description, cost, currency, sortOrder, createdAt, updatedAt
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        if let intId = try? container.decode(Int.self, forKey: .id) {
            id = String(intId)
        } else {
            id = try container.decode(String.self, forKey: .id)
        }
        
        title = try container.decodeIfPresent(String.self, forKey: .title) ?? ""
        
        if let roleStr = try? container.decode(String.self, forKey: .role), let type = StopType(rawValue: roleStr.lowercased()) {
            role = type
        } else {
            role = .waypoint
        }
        
        location = try? container.decodeIfPresent(String.self, forKey: .location)
        placeId = try? container.decodeIfPresent(String.self, forKey: .placeId)
        
        if let latD = try? container.decodeIfPresent(Double.self, forKey: .latitude) {
            latitude = latD
        } else if let latS = try? container.decodeIfPresent(String.self, forKey: .latitude) {
            latitude = Double(latS)
        } else {
            latitude = nil
        }
        
        if let lonD = try? container.decodeIfPresent(Double.self, forKey: .longitude) {
            longitude = lonD
        } else if let lonS = try? container.decodeIfPresent(String.self, forKey: .longitude) {
            longitude = Double(lonS)
        } else {
            longitude = nil
        }
        
        description = try? container.decodeIfPresent(String.self, forKey: .description)
        
        if let costD = try? container.decodeIfPresent(Double.self, forKey: .cost) {
            cost = costD
        } else if let costS = try? container.decodeIfPresent(String.self, forKey: .cost) {
            cost = Double(costS)
        } else {
            cost = nil
        }
        
        currency = try? container.decodeIfPresent(String.self, forKey: .currency)
        sortOrder = try? container.decodeIfPresent(Int.self, forKey: .sortOrder)
        createdAt = try? container.decodeIfPresent(Date.self, forKey: .createdAt)
        updatedAt = try? container.decodeIfPresent(Date.self, forKey: .updatedAt)
    }
    
    init(id: String, title: String, role: StopType, location: String? = nil, placeId: String? = nil, latitude: Double? = nil, longitude: Double? = nil, description: String? = nil, cost: Double? = nil, currency: String? = nil, sortOrder: Int? = nil, createdAt: Date? = nil, updatedAt: Date? = nil) {
        self.id = id
        self.title = title
        self.role = role
        self.location = location
        self.placeId = placeId
        self.latitude = latitude
        self.longitude = longitude
        self.description = description
        self.cost = cost
        self.currency = currency
        self.sortOrder = sortOrder
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

struct FeedTripPlanModel: Codable, Identifiable, Equatable {
    let id: String
    let title: String
    let caption: String?
    let totalCost: Double?
    let totalCostCurrency: String?
    let costSuffix: String?
    let start: StopItemModel?
    let waypoints: [StopItemModel]?
    let end: StopItemModel?
    
    enum CodingKeys: String, CodingKey {
        case id, title, caption, totalCost, totalCostCurrency, costSuffix, start, waypoints, end
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        if let intId = try? container.decode(Int.self, forKey: .id) {
            id = String(intId)
        } else {
            id = (try? container.decode(String.self, forKey: .id)) ?? UUID().uuidString
        }
        
        title = try container.decodeIfPresent(String.self, forKey: .title) ?? ""
        caption = try? container.decodeIfPresent(String.self, forKey: .caption)
        
        if let costD = try? container.decodeIfPresent(Double.self, forKey: .totalCost) {
            totalCost = costD
        } else if let costS = try? container.decodeIfPresent(String.self, forKey: .totalCost) {
            totalCost = Double(costS)
        } else {
            totalCost = nil
        }
        
        totalCostCurrency = try? container.decodeIfPresent(String.self, forKey: .totalCostCurrency)
        costSuffix = try? container.decodeIfPresent(String.self, forKey: .costSuffix)
        start = try? container.decodeIfPresent(StopItemModel.self, forKey: .start)
        waypoints = try? container.decodeIfPresent([StopItemModel].self, forKey: .waypoints)
        end = try? container.decodeIfPresent(StopItemModel.self, forKey: .end)
    }
    
    init(id: String, title: String, caption: String?, totalCost: Double?, totalCostCurrency: String?, costSuffix: String?, start: StopItemModel?, waypoints: [StopItemModel]?, end: StopItemModel?) {
        self.id = id
        self.title = title
        self.caption = caption
        self.totalCost = totalCost
        self.totalCostCurrency = totalCostCurrency
        self.costSuffix = costSuffix
        self.start = start
        self.waypoints = waypoints
        self.end = end
    }
}

struct PostModel: Codable, Identifiable, Equatable {
    let id: String
    let type: String // "media", "trip_plan", "repost"
    let caption: String?
    let createdAt: Date?
    let updatedAt: Date?
    let user: UserModel
    let tripPlan: FeedTripPlanModel?
    let mediaUrls: [String]?
    let attachedTripTitle: String?
    let attachedTripId: String?
    let repostId: String?
    
    private let _repostedPost: [PostModel]?
    var repostedPost: PostModel? {
        return _repostedPost?.first
    }
    
    let likeCount: Int?
    let commentCount: Int?
    let repostCount: Int?
    let shareCount: Int?
    let savedCount: Int?
    let isLiked: Bool?
    let myReaction: String?
    let isSaved: Bool?
    let isReposted: Bool?
    let commentPreview: String?
    
    // Define a custom coding keys to ignore snake case conversion issues for alternative keys
    private struct DynamicCodingKeys: CodingKey {
        var stringValue: String
        init?(stringValue: String) { self.stringValue = stringValue }
        var intValue: Int?
        init?(intValue: Int) { return nil }
    }
    
    init(from decoder: Decoder) throws {
        // Because JSONDecoder.api uses .convertFromSnakeCase, 
        // keys like "likes_count" became "likesCount". "id" remains "id".
        let container = try decoder.container(keyedBy: DynamicCodingKeys.self)
        
        if let intId = try? container.decode(Int.self, forKey: DynamicCodingKeys(stringValue: "id")!) {
            id = String(intId)
        } else {
            id = (try? container.decode(String.self, forKey: DynamicCodingKeys(stringValue: "id")!)) ?? UUID().uuidString
        }
        
        type = (try? container.decodeIfPresent(String.self, forKey: DynamicCodingKeys(stringValue: "type")!)) ?? "media"
        caption = try? container.decodeIfPresent(String.self, forKey: DynamicCodingKeys(stringValue: "caption")!)
        
        createdAt = try? container.decodeIfPresent(Date.self, forKey: DynamicCodingKeys(stringValue: "createdAt")!)
        updatedAt = try? container.decodeIfPresent(Date.self, forKey: DynamicCodingKeys(stringValue: "updatedAt")!)
        
        user = try container.decode(UserModel.self, forKey: DynamicCodingKeys(stringValue: "user")!)
        
        tripPlan = try? container.decodeIfPresent(FeedTripPlanModel.self, forKey: DynamicCodingKeys(stringValue: "tripPlan")!)
        
        // Handle mediaUrls vs media
        var urls = try? container.decodeIfPresent([String].self, forKey: DynamicCodingKeys(stringValue: "mediaUrls")!)
        if urls == nil {
            // Check 'media' array of objects
            if let mediaObjects = try? container.decode([Dictionary<String, String>].self, forKey: DynamicCodingKeys(stringValue: "media")!) {
                urls = mediaObjects.compactMap { $0["cloudUrl"] } // "cloud_url" -> "cloudUrl"
            }
        }
        mediaUrls = urls
        
        attachedTripTitle = try? container.decodeIfPresent(String.self, forKey: DynamicCodingKeys(stringValue: "attachedTripTitle")!)
        attachedTripId = try? container.decodeIfPresent(String.self, forKey: DynamicCodingKeys(stringValue: "attachedTripId")!)
        repostId = try? container.decodeIfPresent(String.self, forKey: DynamicCodingKeys(stringValue: "repostId")!)
        
        if let rp = try? container.decodeIfPresent(PostModel.self, forKey: DynamicCodingKeys(stringValue: "repostedPost")!) {
            _repostedPost = [rp]
        } else if let rp2 = try? container.decodeIfPresent(PostModel.self, forKey: DynamicCodingKeys(stringValue: "repost")!) {
            _repostedPost = [rp2]
        } else {
            _repostedPost = nil
        }
        
        likeCount = (try? container.decodeIfPresent(Int.self, forKey: DynamicCodingKeys(stringValue: "likesCount")!)) ?? (try? container.decodeIfPresent(Int.self, forKey: DynamicCodingKeys(stringValue: "likeCount")!)) ?? 0
        commentCount = (try? container.decodeIfPresent(Int.self, forKey: DynamicCodingKeys(stringValue: "commentsCount")!)) ?? (try? container.decodeIfPresent(Int.self, forKey: DynamicCodingKeys(stringValue: "commentCount")!)) ?? 0
        repostCount = (try? container.decodeIfPresent(Int.self, forKey: DynamicCodingKeys(stringValue: "repostsCount")!)) ?? (try? container.decodeIfPresent(Int.self, forKey: DynamicCodingKeys(stringValue: "repostCount")!)) ?? 0
        shareCount = (try? container.decodeIfPresent(Int.self, forKey: DynamicCodingKeys(stringValue: "shareCount")!)) ?? 0
        savedCount = try? container.decodeIfPresent(Int.self, forKey: DynamicCodingKeys(stringValue: "savedCount")!)
        
        let myReactionValue = try? container.decodeIfPresent(String.self, forKey: DynamicCodingKeys(stringValue: "myReaction")!)
        myReaction = myReactionValue
        
        isLiked = (try? container.decodeIfPresent(Bool.self, forKey: DynamicCodingKeys(stringValue: "isLiked")!)) ?? (try? container.decodeIfPresent(Bool.self, forKey: DynamicCodingKeys(stringValue: "isReacted")!)) ?? (myReactionValue != nil)
        
        isSaved = (try? container.decodeIfPresent(Bool.self, forKey: DynamicCodingKeys(stringValue: "isSaved")!)) ?? false
        isReposted = (try? container.decodeIfPresent(Bool.self, forKey: DynamicCodingKeys(stringValue: "isReposted")!)) ?? false
        commentPreview = try? container.decodeIfPresent(String.self, forKey: DynamicCodingKeys(stringValue: "commentPreview")!)
    }
    
    init(id: String, type: String, caption: String?, createdAt: Date?, updatedAt: Date?, user: UserModel, tripPlan: FeedTripPlanModel?, mediaUrls: [String]?, attachedTripTitle: String?, attachedTripId: String?, repostId: String?, repostedPost: PostModel?, likeCount: Int?, commentCount: Int?, repostCount: Int?, shareCount: Int?, savedCount: Int?, isLiked: Bool?, myReaction: String?, isSaved: Bool?, isReposted: Bool?, commentPreview: String?) {
        self.id = id
        self.type = type
        self.caption = caption
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.user = user
        self.tripPlan = tripPlan
        self.mediaUrls = mediaUrls
        self.attachedTripTitle = attachedTripTitle
        self.attachedTripId = attachedTripId
        self.repostId = repostId
        self._repostedPost = repostedPost != nil ? [repostedPost!] : nil
        self.likeCount = likeCount
        self.commentCount = commentCount
        self.repostCount = repostCount
        self.shareCount = shareCount
        self.savedCount = savedCount
        self.isLiked = isLiked
        self.myReaction = myReaction
        self.isSaved = isSaved
        self.isReposted = isReposted
        self.commentPreview = commentPreview
    }
}

struct FeedResponse: Codable {
    let data: [PostModel]
}
