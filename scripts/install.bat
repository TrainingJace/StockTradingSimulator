@echo off

echo Installing dependencies...
call npm install
echo Dependencies installation finished.

echo.
set /p DB_PASSWORD="Please enter your MySQL root password: "

echo.
echo Creating .env file...
copy "..\\.env.example" "..\\.env"
powershell -Command "(Get-Content '..\\.env') -replace 'DB_PASS=', 'DB_PASS=%DB_PASSWORD%' | Set-Content '..\\.env'"

echo.
echo Installation completed!
pause