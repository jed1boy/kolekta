# kolekta

Collect. Organize. Discover.

`kolekta` is a minimalist bookmarking application built for speed, privacy, and visual elegance.

## Features

- **Quick Save**: Instant bookmarking via URL.
- **Collections**: Group links into searchable collections.
- **Auto-Metadata**: Automated fetching of page titles and favicons.
- **Private**: Secure authentication via Better-Auth.
- **Keyboard First**: Comprehensive shortcut support for navigation and management.
- **Extension**: Dedicated Chrome extension for seamless integration.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: SQLite / LibSQL via Prisma
- **Auth**: Better-Auth
- **API**: oRPC
- **Runtime**: Bun

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)

### Installation

1. Clone the repository and navigate to the directory.
2. Configure credentials:
   ```bash
   cp .env.example .env.local
   ```
3. Boot the development environment:
   ```bash
   bun run dx
   ```

## License

MIT © [kolekta](https://github.com/jed1boy)
