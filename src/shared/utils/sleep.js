/**
 * Pause execution for the given duration in milliseconds.
 *
 * @param {number} ms - Delay duration in milliseconds.
 * @returns {Promise<void>} Promise that resolves after the delay.
 */
export const sleep = (ms = 1000) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
