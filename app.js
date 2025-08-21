// app.js — simple store logic (localStorage) + UI hooks
const PRODUCTS = [
  {id:'croissant', name:'Croissant Mentega', price:15000},
  {id:'donut', name:'Donut Glaze', price:12000},
  {id:'pain', name:'Pain au Chocolat', price:18000},
  {id:'cinnamon', name:'Cinnamon Roll', price:17000},
  {id:'fruittart', name:'Fruit Tart', price:20000},
  {id:'macaron', name:'Macaron', price:9000},
  {id:'cookies', name:'Cookies & Cream', price:14000},
  {id:'eclair', name:'Éclair Cokelat', price:16000},
  {id:'muffin', name:'Blueberry Muffin', price:13000},
  {id:'brownie', name:'Brownie Fudge', price:19000},
];

// rupiah formatter
const rupiah = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);

// init home popular products (first 5)
const homeProductsEl = document.getElementById('homeProducts');
if(homeProductsEl) {
  PRODUCTS.slice(0,5).forEach(p=>{
    const el = document.createElement('div');
    el.className='product card';
    el.innerHTML = `<img src="images/${p.id}.png" alt="${p.name}"><div class="prod-info"><h4>${p.name}</h4><div class="price">${rupiah(p.price)}</div><button class="btn primary add">Tambah ke Keranjang</button></div>`;
    el.dataset.id = p.id; el.dataset.name = p.name; el.dataset.price = p.price;
    homeProductsEl.appendChild(el);
  });
}

// cart helpers
const LS_CART = 'nish_cart_v1';
const readCart = ()=> JSON.parse(localStorage.getItem(LS_CART) || '[]');
const writeCart = (c)=>{ localStorage.setItem(LS_CART, JSON.stringify(c)); renderCart(); }
const cartCountEls = [document.getElementById('cartCount'), document.getElementById('cartCount2'), document.getElementById('cartCount3')].filter(Boolean);

function renderCart(){
  const cart = readCart();
  const count = cart.reduce((s,i)=>s+i.qty,0);
  cartCountEls.forEach(el=>el.textContent = count);
  const cartDrawer = document.getElementById('cartDrawer');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  if(cartItems) cartItems.innerHTML = cart.length ? cart.map((it,ix)=>`<div class="row" style="justify-content:space-between;padding:8px 0;border-bottom:1px dashed #eee"><div><strong>${it.name}</strong><div style="font-size:12px;color:#6b7280">Rp ${it.price.toLocaleString('id-ID')}</div></div><div class="row"><button data-ix="${ix}" class="btn outline dec">−</button><div style="min-width:28px;text-align:center">${it.qty}</div><button data-ix="${ix}" class="btn outline inc">+</button><button data-ix="${ix}" class="btn" style="background:#fee2e2">Hapus</button></div></div>`).join('') : '<small>Keranjang kosong.</small>';
  if(cartTotal) cartTotal.textContent = rupiah(cart.reduce((s,i)=>s+i.qty*i.price,0));
}

renderCart();

// add to cart (delegation)
document.addEventListener('click', e=>{
  const add = e.target.closest('.add');
  if(add){
    const p = add.closest('.product');
    const item = {id:p.dataset.id, name:p.dataset.name, price:parseInt(p.dataset.price), qty:1};
    const cart = readCart();
    const idx = cart.findIndex(x=>x.id===item.id);
    if(idx>-1) cart[idx].qty++;
    else cart.push(item);
    writeCart(cart);
  }
  const openCart = e.target.closest('#openCart') || e.target.closest('#openCart2') || e.target.closest('#openCart3');
  if(openCart){ document.getElementById('cartDrawer').showModal(); }
  if(e.target.id === 'checkoutBtn'){
    const cart = readCart(); if(!cart.length){ alert('Keranjang kosong.'); return; }
    const lines = cart.map(i=>`${i.name} x${i.qty} = ${rupiah(i.qty*i.price)}`).join('\n');
    const total = rupiah(cart.reduce((s,i)=>s+i.qty*i.price,0));
    const text = `Halo Nishnush Pastry!%0A%0ASaya ingin pesan:%0A${encodeURIComponent(lines)}%0A%0ATotal: ${encodeURIComponent(total)}`;
    window.open('https://wa.me/6281234567890?text=' + text, '_blank');
  }
  if(e.target.id === 'clearCart'){ localStorage.removeItem(LS_CART); renderCart(); }
  if(e.target.classList.contains('inc')||e.target.classList.contains('dec')||e.target.textContent==='Hapus'){
    const ix = parseInt(e.target.dataset.ix);
    const cart = readCart();
    if(e.target.classList.contains('inc')) cart[ix].qty++;
    if(e.target.classList.contains('dec')) cart[ix].qty = Math.max(1, cart[ix].qty-1);
    if(e.target.textContent==='Hapus') cart.splice(ix,1);
    writeCart(cart);
  }
});

// feedback form
const fb = document.getElementById('feedbackForm');
if(fb){
  fb.addEventListener('submit', e=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(fb).entries());
    const list = JSON.parse(localStorage.getItem('nish_feedback')||'[]');
    list.push({...data, at:new Date().toISOString()});
    localStorage.setItem('nish_feedback', JSON.stringify(list));
    document.getElementById('feedbackStatus').textContent = 'Terima kasih! Masukan Anda tersimpan.';
    fb.reset();
    setTimeout(()=>document.getElementById('feedbackStatus').textContent='', 2600);
  });
}

// WA quick order
const waOrder = document.getElementById('waOrder');
if(waOrder) waOrder.addEventListener('click', ()=> window.open('https://wa.me/6281234567890?text=Halo%20Nishnush%20Pastry,%20saya%20mau%20tanya%20menu.', '_blank'));
