const API_BASE = '/BootcampPHP/api/auth.php';

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

function switchTab(tab) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.form-container').forEach(form => form.classList.remove('active'));
    // Activar el botón y formulario seleccionado
    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
    hideAlert();
}

async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE}?action=status`);
        const data = await response.json();
        if (data.logged_in) {
            showUserInfo(data.username);
        } else {
            showAuthForms();
        }
    } catch (error) {
        console.error('Error verificando estado:', error);
        showAuthForms();
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    if (!username || !password) {
        showAlert('Por favor completa todos los campos', 'error');
        return;
    }
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.success) {
            showAlert('¡Inicio de sesión exitoso!', 'success');
            setTimeout(() => {
                showUserInfo(data.username);
            }, 1000);
        } else {
            showAlert(data.error || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showAlert('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (!username || !password || !confirmPassword) {
        showAlert('Por favor completa todos los campos', 'error');
        return;
    }
    if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden', 'error');
        return;
    }
    if (password.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.success) {
            showAlert('¡Cuenta creada exitosamente!', 'success');
            setTimeout(() => {
                showUserInfo(data.username);
            }, 1000);
        } else {
            showAlert(data.error || 'Error al crear la cuenta', 'error');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showAlert('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        showLoading(false);
    }
}

async function logout() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}?action=logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
            showAlert('Sesión cerrada correctamente', 'success');
            setTimeout(() => {
                showAuthForms();
                clearForms();
            }, 1000);
        }
    } catch (error) {
        console.error('Error en logout:', error);
        showAlert('Error al cerrar sesión', 'error');
    } finally {
        showLoading(false);
    }
}

function showUserInfo(username) {
    document.getElementById('currentUsername').textContent = username;
    document.getElementById('userInfo').style.display = 'block';
    document.getElementById('authForms').style.display = 'none';
}

function showAuthForms() {
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('authForms').style.display = 'block';
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    const submitBtns = document.querySelectorAll('.submit-btn');
    submitBtns.forEach(btn => btn.disabled = show);
}

function showAlert(message, type) {
    const alertElement = document.getElementById('alertMessage');
    alertElement.textContent = message;
    alertElement.className = `alert ${type}`;
    alertElement.style.display = 'block';
    setTimeout(() => {
        hideAlert();
    }, 5000);
}

function hideAlert() {
    document.getElementById('alertMessage').style.display = 'none';
}

function clearForms() {
    document.querySelectorAll('input').forEach(input => input.value = '');
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const activeForm = document.querySelector('.form-container.active form');
        if (activeForm) {
            activeForm.dispatchEvent(new Event('submit'));
        }
    }
});
