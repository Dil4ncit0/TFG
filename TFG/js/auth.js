const API_BASE_URL = 'http://127.0.0.1:5050';  // Sin /api porque tu backend no usa ese prefijo

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) setupLoginForm();
    if (registerForm) setupRegisterForm();

    checkAuthStatus(); // redirección si ya está logueado en login o registro
    updateNavbar();    // mostrar u ocultar botones en la navbar
    setupLogout();     // configuración botón cerrar sesión
});

// ------------------------------
// LOGIN
function setupLoginForm() {
    const form = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(form);
        const username = formData.get('username');  
        const password = formData.get('password');
        const remember = formData.get('remember');

        loginBtn.disabled = true;
        loginBtn.textContent = 'Iniciando sesión...';
        hideError();

        try {
            const response = await fetch(`${API_BASE_URL}/iniciar_sesion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok) {
                if (remember) localStorage.setItem('rememberLogin', 'true');

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', username);
                localStorage.setItem('token', result.token); // JWT recibido
                window.location.href = 'perfil.html';
            } else {
                showError(result.message || 'Credenciales incorrectas.');
            }
        } catch (error) {
            showError('Error al conectar con el servidor.');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Iniciar Sesión';
        }
    });

    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }
}

// ------------------------------
// REGISTRO
function setupRegisterForm() {
    const form = document.getElementById('register-form');
    const registerBtn = document.getElementById('register-btn');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(form);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const terms = formData.get('terms');

        if (password !== confirmPassword) {
            showError('Las contraseñas no coinciden');
            return;
        }

        if (!terms) {
            showError('Debes aceptar los términos y condiciones');
            return;
        }

        if (password.length < 8) {
            showError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        registerBtn.disabled = true;
        registerBtn.textContent = 'Creando cuenta...';
        hideError();

        try {
            const response = await fetch(`${API_BASE_URL}/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, confirm_password: confirmPassword })
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('username', username);
                window.location.href = 'perfil.html';
            } else {
                showError(result.message || 'Error al registrarse.');
            }
        } catch (error) {
            showError('No se pudo conectar al servidor.');
        } finally {
            registerBtn.disabled = false;
            registerBtn.textContent = 'Registrarse';
        }
    });

    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }
}

// ------------------------------
// REDIRECCIÓN AUTOMÁTICA SI YA ESTÁ LOGUEADO
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();

    if (isLoggedIn && (currentPage === 'inicio.html' || currentPage === 'registro.html')) {
        window.location.href = 'perfil.html';
    }
}

// ------------------------------
// ACTUALIZA BARRA DE NAVEGACIÓN
function updateNavbar() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    const loginBtn    = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const profileBtn  = document.getElementById('profile-btn');
    const logoutBtn   = document.getElementById('logout-btn'); // <a> o <button>

    if (isLoggedIn) {
        if (loginBtn)    loginBtn.classList.add('hidden');
        if (registerBtn) registerBtn.classList.add('hidden');
        if (profileBtn)  profileBtn.classList.remove('hidden');
        if (logoutBtn)   logoutBtn.classList.remove('hidden');
    } else {
        if (loginBtn)    loginBtn.classList.remove('hidden');
        if (registerBtn) registerBtn.classList.remove('hidden');
        if (profileBtn)  profileBtn.classList.add('hidden');
        if (logoutBtn)   logoutBtn.classList.add('hidden');
    }
}

// ------------------------------
// CONFIGURA BOTÓN DE CERRAR SESIÓN
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault(); // por si es un <a>
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('username');
            localStorage.removeItem('token');
            localStorage.removeItem('rememberLogin');
            window.location.href = 'inicio.html';
        });
    }
}
