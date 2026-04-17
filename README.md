# Bare Beauty Frontend 🌿✨
A gorgeous, modern eCommerce experience featuring AI Skin Advising, Shopping Cart integration, and dynamic catalog structures built on HTML/CSS/Vanilla JS.

## 🚀 How to Run the Project Locally
If you are cloning this repository (or copying the code), this frontend connects to a **Node.js Express Backend** to pull actual products, process shopping carts, and trigger AI Routines.

**Step 1:** Start the Backend
You must also clone and run the backend server on your local machine so the frontend has data to fetch!
1. Download the backend project and open your terminal.
2. Run `npm install` to install dependencies.
3. Run `npm run seed` to populate your local MongoDB with all the products.
4. Run `npm run dev` to start the API (It will run on `http://localhost:5001`).

**Step 2:** Start the Frontend
1. Open this (`bare-beauty-frontend`) folder in an IDE like **VS Code**.
2. Install the **"Live Server"** extension in VS Code.
3. Right-click on `index.html` and click **"Open with Live Server"**.
4. The site will open in your browser (typically on `http://localhost:5500`) and the UI will now securely communicate with your local backend! 

From there, all features including the AI Advisor, Login portals, and Cart Checkout will function natively!
