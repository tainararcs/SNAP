// notifications.js

// Sistema de notificações global
window.NotificationSystem = {
    notifications: [],
    notificationId: 1,
    isGeneratingNotification: false,
    lastNotificationTime: 0,
    notificationInterval: null,
    NOTIFICATION_COOLDOWN_MS: 20000, // 20 segundos entre notificações
    API_URL: 'http://localhost:3001',

    // Atualiza o badge de notificações na sidebar
    updateNotificationBadge() {
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
        const newNotification = {
            id: this.notificationId++,
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
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.updateNotificationBadge();
            this.renderNotifications();
        }
    },

    // Marca TODAS as notificações como lidas
    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateNotificationBadge();
        this.renderNotifications();
    },

    // Limpa TODAS as notificações
    clearAllNotifications() {
        this.notifications = [];
        this.notificationId = 1; // Reseta o contador
        this.updateNotificationBadge();
        this.renderNotifications();
    },

    // Verifica se pode gerar nova notificação
    shouldGenerateNotification() {
        const now = Date.now();
        return (now - this.lastNotificationTime >= this.NOTIFICATION_COOLDOWN_MS) 
            && !this.isGeneratingNotification;
    },

    // Busca novas notificações
    async checkForNewNotifications() {
        if (!this.shouldGenerateNotification()) return;

        this.isGeneratingNotification = true;
        this.lastNotificationTime = Date.now();

        try {
            const userInterests = this.getUserInterests();
            const response = await fetch(`${this.API_URL}/requisitarPost`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ interesses: userInterests })
            });

            if (!response.ok) throw new Error(`Erro: ${response.status}`);
            
            const data = await response.json();
            if (data?.texto) {
                this.addNotification(data.texto);
            }
        } catch (error) {
            console.error('Erro ao buscar notificação:', error);
        } finally {
            this.isGeneratingNotification = false;
        }
    },

    // Renderiza notificações na página
    renderNotifications() {
        const container = document.getElementById('notifications-container');
        if (!container) return;

        container.innerHTML = this.notifications.length 
            ? this.generateNotificationsHTML() 
            : this.generateEmptyStateHTML();
        
        this.addMarkAsReadListeners();
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
                            `<button class="mark-as-read" data-id="${notification.id}">
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
                const id = parseInt(e.target.dataset.id);
                this.markAsRead(id);
            });
        });
    },

    // Inicia o sistema
    startNotificationSystem() {
        const userInterests = this.getUserInterests();
        const welcomeMessage = userInterests.includes('aleatório') || userInterests.length < 2
            ? 'Sistema de notificações iniciado!'
            : `Sistema de notificações iniciado! Você receberá notificações sobre: ${userInterests.join(', ')}`;
        
        this.addNotification(welcomeMessage);
        
        this.notificationInterval = setInterval(
            () => this.checkForNewNotifications(), 
            60000
        );
        
        setTimeout(() => this.checkForNewNotifications(), 5000);
    },

    // Para o sistema
    stopNotificationSystem() {
        clearInterval(this.notificationInterval);
        this.notificationInterval = null;
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

        loadPage("notifications", "notifications.html", () => {
            console.log("Notificações carregadas");
            
            // Renderiza as notificações
            window.NotificationSystem.renderNotifications();
            
            // Atualiza o badge (opcional: marcar todas como lidas ao entrar)
            window.NotificationSystem.updateNotificationBadge();
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