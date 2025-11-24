@echo off
echo Updating Local Database Schema...
cd backend
alembic upgrade head
echo.
echo Database update complete!
pause
