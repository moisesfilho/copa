Add-Type -AssemblyName System.Drawing
$sourcePath = "C:\Users\moise\.gemini\antigravity-ide\brain\23b5db65-ee23-4f3e-a2be-df2787ef80b8\world_cup_icon_1782156213460.png"
$img = [System.Drawing.Image]::FromFile($sourcePath)

function Resize-Image($img, $size, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $size, $size)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Resize-Image $img 512 "public\icons\icon-512x512.png"
Resize-Image $img 192 "public\icons\icon-192x192.png"
Resize-Image $img 64 "public\favicon.png"

$img.Dispose()
Write-Host "Icons generated successfully!"
