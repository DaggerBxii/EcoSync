🏗️ EcoSync: Technical Execution Plan
1. The Core "Sync Contract" (Universal)

Everyone must follow this JSON structure. This is the data that travels from the Backend -> Frontend via WebSockets.
JSON

{
  "timestamp": "2026-03-14T16:20:00Z",
  "system_status": "Scaling Down", 
  "scale_level": 0.25,
  "metrics": {
    "watts": 105.2,
    "occupancy": 0,
    "carbon_saved": 0.45
  },
  "ai_insight": "Deep Eco-Mode: No human load detected.",
  "is_anomaly": false
}

2. Role-Specific Task Lists
A. Backend Developer (Server)

    Init: Set up FastAPI and the websockets library.

    The Hub: Create a broadcast list to manage multiple active frontend connections.

    The Loop: Build an asyncio loop that runs every 2 seconds to:

        Call the AI module for a prediction.

        Package the result into the "Sync Contract" JSON.

        Broadcast to all connected clients.

    Health: Add a GET /health route that returns {"status": "ok"} for the DevOps Lead.

B. AI Specialist (The Brain)

    Model 1 (Predictor): Build a RandomForestRegressor or simple Linear model to predict occupancy based on hour_of_day.

    Model 2 (Anomaly): Create a logic-based or IsolationForest check: if occupancy == 0 and watts > threshold, set is_anomaly = true.

    Integration: Wrap these into a single Python class EcoBrain with a method .get_decision(input_data) that the Backend Dev can import.

C. Frontend Developer (Website)

    Init: Setup Next.js with Tailwind CSS.

    The Listener: Create a useEffect hook that opens a WebSocket to ws://[Desktop-IP]:8000/ws.

    State Management: Map the incoming JSON to local React state so the UI updates automatically without refreshes.

    Components: Build a "Live Log" component that appends the ai_insight string to a scrolling list.

D. UI/UX Designer (Visuals)

    Branding: Create the "EcoSync" logo and color palette (Gradients of Green and Dark Grey).

    Gauges: Design the CSS/SVG for a circular gauge that shows the scale_level (0% to 100%).

    Alerts: Create a visual "Red Alert" state for when is_anomaly is true.

E. DevOps Lead (Infrastructure)

    Docker: Write a Dockerfile for the Python Backend.

    Cloud: Set up the EKS Cluster using Terraform.

    Tunneling: (Crucial for demo) Set up ngrok or a similar tool to expose the Backend's WebSocket port to the public internet so the Frontend can reach it from any browser.

F. Research & Documentation (Compliance)

    The SPAIN Audit: Write a 1-page document explaining how the code achieves Stability, Performance, Availability, Integrity, and Novelty.

    AI Ethics: Draft the "Fair Play" disclosure regarding how the model was trained.

    Data Sourcing: Find real-world energy cost averages to make the "Money Saved" counter accurate.

G. Product Lead (Presentation)

    Storyboarding: Plan the 5-minute video (1m Problem, 3m Demo, 1m Impact).

    The "Script": Write the voiceover that explains why the AI chose to scale down (don't just show it, explain the logic).

    QA: Test the final integrated build to ensure the "Scale Up" and "Scale Down" transitions look smooth for the judges.

3. Integration Milestones

    Hour 4: Backend sends "Dummy JSON" to Frontend. Connection confirmed.

    Hour 10: AI Class is imported into Backend. Real predictions start flowing.

    Hour 16: UI/UX skin is applied to the Frontend. The app looks professional.

    Hour 20: DevOps confirms the system survives a "kill and restart" test.

    Hour 24: Submission.