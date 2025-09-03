# ArcticAria

ArcticAria is a personal life assistant designed to help you organize your daily life, discover new experiences, and share your ideas. It combines task management with personalized recommendations to create a seamless and productive experience.

## Features

### 📝 Todos
Manage your daily tasks with a powerful and flexible to-do list. You can organize your tasks by categories such as **Work**, **Study**, **Life**, **Play**, and **Other**, or sort them by their time-based status, including **Overdue**, **Reminding**, **Upcoming**, and **Completed**. This helps you stay on top of your schedule and ensures nothing gets missed.

### 🗺️ Discover
Explore a world of new experiences with the Discover feature. Get recommendations for **food**, **outings** (like parks, museums, and natural landscapes), and **shopping**. Let ArcticAria know what you think by:
- Adding items to your recommendation list.
- Liking an item but snoozing it for later.
- Disliking an item.
Your feedback helps ArcticAria learn your preferences and provide smarter, more personalized suggestions over time. (Note: This feature is currently under development).

### 💬 Discuss
Join the conversation in the Discuss section! This is a public forum where you can share your thoughts and ideas about ArcticAria's current features and future development. We value your feedback and look forward to building a better app with your help. Future updates will include the ability to comment on and like posts.

## Technical Architecture

### Frontend
*   Built with Vite + React and deployed on Cloudflare Pages.
*   Features a CI/CD pipeline for automated builds and deployments.
*   Utilizes responsive design principles for excellent compatibility across large desktop screens, medium-sized tablets, and small mobile devices.
*   The UI is built with the Material-UI (MUI) library.
*   Supports internationalization for both English and Chinese.

### Backend
*   Deployed on Cloudflare Workers with D1 as the database.
*   The backend is written in JavaScript.
*   Adopts a microservices architecture, divided into three independent workers: `auth`, `todo`, and `blog`, which cooperate to deliver the application's functionality.

### Others
*   Achieves high portability through well-structured configuration files.
*   Includes a variety of scripts for initialization, development, debugging, and deployment, making it easy to set up your own repository.
*   Primarily developed using Gemini AI tools to significantly enhance development efficiency.
