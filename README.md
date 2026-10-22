# Title

Food Delivery Partner App Development

## Run locally on Android

To install an app that opens without Metro or a USB connection, run:

```powershell
npm.cmd run android:standalone
```

This bundles JavaScript into the APK using the existing `demoStandalone` build option. Re-run it after code changes. Backend features still require access to the configured API.

For development with live code updates, use Metro:

Connect your phone with USB debugging enabled, then run these commands from the project root in two terminals:

```powershell
# Terminal 1: keep Metro running (this project uses port 8085)
npm.cmd run start

# Terminal 2: build, install, and launch the development app
npm.cmd run android
```

If the app reports "Unable to load script", check that Metro is running and reconnect the USB port forwarding:

```powershell
adb reverse tcp:8085 tcp:8085
```

Then reload the app. Use `npm.cmd run android` to replace an installed build that expects a bundled script with the development build. A development build needs Metro running; an APK for use without Metro must include its JavaScript bundle.

## Objective

The goal of this project is to develop a mobile application for food delivery partners to manage their deliveries efficiently. The app will allow delivery partners to accept and track orders, update their availability status, navigate to restaurant and customer locations, and receive payments.

## Tech Stack

- **Frontend:** React Native (CLI)
- **Backend:** Node.js with Express.js
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Token)
- **Navigation:** React Navigation
- **State Management:** Context API with AsyncStorage
- **Maps & Geolocation:** Google Maps API
- **Notifications:** Firebase Cloud Messaging (FCM) with Notifee
- **Styling:** Styled Components / Tailwind CSS

## Completion Instructions

### Functionality

#### Must Have

1. **User Authentication**
   - Login using phone number and password.
   - JWT authentication with token storage using AsyncStorage.
2. **Order Management**
   - View assigned orders.
   - Accept or reject new orders.
   - Update order status (Picked Up, Delivered, etc.).
3. **Real-time Tracking**
   - Track live location of the delivery partner.
   - Show delivery route on Google Maps.
4. **Earnings & Payments**
   - View completed deliveries and earnings breakdown.
   - Payment withdrawal request option.
5. **Notifications**
   - Real-time push notifications for new orders and status updates.
6. **Profile & Settings**
   - Update profile details (name, vehicle type, etc.).
   - Change availability status (Online/Offline).
7. **Dark Mode Support**
   - Implement theme switching based on system preference.

#### Nice to Have

- **Ratings & Reviews**
  - Allow customers to rate delivery partners.
- **In-app Chat**
  - Enable communication between customers and delivery partners.
- **SOS Button**
  - Emergency contact option for safety.

### Guidelines to Develop a Project

#### Must Have

1. **Code Structure**
   - Follow proper folder structure for maintainability.
   - Separate API service calls in a dedicated file.
2. **Performance Optimization**
   - Optimize API calls and cache frequently used data.
   - Use lazy loading for images.
3. **Error Handling**
   - Implement proper error handling and toast messages for API failures.

#### Nice to Have

- Implement offline mode to store data temporarily when internet connectivity is lost.
- Unit test key functionalities.

### Submission Instructions

#### Must Have

- Provide source code via GitHub repository.
- Include proper README documentation with setup instructions.
- Ensure all API endpoints are functional.

#### Nice to Have

- Submit a demo video showcasing app features.
- Deploy a backend API on a cloud server (e.g., AWS, DigitalOcean).

## Resources

### Design Files

- Figma design link (if available)

### APIs

- **Authentication API**
  - `POST /login`
  - `POST /register`
  - `GET /profile`
- **Orders API**
  - `GET /orders`
  - `POST /order/accept`
  - `POST /order/update-status`
- **Payments API**
  - `GET /earnings`
  - `POST /withdraw`

### Third-Party Packages

- Axios (API calls)
- React Navigation (for screen navigation)
- Google Maps API (for location tracking)
- Notifee (for push notifications)
- AsyncStorage (for local storage)



## Indzon delivery API restoration

The integration on `Indz_dynamic` follows the local `amaraa` branch. Only this
Delivery App is changed. Indzon colors, assets, package identity and navigation
are retained. Demo records and the local success service have been removed.

### Deployment configuration required

Set `DELIVERY_API_BASE_URL` and `PUBLIC_API_BASE_URL` in `src/config/api.js` to the
confirmed Indzon HTTPS URLs, including their service path prefixes. The delivery URL uses this branch's existing production host,
`https://amaraa.co.in:2026/delivery_boy`, because the older reference hostname
failed DNS resolution. The public URL retains the reference configuration.
If a separate Indzon deployment is supplied, replace both values here.
Empty or invalid URLs are rejected before a network request is sent. React Native does not automatically
load a shell `.env` file into this configuration.

The reference delivery base URL is
`https://apiamara.godavariwave.com/delivery_boy`; the archived production service
on this branch had changed it to `https://amaraa.co.in:2026/delivery_boy`.
The reference public base URL is `https://varadhifood.com:2636/public_app`.
None of these identifies a confirmed Indzon deployment.

The actual reference implementation sends JSON with a 10-second timeout and
persists the login response user under AsyncStorage key `user`. It does **not**
attach JWT/Bearer headers, despite the older project overview mentioning JWT.
No new authentication scheme or endpoint has been invented. Order acceptance
sends `deliveryarr`, `id`, `order_status: 8`, `order_id`; pickup sends `id` and
`customer_id`; completion sends `order_id`, `delivery_id`, `delivery_otp`, and
`customer_id`. Status advances only after backend status 200. Customer OTP entry
is restored using the existing Indzon modal styles.

### Reference endpoints

All are POST except `getlocation` (GET). Only `application_common_api` uses the
public API base URL; all others use the delivery API base URL.

| Feature | Endpoint |
| --- | --- |
| Login | `/logincheck` |
| Current/available/assigned deliveries | `/getcurrentorders` |
| Order items | `/getorderdetails` |
| Accept | `/acceptorderstatus` |
| Pickup | `/updateoderstatdata` |
| Complete with customer OTP | `/completedorder` |
| Register | `/adddeliveryboy` |
| Delete account | `/deleteuseraccount` |
| Registration locations | `/getlocation` |
| Profile | `/getprofiledata` |
| Update profile | `/updateprofiledata` |
| Delivery history | `/getordersdatewise` |
| Earnings | `/getpayments` |
| Support contact | `/application_common_api` |
| Account summary | `/deliveryboypayments` |
| Payment reports | `/deliveryboypaymentreports` |
| Device token registration | `/postplayer_id` |
| Mobile lookup | `/checkthemobilenumber` |
| Reset password | `/updatenewpassword` |
| Availability | `/deliveryboyactivestatus` |
| COD amounts | `/getcodamounts` |
| COD settlements | `/getcodsettledhistory` |

### Notifications and platform requirements

The reference has FCM/Notifee push delivery and device-token registration, but no
notification-history, mark-as-read, or remote-preferences endpoint. The retained
Notifications screen lists active device notifications; Settings controls the
actual device notification permission. These screens no longer display fictional
records or imply remote persistence. Tokens are registered after login and on
rotation. Foreground listeners are removed on unmount.

The checked-in Android Firebase file belongs to another application
(`com.amaraadelivery`), while Indzon's application ID remains
`com.indzon.delivery`. Supply a matching Firebase client in `google-services.json`;
the Gradle plugin activates automatically when the package matches. The existing
`-PenableFirebase=true` override also remains available. iOS needs its matching
Firebase plist, push entitlement/provisioning and physical-device verification.
Missing push configuration is reported without preventing API login. Analytics
collection stays disabled. Location permission is requested only while the Home
screen is focused and the driver is online.

### Verification

Run `npm test -- --runInBand`, `npm run lint`, and
`cd android; .\gradlew.bat :app:assembleDebug --offline`.
Tests cover all 22 service request contracts, HTTP/network failures, missing URL
configuration, persisted login/logout, and delivery screen actions. Network
responses in these tests are fixtures, never runtime fallbacks.

Before release, confirm the backend deployment, configure Indzon Firebase and use a test delivery partner
account to verify login, available/assigned deliveries, acceptance, pickup,
customer OTP completion, refreshed earnings/history/reports/COD, registration,
profile updates, password reset, support contact, availability and real pushes.
Live workflows cannot be certified without backend URLs, credentials, test
orders and the matching Firebase configuration. iOS build/device checks require
macOS/Xcode.

Live login check: the configured production delivery host responded with HTTP 200
and `{"status":500,"msg":"Invalid credentials"}` for the supplied account.
This verifies reachability, not successful authentication. No account password
is stored in configuration or documentation.
