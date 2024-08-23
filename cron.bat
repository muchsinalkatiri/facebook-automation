@echo off
cd /d C:\Users\Administrator\Documents\convert-fb-cookies-csv

:: Mendapatkan tanggal dan waktu saat ini
for /f "delims=" %%a in ('wmic OS Get localdatetime ^| find "."') do set datetime=%%a
set year=%datetime:~0,4%
set month=%datetime:~4,2%
set day=%datetime:~6,2%
set hour=%datetime:~8,2%
set minute=%datetime:~10,2%
set second=%datetime:~12,2%

:: Format tanggal dan waktu ke dalam string
set formatted_datetime=%year%-%month%-%day% %hour%:%minute%:%second%

git add .
git commit -m "Commit pada: %formatted_datetime%"

:: Melakukan push ke branch yang diinginkan
git push origin main