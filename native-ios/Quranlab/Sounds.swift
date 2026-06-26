import AVFoundation

// Plays the same feedback sounds bundled from /public (correct.wav,
// incorrect.wav, finish.mp3).
enum Sounds {
    private static var player: AVAudioPlayer?
    static func play(_ name: String, ext: String) {
        guard let url = Bundle.main.url(forResource: name, withExtension: ext) else { return }
        player = try? AVAudioPlayer(contentsOf: url)
        player?.play()
    }
    static func correct()   { play("correct", ext: "wav") }
    static func incorrect() { play("incorrect", ext: "wav") }
    static func finish()    { play("finish", ext: "mp3") }
}
