@echo off
rem Laptop render benchmark. Finds the installed Blender, runs bench_eevee.py headless, writes results into this folder only.
setlocal
set "B="
for /d %%D in ("%ProgramFiles%\Blender Foundation\Blender*") do if exist "%%D\blender.exe" set "B=%%D\blender.exe"
if not defined B if exist "%ProgramFiles(x86)%\Steam\steamapps\common\Blender\blender.exe" set "B=%ProgramFiles(x86)%\Steam\steamapps\common\Blender\blender.exe"
if not defined B for /f "delims=" %%P in ('where blender 2^>nul') do set "B=%%P"
if not defined B (
  echo BLENDER NOT FOUND> "%~dp0bench_result.txt"
  echo Could not find blender.exe. Tell Claude where Blender is installed.
  pause
  exit /b 1
)
echo Using %B%
echo Rendering test frames, about 2 to 10 minutes. Leave this window open.
"%B%" -b --factory-startup -P "%~dp0bench_eevee.py" > "%~dp0bench_log.txt" 2>&1
echo Done. Results are in bench_result.txt. You can close this window.
pause
