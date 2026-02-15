const axios = require('axios');

async function verify() {
    const baseUrl = 'http://localhost:8080';
    console.log(`Checking ${baseUrl}...`);

    try {
        // Check Root
        console.log('GET /');
        const rootRes = await axios.get(baseUrl);
        console.log('Root Status:', rootRes.status);
        console.log('Root Data:', rootRes.data);

        // Check Listings
        console.log('\nGET /listings');
        const listingsRes = await axios.get(`${baseUrl}/listings`);
        console.log('Listings Status:', listingsRes.status);
        console.log('Listings Data Type:', Array.isArray(listingsRes.data) ? 'Array' : typeof listingsRes.data);
        if (Array.isArray(listingsRes.data) && listingsRes.data.length > 0) {
            console.log('First Listing:', listingsRes.data[0]);
        } else {
            console.log('No listings found or not an array');
        }

        console.log('\nVerification Passed!');
    } catch (error) {
        console.error('Verification Failed:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

// Simple retry mechanism to wait for server start
async function run() {
    for (let i = 0; i < 5; i++) {
        try {
            await verify();
            return;
        } catch (e) {
            console.log(`Attempt ${i + 1} failed, retrying in 2s...`);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

run();
