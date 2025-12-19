# Deploying Prompt Library to Vercel

Vercel is the easiest way to deploy Vite/React applications. Use one of the two methods below.

## Method 1: Git Integration (Recommended for Long Term)
This method automatically redeploys your app whenever you push changes to GitHub.

1.  **Push your code to GitHub**
    - Create a new repository on GitHub.
    - Run the following in your terminal:
      ```bash
      git init
      git add .
      git commit -m "Initial commit"
      git branch -M main
      git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
      git push -u origin main
      ```

2.  **Connect Vercel to GitHub**
    - Go to [vercel.com](https://vercel.com) and sign up/login.
    - Click **"Add New..."** -> **"Project"**.
    - Select your GitHub repository and click **Import**.

3.  **Configure & Deploy**
    - **Framework Preset**: Vercel should auto-detect "Vite".
    - **Environment Variables**: Open the "Environment Variables" section and add your Firebase config keys here (copy them from your `.env` or `firebase-config.js`):
        - `VITE_FIREBASE_API_KEY`
        - `VITE_FIREBASE_AUTH_DOMAIN`
        - `VITE_FIREBASE_PROJECT_ID`
        - etc...
    - Click **Deploy**.

## Method 2: Vercel CLI (Fastest for Quick Testing)
This uploads your local code directly to Vercel without needing GitHub properly set up yet.

1.  **Install Vercel CLI**
    ```bash
    npm install -g vercel
    ```

2.  **Login**
    ```bash
    vercel login
    ```

3.  **Deploy**
    Run the deploy command from your project root:
    ```bash
    vercel
    ```
    - Follow the prompts (Set up and deploy? **Y**, Scope? **[Enter]**, Link to existing project? **N**, Project Name? **[Enter]**, Directory? **./**).
    - It will give you a "Preview" URL.

4.  **Deploy to Production**
    To overwrite the main domain:
    ```bash
    vercel --prod
    ```

## React Router Configuration (Important)
Vercel typically handles SPA routing automatically for Vite. However, if you experience "404 Not Found" errors when refreshing pages like `/stats`, add a `vercel.json` file to your root directory:

**vercel.json**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
This ensures all traffic goes to your React app so it can handle the routing.
