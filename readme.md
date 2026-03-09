# TripLinker Backend

TripLinker is a production-level backend built with Node.js and Express, designed to handle multi-role users (Business/Traveler), community engagement, and AI-driven trip insights. This project follows clean architecture principles, focusing on scalability and data integrity.

## Key Features

- **Dual-Account System:** Specialized logic for Business accounts (Property/Activity owners) and standard Travelers.
- **Social Graph:** Follower/Following logic and Community Group management.
- **Smart Trip:** Itinerary Generator based on the available listings and activity by multiple fields
- **Activity Recommendations:** with personalized suggestions
- **Stateless Authentication:** Secure JWT-based auth with custom middleware for role-based access control.
- **Robust CRUD Engine:** Optimized MongoDB schemas for Listings, Reviews, and Feed posts.
- **Data Integrity:** Global error handling, centralized `wrapAsync` wrappers, and automated Cloudinary/Review cleanup on deletion.
- **Geocoding:** Integrated with Nominatim (OSM) for real-time location coordinate mapping.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Auth:** JSON Web Tokens (JWT) & BcryptJS
- **Storage:** Cloudinary (via Multer)
- **Validation:** Joi (Schema validation)

## Project Structure

```text
├── config/             # DB connection & Cloudinary setup
├── controller/         # Logic for Auth, Listings, & Reviews
├── models/             # Mongoose Schemas (User, Listing, Review)
├── routes/             # Express Route definitions
├── utils/              # ExpressError & wrapAsync helper
└── Validators/         # Joi validation & Auth middlewares

```

## Getting Started

1. **Clone the repo:**
```bash
git clone https://github.com/Parmendra-Panwar/Trip-Backend.git

```


2. **Install dependencies:**
```bash
npm install

```


3. **Environment Setup:**
Create a `.env` file and add:
* `MONGO_URL`, `JWT_SECRET`, `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`


4. **Run Server:**
```bash
nodemon app.js

```
Developed by Paras - Pre-final year B-Tech (AI & ML) | NCC Cadet*
