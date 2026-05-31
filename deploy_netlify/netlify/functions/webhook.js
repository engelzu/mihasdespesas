const { MercadoPagoConfig, Payment } = require('mercadopago');
const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    try {
        // Netlify environment variable containing the Firebase Service Account JSON string
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("Firebase Admin Initialization Error: ", error);
        // We do not return here so we can at least log the MP webhook body even if Firebase fails.
    }
}

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        const { type, data } = body;

        // Mercado Pago sends different types of notifications. We only care about payments.
        if (type === 'payment' && data && data.id) {
            const paymentId = data.id;
            
            // Get the token from environment
            const token = process.env.MP_ACCESS_TOKEN;
            const client = new MercadoPagoConfig({ accessToken: token });
            const paymentClient = new Payment(client);

            // Get payment details from MP API
            const paymentInfo = await paymentClient.get({ id: paymentId });
            
            // If the payment is approved, we release the user's access
            if (paymentInfo.status === 'approved') {
                const uid = paymentInfo.external_reference; // This is the user's ID we sent in create_preference
                
                if (uid && admin.apps.length > 0) {
                    const db = admin.firestore();
                    await db.collection('users').doc(uid).update({
                        isPaid: true,
                        paymentId: paymentId,
                        paidAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    console.log(`User ${uid} successfully upgraded to Paid.`);
                }
            }
        }

        // Always return 200 to acknowledge receipt of the webhook to Mercado Pago
        return {
            statusCode: 200,
            body: 'OK'
        };
    } catch (error) {
        console.error("Webhook Error: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
