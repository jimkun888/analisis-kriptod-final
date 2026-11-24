/* Adaptor: meniru 5 alat CoinMarketCap memakai CoinGecko, alternative.me (Fear & Greed) dan CryptoCompare (berita). */
(function () {
  'use strict';
  if (!window.nativeGet) window.nativeGet = function (u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }); };
  var CGU = 'https://api.coingecko.com/api/v3', PC = '1h,24h,7d,30d,60d,1y', cache = {};
  var MK = CGU + '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&price_change_percentage=' + PC;
  var KNOWN = { 1: 'bitcoin', 1027: 'ethereum', 52: 'ripple', 2010: 'cardano', 1839: 'binancecoin', 6535: 'near', 5426: 'solana', 24478: 'pepe', 34466: 'pudgy-penguins', 21159: 'ondo-finance', 5805: 'avalanche-2', 1975: 'chainlink' };
  var REV = {}, FWD = {}, CNT = 1000000, SYM = {};
  Object.keys(KNOWN).forEach(function (k) { REV[k] = KNOWN[k]; FWD[KNOWN[k]] = +k; });
  function idOf(cg) { if (!FWD[cg]) { FWD[cg] = ++CNT; REV[CNT] = cg; } return FWD[cg]; }
  function cgOf(id) { return REV[String(id)]; }
  async function get(url, ttl) {
    var c = cache[url];
    if (c && Date.now() - c.t < ttl) return c.v;
    var v = await window.nativeGet(url);
    cache[url] = { t: Date.now(), v: v };
    return v;
  }
  function row(m, total) {
    var id = idOf(m.id); SYM[id] = String(m.symbol).toUpperCase();
    return {
      id: String(id), name: m.name, symbol: SYM[id], slug: m.id, price: m.current_price, rank: m.market_cap_rank,
      percent_change_1h: m.price_change_percentage_1h_in_currency,
      percent_change_24h: m.price_change_percentage_24h_in_currency || m.price_change_percentage_24h || 0,
      percent_change_7d: m.price_change_percentage_7d_in_currency || 0,
      percent_change_30d: m.price_change_percentage_30d_in_currency || 0,
      percent_change_60d: m.price_change_percentage_60d_in_currency, percent_change_90d: null,
      percent_change_1y: m.price_change_percentage_1y_in_currency,
      market_cap: m.market_cap || 0, volume_24h: m.total_volume || 0,
      market_cap_dominance: total && m.market_cap ? m.market_cap / total * 100 : 0, last_updated_time: m.last_updated
    };
  }
  async function quotes(a) {
    var ids = String(a.id).split(','), total = (await get(CGU + '/global', 120000)).data.total_market_cap.usd;
    var mk = await get(MK, 25000), out = {}, res = {}, need = [];
    mk.forEach(function (m) { var r = row(m, total); out[r.id] = r; });
    if (ids.indexOf('1') >= 0) Object.keys(out).forEach(function (k) { if (out[k].rank && out[k].rank <= 100) res[k] = out[k]; });
    ids.forEach(function (id) { if (out[id]) res[id] = out[id]; else if (cgOf(id)) need.push(cgOf(id)); });
    if (need.length) {
      var ex = await get(CGU + '/coins/markets?vs_currency=usd&ids=' + need.join(',') + '&price_change_percentage=' + PC, 25000);
      ex.forEach(function (m) { var r = row(m, total); res[r.id] = r; });
    }
    return Object.keys(res).map(function (k) { return res[k]; });
  }
  async function glob() {
    var g = (await get(CGU + '/global', 120000)).data, f = null;
    try { f = (await get('https://api.alternative.me/fng/', 300000)).data[0]; } catch (e) {}
    return {
      market_size: { total_crypto_market_cap_usd: { current: (g.total_market_cap.usd / 1e12).toFixed(2) + ' T' } },
      sentiment: { fear_greed: { current: { value: f ? f.value_classification : 'n/a', index: f ? +f.value : 50 } } },
      dominance: { btc: { current: '+' + g.market_cap_percentage.btc.toFixed(2) + '%' }, eth: { current: '+' + g.market_cap_percentage.eth.toFixed(2) + '%' } }
    };
  }
  function ema(a, n) { var k = 2 / (n + 1), o = [a[0]]; for (var i = 1; i < a.length; i++) o.push(a[i] * k + o[i - 1] * (1 - k)); return o; }
  function rsi(p, n) { var g = 0, l = 0; for (var i = p.length - n; i < p.length; i++) { var d = p[i] - p[i - 1]; if (d > 0) g += d; else l -= d; } return l === 0 ? 100 : 100 - 100 / (1 + g / l); }
  function f(v) { return Math.abs(v) < 1 ? v.toFixed(10) : String(+v.toPrecision(8)); }
  async function ta(a) {
    var cg = cgOf(a.id);
    if (!cg) throw { code: 'unknown_id' };
    var h = await get(CGU + '/coins/' + cg + '/market_chart?vs_currency=usd&days=365&interval=daily', 600000);
    var p = h.prices.map(function (x) { return x[1]; }), L = p.length - 1;
    var sma = function (n) { var s = p.slice(-n); return s.reduce(function (x, y) { return x + y; }, 0) / s.length; };
    var e12 = ema(p, 12), e26 = ema(p, 26), m = e12.map(function (v, i) { return v - e26[i]; }), sg = ema(m, 9);
    var w90 = p.slice(-90), hi = Math.max.apply(null, w90), lo = Math.min.apply(null, w90), w7 = p.slice(-7);
    var pv = (Math.max.apply(null, w7) + Math.min.apply(null, w7) + p[L]) / 3;
    return {
      moving_averages: { simple_moving_average_7_day: f(sma(7)), simple_moving_average_30_day: f(sma(30)), simple_moving_average_200_day: f(sma(Math.min(200, p.length))) },
      macd: { macdLine: f(m[L]), signalLine: f(sg[L]), histogram: f(m[L] - sg[L]) },
      rsi: { rsi7: f(rsi(p, 7)), rsi14: f(rsi(p, 14)), rsi21: f(rsi(p, 21)) },
      fibonacciLevels: { swingHigh: f(hi), swingLow: f(lo), retracementLevels: { '38.2%': f(hi - .382 * (hi - lo)), '61.8%': f(hi - .618 * (hi - lo)) } },
      pivotPoint: f(pv)
    };
  }
  async function news(a) {
    var mk = await get(MK, 25000); mk.forEach(function (m) { row(m, 0); });
    var sy = SYM[String(a.id)] || '', n = a.limit || 6, base = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';
    var d = await get(base + (sy ? '&categories=' + sy : ''), 300000), items = (d.Data || []).slice(0, n);
    if (!items.length) { d = await get(base, 300000); items = (d.Data || []).slice(0, n); }
    return { symbol: sy, news: { headers: ['title', 'description', 'content', 'url', 'publishedAt', 'quality'], rows: items.map(function (x) { return [x.title, (x.body || '').slice(0, 400), '', x.url, new Date(x.published_on * 1000).toLocaleString('id-ID'), '']; }) } };
  }
  async function search(a) {
    var d = await get(CGU + '/search?query=' + encodeURIComponent(a.query), 60000);
    return (d.coins || []).slice(0, 5).map(function (c) { return { id: idOf(c.id), name: c.name, symbol: String(c.symbol).toUpperCase(), slug: c.id, rank: c.market_cap_rank }; });
  }
  var TOOLS = { get_crypto_quotes_latest: quotes, get_global_metrics_latest: glob, get_crypto_technical_analysis: ta, get_crypto_latest_news: news, search_cryptos: search };
  window.claude = {
    use: async function (n) {
      if (n === 'mcp') return { callTool: async function (s, t, a) { if (!TOOLS[t]) throw { code: 'unsupported' }; return { payload: await TOOLS[t](a || {}) }; } };
      if (n === 'permissions') return { state: async function () { return 'granted'; } };
      return null;
    }
  };
})();
