const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("Firebase Admin Initialization Error: ", error);
    }
}

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const body = JSON.parse(event.body);
        const { uid, password, action = 'approve' } = body;

        // Validar a senha
        if (password !== '789512') {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Senha incorreta ou acesso não autorizado.' })
            };
        }

        if (!uid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'UID do usuário é obrigatório.' })
            };
        }

        if (admin.apps.length === 0) {
             return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Erro de configuração do servidor interno (Firebase Admin não inicializado).' })
            };
        }

        // Atualizar documento do usuário no Firestore diretamente usando o UID
        const db = admin.firestore();
        const isPaid = action === 'approve';
        
        await db.collection('users').doc(uid).update({
            isPaid: isPaid,
            paymentId: isPaid ? 'manual_pix_admin' : null,
            paidAt: isPaid ? admin.firestore.FieldValue.serverTimestamp() : null
        });

        console.log(`User UID (${uid}) successfully updated. isPaid: ${isPaid}`);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: isPaid ? 'Acesso liberado com sucesso!' : 'Acesso bloqueado com sucesso!' })
        };
    } catch (error) {
        console.error("Admin Approval Error: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erro interno do servidor ao tentar liberar acesso.' })
        };
    }
};
