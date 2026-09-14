# SeunFinance

SeunFinance — a professional global money toolkit for currency conversion, finance calculators and crypto tracking.

## Included tools

1. Currency Converter
2. Mortgage Calculator
3. Loan Calculator
4. Salary Calculator
5. Tax Estimator
6. Fuel/Gas Calculator
7. Crypto Tracker
8. All Rates table (bonus section)

## Stack

- HTML5
- CSS3
- Vanilla JavaScript
- ExchangeRate-API open-access FX feed
- CoinMarketCap public keyless crypto endpoint with CoinGecko fallback
- Firebase Hosting ready

## Deploy to Firebase Hosting

1. Install Node.js and Firebase CLI.
2. In this folder run:
   `firebase login`
3. Replace `YOUR-FIREBASE-PROJECT-ID` in `.firebaserc`.
4. Run:
   `firebase init hosting` if you want Firebase to rewrite the config for your own project.
5. Deploy:
   `firebase deploy --only hosting`

Firebase Hosting provides HTTPS, CDN delivery and free `web.app` / `firebaseapp.com` subdomains.

## Before launch

Replace every `YOUR-DOMAIN.web.app` value with your real domain.
Replace the placeholder contact information in `privacy.html`.
Add your actual AdSense publisher line to `ads.txt` only after Google gives you the line.
Add your Google AdSense script only after your AdSense account/site is approved.

## Important data notes

The free ExchangeRate-API open-access feed updates approximately once per day and requires attribution. The site therefore says "latest available rate" instead of claiming tick-by-tick FX pricing.

The crypto section refreshes the browser periodically. Public endpoints can be rate-limited. For a high-traffic commercial deployment, use a server-side/proxied paid API plan rather than exposing private API keys in browser JavaScript.

## AdSense readiness

This template intentionally includes:
- clear navigation
- About, Privacy and Terms pages
- original explanatory content
- functional tools
- responsive layout
- non-deceptive ad placeholders

AdSense approval is never guaranteed. Before applying, make sure the site is complete, useful, accurate, and compliant with current Google policies. Do not click your own ads or encourage visitors to click them.

## Customization

Edit `app.js` for formulas and API providers, `styles.css` for branding, and `index.html` for content/SEO.
