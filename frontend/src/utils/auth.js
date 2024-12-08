// Tiempo de inactividad en milisegundos (15 minutos)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

class AuthService {
    constructor() {
        this.timeoutId = null;
        this.logoutCallback = null;
    }

    // Iniciar el temporizador de inactividad
    startInactivityTimer(callback) {
        this.logoutCallback = callback;
        this.resetInactivityTimer();
        
        // Agregar event listeners para resetear el temporizador
        const events = ['mousedown', 'keydown', 'mousemove', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, () => this.resetInactivityTimer());
        });
    }

    // Resetear el temporizador de inactividad
    resetInactivityTimer() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        
        this.timeoutId = setTimeout(() => {
            // Ejecutar el callback de logout
            if (this.logoutCallback) {
                this.logoutCallback();
            }
        }, INACTIVITY_TIMEOUT);
    }

    // Limpiar el temporizador y los event listeners
    clearInactivityTimer() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        
        const events = ['mousedown', 'keydown', 'mousemove', 'touchstart'];
        events.forEach(event => {
            document.removeEventListener(event, () => this.resetInactivityTimer());
        });
    }

    // Guardar información del usuario
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('lastActivity', Date.now().toString());
    }

    // Obtener información del usuario
    getUser() {
        const user = localStorage.getItem('user');
        const lastActivity = localStorage.getItem('lastActivity');
        
        if (!user || !lastActivity) {
            return null;
        }

        // Verificar si ha pasado el tiempo de inactividad
        if (Date.now() - parseInt(lastActivity) > INACTIVITY_TIMEOUT) {
            this.logout();
            return null;
        }

        return JSON.parse(user);
    }

    // Cerrar sesión
    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
        this.clearInactivityTimer();
    }
}

export const authService = new AuthService();
