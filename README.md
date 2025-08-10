# colorboard

a collaborative, singular whiteboard with a reset timer

## Features

- Live Collaborative Drawing
- 3 Rerolls to choose your brush color
- 5-minute reset timer by default
- Live cursors with usernames
- Online user count

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/BananaJeanss/colorboard.git
   ```
2. Navigate to the project directory:
   ```bash
   cd colorboard
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

4. Clone .env.example to .en and setup the port you want to run the server on:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to set your desired port, e.g., `PORT=3000`.

5. Start the server:
   ```bash
   npm run start
   ```

6. Open your browser and go to `http://localhost:3000` to access the whiteboard.

