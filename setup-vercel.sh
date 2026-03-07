#!/bin/bash

# Setup environment files for Vercel deployment

echo "Setting up environment files..."

# Create frontend .env.production
cat > frontend/.env.production << 'EOF'
# Replace YOUR_BACKEND_URL with your actual Vercel backend URL
REACT_APP_API_URL=https://YOUR_BACKEND_URL/api/todos
EOF

echo "✅ Created frontend/.env.production"
echo "   Please update the URL in this file with your Vercel backend URL"

# Display helpful info
echo ""
echo "📋 Environment Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update frontend/.env.production with your backend Vercel URL"
echo "2. Commit and push to GitHub:"
echo "   git add frontend/.env.production backend/.env.example frontend/.env.example"
echo "   git commit -m 'Add environment configuration for Vercel deployment'"
echo "   git push origin main"
echo ""
echo "3. Deploy to Vercel following VERCEL_DEPLOYMENT.md guide"
echo ""
