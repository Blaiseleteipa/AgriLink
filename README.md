🌾 AgriLink: The Farmer-Buyer Marketplace (PLP Final Project)

Project Name: AgriLink

Developer: Blaise Leteipa
Program: Power Learn Project (PLP) — Software Development Track
Project Type: Minimum Viable Product (MVP) Web Application

💡 Project Overview

AgriLink is a web-based marketplace designed to eliminate middlemen and connect Kenyan farmers directly with buyers, traders, and consumers.

The platform provides a simple, transparent, and real-time mechanism for selling and buying farm produce, ensuring farmers earn fairer prices for their goods and improving efficiency in the food supply chain.

SDG Alignment

This project is aligned with two critical Sustainable Development Goals (SDGs):

SDG 2: Zero Hunger: By improving market access and supporting agricultural productivity through technology.

SDG 8: Decent Work and Economic Growth: By promoting fair trade practices, digital inclusion, and economic empowerment for rural farmers.

✨ Core Features (MVP)

Feature

Status

Description

Real-Time Database

✅ Completed

Uses Firebase Firestore for live, scalable data persistence across all users.

Produce Posting

✅ Completed

Farmers can submit produce details (name, quantity, price, location).

Real-Time Marketplace

✅ Completed

Buyers view dynamically updated cards with all available listings.

Search & Filtering

✅ Completed

Buyers can filter listings instantly by Produce Name or Location.

Farmer Management

✅ Completed

Farmers can delete their own active listings from the marketplace.

Direct Contact

✅ Completed

"Contact Farmer" buttons link directly to the farmer's WhatsApp for negotiation.

Responsive UI

✅ Completed

Built using Bootstrap 5 and custom CSS for optimal viewing on desktop and mobile.

⚙️ Tech Stack

Frontend: HTML5, CSS3, JavaScript (ES6+)

Styling: Bootstrap 5 (for layout) and Custom CSS (for theme)

Database: Google Firebase Firestore (Real-Time Cloud Persistence)

Authentication: Firebase Anonymous Authentication (for public access to data)

📁 Project Structure

This project follows a standard file structure for easy deployment and maintenance:

AgriLink/
│
├── index.html            # Home Page & Project Introduction
├── farmers.html          # Form for Farmers to Post Produce
├── buyers.html           # Real-Time Marketplace for Buyers (with Delete Feature)
├── contact.html          # Contact and Project Info
│
├── /css/
│   └── style.css         # Custom Styles for Theme & Layout
│
└── /js/
    └── script.js         # Core logic: Firebase connection, Auth, CRUD, Filtering, DOM Manipulation


💻 Setup and Installation

Prerequisites

A web browser (Chrome, Firefox, etc.)

A local development server (e.g., VS Code's Live Server)

Running Locally

Clone the repository:

git clone [https://github.com/BlaiseLeteipa/AgriLink.git](https://github.com/BlaiseLeteipa/AgriLink.git)
cd AgriLink


Open the project folder in your editor.

Right-click index.html and choose to open it with your local server.

Firestore Setup (Developer Notes)

The current js/script.js file contains a specific Firebase configuration and relies on permissive Security Rules (allow read, write: if true;) for MVP testing. To use your own Firebase project, you must:

Replace the firebaseConfig object in js/script.js with your own project's credentials.

Set the Firestore Security Rules in your console to allow read/write access.

Built with passion as a final submission for the Power Learn Project Software Development Track.
