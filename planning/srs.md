# Software Requirements Specification
## For ReDish

Version 0.1  
Prepared by Trent Johnson 

---

## 1. Product Overview
ReDish is a mobile application designed to assist users in documenting their favorite dining experiences. It serves as a personal and social "order memory," allowing users to save specific dishes they enjoyed at restaurants and view the favorite orders of their friends and partners.

### 1.1 Product Perspective
This is a standalone, greenfield product. It is the first entry into a planned suite of applications focused on enhancing the shared experiences of couples and close-knit friend groups.

### 1.2 Product Functions
* **Authentication:** User login and sign-up via email or social providers.
* **Restaurant Discovery:** Integration with location services to search, identify, and save restaurant entities.
* **Order Logging:** A digital ledger to record specific dish names, ratings, notes, and photos for each restaurant.
* **Social Sharing:** A mechanism to link with friends and view their "Best Of" lists.
* **Favorites Summary:** A consolidated dashboard displaying top-rated dishes across all visited locations.

### 1.3 Product Constraints
* **Resource Constraint:** Development is limited to a single developer.
* **Technical Mandate:** Frontend must be built using React Native.
* **Financial Constraint:** Backend and database must utilize free or low-cost cloud hosting (e.g., MongoDB Atlas Free Tier, Render, or Firebase).

### 1.4 User Characteristics
* **Age:** Young adults (<30).
* **Socio-economic:** Moderately affluent, frequent diners.
* **Social Context:** Likely in a committed relationship or active friend group.
* **Professional Status:** Post-graduate or young professional.

### 1.5 Assumptions and Dependencies
* Users possess smartphones running iOS or Android with active data connections.
* System depends on 3rd-party APIs (e.g., Google Places or Yelp) for restaurant metadata.

### 1.6 Apportioning of Requirements
* **Phase 1 (MVP):** Focus on Core Logging (REQ-FUNC-001 to 004), User Auth, and basic UI.
* **Phase 2:** Social features (Friend linking and sharing).
* **Deferred:** AI-based dish recommendations and offline-first synchronization.

---

## 2. Requirements

### 2.1 External Interfaces

#### 2.1.1 User Interfaces
* The UI shall be responsive and follow platform-specific design guidelines (Material Design for Android, Cupertino for iOS).
* The system shall provide a bottom-tab navigation layout for quick access to Home, Search, Friends, and Profile.

#### 2.1.2 Hardware Interfaces
* **Location Services:** The system shall access the device GPS to provide "nearby" restaurant suggestions.
* **Storage:** The system shall access device storage for the purpose of uploading profile pictures or dish photos.

#### 2.1.3 Software Interfaces
* **Database:** MongoDB Atlas (NoSQL) for user data and order logs.
* **Maps API:** Google Places API for restaurant name and address verification.
* **Auth Provider:** Clerk for secure JWT management and SOC 2 compliant authentication.

### 2.2 Functional Requirements

- **ID:** REQ-FUNC-001
- **Title:** Restaurant Search and Save
- **Statement:** The system shall allow the user to search for restaurants by name and save the selection to their profile.
- **Rationale:** Standardizes restaurant entities to avoid duplicate entries with different spellings.
- **Acceptance Criteria:** Search results return accurate address and name data; saving adds the entity to the user's "Visited" list.
- **Verification Method:** Demonstration.

- **ID:** REQ-FUNC-002
- **Title:** Dish Logging
- **Statement:** The system shall provide a form to input "Dish Name," "Rating (1-5 stars)," and "Notes" linked to a specific restaurant ID.
- **Rationale:** This is the primary value of the application.
- **Acceptance Criteria:** Data must persist in the MongoDB database and be retrievable on the Summary page.
- **Verification Method:** Demonstration.

- **ID:** REQ-FUNC-003
- **Title:** Social Connection (Friend Request)
- **Statement:** The system shall allow users to search for others by username and send a "Friend Request."
- **Rationale:** Necessary to protect privacy while enabling the social sharing feature.
- **Acceptance Criteria:** User B must accept User A's request before User A can view User B's orders.
- **Verification Method:** Demonstration.

- **ID:** REQ-FUNC-004
- **Title:** Friends' Recent Orders Feed
- **Statement:** The system shall display a chronological feed of recent orders logged by confirmed friends.
- **Rationale:** Core social value proposition — users can discover dishes through people they trust.
- **Acceptance Criteria:** Feed shows the dish name, restaurant, rating, and timestamp for each friend's recent log; only accepted friends' orders are visible.
- **Verification Method:** Demonstration.

### 2.3 Quality of Service

#### 2.3.1 Performance
- **ID:** REQ-PERF-001
- **Statement:** The application shall load the user's "Summary Page" in less than 2 seconds on a standard 4G connection.

#### 2.3.2 Security
- **ID:** REQ-SEC-001
- **Statement:** User order data shall not be visible to any user not confirmed as a "Friend" within the system.
- **Rationale:** Privacy of user movement and dining habits.

- **ID:** REQ-SEC-002
- **Statement:** The authentication system shall comply with SOC 2 Type II security controls, including secure credential storage, encrypted data transmission (TLS 1.2+), session management with token expiration, and audit logging of authentication events.
- **Rationale:** Establishes trust with users by ensuring their credentials and personal data are handled to an industry-recognized security standard.

---

## 2.5 Design and Implementation

#### 2.5.7 Cost
- **ID:** REQ-COST-001
- **Statement:** The total monthly infrastructure cost for the first 500 users shall not exceed $5.00 USD.

#### 2.5.8 Deadline
- **ID:** REQ-DEAD-001
- **Statement:** An MVP (Minimum Viable Product) including search and logging must be completed within 8 weeks of start.

---

## 3. Verification

| Requirement ID | Verification Method | Test/Artifact Link | Status | Evidence |
|----------------|---------------------|--------------------|--------|----------|
| REQ-FUNC-001   | Demonstration       | Search Flow Test   | Verified | N/A      |
| REQ-FUNC-002   | Demonstration       | Dish Logging Demo  | Verified | N/A      |
| REQ-FUNC-004   | Demonstration       | Friends Feed Test  | Verified | N/A      |
| REQ-SEC-001    | Analysis            | Security Audit Doc | Pending| N/A      |
| REQ-SEC-002    | Analysis            | SOC 2 Audit Doc    | Pending| N/A      |

---

## 4. Appendixes
* **Glossary:** * *ReDish:* The act of re-ordering a previously loved dish.
    * *Log:* A single record of an order at a restaurant.
* **Data Model:** * User { _id, username, email, friends: [] }
    * Restaurant { _id, place_id, name, address }
    * Order { _id, user_id, restaurant_id, dish_name, rating, notes }