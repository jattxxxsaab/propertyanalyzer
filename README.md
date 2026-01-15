# Property Analyzer

A professional web application for realtors to help homeowners understand their property's market position. Enter any property address to get comprehensive statistics including property details, comparable sales, market trends, and estimated valuations.

![Property Analyzer](https://img.shields.io/badge/Status-Ready-green) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green)

## Features

- **Property Details & Valuation**: Get estimated market value, property specifications, and price history
- **Comparable Sales**: View recent sales of similar properties in the area
- **Market Trends**: Analyze neighborhood trends with interactive charts
- **Professional UI**: Clean, modern interface optimized for client presentations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- **React** - Modern UI library for building interactive interfaces
- **Recharts** - Beautiful, responsive charts for data visualization
- **Axios** - HTTP client for API requests
- **CSS3** - Custom styling with gradient backgrounds and animations

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Project Structure

```
property-analyzer/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── PropertyDetails.js
│   │   │   ├── ComparableSales.js
│   │   │   └── MarketTrends.js
│   │   ├── App.js           # Main application component
│   │   ├── App.css          # Application styles
│   │   └── index.js         # Application entry point
│   └── package.json
├── backend/                  # Express backend API
│   ├── server.js            # API server and routes
│   ├── .env.example         # Environment variables template
│   └── package.json
├── API_INTEGRATION.md        # API integration guide
└── README.md                # This file
```

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository** (or navigate to the project folder):
   ```bash
   cd propertyanalyzer
   ```

2. **Install dependencies for both frontend and backend**:
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Set up environment variables** (optional for mock data):
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env to add your API keys when you get them
   ```

### Running the Application

You have two options to run the application:

#### Option 1: Run Both Frontend and Backend Together (Recommended)

From the root directory:
```bash
npm run dev
```

This will start:
- Backend API server on http://localhost:5001
- Frontend React app on http://localhost:3001

#### Option 2: Run Frontend and Backend Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Accessing the Application

Open your browser and navigate to:
```
http://localhost:3001
```

The application is now running with **mock data**. You can:
- Enter any address to see sample property data
- Click "Try Demo Address" to load pre-populated data
- Explore all features including property details, comparable sales, and market trends

## Using Mock Data vs Real APIs

### Current Setup: Mock Data

The application currently uses **mock data** for demonstration purposes. This means:
- ✅ No API keys required
- ✅ No API costs
- ✅ Perfect for development and demos
- ✅ Works immediately after installation

### Integrating Real Property APIs

The application is **pre-configured** with RapidAPI Redfin integration!

#### Quick Start with RapidAPI

If you have a RapidAPI key:

1. **Your API key is already configured** in `backend/.env`
2. **The integration code is ready** in `backend/server.js`
3. **Just verify your API host** - See [RAPIDAPI_SETUP.md](./RAPIDAPI_SETUP.md) for details

#### Testing Your API

```bash
# Start the backend
cd backend
npm run dev

# In another terminal, test the API
curl http://localhost:5001/api/health
```

See [RAPIDAPI_SETUP.md](./RAPIDAPI_SETUP.md) for:
- How to verify your RapidAPI endpoint configuration
- Testing and troubleshooting steps
- Switching between mock and real data
- API cost management tips

#### Alternative API Providers

For other property data APIs, see [API_INTEGRATION.md](./API_INTEGRATION.md):
- **Attom Data Solutions** (Professional, comprehensive)
- **Realty Mole** (Budget-friendly)
- **Zillow API** (Well-known brand)

## API Endpoints

### Backend API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |
| GET | `/api/property?address={address}` | Get property data by address |

### Example Request

```bash
curl "http://localhost:5001/api/property?address=123%20Main%20St%2C%20Los%20Angeles%2C%20CA%2090001"
```

### Response Format

```json
{
  "address": "123 Main St, Los Angeles, CA 90001",
  "propertyDetails": {
    "beds": 3,
    "baths": 2,
    "sqft": 1850,
    "lotSize": 5200,
    "yearBuilt": 1995,
    "propertyType": "Single Family",
    "features": ["Hardwood Floors", "Central AC", "Garage"]
  },
  "valuation": {
    "estimatedValue": 725000,
    "priceHistory": [...],
    "confidence": "Medium"
  },
  "comparableSales": [...],
  "marketTrends": {...}
}
```

## Development

### Available Scripts

#### Root Directory
- `npm run dev` - Run both frontend and backend concurrently
- `npm run dev:frontend` - Run frontend only
- `npm run dev:backend` - Run backend only
- `npm run build` - Build frontend for production

#### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

#### Backend
- `npm start` - Start server (production)
- `npm run dev` - Start server with nodemon (development)

### Making Changes

**Frontend Components:**
- Edit files in `frontend/src/components/`
- Changes auto-reload in the browser

**Backend API:**
- Edit `backend/server.js`
- Server auto-restarts with nodemon

**Styling:**
- Component styles: `frontend/src/components/*.css`
- Global styles: `frontend/src/App.css` and `frontend/src/index.css`

## Deployment

### Frontend (React)

The React app can be deployed to:
- **Vercel** (Recommended) - [vercel.com](https://vercel.com)
- **Netlify** - [netlify.com](https://netlify.com)
- **GitHub Pages**
- **AWS S3 + CloudFront**

Build the frontend:
```bash
cd frontend
npm run build
```

### Backend (Node.js/Express)

The backend API can be deployed to:
- **Heroku** - [heroku.com](https://heroku.com)
- **Railway** - [railway.app](https://railway.app)
- **AWS EC2 or Elastic Beanstalk**
- **Google Cloud Run**
- **DigitalOcean App Platform**

Remember to:
1. Set environment variables on your hosting platform
2. Update the frontend API URL to point to your deployed backend
3. Configure CORS settings for your production domain

## Customization

### Branding

Update branding in `frontend/src/App.js`:
```javascript
<h1>Your Company Name</h1>
<p>Your custom tagline</p>
```

### Colors

Modify the color scheme in `frontend/src/index.css` and component CSS files:
```css
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

### Features

Add or remove statistics by modifying:
- `backend/server.js` - Update mock data structure
- Component files - Update display logic

## Troubleshooting

### Port Already in Use

If port 3001 or 5001 is already in use:

**Frontend:**
```bash
# Set custom port
PORT=3002 npm start
```

**Backend:**
```bash
# Edit backend/.env
PORT=5002
```

### CORS Errors

If you see CORS errors, ensure:
1. Backend server is running
2. `frontend/package.json` has the correct proxy setting: `"proxy": "http://localhost:5001"`

### Dependencies Issues

Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Future Enhancements

Potential features to add:
- [ ] User authentication for saving searches
- [ ] PDF report generation
- [ ] Email property reports to clients
- [ ] Neighborhood school ratings
- [ ] Property image gallery
- [ ] Mortgage calculator
- [ ] Historical market data (5+ years)
- [ ] Export data to CSV/Excel
- [ ] Multi-language support
- [ ] Mobile app version

## Support

For API integration help, see [API_INTEGRATION.md](./API_INTEGRATION.md)

## License

This project is created for commercial use by realtors. Feel free to customize and brand it for your business.

## Author

Built for professional realtors who want to provide valuable insights to their clients.

---

**Ready to get started?** Follow the installation steps above and start analyzing properties in minutes!
