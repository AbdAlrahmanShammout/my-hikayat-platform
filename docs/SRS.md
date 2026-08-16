# **SRS – Digital E-Book Subscription & Author Monetization Platform**

## **1. System Overview**

The system is a digital reading platform (similar to Kindle / Amazon
Books) that allows users to read e-books via subscription, while authors
earn revenue based on actual reading engagement.

The platform supports:

- Secure e-book reading (online + offline)

- Advanced reading intelligence tracking

- Subscription-based access model

- Author monetization based on reading time

- Full content protection and encryption

- Support for both Reflowable and Fixed-Layout books

- Visual reading experiences for Picture Books and Illustrated Chapter
  Books

# **2. User Roles**

## **2.1 Reader (User)**

- Create account / login

- Subscribe to platform (single subscription model)

- Browse and read books

- Offline reading (download encrypted books)

- Sync reading progress across devices

- Customize reading experience

## **2.2 Author / Publisher**

- Any user can become a publisher

- Upload books (PDF / EPUB)

- Book status lifecycle:

  - Pending → Review → Approved or Rejected

- View analytics and earnings

Publishers manage their own books through the author book API:

- `POST /author/books` — create a book. The owner is the authenticated
  publisher. The request may set title, description, book type, and
  categories. It does not set publishing status or layout type.

- `GET /author/books` — list books owned by the authenticated
  publisher, optionally filtered by publishing status.

- `GET /author/books/:id` — get one owned book.

- `PATCH /author/books/:id` — update title, description, book type,
  and/or categories only. Publishing status, processing status, layout
  type, and owner cannot be changed on this path.

A publisher cannot retrieve or update another publisher’s book through
these endpoints.

## **2.3 Admin / Moderator**

- Review then approve or reject books

- Manage users

- Manage subscriptions

- Manage books

- Manage category revenue weights

- Create and manage curated collections / editorial shelves

- Add or remove books from collections

- Define and manage the display order of books within each collection

- Inspect the append-only audit log

Admin book management:

- `GET /admin/books` returns all publishing statuses by default. An
  optional `publishingStatus` query parameter allows admins to filter
  the results by publishing status.

- `GET /admin/books/:id` returns one book for administration.

- `PATCH /admin/books/:id` updates title, description, book type,
  and/or categories without changing publishing status.

- Approve or reject an in-review book (`POST /admin/books/:id/approve`,
  `POST /admin/books/:id/reject`).

- Unpublish an approved catalog book
  (`POST /admin/books/:id/unpublish`): publishing status stays
  approved; the published timestamp is cleared; readers no longer see
  the book (treated as not found).

- Republish (`POST /admin/books/:id/republish`) restores catalog
  visibility without a new review and sets the published timestamp to
  the current time.

- Soft-delete (`DELETE /admin/books/:id`) removes the book from the
  catalog and from author/admin lists.

Admin category revenue-weight management (admin only):

- `GET /admin/categories`, `GET /admin/categories/:id` — list or get
  categories, including `categoryWeight`.

- `PATCH /admin/categories/:id` — update `categoryWeight` only. The
  value must be greater than 0.

This category API does not create, rename, or delete categories.

## **2.4 Audit Log**

Administrators can list and inspect an append-only audit log
(`GET /admin/audit-logs`). Entries record the actor, action, subject
type, subject id, optional reason, and optional metadata.

Read operations are not audited.

The following state changes must produce an audit record:

- Book submitted for review, approved, rejected, unpublished,
  republished, or deleted

- Publisher enabled or disabled; user role changed; user deleted

- Subscription canceled; subscription payment failed (audit only; this
  event does not by itself change access)

- Collection created; title updated; deleted; book added; book
  removed; or reordered

- Revenue period calculated

Collection title update is audited only when a title is actually
persisted. Adding a book that is already in the collection, removing a
book that is not in the collection, or reordering with a different
book set does not write an audit row.

Revenue engagement aggregation, period close, and pool or platform-cut
updates are not audited as revenue calculation. Recalculating the same
revenue period produces another audit record on each successful
calculation.

# **3. Book Management System**

Each book contains:

- Title

- Description

- Author / Publisher

- Categories

- File (PDF / EPUB encrypted)

- Preview images

- Promo video (optional)

- Status (pending / in_review / approved / rejected)

- Created date

- Published date

- Layout type:

  - Reflowable

  - Fixed-Layout

- Book type:

  - Standard Chapter Book

  - Picture Book

  - Fixed-Layout Illustrated Chapter Book

The system must detect the EPUB layout type and automatically use the
appropriate reading engine.

A book’s publishing status is one of: pending, in review, approved, or
rejected. Unpublished is not a publishing status.

Catalog and reader full-book access require all of: publishing status
approved, processing complete, and a published timestamp. Clearing the
published timestamp hides an approved book from readers without
changing its publishing status, including in reader-facing collection
results (§10.2). A later republish returns that book to the catalog
without another review and sets the published timestamp to the current
time. Soft-deleted books are removed from the catalog and from
author/admin lists.

## **3.1 Fixed-Layout Books**

Picture Books and Illustrated Chapter Books that rely heavily on
integrated artwork, doodles, hand-drawn fonts, or specific page artwork
must use a Fixed-Layout presentation.

The original page composition, artwork, typography, and text alignment
must be preserved.

Fixed-Layout books must be treated as locked visual layouts and must not
be reflowed.

# **4. Reading System (Core Feature)**

## **4.1 Reader Features**

The platform must implement a **Dual Reader Engine** that automatically
detects the book's layout type and selects the appropriate reading
experience.

### **Reflowable Books**

For standard chapter books using a reflowable layout:

- Built-in reader (EPUB/PDF)

- Font size adjustment

- Line spacing control

- Margin controls

- Dark / Light mode

- Continue reading (Smart Resume)

- Offline reading mode

- RTL (Right-to-Left) reading support where applicable

### **Fixed-Layout Books**

For Picture Books and Fixed-Layout Illustrated Chapter Books:

- Use a Fixed-Layout Canvas Viewport

- Preserve the original page dimensions

- Preserve artwork positioning

- Preserve text positioning and alignment

- Disable font size controls

- Disable line spacing controls

- Disable margin controls

- Support Dark / Light mode where technically applicable

- Support Continue Reading (Smart Resume)

- Support Offline reading mode

- Support RTL (Right-to-Left) navigation where applicable

- Support Zoom In / Zoom Out

The application must automatically switch to **Fixed-Layout Canvas
Mode** for Picture Books and Illustrated Chapter Books to preserve
artwork integrity and text alignment.

### **Aspect Ratio**

Fixed-Layout books must be rendered using **Aspect Fit**.

The reader must preserve the original aspect ratio of the artwork and
page layout without cropping or slicing the content.

The reader must support common aspect ratios including:

- 4:3

- 16:11

The Fixed-Layout viewport must correctly display these layouts on
devices with different screen ratios, including narrow mobile screens
such as 19.5:9.

When necessary, letterboxing must be used to ensure that the original
artwork is fully visible.

### **Zoom Controls**

Because font-size controls are disabled for Fixed-Layout books, the
reader must provide visual zoom functionality.

Users can:

- Zoom In

- Zoom Out

- Pinch-to-Zoom

- Use a magnifying glass / zoom control

Zooming must preserve the original aspect ratio and page layout.

The user must be able to enlarge or reduce the visual page content
without changing the underlying Fixed-Layout composition.

## **4.2 Smart Resume (Important)**

System automatically saves:

### **Reflowable Books**

- Last page

- Last exact reading position (sentence / scroll offset)

- Last session timestamp

User can resume:

- From the last page

- Or from the exact last position inside the page

### **Fixed-Layout Books**

For Picture Books and Fixed-Layout Illustrated Chapter Books, Smart
Resume must save:

- Last Spread ID

- Last Page Number

- Last session timestamp

The system must restore the user to the exact spread or page they were
viewing.

Fixed-Layout books must not rely on text scroll offset for Smart Resume.

User can resume:

- Reflowable books from the last page or exact reading position

- Fixed-Layout books from the last saved Spread ID / Page Number

# **5. Reading Intelligence System**

System tracks deep reading behavior.

## **5.1 Metrics per user / book**

### **Reflowable Books**

- Time per page

- Time per chapter, measured as active reading time attributed to a
  chapter spine index

- Total reading time

- Reading sessions count

- Idle time detection (no interaction but page open) // not promise i
  wall try

- Reading speed (pages/minute)

For reflowable books, chapter time is recorded from reading-session
activity:

- Only **active** duration is stored per chapter. Idle time remains a
  session metric and is not copied onto chapter rows.

- The spine index is taken from the activity payload when present;
  otherwise from the current session spine index.

- Activity with no usable spine index, or with no positive active
  duration, does not write chapter time.

- A spine index does not have to match a stored chapter record at
  ingest time. Heatmaps may later show that spine with no title.

- Repeated activity for the same session and spine **adds** active
  time (no idempotency key in this version).

Author revenue continues to use session-level active reading totals,
not the chapter ledger.

### **Fixed-Layout Books**

For Picture Books and Fixed-Layout Illustrated Chapter Books:

- Time per page

- Time per spread

- Total visual reading time

- Reading sessions count

- Idle time detection

- Active Time Spent on Spread

- Visual Scene Time

For Fixed-Layout books, engagement must be measured through visual
engagement and active time spent viewing each page or spread rather than
relying on scrolling text or reading speed.

### **Visual Scene Time**

**Visual Scene Time** represents the amount of active reading time spent
by a user viewing a specific page or spread in a Fixed-Layout book.

This metric is used to measure engagement for Picture Books and
Illustrated Chapter Books where traditional scrolling and reading-speed
metrics are not applicable.

## **5.2 Session Tracking Model**

Each reading session includes:

- Start time

- End time

- bookId

- Active reading time vs idle time

- Layout type

For Reflowable Books, each session may additionally track:

- Page

- Chapter

- Sentence / scroll position

For Fixed-Layout Books, each session must additionally track:

- Spread ID

- Page Number

- Active Time Spent on Spread

- Visual Scene Time

The system must be able to determine which spread or page was actively
viewed and how long the user engaged with it.

For reflowable books, the system must also be able to attribute active
session time to a chapter spine index as described in §5.1.

# **6. Subscription System**

- Single subscription model for users

- Monthly subscription (Stripe integration)

- Automatic renewal

- Free tier available

- Free tier does not require a credit card

## **6.1 Paid Reading Entitlement**

Paid full-book reading is allowed when both are true:

- the user’s plan is the monthly paid plan, and

- the current time is before `currentPeriodEnd`.

If `currentPeriodEnd` is missing, paid reading is denied.

The free plan never grants paid reading.

Local subscription status is `active` or `canceled`. A **canceled**
monthly paid subscription still grants paid reading until
`currentPeriodEnd`. After that timestamp, access stops even if status
is still `active`.

Stripe collection states such as `past_due` or `unpaid` are not stored
as local statuses. A failed invoice payment (`invoice.payment_failed`)
is recorded in the admin audit log and does not change local status,
period end, or access by itself.

A user who already has paid reading entitlement cannot start another
checkout. After entitlement ends, checkout is allowed again.

## **6.2 Refund Policy**

Noory offers a money-back guarantee.

Users can request a refund within **7 days of activating their
subscription**.

A refund granted under this policy cancels the paid subscription and
ends paid reading immediately (the paid period end is closed at the
time of refund). Canceling without a refund does not by itself end
access before `currentPeriodEnd`.

# **7. Monetization System (Author Revenue Model)**

Authors earn based on **real reading time engagement**.

## **7.1 Revenue Logic**

- Each book generates revenue proportional to:

  - Total active reading minutes

  - Category weight

The **Category Weight** logic is active and must be applied when
calculating author revenue.

For a book assigned to more than one category, category weight is the
sum of the configured weights of all assigned categories.

For Reflowable Books, engagement can be measured using active reading
time and reading activity.

For Picture Books and Fixed-Layout Illustrated Chapter Books, the
backend must calculate engagement primarily based on:

- Active Time Spent on Spread

- Visual Scene Time

- Category Weight

Picture Books may generate fewer words per minute than standard chapter
books but require significant visual engagement.

Therefore, monetization for Picture Books and other Fixed-Layout books
must not depend on reading speed, word count, sentence count, or
scrolling activity alone.

The backend must treat active visual engagement with a spread or page as
a valid reading engagement signal.

## **7.2 Example Formula**

For Reflowable Books:

- bookRevenue =\
  (bookReadingMinutes / totalPlatformReadingMinutes) \* revenuePool

For Fixed-Layout Books, the equivalent engagement value must be
calculated using active visual engagement:

- weightedBookEngagement =\
  activeTimeSpentOnSpread \* categoryWeight

The final revenue calculation must use the weighted engagement of each
book relative to the total weighted platform engagement.

Conceptually:

- bookRevenue =\
  (weightedBookEngagement / totalWeightedPlatformEngagement) \*
  revenuePool

Where:

- weightedBookEngagement represents the engagement generated by the book
  after applying the appropriate engagement metric and category weight.

- categoryWeight represents the configured weight applied to the book:
  the weight of its category, or the sum of the configured weights of
  all assigned categories when the book has more than one category.

## **7.3 Distribution**

- Platform takes % cut

- Remaining distributed to authors based on reading time and weighted
  engagement of their books

## **7.4 Revenue Period Calculation**

Administrators calculate a revenue period’s author shares with
`POST /admin/revenue-periods/:id/calculate`. Recalculating the same
period is allowed and produces a new audit record each successful
time.

Setting the pool or platform cut, aggregating engagement only, and
closing a period are separate operations and are not revenue-
calculation audit events.

# **8. Anti-Piracy & Security System**

## **8.1 Book Protection**

- AES encryption for all book files

- Stored as encrypted blobs

- Downloaded files remain encrypted

## **8.2 Offline Protection**

- Books cannot be opened outside app

- No direct file access from file manager

- Decryption only inside application runtime

# **9. Offline Mode**

- Users can download books for offline reading

- Books remain encrypted

- Full reading experience offline

# **10. Search & Discovery**

- Full-text search inside books

- Search by:

  - Title

  - Author

  - Publisher

- Filters:

  - Category

  - Popularity

  - Newest

## **10.1 Fixed-Layout Text Search**

Fixed-Layout EPUBs must maintain full-text search capability.

When generating Fixed-Layout EPUBs, the text must be embedded as a
transparent digital/vector text layer over the artwork.

This allows the system to:

- Search for words inside Fixed-Layout books

- Identify matching words

- Highlight search results

- Preserve the original visual page layout

Search functionality must not require changing, reflowing, or otherwise
altering the visual composition of the page.

Text must remain searchable even when the layout is locked and displayed
using Fixed-Layout Canvas Mode.

## **10.2 Curated Collections / Editorial Shelves**

The platform must support curated collections that allow administrators
to organize and present groups of books.

### **Collection Entity**

Each Collection contains:

- Collection title

- List of bookIds

- Display order

### **Admin Management**

Admins must be able to:

- Create collections

- Edit a collection’s title

- Delete collections

- Add books to collections

- Remove books from collections

- Reorder books within a collection

Editing a collection’s title is separate from changing membership.
Adding a book, removing a book, and reordering books are distinct
operations. Reorder must include exactly the current membership.

### **Discovery**

The Discovery experience must allow users to:

- Browse curated collections

- Open a collection

- View books within the collection

- View books according to the configured editorial order

Reader-facing collection results must exclude any book that is not
catalog-visible. An unpublished book must not be visible to readers,
even if it belongs to a collection. Administrators may still keep that
book in the collection. After the book is republished and otherwise
meets catalog visibility requirements, it may appear in reader-facing
collections again.

Curated collections provide an editorial discovery surface in addition
to full-text search and standard filters.

# **11. Sync System**

Cross-device synchronization:

## **11.1 Reflowable Books**

- Reading position

- Bookmarks

## **11.2 Fixed-Layout Books**

- Spread ID

- Page Number

- Bookmarks

The synchronization system must use the appropriate reading-position
model based on the book's layout type.

For Reflowable books, the system synchronizes the text-based reading
position.

For Fixed-Layout books, the system synchronizes the exact Spread ID /
Page Number.

# **12. Author Dashboard**

Authors can view:

## **12.1 Analytics**

- Total reading minutes

- Reading per book

- Top performing books

## **12.2 Earnings**

- Revenue per book

- Total earnings

- Trend over time

## **12.3 Engagement Heatmap**

Authors and administrators can view a per-book heatmap for a revenue
period. The response is layout-aware and includes:

- `layoutType`

- `spreads` — used for fixed-layout books (unchanged spread/page
  visual engagement)

- `chapters` — used for reflowable books

For reflowable books, each chapter cell is a spine index, a title when
a matching chapter exists (otherwise null), and active duration. Only
spines with positive active duration appear. Cells are ordered hottest
first; equal duration is ordered by spine index ascending.

Fixed-layout heatmaps continue to use spread/page cells and return an
empty chapter list.

# **13. Non-Functional Requirements**

- Secure authentication (JWT)

- Highly scalable backend architecture

- Modular NestJS design

- Offline-first architecture

- High-performance analytics tracking

- Stripe integration for payments

- Strong encryption system for IP protection

# **14. Suggested Architecture**

## **Frontend**

- React Native (Mobile + Tablet)

- Dual Reader Engine:

  - Reflowable Reader Engine

  - Fixed-Layout Canvas Reader

## **Backend**

- NestJS (Modular Architecture)

- Prisma ORM

- PostgreSQL

## **Storage**

- AWS S3 / Firebase Storage (encrypted files)

## **Payments**

- Stripe

# **Part 2 - AI Audiobooks using ElevenLabs**

**Technical & Business Overview**

# **1. Client Overview (Non-Technical)**

## **Goal**

The platform will allow users to **listen to books using high-quality AI
narration**, similar to Kindle + Audible.

When an author uploads a book, the system automatically generates an
audiobook using **ElevenLabs AI Voice**. Once generated, the audio is
permanently stored and becomes available for all readers.

This means:

- Read the book

- Listen to the audiobook

- Continue listening from the last position

- Stream audio online

The audiobook is generated **only once**, reducing operational costs
while providing instant playback for all future users.

## **For Testing now**

Go to [<u>https://elevenlabs.io</u>](https://elevenlabs.io/)

<img src="media/image1.png" style="width:6.26772in;height:3.75in" />

## **User Experience**

Author uploads EPUB

↓

System processes the book

↓

AI generates professional narration

↓

Audio is stored securely

↓

Readers can listen immediately

## **Estimated Cost Example**

Example book:

- 250 pages / page have 2000 characters

- Approximately 500,000 characters

Using ElevenLabs Multilingual v2/v3 model:

500,000 Characters

Cost is: Approximately \$0.10 per 1,000 characters.

≈ \$50 USD

Smaller book:

- 100 pages

- Approximately 200,000 characters

≈ \$20 USD

**Important**

This cost is paid **only once per book**.

If 50,000 users listen to the audiobook later:

Additional AI Cost = \$0

Because the generated audio files are reused.

## **Benefits**

- Human-like narration

- Excellent Arabic pronunciation

- Supports fully vocalized Arabic (<span dir="rtl">التشكيل</span>)

- High-quality streaming

- One-time generation cost

- Scalable architecture

# **2. Technical Workflow (Developer Documentation)**

## **Book Processing Pipeline**

Author Uploads EPUB

│

▼

Validate EPUB

│

▼

Extract Metadata

│

▼

Extract HTML Chapters

│

▼

Clean HTML

│

▼

Normalize Arabic Text

│

▼

Split into Audio Segments

│

▼

Generate Audio via ElevenLabs API

│

▼

Store Audio Files

│

▼

Create Audio Manifest

│

▼

Ready for Streaming

# **Step 1 — Upload**

Author uploads

book.epub

# **Step 2 — Extract EPUB**

Extract:

- metadata

- chapters

- images

- table of contents

Example

Book

Chapter 1

Chapter 2

Chapter 3

# **Step 3 — Text Cleaning**

Before sending to ElevenLabs:

Remove

- HTML tags

- CSS

- hidden elements

- unsupported markup

Convert to clean text

Example

\<p\><span dir="rtl">السلام عليكم</span>\</p\>

↓

<span dir="rtl">السلام عليكم</span>

# **Step 4 — Arabic Normalization**

(Optional but recommended)

Normalize:

- punctuation

- spaces

- quotation marks

- numbers

- Arabic symbols

If desired:

AI can also improve the text by adding missing diacritics before
narration.

# **Step 5 — Split into Segments**

Do **not** send an entire chapter.

Instead split into smaller chunks.

Example

Chapter 1

Segment 1

Segment 2

Segment 3

Each segment should be around:

- 1–3 minutes

- or according to ElevenLabs character limits and best practices.

Advantages

- Faster generation

- Easier retries

- Streaming support

- Resume support

\
=

# **Step 6 — Generate Audio**

For every segment

Text

↓

ElevenLabs API

↓

Audio

Generated format

mp3

or

m4a

# **Step 7 — Store Audio**

Recommended structure

Books/

Book_ID/

Chapter_01/

segment_001.mp3

segment_002.mp3

segment_003.mp3

Chapter_02/

segment_001.mp3

Storage options

- Amazon S3

- Cloudflare R2

- Azure Blob Storage

- Google Cloud Storage

# **Step 8 — Database**

Example

## **AudioChapter**

id

bookId

chapterNumber

duration

status

## **AudioSegment**

id

chapterId

sequence

textLength

duration

audioUrl

generationStatus

# **Step 9 — Playback**

Mobile requests

GET

/books/{id}/audio

Returns

{

"chapters": \[

{

"chapter":1,

"segments":\[

{

"url":"..."

}

\]

}

\]

}

# **Generation Status**

Queued

↓

Generating

↓

Completed

↓

Available

If generation fails

Generating

↓

Failed

↓

Retry

# **Background Processing**

Recommended architecture

Upload

↓

Queue

↓

Worker

↓

ElevenLabs API

↓

Storage

↓

Database Update

Workers prevent long upload times and improve reliability.

\
=

# **Audio Caching Strategy**

Audio is generated **once only**.

Reader \#1

↓

Generate

↓

Store

↓

Reader \#2

↓

Existing Audio

↓

No AI Call

# **Future Enhancements**

The architecture allows adding:

- Multiple narrator voices

- Male / Female voices

- Different Arabic dialects

- Playback speed

- Highlight text while listening (if alignment metadata is available)

- Sleep timer

- Offline download

\
=

# **Suggested System Architecture**

Author

│

▼

Upload EPUB

│

▼

EPUB Processing Service

│

▼

Chapter Extraction

│

▼

Arabic Text Normalization

│

▼

Queue (Background Jobs)

│

▼

ElevenLabs TTS Worker

│

▼

Audio File Generation

│

▼

Object Storage (S3/R2)

│

▼

Metadata Database

│

▼

Mobile Application

│

┌─┴──────┐

▼ ▼

Read Book Listen to Book

\
=

# 

# **Part 3 - Book Formatting & Typesetting Service**

## **1. Overview**

The Book Formatting Service is an optional paid service provided by the
platform for authors who do not have professionally formatted
manuscripts.

Many authors upload Microsoft Word documents that contain only raw text
without proper formatting, typography, chapter organization, or
publishing standards. The platform offers a professional formatting
service where the manuscript is converted into a publication-ready
e-book.

The pricing is calculated based on the total number of manuscript pages
according to predefined pricing packages configured by the platform
administrator.

# **2. Objectives**

The service aims to:

- Help authors publish professionally formatted books.

- Eliminate formatting complexity for non-technical authors.

- Provide standardized publishing quality.

- Generate additional revenue for the platform.

- Reduce the manual communication between authors and editors.

# **3. User Roles**

### **Author**

Can:

- Request formatting service.

- Upload raw manuscript.

- View estimated price.

- Pay formatting fees.

- Track formatting progress.

- Review formatted version.

- Request revisions (optional).

- Approve final version.

### **Formatting Team**

Can:

- Receive new formatting requests.

- Download manuscript.

- Update request status.

- Upload formatted files.

- Communicate with author.

- Complete formatting process.

### **Administrator**

Can:

- Configure pricing.

- Manage formatting staff.

- Assign requests.

- Monitor workload.

- Track revenue.

- Approve completed requests if required.

# **4. Workflow**

Author uploads manuscript

↓

System counts pages

↓

System calculates price

↓

Author confirms request

↓

Payment

↓

Formatting request created

↓

Assigned to formatting team

↓

Formatting in progress

↓

Formatted file uploaded

↓

Author reviews

↓

Revision (optional)

↓

Author approves

↓

Book continues to publishing workflow

# **5. Functional Requirements**

## **5.1 Create Formatting Request**

The author can request formatting while uploading a manuscript.

Required information:

- Manuscript file (.docx)

- Book title

- Language

- Notes for formatter (optional)

## **5.2 Supported File Types**

Input:

- DOCX

- DOC

Future:

- Google Docs Import

- ODT

## **5.3 Automatic Page Count**

After upload, the system automatically detects:

- Number of pages

- Word count

- Character count

The page count will be used to calculate pricing.

## **5.4 Pricing Calculation**

Pricing is based on administrator-defined rules.

Example:

|           |           |
|:---------:|:---------:|
| **Pages** | **Price** |
|   1–100   |   \$50    |
|  101–200  |   \$100   |
|  201–300  |   \$150   |

or

\$0.50 per page

The pricing model should be configurable.

## **5.5 Price Preview**

Before payment the author sees:

- Total pages

- Price per page/package

- Total amount

- Estimated delivery time

Example:

Pages:

178

Formatting Fee:

\$100

Estimated Delivery:

5 Business Days

## **5.6 Payment**

The formatting request only starts after successful payment.

Supported payment methods are the same as the platform payment gateway.

## **5.7 Request Status**

Each request has a status.

Statuses:

- Draft

- Waiting For Payment

- Paid

- Assigned

- In Formatting

- Under Review

- Revision Requested

- Completed

- Cancelled

## **5.8 Staff Assignment**

Administrator can assign the request to a formatter.

Assignment includes:

- Formatter

- Due date

- Priority

## **5.9 Formatting Process**

The formatter downloads the manuscript.

Typical tasks include:

- Chapter formatting

- Heading hierarchy

- Paragraph spacing

- Font consistency

- Page breaks

- Table of contents generation

- Image alignment

- Footnote formatting

- Quote styling

- Lists formatting

- Hyperlinks

- EPUB compatibility

- Typography improvements

## **5.10 Upload Formatted Version**

Formatter uploads:

- Formatted DOCX

- EPUB

- PDF (optional)

Each upload creates a new version.

## **5.11 Revision Request**

Author may request revisions.

Revision includes:

- Comment

The formatter receives revision notes.

## **5.12 Final Approval**

Once approved:

- Formatting request closes.

- Files become the official publishing files.

- Book enters publishing workflow.

# **6. Admin Configuration**

Administrator can configure:

## **Pricing Rules**

- Price per page

- Fixed packages

- Minimum charge

- Maximum charge

## **Estimated Delivery**

Example:

|           |              |
|:---------:|:------------:|
| **Pages** | **Delivery** |
|   1–100   |    3 Days    |
|  101–300  |    5 Days    |
|  301–500  |    7 Days    |

## **Revision Policy**

Administrator defines:

- Number of free revisions

- Paid revisions

- Revision deadline

## **Service Availability**

Enable/Disable formatting service.

# **7. Notifications**

Notifications are sent when:

- Request created

- Payment received

- Request assigned

- Formatting started

- Revision requested

- New version uploaded

- Formatting completed

- Author approved

Notifications can be:

- Email

# **8. Dashboard**

## **Author Dashboard**

Shows:

- Active requests

- Current status

- Delivery date

- Invoice

- Download formatted files

- Revision history

## **Formatter Dashboard**

Shows:

- Assigned requests

- Due dates

- Priority

- Completed requests

- Pending revisions

## **Admin Dashboard**

Shows:

- Total requests

- Monthly revenue

- Average completion time

- Active formatters

- Pending requests

- Workload distribution

# **9. Database Entities**

## **FormattingRequest**

|                   |                      |
|:-----------------:|:--------------------:|
|     **Field**     |   **Description**    |
|        id         |         UUID         |
|     authorId      |        Author        |
|      bookId       |         Book         |
|    formatterId    |  Assigned formatter  |
|       title       |      Book title      |
|  manuscriptFile   |    Original DOCX     |
|     pageCount     |     Total pages      |
|     wordCount     |     Total words      |
|       price       | Total formatting fee |
| estimatedDelivery | Expected completion  |
|      status       |    Current status    |
|       notes       |     Author notes     |
|    adminNotes     |    Internal notes    |
|     createdAt     |     Created date     |
|     updatedAt     |     Updated date     |

## **FormattingRevision**

|                     |                  |
|:-------------------:|:----------------:|
|      **Field**      | **Description**  |
|         id          |       UUID       |
| formattingRequestId |  Parent request  |
|       comment       |  Revision note   |
|     attachment      |     Optional     |
|      createdBy      | Author/Formatter |
|      createdAt      |    Timestamp     |

## **FormattingVersion**

|                     |                 |
|:-------------------:|:---------------:|
|      **Field**      | **Description** |
|         id          |      UUID       |
| formattingRequestId | Parent request  |
|    versionNumber    |     Version     |
|      docxFile       |      DOCX       |
|      epubFile       |      EPUB       |
|       pdfFile       |       PDF       |
|     uploadedBy      |    Formatter    |
|     uploadedAt      |      Date       |

# **10. Business Rules**

- Only Word documents can be submitted for formatting.

- Formatting begins only after payment is completed.

- Price is calculated automatically based on configured pricing rules.

- Every uploaded formatted file is versioned.

- Authors cannot edit the original manuscript after formatting has
  started unless a new request is created.

- Administrators can override pricing manually if necessary.

- Revision limits are configurable by the administrator.

- All actions (status changes, assignments, uploads, approvals) are
  logged for audit purposes.

## **Project Timeline & Commercial Proposal**

This section outlines the estimated implementation timeline and
development cost for each project phase. The project is divided into
three independent parts, allowing the client to implement additional
modules in later phases if desired.

### **1 Implementation Timeline**

|  |  |  |
|:--:|:--:|:--:|
| **Phase** | **Description** | **Estimated Duration** |
| **Part 1** | Core Digital E-Book Platform (Subscription System, Reading Application, Author Portal, Admin Dashboard, Analytics, DRM, etc.) **excluding Audio Books and Book Formatting Service** | **8 Working Weeks** |
| **Part 2** | AI Audio Book Generation & Text-to-Speech Integration | **3 Working Weeks** |
| **Part 3** | Book Formatting & Typesetting Service | **2 Working Weeks** |

> **Total Duration (All Parts):** **13 Working Weeks**

### **2 Project Cost**

|            |                                       |                 |
|:----------:|:-------------------------------------:|:---------------:|
| **Phase**  |            **Description**            |    **Cost**     |
| **Part 1** |     Core Digital E-Book Platform      | **\$3,000 USD** |
| **Part 2** |    AI Audio Book Generation Module    |  **\$800 USD**  |
| **Part 3** | Book Formatting & Typesetting Service |  **\$500 USD**  |

**Total Project Cost \$4,300 US**

### **3 Payment Terms**

The payment schedule for the project is structured according to the
implementation phases as follows:

|  |  |  |
|:--:|:--:|:--:|
| **Phase** | **Total Cost** | **Payment Terms** |
| **Part 1 – Core Digital E-Book Platform** | **\$3,000 USD** | **50% (\$1,500)** is paid before the development begins, and the remaining **50% (\$1,500)** is paid upon successful completion and delivery of Part 1. |
| **Part 2 – AI Audio Book Generation** | **\$800 USD** | The full payment (**100%**) is made upon completion and delivery of Part 2. |
| **Part 3 – Book Formatting & Typesetting Service** | **\$500 USD** | The full payment (**100%**) is made upon completion and delivery of Part 3. |

### \

### **4 Notes**

- Each phase can be developed and delivered independently.

- Part 1 is the core platform and is required before implementing Parts
  2 and 3.

- Parts 2 and 3 are optional extensions and may be implemented
  immediately after Part 1 or at a later stage based on the client's
  priorities.

- The implementation timeline assumes timely client feedback, approvals,
  and availability of all required content and resources.
