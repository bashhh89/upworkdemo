@echo off
echo Preparing Deliver AI for Netlify deployment...

:: Install dependencies
echo Installing dependencies...
call npm install

:: Build the project
echo Building the project...
call npm run build

:: Ensure netlify/functions directory exists
if not exist netlify\functions mkdir netlify\functions

:: Copy the production build to the out directory
echo Setting up for Netlify deployment...
if exist .next (
  :: Copy the Next.js build output
  if not exist out mkdir out
  xcopy /E /I /Y .next\static out\static
  xcopy /E /I /Y public\* out\
  
  :: Copy API routes to functions directory
  if not exist netlify\functions\api mkdir netlify\functions\api
  copy /Y netlify\functions\api.js netlify\functions\
)

:: Create redirects file for Netlify
echo Creating routing configuration...
echo # Netlify redirects > out\_redirects
echo /api/*  /.netlify/functions/api/:splat  200 >> out\_redirects
echo /*      /index.html                      200 >> out\_redirects

echo.
echo Project has been prepared for Netlify deployment.
echo You can now deploy the 'out' directory to Netlify.
echo. 