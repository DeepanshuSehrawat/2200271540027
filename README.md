# URL Shortener

A modern, feature-rich URL shortener application built with React and Material-UI that allows users to create shortened URLs with custom shortcodes, expiration times, and detailed analytics.

---
## SCREENSHOT
### Homepage - Shorten URLs
<img width="1802" height="815" alt="image" src="https://github.com/user-attachments/assets/9eb5d4ae-cfac-4213-91e7-4e14b39346b4" />
### Statistics - Active Links
<img width="1789" height="680" alt="image" src="https://github.com/user-attachments/assets/ea3fe6ce-f583-4eb7-8769-87c90bf9a14f" />
### Click Analytics
<img width="1506" height="833" alt="image" src="https://github.com/user-attachments/assets/ca08c219-e3cb-4e1b-8958-238a1e48b093" />




## Features

### 🔗 URL Shortening

- Shorten up to 5 URLs simultaneously  
- Custom shortcode support (3-10 alphanumeric characters)  
- Configurable expiration times (default: 30 minutes)  
- Automatic shortcode generation if custom one not provided  
- URL validation and duplicate shortcode prevention  

### 📊 Analytics & Statistics

- Real-time click tracking  
- Detailed click history with timestamps  
- Location tracking (demo data)  
- User agent information  
- Separate views for active and expired URLs  

### 🛡️ Security & Reliability

- URL expiration system  
- Input validation and sanitization  
- Comprehensive error handling  
- Logging system for debugging  
- Redirect confirmation dialog  

### 🎨 User Experience

- Clean, modern Material-UI interface  
- Responsive design for all devices  
- Tabbed interface for easy navigation  
- Copy-to-clipboard functionality  
- Success/error notifications  
- Real-time form validation  

---

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd url-shortener
```
## Install dependencies
```bash

npm install
```
## Installed required Material-UI package
```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
```
## Start the development server
```bash
npm start
```
Open the app at:
http://localhost:3000
## Usage
Shortening URLs
Go to the Shorten URLs tab

## Enter the original URL

(Optional) Enter custom shortcode (3-10 alphanumeric characters)

(Optional) Enter expiration time in minutes (default: 30)

## Click Shorten URLs

Copy or use the generated short URL

## Viewing Statistics
1. Go to the Statistics tab

2. View your URLs in two sections:

3. Active URLs

4. Expired URLs

5. Click on a URL to view:

6. Click history

7. Original link

8. User agent

9. Timestamps

## Managing URLs
Copy the short URL

Delete a URL from the list

Click to simulate a redirect (tracks analytics)

## Technical Details
Architecture
React functional components with hooks

Material-UI for UI

In-memory storage for session-only persistence

Custom logging for debugging

## Data Structure
```bash
{
  id: string,
  originalUrl: string,
  shortcode: string,
  shortUrl: string,
  createdAt: Date,
  expiryDate: Date,
  clickCount: number,
  clicks: [
    {
      timestamp: Date,
      source: string,
      location: string,
      userAgent: string
    }
  ]
}
```
## Future Enhancements
Persistent database (MongoDB, Firebase, etc.)

Login/authentication system

QR code generation

Bulk upload & export

Rate limiting

API for developers

Custom domain support


