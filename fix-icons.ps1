Add-Type -AssemblyName System.Drawing

$oldDir = 'C:\Users\tobet\Projects\react-app\windows\ReactApp.Package\Images\old'
$imagesDir = 'C:\Users\tobet\Projects\react-app\windows\ReactApp.Package\Images'
$icoDir = 'C:\Users\tobet\Projects\react-app\windows\ReactApp'

# Load the good source image (300x300 with blue background)
$sourcePath = "$oldDir\Square150x150Logo.scale-200.png"
$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)

Write-Host "Source image size: $($sourceImage.Width) x $($sourceImage.Height)"

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

    # Draw the source image scaled to fill the destination
    $graphics.DrawImage($source, 0, 0, $width, $height)
    $graphics.Dispose()

    $destImage.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destImage.Dispose()
    Write-Host "Created: $outputPath ($width x $height)"
}

function Create-Icon {
    param(
        [System.Drawing.Image]$source,
        [int[]]$sizes,
        [string]$outputPath
    )

    $tempFiles = @()

    foreach ($size in $sizes) {
        $bitmap = New-Object System.Drawing.Bitmap($size, $size)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($source, 0, 0, $size, $size)
        $graphics.Dispose()

        $tempFile = [System.IO.Path]::GetTempFileName() + ".png"
        $bitmap.Save($tempFile, [System.Drawing.Imaging.ImageFormat]::Png)
        $tempFiles += @{Size = $size; Path = $tempFile; Bitmap = $bitmap}
    }

    $ms = New-Object System.IO.MemoryStream
    $writer = New-Object System.IO.BinaryWriter($ms)

    # ICO Header
    $writer.Write([UInt16]0)
    $writer.Write([UInt16]1)
    $writer.Write([UInt16]$sizes.Length)

    $headerSize = 6 + ($sizes.Length * 16)
    $currentOffset = $headerSize
    $imageDataList = @()

    foreach ($item in $tempFiles) {
        $pngData = [System.IO.File]::ReadAllBytes($item.Path)
        $imageDataList += $pngData

        $size = $item.Size
        if ($size -ge 256) { $size = 0 }

        $writer.Write([byte]$size)
        $writer.Write([byte]$size)
        $writer.Write([byte]0)
        $writer.Write([byte]0)
        $writer.Write([UInt16]1)
        $writer.Write([UInt16]32)
        $writer.Write([UInt32]$pngData.Length)
        $writer.Write([UInt32]$currentOffset)

        $currentOffset += $pngData.Length
    }

    foreach ($data in $imageDataList) {
        $writer.Write($data)
    }

    [System.IO.File]::WriteAllBytes($outputPath, $ms.ToArray())

    $writer.Dispose()
    $ms.Dispose()

    foreach ($item in $tempFiles) {
        $item.Bitmap.Dispose()
        Remove-Item $item.Path -ErrorAction SilentlyContinue
    }

    Write-Host "Created ICO: $outputPath"
}

# Generate PNG files
Resize-Image -source $sourceImage -width 300 -height 300 -outputPath "$imagesDir\Square150x150Logo.scale-200.png"
Resize-Image -source $sourceImage -width 88 -height 88 -outputPath "$imagesDir\Square44x44Logo.scale-200.png"
Resize-Image -source $sourceImage -width 24 -height 24 -outputPath "$imagesDir\Square44x44Logo.targetsize-24_altform-unplated.png"
Resize-Image -source $sourceImage -width 620 -height 300 -outputPath "$imagesDir\Wide310x150Logo.scale-200.png"
Resize-Image -source $sourceImage -width 50 -height 50 -outputPath "$imagesDir\StoreLogo.png"
Resize-Image -source $sourceImage -width 48 -height 48 -outputPath "$imagesDir\LockScreenLogo.scale-200.png"
Resize-Image -source $sourceImage -width 1240 -height 600 -outputPath "$imagesDir\SplashScreen.scale-200.png"

# Generate ICO files
Create-Icon -source $sourceImage -sizes @(256, 48, 32, 16) -outputPath "$icoDir\ReactApp.ico"
Create-Icon -source $sourceImage -sizes @(16) -outputPath "$icoDir\small.ico"

$sourceImage.Dispose()
Write-Host "`nAll icons generated successfully!"
