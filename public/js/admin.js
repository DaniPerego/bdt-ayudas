document.addEventListener('DOMContentLoaded', () => {
    const addSocioForm = document.getElementById('add-socio-form');
    const sociosTbody = document.getElementById('socios-tbody');
    const formMessage = document.getElementById('form-message');

    const fetchAndRenderSocios = async () => {
        try {
            const response = await fetch('/api/socios');
            const socios = await response.json();
            sociosTbody.innerHTML = ''; // Limpiar tabla
            socios.forEach(socio => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${socio.id}</td>
                    <td>${socio.nombre}</td>
                    <td>${socio.fecha_vencimiento_cuota}</td>
                    <td><button class="delete-btn" data-id="${socio.id}">Eliminar</button></td>
                `;
                sociosTbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error al cargar socios:', error);
        }
    };

    addSocioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('socio-id').value;
        const nombre = document.getElementById('socio-nombre').value;
        const fecha_vencimiento_cuota = document.getElementById('socio-vencimiento').value;

        try {
            const response = await fetch('/api/socios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, nombre, fecha_vencimiento_cuota }),
            });
            const result = await response.json();
            formMessage.textContent = result.message;
            if (response.ok) {
                addSocioForm.reset();
                fetchAndRenderSocios(); // Recargar la lista
            }
        } catch (error) {
            formMessage.textContent = 'Error al guardar socio.';
            console.error('Error en el formulario:', error);
        }
    });

    sociosTbody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            if (confirm(`¿Seguro que quieres eliminar al socio con ID ${id}?`)) {
                try {
                    await fetch(`/api/socios/${id}`, { method: 'DELETE' });
                    fetchAndRenderSocios(); // Recargar la lista
                } catch (error) {
                    console.error('Error al eliminar:', error);
                }
            }
        }
    });

    // Carga inicial de socios
    fetchAndRenderSocios();
});