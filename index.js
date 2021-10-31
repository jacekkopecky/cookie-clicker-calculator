import { n2s, s2n } from './n2s2n.js';

window.addEventListener('load', init);

const STEP = 1.15;

function init() {
  document.querySelector('input.price').focus();

  for (const el of document.querySelectorAll('input')) {
    el.addEventListener('input', recompute);
  }

  for (const el of document.querySelectorAll('input.price')) {
    el.addEventListener('keydown', upAndDown);
  }

  load();
}

// data is an array, indexed by sectionRowIndex, of objects like this: { price, prod, i }
let data = [];

function recompute(e) {
  if (e.target.matches('#values input')) {
    updateDataFromElement(e.target);
    showTargets();
  } else if (e.target.matches('#buffers input')) {
    updateBuffers(e.target);
  }
}

function upAndDown(e) {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    const el = e.target;
    const val = s2n(el.value);
    if (!Number.isNaN(val)) {
      el.value = n2s(e.key === 'ArrowUp' ? val * STEP : val / STEP);
      e.preventDefault();
      recompute(e);
    }
  }
}

// update data from the value of input el
function updateDataFromElement(el) {
  const tr = findParent(el, 'tr');
  const i = tr.sectionRowIndex;

  if (!data[i]) {
    data[i] = {
      i,
      price: 0,
      prod: 0,
    };
    fillEls(data[i], tr);
  }

  const row = data[i];

  // treat as 0 if the value isn't a (suffixed) number
  const val = s2n(el.value.trim()) || 0;

  if (el.classList.contains('price')) {
    row.price = val;
  } else if (el.classList.contains('prod')) {
    row.prod = val;
    row.frenzyEl.value = n2s(val * 7);
  } else if (el.classList.contains('frenzy')) {
    row.prod = val / 7;
    row.prodEl.value = n2s(val / 7);
  }

  save();
}

function fillEls(row, tr) {
  row.priceEl = tr.querySelector('input.price');
  row.prodEl = tr.querySelector('input.prod');
  row.frenzyEl = tr.querySelector('input.frenzy');
  row.buyEl = tr.querySelector('.buy');
  row.upToEl = tr.querySelector('.upTo');
}

function showTargets() {
  const rowsToShow = [];
  for (const row of data) {
    if (row) {
      if (row.price && row.prod) {
        rowsToShow.push(row);
      } else {
        row.buyEl.textContent = '';
        row.upToEl.textContent = '';
      }
    }
  }

  if (rowsToShow.length === 0) return;

  const lastThree = rowsToShow.slice(-3);
  let maxPricePerProd = 0;

  // find maximum prod per price of the last three rows
  for (const row of lastThree) {
    const pricePerProd = row.price / row.prod;
    if (pricePerProd > maxPricePerProd) maxPricePerProd = pricePerProd;
  }

  // go through all rows and show buyThisMany and upToThePrice
  for (const row of rowsToShow) {
    const buy = computeBuyTarget(row, maxPricePerProd);
    row.buyEl.textContent = buy || '–';
    row.upToEl.textContent = buy > 0 ? n2s(row.price * STEP ** buy) : '–';
  }
}

function computeBuyTarget(row, targetPricePerProd) {
  const pricePerProd = row.price / row.prod;
  return Math.round(Math.log(targetPricePerProd / pricePerProd) / Math.log(STEP));
}

// throws an exception if element not found
function findParent(element, selector) {
  let el = element;
  while (el) {
    if (el.matches(selector)) {
      return el;
    } else {
      el = el.parentElement;
    }
  }

  console.error(`could not find selector ${selector} starting from`, element);
  throw new Error();
}


function save() {
  localStorage.setItem('ccDataSave', JSON.stringify(data));
}

function load() {
  const loaded = JSON.parse(localStorage.getItem('ccDataSave'));
  if (Array.isArray(loaded)) data = loaded;

  const tableBody = document.querySelector('#values > tbody');

  for (const row of data) {
    if (!row) continue;

    const tr = tableBody.rows[row.i];
    fillEls(row, tr);

    // put the data in the page
    row.priceEl.value = n2s(row.price);
    row.prodEl.value = n2s(row.prod);
    row.frenzyEl.value = n2s(row.prod * 7);
  }

  showTargets();
}

function updateBuffers(el) {
  const tr = findParent(el, 'tr');

  // treat as 0 if the value isn't a (suffixed) number
  let val = s2n(el.value.trim()) || 0;

  if (el.classList.contains('prod')) {
    tr.querySelector('input.frenzy').value = n2s(val * 7);
  } else if (el.classList.contains('frenzy')) {
    val = val / 7;
    tr.querySelector('input.prod').value = n2s(val);
  }

  tr.querySelector('.normalBuf').textContent = n2s(val * 6000);
  tr.querySelector('.frenzyBuf').textContent = n2s(val * 7 * 6000);
}
