import { BigQuery } from '@google-cloud/bigquery';
import admin from 'firebase-admin';

const query = `
    SELECT
        user_id,
        event_name,
        TIMESTAMP_MICROS(event_timestamp) AS event_time,
        (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'item_id') AS item_id,
                                                                 (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'event_category') AS event_category,
                                                                                                                      -- Check for both 'search_term' and 'query' just in case
                                                                                                                          (SELECT value.string_value FROM UNNEST(event_params) WHERE key IN ('search_term', 'query')) AS search_term
    FROM \`kit300-p4-gma.analytics_527476249.events_*\`
    WHERE event_name IN ('event_card_press', 'search', 'view_search_results')
      AND user_id IS NOT NULL
    ORDER BY event_time DESC
        LIMIT 500
`;

interface TrackingRow {
    user_id: string;
    event_name: string;
    event_time: any;
    item_id?: string;
    event_category?: string;
    search_term?: string;
    screen_name?: string;
}

const bq = new BigQuery();

// Initialize Admin safely for ESM
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

async function syncTrackingToFirestore() {
    try {
        console.log('--- Starting BigQuery Sync ---');

        // Pass the query variable into bq.query
        const [rows]: [TrackingRow[], any] = await bq.query({ query });

        if (rows.length === 0) {
            console.log("No data found in BigQuery for identified users (user_id was null).");
            return;
        }

        const batch = db.batch();

        rows.forEach((row) => {
            const userRef = db.collection('users').doc(row.user_id);

            // CONVERT BigQueryTimestamp to a JS Date
            // BigQuery returns an object with a .value property (the ISO string)
            const eventDate = row.event_time && row.event_time.value
                ? new Date(row.event_time.value)
                : new Date();

            const logEntry: any = {
                event: row.event_name,
                timestamp: eventDate,
            };

            if (row.event_name === 'event_card_press') {
                logEntry.item_id = row.item_id;
                logEntry.event_category = row.event_category;
            }
            // Handle both possible search event names
            else if (row.event_name === 'search' || row.event_name === 'view_search_results') {
                logEntry.search_term = row.search_term;
            }

            if (logEntry.item_id || logEntry.search_term) {
                batch.set(userRef, {
                    tracking_logs: admin.firestore.FieldValue.arrayUnion(logEntry),
                }, { merge: true });
            }
        });

        await batch.commit();
        console.log(`Successfully synced ${rows.length} logs to Firestore.`);
    } catch (error) {
        console.error("Sync Error:", error);
    }
}

// 2. Execute the function
syncTrackingToFirestore();