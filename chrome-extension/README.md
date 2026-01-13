# Kolekta Chrome Extension

Save bookmarks to your Kolekta account with one click.

## Installation

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `chrome-extension` folder

## Setup

1. Open the Kolekta web app and go to **Settings**
2. Under **API Tokens**, click **Generate API Token**
3. Copy the generated token (it won't be shown again!)
4. Click the Kolekta extension icon in Chrome
5. Paste your API token
6. Click **Connect**

That's it! Your account is now linked.

## Usage

1. Navigate to any webpage you want to bookmark
2. Click the Kolekta extension icon
3. Optionally select a group from the dropdown
4. Click **Save Bookmark**

## Features

- One-click bookmark saving
- Group selection
- Automatic page info extraction (title, favicon)
- Dark mode support
- Secure API token authentication (no password needed!)

## Configuration

The extension connects to the production server. To change the server URL (e.g., for development), edit the `API_BASE_URL` constant at the top of `popup.js`:

```javascript
const API_BASE_URL = 'https://kolekta.vercel.app';
```

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Popup UI structure
- `popup.css` - Styles
- `popup.js` - Logic and API client
- `icons/` - Extension icons

## Development

To regenerate icons:

```bash
node generate-icons.js
```

## API Endpoints Used

- `GET /api/extension/validate` - Validate API token
- `GET /api/extension/groups` - Fetch user's groups
- `POST /api/extension/bookmark` - Save a bookmark
