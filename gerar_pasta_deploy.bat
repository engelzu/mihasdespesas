@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   Gerando pasta 'deploy_netlify' para upload manual
echo ===================================================
echo.

set "DEPLOY_DIR=deploy_netlify"

:: Remove a pasta de deploy se já existir para criar uma nova limpa
if exist "%DEPLOY_DIR%" (
    echo Removendo pasta antiga...
    rmdir /S /Q "%DEPLOY_DIR%"
)

:: Cria a pasta principal
mkdir "%DEPLOY_DIR%"

:: Lista de diretórios para copiar
set "DIRS=adicionar_despesa boas_vindas dashboard_de_despesas hist_rico_e_exporta_o js nu_finance_ethos paywall netlify admin images"

echo Copiando pastas...
for %%D in (%DIRS%) do (
    if exist "%%D" (
        xcopy "%%D" "%DEPLOY_DIR%\%%D\" /E /I /H /Y /Q >nul
        echo   - %%D copiado
    )
)

:: Lista de arquivos para copiar
set "FILES=index.html manifest.json sw.js package.json package-lock.json"

echo.
echo Copiando arquivos na raiz...
for %%F in (%FILES%) do (
    if exist "%%F" (
        copy "%%F" "%DEPLOY_DIR%\" >nul
        echo   - %%F copiado
    )
)

echo.
echo ===================================================
echo   Pasta '%DEPLOY_DIR%' gerada com sucesso!
echo   Arraste a pasta '%DEPLOY_DIR%' para o Netlify.
echo ===================================================
pause
