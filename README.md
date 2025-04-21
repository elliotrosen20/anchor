# Anchor: Your AI OCD Companion

A full-stack web application that provides a voice- and text-based conversational interface for individuals experiencing obsessive-compulsive thoughts. Built to explore the use of AI in mental health support tools, this app uses modern frontend frameworks, authentication, real-time databases, and multiple AI APIs to create a seamless, responsive user experience.

---

## Demo

Live App: *anchor-iel2.vercel.app*

---

## Features

- Voice and text chat interface with persistent history
- AI-generated responses using OpenAI API
- Voice-to-text input via Google Cloud Speech-to-Text
- Text-to-speech playback using ElevenLabs API
- User authentication with Supabase
- Fully responsive UI using Tailwind CSS and Next.js App Router

---

## Tech Stack

- **Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS
- **Auth & Database:** Supabase (PostgreSQL, Auth)
- **AI & Audio:**
  - OpenAI API (response generation)
  - Google Cloud Speech-to-Text
  - ElevenLabs Text-to-Speech
- **Deployment:** Vercel

---

## Project Structure

```
.
├── app
│   ├── chat             # Main chat interface
│   ├── api              # API routes for chat and transcription
│   ├── components       # UI components
│   ├── login/signup     # Auth pages
│   └── ...
├── lib                  # Utility functions
├── public               # Static assets
├── middleware.ts        # Middleware for route protection
├── next.config.ts       # Next.js config
├── google-credentials.json # STT credentials
└── ...
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-ocd-companion.git
cd ai-ocd-companion
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with the following:

```
OPENAI_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
ELEVENLABS_API_KEY=your_key
```

Place your `google-credentials.json` file in the root of the project.

### 4. Run the Development Server

```bash
npm run dev
```

App will be available at `http://localhost:3000`.

---

## Future Improvements

- Journaling and sentiment tracking
- Mobile experience optimizations
- Internationalization support
- Integration tests and coverage

---

## License

[MIT](./LICENSE)