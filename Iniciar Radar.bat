@echo off
title Radar de Leads
cd /d "%~dp0"

node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=13)?0:1)" >nul 2>nul
if errorlevel 1 (
  echo.
  echo  O Node.js nao esta instalado ou esta desatualizado (precisa ser 22.13 ou mais novo).
  echo  Baixe em https://nodejs.org ^(botao LTS^), instale e abra este arquivo de novo.
  echo.
  start https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules\playwright" (
  echo.
  echo  Primeira vez: instalando o programa. Leva alguns minutos...
  echo.
  call npm install --no-audit --no-fund
  if errorlevel 1 goto erro
  call npx playwright install chromium
  if errorlevel 1 goto erro
)

echo.
echo  Radar de Leads ligado em http://localhost:8090
echo  Deixe esta janela aberta enquanto usa. Para desligar, feche a janela.
echo.
start "" /b cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:8090"
node src/server.js
goto fim

:erro
echo.
echo  A instalacao falhou. Confira sua internet e abra este arquivo de novo.

:fim
pause
