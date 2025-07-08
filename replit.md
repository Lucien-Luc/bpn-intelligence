# Corporate LLM - Document Intelligence Platform

## Overview

This is a full-stack Corporate LLM application that enables users to upload, index, and interact with documents through a chat interface. The system provides local document processing and AI-powered query capabilities for enterprise knowledge management.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: React Query for server state
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom CSS variables for theming

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Custom token-based authentication
- **File Processing**: Local file handling with metadata extraction

### Key Components

1. **Authentication System**
   - Token-based authentication with session management
   - User roles and permissions
   - Protected routes middleware

2. **Document Management**
   - File upload with type validation
   - Document indexing and processing pipeline
   - Storage quota management (2.5GB default per user)
   - Shared knowledge base for organization-wide documents

3. **Chat Interface**
   - Real-time messaging system
   - Document-aware AI responses
   - Source citation and reference tracking

4. **User Interface**
   - Responsive dashboard with analytics
   - Document library with search and filtering
   - Upload area with drag-and-drop support
   - Analytics and reporting pages

## Data Flow

1. **Document Upload**: Users upload files through the web interface
2. **Processing Pipeline**: Files are processed, indexed, and stored with metadata
3. **Query Processing**: User queries are processed against the indexed document corpus
4. **Response Generation**: AI generates responses with document citations
5. **Analytics**: System tracks usage patterns and performance metrics

## External Dependencies

- **Database**: Neon Database (PostgreSQL-compatible)
- **UI Components**: Radix UI primitives
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Font Awesome (referenced in components)
- **Date Handling**: date-fns library
- **Development**: Replit-specific plugins for development environment

## Deployment Strategy

The application is configured for deployment on Replit with:
- **Development**: `npm run dev` - runs with tsx and hot reload
- **Production Build**: `npm run build` - creates optimized client build and server bundle
- **Production**: `npm run start` - runs the built application
- **Database**: Uses Drizzle migrations with `npm run db:push`

The build process:
1. Vite builds the client-side React application
2. esbuild bundles the Express server for production
3. Static files are served from the `dist/public` directory
4. Server runs from `dist/index.js`

## Changelog

```
Changelog:
- July 08, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```