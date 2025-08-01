// notifications.js

// Sistema de notificações global
window.NotificationSystem = {
    notifications: [],
    notificationCounter: 1,
    isGeneratingNotification: false,
    lastNotificationTime: 0,
    notificationInterval: null,
    fallbackTimeout: null,
    NOTIFICATION_INTERVAL_MS: 60000, // 1 minuto entre notificações
    FALLBACK_DELAY_MS: 15000, // 15 segundos para fallback
    
    // URL da API baseada no domínio atual
    get API_URL() {
        // Se estamos no domínio da Vercel
        if (window.location.hostname.includes('vercel.app')) {
            return 'https://gemini-api-requests.onrender.com';
        }
        
        // Se estamos em localhost
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001';
        }
        
        // Caso padrão para produção
        return 'https://gemini-api-requests.onrender.com';
    },

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
    addNotification(message, isTemplate = false) {
        const newNotification = {
            notificationId: this.notificationCounter++,
            message: message,
            read: false,
            icon: isTemplate ? 'bi-info-circle' : 'bi-bell',
            timestamp: new Date(),
            isTemplate: isTemplate
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
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.notificationId === notificationId);
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
        this.notificationCounter = 1;
        this.updateNotificationBadge();
        this.renderNotifications();
    },

    // Cancela o timeout de fallback se existir
    cancelFallbackTimeout() {
        if (this.fallbackTimeout) {
            clearTimeout(this.fallbackTimeout);
            this.fallbackTimeout = null;
        }
    },

    // Gera notificação template após delay
    scheduleFallbackNotification() {
        this.cancelFallbackTimeout();
        
        this.fallbackTimeout = setTimeout(() => {
            if (this.isGeneratingNotification) {
                const userInterests = this.getUserInterests();
                const fallbackMessages = this.generateFallbackNotifications(userInterests);
                const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
                
                console.log("[NotificationSystem] Gerando notificação template após timeout da API");
                this.addNotification(fallbackMessages[randomIndex], true);
                this.isGeneratingNotification = false;
            }
        }, this.FALLBACK_DELAY_MS);
    },

    async checkForNewNotifications() {
        if (this.isGeneratingNotification) {
            console.log("[NotificationSystem] Já está gerando notificação, pulando");
            return;
        }

        this.isGeneratingNotification = true;
        this.lastNotificationTime = Date.now();

        console.log("[NotificationSystem] Iniciando geração de nova notificação");

        // Agenda notificação template para caso a API falhe
        this.scheduleFallbackNotification();
        
        try {
            const userInterests = this.getUserInterests();
            
            // Chamada com timeout de 10 segundos
            const response = await this.fetchWithTimeout(
                `${this.API_URL}/requisitarPost`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ 
                        interesses: userInterests,
                        gerarBio: false
                    })
                },
                10000
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (this.isValidPostResponse(data)) {
                // Cancela o timeout de fallback já que a API funcionou
                this.cancelFallbackTimeout();
                
                console.log("[NotificationSystem] Notificação da API gerada com sucesso");
                this.addNotification(data.texto, false);
                this.isGeneratingNotification = false;
            } else {
                throw new Error('Resposta inválida da API');
            }
        } catch (error) {
            console.error('Erro ao buscar notificação da API:', error);
            // O fallback será executado pelo timeout já agendado
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
            "🔔 Novas atualizações disponíveis no seu feed!",
            "📱 Confira as últimas novidades da plataforma",
            "✨ Temos conteúdo interessante para você",
            "🎯 Descubra novas oportunidades hoje",
            "💡 Dica: Explore novos conteúdos no seu feed",
            "🌟 Novidades chegando! Dê uma olhada",
            "📈 Mantenha-se atualizado com as últimas tendências",
            "🎪 Há sempre algo novo acontecendo aqui"
        ];
        
        if (interests.length === 0 || interests.includes('aleatório')) {
            return baseMessages;
        }
        
        // Mensagens personalizadas por interesse
        const interestMessages = interests.flatMap(interest => [
            `🎯 Novo conteúdo sobre ${interest} disponível!`,
            `📚 Descubra mais sobre ${interest} no seu feed`,
            `⭐ Conteúdo recomendado: ${interest}`,
            `🔍 Explore: ${interest} - novidades te aguardam!`
        ]);
        
        return [...baseMessages, ...interestMessages];
    },

    // Implementação de fetch com timeout
    async fetchWithTimeout(resource, options = {}, timeout = 5000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(resource, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    },

    // Renderiza notificações na página
    renderNotifications() {
        let attempts = 0;
        const maxAttempts = 5;

        const tryRender = () => {
            const container = document.getElementById('notifications-container');
            if (container) {
                container.innerHTML = this.notifications.length 
                    ? this.generateNotificationsHTML() 
                    : this.generateEmptyStateHTML();
                
                this.addMarkAsReadListeners();
            } else if (attempts < maxAttempts) {
                attempts++;
                console.log(`[NotificationSystem] Container não encontrado, tentativa ${attempts}/${maxAttempts}`);
                setTimeout(tryRender, 100);
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
                    <div class="notification-card ${notification.read ? '' : 'unread'} ${notification.isTemplate ? 'template-notification' : ''}">
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
                                ${notification.isTemplate ? ' • Template' : ''}
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
                <small>As notificações aparecerão aqui a cada minuto quando houver atividade.</small>
            </div>
        `;
    },

    // Adiciona listeners para botões "Marcar como lida"
    addMarkAsReadListeners() {
        document.querySelectorAll('.mark-as-read').forEach(button => {
            button.addEventListener('click', (e) => {
                const notificationId = parseInt(e.target.dataset.notificationId);
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
            ? '🎉 Sistema de notificações iniciado! Você receberá notificações a cada minuto.'
            : `🎉 Sistema de notificações iniciado! Você receberá notificações sobre: ${userInterests.join(', ')} a cada minuto.`;
        
        this.addNotification(welcomeMessage);
        
        // Configura intervalo de 1 minuto
        this.notificationInterval = setInterval(
            () => this.checkForNewNotifications(), 
            this.NOTIFICATION_INTERVAL_MS
        );
        
        // Primeira verificação após 5 segundos
        setTimeout(() => this.checkForNewNotifications(), 5000);
        
        console.log(`[NotificationSystem] Sistema configurado para gerar notificações a cada ${this.NOTIFICATION_INTERVAL_MS/1000} segundos`);
    },

    // Para o sistema
    stopNotificationSystem() {
        console.log("[NotificationSystem] Parando sistema de notificações");
        if (this.notificationInterval) {
            clearInterval(this.notificationInterval);
            this.notificationInterval = null;
        }
        
        // Cancela qualquer timeout de fallback pendente
        this.cancelFallbackTimeout();
        this.isGeneratingNotification = false;
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