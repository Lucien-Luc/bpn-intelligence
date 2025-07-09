# BPN Intelligence - Business AI Assistant Platform

## Overview

This is a full-stack Business Intelligence application designed for BPN Rwanda (https://bpn.rw/) that enables users to upload, index, and interact with business documents through an AI-powered chat interface. The system provides local document processing and strategic business intelligence capabilities with a professional entrepreneur vibe for internal corporate operations.

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

3. **Business Intelligence Assistant**
   - Real-time business analysis and insights
   - Document-aware AI responses with strategic context
   - Source citation and business intelligence reporting

4. **User Interface**
   - Responsive dashboard with business analytics
   - Collapsible sidebar for better screen utilization
   - Document library with intelligent search and filtering
   - Upload area with drag-and-drop support
   - Professional entrepreneur-focused design with BPN branding

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
- July 08, 2025. Updated branding for BPN Rwanda with professional entrepreneur vibe
- July 08, 2025. Added collapsible sidebar functionality
- July 08, 2025. Customized AI assistant for business intelligence and strategic insights
- July 08, 2025. Redesigned login page with neuromorphic design matching BPN branding
- July 08, 2025. Created ChatGPT-like interface with dark sidebar and conversation history
- July 08, 2025. Updated main interface to use ChatGPT-style layout and interactions
- July 09, 2025. Added BPN logo to login page with link to www.bpn.rw
- July 09, 2025. Implemented comprehensive settings system with:
  - Agent fine-tuning (personality, creativity, verbosity, system prompts)
  - Advanced AI parameters (temperature, tokens, context window)
  - Knowledge base file upload and management
  - User preferences (notifications, language, timezone)
  - Security settings (2FA, session timeout, encryption)
  - Data management (export, clear knowledge base)
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Target audience: BPN Rwanda corporate users (https://bpn.rw/)
Design theme: Professional entrepreneur vibe with BPN turquoise branding
UI Features: ChatGPT-like interface, neuromorphic login design, collapsible dark sidebar
AI Assistant: Customized for business strategy and document analysis
```