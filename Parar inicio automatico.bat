@echo off
title Radar de Leads - parar inicio automatico
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Radar de Leads.vbs" >nul 2>nul
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"name='node.exe'\" | Where-Object { $_.CommandLine -like '*src\server.js*' } | Invoke-CimMethod -MethodName Terminate | Out-Null"
echo.
echo  Pronto: o Radar de Leads nao liga mais sozinho e foi desligado agora.
echo  Seus leads continuam salvos. Para usar, abra "Iniciar Radar.bat".
echo.
pause
