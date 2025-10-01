#!/bin/bash

# Script to check current Firebase project settings
echo "Current Firebase project:"
firebase use

echo -e "\nTo fix the unauthorized domain error:"
echo "1. Go to: https://console.firebase.google.com/project/task-tracker-8e573/authentication/settings"
echo "2. Scroll down to 'Authorized domains'"
echo "3. Click 'Add domain'"
echo "4. Add: task-tracker-ai.vercel.app"
echo "5. Optionally add: *.vercel.app (for preview deployments)"

echo -e "\nAfter adding the domain, your app should work on Vercel!"
