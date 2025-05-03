$filePath = "src/app/sections/ChatSection.tsx"
$content = Get-Content $filePath -Raw
$newContent = $content -replace "<Tool ", "<Wrench "
$newContent | Set-Content $filePath -NoNewline
Write-Host "References fixed in $filePath" 