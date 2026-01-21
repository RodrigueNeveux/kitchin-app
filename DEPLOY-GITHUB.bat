@echo off
echo ========================================
echo    Deploiement GitHub - Kitch'In
echo ========================================
echo.

REM Aller dans le dossier Kitchin
cd /d "%~dp0"

echo [1/5] Initialisation de Git...
git init

echo.
echo [2/5] Ajout des fichiers...
git add .

echo.
echo [3/5] Creation du premier commit...
git commit -m "Initial commit - Application Kitch'In prête pour déploiement"

echo.
echo [4/5] Connexion au repository GitHub...
git remote add origin https://github.com/RodrigueNeveux/Kitchin.git

echo.
echo [5/5] Envoi vers GitHub...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo    TERMINE !
echo ========================================
echo.
echo Si GitHub demande un mot de passe :
echo - Utilisez un Personal Access Token
echo - Ou installez GitHub CLI : gh auth login
echo.
pause
