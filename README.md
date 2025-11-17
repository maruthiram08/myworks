# Zennity - Credit Card Offers & Tips App

**Tagline:** "Never Miss a Deal"

A mobile-first credit card deals app designed for iOS, targeting credit card enthusiasts in India. Zennity helps users discover, track, and maximize credit card offers, bonuses, and stacking opportunities.

![Zennity Brand](https://img.shields.io/badge/Zennity-Never%20Miss%20a%20Deal-FF6B35?style=for-the-badge)

## 🎨 Design Overview

This repository contains high-fidelity HTML/CSS mockups for 6 core screens of the Zennity app, designed with a modern, clean aesthetic following iOS design guidelines.

### View the Mockups

Open `index.html` in your browser to navigate between all screens.

**Quick Links:**
- [Screen 1: Feed Screen](screen1-feed.html) - Main feed with deals and offers
- [Screen 2: Card Detail](screen2-card-detail.html) - Individual card details
- [Screen 3: My Tracker](screen3-tracker.html) - Track active deals and goals
- [Screen 4: Offers Browser](screen4-offers.html) - Browse and discover offers
- [Screen 5: Stacking Calculator](screen5-calculator.html) - Calculate maximum value
- [Screen 6: Cards Portfolio](screen6-portfolio.html) - Manage your card portfolio

## 🎯 Key Features

### 1. **Live Deals Feed**
- Real-time credit card offers and promotions
- Filter by categories (All, My Cards, Watching, Ending Soon)
- Time-sensitive badges (🔥 Ends in 2 days)
- Quick action buttons (Track This, Save)

### 2. **Smart Tracking**
- Progress bars for spending goals
- Welcome bonus trackers
- Calendar view for upcoming actions
- Reminder system for annual fees and expirations

### 3. **Stacking Calculator**
- Calculate maximum returns by combining multiple offers
- Step-by-step optimization guide
- Category-specific recommendations
- Real-time value calculations

### 4. **Card Portfolio Management**
- Visual card representations with gradients
- Active offers count per card
- Fee status tracking
- One-tap access to card details

### 5. **Offers Browser**
- Browse offers by type (Spend, Transfer, Welcome)
- Trending offers section
- Stacking hacks and tips
- Bank bonuses and miles sales

## 🎨 Brand Identity

### Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Primary Orange** | `#FF6B35` | CTAs, badges, primary actions |
| **Secondary Purple** | `#5856D6` | Transfer bonuses, premium features |
| **Success Green** | `#34C759` | Completed tasks, positive status |
| **Warning Orange** | `#FF9500` | Expiring soon, attention needed |
| **Alert Red** | `#FF3B30` | Breaking news, urgent alerts |
| **Background** | `#FAFAFA` | App background |
| **Card Background** | `#FFFFFF` | Card surfaces |
| **Text Primary** | `#1A1A1A` | Main text |
| **Text Secondary** | `#666666` | Supporting text |
| **Text Tertiary** | `#999999` | Subtle text |

### Typography

- **Primary Font:** SF Pro (iOS system font)
- **Headings:** Bold, 20-24px
- **Body:** Regular, 14-16px
- **Captions:** Regular, 12-13px
- **Small text:** Regular, 11px

### Design Principles

- **Modern & Clean:** Card-based UI with generous white space
- **iOS Native:** Follows Apple Human Interface Guidelines
- **Scannability:** Quick information consumption
- **Time-Sensitive:** Visual emphasis on urgency (countdown timers, badges)
- **Action-Oriented:** Clear CTAs for every deal

## 📱 Screen Specifications

### Screen 1: Feed Screen
The main dashboard showing a scrollable feed of credit card deals.

**Features:**
- Horizontal filter chips
- Deal cards with badges (Hot Deal, Transfer Bonus, Welcome Offer)
- Requirements boxes with checkmarks
- Value indicators
- Dual-button actions (Track This, Save)
- Bottom tab navigation

### Screen 2: Card Detail
Detailed view of an individual credit card.

**Features:**
- Gradient hero section
- Stats grid (Active Offers, Annual Fee Due)
- Active offers list
- Card action buttons
- Back navigation

### Screen 3: My Tracker
Track active deals and upcoming actions.

**Features:**
- Tab switcher (Active, Calendar, Portfolio)
- Progress cards with visual bars
- Days left indicators
- Calendar items with status badges
- Add new goal button

### Screen 4: Offers Browser
Browse and discover new offers.

**Features:**
- Category filter tabs
- Featured calculator promotion
- Mini deal cards
- Trending offers section
- Multiple badge types

### Screen 5: Stacking Calculator
Calculate maximum value through offer stacking.

**Features:**
- Amount input
- Merchant category dropdown
- Results hero with gradient
- Step-by-step breakdown
- Color-coded steps
- Explanation section

### Screen 6: Cards Portfolio
View and manage all credit cards.

**Features:**
- My Cards / Watching tabs
- Card list with gradients
- Active offers badges
- Fee status information
- Chevron navigation
- Add card button

## 🛠️ Technical Details

### File Structure

```
.
├── index.html              # Landing page with navigation
├── styles.css              # Shared CSS styles and components
├── screen1-feed.html       # Feed Screen
├── screen2-card-detail.html # Card Detail Screen
├── screen3-tracker.html    # My Tracker Screen
├── screen4-offers.html     # Offers Browser Screen
├── screen5-calculator.html # Stacking Calculator Screen
├── screen6-portfolio.html  # Cards Portfolio Screen
└── README.md              # This file
```

### Design Specifications

- **Device:** iPhone 14 Pro (393 x 852 pt)
- **Safe Area:** 20px padding on sides
- **Border Radius:** 12px for cards, 8px for buttons
- **Shadows:** `0 2px 8px rgba(0,0,0,0.08)` for cards
- **Bottom Nav Height:** 83px (including safe area)
- **Status Bar:** 44px

### CSS Architecture

The `styles.css` file includes:
- CSS custom properties for colors and spacing
- Reusable component classes
- Typography system
- Button variants
- Card styles
- Navigation components
- Layout utilities

## 🚀 Next Steps for Development

### Phase 1: Design Refinement
- [ ] Create Figma designs based on these mockups
- [ ] Design Profile screen
- [ ] Create onboarding flow
- [ ] Design settings and preferences

### Phase 2: Frontend Development
- [ ] Convert to React Native
- [ ] Implement navigation (React Navigation)
- [ ] Add animations and transitions
- [ ] Implement pull-to-refresh
- [ ] Add skeleton loaders

### Phase 3: Backend & Data
- [ ] Design API architecture
- [ ] Set up authentication
- [ ] Implement offer data pipeline
- [ ] Create user tracking system
- [ ] Set up push notifications

### Phase 4: Features
- [ ] Implement search functionality
- [ ] Add sharing capabilities
- [ ] Create personalized recommendations
- [ ] Build analytics dashboard
- [ ] Implement referral system

## 📊 Component Library

### Buttons
```css
.button-primary    /* Orange background, white text */
.button-secondary  /* Gray background, dark text */
.button-full       /* Full width */
```

### Badges
```css
.badge-red        /* Urgent alerts */
.badge-orange     /* Warnings */
.badge-purple     /* Premium features */
.badge-green      /* Success states */
```

### Cards
```css
.card             /* Standard card with padding and shadow */
.deal-card        /* Specialized for feed items */
.progress-card    /* With progress bars */
.mini-deal-card   /* Compact version */
.portfolio-card   /* For card list items */
```

### Typography
```css
.large-title      /* 24px, bold */
.section-header   /* 16px, semibold with emoji */
.title            /* 16px, semibold */
.subtitle         /* 14px, regular */
.caption          /* 13px */
.small-text       /* 11px */
```

## 🎯 Target Audience

### Primary Users
- Credit card enthusiasts in India
- Points and miles collectors
- Financial optimization seekers
- Travel hackers
- Cashback maximizers

### User Needs
- Stay updated on limited-time offers
- Track multiple card bonuses simultaneously
- Understand complex offer stacking
- Maximize rewards across categories
- Manage annual fees strategically

## 📱 iOS Design Compliance

- **SF Pro Font:** Uses iOS system font
- **Safe Areas:** Respects iPhone notch and home indicator
- **Tab Navigation:** Bottom navigation bar (iOS standard)
- **Haptics:** Ready for tactile feedback
- **Gestures:** Swipe-friendly card layouts
- **Accessibility:** High contrast ratios (WCAG AA compliant)

## 🔄 Future Enhancements

1. **Social Features**
   - Share deals with friends
   - Community ratings and reviews
   - Discussion forums

2. **AI Recommendations**
   - Personalized offer suggestions
   - Spending pattern analysis
   - Optimal card usage predictions

3. **Integrations**
   - Bank account linking
   - Automatic spend tracking
   - Calendar integration
   - Email parsing for offers

4. **Gamification**
   - Achievement badges
   - Leaderboards
   - Streak tracking
   - Rewards for consistent usage

## 📄 License

This design is proprietary and created for the Zennity app project.

## 👥 Credits

Designed with modern iOS design principles and built with HTML/CSS for rapid prototyping.

---

**Zennity** - Never Miss a Deal 🎯
