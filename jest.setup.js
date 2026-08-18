/**
 * The API stubs wait a beat so a pending state is visible while developing.
 * Tests answer instantly instead — every suite that mounts <App /> would
 * otherwise sit through the provider's first load.
 */
const { apiConfig } = require('./src/services/api');

apiConfig.latencyMs = 0;
