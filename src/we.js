
// Function to calculate CPU usage over a period of time
import * as os from "node:os";

function calculateProcessCpuUsage() {
    return new Promise((resolve) => {
        // Get the initial CPU usage and the start time
        const startUsage = process.cpuUsage();
        const startTime = Date.now();

        // Measure CPU usage over a period (e.g., 1 second)
        setTimeout(() => {
            // Get the CPU usage and end time
            const endUsage = process.cpuUsage(startUsage);
            const endTime = Date.now();
            const elapsedTime = endTime - startTime;

            // Calculate the CPU time in milliseconds
            const userTime = endUsage.user / 1000; // Convert from microseconds to milliseconds
            const systemTime = endUsage.system / 1000; // Convert from microseconds to milliseconds

            // Calculate the total CPU time
            const totalCpuTime = userTime + systemTime;

            // Get the number of logical CPUs
            const vcpus = os.cpus().length;

            // Calculate the CPU usage percentage
            const cpuUsagePercentage = (totalCpuTime / (elapsedTime * vcpus)) * 100;

            // Output the results
            console.log('Elapsed time (ms):', elapsedTime);
            console.log('User CPU time (ms):', userTime);
            console.log('System CPU time (ms):', systemTime);
            console.log('Total CPU time (ms):', totalCpuTime);
            console.log('Number of vCPUs:', vcpus);
            console.log('CPU usage percentage:', cpuUsagePercentage.toFixed(2), '%');

            resolve();
        }, 1000); // Measure over 1 second
    });
}

// Function to generate a CPU spike
function generateCpuSpike(duration) {
    return new Promise((resolve) => {
        const start = Date.now();
        while (Date.now() - start < duration) {
            // Perform intensive computations
            Math.sqrt(Math.random());
        }
        resolve();
    });
}

// Function to run the CPU usage calculation and spike generation in parallel
async function runTest() {
    for (let i = 0; i < 100; i++) { // Adjust the loop count as needed
        console.log(`Iteration ${i + 1}`);
        await Promise.all([calculateProcessCpuUsage(), generateCpuSpike(5000)]); // Generate a CPU spike for 1 second while measuring CPU usage
    }
}

// Start the test
runTest();
