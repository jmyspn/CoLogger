import { USING_MOCK_API } from '../api'

// Shown only in demo mode (VITE_USE_MOCK_API not set to "false"). It reads the
// same flag as the API layer, so it disappears by itself in a real-API build.
// A deployment that quietly pretends to have a server should say so.

export default function DemoNotice() {
  if (!USING_MOCK_API) return null

  return (
    <div className="demo-notice" role="note">
      <strong>Demo mode.</strong> This copy of CoLogger runs on a simulated backend:
      your account, collections, items and images are stored only in this browser and
      disappear if you clear its site data. The full version uses the Express API and
      PostgreSQL database described in the README.
    </div>
  )
}
