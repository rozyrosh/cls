@echo off
echo Starting CLICK4CLASS Online Class Booking System...
echo.

echo Installing backend dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

echo Installing frontend dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

echo.
echo Starting backend server...
cd ..\server
start "Backend Server" cmd /k "npm run dev"

echo.
echo Starting frontend server...
cd ..\client
start "Frontend Server" cmd /k "npm start"

echo.
echo Application is starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul 