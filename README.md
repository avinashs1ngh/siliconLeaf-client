This repository contains the frontend code for the SiliconLeaf Task Manager App, a modern to-do application built with React. The client-side application provides a user-friendly interface for managing tasks with secure authentication.

Features:





User Authentication: Register and login pages using JWT-based authentication.



Task Management: Dashboard displaying tasks for the logged-in user, with forms to create and update tasks (title, description, status, due date).



Conditional Rendering: Ensures protected routes (e.g., dashboard) are accessible only to authenticated users.



Optional Enhancements (if implemented): State management with Redux or Context API, drag-and-drop task reordering, and deployment on platforms like Vercel or Netlify.

Tech Stack:





React



Axios for API calls



React Router for navigation



Tailwind CSS (or similar) for styling

Setup Instructions:





Clone the repository: git clone https://github.com/<your-username>/siliconLeaf-client.git



Install dependencies: npm install



Configure environment variables (e.g., API base URL).



Run the app: npm start

Note: This client app communicates with the backend hosted in the siliconLeaf-server repository.
