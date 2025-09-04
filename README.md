# ArcticAria

**ArcticAria: Your one-stop platform for life, study, and work.**

## What Problem Do We Solve?

Ever feel like life is a mess? Unsure what to do today? Get sidetracked and forget tasks halfway through? ArcticAria was born to solve these problems. We want to help you:

*   **Clear Your Mind, Focus on the Present**: Say goodbye to chaotic task lists. Clearly know which project you're working on and what the next step is.

*   **Manage Your Life, Forget About Forgetting**: Delegate unimportant but necessary recurring chores to our smart reminder system. Stop worrying about forgetting to pay bills or take out the trash.

*   **Find Joy, Balance Your Life**: In your spare time, let us help you discover new ways to relax and enjoy the beauty of life.

---

## Current Features

### ✅ Todos

Manage your daily tasks with a powerful and flexible to-do list. You can organize your tasks by categories such as **Work**, **Study**, **Life**, **Play**, and **Other**, or sort them by their time-based status, including **Overdue**, **Reminding**, **Upcoming**, and **Completed**. This helps you stay on top of your schedule and ensures nothing gets missed.

### 💬 Discuss

Join the conversation in the Discuss section! This is a public forum where you can share your thoughts and ideas about ArcticAria's current features and future development. We value your feedback and look forward to building a better app with your help. Future updates will include the ability to comment on and like posts.

## Future Vision

### 1. Career
This module is designed for project management and deep work/study. Whether you're preparing for final exams or developing a new project, it helps you systematically track your progress, so you always know how close you are to your goal.

*   **At-a-Glance Project Progress**: We will develop a homepage with a prominent progress bar and a **Deadline** feature, allowing you to see the overall progress at a glance.
*   **Granular Task Management**: You can create **Projects** and add tree-structured **Tasks** under each. Every task can have an estimated time (weight), priority, and deadline. Tasks approaching their deadline will be highlighted in different colors to ensure you never miss an important milestone.
*   **Distraction-Free Viewing**: We will also develop a separate detail page that allows you to view task content without entering edit mode, with support for simple Markdown for more complex notes.

**In short**: We want ArcticAria to be your powerful assistant for efficiently completing work and study projects.

### 2. Life Reminder
Do you, like me, get easily frustrated by trivial matters? Forgetting to check if you've used your credit card enough to waive the annual fee? Forgetting the monthly actions needed to maintain bonus interest rates for your bank accounts? Forgetting to cancel subscriptions before they renew? These seemingly insignificant things can be draining when they pile up.

The Life Reminder module is designed to solve this. We will create a clean list interface for all recurring daily tasks or one-off tasks months away. Just set the repetition frequency, and let the system handle the rest. We even plan to integrate weather forecasts to automatically remind you of the weather before you do your laundry, saving you the mental energy of checking it yourself.

**In short**: We want ArcticAria to be your thoughtful little helper for managing daily chores.

### 3. Discover
The Discover feature is the soul of ArcticAria and the one we're most excited to build. It's designed to solve the problem of not knowing what fun thing you want to do today. For me, leisure is often spontaneous, and I frequently want to find something fun on the fly.

This feature aims to help you make those impromptu decisions by recommending food, outings (like parks, museums, botanical gardens), shopping, movies, and anime. It's not just a content aggregator but a personalized inspiration library. For example, we plan to integrate weekly discount information from stores like McDonald's, Coles, and Woolworths, randomly displaying them in Discover so you can find little joys in life anytime, anywhere.

**In short**: We want ArcticAria to be your leisure assistant for exploring the joys of life.

---

## Join Us

ArcticAria is an open-source project, and its future depends on the collaboration of like-minded people. If you've ever been troubled by the problems mentioned above, then we are solving our own life's challenges together. You might wonder why we need a computer to solve such simple tasks. For me, once my focus is broken, it's hard to get back into a state of concentration. I genuinely need an assistant like this to handle these trivial matters so I can better dedicate myself to what's truly important.

### We are looking for contributors!

We are looking for developers who are passionate about life and technology to join us.

*   **Core Feature Developers**: If you have over 3 months of development experience and are interested in our core modules, we warmly welcome you. The core modules are technically challenging, and you will work with us to research and implement complex logic. We expect to need 2-5 partners for this.

*   **Entry-Level Developers**: If you're a beginner, don't worry! We have many peripheral features (like discussion forum comment likes, OAuth login, user avatar changes, password recovery, theme color switching, etc.) for you to practice on. These features have mature implementations on many websites, and with the help of AI tools, you can quickly master them and contribute to the project. This is an excellent opportunity for learning and practice.

If you are interested in our vision and project, welcome to join us and build this truly problem-solving application together.

## Technical Architecture

### Frontend

- Built with Vite + React and deployed on Cloudflare Pages.
- Features a CI/CD pipeline for automated builds and deployments.
- Utilizes responsive design principles for excellent compatibility across large desktop screens, medium-sized tablets, and small mobile devices.
- The UI is built with the Material-UI (MUI) library.
- Supports internationalization for both English and Chinese.

### Backend

- Deployed on Cloudflare Workers with D1 as the database.
- The backend is written in JavaScript.
- Adopts a microservices architecture, divided into three independent workers: `auth`, `todo`, and `blog`, which cooperate to deliver the application's functionality.

### Others

- Achieves high portability through well-structured configuration files.
- Includes a variety of scripts for initialization, development, debugging, and deployment, making it easy to set up your own repository.
- Primarily developed using Gemini AI tools to significantly enhance development efficiency.
