// --- Camadas Base (Tile Layers) ---
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var cartoPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 20,
  attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
});

var googleSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  attribution: '&copy; Google Maps'
});

// --- Função Genérica de Colorização por Nome ---
function getCorPorNome(nome, paletaCores) {
  if (!nome) return "#3b6e8c";
  var hash = 0;
  for (var i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  var index = Math.abs(hash) % paletaCores.length;
  return paletaCores[index];
}

// --- Paletas Cartográficas Profissionais e Harmônicas ---

// 1. Bacias Hidrográficas
var coresBacias = [
  "#2B6CB0", "#2C7A7B", "#3B6E8C", "#4A5568",
  "#2F855A", "#5A67D8", "#6B7280", "#3182CE",
  "#285E61", "#4C51BF", "#5F7470", "#2C5282"
];

// 2. Mesorregiões
var coresMesorregioes = [
  "#3B6E8C",
  "#4E7969",
  "#8C6D46",
  "#6B5B95"
];

// 3. Microrregiões
var coresMicrorregioes = [
  "#90CDF4", "#9AE6B4", "#FBD38D", "#A3BFFA", "#B794F4",
  "#81E6D9", "#CBD5E0", "#F6AD55", "#68D391", "#63B3ED",
  "#D6BCFA", "#A0AEC0", "#89C4E1", "#98C9A3", "#D9B382",
  "#B5A8D5", "#7FB3D5", "#82E0AA", "#F0B27A", "#AEB6BF",
  "#5DADE2", "#73C6B6", "#E59866", "#85929E"
];

// --- Estilos e Popups das Camadas GeoJSON ---

// 1. Açudes
var acudesStyle = {
  color: "#0C4A6E",
  fillColor: "#0EA5E9",
  weight: 1.5,
  opacity: 0.9,
  fillOpacity: 0.72
};

function onEachFeatureAcude(feature, layer) {
  if (feature.properties) {
    const p = feature.properties;
    var popUp = `
      <div class="popup-title"><i class="fa-solid fa-water me-1"></i> ${p.Nome || 'Açude'}</div>
      <table class="table table-sm table-borderless popup-table">
        <tr><td><strong>Executor:</strong></td><td>${p.Executor || '-'}</td></tr>
        <tr><td><strong>Finalidade:</strong></td><td>${p.Finalidade || '-'}</td></tr>
        <tr><td><strong>Município:</strong></td><td>${p.Municipio || '-'}</td></tr>
        ${p.Capacidade_m3 ? `<tr><td><strong>Capacidade:</strong></td><td>${Number(p.Capacidade_m3).toLocaleString('pt-BR')} m³</td></tr>` : ''}
      </table>
    `;
    layer.bindPopup(popUp);
  }
}

// 2. Bacias Hidrográficas
function baciasStyle(feature) {
  var nomeBacia = feature.properties ? feature.properties.Nome : '';
  return {
    color: "#1E3A5F",
    fillColor: getCorPorNome(nomeBacia, coresBacias),
    weight: 1.8,
    opacity: 0.85,
    fillOpacity: 0.34
  };
}

function onEachFeatureBacia(feature, layer) {
  if (feature.properties) {
    const p = feature.properties;
    var popUp = `
      <div class="popup-title"><i class="fa-solid fa-draw-polygon me-1"></i> Bacia: ${p.Nome || '-'}</div>
      <table class="table table-sm table-borderless popup-table">
        <tr><td><strong>Perímetro:</strong></td><td>${p.Perimetro ? Number(p.Perimetro).toLocaleString('pt-BR') + ' km' : '-'}</td></tr>
        <tr><td><strong>Área:</strong></td><td>${p.Area_Km2 ? Number(p.Area_Km2).toLocaleString('pt-BR') + ' km²' : '-'}</td></tr>
      </table>
    `;
    layer.bindPopup(popUp);
  }
}

// 3. Rios
var riosStyle = {
  color: "#0284C7",
  weight: 2.4,
  opacity: 0.88
};

function onEachFeatureRio(feature, layer) {
  if (feature.properties) {
    const p = feature.properties;
    var popUp = `
      <div class="popup-title"><i class="fa-solid fa-water-ladders me-1"></i> Rio: ${p.Nome || '-'}</div>
      <table class="table table-sm table-borderless popup-table">
        <tr><td><strong>Ordem:</strong></td><td>${p.Ordem || '-'}</td></tr>
      </table>
    `;
    layer.bindPopup(popUp);
  }
}

// 4. Poços Tubulares
function onEachFeaturePocos(feature, layer) {
  if (feature.properties) {
    const p = feature.properties;
    const popupContent = `
      <div class="popup-title"><i class="fa-solid fa-bore-hole me-1"></i> Poço #${p.fid || ''}</div>
      <table class="table table-sm table-borderless popup-table">
        <tr><td><strong>Município:</strong></td><td>${p.municipio || '-'}</td></tr>
        <tr><td><strong>Proprietário:</strong></td><td>${p.proprietario || '-'}</td></tr>
        <tr><td><strong>Órgão:</strong></td><td>${p.orgao || '-'}</td></tr>
        <tr><td><strong>Data Perfuração:</strong></td><td>${p.data_perfuracao || '-'}</td></tr>
        <tr><td><strong>Profundidade:</strong></td><td>${p.profundidade ? p.profundidade + ' m' : '-'}</td></tr>
        <tr><td><strong>Vazão:</strong></td><td>${p.q_m3h ? p.q_m3h + ' m³/h' : '-'}</td></tr>
        <tr><td><strong>Região:</strong></td><td>${p.microregiao || ''} (${p.mesoregiao || ''})</td></tr>
      </table>
    `;
    layer.bindPopup(popupContent);
  }
}

// 5. Limites Municipais
var limitesStyle = {
  color: "#475569",
  weight: 1.15,
  dashArray: "3, 3",
  fillColor: "#94A3B8",
  fillOpacity: 0.06
};

function onEachFeatureLimite(feature, layer) {
  if (feature.properties) {
    const p = feature.properties;
    var popUp = `
      <div class="popup-title"><i class="fa-solid fa-city me-1"></i> ${p.Nome || 'Município'}</div>
      <table class="table table-sm table-borderless popup-table">
        <tr><td><strong>Mesorregião:</strong></td><td>${p.Mesorreg || '-'}</td></tr>
        <tr><td><strong>Microrregião:</strong></td><td>${p.Microrreg || '-'}</td></tr>
        <tr><td><strong>Área:</strong></td><td>${p.Area_Km2 ? Number(p.Area_Km2).toLocaleString('pt-BR') + ' km²' : '-'}</td></tr>
        <tr><td><strong>População (estim.):</strong></td><td>${p.Pop_estim ? Number(p.Pop_estim).toLocaleString('pt-BR') : '-'}</td></tr>
        <tr><td><strong>Dens. Demográfica:</strong></td><td>${p.Dens_demog ? Number(p.Dens_demog).toLocaleString('pt-BR') + ' hab/km²' : '-'}</td></tr>
        <tr><td><strong>Geocódigo:</strong></td><td>${p.Geocod_Mun || '-'}</td></tr>
      </table>
    `;
    layer.bindPopup(popUp);
  }
}

// 6. Mesorregiões
function mesorregioesStyle(feature) {
  var nomeMeso = feature.properties ? feature.properties.NM_MESO : '';
  var corFundo = getCorPorNome(nomeMeso, coresMesorregioes);
  return {
    color: "#334155",
    fillColor: corFundo,
    weight: 1.8,
    opacity: 0.88,
    fillOpacity: 0.36
  };
}

function onEachFeatureMesorregiao(feature, layer) {
  if (feature.properties) {
    const p = feature.properties;
    var popUp = `
      <div class="popup-title"><i class="fa-solid fa-layer-group me-1"></i> Mesorregião: ${p.NM_MESO || '-'}</div>
      <table class="table table-sm table-borderless popup-table">
        <tr><td><strong>Código IBGE:</strong></td><td>${p.CD_GEOCME || '-'}</td></tr>
      </table>
    `;
    layer.bindPopup(popUp);
  }
}

// 7. Microrregiões
function microrregioesStyle(feature) {
  var nomeMicro = feature.properties ? feature.properties.NM_MICRO : '';
  var corFundo = getCorPorNome(nomeMicro, coresMicrorregioes);
  return {
    color: "#475569",
    fillColor: corFundo,
    weight: 1.35,
    dashArray: "4, 3",
    opacity: 0.82,
    fillOpacity: 0.35
  };
}

function onEachFeatureMicrorregiao(feature, layer) {
  if (feature.properties) {
    const p = feature.properties;
    var popUp = `
      <div class="popup-title"><i class="fa-solid fa-border-all me-1"></i> Microrregião: ${p.NM_MICRO || '-'}</div>
      <table class="table table-sm table-borderless popup-table">
        <tr><td><strong>Código IBGE:</strong></td><td>${p.CD_GEOCMI || '-'}</td></tr>
      </table>
    `;
    layer.bindPopup(popUp);
  }
}

// 8. Adutoras
function adutorasStyle(feature) {
  var situacao = feature.properties ? feature.properties['SITUAÇÃO'] : '';
  var cor = "#C53030";
  if (situacao && situacao.toLowerCase().includes("obras")) cor = "#B7791F";
  if (situacao && situacao.toLowerCase().includes("planejado")) cor = "#553C9A";

  return {
    color: cor,
    weight: 3.2,
    opacity: 0.9
  };
}

function onEachFeatureAdutora(feature, layer) {
  if (feature.properties) {
    const p = feature.properties;
    var popUp = `
      <div class="popup-title"><i class="fa-solid fa-pipe-valve me-1"></i> ${p.ADUTORA || 'Adutora'}</div>
      <table class="table table-sm table-borderless popup-table">
        <tr><td><strong>Situação:</strong></td><td>${p['SITUAÇÃO'] || '-'}</td></tr>
        <tr><td><strong>Estado:</strong></td><td>${p.ESTADO || '-'}</td></tr>
      </table>
    `;
    layer.bindPopup(popUp);
  }
}

// --- Função Segura de Instanciação GeoJSON ---
function safeGeoJSON(data, options) {
  if (typeof data === 'undefined' || !data) return null;
  try {
    return L.geoJSON(data, options);
  } catch (err) {
    console.warn('Falha ao carregar camada GeoJSON:', err);
    return null;
  }
}

// --- Instanciação dos Layers GeoJSON ---
var layerAcudes = safeGeoJSON(typeof acudes !== 'undefined' ? acudes : null, { style: acudesStyle, onEachFeature: onEachFeatureAcude });
var layerBacias = safeGeoJSON(typeof bacias_hidro !== 'undefined' ? bacias_hidro : null, { style: baciasStyle, onEachFeature: onEachFeatureBacia });
var layerRios = safeGeoJSON(typeof rios_drenagem_principal !== 'undefined' ? rios_drenagem_principal : null, { style: riosStyle, onEachFeature: onEachFeatureRio });
var layerLimitesMunicipais = safeGeoJSON(typeof limites_municipais !== 'undefined' ? limites_municipais : null, { style: limitesStyle, onEachFeature: onEachFeatureLimite });
var layerMesorregioes = safeGeoJSON(typeof mesorregioes !== 'undefined' ? mesorregioes : null, { style: mesorregioesStyle, onEachFeature: onEachFeatureMesorregiao });
var layerMicrorregioes = safeGeoJSON(typeof microrregioes !== 'undefined' ? microrregioes : null, { style: microrregioesStyle, onEachFeature: onEachFeatureMicrorregiao });
var layerAdutoras = safeGeoJSON(typeof adutoras !== 'undefined' ? adutoras : null, { style: adutorasStyle, onEachFeature: onEachFeatureAdutora });

var layerPocosVector = safeGeoJSON(typeof pocos !== 'undefined' ? pocos : null, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 5,
      fillColor: "#D69E2E",
      color: "#744210",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.85
    });
  },
  onEachFeature: onEachFeaturePocos
});

var pocosCluster = (typeof L.markerClusterGroup === 'function')
  ? L.markerClusterGroup({ disableClusteringAtZoom: 14, spiderfyOnMaxZoom: true })
  : L.layerGroup();

if (layerPocosVector && typeof pocosCluster.addLayer === 'function') {
  pocosCluster.addLayer(layerPocosVector);
}

// --- Inicialização do Mapa ---
var map = L.map('map', {
  center: [-7.117, -36.72],
  zoom: 8,
  layers: [osm, layerMesorregioes, layerLimitesMunicipais, layerBacias, layerRios, layerAcudes, layerAdutoras].filter(Boolean)
});

var baseMaps = {
  "OpenStreetMap": osm,
  "Mapa Claro (Carto)": cartoPositron,
  "Google Satélite": googleSat
};

var overlayMaps = {};
if (layerMesorregioes) overlayMaps["Mesorregiões"] = layerMesorregioes;
if (layerMicrorregioes) overlayMaps["Microrregiões"] = layerMicrorregioes;
if (layerLimitesMunicipais) overlayMaps["Limites Municipais"] = layerLimitesMunicipais;
if (layerBacias) overlayMaps["Bacias Hidrográficas"] = layerBacias;
if (layerRios) overlayMaps["Rios Principais"] = layerRios;
if (layerAcudes) overlayMaps["Açudes"] = layerAcudes;
if (layerAdutoras) overlayMaps["Adutoras"] = layerAdutoras;
if (pocosCluster) overlayMaps["Poços Tubulares"] = pocosCluster;

L.control.layers(baseMaps, overlayMaps, { collapsed: true }).addTo(map);

function resetMapExtent() {
  try {
    if (layerBacias && layerBacias.getBounds().isValid()) {
      map.fitBounds(layerBacias.getBounds(), { padding: [20, 20] });
    } else if (layerLimitesMunicipais && layerLimitesMunicipais.getBounds().isValid()) {
      map.fitBounds(layerLimitesMunicipais.getBounds(), { padding: [20, 20] });
    } else {
      map.setView([-7.117, -36.72], 8);
    }
  } catch (e) {
    map.setView([-7.117, -36.72], 8);
  }
}

resetMapExtent();

window.addEventListener('load', function() {
  setTimeout(function() {
    map.invalidateSize();
  }, 150);
});