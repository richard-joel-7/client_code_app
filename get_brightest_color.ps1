Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap "C:\Users\richardjoel.d\.gemini\antigravity\brain\b971081b-8abc-44bc-9a26-b09f6dbc8a3b\uploaded_image_1763727158047.png"
$width = $bmp.Width
$height = $bmp.Height
$maxG = 0
$brightestHex = "#00FF00"

for($x=0; $x -lt $width; $x+=5) {
    for($y=0; $y -lt $height; $y+=5) {
        $p = $bmp.GetPixel($x, $y)
        if($p.G -gt $p.R -and $p.G -gt $p.B) {
            if($p.G -gt $maxG) {
                $maxG = $p.G
                $brightestHex = "#{0:X2}{1:X2}{2:X2}" -f $p.R, $p.G, $p.B
            }
        }
    }
}

Write-Output $brightestHex
