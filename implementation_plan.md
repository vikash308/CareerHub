# CareerHub CareerHub – AI-Powered Professional Networking Platform

This document outlines the Product Requirements (PRD), Technical Requirements (TRD), and a condensed **10-day sprint plan** designed to build a high-performance, resume-worthy, and production-ready CareerHub. 

Each day represents **one day's worth of work**, perfect for making a daily Git commit and push to maintain your GitHub contribution graph (green dots).

---

## 🛠️ Resume Keywords & Tech Stack

*   **Frontend**: Next.js 15 (App Router), TypeScript, Redux Toolkit, Custom Hooks.
*   **Styling & UX**: TailwindCSS, Shadcn/ui (Radix Primitives), Framer Motion (Animations).
*   **Performance**: Local Storage Caching, Debouncing, Image Optimization, Lazy Loading.
*   **Security**: Token Authorization, Zod Validation, Client-side Protection.
*   **AI Integration**: Google Gemini API for ATS Resume Scoring.
*   **DevOps**: Vercel (Frontend), Render/Railway (Backend), MongoDB Atlas (Database).

---

## 📅 10-Day Sprint Plan

### 🟢 Day 1: Redux & API Setup [COMPLETED]
*   **Goal**: Initialize Next.js project and set up global state management.
*   **Tasks Done**:
    *   Set up simple Redux Slices: `authSlice`, `postSlice`, `profileSlice`, `connectionSlice`.
    *   Configured the Redux Store (`store.ts`) and custom typed hooks (`hooks.ts`).
    *   Created a unified API helper file (`utils/api.ts`) to avoid hardcoded URLs and automate token attachment.
    *   Wrapped the application in `<StoreProvider>`.

### 🟢 Day 2: Authentication Pages (Login & Signup) [COMPLETED]
*   **Goal**: Build clean, modern user entry points.
*   **Keywords**: `react-toastify` (toast alerts), `TailwindCSS` (UI), Redux Dispatch, Client-side Validation.
*   **Tasks Done**:
    *   Built premium **Login page** (`/login`) with animated glassmorphic card, field validation, and show/hide password toggle.
    *   Built premium **Register page** (`/register`) with 5-field form, real-time password strength bar, and show/hide toggles.
    *   Connected both pages to `api.login` / `api.register`, dispatching `loginSuccess` to Redux and saving session to `localStorage`.
    *   Added `react-toastify` toast alerts for success and error feedback.
    *   Enhanced `globals.css` with full CareerHub design system (brand tokens, animated gradient background, glass card, micro-animations).
    *   Updated `layout.tsx` with Inter font, SEO metadata, and styled `<ToastContainer>`.

### 🟢 Day 3: Premium App Navbar & Theme Switcher [COMPLETED]
*   **Goal**: Create main navigation layout with dark/light theme options.
*   **Keywords**: `lucide-react` (icons), `next-themes` (Dark/Light mode switcher), Glassmorphic CSS.
*   **Tasks Done**:
    *   Built a fully responsive glassmorphic sticky navbar (`components/Navbar.tsx`) with `backdrop-blur`, brand gradient logo, animated search bar, and active link indicator dot.
    *   Integrated `lucide-react` icons: `Briefcase`, `Search`, `Bell`, `Settings`, `Sun`/`Moon`, `Menu`/`X`, `LogOut`, `User`, `ChevronDown`, and per-link icons.
    *   Implemented `next-themes` dark/light toggle with `resolvedTheme` + `mounted` guard to prevent SSR hydration mismatch.
    *   Added notification bell with live unread badge pulse animation.
    *   Built animated **Profile Dropdown** (slide-in via `dropdownReveal` keyframe) with user name/username header, "My Profile", "Settings", and "Sign Out" (dispatches `logout` + redirects).
    *   Built **Mobile Drawer** (slide-down animation) with search, nav links with icons, and a mobile user footer with sign-out button.
    *   Added `click-outside` dropdown dismissal via `useRef` + `mousedown` event listener.
    *   Enhanced `globals.css` with all Day 3 animations: `dropdownReveal`, `mobileDrawerReveal`, notification badge pulse, search focus glow, light theme overrides, premium scrollbar, and text selection color.
    *   Updated `layout.tsx` to add **Manrope** font (headings), improved OG metadata, and added descriptive comments.
    *   Auto-hides navbar on `/login` and `/register` via `pathname` check.

### 🟢 Day 4: Global Feed & Loading Skeletons [COMPLETED]
*   **Goal**: Fetch and render posts from all users with high-fidelity loading states.
*   **Keywords**: Skeleton loading loaders, CSS shimmers, flexbox layouts.
*   **Tasks Done**:
    *   Built reusable `PostCard` component (`components/PostCard.tsx`) with proper API data shape, optimistic like toggle, owner-only delete menu, relative time formatting, and staggered entrance animations.
    *   Created animated `PostSkeleton` component (`components/PostSkeleton.tsx`) with CSS shimmer scan-line effect via `.skeleton-shimmer` utility in `globals.css`.
    *   Rewrote feed page (`app/page.tsx`) with `useEffect` calling `api.getAllPosts`, dispatching to Redux `setPosts`, showing 3 skeleton placeholders while loading, a retry error state, a Refresh button, and proper empty-feed state.
    *   Updated `store/postSlice.ts` to use strongly-typed `Post` interface instead of `any[]`.

### 🟢 Day 5: Post Creation Widget, Cloudinary Storage & Video Uploads [COMPLETED]
*   **Goal**: Enable users to post text, images, and videos with professional Cloudinary cloud storage, solid size limits, and populate the database with seeding tools.
*   **Keywords**: Cloudinary Storage, Multipart Form Data, Multer, Video players, File Size Validation, Database Seeder.
*   **Tasks Done**:
    *   **Cloudinary Integration**: Refactored backend routes (`postRoutes.js`) and config (`config/cloudinary.js`) to support posting media directly to Cloudinary. Saves the full HTTPS URL to MongoDB instead of local filenames.
    *   **Always Expanded Widget Layout**: Restructured `CreatePostWidget.tsx` to always render in its expanded form (3 rows) with Photo/Video buttons and Post button visible at all times.
    *   **Post Button Lock**: Locked (disabled) the Post button until there is at least some text content or an attached media file to prevent empty submissions.
    *   **Upload Size Restrictions**: Configured a 5MB maximum file size limit for both images and videos. Validated on the frontend (selection & submit handlers) and double-checked on the backend (`postController.js`).
    *   **Orphaned File Prevention**: Implemented automatic Cloudinary cleanup (`cloudinary.uploader.destroy`) in the backend post controller if validations fail or DB save errors occur.
    *   **Robust Video Playback**: Enhanced `PostCard.tsx` video logic to play any video format (mp4, webm, ogg, quicktime, mov, avi, mkv) or URLs containing `/video/upload/`.
    *   **ES Modules Load Order Fix**: Handled hoisted import order by adding `import 'dotenv/config'` at the top of `server.js` to ensure environmental variables are loaded before Cloudinary config initializes.
    *   **Broken Image Fallbacks**: Added state-based `onError` handlers to both `Navbar.tsx` and `PostCard.tsx` to gracefully fall back to user initials whenever an image fails to load.
    *   **Comprehensive DB Seeder**: Created `seed.js` to populate the database with 10 professional users (with Unsplash headshots), 30 career posts (containing text, Unsplash work images, and 2MB sample mp4 videos), random likes (2 to 8), and comments. Configured it to support both direct manual CLI runs (`node seed.js`) and secure HTTP trigger routes (`/seed-db`).

### 🟢 Day 6: Post Comments System [COMPLETED]
*   **Goal**: Add discussion threads under posts.
*   **Tasks Done**:
    *   Created `CommentSection.tsx` component with full fetch/add/delete comment logic.
    *   `PostCard.tsx` updated: Comment button now toggles `CommentSection` with smooth slide-in animation.
    *   Optimistic comment add with backend re-sync after 600ms delay.
    *   Owner-only delete with hover-reveal trash icon and loading spinner.
    *   Fixed backend `/get_comments` route from GET to POST to match `api.ts` contract.
    *   Added `{ timestamps: true }` to `commentModel.js` for `createdAt` tracking.
    *   Added `comment-section-enter` and `comment-item-enter` CSS animations to `globals.css`.

### 🟢 Day 7: Profile Page & Profile Picture Upload [COMPLETED]
*   **Goal**: Display career history, education, and user bio, and allow avatar updates.
*   **Keywords**: Multer upload, modal state synchronization.
*   **Tasks Done**:
    *   Built `/profile` page (`app/profile/page.tsx`) with hero card (cover banner + avatar), bio, work experience, and education sections.
    *   Avatar hover-upload with `Camera` overlay, connects to `api.uploadProfilePicture` using `FormData`, dispatches `updateUser` to Redux.
    *   "Edit Profile" modal with Redux state sync - updates name, username, bio, currentPost, pastWork[], education[] in one save.
    *   Dispatches `updateUser` (authSlice) + `updateMyProfileData` (profileSlice) after successful save.
    *   Connected "View Profile" button on feed's left sidebar to `/profile` via Next.js `Link`.
    *   Added `profile-modal-enter` glassmorphic animation in `globals.css`.

### 🟢 Day 8: Network Directory, Settings Page, & Connections Panel [COMPLETED]
*   **Goal**: Browse profiles, manage connections, and configure account settings.
*   **Tasks Done**:
    *   Built **Network Directory Page** (`app/directory/page.tsx`) with search, discovered users grid, and tabs for sent & incoming connection requests.
    *   Implemented full connection system flow: sending, accepting, rejecting connection requests.
    *   Built **Settings Page** (`app/settings/page.tsx`) supporting password change, dark/light theme options, and account deletion.

### 🟢 Day 9: Jobs Board, Theme Refactoring & Layout Fixes [COMPLETED]
*   **Goal**: Explore career opportunities, post new job openings, apply to jobs, and support responsive dark/light modes.
*   **Tasks Done**:
    *   Built **Jobs Board** (`app/jobs/page.tsx`) containing a responsive split-pane layout (left column: search, filter, and job list; right column: full job details).
    *   Implemented job creation flow (modal for posting jobs with validation) and application submission flow.
    *   Refactored all application pages and components (Feed, Settings, Profile, Directory, Jobs, Navbar) to use dynamic CSS variable theme classes for perfect Dark/Light mode color matching.
    *   Fixed Jobs panel layout bug: changed parent panel container overflow to hidden to prevent the "Apply Now" button footer from getting pushed off-screen and hiding.
    *   Fixed Profile 404 Bug: updated backend `updateUserProfile` controller to prevent querying for existing users with `undefined` email/username parameters when updating profile info.

### 📅 Day 10: AI-Powered ATS Resume Analyzer & PDF Download [IN PROGRESS]
*   **Goal**: Add ATS scoring and allow users to download their profiles as PDFs.
*   **Keywords**: **Google Gemini API** (Google AI SDK), Next.js API Routes, PDFKit.
*   **Tasks**:
    *   Build an ATS scoring panel on the profile page.
    *   Send profile details & a target Job Description to Gemini API to calculate ATS score and generate optimization tips.
    *   Add a "Download Resume" button, hooking into `api.downloadResume` to fetch the generated PDF.
    *   Deploy frontend to **Vercel** and backend to **Render/Railway** with MongoDB Atlas.
    *   Implement debouncing on inputs to reduce API load and add local caching in `api.ts`.
    *   Secure routes (redirect unauthenticated users) and run PageSpeed/Lighthouse tests.


---

## 🎨 Stitch UI Design Specifications & Reference

Below are the style guidelines, color values, typography hierarchies, and Tailwind markup generated by Stitch for the **CareerHub Dashboard Feed** UI.

### 1. Brand Identity & Style Guidelines
*   **Aesthetic Theme**: High-fidelity glassmorphism with multi-layered translucency. Information blocks float on glass panes over deep background gradients.
*   **Background**: Deep Slate (`#0F172A`) with a subtle radial gradient of deep indigo/violet (`rgba(76, 29, 149, 0.4)`) centered at the top.
*   **Glass Elements (`.glass-card`)**:
    *   Background: `rgba(255, 255, 255, 0.05)` (transparent white)
    *   Blur: `backdrop-blur-xl` or `24px`
    *   Border: `1px solid rgba(255, 255, 255, 0.1)`
    *   Hover effect: Increase background opacity to `rgba(255, 255, 255, 0.08)` and border opacity to `rgba(255, 255, 255, 0.2)`
*   **Design Constraints**:
    *   **No Emojis** are to be used anywhere in the UI text, placeholders, or labels.
    *   All buttons and interactive cards must include smooth transitions (`transition-all duration-300` or `duration-200`).

### 2. Colors & Typography
*   **Palette**:
    *   `primary`: `#d3bbff` (Light Violet)
    *   `primary-container`: `#4c1d95` (Dark Violet / Brand Primary)
    *   `secondary-container`: `#444173` (Deep Indigo)
    *   `background`: `#101415` (Deep Slate / Dark Mode base)
    *   `on-surface`: `#e0e3e5` (Contrast Light Gray)
    *   `on-surface-variant`: `#ccc3d4` (Muted Gray/Purple)
    *   `outline`: `#958e9e` (Border/Divider color)
*   **Fonts**:
    *   **Manrope**: Used for headlines and titles (display-lg, headline-lg, title-md).
    *   **Inter**: Used for body texts (body-lg, body-md).
    *   **Geist**: Used for status pills, buttons, and numeric statistics (label-md, label-sm).
