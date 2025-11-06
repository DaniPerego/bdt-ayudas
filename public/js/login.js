document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const messageContainer = document.getElementById('message-container');
    const socioIdInput = document.getElementById('socio-id');

    loginForm.addEventListener('submit', async (event) => {
        // Evitamos que el formulario recargue la página
        event.preventDefault();

        const socioId = socioIdInput.value;
        messageContainer.textContent = 'Verificando...';
        messageContainer.style.color = 'black';

        try {
            const response = await fetch('/api/acceso/verificar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ socioId: socioId }),
            });

            const result = await response.json();

            if (response.ok) {
                messageContainer.textContent = result.message;
                messageContainer.style.color = 'green';
            } else {
                throw new Error(result.message || 'Error al verificar el acceso.');
            }

        } catch (error) {
            messageContainer.textContent = error.message;
            messageContainer.style.color = 'red';
        } finally {
            // Limpiamos el campo de texto después de la verificación
            socioIdInput.value = '';
        }
    });
});