Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\tobet\Projects\react-app\windows\ReactApp.Package\Images\Square150x150Logo.scale-200.png'
$icoDir = 'C:\Users\tobet\Projects\react-app\windows\ReactApp'

# Load source image
$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)

function Create-Icon {
    param(
        [System.Drawing.Image]$source,
        [int[]]$sizes,
        [string]$outputPath
    )

    # Create temporary bitmaps for each size
    $tempFiles = @()

    foreach ($size in $sizes) {
        $bitmap = New-Object System.Drawing.Bitmap($size, $size)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.Clear([System.Drawing.Color]::Transparent)

        # Calculate scaling to fit while maintaining aspect ratio
        $ratioX = $size / $source.Width
        $ratioY = $size / $source.Height
        $ratio = [Math]::Min($ratioX, $ratioY)

        $newWidth = [int]($source.Width * $ratio)
        $newHeight = [int]($source.Height * $ratio)
        $x = [int](($size - $newWidth) / 2)
        $y = [int](($size - $newHeight) / 2)

        $graphics.DrawImage($source, $x, $y, $newWidth, $newHeight)
        $graphics.Dispose()

        $tempFile = [System.IO.Path]::GetTempFileName() + ".png"
        $bitmap.Save($tempFile, [System.Drawing.Imaging.ImageFormat]::Png)
        $tempFiles += @{Size = $size; Path = $tempFile; Bitmap = $bitmap}
    }

    # Create ICO file manually
    $ms = New-Object System.IO.MemoryStream
    $writer = New-Object System.IO.BinaryWriter($ms)

    # ICO Header
    $writer.Write([UInt16]0)      # Reserved
    $writer.Write([UInt16]1)      # Type (1 = ICO)
    $writer.Write([UInt16]$sizes.Length)  # Number of images

    # Calculate offsets
    $headerSize = 6 + ($sizes.Length * 16)  # 6 byte header + 16 bytes per image entry
    $currentOffset = $headerSize

    # Store image data
    $imageDataList = @()

    foreach ($item in $tempFiles) {
        $pngData = [System.IO.File]::ReadAllBytes($item.Path)
        $imageDataList += $pngData

        $size = $item.Size
        if ($size -ge 256) { $size = 0 }  # 0 means 256 in ICO format

        # Image directory entry
        $writer.Write([byte]$size)           # Width
        $writer.Write([byte]$size)           # Height
        $writer.Write([byte]0)               # Color palette
        $writer.Write([byte]0)               # Reserved
        $writer.Write([UInt16]1)             # Color planes
        $writer.Write([UInt16]32)            # Bits per pixel
        $writer.Write([UInt32]$pngData.Length)  # Size of image data
        $writer.Write([UInt32]$currentOffset)   # Offset to image data

        $currentOffset += $pngData.Length
    }

    # Write image data
    foreach ($data in $imageDataList) {
        $writer.Write($data)
    }

    # Save ICO file
    [System.IO.File]::WriteAllBytes($outputPath, $ms.ToArray())

    $writer.Dispose()
    $ms.Dispose()

    # Cleanup temp files and bitmaps
    foreach ($item in $tempFiles) {
        $item.Bitmap.Dispose()
        Remove-Item $item.Path -ErrorAction SilentlyContinue
    }

    Write-Host "Created: $outputPath"
}

# Create main icon (256, 48, 32, 16)
Create-Icon -source $sourceImage -sizes @(256, 48, 32, 16) -outputPath "$icoDir\ReactApp.ico"

# Create small icon (16)
Create-Icon -source $sourceImage -sizes @(16) -outputPath "$icoDir\small.ico"

$sourceImage.Dispose()
Write-Host "ICO files created successfully!"
