# RaspberryDay Project

## 1. Project Overview

### 1.1 Context
Following the discontinuation of the Sunday Box commercial service, this project aims to recreate a similar system using a Raspberry Pi as an open-source alternative. The system will enable simplified sharing of family photos and videos on a television, primarily targeting users who are not tech-savvy.

### 1.2 Objectives
- Create a simple solution allowing family members to send media from their smartphones
- Automatically display these media on a television via a Raspberry Pi
- Ensure an intuitive user experience, especially for seniors
- Develop a fully open-source and self-hosted solution

## 2. Technical Architecture

### 2.1 Required Hardware
- Raspberry Pi 5 (recommended for video performance) or Pi 4 (8GB)
- External SSD (recommended for performance and durability)
- Raspberry Pi case
- HDMI cable
- Power adapter
- TV remote control (to control media scrolling and navigation)

### 2.2 Software and Technologies
- Operating System: Raspberry Pi OS (64-bit)
- Central backend server: Node.js or PHP
- Database: MariaDB
- TV Frontend: Chromium in kiosk mode (HTML5/CSS/JavaScript)
- Mobile Application: Progressive Web App (PWA) for smartphone access
- Communication Protocols: HTTPS, WebSockets for real-time notifications
- Storage: Local on SSD connected to the Raspberry Pi

## 3. Main Features

### 3.1 TV Interface
- Automatic launch of Chromium in kiosk mode on Raspberry Pi startup
- Media display in slideshow/gallery mode
- Chronological organization of media
- Visual notifications upon receiving new media
- Simplified navigation using the TV remote control to:
  - Control media scrolling
  - Move to next/previous image
  - Access main functions

### 3.2 Mobile Application (PWA)
- Progressive Web App as the entry point for smartphones
- Simplified family member authentication
- Interface to capture/select photos/videos
- Add captions and comments to media
- Media categorization (events, holidays, etc.)
- Confirmation notifications upon sending
- Option for immediate or scheduled broadcasting
- Installable on smartphone home screens

### 3.3 Administration
- Web-based administration interface
- User and permission management
- Display settings configuration
- Content moderation if necessary
- Monitoring of disk space and other resources

## 4. Detailed Technical Specifications

### 4.1 Client-Server Architecture
- Central Server:
  - Backend developed in Node.js or PHP
  - MariaDB database for metadata storage
  - RESTful API for media upload and retrieval
  - Secure authentication system (JWT)
  - Automatic image and video resizing/optimization
  - Real-time notification service
  - File system organized by date/category
  - Automatic deletion of old media based on defined rules

- Raspberry Pi Client:
  - Communication with central server via API
  - Local storage on SSD for performance and reliability
  - Chromium in kiosk mode for media display
  - TV remote control input management

### 4.2 TV Frontend (Chromium)
- Chromium in kiosk mode for full-screen display
- Clean interface adapted for remote viewing
- Smooth transitions between media
- Configurable media rotation timing
- Programmable screensaver/sleep mode
- Display of metadata (sender, date, caption)
- TV remote control event handling:
  - Directional buttons for navigation
  - OK/Enter buttons for selection
  - Previous/Next buttons to change media
  - Volume buttons to control media with sound

### 4.3 Mobile Application (PWA)
- PWA hosted on the central server
- Installable on smartphone home screens (iOS/Android)
- Responsive design for various devices
- Media compression before upload
- Offline mode with later synchronization
- Media preview before sending
- Upload history
- Push notifications for confirmations and events

## 5. Security and Privacy

### 5.1 Security
- Encrypted communications (HTTPS)
- Self-signed or Let's Encrypt certificates
- Optional two-factor authentication
- Automatic or assisted updates
- Regular data backups

### 5.2 Privacy
- Local data storage (no third-party cloud)
- No unnecessary data collection
- GDPR compliance (for the EU)
- Options for permanent media deletion

## 6. Installation and Configuration

### 6.1 Network Prerequisites
- Internet connection for the Raspberry Pi
- Ideally a fixed local IP address
- Possible port forwarding configuration for external access
- Possible dynamic DNS (DDNS) setup

### 6.2 Installation Process
- Preconfigured image to flash on the SD card for initial startup
- Configuration for booting from external SSD for better performance
- Automated installation and configuration of Chromium in kiosk mode
- MariaDB setup on the central server
- Automated installation script for Node.js/PHP server
- Initial setup wizard for client-server connection
- TV remote control input management configuration
- Detailed documentation and troubleshooting guide

## 7. Possible Future Enhancements

### 7.1 Additional Features
- Simplified video call support
- Integration of shared calendars (birthdays, events)
- Support for text and voice messages
- Themes and visual customization
- Integration of content from other sources (weather, news)

### 7.2 Hardware Extensions
- Enhanced support for TV remotes:
  - Support for specific remotes with more features
  - Advanced button mapping customization
  - Virtual remote control on smartphone via PWA
- Support for dedicated physical buttons
- Compatibility with touch screens
- Option to print favorite photos
- Support for cameras/microphones for two-way communication
- Performance optimization with different SSD models

## 8. Documentation and Support

### 8.1 Technical Documentation
- Detailed installation guide:
  - Node.js/PHP server configuration with MariaDB
  - Chromium installation and optimization on Raspberry Pi
  - SSD boot configuration
  - PWA setup for smartphones
- API documentation for developers
- TV remote control integration guide
- Well-commented and structured code
- Usage examples and practical cases
- Deployment tutorials for various configurations

### 8.2 User Documentation
- Simplified user guide (printable PDF):
  - Using the TV remote to navigate the interface
  - Installing and using the PWA on smartphones
  - Sending photos and videos from smartphones
- Video tutorials demonstrating main features
- PWA installation guide for different devices
- FAQ and common issue solutions
- Community resources (forum, wiki)
- Troubleshooting guide for client-server connection issues

## 9. License and Community

### 9.1 License
- Open source project (GPL v3 or MIT)
- Documentation under Creative Commons license
- Clear attributions for third-party libraries used

### 9.2 Community Contribution
- Source code available on GitHub or GitLab
- Contribution guide
- Pull request review process
- Bug reporting system

## 10. Suggested Development Plan

### Phase 1: Foundations (4-6 weeks)
- Set up development environment
- Configure central server with Node.js/PHP and MariaDB
- Develop client-server communication API
- Configure Raspberry Pi with SSD and Chromium
- Develop minimal functional TV interface
- Implement basic TV remote control management

### Phase 2: Main Features (4-6 weeks)
- Develop PWA for smartphones
- Optimize client-server system performance
- Improve TV and mobile user interfaces
- Complete TV remote control functionality
- Secure the system
- Conduct user testing

### Phase 3: Finalization (2-4 weeks)
- Complete documentation (technical and user)
- Create preconfigured image for Raspberry Pi
- Optimize SSD performance
- Conduct robustness and stability tests
- Prepare for deployment
- Train users on using the remote control and PWA
