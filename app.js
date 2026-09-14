const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const currencies = {
  USD:["US Dollar","$"], EUR:["Euro","€"], GBP:["British Pound","£"], NGN:["Nigerian Naira","₦"],
  CAD:["Canadian Dollar","C$"], AUD:["Australian Dollar","A$"], JPY:["Japanese Yen","¥"],
  CNY:["Chinese Yuan","¥"], CHF:["Swiss Franc","CHF"], ZAR:["South African Rand","R"],
  GHS:["Ghanaian Cedi","₵"], KES:["Kenyan Shilling","KSh"], AED:["UAE Dirham","د.إ"],
  INR:["Indian Rupee","₹"], BRL:["Brazilian Real","R$"], SGD:["Singapore Dollar","S$"],
  NZD:["New Zealand Dollar","NZ$"], SEK:["Swedish Krona","kr"], NOK:["Norwegian Krone","kr"],
  DKK:["Danish Krone","kr"], SAR:["Saudi Riyal","﷼"], XOF:["West African CFA Franc","CFA"]
};

let fxRates = {};
let fxUpdated = null;

function money(n, currency="USD") {
  const opts = {maximumFractionDigits: currency==="JPY" || currency==="NGN" ? 0 : 2};
  try { return new Intl.NumberFormat(undefined,{style:"currency",currency,...opts}).format(n); }
  catch { return `${n.toLocaleString()} ${currency}`; }
}
function fmt(n, digits=2) {
  return Number(n).toLocaleString(undefined,{maximumFractionDigits:digits});
}

function fillCurrencies() {
  const list = Object.keys(currencies);
  const html = list.map(c=>`<option value="${c}">${c} — ${currencies[c][0]}</option>`).join("");
  $("#fromCurrency").innerHTML = html; $("#toCurrency").innerHTML = html;
  $("#fromCurrency").value="USD"; $("#toCurrency").value="EUR";
}

async function loadFx() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD",{cache:"no-store"});
    if(!res.ok) throw new Error("FX request failed");
    const data = await res.json();
    if(data.result !== "success") throw new Error("FX provider error");
    fxRates = data.rates || {};
    fxRates.USD = 1;
    fxUpdated = data.time_last_update_utc ? new Date(data.time_last_update_utc) : new Date();
    $("#rateMeta").textContent = `Source update: ${fxUpdated.toLocaleString()} · Reference rate`;
    updateTicker();
    renderRates();
    convert();
  } catch(e) {
    $("#rateMeta").textContent = "Could not refresh FX data. Try again shortly.";
  }
}

function rate(from,to) {
  if(from===to) return 1;
  if(!fxRates[from] || !fxRates[to]) return null;
  return fxRates[to] / fxRates[from];
}
function convert() {
  const amount = Number($("#amount").value)||0;
  const from = $("#fromCurrency").value, to=$("#toCurrency").value;
  const r=rate(from,to);
  if(r===null){$("#conversionResult").textContent="Unavailable";return;}
  const value=amount*r;
  $("#resultLabel").textContent=`${fmt(amount,4)} ${from}`;
  $("#conversionResult").textContent=`${fmt(value, to==="JPY"||to==="NGN"?0:2)} ${to}`;
  $("#rateMeta").textContent=`1 ${from} = ${fmt(r,6)} ${to}${fxUpdated?` · Updated ${fxUpdated.toLocaleDateString()}`:""}`;
}
function updateTicker() {
  $("#tickerEur").textContent = fxRates.EUR ? fmt(fxRates.EUR,4) : "—";
  $("#tickerGbp").textContent = fxRates.GBP ? fmt(fxRates.GBP,4) : "—";
  $("#tickerNgn").textContent = fxRates.NGN ? fmt(fxRates.NGN,2) : "—";
  $("#tickerUpdated").textContent = fxUpdated ? `FX updated ${fxUpdated.toLocaleDateString()}` : "Updating…";
}

function renderRates() {
  const q=($("#rateSearch")?.value||"").trim().toLowerCase();
  const sort=$("#rateSort")?.value||"code";
  const entries=Object.entries(fxRates).filter(([code,val])=>{
    const name=currencies[code]?.[0]||code;
    return `${code} ${name}`.toLowerCase().includes(q);
  }).map(([code,val])=>({code,val,name:currencies[code]?.[0]||"Currency"}));
  entries.sort((a,b)=>sort==="value"?b.val-a.val:a.code.localeCompare(b.code));
  $("#ratesBody").innerHTML=entries.map(x=>`<tr><td>${x.name}</td><td><b>${x.code}</b></td><td>${fmt(x.val,6)}</td></tr>`).join("");
}

function monthlyPayment(principal, annualRate, months){
  const r=annualRate/100/12;
  if(r===0) return principal/months;
  return principal*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1);
}
function runCalc(type){
  let out="";
  if(type==="mortgage"){
    const p=Math.max(0,Number($("#mortgagePrice").value)-Number($("#mortgageDown").value));
    const m=monthlyPayment(p,Number($("#mortgageRate").value),Number($("#mortgageYears").value)*12);
    out=`Monthly: ${money(m,"USD")} · Principal: ${money(p,"USD")}`;
  }
  if(type==="loan"){
    const p=Number($("#loanAmount").value), m=Number($("#loanMonths").value);
    out=`Monthly: ${money(monthlyPayment(p,Number($("#loanRate").value),m),"NGN")}`;
  }
  if(type==="salary"){
    const gross=Number($("#salaryGross").value);
    const deductions=gross*(Number($("#salaryTax").value)+Number($("#salaryOther").value))/100;
    out=`Take-home: ${money(gross-deductions,"NGN")} · Deductions: ${money(deductions,"NGN")}`;
  }
  if(type==="tax"){
    const income=Number($("#taxIncome").value), tax=income*Number($("#taxRate").value)/100;
    out=`Estimated tax: ${money(tax,"NGN")} · After tax: ${money(income-tax,"NGN")}`;
  }
  if(type==="fuel"){
    const distance=Number($("#fuelDistance").value), efficiency=Number($("#fuelEfficiency").value), price=Number($("#fuelPrice").value);
    const litres=distance/efficiency, cost=litres*price;
    out=`Fuel: ${fmt(litres,2)} L · Cost: ${money(cost,"NGN")}`;
  }
  $(`#${type}Out`).textContent=out;
}

const coins=[
  {id:"bitcoin",symbol:"BTC",name:"Bitcoin",fallbackId:"1"},
  {id:"ethereum",symbol:"ETH",name:"Ethereum",fallbackId:"1027"},
  {id:"tether",symbol:"USDT",name:"Tether",fallbackId:"825"}
];

async function loadCrypto(){
  try{
    // CoinMarketCap's keyless public API is used first. It is designed for
    // no-key public access. A CoinGecko keyless fallback is included for resilience.
    const ids=coins.map(c=>c.fallbackId).join(",");
    let data=null, source="CoinMarketCap";
    let res=await fetch(`https://pro-api.coinmarketcap.com/public-api/v1/simple/price?ids=${ids}&convert=USD`,{headers:{Accept:"application/json"}});
    if(res.ok){
      const j=await res.json();
      data=coins.map(c=>({symbol:c.symbol,name:c.name,price:j.data?.[c.fallbackId]?.USD||null,change:null}));
    }else throw new Error("CMC unavailable");
    renderCrypto(data,source);
  }catch(e){
    try{
      const ids=coins.map(c=>c.id).join(",");
      const res=await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,{cache:"no-store"});
      const j=await res.json();
      const data=coins.map(c=>({symbol:c.symbol,name:c.name,price:j[c.id]?.usd||null,change:j[c.id]?.usd_24h_change||null}));
      renderCrypto(data,"CoinGecko");
    }catch(err){
      $("#cryptoStatus").textContent="Crypto data is temporarily unavailable. Please refresh later.";
    }
  }
}
function renderCrypto(data,source){
  $("#cryptoGrid").innerHTML=data.map(c=>`<article class="crypto-card">
    <div class="crypto-top"><div class="coin"><span class="coin-logo">${c.symbol[0]}</span><div><b>${c.name}</b><small>${c.symbol}</small></div></div>
    <span class="${c.change==null?"":c.change>=0?"change-up":"change-down"}">${c.change==null?"Market price":`${c.change>=0?"+":""}${fmt(c.change,2)}%`}</span></div>
    <div class="crypto-price">${c.price==null?"—":money(c.price,"USD")}</div>
    <div class="crypto-meta">USD reference price · refreshed periodically</div>
  </article>`).join("");
  $("#cryptoStatus").textContent=`Crypto source: ${source} · Last browser refresh ${new Date().toLocaleTimeString()}`;
  $("#tickerBtc").textContent=data[0]?.price ? money(data[0].price,"USD") : "—";
}

function setTheme(){
  const saved=localStorage.getItem("seunfinance-theme");
  if(saved==="dark") document.body.classList.add("dark");
  $("#themeToggle").textContent=document.body.classList.contains("dark")?"☀":"☾";
}
function toggleTheme(){
  document.body.classList.toggle("dark");
  localStorage.setItem("seunfinance-theme",document.body.classList.contains("dark")?"dark":"light");
  $("#themeToggle").textContent=document.body.classList.contains("dark")?"☀":"☾";
}
function activateTab(tab){
  $$(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  $("#calculatorsPanel").classList.toggle("active-panel",tab==="calculators");
  $("#cryptoPanel").classList.toggle("active-panel",tab==="crypto");
  $("#ratesPanel").classList.toggle("active-panel",tab==="rates");
  document.querySelector(".tool-section")?.scrollIntoView({behavior:"smooth",block:"start"});
}

document.addEventListener("DOMContentLoaded",()=>{
  fillCurrencies(); setTheme(); loadFx(); loadCrypto();
  $("#year").textContent=new Date().getFullYear();
  $("#convertBtn").addEventListener("click",convert);
  ["amount","fromCurrency","toCurrency"].forEach(id=>$("#"+id).addEventListener("input",convert));
  $("#swapBtn").addEventListener("click",()=>{const a=$("#fromCurrency").value;$("#fromCurrency").value=$("#toCurrency").value;$("#toCurrency").value=a;convert();});
  $("#themeToggle").addEventListener("click",toggleTheme);
  $$(".tab,.desktop-nav button").forEach(b=>b.addEventListener("click",()=>activateTab(b.dataset.tab)));
  $$(".calc-btn").forEach(b=>b.addEventListener("click",()=>runCalc(b.dataset.calc)));
  $("#rateSearch").addEventListener("input",renderRates); $("#rateSort").addEventListener("change",renderRates);
  // Crypto refresh every 60 seconds; FX provider itself updates on its own schedule.
  setInterval(loadCrypto,60000);
  setInterval(loadFx,1800000);
});
