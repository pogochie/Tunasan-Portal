Project: Barangay Tunasan Web App – Backend Architecture Onboarding Prompt

You are assisting with a Node.js/Express backend that serves static frontend files and exposes REST APIs for incidents, news, events, and users. The app integrates Cloudinary for image uploads, MongoDB via Mongoose, Socket.io for real-time events, and Web Push for notifications.

Stack and setup
- Node.js + Express server (backend/server.js)
- MongoDB via Mongoose (backend/db.js)
- Real-time: Socket.io server attached to HTTP server
- Image uploads: multer + multer-storage-cloudinary + cloudinary.v2
- Notifications: web-push with VAPID keys (backend/notifications.js)
- Environment variables required:
  - MONGO_URI
  - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
  - VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY

Server configuration
- Static frontend served from ../frontend
- /uploads served statically from backend/uploads (local uploads directory created on boot)
- Socket.io CORS: origin "*", methods ["GET", "POST"]
- SW “killer” route at /sw.js to unregister any existing service worker and clear caches
- SPA fallback: catch-all (*) serves ../frontend/index.html (ensure index routes exist as actual files)

Data models (Mongoose)
- User (models/User.js)
  - username (unique), password (hashed via bcrypt), role ("admin" | "official"), status ("pending" | "approved" | "rejected")
  - idImage (Cloudinary URL), idImagePublicId (optional, for deletion)
- Incident (models/Incident.js)
  - reporterName, incidentType, description
  - location { lat, lng }
  - images: [String]
  - status: default "Pending" (other statuses used in UI: Approved, Rejected, In Progress, Resolved)
  - comments: array of { user, role, comment, createdAt }
  - createdAt: Date
- News (models/News.js): title, description, images[], createdAt
- Event (models/Event.js): title, description, date, location { lat, lng }, images[], createdAt

Routes (Express)
- /api/incidents (routes/incidents.js)
  - POST "/": create incident with images (multer Cloudinary); emits "newIncident"; sends web push
  - GET "/": list all incidents (sorted by createdAt desc)
  - GET "/:id": get one incident
  - POST "/:id/approve": approve incident; creates a News item; emits "incidentStatusUpdated"; sends web push
  - POST "/:id/reject": reject incident; sends web push
  - DELETE "/:id": delete incident
  - GET "/:id/comments": list comments
  - POST "/:id/comments": add comment; emits "newComment"
  - PUT "/:id": update incident with optional image replacements; sends web push
- /api/news (routes/news.js)
  - POST "/": create news with images
  - GET "/": list all news (sorted by createdAt desc)
  - DELETE "/:id": delete news
- /api/events (routes/events.js)
  - POST "/": create event with images
  - GET "/": list all events (sorted by date asc)
  - DELETE "/:id": delete event
- /api/users (routes/users.js)
  - POST "/register": register official with ID image upload to Cloudinary (status pending)
  - GET "/pending": list pending officials (unprotected)
  - POST "/:id/approve": approve official (unprotected)
  - POST "/:id/reject": reject official; deletes Cloudinary image (unprotected)
- /api/auth (routes/auth.js)
  - POST "/register": register official (no image here; status pending)
  - POST "/login": login (bcrypt compare; must be status approved; returns username + role; no JWT)

Real-time and notifications
- Socket.io events:
  - "newIncident": upon incident creation
  - "incidentStatusUpdated": upon approval or status change
  - "newComment": when a comment is posted to an incident
- Web Push (notifications.js):
  - setVapidDetails using VAPID env keys
  - subscriptions: in-memory array (consider persisting in DB for production)
  - sendNotification(payload) is invoked from incident creation/updates
  - addSubscription(subscription) helper exists; ensure a route is wired if push is needed client-side

Security notes (current state)
- Several routes are unprotected (approvals/rejections for users and incidents). In production:
  - Gate admin/official actions behind authenticated middleware (e.g., JWT, sessions)
  - Validate payloads and sanitize inputs
  - Rate-limit public write endpoints
- Passwords hashed via bcrypt; no token issuance; auth/login returns user data only

Conventions to follow
- Keep REST JSON payloads simple; match existing field names (incidentType, reporterName, description, location, images)
- Use Cloudinary storage (multer-storage-cloudinary) for images across incidents/news/events
- When parsing location from PUT bodies, handle stringified JSON gracefully (see incidents PUT)
- Emit Socket.io events and send web push consistently on create/update/delete operations as per current patterns
- Log errors; return JSON { message } consistently; preserve existing status codes

Development guidelines
- When editing or adding routes or models, provide minimal diff blocks (file path + code block) as responses
- Avoid introducing heavy frameworks; keep code TS-free unless requested
- Ensure all environment variables are documented; fail gracefully if missing
- Prefer async/await with try/catch; return consistent JSON messages
- Keep route handlers small; extract helpers if logic grows

Running locally
- Set environment variables (MONGO_URI, Cloudinary, VAPID keys)
- npm install; node backend/server.js (or nodemon)
- Visit http://localhost:5000
- Frontend pages are served statically; APIs available under /api/...
