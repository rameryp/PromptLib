# Deploying Prompt Library to a Digital Ocean Droplet

Yes, you can absolutely deploy this React application to a Digital Ocean Droplet. Since this is a **Single Page Application (SPA)** built with Vite, you will need a web server like **Nginx** to serve the static files and handle routing.

Here is the step-by-step guide.

## 1. Build the Application Locally
First, create the production build on your machine:
```bash
npm run build
```
This will create a `dist` folder containing your HTML, CSS, and JavaScript files.

## 2. Set up the Droplet
1.  Log in to Digital Ocean.
2.  Create a **Basic Droplet** (Ubuntu 22.04 or 24.04 is recommended).
3.  Select the **$6/month** plan (plenty for a static site).
4.  Choose your region.
5.  Add your SSH Key for access.

## 3. Configure the Server (SSH into Droplet)
Open your terminal and connect to your new IP address:
```bash
ssh root@YOUR_DROPLET_IP
```

### Install Nginx
```bash
sudo apt update
sudo apt install nginx -y
```

### Allow Firewall Access
```bash
sudo ufw allow 'Nginx Full'
```

## 4. Deploy Your Code
You need to move your local `dist` folder to the server. You can use `scp` (Secure Copy) from your **local terminal** (not inside the SSH session).

```bash
# Run this from your local project folder
scp -r dist/* root@YOUR_DROPLET_IP:/var/www/html/
```

## 5. Configure Nginx for React Router
By default, Nginx doesn't know how to handle React routes (like `/stats`). If you refresh the page on `/stats`, you will get a 404 error. We need to fix this.

1.  SSH back into your droplet.
2.  Open the default configuration:
    ```bash
    nano /etc/nginx/sites-available/default
    ```
3.  Find the `location /` block and change it to look exactly like this:

    ```nginx
    location / {
        try_files $uri $uri/ /index.html;
    }
    ```
    *This tells Nginx: "If a file exists, serve it. If not, serve index.html and let React handle the routing."*

4.  Save and exit (Ctrl+O, Enter, Ctrl+X).
5.  Test the configuration:
    ```bash
    nginx -t
    ```
6.  Restart Nginx:
    ```bash
    systemctl restart nginx
    ```

## 6. Access Your App
Visit `http://YOUR_DROPLET_IP` in your browser. Your app should be live!

## 7. (Optional) Add a Domain & SSL
1.  Point your domain's A record to your Droplet IP.
2.  Install Certbot for free HTTPS:
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    sudo certbot --nginx -d yourdomain.com
    ```

---

**Alternative Recommendation:**
Since this is a static site with no backend server (Firebase handles the backend), it is much easier and cheaper to use **Digital Ocean App Platform** (Static Site component) or **Vercel/Netlify**. You simply connect your GitHub repo, and they handle the build, SSL, and CDN automatically for free.
