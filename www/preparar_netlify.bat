@echo off
echo ==============================================
echo Preparando pacote para deploy no Netlify...
echo ==============================================

set "DEPLOY_DIR=netlify_deploy"

rem 1. Remove a pasta se ja existir
if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%"

rem 2. Cria a pasta nova
mkdir "%DEPLOY_DIR%"

rem 3. Copia arquivos principais
echo Copiando arquivos principais...
copy index.html "%DEPLOY_DIR%\" >nul
copy manifest.json "%DEPLOY_DIR%\" >nul
copy sw.js "%DEPLOY_DIR%\" >nul

rem 4. Copia pastas do projeto
echo Copiando pastas...
xcopy "adicionar_despesa" "%DEPLOY_DIR%\adicionar_despesa\" /E /I /H /Y >nul
xcopy "boas_vindas" "%DEPLOY_DIR%\boas_vindas\" /E /I /H /Y >nul
xcopy "dashboard_de_despesas" "%DEPLOY_DIR%\dashboard_de_despesas\" /E /I /H /Y >nul
xcopy "hist_rico_e_exporta_o" "%DEPLOY_DIR%\hist_rico_e_exporta_o\" /E /I /H /Y >nul
xcopy "js" "%DEPLOY_DIR%\js\" /E /I /H /Y >nul
xcopy "nu_finance_ethos" "%DEPLOY_DIR%\nu_finance_ethos\" /E /I /H /Y >nul

echo ==============================================
echo Pronto! 
echo A pasta "netlify_deploy" foi gerada com sucesso.
echo Basta arrastar essa pasta para o dashboard do Netlify!
echo ==============================================
pause
