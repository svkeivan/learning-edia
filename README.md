# Learning

A learning management platform built with Next.js, featuring course and module administration, assessment center functionality, and attendance tracking.

## Tech Stack

- **Next.js 16** – React framework with App Router
- **React 19** – UI library
- **Tailwind CSS 4** – Styling
- **TypeScript** – Type safety

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app redirects to the Assessment Center by default.

## Project Structure

- **`/admin`** – Admin dashboard
  - **Courses** – Course management and creation
  - **Modules** – Module management and creation
- **`/assessment-center`** – Assessment Center
  - **Attendance** – Attendance tracking
  - Assessments, grading, RPL requests, reports

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
