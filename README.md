# Video Sharing Desktop Application

A cross-platform desktop application built with Electron and React for screen recording and video sharing. This application works in conjunction with a web platform for seamless video content management.

## 🚀 Features

- **Screen Recording**
  - High-quality screen capture (720p and 1080p)
  - Audio device selection
  - Custom preset configurations
  - Real-time preview
  - Configurable recording duration based on subscription plan

- **Authentication**
  - Secure user authentication via Clerk
  - Seamless integration with web platform accounts

- **Device Management**
  - Multiple screen source selection
  - Audio input device selection
  - Webcam support
  - Device preset saving

- **Cross-Platform Support**
  - Windows
  - macOS
  - Linux

## 🛠️ Tech Stack

- **Framework**: Electron + React
- **Language**: TypeScript
- **UI Components**: Radix UI + Tailwind CSS
- **Authentication**: Clerk
- **State Management**: React Query
- **Real-time Communication**: Socket.IO
- **Build Tools**: Vite
- **Form Handling**: React Hook Form + Zod

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/video-sharing-desktop-app.git
cd video-sharing-desktop-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with required environment variables:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_HOST_URL=http://localhost:3000/api
VITE_APP_URL=http://localhost:5173
VITE_SOCKET_URL=http://localhost:5000
```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

## 🏗️ Building

### Windows
```bash
npm run build:win
```

### macOS
```bash
npm run build:mac
```

### Linux
```bash
npm run build:linux
```

### All Platforms
```bash
npm run build:all
```

## 📁 Project Structure

- `/src` - Application source code
  - `/components` - React components
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions and helpers
  - `/layouts` - Layout components
  - `/types` - TypeScript type definitions
  - `/schemas` - Zod validation schemas

- `/electron` - Electron main process code
  - `main.ts` - Main process entry
  - `preload.ts` - Preload scripts

## 🔒 Security

- Uses contextBridge for secure IPC communication
- Implements proper permission handling for device access
- Secure authentication flow with Clerk

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project was created for learning purposes, inspired by Web Prodigies https://www.youtube.com/watch?v=3R63m4sTpKo


## 👤 Author

Omkar D

## 👨‍💻 Author

Omkar Dongre
- Email: omkardongre5@gmail.com

## 🙏 Acknowledgments

- Electron team for the amazing framework
- Radix UI for the component library
- Clerk for authentication services
