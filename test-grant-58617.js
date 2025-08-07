// Quick test to check if grant ID 58617 exists
const fetch = require('node-fetch');

async function testGrant() {
  try {
    const response = await fetch('http://localhost:3000/api/grants/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ opportunityId: '58617' })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testGrant();