# Property Analyzer

A full-stack web application for realtors to provide clients with comprehensive property analysis including estimated value, comparable sales, market context, and more.

## Features

- **Address Search**: Search properties by street address, city, state, and ZIP code
- **Search History**: Automatically saves recent searches in localStorage for quick access
- **Property Summary**: Displays estimated value, property details (beds, baths, sqft, lot size, year built, property type), last sold information, and price per square foot
- **Photo Carousel**: Interactive image carousel with thumbnails (when photos are available)
- **Comparable Properties**: View and sort comparable sales by distance, sale date, or price
- **Market Context**: Additional information including HOA fees, property taxes, walk score, and school ratings (when available)
- **Confidence Indicator**: Shows data reliability based on number and recency of comparable sales
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Loading States**: Skeleton UI during data fetching
- **Error Handling**: Clear error messages for invalid addresses, API issues, or network problems

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Vanilla CSS** - Styling with CSS variables

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Axios** - HTTP client for RapidAPI calls
- **express-rate-limit** - API rate limiting
- **dotenv** - Environment variable management

### APIs
- **RapidAPI Redfin5** - Property data source

## Project Structure

```
property-analyzer/
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Comparables.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   ├── MarketContext.jsx
│   │   │   ├── PhotoCarousel.jsx
│   │   │   ├── PropertySummary.jsx
│   │   │   └── *.css
│   │   ├── pages/             # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Results.jsx
│   │   │   └── *.css
│   │   ├── App.jsx            # Root component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                    # Backend Express API
│   ├── services/
│   │   └── redfin.js          # RapidAPI integration
│   ├── utils/
│   │   ├── cache.js           # In-memory caching
│   │   └── validation.js      # Input validation
│   ├── index.js               # Server entry point
│   ├── .env.example
│   └── package.json
├── package.json               # Root package.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **RapidAPI Account** with Redfin5 API subscription

### Step 1: Clone or Download

```bash
cd propertyanalyzer
```

### Step 2: Install Dependencies

You can install all dependencies at once from the root:

```bash
npm run install:all
```

Or install manually:

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Step 3: Configure Environment Variables

#### Server Environment Variables

1. Copy the example file:
```bash
cd server
cp .env.example .env
```

2. Edit `server/.env` and add your RapidAPI credentials:
```env
PORT=3001
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=redfin5.p.rapidapi.com
CACHE_TTL=1800000
```

**How to get RapidAPI credentials:**
1. Sign up at [RapidAPI](https://rapidapi.com/)
2. Subscribe to a Redfin5 API (search for "Redfin" in the API marketplace)
3. Copy your API key from the dashboard
4. The host will typically be `redfin5.p.rapidapi.com` but verify in your API dashboard

**Environment Variables Explained:**
- `PORT`: Port for the backend server (default: 3001)
- `RAPIDAPI_KEY`: Your RapidAPI key (required)
- `RAPIDAPI_HOST`: RapidAPI host for Redfin5 (default: redfin5.p.rapidapi.com)
- `CACHE_TTL`: Cache time-to-live in milliseconds (default: 30 minutes)

### Step 4: Run the Application

#### Option 1: Run Both Client and Server Together (Recommended)

From the root directory:
```bash
npm run dev
```

This starts:
- Backend server on http://localhost:3001
- Frontend dev server on http://localhost:5173

#### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Usage

### Searching for a Property

1. On the home page, enter the property address details:
   - **Street Address** (required)
   - City, State, and ZIP (optional but recommended for better results)
2. Click "Analyze Property"
3. View the comprehensive property analysis on the results page

### Recent Searches

Your recent searches are automatically saved and displayed on the home page for quick access. Click any previous search to reload that property's data.

### Sorting Comparables

On the results page, use the "Sort by" dropdown to organize comparable properties by:
- **Closest**: Distance from the subject property
- **Newest Sale**: Most recent sale date
- **Highest Price**: Highest to lowest sale price
- **Lowest Price**: Lowest to highest sale price

## API Endpoints

The backend provides the following API endpoints:

### `GET /api/health`

Health check endpoint to verify server and API configuration status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "apiConfigured": true,
  "cache": {
    "total": 5,
    "valid": 3,
    "expired": 2
  }
}
```

### `GET /api/property?address={address}`

Get comprehensive property data including details, pricing, and comparables.

**Parameters:**
- `address` (required): Full property address

**Response:**
```json
{
  "address": "123 Main St, San Francisco, CA 94102",
  "propertyDetails": {
    "beds": 3,
    "baths": 2,
    "sqft": 1800,
    "lotSize": 5000,
    "yearBuilt": 1990,
    "propertyType": "Single Family",
    "pricePerSqft": 750
  },
  "pricing": {
    "estimatedValue": 1350000,
    "lastSoldDate": "2020-05-15",
    "lastSoldPrice": 1200000
  },
  "photos": ["url1", "url2", ...],
  "additionalInfo": {
    "hoa": 250,
    "taxAmount": 15000,
    "walkScore": 85,
    "schoolRating": 8
  },
  "comparables": [...],
  "confidence": {
    "score": "High",
    "reason": "5 comparable sales, 3 within last 6 months"
  },
  "fromCache": false
}
```

### `GET /api/comps?address={address}`

Get only comparable properties (if you need comps separately).

**Parameters:**
- `address` (required): Full property address

## Features

### Caching

The server implements in-memory caching with a 30-minute TTL (configurable via `CACHE_TTL` env variable). This reduces API calls and improves response times for repeated searches.

Cache keys are normalized to handle address variations (e.g., "123 Main St" and "123 main street" will match the same cache entry).

### Rate Limiting

API endpoints are rate-limited to 100 requests per 15 minutes per IP address to prevent abuse and manage API quota usage.

### Input Validation

All address inputs are validated and normalized:
- Removes extra whitespace
- Ensures minimum/maximum length
- Normalizes street type abbreviations (St, Ave, Rd, etc.)
- Prevents invalid characters

### Error Handling

The application provides user-friendly error messages for:
- **Invalid address**: "Address is required" or "Invalid address format"
- **Property not found**: "Property not found. Please verify the address and try again."
- **API rate limit**: "API rate limit exceeded. Please try again later."
- **Server errors**: "An error occurred while fetching property data. Please try again."

## Building for Production

### Build the Frontend

```bash
cd client
npm run build
```

This creates an optimized production build in `client/dist/`.

### Run the Production Server

```bash
# From server directory
npm start
```

For production deployment, serve the built frontend files and run the backend server. You can use services like:
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Heroku, Railway, AWS EC2, DigitalOcean

## Troubleshooting

### "Cannot connect to server" or proxy errors

- Ensure the backend server is running on port 3001
- Check that `RAPIDAPI_KEY` is properly set in `server/.env`
- Verify the proxy configuration in `client/vite.config.js`

### "API access denied" (403 error)

- Verify your RapidAPI key is correct
- Check that you have an active subscription to the Redfin5 API
- Ensure `RAPIDAPI_HOST` matches your API subscription

### "Property not found" for valid addresses

- The Redfin5 API may not have data for all properties
- Try different address formats (with/without ZIP, with/without unit numbers)
- Verify the property exists in Redfin's database

### API rate limit errors

- Wait for the rate limit window to reset (15 minutes)
- Consider upgrading your RapidAPI plan for higher limits
- Cache results are used automatically to reduce API calls

## Development

### Available Scripts

**Root:**
- `npm run dev` - Run both client and server
- `npm run dev:client` - Run only client
- `npm run dev:server` - Run only server
- `npm run build` - Build client for production
- `npm start` - Start production server

**Client:**
- `npm run dev` - Start Vite dev server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Server:**
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

## License

This project is for commercial use by realtors and real estate professionals.

## Support

For issues with:
- **RapidAPI**: Check [RapidAPI Support](https://rapidapi.com/support)
- **Redfin5 API**: Review API documentation on RapidAPI
- **Application bugs**: Create an issue in your project repository

---

**Built with ❤️ for real estate professionals**
