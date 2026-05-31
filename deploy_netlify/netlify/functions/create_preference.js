const { MercadoPagoConfig, Preference } = require('mercadopago');

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        const { uid, email } = body;

        if (!uid || !email) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing uid or email' }) };
        }

        // Initialize MercadoPago
        // In production, we should use process.env.MP_ACCESS_TOKEN
        const token = process.env.MP_ACCESS_TOKEN;
        const client = new MercadoPagoConfig({ accessToken: token });
        const preference = new Preference(client);

        // Webhook URL (Netlify automatically hosts this function at your domain)
        const domain = process.env.URL || 'http://localhost:8888';
        const webhookUrl = `${domain}/.netlify/functions/webhook`;

        const response = await preference.create({
            body: {
                items: [
                    {
                        id: 'premium_access',
                        title: 'Acesso Premium Web - Minhas Despesas',
                        quantity: 1,
                        unit_price: 7.00,
                        currency_id: 'BRL',
                    }
                ],
                payer: {
                    email: email,
                },
                external_reference: uid, // VERY IMPORTANT: Links the payment to the user UID
                back_urls: {
                    success: `${domain}/paywall/code.html`,
                    failure: `${domain}/paywall/code.html`,
                    pending: `${domain}/paywall/code.html`
                },
                auto_return: 'approved',
                notification_url: webhookUrl
            }
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: response.id,
                init_point: response.init_point,
                sandbox_init_point: response.sandbox_init_point
            })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
