import SwiftUI
import RiveRuntime

/// Renders a bundled Rive animation (the real Koji). Picks the correct state
/// machine / timeline by file name (names taken from the web), and uses
/// `.contain` so it scales cleanly inside its frame.
struct RiveMascot: View {
    @StateObject private var vm: RiveViewModel

    // file → state machine name (these drive the animation)
    private static let stateMachines: [String: String] = [
        "loading": "State Machine loading",
        "hi_ok": "State Machine 1",
    ]
    // file → explicit timeline animation (when there's no driving state machine)
    private static let animations: [String: String] = [
        "mascot_breath": "breath loop",
        "eyes_down": "eyes down",
    ]

    init(_ fileName: String) {
        let model: RiveViewModel
        if let sm = Self.stateMachines[fileName] {
            model = RiveViewModel(fileName: fileName, stateMachineName: sm)
        } else if let anim = Self.animations[fileName] {
            model = RiveViewModel(fileName: fileName, animationName: anim)
        } else {
            model = RiveViewModel(fileName: fileName)
        }
        model.fit = .contain
        model.alignment = .center
        _vm = StateObject(wrappedValue: model)
    }

    var body: some View {
        vm.view()
    }
}
