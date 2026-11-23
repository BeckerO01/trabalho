@echo off
title Radar de Leads - iniciar com o Windows
cd /d "%~dp0"

node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=13)?0:1)" >nul 2>nul
if errorlevel 1 (
  echo.
  echo  O Node.js nao esta instalado ou esta desatualizado ^(precisa ser 22.13 ou mais novo^).
  echo  Baixe em https://nodejs.org ^(botao LTS^), instale e abra este arquivo de novo.
  start https://nodejs.org
  pause
  exit /b 1
)
if not exist "node_modules\playwright" (
  echo  Primeira vez: instalando o programa. Leva alguns minutos...
  call npm install --no-audit --no-fund || goto erro
  call npx playwright install chromium || goto erro
)

set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "PASTA=%~dp0"
rem roda o servidor escondido (sem janela preta) toda vez que o Windows liga
> "%STARTUP%\Radar de Leads.vbs" (
  echo Set sh = CreateObject^("WScript.Shell"^)
  echo sh.CurrentDirectory = "%PASTA%"
  echo sh.Run "cmd /c node src\server.js", 0, False
)

rem atalho na area de trabalho que abre o Radar no navegador
for /f "usebackq delims=" %%D in (`powershell -NoProfile -Command "[Environment]::GetFolderPath('Desktop')"`) do set "DESK=%%D"
> "%DESK%\Radar de Leads.url" (
  echo [InternetShortcut]
  echo URL=http://localhost:8090
)

wscript "%STARTUP%\Radar de Leads.vbs"
timeout /t 3 /nobreak >nul
start http://localhost:8090
echo.
echo  Pronto! O Radar de Leads agora liga sozinho junto com o Windows.
echo  Para abrir, use o atalho "Radar de Leads" na area de trabalho.
echo  Para desligar o inicio automatico, use "Parar inicio automatico.bat".
echo.
pause
exit /b 0

:erro
echo  A instalacao falhou. Confira sua internet e abra este arquivo de novo.
pause
