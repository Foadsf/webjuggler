<div align="center">

![GPLv3](https://www.gnu.org/graphics/gplv3-or-later.png)

# WebJuggler

**A web-based project management tool with Kanban, Gantt, and PERT visualizations**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [License](#license)

</div>

## About

WebJuggler is a modern, browser-based project management application designed to visualize and manage tasks using multiple project management methodologies. It parses TaskJuggler (.tjp) files and provides interactive visualizations including Kanban boards, Gantt charts, and PERT network diagrams.

## Features

- **📋 Kanban Board**: Drag-and-drop task management with To Do, In Progress, and Done columns
- **📅 Gantt Chart**: Interactive timeline visualization with drag-to-reschedule functionality
- **🕸️ PERT Diagram**: Network graph visualization of task dependencies using D3.js
- **📁 TaskJuggler Support**: Import and parse .tjp project files directly
- **⚡ Modern Stack**: Built with React, TypeScript, Vite, and Tailwind CSS
- **🎨 Responsive Design**: Clean, intuitive interface with smooth animations

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Foadsf/webjuggler.git
   cd webjuggler
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys if needed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

### Loading a Project

1. Click **"Open .tjp File"** in the sidebar
2. Select your TaskJuggler project file
3. The tasks will automatically populate all three views

### Switching Views

Use the sidebar navigation to switch between:
- **Kanban**: Move tasks between columns by dragging
- **Gantt**: Drag task bars to reschedule
- **PERT**: Drag nodes to rearrange the dependency network

### Keyboard Shortcuts

- **Ctrl + Shift + D**: Toggle Debug Console
- Drag and drop supported across all views

## Debug Logging

WebJuggler includes a comprehensive diagnostic logging infrastructure to assist with development and troubleshooting.

### Features

- **Real-time UI Console**: View color-coded logs directly in the browser
- **Dual Output**: Logs are mirrored to the browser console and can be exported to JSON
- **Granular Filtering**: Filter by log level (Debug, Info, Warn, Error, Fatal) or source component
- **Automatic Redaction**: Sanitizes sensitive data like local file paths and API keys
- **Error Boundaries**: Captures and logs React component crashes with full stack traces and context
- **Performance Monitoring**: Tracks render durations and D3 simulation performance

### Configuration

Control logging behavior via `.env.local`:

```env
VITE_DEBUG_MODE=false      # Set to true to enable verbose logging in production
VITE_LOG_LEVEL=info        # Minimum level to capture (debug, info, warn, error)
VITE_LOG_MAX_ENTRIES=1000  # Number of entries to keep in the circular buffer
```

## Building for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either **version 3 of the License**, or **(at your option) any later version**.

This program is distributed in the hope that it will be useful, but **WITHOUT ANY WARRANTY**; without even the implied warranty of **MERCHANTABILITY** or **FITNESS FOR A PARTICULAR PURPOSE**. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

### Third-Party Licenses

This project uses the following open-source libraries:
- React (MIT License)
- Vite (MIT License)
- Tailwind CSS (MIT License)
- D3.js (ISC License)
- date-fns (MIT License)
- Lucide React (ISC License)

See the [LICENSE](LICENSE) file for the full GPL v3 text.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- PERT visualization powered by [D3.js](https://d3js.org/)

---

<div align="center">

**[⬆ Back to Top](#webjuggler)**

Made with ❤️ for the project management community

</div>