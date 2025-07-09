# BPN Corporate Assistant - Internal Operations Support System

## Overview

This is a full-stack corporate assistant application designed for BPN Rwanda employees (https://bpn.rw/) that enables internal teams to upload, organize, and interact with corporate documents through an AI-powered chat interface. The system supports BPN's core operations including business coaching programs, seminar management, partnership development, and access to finance initiatives. It serves BPN employees (not entrepreneurs) in their daily corporate tasks.

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

3. **Corporate Operations Assistant**
   - Support for BPN coaching programs and entrepreneur management
   - Document analysis for internal operations and reporting
   - Assistance with seminar planning, partnership development, and administrative tasks

4. **User Interface**
   - Responsive dashboard with corporate operations analytics
   - Collapsible sidebar for better screen utilization
   - Document library for internal materials and coaching resources
   - Upload area for corporate documents and training materials
   - Professional corporate design with BPN branding for internal staff

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
- July 09, 2025. Refocused application for BPN Rwanda corporate employees:
  - Researched BPN's business model (coaching, training, networking, access to finance)
  - Updated AI assistant to support internal operations, not entrepreneurs
  - Customized specializations for coaching programs, seminar planning, partnerships
  - Modified conversation examples and system prompts for corporate use
- July 09, 2025. Implemented Microsoft Graph API integration:
  - Added Azure Active Directory authentication for @bpn.rw domain users
  - Created admin approval system for new user access requests  
  - Built Microsoft Graph service for OneDrive and SharePoint file access
  - Added database schema for Microsoft tokens, user approvals, and file tracking
  - Integrated LLM server status monitoring and communication endpoints
  - Updated login page with Microsoft Sign-in option
  - Created comprehensive admin panel for managing user access requests
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Target audience: BPN Rwanda corporate employees (not entrepreneurs)
Organization focus: Business coaching, training, networking, access to finance programs
Design theme: Professional corporate design with BPN turquoise branding
UI Features: ChatGPT-like interface, neuromorphic login design, collapsible dark sidebar
AI Assistant: Customized for BPN internal operations - coaching program support, seminar management, partnership development, administrative tasks
```