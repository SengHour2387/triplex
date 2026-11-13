import SwiftUI

struct TripPlanCardView: View {
    let tripPlan: FeedTripPlanModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(tripPlan.title)
                    .font(.headline)
                Spacer()
                if let cost = tripPlan.totalCost, let currency = tripPlan.totalCostCurrency {
                    Text("\(currency)\(String(format: "%.2f", cost))\(tripPlan.costSuffix ?? "")")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundColor(.green)
                }
            }
            
            if let start = tripPlan.start {
                StopRow(title: start.title, role: start.role)
            }
            
            if let waypoints = tripPlan.waypoints, !waypoints.isEmpty {
                if waypoints.count > 2 {
                    StopRow(title: "\(waypoints.count) stops", role: .waypoint)
                } else {
                    ForEach(waypoints) { stop in
                        StopRow(title: stop.title, role: stop.role)
                    }
                }
            }
            
            if let end = tripPlan.end {
                StopRow(title: end.title, role: end.role)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

private struct StopRow: View {
    let title: String
    let role: StopType
    
    var body: some View {
        HStack {
            Image(systemName: iconName)
                .foregroundColor(iconColor)
            Text(title)
                .font(.subheadline)
        }
    }
    
    private var iconName: String {
        switch role {
        case .start: return "flag.fill"
        case .waypoint: return "mappin.circle.fill"
        case .end: return "mappin.and.ellipse"
        }
    }
    
    private var iconColor: Color {
        switch role {
        case .start: return .green
        case .waypoint: return .orange
        case .end: return .red
        }
    }
}
