import SwiftUI
import RiveRuntime

/// Renders a bundled Rive animation (the real Koji). The .riv files live in
/// Resources/animations and are copied into the app bundle by XcodeGen, so they
/// are addressable by file name (without extension).
struct RiveMascot: View {
    @StateObject private var vm: RiveViewModel
    init(_ fileName: String) {
        _vm = StateObject(wrappedValue: RiveViewModel(fileName: fileName))
    }
    var body: some View {
        vm.view()
    }
}
