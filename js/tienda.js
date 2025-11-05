// Datos de ejemplo
const productos = [
  { id: 'p1', titulo: 'Polera Bendito', imagen: 'images/polera.jpg', precio: 3500, categoria: 'camisetas' },
  { id: 'p2', titulo: 'Abrigo Pro', imagen: 'images/abrigo.jpg', precio: 7800, categoria: 'abrigos' },
  { id: 'p3', titulo: 'Short Cross', imagen: 'images/short.jpg', precio: 2500, categoria: 'pantalones' },
  { id: 'p4', titulo: 'Guantes Grip', imagen: 'images/guantes.jpg', precio: 1200, categoria: 'accesorios' },
  { id: 'p5', titulo: 'Camiseta Técnica', imagen: 'images/camiseta2.jpg', precio: 4200, categoria: 'camisetas' },
  { id: 'p6', titulo: 'Malla Térmica', imagen: 'images/malla.jpg', precio: 6200, categoria: 'pantalones' },
  { id: 'p7', titulo: 'Mochila Gym', imagen: 'images/mochila.jpg', precio: 9900, categoria: 'accesorios' },
  { id: 'p8', titulo: 'Cinta Wrist', imagen: 'images/wrist.jpg', precio: 900, categoria: 'accesorios' },
  { id: 'p9', titulo: 'Poleron Hoodie', imagen: 'images/hoodie.jpg', precio: 8600, categoria: 'abrigos' },
];

// Estado carrito (persistente)
let productosEnCarrito = JSON.parse(localStorage.getItem('productosEnCarrito')) || [];

// Encapsular inicialización para evitar errores si el script se carga en otras páginas
document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM
  const contenedorProductos = document.getElementById('productos');
  const botonesCategoria = document.querySelectorAll('.categoria-btn');
  const numerito = document.getElementById('numerito');
  const verCarritoBtn = document.getElementById('ver-carrito');
  const carritoPanel = document.getElementById('carrito-panel');
  const carritoList = document.getElementById('carrito-list');
  const carritoTotal = document.getElementById('carrito-total');
  const totalCompact = document.getElementById('total-compact');
  const vaciarBtn = document.getElementById('vaciar-carrito');
  const cerrarCarritoBtn = document.getElementById('cerrar-carrito');

  // Helpers seguros
  function safeText(n){ return n ? String(n) : ''; }
  function guardarCarrito(){
    localStorage.setItem('productosEnCarrito', JSON.stringify(productosEnCarrito));
  }

  // Cargar productos en DOM
  function cargarProductos(lista){
    if(!contenedorProductos) return;
    contenedorProductos.innerHTML = '';
    if(!lista || lista.length === 0){
      contenedorProductos.innerHTML = '<div class="carrito-vacio">No hay productos en esta categoría.</div>';
      return;
    }
    lista.forEach(p => {
      const card = document.createElement('article');
      card.className = 'producto';
      card.innerHTML = `
        <div class="img-wrap"><img src="${p.imagen}" alt="${p.titulo}" loading="lazy" onerror="this.onerror=null;this.src='images/placeholder.png'"></div>
        <div>
          <h4>${safeText(p.titulo)}</h4>
          <p class="price">$${safeText(p.precio)}</p>
        </div>
        <div class="meta">
          <small class="muted">${safeText(p.categoria)}</small>
          <button class="btn add" data-id="${p.id}">Añadir</button>
        </div>
      `;
      contenedorProductos.appendChild(card);
    });

    // listeners para añadir
    contenedorProductos.querySelectorAll('.add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if(id) agregarAlCarrito(id);
      });
    });
  }

  // Filtrado por categoría
  if(botonesCategoria && botonesCategoria.length){
    botonesCategoria.forEach(b => {
      b.addEventListener('click', (e) => {
        botonesCategoria.forEach(x => x.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const cat = e.currentTarget.id;
        if(cat === 'todas') cargarProductos(productos);
        else cargarProductos(productos.filter(p => p.categoria === cat));
      });
    });
  }

  // Carrito: agregar
  function agregarAlCarrito(id){
    const existe = productosEnCarrito.some(p => p.id === id);
    if(existe){
      const idx = productosEnCarrito.findIndex(p => p.id === id);
      productosEnCarrito[idx].cantidad = (productosEnCarrito[idx].cantidad || 0) + 1;
    } else {
      const prod = productos.find(p => p.id === id);
      if(!prod) return;
      productosEnCarrito.push({...prod, cantidad:1});
    }
    guardarCarrito();
    actualizarNumerito();
    actualizarTotal();
    // si el panel está abierto, renderizarlo en caliente
    if(carritoPanel && !carritoPanel.classList.contains('hidden')) renderCarrito();
  }

  // Actualizar numerito (suma de cantidades)
  function actualizarNumerito(){
    if(!numerito) return;
    const suma = productosEnCarrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);
    numerito.textContent = suma;
  }

  // Mostrar panel carrito
  if(verCarritoBtn){
    verCarritoBtn.addEventListener('click', () => {
      if(!carritoPanel) return;
      carritoPanel.classList.toggle('hidden');
      const hidden = carritoPanel.classList.contains('hidden');
      carritoPanel.setAttribute('aria-hidden', hidden ? 'true' : 'false');
      renderCarrito();
    });
  }

  // Renderizar items en carrito
  function renderCarrito(){
    if(!carritoList) return;
    carritoList.innerHTML = '';
    if(productosEnCarrito.length === 0){
      carritoList.innerHTML = '<div class="carrito-vacio">Tu carrito está vacío.</div>';
      if(carritoTotal) carritoTotal.textContent = '0';
      if(totalCompact) totalCompact.textContent = '0';
      return;
    }
    productosEnCarrito.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'carrito-item';
      div.innerHTML = `
        <img src="${p.imagen}" alt="${p.titulo}" onerror="this.onerror=null;this.src='images/placeholder.png'">
        <div style="flex:1;">
          <div>${safeText(p.titulo)}</div>
          <small>Cant: ${p.cantidad} · $${p.precio}</small>
        </div>
        <div style="text-align:right;">
          <button class="btn remove" data-i="${i}">Eliminar</button>
        </div>
      `;
      carritoList.appendChild(div);
    });
    // listeners eliminar
    carritoList.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.dataset.i);
        if(!Number.isNaN(idx)) eliminarDelCarrito(idx);
      });
    });
    actualizarTotal();
  }

  // Eliminar por índice
  function eliminarDelCarrito(idx){
    if(idx < 0 || idx >= productosEnCarrito.length) return;
    productosEnCarrito.splice(idx,1);
    guardarCarrito();
    actualizarNumerito();
    renderCarrito();
  }

  // Vaciar carrito
  if(vaciarBtn){
    vaciarBtn.addEventListener('click', () => {
      productosEnCarrito = [];
      guardarCarrito();
      actualizarNumerito();
      renderCarrito();
    });
  }

  // Cerrar carrito
  if(cerrarCarritoBtn) cerrarCarritoBtn.addEventListener('click', () => {
    if(carritoPanel) {
      carritoPanel.classList.add('hidden');
      carritoPanel.setAttribute('aria-hidden', 'true');
    }
  });

  // Calcular total
  function actualizarTotal(){
    const total = productosEnCarrito.reduce((acc,p) => acc + ((p.precio || 0) * (p.cantidad || 0)), 0);
    if(carritoTotal) carritoTotal.textContent = total;
    if(totalCompact) totalCompact.textContent = total;
    guardarCarrito();
  }

  // Inicialización UI
  cargarProductos(productos);
  actualizarNumerito();
  actualizarTotal();
});