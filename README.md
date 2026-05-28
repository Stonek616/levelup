# LevelUp

> A social game library and tracking app for anyone who plays video games.

LevelUp lets users catalogue their game library with nuanced status tracking, follow what friends are playing, write reviews, build collections, and find their next game through a conversational recommendation flow. Built as a full-stack portfolio project demonstrating Angular and Spring Boot in an enterprise-relevant stack.

## Data

All game related data is from IGDB.  

## Features

### **Game Library**

- Add any game sourced from the IGDB database (millions of titles)
- Track play status: Backlog · Playing · Played · Finished · Completed · Abandoned
- Separate ownership flag to answer the question "does my friend own this game?"
- Multi-platform tracking across PC, PlayStation, Xbox, Switch, and mobile

### **Social Feed**

- Activity feed with five tabs: For You · Friends · Trending · New & Notable · Similar
- Feed events cover status changes, reviews posted, ratings added, and collections created

### **Friends**

- Send and respond to friend requests
- Browse friends' public libraries and collections
- Search for friends by username

### **Reviews & Collections**

- Write full reviews with star ratings
- Comment on and like reviews
- Create and share curated game collections

### **What to Play**

- Conversational recommendation flow based on current mood and available time
- Draws suggestions from your backlog, owned library, and games friends are playing

### **Profile**

- Public-facing user profiles with library stats and taste breakdown
- View any user's public library filtered by status

### **Platform**

- JWT authentication with refresh tokens
- Secure password reset via email
- Guided onboarding flow for new users
- Privacy controls (public, friends-only, private) per entry
- Dark / light theme
- Admin moderation dashboard for report management

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Angular 19, TypeScript, SCSS, RxJS |
| Backend | Spring Boot 4, Java 21 |
| Security | Spring Security, JWT (JJWT 0.12), BCrypt |
| Database | PostgreSQL 16, Flyway migrations, Spring Data JPA |
| Game Data | IGDB API (Twitch OAuth) |
| Image Storage | Cloudinary |
| Deployment | Railway (API + DB) · Vercel (Frontend) |
| Dev Tools | Docker Compose, Angular CLI, Maven |

---

## Architecture

```text
levelup/                        Angular 19 frontend
  src/app/
    core/                       Guards, interceptors, services, models
    features/                   Lazy-loaded pages (auth, library, feed, friends, ...)
    shared/                     Reusable components (game-card, review-card, toast, ...)

levelup-api/                    Spring Boot 4 REST API
  src/main/java/com/levelup/
    controller/                 13 REST controllers
    service/                    15 business logic services
    model/                      26 JPA entities + 12 enums
    dto/                        24 request DTOs · 28 response DTOs
    repository/                 22 Spring Data JPA repositories
    security/                   JWT filter, user details, refresh token management
    igdb/                       IGDB API client and game data ingestion
    scheduler/                  Background jobs (feed cleanup, account purge)
    config/                     CORS, security, REST client configuration
```

---

## Local Development

### Prerequisites

- Java 21
- Node.js 20+
- Docker (for local PostgreSQL)

### 1. Start the database

```bash
docker compose up -d
```

Starts PostgreSQL on port `5432` and Adminer (DB browser UI) on port `8081`.

### 2. Configure the API

Create `levelup-api/src/main/resources/application-dev.properties` with your local secrets:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/levelup_dev
spring.datasource.username=levelup_dev
spring.datasource.password=levelup_dev_password
spring.jpa.hibernate.ddl-auto=validate

jwt.secret=your-jwt-secret-at-least-32-chars
jwt.expiration=900000

igdb.client-id=your-igdb-client-id
igdb.client-secret=your-igdb-client-secret

cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=your-api-key
cloudinary.api-secret=your-api-secret

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-gmail-app-password
```

> IGDB credentials: register a free app at [dev.twitch.tv](https://dev.twitch.tv)

### 3. Start the API

```bash
cd levelup-api
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

API runs at `http://localhost:8080`.

### 4. Start the frontend

```bash
cd levelup
npm install
ng serve
```

App runs at `http://localhost:4200`.

---

## Author

### **Stone Killen**

- GitHub: [@Stonek616](https://github.com/Stonek616)
- Email: <stonekillen@gmail.com>
