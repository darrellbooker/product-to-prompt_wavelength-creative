# Planning Guide

A social media campaign planner that helps businesses organize, schedule, and track their social media content across multiple platforms with intuitive visual planning.

**Experience Qualities**:
1. **Organized** - Clear structure that makes it effortless to see all planned content at a glance and understand campaign timelines
2. **Efficient** - Streamlined workflow that minimizes clicks and allows rapid content entry and editing
3. **Confident** - Visual feedback and validation that assures users their campaigns are properly scheduled and ready to publish

**Complexity Level**: Light Application (multiple features with basic state)
This is a focused planning tool with create, read, update, and delete operations for campaign posts, along with filtering and organization features. It manages persistent state but doesn't require complex backend integrations or multi-view navigation.

## Essential Features

### Create Campaign Post
- **Functionality**: Add a new social media post to the campaign calendar with platform selection, content text, and scheduled date
- **Purpose**: Enables users to build out their content calendar proactively
- **Trigger**: User clicks "Add Post" or "New Campaign" button
- **Progression**: Click add button → Select platform from dropdown → Enter content text → Choose post date → Save → Post appears in campaign list
- **Success criteria**: Post persists between sessions, displays in chronological order, shows platform icon and preview of content

### Edit Campaign Post
- **Functionality**: Modify any aspect of an existing scheduled post
- **Purpose**: Allows users to refine messaging and adjust timing as campaigns evolve
- **Trigger**: User clicks edit icon on a post card
- **Progression**: Click edit → Form populates with existing data → Modify fields → Save changes → Updated post reflects changes immediately
- **Success criteria**: Changes persist, no data loss, smooth transition between view and edit states

### Delete Campaign Post
- **Functionality**: Remove a post from the campaign schedule
- **Purpose**: Enables users to cancel or remove outdated content
- **Trigger**: User clicks delete icon on a post card
- **Progression**: Click delete → Confirmation dialog appears → Confirm deletion → Post removed from list with animation
- **Success criteria**: Post is permanently removed, confirmation prevents accidental deletion, smooth removal animation

### Filter by Platform
- **Functionality**: Show only posts for selected social media platforms
- **Purpose**: Helps users focus on platform-specific content strategies
- **Trigger**: User selects platform filter buttons or "All Platforms" option
- **Progression**: Click platform filter → List updates to show only matching posts → Filter state visually indicated
- **Success criteria**: Filtering is instant, clear visual indication of active filter, easy to reset to all platforms

### Campaign Overview Stats
- **Functionality**: Display total number of posts and breakdown by platform
- **Purpose**: Provides quick insight into campaign scope and platform distribution
- **Trigger**: Automatically calculated and displayed
- **Progression**: Stats update in real-time as posts are added/removed/edited
- **Success criteria**: Accurate counts, updates immediately, visually distinct presentation

### Email Campaign Management
- **Functionality**: Create, edit, and schedule email campaigns with rich text composition
- **Purpose**: Centralize email marketing efforts alongside social media planning
- **Trigger**: User switches to email tab and creates new campaign
- **Progression**: Select email tab → Click new campaign → Choose client → Compose email with rich text editor → Set subject/preview text → Schedule send date → Save campaign
- **Success criteria**: Rich formatting preserved, templates reusable, campaigns organized by date

### Rich Text Email Composer
- **Functionality**: Professional email editor with formatting toolbar (bold, italic, underline, headings, lists, colors, images, links)
- **Purpose**: Create visually appealing marketing emails without HTML knowledge
- **Trigger**: User composes email body in campaign or template form
- **Progression**: Click in editor → Use toolbar to format text → Insert images/links via popover dialogs → Preview formatted result → Content saved as HTML
- **Success criteria**: All formatting options work reliably, WYSIWYG preview accurate, formatting preserved when editing

### Email Template Library
- **Functionality**: Save frequently used email structures as reusable templates
- **Purpose**: Accelerate email creation by reusing proven formats
- **Trigger**: User creates template from scratch or saves campaign as template
- **Progression**: Create template → Compose with rich editor → Save with descriptive name → Use template button on any future campaign → Template content populates form
- **Success criteria**: Templates maintain all formatting, easy to find and apply, updates to template don't affect past campaigns

## Edge Case Handling

- **Empty State**: Welcoming illustration and clear call-to-action when no posts exist yet
- **Past Dates**: Allow scheduling in the past but visually distinguish past posts with muted styling
- **Long Content**: Truncate post content preview with "..." and show full text in edit mode or on hover
- **Duplicate Dates**: Allow multiple posts on the same date and platform with clear visual grouping
- **Missing Fields**: Form validation prevents saving incomplete posts with helpful inline error messages
- **Rapid Actions**: Debounce save operations and prevent double-submission with loading states

## Design Direction

The design should evoke a sense of professional creativity and organized productivity - like a digital content studio workspace. It should feel modern and energetic without being overwhelming, with clear information hierarchy that makes campaign management feel manageable and inspiring rather than chaotic.

## Color Selection

A vibrant, modern palette that reflects the energy of social media while maintaining professional credibility.

- **Primary Color**: Energetic Purple `oklch(0.55 0.22 295)` - Communicates creativity and modernity, perfect for a social media tool
- **Secondary Colors**: 
  - Cool Slate `oklch(0.35 0.02 250)` for subtle backgrounds and secondary actions
  - Soft Lavender `oklch(0.92 0.03 295)` for muted backgrounds and cards
- **Accent Color**: Electric Cyan `oklch(0.75 0.15 195)` - Attention-grabbing for CTAs and important interactive elements
- **Foreground/Background Pairings**:
  - Primary Purple (oklch(0.55 0.22 295)): White text (oklch(1 0 0)) - Ratio 7.2:1 ✓
  - Accent Cyan (oklch(0.75 0.15 195)): Dark Slate (oklch(0.2 0.02 250)) - Ratio 11.5:1 ✓
  - Background Soft Lavender (oklch(0.92 0.03 295)): Dark Text (oklch(0.2 0.02 250)) - Ratio 13.8:1 ✓
  - Card White (oklch(1 0 0)): Slate Text (oklch(0.35 0.02 250)) - Ratio 10.9:1 ✓

## Font Selection

Typography should balance modern sophistication with approachable readability, conveying professionalism while staying energetic.

- **Primary Typeface**: Space Grotesk for headings - Modern, geometric, and distinctive with technical precision
- **Body Typeface**: Inter for body text and UI elements - Highly legible, neutral, and optimized for screens

- **Typographic Hierarchy**:
  - H1 (Dashboard Title): Space Grotesk Bold/32px/tight letter spacing (-0.02em)
  - H2 (Section Headers): Space Grotesk Semibold/24px/normal spacing
  - H3 (Card Titles): Space Grotesk Medium/18px/normal spacing
  - Body (Post Content): Inter Regular/15px/relaxed line height (1.6)
  - Labels (Form Fields): Inter Medium/13px/normal spacing/uppercase with tracking
  - Stats (Numbers): Space Grotesk Bold/28px/tight spacing

## Animations

Animations should feel snappy and purposeful, reinforcing user actions without introducing delay. Use micro-interactions to provide satisfaction when adding/editing posts, with subtle spring physics on cards and smooth transitions between states. Filter changes should be instant with staggered fade-ins for filtered items. Hover states on cards should lift and scale slightly to suggest interactivity.

## Component Selection

- **Components**:
  - Dialog (shadcn) - For add/edit post forms and email campaign composers, providing focused modal context
  - Card (shadcn) - For displaying individual campaign posts, email campaigns, and templates with hover states
  - Button (shadcn) - Primary actions with variant="default" for CTAs, variant="outline" for filters and toolbar buttons
  - Input (shadcn) - For post content, subject lines, and URL entry
  - Textarea (shadcn) - For longer post content with character count
  - Select (shadcn) - Platform picker and client selector with custom display
  - Calendar (shadcn) with Popover - Date picker for scheduling posts and emails
  - Tabs (shadcn) - Switch between social media planner and email campaigns
  - Badge (shadcn) - Platform tags, status indicators, and email status
  - Alert Dialog (shadcn) - Delete confirmation to prevent accidents
  - Separator (shadcn) - Visual dividers between sections and toolbar groups
  - Popover (shadcn) - Color picker, link insertion, and image URL dialogs
  - RichTextEditor (custom) - Professional email composer with formatting toolbar

- **Customizations**:
  - Custom platform icons component using @phosphor-icons/react (TwitterLogo, InstagramLogo, FacebookLogo, LinkedinLogo, YoutubeLogo, TiktokLogo)
  - Custom stat cards with gradient backgrounds
  - Custom post card with elevated shadow on hover and smooth scale transform
  - Empty state illustration using SVG shapes
  - Rich text editor with professional formatting toolbar (bold, italic, underline, headings H1-H3, bullet/numbered lists, text alignment, color picker, link insertion, image insertion, clear formatting)
  - ContentEditable-based editor with real-time formatting preview
  - Custom color picker popover with predefined palette and custom hex input

- **States**:
  - Buttons: Default with shadow, hover with slight lift and brightness increase, active with pressed effect, disabled with reduced opacity
  - Post Cards: Rest with subtle shadow, hover with elevated shadow and scale(1.02), selected with border accent
  - Inputs: Default with border, focus with ring and border color change, error with destructive border and message
  - Platform Filters: Inactive with outline style, active with solid fill and icon color

- **Icon Selection**:
  - Plus (add new post/campaign/template)
  - PencilSimple (edit post/campaign/template)
  - Trash (delete post/campaign/template)
  - CalendarBlank (date picker)
  - Funnel (filter indicator)
  - CheckCircle (published/completed status)
  - Envelope (email campaigns tab)
  - FileText (templates tab)
  - ChatsCircle (social media tab)
  - TextB, TextItalic, TextUnderline (text formatting)
  - TextHOne, TextHTwo, TextHThree (heading levels)
  - ListBullets, ListNumbers (list formatting)
  - TextAlignLeft, TextAlignCenter, TextAlignRight (text alignment)
  - PaintBucket (text color)
  - Link, Image (content insertion)
  - Code (clear formatting)
  - Social platform icons for platform selection

- **Spacing**:
  - Container padding: p-6 (24px)
  - Card padding: p-4 (16px)
  - Section gaps: gap-6 (24px) for major sections, gap-4 (16px) for related items
  - Form field spacing: space-y-4 (16px between fields)
  - Button padding: px-6 py-2 for primary, px-4 py-2 for secondary

- **Mobile**:
  - Single column layout for post grid on mobile (grid-cols-1)
  - Sticky header with title and add button always visible
  - Bottom-anchored filter bar on mobile using Sheet component instead of inline buttons
  - Full-screen dialog forms on mobile
  - Larger touch targets (min-h-12) for all interactive elements
  - Reduced padding (p-4) on mobile containers
