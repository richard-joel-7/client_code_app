Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap "C:\Users\richardjoel.d\.gemini\antigravity\brain\b971081b-8abc-44bc-9a26-b09f6dbc8a3b\uploaded_image_1763727158047.png"
$width = $bmp.Width
$height = $bmp.Height
$greenCounts = @{}

for($x=0; $x -lt $width; $x+=10) {
    for($y=0; $y -lt $height; $y+=10) {
        $p = $bmp.GetPixel($x, $y)
        if($p.G -gt $p.R -and $p.G -gt $p.B -and $p.G -gt 100) {
            $hex = "#{0:X2}{1:X2}{2:X2}" -f $p.R, $p.G, $p.B
            if($greenCounts.ContainsKey($hex)) {
                $greenCounts[$hex]++
            } else {
                $greenCounts[$hex] = 1
            }
        }
    }
}

$greenCounts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1 | ForEach-Object { $_.Key }
