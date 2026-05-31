// app.js - Global App Utilities and Navigation

window.onerror = function(message, source, lineno, colno, error) {
    const errorMsg = "ERRO JS: " + message + " \nLinha: " + lineno + " \nArquivo: " + source;
    console.error(errorMsg, error);
    alert(errorMsg);
    return false;
};

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Format date
function formatDate(dateString) {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    // Handle timezone issue by forcing time to noon
    const d = new Date(dateString + 'T12:00:00'); 
    return d.toLocaleDateString('pt-BR', options);
}

// Icon mapping (returns generic icon for unmapped dynamic categories)
function getIconForCategory(category) {
    const map = {
        'Alimentação': 'restaurant',
        'Transporte': 'directions_car',
        'Moradia': 'home',
        'Saúde': 'local_hospital',
        'Lazer': 'sports_esports',
        'Fixas': 'receipt_long',
        'Compras': 'shopping_bag',
        'Outros': 'category'
    };
    return map[category] || 'label';
}

// Secure navigation for PWA
// Using window.location.href instead of standard <a> tags prevents iOS standalone PWA from jumping to Safari
function navigateTo(path) {
    window.location.href = path;
}

// Setup Bottom Navigation Bar Links to use JS navigation
function setupNavigation() {
    const links = document.querySelectorAll('nav a, nav button');
    
    // Define the paths based on text content
    links.forEach(link => {
        // Prevent default a href behavior if it's an anchor tag
        if (link.tagName === 'A') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                handleNavClick(link);
            });
        } else if (link.tagName === 'BUTTON') {
            link.addEventListener('click', () => {
                handleNavClick(link);
            });
        }
    });
}

function handleNavClick(el) {
    const text = el.innerText.toLowerCase();
    
    // We are usually in a subdirectory, so we need to go up and then to the target
    if (text.includes('início')) {
        navigateTo('../dashboard_de_despesas/code.html');
    } else if (text.includes('adicionar')) {
        navigateTo('../adicionar_despesa/code.html');
    } else if (text.includes('histórico')) {
        navigateTo('../hist_rico_e_exporta_o/code.html');
    } else if (text.includes('exportar')) {
        // Assuming Exportar is in the same page or handled specially
        navigateTo('../hist_rico_e_exporta_o/code.html');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    if (typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // Checa o banco de dados depois que confirmar o usuário
                getProfile().then(profile => {
                    const path = window.location.pathname;
                    const isNative = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
                    
                    // Cálculo do período de testes (7 dias)
                    const trialStart = new Date(profile.trialStartDate);
                    const now = new Date();
                    const diffTime = now - trialStart;
                    const diffDays = diffTime / (1000 * 60 * 60 * 24);
                    const isTrialActive = diffDays >= 0 && diffDays <= 7;
                    const daysRemaining = Math.max(0, 7 - Math.floor(diffDays));
                    
                    if (path.indexOf('boas_vindas') === -1 && path.indexOf('paywall') === -1) {
                        if (!isNative && profile.isPaid !== true && !isTrialActive) {
                            window.location.replace('../paywall/code.html');
                            return;
                        }
                        
                        // Exibir modal pós-login sobre os dias restantes do trial
                        if (profile.isPaid !== true && isTrialActive) {
                            const sessionKey = 'shown_trial_modal_' + user.uid;
                            if (!sessionStorage.getItem(sessionKey)) {
                                sessionStorage.setItem(sessionKey, 'true');
                                setTimeout(() => {
                                    showTrialModal(daysRemaining);
                                }, 500);
                            }
                        }
                    } else if (path.indexOf('paywall') !== -1) {
                        // Se o usuário está no paywall mas o trial está ativo ou ele pagou, redireciona pro dashboard
                        if (isNative || profile.isPaid === true || isTrialActive) {
                            window.location.replace('../dashboard_de_despesas/code.html');
                        }
                    }
                }).catch(err => console.error(err));
                
                if(window.location.pathname.indexOf('boas_vindas') === -1) {
                    injectSidebarMenu();
                }
            }
        });
    }
});

// Sidebar & Storage Usage System
function injectSidebarMenu() {
    if (document.getElementById('global-sidebar')) return;
    
    const sidebarHTML = `
        <div id="global-sidebar-overlay" class="fixed inset-0 z-[1000] bg-inverse-surface/40 backdrop-blur-sm hidden opacity-0 transition-opacity duration-300"></div>
        <div id="global-sidebar" class="fixed top-0 left-0 bottom-0 w-64 bg-surface-container-lowest z-[1001] shadow-2xl transform -translate-x-full transition-transform duration-300 flex flex-col">
            <div class="p-lg border-b border-outline-variant/30 pt-[max(env(safe-area-inset-top),24px)]">
                <h2 class="font-headline-sm text-primary font-bold tracking-tight">minhasdespesas</h2>
            </div>
            
            <div class="flex-1 p-md flex flex-col gap-sm">
                <button onclick="openCategoryAdmin()" class="flex items-center gap-md p-md rounded-lg hover:bg-surface-container-high text-on-surface w-full text-left font-label-lg transition-colors">
                    <span class="material-symbols-outlined text-[20px]">category</span>
                    Gerenciar Categorias
                </button>
                <div class="flex-1"></div>
                <button onclick="logout()" class="flex items-center gap-md p-md rounded-lg hover:bg-error/10 text-error w-full text-left font-label-lg transition-colors mt-auto">
                    <span class="material-symbols-outlined text-[20px]">logout</span>
                    Sair da Conta
                </button>
            </div>
            
            <!-- Storage Usage widget -->
            <div class="p-md bg-surface-container-low m-md rounded-xl border border-outline-variant/30">
                <div class="flex items-center justify-between mb-xs">
                    <span class="font-label-md text-on-surface-variant flex items-center gap-1">
                        <span class="material-symbols-outlined text-[16px]">storage</span> BD Local
                    </span>
                    <span id="storage-percent-text" class="font-label-sm text-primary font-bold">0%</span>
                </div>
                <div class="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div id="storage-percent-bar" class="h-full bg-primary transition-all duration-500" style="width: 0%"></div>
                </div>
                <p class="font-body-sm text-[11px] text-on-surface-variant mt-xs">Uso da memória do aparelho para salvar offline.</p>
            </div>
        </div>
    `;
    
    // Admin Modal HTML
    const adminHTML = `
        <div id="category-admin-modal" class="fixed inset-0 z-[1005] bg-inverse-surface/40 backdrop-blur-sm hidden flex items-center justify-center px-container-margin opacity-0 transition-opacity duration-300">
            <div class="bg-surface-container-lowest p-lg rounded-xl w-full max-w-sm form-shadow scale-95 transition-transform duration-300 transform flex flex-col max-h-[80vh]">
                <div class="flex items-center justify-between mb-md">
                    <h3 class="font-headline-sm text-headline-sm text-on-surface">Categorias</h3>
                    <button onclick="closeCategoryAdmin()" class="p-[2px] rounded-full hover:bg-surface-container-high transition-colors">
                        <span class="material-symbols-outlined text-on-surface-variant">close</span>
                    </button>
                </div>
                
                <div class="flex items-center gap-sm mb-md w-full">
                    <input type="text" id="new-category-input" placeholder="Nova Categoria..." class="flex-1 min-w-0 bg-surface-container-low border-0 border-b-2 border-outline-variant/40 rounded-t-lg px-md py-sm transition-all focus:bg-white focus:border-primary text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary/20">
                    <button onclick="handleAddCategory()" class="shrink-0 whitespace-nowrap bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-lg shadow-primary/30 active:scale-95">Adicionar</button>
                </div>
                
                <div id="category-list-container" class="flex-1 overflow-y-auto space-y-xs pr-xs scrollbar-hide">
                    <!-- Populated by JS -->
                </div>
            </div>
        </div>
    `;
    
    const container = document.createElement('div');
    container.innerHTML = sidebarHTML + adminHTML;
    document.body.appendChild(container);
    
    // Attach event listeners to all menu buttons across the app
    document.querySelectorAll('button, span').forEach(el => {
        if(el.textContent.trim() === 'menu') {
            const btn = el.tagName === 'BUTTON' ? el : el.closest('button');
            if(btn) btn.addEventListener('click', openSidebar);
        }
    });
    
    document.getElementById('global-sidebar-overlay').addEventListener('click', closeSidebar);
}

function updateStorageUsage() {
    let _lsTotal = 0;
    for (let _x in localStorage) {
        if (!localStorage.hasOwnProperty(_x)) continue;
        _lsTotal += ((localStorage[_x].length + _x.length) * 2);
    }
    const maxBytes = 5 * 1024 * 1024; // 5MB approx limits on iOS
    const percent = Math.min(100, (_lsTotal / maxBytes) * 100);
    
    const bar = document.getElementById('storage-percent-bar');
    const text = document.getElementById('storage-percent-text');
    if(bar && text) {
        const val = percent < 0.01 && percent > 0 ? 0.01 : percent;
        bar.style.width = val.toFixed(2) + '%';
        text.innerText = val.toFixed(2) + '%';
        
        if (percent > 80) {
            bar.classList.replace('bg-primary', 'bg-error');
            text.classList.replace('text-primary', 'text-error');
        } else {
            bar.classList.replace('bg-error', 'bg-primary');
            text.classList.replace('text-error', 'text-primary');
        }
    }
}

function openSidebar() {
    updateStorageUsage();
    const overlay = document.getElementById('global-sidebar-overlay');
    const sidebar = document.getElementById('global-sidebar');
    
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        sidebar.classList.remove('-translate-x-full');
    }, 10);
}

function closeSidebar() {
    const overlay = document.getElementById('global-sidebar-overlay');
    const sidebar = document.getElementById('global-sidebar');
    
    overlay.classList.add('opacity-0');
    sidebar.classList.add('-translate-x-full');
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 300);
}

// Category Admin Logic
window.openCategoryAdmin = async function() {
    closeSidebar();
    const modal = document.getElementById('category-admin-modal');
    await renderCategoryAdminList();
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
        modal.querySelector('div').classList.add('scale-100');
    }, 10);
};

window.closeCategoryAdmin = function() {
    const modal = document.getElementById('category-admin-modal');
    modal.classList.add('opacity-0');
    modal.querySelector('div').classList.remove('scale-100');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
    // Reload if on Add Expense or History page to refresh select dropdowns
    if (window.location.pathname.includes('/adicionar_despesa/') || window.location.pathname.includes('/hist_rico_e_exporta_o/')) {
        setTimeout(() => { window.location.reload(); }, 350);
    }
};

window.renderCategoryAdminList = async function() {
    const container = document.getElementById('category-list-container');
    const categories = await getCategories();
    container.innerHTML = categories.map(cat => `
        <div class="flex items-center justify-between bg-surface-container p-sm rounded-lg border border-outline-variant/20 hover:-translate-y-[1px] hover:shadow-sm transition-all duration-200">
            <span class="font-body-md text-on-surface flex items-center gap-xs">
                <span class="material-symbols-outlined text-[18px] text-primary">${getIconForCategory(cat)}</span>
                ${cat}
            </span>
            <div class="flex gap-xs">
                <button onclick="handleEditCategory('${cat}')" class="text-outline-variant hover:text-primary transition-colors p-[2px]">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button onclick="handleDeleteCategoryAdmin('${cat}')" class="text-outline-variant hover:text-error transition-colors p-[2px]">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
            </div>
        </div>
    `).join('');
};

window.handleAddCategory = async function() {
    const input = document.getElementById('new-category-input');
    const val = input.value.trim();
    if(val) {
        await addCategory(val);
        input.value = '';
        await renderCategoryAdminList();
    }
};

window.handleDeleteCategoryAdmin = function(cat) {
    customConfirm(`Tem certeza que deseja excluir a categoria "${cat}"? Despesas atreladas continuarão existindo.`, async () => {
        await deleteCategory(cat);
        await renderCategoryAdminList();
    });
};

window.handleEditCategory = function(cat) {
    customPrompt(`Digite o novo nome para a categoria "${cat}":`, cat, async (newName) => {
        if(newName && newName.trim() !== '') {
            await editCategory(cat, newName);
            await renderCategoryAdminList();
        }
    });
};

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Determine correct path to sw.js based on current location
        const swPath = (window.location.pathname.includes('/boas_vindas/') || 
                        window.location.pathname.includes('/dashboard_de_despesas/') || 
                        window.location.pathname.includes('/adicionar_despesa/') || 
                        window.location.pathname.includes('/hist_rico_e_exporta_o/')) 
                        ? '../sw.js' : './sw.js';
        
        navigator.serviceWorker.register(swPath).then(registration => {
            console.log('SW registered: ', registration.scope);
        }).catch(err => {
            console.log('SW registration failed: ', err);
        });
    });
}

// Modern Custom Modal System
function showCustomModal(title, message, type = 'alert', onConfirm = null, defaultValue = '') {
    let modalContainer = document.getElementById('custom-global-modal');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'custom-global-modal';
        modalContainer.className = 'fixed inset-0 z-[1100] bg-inverse-surface/40 backdrop-blur-sm hidden flex items-center justify-center px-container-margin opacity-0 transition-opacity duration-300';
        document.body.appendChild(modalContainer);
    }
    
    let buttonsHtml = '';
    let messageHtml = `<p class="font-body-md text-on-surface-variant mb-lg">${message}</p>`;

    if (type === 'confirm') {
        buttonsHtml = `
            <button id="modal-btn-cancel" class="px-md py-sm rounded-full font-label-md text-on-surface-variant hover:bg-surface-dim transition-colors">Cancelar</button>
            <button id="modal-btn-confirm" class="px-md py-sm bg-error text-on-error rounded-full font-label-md shadow-lg active:scale-95 transition-all">Confirmar</button>
        `;
    } else if (type === 'prompt') {
        buttonsHtml = `
            <button id="modal-btn-cancel" class="px-md py-sm rounded-full font-label-md text-on-surface-variant hover:bg-surface-dim transition-colors">Cancelar</button>
            <button id="modal-btn-confirm" class="px-md py-sm bg-primary text-on-primary rounded-full font-label-md shadow-lg active:scale-95 transition-all">Salvar</button>
        `;
        messageHtml = `
            <p class="font-body-md text-on-surface-variant mb-md">${message}</p>
            <input type="text" id="modal-prompt-input" class="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant/40 rounded-t-lg px-md py-sm focus:bg-white focus:border-primary text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary/20 transition-all mb-lg" value="${defaultValue}">
        `;
    } else {
        buttonsHtml = `
            <button id="modal-btn-ok" class="px-md py-sm bg-primary text-on-primary rounded-full font-label-md shadow-lg active:scale-95 transition-all w-full">OK</button>
        `;
    }

    modalContainer.innerHTML = `
        <div class="bg-surface-container-lowest p-lg rounded-xl w-full max-w-sm form-shadow scale-95 transition-transform duration-300 transform" id="custom-modal-content">
            <h3 class="font-headline-sm text-headline-sm text-on-surface mb-xs">${title}</h3>
            ${messageHtml}
            <div class="flex items-center justify-end gap-sm">
                ${buttonsHtml}
            </div>
        </div>
    `;

    // Show
    modalContainer.classList.remove('hidden');
    setTimeout(() => {
        modalContainer.classList.remove('opacity-0');
        document.getElementById('custom-modal-content').classList.remove('scale-95');
        document.getElementById('custom-modal-content').classList.add('scale-100');
    }, 10);

    // Close logic
    function closeGlobalModal() {
        modalContainer.classList.add('opacity-0');
        document.getElementById('custom-modal-content').classList.remove('scale-100');
        document.getElementById('custom-modal-content').classList.add('scale-95');
        setTimeout(() => {
            modalContainer.classList.add('hidden');
        }, 300);
    }

    if (type === 'confirm' || type === 'prompt') {
        document.getElementById('modal-btn-cancel').onclick = () => {
            closeGlobalModal();
        };
        document.getElementById('modal-btn-confirm').onclick = () => {
            closeGlobalModal();
            if (onConfirm) {
                if (type === 'prompt') {
                    onConfirm(document.getElementById('modal-prompt-input').value);
                } else {
                    onConfirm();
                }
            }
        };
    } else {
        document.getElementById('modal-btn-ok').onclick = () => {
            closeGlobalModal();
            if (onConfirm) onConfirm();
        };
    }
}

window.customAlert = (message) => {
    showCustomModal('Aviso', message, 'alert');
};

window.customConfirm = (message, onConfirm) => {
    showCustomModal('Confirmação', message, 'confirm', onConfirm);
};

window.customPrompt = (message, defaultValue, onConfirm) => {
    showCustomModal('Editar', message, 'prompt', onConfirm, defaultValue);
};

function showTrialModal(daysRemaining) {
    let modalContainer = document.getElementById('trial-modal-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'trial-modal-container';
        modalContainer.className = 'fixed inset-0 z-[1200] bg-inverse-surface/40 backdrop-blur-sm hidden flex items-center justify-center px-container-margin opacity-0 transition-opacity duration-300';
        document.body.appendChild(modalContainer);
    }
    
    modalContainer.innerHTML = `
        <div class="bg-surface-container-lowest p-lg rounded-2xl w-full max-w-sm form-shadow border border-outline-variant/30 scale-95 transition-all duration-300 transform flex flex-col items-center text-center" id="trial-modal-content">
            <div class="w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-full flex items-center justify-center mb-md shadow-lg shadow-primary/20 animate-bounce">
                <span class="material-symbols-outlined text-[32px] text-white">hourglass_empty</span>
            </div>
            <h3 class="font-headline-sm text-headline-sm text-primary mb-sm font-bold">Período de Teste Ativo</h3>
            <p class="font-body-md text-on-surface-variant mb-md leading-relaxed">
                Você tem até <span class="font-bold text-primary">${daysRemaining} dias</span> de uso da versão free.
            </p>
            <div class="w-full bg-surface-container-low rounded-xl p-md mb-lg border border-outline-variant/20">
                <p class="font-label-md text-on-surface-variant mb-xs">Após o período de teste:</p>
                <p class="font-body-md text-on-surface font-semibold">
                    Você poderá comprar sua licença no valor de <span class="text-secondary font-bold text-lg">R$ 7,00</span> (pagamento único, acesso vitalício).
                </p>
            </div>
            <button id="trial-modal-close-btn" class="w-full py-md bg-primary text-on-primary font-headline-sm rounded-full shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all duration-200 flex items-center justify-center gap-xs">
                Entendi, Continuar
            </button>
        </div>
    `;

    modalContainer.classList.remove('hidden');
    setTimeout(() => {
        modalContainer.classList.remove('opacity-0');
        document.getElementById('trial-modal-content').classList.remove('scale-95');
        document.getElementById('trial-modal-content').classList.add('scale-100');
    }, 10);

    document.getElementById('trial-modal-close-btn').onclick = () => {
        modalContainer.classList.add('opacity-0');
        document.getElementById('trial-modal-content').classList.remove('scale-100');
        document.getElementById('trial-modal-content').classList.add('scale-95');
        setTimeout(() => {
            modalContainer.classList.add('hidden');
        }, 300);
    };
}
