import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

if (!serviceAccount.project_id) {
    console.error("Missing FIREBASE_SERVICE_ACCOUNT environment variable.");
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();

async function pruneUnverifiedUsers(): Promise<void> {
    // Set to 0 if in test mode to delete immediately
    const isTestMode = process.env.TEST_MODE === 'true';
    const EXPIRE_DAYS = isTestMode ? 0 : 7;

    const now = Date.now();
    const expirationMS = EXPIRE_DAYS * 24 * 60 * 60 * 1000;

    try {
        const listUsersResult = await auth.listUsers();
        const users = listUsersResult.users;

        console.log(`Checking ${users.length} users... (Test Mode: ${isTestMode})`);

        const deletionPromises = users.map(async (user) => {
            const creationTime = new Date(user.metadata.creationTime).getTime();
            const isExpired = (now - creationTime) >= expirationMS;

            // Logic: Unverified + Expired + Email/Pass Provider
            if (!user.emailVerified && isExpired && user.providerData[0]?.providerId === 'password') {
                console.log(`[DELETE] ${user.email} - Reason: Unverified/Expired`);

                // 1. Delete Firestore profile
                await db.collection('users').doc(user.uid).delete();

                // 2. Delete Auth account
                await auth.deleteUser(user.uid);
            }
        });

        await Promise.all(deletionPromises);
        console.log("Runner finished.");
    } catch (error) {
        console.error("Runner failed:", error);
        process.exit(1);
    }
}

pruneUnverifiedUsers();