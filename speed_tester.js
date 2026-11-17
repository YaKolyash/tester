/**
 * Network Speed Tester - Node.js version
 *
 * Usage: node speed_tester.js <URL>
 */

const axios = require('axios');

const NUM_REQUESTS = 10;
const TIMEOUT_MS = 15000; // 15 seconds

/**
 * Performs sequential requests to a URL to measure average speed.
 * @param {string} url The target URL.
 */
async function measureSpeed(url) {
    console.log(`Starting speed test against: ${url}`);
    console.log("-".repeat(40));

    let totalTime = 0;
    let totalDataSize = 0;
    let successfulRequests = 0;

    for (let i = 0; i < NUM_REQUESTS; i++) {
        const startTime = process.hrtime();
        let downloadSize = 0;

        try {
            const response = await axios.get(url, { timeout: TIMEOUT_MS });
            
            // Calculate content size
            // Note: axios response data might be a buffer or string. Assuming response.data is the main content.
            // We calculate the size based on the raw buffer length if available, or string length as a proxy.
            // For accurate network size, we'd need stream events, but for a simple measurement, checking the content length or buffer size is sufficient.
            downloadSize = Buffer.isBuffer(response.data) ? response.data.length : Buffer.byteLength(response.data.toString());
            
            const endTime = process.hrtime(startTime);
            
            // Convert [seconds, nanoseconds] to milliseconds
            // (endTime[0] * 1000) + (endTime[1] / 1000000)
            const downloadTimeMs = (endTime[0] * 1000) + (endTime[1] / 1000000);
            const downloadTimeSec = downloadTimeMs / 1000;

            totalTime += downloadTimeSec;
            totalDataSize += downloadSize;
            successfulRequests++;

            console.log(`Request ${i + 1}/${NUM_REQUESTS} successful. Size: ${(downloadSize / (1024 * 1024)).toFixed(2)} MB. Time: ${downloadTimeSec.toFixed(2)}s`);

        } catch (error) {
            console.error(`Request ${i + 1}/${NUM_REQUESTS} failed: ${error.message}`);
        }
    }

    if (successfulRequests === 0) {
        console.log("\nError: No successful requests were completed. Cannot calculate speed.");
        return;
    }

    // Calculations
    const averageTime = totalTime / successfulRequests;
    const totalBytes = totalDataSize;
    
    // Calculate speed: Mbps (Mega bits per second)
    // Speed = (Total Bytes * 8) / (Total Time in Seconds * 1024 * 1024)
    const totalSeconds = totalTime;
    const bitsPerSecond = (totalBytes * 8) / totalSeconds;
    const speedMbps = bitsPerSecond / 1024 / 1024;

    console.log("-".repeat(40));
    console.log("--- Test Results ---");
    console.log(`Total Requests Sent: ${NUM_REQUESTS}`);
    console.log(`Successful Requests: ${successfulRequests}`);
    console.log(`Total Data Downloaded: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Average Request Time: ${averageTime.toFixed(2)} seconds`);
    console.log(`Average Download Speed: ${speedMbps.toFixed(2)} Mbps (Mega bits per second)`);
}

// Main execution block
const targetUrl = process.argv[2];

if (!targetUrl) {
    console.error("Usage: node speed_tester.js <URL>");
    process.exit(1);
}

measureSpeed(targetUrl);