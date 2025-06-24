# Notion Graph Viewer

This project provides a Next.js-based front-end that displays Notion pages in a graphical view. The application requires setting up a backend server alongside the front-end for full functionality.

## Technologies

- **Node.js**: JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Next.js**: A React framework for building server-side rendering and static web applications.
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.

## Prerequisites

Before you begin, ensure you have Node.js(NVM) and Make, installed on your system. This project uses make and pnpm and Notion for managing dependencies and scripts, so make sure these tools are also installed. You'll need a Notion Integration to fill the `.env` for front-end mainly.

### Notion Integration

To integrate Notion with this project, create a Notion integration and note down the integration token. You'll need to fill up in the `.envs`:

[Link to create a Notion Integration](https://www.notion.so/profile/integrations)


### Install Make and PNPM
You can install make and pnpm using the following commands:

```bash
sudo apt-get install make
npm install -g pnpm
```

### Docker

Using Docker is optional, but it simplifies the setup process. You can just install the dependencies by yourself using following command:


```bash
make install_deps
```

### Setting Up Environment Variables (Required)

Duplicate the .env.example file for both the Server and Front-end projects. Rename the duplicated files to .env and fill in with your own data.


## Getting Started

You'll need to have Make installed to run it easier, but you can run by yourself using docker composes.

Following commands:

```bash
# Download all pnpm packages and up all containers
make run-all

# Run only the containers
make run-dev

# Install only dependecies
make install-all-deps
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the front-end.

## Redis Integration

The front-end application leverages Redis for caching and session management, ensuring fast access to frequently used data. Redis is configured through environment variables, allowing for flexible deployment and scaling. The integration with Redis enhances performance by reducing database queries and providing quick data retrieval.

## WebSocket Integration

WebSocket is used in the front-end to enable real-time updates and communication with the backend server. This integration supports live data streaming and instant notifications, providing a dynamic user experience. The WebSocket setup is configured to handle multiple client connections, ensuring efficient and reliable data transmission. Libraries used for WebSocket communication are included in the project dependencies, facilitating seamless integration.