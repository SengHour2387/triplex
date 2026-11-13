//
//  ProfileCardView.swift
//  Triplex_swift
//
//  Created by User on 25/8/26.
//

import SwiftUI

struct ProfileCardView: View {
    var body: some View {
        Section {
            ZStack(alignment:.bottom){
                AsyncImage(url: URL(string: "https://res.cloudinary.com/aenetworks/image/upload/c_fill,ar_2,w_3840,h_1920,g_auto/dpr_auto/f_auto/q_auto:eco/v1/topic-golden-gate-bridge-gettyimages-177770941?_a=BAVMn6E80"),) { image in
                    image.image
                    
                }
                .frame(width: UIScreen.main.bounds.width)
                .frame(height: 400)
                VStack(alignment: .center) {
                    Image(systemName: "person.crop.circle")
                        .resizable()
                        .frame(width: 80, height: 80)
                        .clipShape(Circle())
                    
                    
                    Text("John Doe")
                        .font(.title)
                        .fontWeight(.bold).shadow(radius: 5)
                    Text("Software Engineer")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .shadow(radius: 5)
                }.offset(    y: 100)
            }
        }
    }
}

#Preview {
    ProfileCardView()
}
