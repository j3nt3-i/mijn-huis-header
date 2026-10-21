import AppKit
// crop out.png x y w h scale file1 file2 ... -> files side by side (region in 887x1662 units)
let a = CommandLine.arguments
let out = a[1]; let x = Double(a[2])!, y = Double(a[3])!, w = Double(a[4])!, h = Double(a[5])!, s = Double(a[6])!
let files = Array(a.dropFirst(7))
let W = Int(w*s), H = Int(h*s)
let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: W*files.count, pixelsHigh: H, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
for (i, f) in files.enumerated() {
  let img = NSImage(contentsOfFile: f)!
  // full image drawn at scale s, offset so that region lands at tile i
  let fw = 887*s, fh = 1662*s
  NSGraphicsContext.current!.cgContext.saveGState()
  NSGraphicsContext.current!.cgContext.clip(to: CGRect(x: Double(i*W), y: 0, width: Double(W), height: Double(H)))
  img.draw(in: NSRect(x: Double(i*W) - x*s, y: Double(H) - (fh - y*s), width: fw, height: fh))
  NSGraphicsContext.current!.cgContext.restoreGState()
}
NSGraphicsContext.restoreGraphicsState()
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
