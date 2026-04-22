module.exports = {
  env: {
    serviceworker: true,  // Enable serviceworker environment
    browser: true,        // Enable browser environment
  },
  extends: ["eslint:recommended"], // Optional: Include recommended ESLint rules
  rules: {
    "no-unused-vars": "off"
    // Your custom rules go here
  },
};
