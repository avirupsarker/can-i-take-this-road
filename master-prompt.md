You are the lead product engineer, senior frontend engineer, backend engineer, product designer, QA engineer, and technical project manager for this project.

Your job is to independently build, test, debug, refine, and prepare the product described below.

I am a coding beginner, so you should handle the technical implementation yourself. Do not wait for me to make technical decisions unless my explicit input is required.

The goal is not to build a huge product.

The goal is to build a polished, working hackathon MVP that convincingly solves a real Bengaluru problem and can be demonstrated live.

==================================================
1. PRODUCT
==================================================

Product name:

CAN I TAKE THIS ROAD?

Tagline:

"Google Maps tells you how to get there. We tell you whether you should go right now."

Core user question:

"Should I take this route right now?"

The user enters:

- Origin
- Destination

The application evaluates:

- Current traffic
- Current weather
- Bengaluru-specific road-condition risk
- Waterlogging risk where relevant

It then produces:

- GO
- WAIT
- AVOID

along with:

- Route Risk Score from 0 to 100
- Current travel time
- Normal/static travel time
- Traffic delay
- Traffic risk
- Weather risk
- Road-condition risk
- Waterlogging risk where relevant
- A concise explanation of WHY the recommendation was produced

The product should feel like a useful decision-making layer on top of existing navigation.

Do NOT build a complete navigation application.

==================================================
2. CORE PRODUCT POSITIONING
==================================================

The central idea is:

Google Maps answers:

"How do I get there?"

This product answers:

"Should I go right now?"

The application should feel immediately useful during Bengaluru traffic and rain conditions.

The experience should be understandable within a few seconds.

The GO / WAIT / AVOID decision must be the strongest visual element on the results screen.

==================================================
3. NON-STOP EXECUTION RULE
==================================================

Work autonomously.

Do not stop because you encounter:

- Bugs
- Build errors
- TypeScript errors
- Dependency issues
- API errors
- Styling problems
- Routing problems
- Failed tests
- Configuration issues
- Browser issues
- Deployment issues

For ordinary problems, follow this loop:

DIAGNOSE → FIX → TEST → VERIFY → CONTINUE

Do not merely report a problem and wait for me.

Do not abandon partially implemented functionality.

Do not declare the project complete without testing it.

If your first implementation approach fails, use a simpler reliable approach.

If an external integration becomes unexpectedly difficult, implement the simplest reasonable fallback while preserving the product concept.

==================================================
4. TIME PRIORITY
==================================================

This is a time-constrained hackathon build.

Prioritize in this order:

1. Working core product
2. Google Routes integration
3. Open-Meteo integration
4. Risk calculation
5. GO / WAIT / AVOID result
6. Explanation
7. Polished UI
8. Error/loading states
9. Testing
10. Deployment

Do not spend excessive time on secondary features.

Do not over-engineer.

If a feature does not materially improve the answer to:

"Should I take this route right now?"

do not build it.

==================================================
5. TECHNOLOGY STACK
==================================================

Use:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide icons or another free icon library
- Google Routes API
- Open-Meteo
- Local TypeScript/JSON road-risk data
- Vercel for deployment

Use simple, maintainable architecture.

Do not add unnecessary infrastructure.

Do NOT add:

- Authentication
- User accounts
- Database
- Supabase
- Firebase
- Payments
- Admin dashboard
- Social features
- Complex notification systems
- Mobile application
- Complex crowdsourcing
- Paid AI APIs

==================================================
6. FIRST STEP: GOOGLE API KEY
==================================================

Before implementing the actual Google Routes integration:

1. Inspect the current project folder.
2. Inspect the existing environment/configuration.
3. Check whether GOOGLE_MAPS_API_KEY exists.
4. If .env.local does not exist, create it.
5. Add:

GOOGLE_MAPS_API_KEY=

6. Make sure .env.local is included in .gitignore.
7. Ask me to provide the Google Routes API key.
8. When I provide it, store it securely in .env.local.
9. Do not repeat the key back to me.
10. Do not print the key in logs.
11. Do not hardcode the key in source code.
12. Do not expose the key to the browser/client bundle.

The Google API key must remain server-side.

If the key is missing, ask me for it.

Do not proceed with a fake key.

==================================================
7. GOOGLE ROUTES API
==================================================

Use the Google Routes API for actual route calculation.

Use:

travelMode = DRIVE

Use traffic-aware routing:

routingPreference = TRAFFIC_AWARE

Do NOT use TRAFFIC_AWARE_OPTIMAL unless there is a compelling technical reason.

Request only the fields required by the application.

Prefer fields such as:

- routes.duration
- routes.staticDuration
- routes.distanceMeters
- routes.polyline.encodedPolyline
- routes.description
- routes.legs

Do NOT use wildcard field masks.

The application should use Google's traffic-aware duration as the current travel-time signal.

The static duration represents travel time without current traffic.

Calculate:

traffic delay = traffic-aware duration - static duration

traffic delay percentage:

delay percentage =
(traffic-aware duration - static duration)
/
static duration
× 100

Use this to determine traffic risk.

Suggested traffic-risk rules:

0-10% extra:
10 risk

10-25% extra:
30 risk

25-50% extra:
60 risk

50%+ extra:
90 risk

These are product rules for this prototype, not scientific or industry-standard thresholds.

==================================================
8. GOOGLE API SECURITY
==================================================

Never expose GOOGLE_MAPS_API_KEY in client-side JavaScript.

The browser should call our own server-side route/function.

That server-side code should call Google Routes API.

Never:

- Put the key directly in React components
- Put the key in public files
- Commit .env.local
- Display the key
- Log the key
- Return the key in an API response

==================================================
9. OPEN-METEO
==================================================

Use Open-Meteo for weather.

No API key is required for the free non-commercial API.

Do not waste time trying to obtain an Open-Meteo API key.

Use:

timezone=Asia/Kolkata

Use current and relevant hourly weather variables.

At minimum consider:

- precipitation
- rain
- precipitation probability
- weather code

Use current/latest available weather information.

The weather service is model-based, so do not describe it as a physical roadside sensor.

==================================================
10. WEATHER ALONG THE ROUTE
==================================================

Open-Meteo works with coordinates rather than a route.

Use the Google route to obtain representative points.

For the MVP, use a small number of points such as:

- Origin
- Approximate route midpoint
- Destination

Do not sample hundreds of points.

If the Google route polyline is available, decode it and use a representative midpoint where practical.

Use Open-Meteo's ability to request multiple coordinates where useful.

The objective is to determine whether weather conditions are broadly unfavorable along the journey.

Do not attempt to build a meteorological system.

==================================================
11. WEATHER RISK
==================================================

Create a deterministic weather-risk score from 0 to 100.

Use reasonable product rules such as:

No meaningful rain / low probability:
10

Light rain / low probability:
30

Moderate rain or high probability:
50

Heavy rain / very high probability:
75

Very heavy or persistent rain:
90

Use multiple available weather signals where appropriate.

These are product rules, not scientific claims.

==================================================
12. BENGALURU ROAD-CONDITION DATA
==================================================

Create a small Bengaluru-specific road-risk dataset.

Target approximately 10-15 relevant roads, corridors, or areas.

Potential examples may include major Bengaluru areas such as:

- Whitefield
- Marathahalli
- Silk Board
- Bellandur
- Koramangala
- HSR Layout
- Outer Ring Road
- Electronic City
- Indiranagar
- KR Puram

Do not assume every example above necessarily has elevated current risk.

The dataset must contain only information that can reasonably be represented as prototype/reference data.

Possible fields:

- Area/corridor
- potholeRisk
- waterloggingRisk
- disruptionRisk
- overallRisk
- source/reference where available
- lastVerified

The road dataset must NOT be represented as live real-time road data unless it actually is.

Clearly distinguish:

LIVE:
- Google traffic
- Current weather data

PROTOTYPE / LOCAL DATA:
- Road-condition risk dataset

==================================================
13. ROAD DATA TIME LIMIT
==================================================

Do not spend a large portion of the hackathon researching or integrating a complex external road-condition data source.

The road-condition layer is intentionally a lightweight prototype.

If reliable public information can be incorporated quickly, do so.

Otherwise, create a clearly labelled local prototype road-risk dataset and move on.

Do not allow road-data research to delay:

- Google Routes integration
- Open-Meteo integration
- risk calculation
- core UX
- testing
- local completion

==================================================
14. ROUTE MATCHING
==================================================

The application needs to determine whether the calculated route intersects or passes sufficiently close to known high-risk Bengaluru areas.

Do not build complex GIS infrastructure.

Use a simple practical approach.

For example:

- Compare representative route coordinates against known area coordinates.
- Use a reasonable geographic radius.
- Aggregate matching road/area risks.

The route-level road risk should reflect relevant risk areas along the route.

Do not simply apply the highest risk in the entire dataset to every route.

A route through Whitefield should not automatically inherit a Koramangala risk.

==================================================
15. WATERLOGGING
==================================================

Waterlogging is especially important during Bengaluru rain.

Treat waterlogging as a component of road-condition risk.

Do not accidentally double-count the same waterlogging signal.

The internal calculation should be clearly defined:

roadRisk can be derived from:

- pothole risk
- waterlogging risk
- disruption risk

If waterlogging is shown separately in the UI, it should normally be a breakdown/detail of road-condition risk rather than another completely independent weighted factor.

The final score must not unintentionally count the same factor twice.

==================================================
16. RISK ENGINE
==================================================

Use a deterministic scoring system.

Suggested weights:

Traffic Risk:
40%

Weather Risk:
35%

Road Condition Risk:
25%

Final score:

trafficRisk × 0.40
+
weatherRisk × 0.35
+
roadRisk × 0.25

Map the final score to:

0-39:
GO

40-69:
WAIT

70-100:
AVOID

These weights and thresholds are product rules for this prototype.

They are not scientific, medical, government, or industry-standard thresholds.

The code should keep these values centralized and easy to modify.

==================================================
17. DATA AVAILABILITY AND RISK CALCULATION
==================================================

Never treat missing data as zero risk.

If one of the three major inputs is unavailable:

- clearly identify the unavailable factor
- do not fabricate a value
- do not silently assign it a low-risk score
- adjust/renormalize the available risk weights if producing a partial score is logically appropriate
- clearly indicate that the result is based on incomplete data

If missing data is essential to producing a trustworthy recommendation, do not produce GO / WAIT / AVOID.

Instead, show a clear retry/error state.

The displayed risk score must always reflect the actual available inputs.

==================================================
18. EXPLANATION SYSTEM
==================================================

Do not use an AI API to generate explanations.

Use deterministic explanation templates based on the actual risk factors.

Examples:

"Traffic is currently the biggest risk on this route, adding approximately X minutes."

"Rain conditions are currently unfavorable for this journey."

"Known road-condition risk is elevated along part of this route."

"Waterlogging risk is elevated around part of this route."

"Traffic, rain, and road-condition risks are all elevated."

The explanation must reflect the actual data.

Never invent a reason.

Never claim something happened unless the underlying data supports it.

==================================================
19. LANDING PAGE
==================================================

Create a polished landing experience.

Primary headline:

CAN I TAKE THIS ROAD?

Supporting text:

"Know what Bengaluru's roads are really like before you leave."

Inputs:

From
[Enter starting location]

To
[Enter destination]

Primary CTA:

CHECK MY ROUTE

Supporting information:

Traffic + weather + road conditions

Make the experience extremely simple.

==================================================
20. RESULTS PAGE
==================================================

The result should strongly prioritize the recommendation.

Example:

AVOID RIGHT NOW

Route Risk
82/100

Whitefield → Koramangala

48 min current travel time
32 min normal
+16 min traffic delay

Then show factor cards:

TRAFFIC
High

WEATHER
High

ROAD CONDITION
High

WATERLOGGING
High

Then:

WHY?

A short explanation based on the actual data.

Then:

CHECK ANOTHER ROUTE

Do not overwhelm the user with technical information.

==================================================
21. DATA TRANSPARENCY
==================================================

Where useful, provide a subtle "Data" or "How this was calculated" disclosure.

Users should be able to understand which information is:

- Live/current
- Prototype/local

For example:

Traffic: Live
Weather: Current forecast
Road conditions: Local risk data

Do not clutter the primary result screen with technical disclaimers.

Transparency should be accessible without overwhelming the main GO / WAIT / AVOID decision.

==================================================
22. LOADING EXPERIENCE
==================================================

Do not fake progress percentages.

Use meaningful loading states such as:

Checking your route...

Finding route

Checking traffic

Checking weather

Assessing road conditions

Calculating route risk

Only show stages that correspond reasonably to actual work.

The application should feel responsive.

==================================================
23. ERROR HANDLING
==================================================

Handle:

- Invalid origin
- Invalid destination
- Route not found
- Google API failure
- Open-Meteo failure
- Missing API key
- Network failure
- Unexpected API response
- Missing route coordinates
- Missing weather data

Never show raw stack traces to users.

Show concise human-readable messages.

Example:

"Couldn't check this route right now. Please try again."

Provide a retry action.

==================================================
24. DEMO PRESETS
==================================================

Add convenient demo route presets:

Whitefield → Koramangala

Marathahalli → Silk Board

HSR Layout → Indiranagar

These presets must use the actual application logic.

Do NOT hardcode fake final results for these presets.

They should populate the inputs and run the real route evaluation.

==================================================
25. DESIGN DIRECTION
==================================================

Design this like a top-tier Indian consumer technology product.

The design should feel:

- Modern
- Youthful
- Gen Z-friendly
- High utility
- Fast
- Bold
- Clean
- Friendly
- Polished
- Mobile-first
- Visually confident

Take inspiration from strong Indian consumer-app design principles without copying any company's branding, logo, proprietary assets, or exact layouts.

Avoid:

- Generic AI dashboard aesthetics
- Excessive gradients
- Excessive glassmorphism
- Overly rounded everything
- Tiny unreadable text
- Excessive animations
- Childish visual design
- Huge walls of text
- Decorative elements that do not improve usability

Use:

- Strong typography
- Clear hierarchy
- Compact information cards
- Large recommendation state
- Good whitespace
- Clear CTAs
- Subtle animation
- Strong visual distinction between GO / WAIT / AVOID
- Accessible contrast
- Excellent mobile responsiveness

==================================================
26. RESPONSIVE DESIGN
==================================================

The application must work well on:

- Desktop
- Laptop
- Tablet
- Mobile

Do not create a desktop-only hackathon prototype.

The main experience should remain usable on a narrow mobile viewport.

==================================================
27. ACCESSIBILITY
==================================================

Use:

- Semantic HTML
- Proper labels
- Keyboard accessibility
- Visible focus states
- Sufficient contrast
- Accessible buttons
- Meaningful loading/error states

Do not rely only on color to communicate GO / WAIT / AVOID.

Use text and/or icons as well.

==================================================
28. ARCHITECTURE
==================================================

Keep the architecture simple.

Suggested flow:

USER
↓
Origin + Destination
↓
Our server-side route endpoint
↓
Google Routes API
↓
Traffic + Route Geometry
↓
Open-Meteo
↓
Weather Along Route
↓
Local Bengaluru Road Dataset
↓
Route Matching
↓
Risk Engine
↓
GO / WAIT / AVOID
↓
Explanation
↓
UI

Keep external API calls server-side where appropriate.

Do not create unnecessary layers.

==================================================
29. DATA MODEL
==================================================

Use simple TypeScript interfaces/types.

Example conceptual model:

RouteData:
- distance
- currentDuration
- staticDuration
- trafficDelay
- trafficDelayPercentage
- polyline
- routeDescription
- representativePoints

WeatherData:
- precipitation
- rain
- precipitationProbability
- weatherCode

RoadRisk:
- potholeRisk
- waterloggingRisk
- disruptionRisk
- overallRisk
- matchedAreas

RiskResult:
- trafficRisk
- weatherRisk
- roadRisk
- finalScore
- recommendation
- explanation
- dataCompleteness

Do not overcomplicate the data model.

==================================================
30. PERFORMANCE
==================================================

Avoid unnecessary API calls.

Use a reasonable number of weather requests.

Do not call APIs repeatedly because of React rendering.

Do not create unnecessary polling.

Do not add live auto-refresh unless there is enough time and a clear benefit.

==================================================
31. TESTING
==================================================

Test the actual application.

At minimum test:

1. Valid route
2. Another valid Bengaluru route
3. Invalid origin
4. Invalid destination
5. Route not found
6. Google API failure
7. Open-Meteo failure
8. Missing API key
9. Missing weather data
10. Mobile viewport
11. Desktop viewport
12. Refresh behavior
13. Loading state
14. Error state
15. Production build

Verify that risk calculations behave correctly for:

- Low traffic
- Moderate traffic
- Severe traffic
- Low rain
- Heavy rain
- High road risk
- Combined high-risk conditions

==================================================
32. VISUAL INSPECTION
==================================================

After implementation:

- Start the application locally.
- Inspect the actual UI.
- If browser inspection tools are available, use them.
- Check desktop.
- Check mobile.
- Check loading.
- Check results.
- Check errors.
- Check spacing.
- Check typography.
- Check alignment.
- Check button behavior.
- Check whether the GO / WAIT / AVOID decision is immediately obvious.

Do not rely only on source-code inspection.

Fix visual problems you discover.

==================================================
33. SELF-REVIEW
==================================================

Before declaring the local application ready, ask yourself:

Does this actually answer:

"Should I take this route right now?"

Can a first-time user understand the product immediately?

Does the recommendation dominate the result?

Are the calculations understandable?

Are live and prototype data clearly distinguished?

Could any number be misleading because of missing data?

Could any risk factor accidentally be counted twice?

Does the app look like a credible hackathon product rather than a developer prototype?

Is the mobile experience good?

Are errors handled gracefully?

Is the Google API key secure?

Does the production build pass?

Fix any problems you identify.

==================================================
34. GIT
==================================================

Initialize Git if appropriate.

Ensure:

.env.local

is ignored.

Do not commit secrets.

Create a useful README containing:

- What the product does
- Tech stack
- Local setup
- Environment variables
- How to run
- How the risk score works
- Data-source explanation
- Important prototype limitations

==================================================
35. VERCEL DEPLOYMENT
==================================================

DO NOT deploy immediately.

First complete the local application.

Run the production build locally.

Fix build errors.

Start the local production application if practical.

Give me the localhost URL.

Then STOP.

Wait for my explicit approval.

==================================================
36. LOCAL APPROVAL GATE
==================================================

You must NOT deploy to Vercel until I explicitly say something equivalent to:

"Good to go"

"Looks good, deploy it"

"Approved"

"Deploy it"

Do not interpret silence as approval.

Do not deploy automatically.

==================================================
37. AFTER APPROVAL
==================================================

Only after I explicitly approve:

1. Configure GOOGLE_MAPS_API_KEY in Vercel environment variables securely.
2. Do not expose the key in the frontend.
3. Deploy to Vercel.
4. Wait for deployment completion.
5. Open/test the production URL.
6. Test the core route flow.
7. Check for production-only problems.
8. Fix problems if necessary.
9. Redeploy.
10. Test again.
11. Give me the final production URL.

==================================================
38. DEPLOYMENT FAILURE STRATEGY
==================================================

If Vercel deployment fails:

DIAGNOSE → FIX → DEPLOY → TEST → VERIFY

Do not simply tell me that deployment failed.

If an environment variable is missing, configure it.

If a build error occurs, fix it.

If an API configuration issue occurs, diagnose it.

If a runtime issue occurs, reproduce and fix it.

==================================================
39. DEMO EXPERIENCE
==================================================

The product must be easy to demonstrate live.

A strong demo flow should be:

1. Open application.
2. Enter or select a Bengaluru route.
3. Click CHECK MY ROUTE.
4. Show the loading process.
5. Show GO / WAIT / AVOID.
6. Show the risk score.
7. Show current traffic delay.
8. Show weather.
9. Show road/waterlogging risk.
10. Show the explanation.

The result should be understandable without explaining the entire codebase.

==================================================
40. HACKATHON STORY
==================================================

The product should communicate a simple story:

Bengaluru does not only have a traffic problem.

A route can become practically unpleasant or risky because of a combination of:

- Traffic
- Rain
- Waterlogging
- Road conditions

Existing navigation primarily focuses on getting you from A to B.

This product focuses on whether going from A to B right now is a good idea.

Do not turn this into a long marketing presentation inside the application.

The product itself should demonstrate the idea.

==================================================
41. NO FAKE INTELLIGENCE
==================================================

Do not pretend the system uses machine learning if it does not.

Do not call deterministic rules "AI".

Do not fabricate live civic data.

Do not fabricate traffic.

Do not fabricate weather.

Do not fabricate route information.

If something is prototype data, label it appropriately.

Credibility is more important than making the demo sound more advanced than it is.

==================================================
42. NO OVERBUILDING
==================================================

Do not add:

- User authentication
- Profiles
- Saved routes
- Social feeds
- Comments
- Complex maps
- Chatbots
- AI agents
- Payment systems
- Notifications
- Complex dashboards
- Database infrastructure
- Mobile apps
- Complex analytics

unless the core product is already complete and there is substantial remaining time.

A map visualization is optional.

Do not allow a map to delay the core product.

==================================================
43. OPTIONAL MAP
==================================================

Only add a map if:

- The core product already works.
- The risk calculation works.
- The UI is polished.
- Testing is complete.
- There is sufficient time.

If adding a map requires another complicated API setup, skip it.

The product can succeed without a map.

==================================================
44. PRODUCT QUALITY BAR
==================================================

The final product should feel like:

"A real startup MVP built quickly"

not:

"A developer demo that happens to work."

Prioritize:

- Reliability
- Clarity
- Visual polish
- Speed
- Honest data representation
- Strong decision UX

==================================================
45. FAILURE PRIORITY
==================================================

If time becomes extremely limited, prioritize this exact order:

1. Application runs
2. User can enter origin/destination
3. Google route works
4. Traffic-aware duration works
5. Weather works
6. Road-risk dataset works
7. Risk score works
8. GO / WAIT / AVOID works
9. Explanation works
10. UI looks polished
11. Error states work
12. Testing works
13. Production build works
14. Vercel deployment after approval

Never sacrifice the core working flow for decorative features.

==================================================
46. DEFINITION OF DONE
==================================================

The local product is DONE only when:

- It runs locally.
- Origin/destination input works.
- Google Routes API works.
- Traffic-aware routing works.
- Traffic delay is calculated.
- Open-Meteo weather works.
- Weather risk is calculated.
- Bengaluru road-risk data exists.
- Route matching works.
- Waterlogging is represented appropriately.
- Risk score is calculated.
- Missing data is handled honestly.
- GO / WAIT / AVOID works.
- Explanation is generated from actual factors.
- Loading state works.
- Error state works.
- Mobile UI works.
- Desktop UI works.
- API key is secure.
- .env.local is ignored.
- Production build passes.
- The actual UI has been visually inspected.
- Major issues discovered during inspection have been fixed.

Only then should you ask me to inspect the local application.

==================================================
47. FINAL LOCAL OUTPUT
==================================================

When the local product is genuinely ready:

1. Start the local application.
2. Give me the localhost URL.
3. Give me a concise list of things I should test manually.
4. Briefly tell me what is live data versus prototype data.
5. Tell me that deployment has NOT happened yet.
6. STOP.

Do not deploy.

==================================================
48. FINAL DEPLOYMENT OUTPUT
==================================================

After I explicitly approve deployment:

Give me:

- Production URL
- Confirmation that production was tested
- Short summary of the final working features
- Any important prototype limitations

Do not expose secrets.

==================================================
49. ENGINEERING PRINCIPLE
==================================================

Use the simplest solution that reliably demonstrates the product idea.

Do not optimize for theoretical scalability.

Optimize for:

- Working software
- Clear architecture
- Fast debugging
- Strong UX
- Honest data
- Demo reliability

==================================================
50. IMPORTANT DECISION RULE
==================================================

Whenever you have two implementation choices:

Prefer the one that:

- takes less time
- has fewer dependencies
- is easier to debug
- is easier to explain
- is more reliable during a live demo

Do not choose complexity merely because it is technically impressive.

==================================================
51. SECURITY RULE
==================================================

Never place secrets in:

- Source code
- Git
- Client-side JavaScript
- Public environment variables
- README files
- Logs
- Screenshots
- API responses

Use server-side environment variables.

==================================================
52. USER EXPERIENCE RULE
==================================================

A user should not need to understand:

- APIs
- Routing algorithms
- Weather models
- GIS
- Risk formulas
- Backend architecture

They should simply understand:

"I entered where I'm going."

"Now I know whether I should go."

==================================================
53. RESULT INTERPRETATION
==================================================

The recommendation should always be presented as a decision aid, not as an absolute guarantee of safety.

Use language such as:

"Current route assessment"

"Based on current traffic, weather, and available road-condition data"

Avoid presenting the score as a scientifically validated prediction.

==================================================
54. CODE QUALITY
==================================================

Write clean TypeScript.

Avoid unnecessary duplication.

Use reusable components where appropriate.

Keep business logic separate from UI components.

Keep risk calculation deterministic and testable.

Keep API integration isolated.

Use meaningful variable names.

Do not create huge monolithic files if simple separation improves maintainability.

==================================================
55. TEST THE ACTUAL RISK ENGINE
==================================================

Create or run tests for the risk engine.

Verify:

traffic 10 + weather 10 + road 10
produces GO

moderate combined risks
produce the expected WAIT range

high combined risks
produce AVOID

Verify boundary conditions around:

39/40

69/70

Also verify that:

- Missing data does not become zero risk.
- Waterlogging is not double-counted.
- Scores stay between 0 and 100.
- Recommendation always matches the score.

==================================================
56. HONESTY RULE
==================================================

If something is unavailable, say so.

If a data source is approximate, represent it as approximate.

If road-condition data is prototype/local, say so.

If weather is model-based, do not describe it as an exact roadside measurement.

If the system cannot confidently calculate a recommendation, show an appropriate incomplete-data state instead of inventing certainty.

==================================================
57. VISUAL POLISH PASS
==================================================

After the functionality is working, perform a dedicated visual pass.

Look for:

- awkward spacing
- weak hierarchy
- oversized elements
- tiny text
- inconsistent border radii
- poor mobile layout
- unclear CTA
- weak recommendation emphasis
- clutter
- unnecessary decoration
- poor empty states
- ugly loading state
- ugly errors

Fix them.

Do not stop at "technically functional."

==================================================
58. BROWSER TESTING
==================================================

If browser/local inspection tools are available, use them.

Actually interact with the application.

Test:

- typing locations
- clicking buttons
- demo presets
- loading
- results
- errors
- retry
- responsive layout

If browser tooling is unavailable, use the best available local testing approach and continue.

==================================================
59. DO NOT WAIT FOR ME DURING BUILD
==================================================

Do not repeatedly ask:

"Should I continue?"

"Should I implement this?"

"Should I fix this?"

"Would you like me to proceed?"

You have permission to make reasonable engineering decisions within this specification.

Only ask me when:

- The Google API key is required.
- Local application is ready for manual approval.
- Explicit deployment approval is required.
- A genuinely ambiguous decision materially changes the product and cannot reasonably be resolved from this specification.

==================================================
60. FINAL EXECUTION SEQUENCE
==================================================

START NOW.

Follow this exact sequence:

1. Inspect the current project folder.
2. Check the project/environment.
3. Check GOOGLE_MAPS_API_KEY.
4. If it is missing, create .env.local.
5. Add GOOGLE_MAPS_API_KEY=.
6. Make sure .env.local is in .gitignore.
7. Ask me for the Google Routes API key.
8. Store the key securely.
9. Verify the configuration.
10. Initialize the application if necessary.
11. Implement the complete product.
12. Implement Google Routes API with TRAFFIC_AWARE routing.
13. Implement Open-Meteo weather.
14. Implement weather sampling along the route.
15. Implement Bengaluru road-risk data.
16. Implement route matching.
17. Implement waterlogging risk appropriately.
18. Implement the deterministic risk engine.
19. Implement missing-data handling.
20. Implement GO / WAIT / AVOID.
21. Implement the explanation system.
22. Build the polished UI.
23. Build loading/error states.
24. Add responsive behavior.
25. Add demo presets.
26. Test the risk engine.
27. Test the full application.
28. Fix everything you can find.
29. Run the production build.
30. Perform a final visual and technical self-review.
31. If browser/local inspection tools are available, inspect the actual UI.
32. Fix any problems you discover.
33. Test again.
34. Start the local application.
35. Give me the localhost URL.
36. Give me a concise list of things I should test.
37. Tell me what data is live and what data is prototype/local.
38. STOP.

DO NOT DEPLOY TO VERCEL YET.

WAIT FOR MY EXPLICIT APPROVAL.

Only after I explicitly approve the local application may you deploy to Vercel.

After approval:

1. Configure GOOGLE_MAPS_API_KEY securely in Vercel.
2. Deploy.
3. Test the production URL.
4. Fix any production problems.
5. Redeploy if necessary.
6. Test again.
7. Give me the final production URL.

IMPORTANT:

Do not stop until the local product is genuinely ready.

For every ordinary problem:

DIAGNOSE → FIX → TEST → VERIFY → CONTINUE.

Do not merely report problems.

Do not abandon partially implemented features.

Do not fabricate data.

Do not fabricate intelligence.

Do not declare success without testing.

Do not deploy before my explicit approval.

Do not overbuild.

Focus relentlessly on the core question:

"Should I take this route right now?"

START NOW.