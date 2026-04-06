/**
 * Entry point of the application
 * WHY:
 * - Responsible ONLY for starting the server
 * - Keeps app.js reusable (for testing)
 */

const app = require('./app');
const ENV = require('./config/env');

// Start server
app.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`);
});