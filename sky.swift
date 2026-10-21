import AppKit
for p in CommandLine.arguments.dropFirst() {
  guard let img = NSImage(contentsOfFile: p) else { print(p, "ERR"); continue }
  let w = 887, h = 1662
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  img.draw(in: NSRect(x: 0, y: 0, width: w, height: h))
  NSGraphicsContext.restoreGraphicsState()
  var out = ""
  for x in [20, 443, 860] { let c = rep.colorAt(x: x, y: 1)!.usingColorSpace(.sRGB)!
    out += String(format: " #%02x%02x%02x", Int(c.redComponent*255+0.5), Int(c.greenComponent*255+0.5), Int(c.blueComponent*255+0.5)) }
  print((p as NSString).lastPathComponent, out)
}
