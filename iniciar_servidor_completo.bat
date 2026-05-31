@echo off
echo ========================================================
echo Iniciando o Servidor de Desenvolvimento Completo (Netlify)
echo ========================================================
echo.
echo Isso pode demorar alguns segundos na primeira vez...
echo O servidor estara rodando com suporte as funcoes do banco de dados!
echo Pressione Ctrl+C para encerrar.
echo.

:: O Netlify CLI vai emular perfeitamente o ambiente de produção
npx.cmd --yes netlify-cli dev

pause
