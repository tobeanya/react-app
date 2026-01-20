Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\tobet\Projects\react-app\temp_bolt.png'
$imagesDir = 'C:\Users\tobet\Projects\react-app\windows\ReactApp.Package\Images'

# Load source image
$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)

function Resize-Image {
    param(
        [System.Drawing.Image]$source,
        [int]$width,
        [int]$height,
        [string]$outputPath
    )

    $destImage = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # Clear with transparent background
    $graphics.Clear([System.Drawing.Color]::Transparent)

    # Calculate scaling to fit while maintaining aspect ratio
    $ratioX = $width / $source.Width
    $ratioY = $height / $source.Height
    $ratio = [Math]::Min($ratioX, $ratioY)

    $newWidth = [int]($source.Width * $ratio)
    $newHeight = [int]($source.Height * $ratio)
    $x = [int](($width - $newWidth) / 2)
    $y = [int](($height - $newHeight) / 2)

    $graphics.DrawImage($source, $x, $y, $newWidth, $newHeight)
    $graphics.Dispose()

    $destImage.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destImage.Dispose()
    Write-Host "Created: $outputPath ($width x $height)"
}

# Generate all required sizes
Resize-Image -source $sourceImage -width 300 -height 300 -outputPath "$imagesDir\Square150x150Logo.scale-200.png"
Resize-Image -source $sourceImage -width 88 -height 88 -outputPath "$imagesDir\Square44x44Logo.scale-200.png"
Resize-Image -source $sourceImage -width 24 -height 24 -outputPath "$imagesDir\Square44x44Logo.targetsize-24_altform-unplated.png"
Resize-Image -source $sourceImage -width 620 -height 300 -outputPath "$imagesDir\Wide310x150Logo.scale-200.png"
Resize-Image -source $sourceImage -width 50 -height 50 -outputPath "$imagesDir\StoreLogo.png"
Resize-Image -source $sourceImage -width 48 -height 48 -outputPath "$imagesDir\LockScreenLogo.scale-200.png"
Resize-Image -source $sourceImage -width 1240 -height 600 -outputPath "$imagesDir\SplashScreen.scale-200.png"

$sourceImage.Dispose()
Write-Host "All icons resized successfully!"
