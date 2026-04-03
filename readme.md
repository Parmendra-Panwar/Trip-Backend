# TripLinker Backend

TripLinker is a production-level backend built with Node.js and Express, designed to handle A* Algo to Generator Itinerary, Spatial Graph Grid System to suggeest near by activities and listings, multi-role users (Business/Traveler). This project follows clean architecture principles, focusing on scalability and data integrity.

Live URL -> https://triplinkers.vercel.app

## Features
<!-- make it in english and make images in a row -->
- **Smart Trip:** Itinerary Generator based on available listings and activity across multiple fields. [Try Itinerary Planner](https://triplinkers.vercel.app/plan-itinerary)
- **Recommendations:** Personalized suggestions for [Listings](https://triplinkers.vercel.app/listing/69cd8a650a687c86111f9365) and [Activities](https://triplinkers.vercel.app/activity/69cd907735a4987c125fe91a).
- **Dual-Account System:** Specialized logic for **Business accounts** (Property/Activity owners) and **Standard Travelers** (Social "Trips" posts). [Sign Up](https://triplinkers.vercel.app/signup)
- **Stateless Authentication:** Secure JWT-based auth with custom middleware for role-based access control (RBAC).
- **Geocoding:** Integrated with Nominatim (OSM) for real-time location coordinate mapping.
- **Data Integrity:** Global error handling with `wrapAsync` wrappers and automated Cloudinary/Review cleanup upon data deletion.
- **Robust Review System:** Integrated feedback loops for listings, activities, and trips.
- **Optimized CRUD Engine:** High-performance MongoDB schemas designed for efficient image handling and data cleanup.

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Smart Trip** | A* Search Algorithm, Spatial Graph CityGrid System |
| **nearby Activity listing** | Spatial Graph Grid System |
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Storage** | Cloudinary (via Multer) |
| **Auth** | JWT & BcryptJS |
| **Validation** | Joi |

---

## Deep Dive into Features

### 1. AI-Driven Itinerary Generator 
When the API is triggered, the system converts Source and Destination strings into Latitude/Longitude coordinates. 
* **Fetch & Memory Load:** Uses a Bounding Box / Vector formula to retrieve "Corridor Grids" from MongoDB and loads them into a Node.js Map.
* **A* Algorithm Solver:** Executes the pathfinding logic and segments the results into Day 1, Day 2, etc., based on `MaxKm` constraints.

<div align="center">
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775206305/Screenshot_2026-04-03_141443_e65s6n.png" width="48%" />
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775205665/Screenshot_2026-04-03_140858_i7vj5z.png" width="48%" />
  
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775206283/Screenshot_2026-04-03_141607_f1tvfb.png" width="48%" />
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775206287/Screenshot_2026-04-03_141555_eoxlxc.png" width="48%" />
</div>

### 2. Smart Geocoding & Discovery (Recommendations)
Utilizing the **Nominatim (OpenStreetMap) API**, TripLinker converts addresses into dynamic coordinates to power location-based sorting and map exploration.

<div align="center">
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775205671/Screenshot_2026-04-03_030422_a0oteh.png" width="48%" />
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775206294/Screenshot_2026-04-03_141425_wo0egm.png" width="48%" />
</div>

### 3. Dual-Account Ecosystem & Review System
The system is optimized for two distinct user flows:
* **Travelers:** Create personal itineraries and explore social feeds (listings, activities, trips).
* **Business Owners:** Manage properties/activities and post promotional trips.
* **Reviews:** A unified system to handle feedback across all entities.

<div align="center">
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775205664/Screenshot_2026-04-03_030347_xldndn.png" width="48%" />
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775206304/Screenshot_2026-04-03_141415_ten43s.png" width="48%" />
</div>

### 4. Efficient Image Management
Comprehensive handling of media during creation, editing, and deletion to ensure storage efficiency.

<div align="center">
  <img src="https://res.cloudinary.com/dvvnxb5ow/image/upload/v1775206296/Screenshot_2026-04-03_142017_orny0r.png" width="50%" />
</div>

---

**Developed by Parmendra (Paras) Pawar** *Pre-final year B-Tech (AI & ML) | Ex-SDE Intern at Medorn Venture | NCC Cadet*