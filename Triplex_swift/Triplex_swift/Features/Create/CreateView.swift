//
//  CreateView.swift
//  Triplex_swift
//

import SwiftUI

struct CreateView: View {
    
    @State private var isExpand:Bool = true
    @State private var isMedia:Bool = true
    @State private var isTrip:Bool = false
    
    @Namespace private var namespace
    
    var body: some View {
        
        List {
            Section {
                TextField("name",text: .constant(""))
                TextField(text: .constant("something"), axis: .horizontal) {
                    Text("Description")
                }
            }
            
        
                if #available(iOS 26.0, *) {
                    GlassEffectContainer(spacing: 50.0) {
                        HStack(spacing: 20.0) {
                            
                            if( isMedia || isExpand ) {
                                
                                Image(systemName: "photo")
                                     .frame(width: 50,height: 50)
                                     .glassEffect(
                                        .regular.tint(isMedia ? .blue : .clear).interactive()
                                     ).glassEffectID("media", in: namespace).onTapGesture {
                                 
                                         withAnimation{
                                            isMedia = true
                                             isTrip = false
                                            isExpand.toggle()
                                            }
                                     }
                            }
                            
                          
                            
                            if( isTrip || isExpand ) {
                                Image(systemName: "gear")
                                    .frame(width: 50,height: 50)
                                    .glassEffect(
                                        .regular.tint(isTrip ? .blue : .clear).interactive()
                                    ).glassEffectID("trip", in: namespace).onTapGesture {
                                        
                                        withAnimation{
                                           isMedia = false
                                            isTrip = true
                                           isExpand.toggle()
                                           }
                                    }
                            }
                            
                        }
                    }
                } else {
                    // Fallback on earlier versions
                }
            
        }
        .navigationTitle("Create")
        .toolbar {
            
        }
    }
}

#Preview {
        NavigationStack {
            CreateView()
        }

}
