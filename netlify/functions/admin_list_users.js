const admin = require('firebase-admin');

// Initialize Firebase Admin
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
    // Apenas requisições POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const body = JSON.parse(event.body);
        const { password } = body;

        // Validar a senha mestra
        if (password !== '789512') {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Senha incorreta ou acesso não autorizado.' })
            };
        }

        if (admin.apps.length === 0) {
             return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Erro de configuração do servidor (Firebase Admin não inicializado).' })
            };
        }

        // 1. Buscar lista de usuários do Firebase Auth (para pegar e-mails)
        const listUsersResult = await admin.auth().listUsers(1000);
        const authUsers = listUsersResult.users;

        // 2. Buscar dados da coleção "users" no Firestore (para pegar status de pagamento)
        const db = admin.firestore();
        const usersSnapshot = await db.collection('users').get();
        
        const firestoreData = {};
        usersSnapshot.forEach(doc => {
            firestoreData[doc.id] = doc.data();
        });

        // 3. Mesclar os dados
        const combinedUsers = authUsers.map(userRecord => {
            const fsData = firestoreData[userRecord.uid] || {};
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName || 'Sem nome',
                isPaid: !!fsData.isPaid,
                monthlyBudget: fsData.monthlyBudget || 0,
                creationTime: userRecord.metadata.creationTime
            };
        });

        // Ordenar: Aguardando pagamento primeiro, depois os mais recentes
        combinedUsers.sort((a, b) => {
            if (a.isPaid === b.isPaid) {
                return new Date(b.creationTime) - new Date(a.creationTime);
            }
            return a.isPaid ? 1 : -1;
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ users: combinedUsers })
        };
    } catch (error) {
        console.error("List Users Error: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erro interno do servidor ao buscar usuários.' })
        };
    }
};
