// docker/config/settings.js
module.exports = {
    // Node-RED settings
    uiPort: process.env.PORT || 1880,
    
    // Enable verbose logging
    logging: {
        console: {
            level: "debug",
            metrics: false,
            audit: false
        }
    },

    // Enable module logging
    verbose: true,
    
    // Debug node loading
    debugMaxLength: 1000,
    
    editorTheme: {
        palette: {
            // Force palette refresh on start
            refresh: true
        }
    }
};