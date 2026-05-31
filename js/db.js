// db.js - Firebase Database Implementation

// Default mock data structure
const defaultData = {
    monthlyBudget: 3000,
    categories: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Fixas', 'Outros']
};

let currentUser = null;

// Auth observer
firebase.auth().onAuthStateChanged(user => {
    currentUser = user;
});

function isLoggedIn() {
    return !!firebase.auth().currentUser || !!currentUser;
}

async function loginWithEmail(email, password) {
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        return true;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function registerWithEmail(email, password) {
    try {
        const userCred = await firebase.auth().createUserWithEmailAndPassword(email, password);
        // Create initial profile
        await db.collection('users').doc(userCred.user.uid).set({
            monthlyBudget: defaultData.monthlyBudget,
            categories: defaultData.categories,
            isPaid: false,
            trialStartDate: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function loginWithGoogle() {
    try {
        let userCred;
        if (window.Capacitor && window.Capacitor.isNativePlatform()) {
            // Usa o Plugin Nativo do Capacitor
            const result = await window.Capacitor.Plugins.FirebaseAuthentication.signInWithGoogle();
            const credential = firebase.auth.GoogleAuthProvider.credential(result.credential.idToken);
            userCred = await firebase.auth().signInWithCredential(credential);
        } else {
            // Usa a versão Web (Popup)
            const provider = new firebase.auth.GoogleAuthProvider();
            userCred = await firebase.auth().signInWithPopup(provider);
        }
        
        // Check if profile exists, if not, create it
        const docRef = db.collection('users').doc(userCred.user.uid);
        const doc = await docRef.get();
        if (!doc.exists) {
            await docRef.set({
                monthlyBudget: defaultData.monthlyBudget,
                categories: defaultData.categories,
                isPaid: false,
                trialStartDate: new Date().toISOString()
            });
        } else if (!doc.data().trialStartDate) {
            try {
                await docRef.update({
                    trialStartDate: new Date().toISOString()
                });
            } catch (e) {
                console.error("Erro ao salvar trialStartDate no login do Google:", e);
            }
        }
        return true;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function resetPassword(email) {
    try {
        await firebase.auth().sendPasswordResetEmail(email);
        return true;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function logout() {
    await firebase.auth().signOut();
    window.location.href = '../boas_vindas/code.html';
}

// Get user profile data (budget, categories)
async function getProfile() {
    const user = firebase.auth().currentUser || currentUser;
    if (!user) return defaultData;
    try {
        const docRef = db.collection('users').doc(user.uid);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = doc.data();
            if (!data.trialStartDate) {
                const trialStartDate = new Date().toISOString();
                try {
                    await docRef.update({ trialStartDate });
                } catch (e) {
                    console.error("Erro ao salvar trialStartDate no Firestore (regras de segurança):", e);
                }
                data.trialStartDate = trialStartDate;
            }
            return data;
        }
        const initialProfile = {
            monthlyBudget: defaultData.monthlyBudget,
            categories: defaultData.categories,
            isPaid: false,
            trialStartDate: new Date().toISOString()
        };
        try {
            await docRef.set(initialProfile);
        } catch (e) {
            console.error("Erro ao criar perfil inicial no Firestore:", e);
        }
        return initialProfile;
    } catch (err) {
        console.error("Erro no getProfile:", err);
        return {
            monthlyBudget: defaultData.monthlyBudget,
            categories: defaultData.categories,
            isPaid: false,
            trialStartDate: new Date().toISOString()
        };
    }
}

// Set Monthly Budget
async function setMonthlyBudget(amount, dateStr = null) {
    if (!currentUser) return;
    const updates = { monthlyBudget: parseFloat(amount) };
    if (dateStr) updates.budgetDate = dateStr;
    try {
        await db.collection('users').doc(currentUser.uid).update(updates);
    } catch (e) {
        console.error("Erro ao salvar saldo mensal:", e);
    }
}

// Set Monthly Goal
async function setMonthlyGoal(amount) {
    if (!currentUser) return;
    try {
        await db.collection('users').doc(currentUser.uid).update({ monthlyGoal: parseFloat(amount) });
    } catch (e) {
        console.error("Erro ao salvar meta mensal:", e);
    }
}

// Categories CRUD
async function getCategories() {
    const profile = await getProfile();
    return profile.categories || defaultData.categories;
}

async function addCategory(name) {
    if (!currentUser) return;
    try {
        const profile = await getProfile();
        let categories = profile.categories || [];
        if (!categories.includes(name) && name.trim() !== '') {
            categories.push(name.trim());
            await db.collection('users').doc(currentUser.uid).update({ categories });
        }
    } catch (e) {
        console.error("Erro ao adicionar categoria:", e);
    }
}

async function deleteCategory(name) {
    if (!currentUser) return;
    try {
        const profile = await getProfile();
        let categories = profile.categories || [];
        categories = categories.filter(c => c !== name);
        await db.collection('users').doc(currentUser.uid).update({ categories });
    } catch (e) {
        console.error("Erro ao excluir categoria:", e);
    }
}

async function editCategory(oldName, newName) {
    if (!currentUser) return;
    if (newName.trim() === '') return;
    try {
        const profile = await getProfile();
        let categories = profile.categories || [];
        const index = categories.indexOf(oldName);
        if (index > -1) {
            categories[index] = newName.trim();
            await db.collection('users').doc(currentUser.uid).update({ categories });
            
            // Update expenses too
            const snapshot = await db.collection('users').doc(currentUser.uid).collection('expenses').where('category', '==', oldName).get();
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, { category: newName.trim() });
            });
            await batch.commit();
        }
    } catch (e) {
        console.error("Erro ao editar categoria:", e);
    }
}

// Add new expense
async function addExpense(expense) {
    if (!currentUser) return;
    try {
        await db.collection('users').doc(currentUser.uid).collection('expenses').add(expense);
    } catch (e) {
        console.error("Erro ao adicionar despesa:", e);
    }
}

// Get Expenses
async function getExpenses() {
    try {
        const user = firebase.auth().currentUser || currentUser;
        if (!user) return [];
        // Ordered by date desc
        const snapshot = await db.collection('users').doc(user.uid).collection('expenses').orderBy('date', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
        console.error("Erro ao buscar despesas no Firestore:", err);
        return [];
    }
}

// Delete Expense
async function deleteExpense(id) {
    if (!currentUser) return;
    try {
        await db.collection('users').doc(currentUser.uid).collection('expenses').doc(id).delete();
    } catch (e) {
        console.error("Erro ao excluir despesa:", e);
    }
}

// Get Dashboard Stats
async function getDashboardStats() {
    const profile = await getProfile();
    const expenses = await getExpenses();
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let monthlySpent = 0;
    let monthlyIncome = 0;
    let monthlySpentCredit = 0;
    let monthlySpentDebit = 0;
    let monthlySpentCash = 0;
    let monthlySpentPix = 0;
    let monthlySpentBoleto = 0;

    const monthlyExpenses = expenses.filter(exp => {
        const dateObj = new Date(exp.date + 'T12:00:00');
        return dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear;
    });

    monthlyExpenses.forEach(exp => {
        const amount = parseFloat(exp.amount);
        if (exp.type === 'income') {
            monthlyIncome += amount;
        } else {
            monthlySpent += amount;
            
            const method = (exp.paymentMethod || '').toLowerCase();
            if (method.includes('crédito') || method === 'credito') {
                monthlySpentCredit += amount;
            } else if (method.includes('débito') || method === 'debito') {
                monthlySpentDebit += amount;
            } else if (method.includes('pix')) {
                monthlySpentPix += amount;
            } else if (method.includes('boleto')) {
                monthlySpentBoleto += amount;
            } else {
                monthlySpentCash += amount;
            }
        }
    });

    const budget = profile.monthlyBudget || 3000;
    const totalAvailable = budget + monthlyIncome;
    const remaining = totalAvailable - monthlySpent;
    const usedPercent = totalAvailable > 0 ? (monthlySpent / totalAvailable) * 100 : 0;

    const monthlyExpensesDesc = monthlyExpenses
        .filter(exp => exp.type !== 'income')
        .map(exp => ({ name: exp.description || exp.category || 'Despesa', amount: parseFloat(exp.amount) }))
        .sort((a, b) => b.amount - a.amount);
    
    const topExpenses = monthlyExpensesDesc.slice(0, 5);

    return {
        balance: remaining,
        monthlySpent: monthlySpent,
        monthlySpentCredit: monthlySpentCredit,
        monthlySpentDebit: monthlySpentDebit,
        monthlySpentCash: monthlySpentCash,
        monthlySpentPix: monthlySpentPix,
        monthlySpentBoleto: monthlySpentBoleto,
        budgetUsedPercent: usedPercent,
        budgetRemaining: remaining,
        budgetDate: profile.budgetDate || null,
        monthlyGoal: profile.monthlyGoal || 0,
        topExpenses: topExpenses,
        maxExpenseAmount: topExpenses.length > 0 ? topExpenses[0].amount : 0
    };
}
