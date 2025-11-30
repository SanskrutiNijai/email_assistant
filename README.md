# AI Email Assistant
This project is a powerful, full-stack application designed to boost productivity by integrating AI-powered email summarization and reply generation directly into the Gmail interface via a Chrome Extension. It leverages the Gemini API for natural language processing and is backed by a robust Spring Boot microservice.

### ✨ Project Overview
| Component        | Technology                   | Description                                                                                                                  |
| ---------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Backend API      | Java, Spring Boot            | Securely handles all requests, manages communication with the Gemini API, and provides the core logic for AI functions.      |
| Client Extension | JavaScript (Content Script)  | Injects custom UI buttons into Gmail's compose/reply windows, captures email content, and sends requests to the Backend API. |
| Demo Web App     | ReactJS, Tailwind CSS        | A standalone application used for testing and showcasing the API's functionality independently of the extension.             |

### 🔗 Deployed Link
👉 [https://emailassistant-aj9t.onrender.com/](https://emailassistant-aj9t.onrender.com/)

<img width="1631" height="699" alt="Screenshot 2025-12-01 001118" src="https://github.com/user-attachments/assets/79b3a56f-78ba-45f0-ad1b-bd90782e3c22" />

<img width="1627" height="726" alt="Screenshot 2025-12-01 001309" src="https://github.com/user-attachments/assets/610dce7a-3593-477b-a5a1-9960e9e89ed9" />

<img width="1919" height="965" alt="Screenshot 2025-12-01 002010" src="https://github.com/user-attachments/assets/0a3a3cf0-3a06-42a2-bd60-fdda61f8f237" />

<img width="1918" height="909" alt="Screenshot 2025-12-01 002030" src="https://github.com/user-attachments/assets/3a14e113-c40f-4ff9-bc2a-1db918981970" />

## 🚀 Features
- Implemented a full-stack, AI-powered email management solution, consisting of a secure Spring Boot REST API and a client-side Gmail extension, designed to enhance user productivity in real-time.
- Maximized the utility of the Gemini API to automate the generation of professional email replies and concise summaries directly within the Gmail compose window, boosting email response time by an estimated 60%.
- Innovated the development and injection of custom UI elements (AI Reply and Summarize buttons) into the native Gmail interface using Content Scripts, providing a seamless, one-click execution environment.
- Orchestrated the backend architecture to streamline data flow between the web service and the AI, centralizing error management for consistent and reliable service delivery.
- Developed a dedicated, responsive web application for real-time testing and showcasing of all AI features.

## 📦 Installation and Setup

Chrome Extension Setup (Developer Mode)
Since the extension is not deployed to the Chrome Web Store, you must load it manually via Developer Mode.
1. Download/Locate Source: Ensure you have the extension source folder containing manifest.json, content.js, etc.
2. Open Extensions: Navigate to chrome://extensions in your Chrome or Edge browser.
3. Enable Developer Mode: Toggle the Developer mode switch (usually located in the top right corner).
4. Load Unpacked: Click the Load unpacked button.
5. Select Folder: Select the local directory containing the extension files.

Once loaded, the extension icon should appear, and the two AI buttons (AI Reply and Summarize) will be injected into the compose window on mail.google.com after a slight delay.
