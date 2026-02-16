@echo off
chcp 65001 >nul
echo ========================================
echo   Correction du submodule - Kitch'in
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Verification de Git...
git status
if errorlevel 1 (
    echo ERREUR: Ce dossier n'est pas un depot Git.
    pause
    exit /b 1
)

echo.
echo [2/4] Suppression de l'ancienne remote...
git remote remove origin 2>nul

echo.
echo [3/4] Ajout de la nouvelle remote (kitchin-app)...
git remote add origin https://github.com/RodrigueNeveux/kitchin-app.git

echo.
echo [4/4] Push vers le nouveau depot...
git push -u origin main

if errorlevel 1 (
    echo.
    echo   ECHEC: Cree d'abord le depot "kitchin-app" sur https://github.com/new
    echo   Puis relance ce script. Voir DEPLOIEMENT.md
) else (
    echo.
    echo   SUCCES ! Sur Netlify: Import - kitchin-app - Deploy.
)

echo.
pause
