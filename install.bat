@echo off

echo Installing dependencies...
call npm run install:all
echo Dependencies installation finished.

echo.
set /p DB_PASSWORD="Please enter your MySQL root password: "

echo.
echo Creating .env file...
copy server\.env.example server\.env
powershell -Command "(Get-Content server\.env) -replace 'DB_PASS=', 'DB_PASS=%DB_PASSWORD%' | Set-Content server\.env"

echo.
echo Installation completed!
pause
