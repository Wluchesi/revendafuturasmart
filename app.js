/**
 * Futura Smart NFC - Lógica Interativa de Alta Conversão & PNL
 * Tabela Oficial: 10 un. a R$ 39,90/un. | 20 a 50 un. a R$ 34,90/un.
 * Faturamento base: R$ 79,00/un.
 */

document.addEventListener('DOMContentLoaded', () => {
  initPnlRoiSimulator();
  initOrderBuilder();
  initFaqAccordion();
});

/* ==========================================================================
   1. SIMULADOR DE ROI E FATURAMENTO (PNL - ANCORAGEM & VISUALIZAÇÃO)
   ========================================================================== */
function initPnlRoiSimulator() {
  const qtySlider = document.getElementById('sim-pnl-qty');
  const qtyDisplay = document.getElementById('sim-qty-display');
  const priceSlider = document.getElementById('sim-pnl-price');
  const priceDisplay = document.getElementById('sim-price-display');

  const investDisplay = document.getElementById('sim-invest-val');
  const revenueDisplay = document.getElementById('sim-revenue-val');
  const profitDisplay = document.getElementById('sim-profit-val');
  const roiMultiplier = document.getElementById('sim-roi-val');

  if (!qtySlider || !priceSlider) return;

  function calculateTierUnitPrice(qty) {
    // Tabela oficial do Parceiro:
    // 10 un: R$ 39,90/un
    // 20 a 50 un: R$ 34,90/un
    if (qty >= 20) {
      return 34.90;
    }
    return 39.90;
  }

  function updateRoi() {
    const qty = parseInt(qtySlider.value, 10);
    const resalePrice = parseFloat(priceSlider.value);

    qtyDisplay.textContent = `${qty} unidades`;
    priceDisplay.textContent = `R$ ${resalePrice.toFixed(0)}`;

    const unitWholesale = calculateTierUnitPrice(qty);
    const totalInvestment = qty * unitWholesale;
    const totalRevenue = qty * resalePrice;
    const netProfit = totalRevenue - totalInvestment;
    const multiplier = (totalRevenue / (totalInvestment || 1)).toFixed(1);

    investDisplay.textContent = `R$ ${totalInvestment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    revenueDisplay.textContent = `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    profitDisplay.textContent = `+ R$ ${netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    if (roiMultiplier) {
      roiMultiplier.textContent = `${multiplier}x de Retorno`;
    }
  }

  qtySlider.addEventListener('input', updateRoi);
  priceSlider.addEventListener('input', updateRoi);

  // Permitir clicar nas linhas da tabela para atualizar o slider automaticamente
  const tableRows = document.querySelectorAll('.monthly-projection-table tbody tr');
  tableRows.forEach(row => {
    row.addEventListener('click', () => {
      const targetQty = parseInt(row.getAttribute('data-qty'), 10);
      if (targetQty) {
        qtySlider.value = targetQty;
        updateRoi();
        qtySlider.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  updateRoi();
}

/* ==========================================================================
   2. MONTADOR DE PEDIDOS INTELIGENTE PARA WHATSAPP
   ========================================================================== */
function initOrderBuilder() {
  const blackQtyInput = document.getElementById('qty-black');
  const whiteQtyInput = document.getElementById('qty-white');
  const blackMinus = document.getElementById('black-minus');
  const blackPlus = document.getElementById('black-plus');
  const whiteMinus = document.getElementById('white-minus');
  const whitePlus = document.getElementById('white-plus');

  const totalQtyDisplay = document.getElementById('order-summary-qty');
  const tierNameDisplay = document.getElementById('order-summary-tier');
  const totalPriceDisplay = document.getElementById('order-summary-price');
  const profitEstDisplay = document.getElementById('order-summary-profit');

  const sendBtn = document.getElementById('btn-send-order');
  const nameField = document.getElementById('order-cust-name');
  const cityField = document.getElementById('order-cust-city');
  const cepField = document.getElementById('order-cust-cep');

  if (!blackQtyInput || !whiteQtyInput) return;

  function getTierData(totalPieces) {
    if (totalPieces >= 20) {
      return { unitPrice: 34.90, label: 'Lote 20 a 50 un. (R$ 34,90/un - Melhor Margem)' };
    } else {
      return { unitPrice: 39.90, label: 'Lote 10 un. (R$ 39,90/un)' };
    }
  }

  function refreshOrder() {
    let black = parseInt(blackQtyInput.value, 10) || 0;
    let white = parseInt(whiteQtyInput.value, 10) || 0;

    if (black < 0) black = 0;
    if (white < 0) white = 0;

    const total = black + white;
    const tier = getTierData(total);

    const subtotal = total * tier.unitPrice;
    // Estimativa de revenda oficial a R$ 79,00 a unidade
    const estResaleRevenue = total * 79.00;
    const estProfit = Math.max(0, estResaleRevenue - subtotal);

    totalQtyDisplay.textContent = `${total} un.`;
    tierNameDisplay.textContent = tier.label;
    totalPriceDisplay.textContent = `R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    profitEstDisplay.textContent = `+ R$ ${estProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  blackMinus.addEventListener('click', () => {
    let val = Math.max(0, (parseInt(blackQtyInput.value, 10) || 0) - 5);
    blackQtyInput.value = val;
    refreshOrder();
  });
  blackPlus.addEventListener('click', () => {
    let val = (parseInt(blackQtyInput.value, 10) || 0) + 5;
    blackQtyInput.value = val;
    refreshOrder();
  });

  whiteMinus.addEventListener('click', () => {
    let val = Math.max(0, (parseInt(whiteQtyInput.value, 10) || 0) - 5);
    whiteQtyInput.value = val;
    refreshOrder();
  });
  whitePlus.addEventListener('click', () => {
    let val = (parseInt(whiteQtyInput.value, 10) || 0) + 5;
    whiteQtyInput.value = val;
    refreshOrder();
  });

  blackQtyInput.addEventListener('input', refreshOrder);
  whiteQtyInput.addEventListener('input', refreshOrder);

  // Envio Direto para WhatsApp com Copywriting Magnético
  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const black = parseInt(blackQtyInput.value, 10) || 0;
      const white = parseInt(whiteQtyInput.value, 10) || 0;
      const total = black + white;

      if (total === 0) {
        alert('Por favor, adicione ao menos um modelo de plaquinha ao seu pedido!');
        return;
      }

      const tier = getTierData(total);
      const subtotal = (total * tier.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      const name = nameField.value.trim() || 'Futuro Parceiro';
      const city = cityField.value.trim() || 'Minha Região';
      const cep = cepField.value.trim() || 'A informar';

      const message = 
`🚀 *RESERVA DE LOTE EXCLUSIVO - FUTURA SMART NFC*
---------------------------------------------
👤 *Nome do Parceiro:* ${name}
📍 *Região / Cidade:* ${city}
📮 *CEP para Cotação de Frete:* ${cep}

📦 *COMPOSIÇÃO DO LOTE:*
▪️ ${black}x Edição Black Stealth
▪️ ${white}x Edição White Minimal

📊 *Volume do Pedido:* ${total} unidades
🏷️ *Tabela Aplicada:* ${tier.label}
💎 *Investimento do Parceiro:* R$ ${subtotal}
---------------------------------------------
Olá! Montei meu pedido pelo site e gostaria de garantir esse lote para começar a atuar na minha região. Por favor, confirmem a cotação do frete e os dados para pagamento!`;

      const encoded = encodeURIComponent(message);
      const url = `https://wa.me/5511999999999?text=${encoded}`;
      window.open(url, '_blank');
    });
  }

  refreshOrder();
}

/* ==========================================================================
   3. ACORDEÃO DE DÚVIDAS (FAQ)
   ========================================================================== */
function initFaqAccordion() {
  const faqCards = document.querySelectorAll('.faq-card');
  faqCards.forEach(card => {
    const header = card.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      faqCards.forEach(c => c.classList.remove('open'));
      if (!isOpen) {
        card.classList.add('open');
      }
    });
  });
}
