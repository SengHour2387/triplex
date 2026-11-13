import SwiftUI

struct MediaGridView: View {
    let urls: [String]
    
    var body: some View {
        if urls.isEmpty {
            EmptyView()
        } else if urls.count == 1 {
            AsyncImage(url: URL(string: urls[0])) { image in
                image.resizable()
                     .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle().fill(Color.gray.opacity(0.3))
            }
            .frame(height: 300)
            .clipped()
            .cornerRadius(12)
        } else {
            TabView {
                ForEach(urls, id: \.self) { urlString in
                    AsyncImage(url: URL(string: urlString)) { image in
                        image.resizable()
                             .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle().fill(Color.gray.opacity(0.3))
                    }
                }
            }
            .tabViewStyle(PageTabViewStyle())
            .frame(height: 300)
            .cornerRadius(12)
        }
    }
}
