const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.set('port', process.env.PORT || 3000);

// Enter the Page Access Token from the previous step
const FACEBOOK_PAGE_ACCESS_TOKEN = 'EABSbmGWhdZCYBAFns3VRwZC5S0MCVOkZCPO4uiZCPTdjZAwYZBiwY8G2YLIhd9P6WZBDbUqSxYSerVD5UNlS9efqHwYnO6jdHZBZCmc3tuZCoAmepb06iaC9fZCZB6i5J2zHiH9SaA5cWApn3Yd45UslwRtAoWZAxZBLkLhimsKGbZAW9PhORBNjRxlxoEr';
const FORM_ID = '6174986589184993';
// Accept JSON POST body
app.use(bodyParser.json());

// GET /webhook
app.get('/webhook', (req, res) => {
    // Facebook sends a GET request
    // To verify that the webhook is set up
    // properly, by sending a special challenge that
    // we need to echo back if the "verify_token" is as specified
    if (req.query['hub.verify_token'] === 'Lmaoez1234567890') {
        res.send(req.query['hub.challenge']);
        return;
    }
})

// POST /webhook
app.post('/webhook', async (req, res) => {
    // Facebook will be sending an object called "entry" for "leadgen" webhook event
    if (!req.body.entry) {
        return res.status(500).send({ error: 'Invalid POST data received' });
    }

    // Travere entries & changes and process lead IDs
    for (const entry of req.body.entry) {
        for (const change of entry.changes) {
            // Process new lead (leadgen_id)
            await processNewLead(change.value.leadgen_id);
        }
    }

    // Success
    res.send({ success: true });
})

app.listen(app.get('port'), () => console.log(`Node server listening on port ${app.get('port')}!`));

// Process incoming leads
async function processNewLead(leadId) {
    let response;

    try {
        // Get lead details by lead ID from Facebook API
        response = await axios.get(`https://graph.facebook.com/v14.0/${leadId}/?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`);
    }
    catch (err) {
        // Log errors
        return console.warn(`An invalid response was received from the Facebook API:`, err.response.data ? JSON.stringify(err.response.data) : err.response);
    }

    // Ensure valid API response returned
    if (!response.data || (response.data && (response.data.error || !response.data.field_data))) {
        return console.warn(`An invalid response was received from the Facebook API: ${response}`);
    }

    // Lead fields
    const leadForm = [];

    // Extract fields
    for (const field of response.data.field_data) {
        // Get field name & value
        const fieldName = field.name;
        const fieldValue = field.values[0];

        // Store in lead array
        leadForm.push(`${fieldName}: ${fieldValue}`);
    }

    // Implode into string with newlines in between fields
    const leadInfo = leadForm.join('\n');

    // Log to console
    console.log('A new lead was received!\n', leadInfo);

    //console.log('Lead ID: ', leadId);

    //console.log('Response', response.data.field_data);
}

var minutes = 15, the_interval = minutes * 60 * 1000;
setInterval(async function () {
    console.log("Doing 1 minute fetch data");

    let response = await axios.get(`https://graph.facebook.com/v14.0/${FORM_ID}/leads?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`);

    //console.log("Data", response.data);

    //console.log("Lead Data:", response.data.data[0].field_data);

    console.log("Lead Email:", response.data.data[0].field_data[0].values.toString());

    console.log("Lead ID:", response.data.data[0].id);
}, the_interval);