# Snap2Serve
AI-Based Recipe Recommendation Web Application

# About the Project
This project is a web application that recommends cooking recipes based on ingredients available with the user and the time limit provided.
Users upload images of ingredients, and the system uses AI to detect them and generate suitable recipes using Large Language Models and an AI agent.
The application helps users save time, reduce food wastage, and make quick cooking decisions.

# Problem Statement
Users often find it difficult to decide what to cook with limited ingredients and time.
Existing platforms require manual ingredient input and lack intelligent personalization.
This project addresses these issues using image-based ingredient detection and AI-driven recipe generation.

# Technologies Used
Frontend: React.js<br>
Backend: Node.js, Express.js<br>
Database: MongoDB<br>
AI: Image recognition model, Large Language Models (LLMs), AI agent


# Working 
1.User uploads ingredient images and enters cooking time.<br>
2.AI detects ingredients from the images.<br>
3.An AI agent applies constraints such as time and preferences.<br>
4.LLM generates suitable recipes.<br>
5.Recipes are displayed to the user for selection and sharing.

# Features
-Image-based ingredient detection<br>
-Time-based recipe recommendation<br>
-AI-powered recipe generation<br>
-Multi-recipe comparison<br>
-Cuisine and regional adaptation<br>
-Step-by-step cooking mode<br>
-Voice-based instructions<br>
-Difficulty level indication<br>
-Dietary preference and allergy filtering<br>
-Favorites, history, and recipe sharing<br>

# Advantages
-Saves time and effort<br>
-Reduces food wastage<br>
-Personalized recommendations
-Easy and user-friendly interface

## Stakeholders of Snap2Serve

### 1. End Users (Home Cooks / Students / Working Professionals)
**Role:** Primary users of the application  

**Interests:**
- Want quick recipe suggestions  
- Use limited ingredients efficiently  
- Save cooking time and reduce food wastage  

**Interactions:**
- Upload ingredient images  
- Enter available cooking time  
- View, save, and share recommended recipes  
- Use voice-based and step-by-step cooking modes  

---

### 2. AI System (Image Recognition + LLM + AI Agent)
**Role:** Core intelligence of the application  

**Interest:** Accurate ingredient detection and recipe recommendation  

**Interactions:**
- Image recognition model detects ingredients from uploaded images  
- AI agent applies constraints such as cooking time and user preferences  
- Large Language Model (LLM) generates suitable recipes  

---

### 3. Application Developers
**Role:** Designers and builders of Snap2Serve  

**Interests:**
- System performance  
- Accuracy of recommendations  
- Scalability of the application  

**Interactions:**
- Develop frontend and backend components  
- Integrate AI and ML models  
- Maintain and enhance application features  

---

### 4. System Administrator
**Role:** Maintains the application  

**Interest:** Smooth operation and system reliability  

**Interactions:**
- Manages servers and databases  
- Monitors system errors and uptime  
- Handles security patches and updates  

---

### 5. Database (MongoDB) – Technical Stakeholder
**Role:** Data storage system  

**Interest:** Secure and efficient data handling  

**Interactions:**
- Stores user profiles and preferences  
- Maintains favorites, history, and recipe data  
- Supports personalized recommendations  

---

### 6. Cloud / Hosting Service Provider
**Role:** Infrastructure provider  

**Interest:** Application availability and performance  

**Interactions:**
- Hosts frontend, backend, and AI services  
- Manages deployment and scalability  
- Ensures reliable access to the application  

---

### 7. Admin / Moderator (Optional)
**Role:** Content and system oversight  

**Interest:** Quality control and user experience  

**Interactions:**
- Monitors application usage  
- Manages flagged content or issues  
- Updates recipes or AI rules when required  

## Roles & Interactions (Digital Pumpkin Model)

The Digital Pumpkin Model represents the system as a layered digital ecosystem where each stakeholder (human and technical) interacts with the core AI system to deliver value to the end user.

---

### 1. End User (Home Cook / Student / Working Professional)
**Role:** Consumer of the service  

**Interactions:**
- Uploads images of available ingredients
- Enters cooking time and preferences
- Receives AI-generated recipe recommendations
- Uses step-by-step and voice-based cooking instructions
- Saves, shares, and revisits favorite recipes

---

### 2. Frontend (React.js)
**Role:** User interaction layer  

**Interactions:**
- Collects user inputs (images, time, preferences)
- Displays detected ingredients and recommended recipes
- Provides interactive cooking modes and UI feedback
- Sends user requests to the backend API

---

### 3. Backend Server (Node.js + Express.js)
**Role:** Control and communication layer  

**Interactions:**
- Receives requests from the frontend
- Communicates with AI models and agents
- Applies business logic and validation
- Fetches and stores data in the database
- Returns processed results to the frontend

---

### 4. Image Recognition Model
**Role:** Perception layer  

**Interactions:**
- Processes uploaded ingredient images
- Identifies and extracts ingredient information
- Sends detected ingredients to the AI agent

---

### 5. AI Agent
**Role:** Decision-making layer  

**Interactions:**
- Applies constraints such as cooking time, dietary preferences, and difficulty level
- Filters and prioritizes recipe options
- Coordinates with the LLM for final recipe generation

---

### 6. Large Language Model (LLM)
**Role:** Intelligence and content generation layer  

**Interactions:**
- Generates detailed recipes based on detected ingredients and constraints
- Provides step-by-step cooking instructions
- Adapts recipes to regional cuisine and user preferences

---

### 7. Database (MongoDB)
**Role:** Data persistence layer  

**Interactions:**
- Stores user profiles, preferences, and history
- Maintains favorite and shared recipes
- Supports personalization and recommendation continuity

---

### 8. System Administrator / Developer
**Role:** Maintenance and optimization layer  

**Interactions:**
- Monitors system performance and uptime
- Updates AI models and application features
- Manages security, scalability, and bug fixes

---

### Digital Pumpkin Flow Summary
1. User initiates request via the frontend.
2. Backend coordinates with image recognition and AI components.
3. AI agent and LLM generate personalized recipes.
4. Results are stored and delivered back to the user.
5. Continuous feedback improves personalization and performance.
