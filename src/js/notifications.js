// notifications.js

// Sistema de notificações global
window.NotificationSystem = {
    notifications: [],
    notificationCounter: 1, // Renomeado de notificationId para notificationCounter
    isGeneratingNotification: false,
    lastNotificationTime: 0,
    notificationInterval: null,
    NOTIFICATION_COOLDOWN_MS: 20000, // 20 segundos entre notificações
    API_URL: 'http://localhost:3001',

    // Atualiza o badge de notificações na sidebar
    updateNotificationBadge() {
        console.log("[NotificationSystem] Atualizando badge de notificações");
        const notifLink = document.querySelector("#link-notif");
        if (!notifLink) return;
        
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const existingBadge = notifLink.querySelector('.notification-badge');
        
        if (existingBadge) existingBadge.remove();
        
        if (unreadCount > 0) {
            const badge = document.createElement('span');
            badge.className = 'notification-badge';
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                background: #dc3545;
                color: white;
                border-radius: 50%;
                padding: 2px 6px;
                font-size: 12px;
                font-weight: bold;
                min-width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
            `;
            
            if (getComputedStyle(notifLink).position === 'static') {
                notifLink.style.position = 'relative';
            }
            
            notifLink.appendChild(badge);
        }
    },

    // Obtém interesses do usuário
    getUserInterests() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return (user && user.interests && user.interests.length) 
                ? user.interests 
                : ['aleatório'];
        } catch (error) {
            console.error('Erro ao recuperar interesses:', error);
            return ['aleatório'];
        }
    },

    // Adiciona nova notificação
    addNotification(message) {
        console.log(`[NotificationSystem] Adicionando notificação: "${message}"`);
        const newNotification = {
            notificationId: this.notificationCounter++, // Renomeado id para notificationId
            message: message,
            read: false,
            icon: 'bi-bell',
            timestamp: new Date()
        };
        
        this.notifications.unshift(newNotification);
        
        // Limita histórico
        if (this.notifications.length > 30) {
            this.notifications = this.notifications.slice(0, 30);
        }
        
        this.updateNotificationBadge();
        
        // Atualiza renderização se estiver na página de notificações
        if (document.querySelector('#notifications-container')) {
            this.renderNotifications();
        }
    },

    // Marca notificação como lida
    markAsRead(notificationId) { // Renomeado parâmetro id para notificationId
        console.log(`[NotificationSystem] Marcando notificação ${notificationId} como lida`);
        const notification = this.notifications.find(n => n.notificationId === notificationId); // Renomeado id para notificationId
        if (notification) {
            notification.read = true;
            this.updateNotificationBadge();
            this.renderNotifications();
        }
    },

    // Marca TODAS as notificações como lidas
    markAllAsRead() {
        console.log("[NotificationSystem] Marcando todas as notificações como lidas");
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateNotificationBadge();
        this.renderNotifications();
    },

    // Limpa TODAS as notificações
    clearAllNotifications() {
        console.log("[NotificationSystem] Limpando todas as notificações");
        this.notifications = [];
        this.notificationCounter = 1; // Renomeado notificationId para notificationCounter
        this.updateNotificationBadge();
        this.renderNotifications();
    },

    // Verifica se pode gerar nova notificação
    shouldGenerateNotification() {
        const now = Date.now();
        return (now - this.lastNotificationTime >= this.NOTIFICATION_COOLDOWN_MS) 
            && !this.isGeneratingNotification;
    },

    async checkForNewNotifications() {
        if (!this.shouldGenerateNotification()) {
            console.log("[NotificationSystem] Aguardando cooldown para nova notificação");
            return;
        }

        this.isGeneratingNotification = true;
        this.lastNotificationTime = Date.now();
        console.log("[NotificationSystem] Verificando novas notificações...");

        try {
            const userInterests = this.getUserInterests();
            
            // Chamada mais robusta com timeout e tratamento de erros específicos
            const response = await this.fetchWithTimeout(
                `${this.API_URL}/requisitarPost`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ interesses: userInterests })
                },
                5000 // 5 segundos de timeout
            );

            // Verifica se a resposta é válida
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Validação rigorosa da resposta
            if (this.isValidPostResponse(data)) {
                this.addNotification(data.texto);
            } else {
                throw new Error('Resposta inválida da API');
            }
        } catch (error) {
            console.error('Erro ao buscar notificação:', error);
            
            // Mensagens de fallback baseadas nos interesses do usuário
            const fallbackMessages = this.generateFallbackNotifications(userInterests);
            const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
            this.addNotification(fallbackMessages[randomIndex]);
        } finally {
            this.isGeneratingNotification = false;
        }
    },

    // Validador de resposta da API
    isValidPostResponse(data) {
        return data && 
            typeof data === 'object' &&
            typeof data.texto === 'string' && 
            data.texto.trim() !== '' &&
            Array.isArray(data.interesses);
    },

    // Gera mensagens de fallback baseadas nos interesses
    generateFallbackNotifications(interests) {
        const baseMessages = [
            "Novas atualizações disponíveis no seu feed!",
            "Confira as últimas novidades",
            "Temos novidades para você"
        ];
        
        if (interests.length === 0 || interests.includes('aleatório')) {
            return baseMessages;
        }
        
        // Mensagens personalizadas por interesse
        const interestMessages = interests.map(interest => 
            `Novo conteúdo sobre ${interest} disponível!`
        );
        
        return [...baseMessages, ...interestMessages];
    },

    // Implementação de fetch com timeout
    async fetchWithTimeout(resource, options = {}, timeout = 5000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(id);
        return response;
    },

    // Renderiza notificações na página
    renderNotifications() {
        console.log("[NotificationSystem] Renderizando notificações...");
        let attempts = 0;
        const maxAttempts = 5;

        const tryRender = () => {
            const container = document.getElementById('notifications-container');
            if (container) {
                container.innerHTML = this.notifications.length 
                    ? this.generateNotificationsHTML() 
                    : this.generateEmptyStateHTML();
                
                this.addMarkAsReadListeners();
                console.log("[NotificationSystem] Notificações renderizadas com sucesso.");
            } else if (attempts < maxAttempts) {
                attempts++;
                console.log(`[NotificationSystem] Container não encontrado, tentativa ${attempts}/${maxAttempts}`);
                setTimeout(tryRender, 100); // Tenta novamente após 100ms
            } else {
                console.error("[NotificationSystem] Falha ao encontrar container de notificações após múltiplas tentativas.");
            }
        };

        tryRender();
    },

    // Gera HTML para notificações
    generateNotificationsHTML() {
        // Ordena por data (mais recente primeiro)
        this.notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return `
            <div class="notification-header">
                <h1 class="title">Notificações</h1>
                <div class="notification-actions">
                    <button id="mark-all-read" class="btn btn-outline-primary standard-btn notification-btn">
                        <i class="bi bi-check-all"></i> Marcar todas como lidas
                    </button>
                    <button id="clear-all" class="btn btn-outline-danger standard-btn notification-btn">
                        <i class="bi bi-trash"></i> Limpar todas
                    </button>
                </div>
            </div>
            <div class="notifications-list">
                ${this.notifications.map(notification => `
                    <div class="notification-card ${notification.read ? '' : 'unread'}">
                        <div class="notification-icon">
                            <i class="bi ${notification.icon}"></i>
                        </div>
                        <div class="notification-content">
                            <p class="notification-message">${notification.message}</p>
                            <small class="notification-time">
                                ${new Date(notification.timestamp).toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </small>
                        </div>
                        ${!notification.read ? 
                            `<button class="mark-as-read" data-notification-id="${notification.notificationId}">
                                Marcar como lida
                            </button>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Gera HTML para estado vazio
    generateEmptyStateHTML() {
        return `
            <div class="notification-header">
                <h1 class="notification-title">Notificações</h1>
            </div>
            <div class="no-notifications">
                <p>Nenhuma notificação no momento.</p>
                <small>As notificações aparecerão aqui quando houver atividade.</small>
            </div>
        `;
    },

    // Adiciona listeners para botões "Marcar como lida"
    addMarkAsReadListeners() {
        document.querySelectorAll('.mark-as-read').forEach(button => {
            button.addEventListener('click', (e) => {
                const notificationId = parseInt(e.target.dataset.notificationId); // Renomeado para notificationId
                this.markAsRead(notificationId);
            });
        });
    },

    // Inicia o sistema
    startNotificationSystem() {
        console.log("[NotificationSystem] Iniciando sistema de notificações");
        if (this.notificationInterval) {
            console.log("[NotificationSystem] Sistema já está rodando");
            return;
        }

        const userInterests = this.getUserInterests();
        const welcomeMessage = userInterests.includes('aleatório') || userInterests.length < 2
            ? 'Sistema de notificações iniciado!'
            : `Sistema de notificações iniciado! Você receberá notificações sobre: ${userInterests.join(', ')}`;
        
        this.addNotification(welcomeMessage);
        
        this.notificationInterval = setInterval(
            () => this.checkForNewNotifications(), 
            60000 // Verifica a cada 60 segundos
        );
        
        // Primeira verificação após 5 segundos
        setTimeout(() => this.checkForNewNotifications(), 5000);
    },

    // Para o sistema
    stopNotificationSystem() {
        console.log("[NotificationSystem] Parando sistema de notificações");
        if (this.notificationInterval) {
            clearInterval(this.notificationInterval);
            this.notificationInterval = null;
        }
    }
};

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', () => {
    window.NotificationSystem.startNotificationSystem();
    window.NotificationSystem.updateNotificationBadge();
});

// Navegação para página de notificações
const notifLink = document.querySelector("#link-notif");
if (notifLink) {
    notifLink.addEventListener("click", (e) => {
        e.preventDefault();

        // Garante que o sistema está rodando
        if (!window.NotificationSystem.notificationInterval) {
            window.NotificationSystem.startNotificationSystem();
        }

        loadPage("notifications", "notifications.html", () => {
            console.log("Notificações carregadas");
            
            // Adiciona um pequeno atraso para garantir que o container esteja no DOM
            setTimeout(() => {
                window.NotificationSystem.renderNotifications();
            }, 50);
        });

        setActiveLink("link-notif");
        showPage("page-notifications");
    });
}

// Event listeners para a página de notificações
document.addEventListener("click", (e) => {
    // Botão "Limpar todas"
    if(e.target.id === 'clear-all' || e.target.closest('#clear-all')) {
        if (confirm('Tem certeza que deseja limpar todas as notificações?')) {
            window.NotificationSystem.clearAllNotifications();
        }
    }
    
    // Botão "Marcar todas como lidas"
    if(e.target.id === 'mark-all-read' || e.target.closest('#mark-all-read')) {
        window.NotificationSystem.markAllAsRead();
    }
});

// Limpeza ao fechar
window.addEventListener('beforeunload', () => {
    window.NotificationSystem.stopNotificationSystem();
});