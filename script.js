const map = L.map("map", {
    center: [18, 8],
    zoom: 2,
    minZoom: 2,
    maxZoom: 8,
    zoomSnap: 1,
    zoomDelta: 1,
    zoomControl: true,
    attributionControl: false,
    scrollWheelZoom: false,
    touchZoom: true,
    tap: true,
    worldCopyJump: false,
    maxBoundsViscosity: 1
  });
  
  const worldBounds = [
    [-72, -180],
    [82, 180]
  ];
  
  const initialMapBounds = [
    [-58, -176],
    [76, 176]
  ];
  
  function resetMapView() {
    map.invalidateSize();
    map.fitBounds(initialMapBounds, {
      padding: [28, 28],
      maxZoom: 2,
      animate: true
    });
  }
  
  resetMapView();
  map.setMaxBounds(worldBounds);
  
  const ResetHomeControl = L.Control.extend({
    options: {
      position: "topleft"
    },
  
    onAdd: function () {
      const button = L.DomUtil.create("button", "leaflet-control-home");
      button.type = "button";
      button.title = "Reset map view";
      button.setAttribute("aria-label", "Reset map view");
      button.innerHTML = "⌂";
  
      L.DomEvent.disableClickPropagation(button);
      L.DomEvent.on(button, "click", function (event) {
        L.DomEvent.preventDefault(event);
        resetMapView();
        clearActiveSelection();
      });
  
      return button;
    }
  });
  
  map.addControl(new ResetHomeControl());
  
  const plugInfoElement = document.getElementById("plug-info");
  const countryInfoElement = document.getElementById("country-info");
  const countryTitleElement = document.getElementById("country-title");
  const infoPanel = document.querySelector(".info-panel");
  const allPlugTypesListElement = document.getElementById("all-plug-types-list");
  const mapWrapper = document.getElementById("map-wrapper");
  
  let countryLayer;
  let hoveredLayer = null;
  let clickedLayer = null;
  let resetPanelTimeout = null;
  let clickedSelectionTimeout = null;
  let isMouseOnInfoPanel = false;
  
  const PANEL_RESET_DELAY = 1600;
  const CLICK_SELECTION_DURATION = 3000;

  
  let diagonalEffectLayer = null;
  
  function setMapActive(isActive) {
    if (!mapWrapper) return;

    if (isActive) {
      map.scrollWheelZoom.enable();
    } else {
      map.scrollWheelZoom.disable();
    }
  }

  if (mapWrapper) {
    mapWrapper.addEventListener("mouseenter", function () {
      setMapActive(true);
    });

    mapWrapper.addEventListener("mouseleave", function () {
      setMapActive(false);
    });
  }

  document.addEventListener("keydown", function (event) {
    const activeElement = document.activeElement;
    const isTyping = activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName);

    if (!isTyping && event.key && event.key.toLowerCase() === "h") {
      resetMapView();
    }
  });

  const PLUG_COLORS = {
    A: "#ef4444",
    B: "#f97316",
    C: "#2563eb",
    D: "#a16207",
    E: "#06b6d4",
    F: "#16a34a",
    G: "#7c3aed",
    H: "#ec4899",
    I: "#0f766e",
    J: "#64748b",
    K: "#84cc16",
    L: "#f59e0b",
    M: "#9333ea",
    N: "#14b8a6",
    O: "#be123c"
  };
  
  const PLUG_PHOTO_URLS = {
    A: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-A.png",
    B: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-B.png",
    C: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-C.png",
    D: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-D.png",
    E: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-E.png",
    F: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-F.png",
    G: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-G.png",
    H: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-H.png",
    I: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-I.png",
    J: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-J.png",
    K: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-K.png",
    L: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-L.png",
    M: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-M.png",
    N: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-N.png",
    O: "https://www.power-plugs-sockets.com/wp-content/themes/power-plugs-sockets/img/Plug-O.png"
  };
  
  const PLUG_DETAILS = {
    A: {
      name: "Type A",
      pins: "Two flat parallel pins",
      grounded: "No",
      introduced: "Early 20th century",
      used: "United States, Canada, Mexico, Japan, and parts of Central America",
      why: "It became common because it was simple, compact, and suited to early domestic electrical systems in North America and Japan."
    },
    B: {
      name: "Type B",
      pins: "Two flat parallel pins plus a round grounding pin",
      grounded: "Yes",
      introduced: "Mid 20th century",
      used: "United States, Canada, Mexico, Japan, and parts of Central America",
      why: "It added grounding to the older Type A design, improving safety while keeping a familiar shape."
    },
    C: {
      name: "Type C",
      pins: "Two round pins",
      grounded: "No",
      introduced: "Early to mid 20th century",
      used: "Europe, South America, Asia, and parts of Africa",
      why: "It spread widely because it is small, cheap, and compatible with many European-style sockets."
    },
    D: {
      name: "Type D",
      pins: "Three large round pins in a triangular pattern",
      grounded: "Yes",
      introduced: "Early 20th century",
      used: "India, Sri Lanka, Nepal, Namibia, and some African countries",
      why: "It remained common in countries influenced by older British electrical standards."
    },
    E: {
      name: "Type E",
      pins: "Two round pins with socket grounding pin",
      grounded: "Yes",
      introduced: "Mid 20th century",
      used: "France, Belgium, Poland, Czechia, Slovakia, and parts of Africa",
      why: "It provided grounding while keeping the common European round-pin format."
    },
    F: {
      name: "Type F",
      pins: "Two round pins with side grounding clips",
      grounded: "Yes",
      introduced: "1920s",
      used: "Germany, Netherlands, Spain, Austria, Scandinavia, and much of continental Europe",
      why: "The Schuko design became popular because it offered strong grounding and safe household use."
    },
    G: {
      name: "Type G",
      pins: "Three rectangular pins",
      grounded: "Yes",
      introduced: "1940s",
      used: "United Kingdom, Ireland, Malta, Cyprus, Singapore, Malaysia, UAE, and parts of Africa",
      why: "It was adopted for safety, with grounding, shutters, and often a fuse inside the plug."
    },
    H: {
      name: "Type H",
      pins: "Three pins, usually round in modern versions",
      grounded: "Yes",
      introduced: "Mid 20th century",
      used: "Israel, West Bank, and Gaza",
      why: "It developed as a local Israeli standard and later evolved for safer modern use."
    },
    I: {
      name: "Type I",
      pins: "Two or three flat angled pins",
      grounded: "Optional or yes when three-pin",
      introduced: "Mid 20th century",
      used: "Australia, New Zealand, China, Argentina, and parts of Oceania",
      why: "It became standard through national electrical systems in Australia, New Zealand, China, and Argentina."
    },
    J: {
      name: "Type J",
      pins: "Three round pins",
      grounded: "Yes",
      introduced: "Mid 20th century",
      used: "Switzerland and Liechtenstein",
      why: "It was chosen as a compact grounded system suited to Swiss safety standards."
    },
    K: {
      name: "Type K",
      pins: "Two round pins plus a grounding pin",
      grounded: "Yes",
      introduced: "Mid 20th century",
      used: "Denmark and Greenland",
      why: "It became Denmark’s local grounded plug standard."
    },
    L: {
      name: "Type L",
      pins: "Three round pins in a straight line",
      grounded: "Yes",
      introduced: "Mid 20th century",
      used: "Italy, Chile, Uruguay, and parts of North Africa",
      why: "It developed as an Italian standard before wider European socket compatibility became more common."
    },
    M: {
      name: "Type M",
      pins: "Three large round pins",
      grounded: "Yes",
      introduced: "Early 20th century",
      used: "South Africa, India, Nepal, Pakistan, and some African countries",
      why: "It was kept for higher-current circuits and countries with older British-derived systems."
    },
    N: {
      name: "Type N",
      pins: "Three round pins",
      grounded: "Yes",
      introduced: "Modern standard",
      used: "Brazil and South Africa",
      why: "It was adopted to create a safer, more unified plug standard."
    },
    O: {
      name: "Type O",
      pins: "Three round pins",
      grounded: "Yes",
      introduced: "2000s",
      used: "Thailand",
      why: "It was introduced to improve safety while staying compatible with plug shapes already common in Thailand."
    }
  };
  
  const COUNTRY_PLUG_DATA = {
    USA: { country: "United States", plugs: ["A", "B"], voltage: "120 V", frequency: "60 Hz" },
    CAN: { country: "Canada", plugs: ["A", "B"], voltage: "120 V", frequency: "60 Hz" },
    MEX: { country: "Mexico", plugs: ["A", "B"], voltage: "127 V", frequency: "60 Hz" },
    GTM: { country: "Guatemala", plugs: ["A", "B"], voltage: "120 V", frequency: "60 Hz" },
    BLZ: { country: "Belize", plugs: ["A", "B", "G"], voltage: "110/220 V", frequency: "60 Hz" },
    HND: { country: "Honduras", plugs: ["A", "B"], voltage: "110 V", frequency: "60 Hz" },
    SLV: { country: "El Salvador", plugs: ["A", "B"], voltage: "115 V", frequency: "60 Hz" },
    NIC: { country: "Nicaragua", plugs: ["A", "B"], voltage: "120 V", frequency: "60 Hz" },
    CRI: { country: "Costa Rica", plugs: ["A", "B"], voltage: "120 V", frequency: "60 Hz" },
    PAN: { country: "Panama", plugs: ["A", "B"], voltage: "120 V", frequency: "60 Hz" },
    CUB: { country: "Cuba", plugs: ["A", "B", "C", "L"], voltage: "110/220 V", frequency: "60 Hz" },
    DOM: { country: "Dominican Republic", plugs: ["A", "B"], voltage: "120 V", frequency: "60 Hz" },
    HTI: { country: "Haiti", plugs: ["A", "B"], voltage: "110 V", frequency: "60 Hz" },
    JAM: { country: "Jamaica", plugs: ["A", "B"], voltage: "110 V", frequency: "50 Hz" },
  
    GBR: { country: "United Kingdom", plugs: ["G"], voltage: "230 V", frequency: "50 Hz" },
    IRL: { country: "Ireland", plugs: ["G"], voltage: "230 V", frequency: "50 Hz" },
    MLT: { country: "Malta", plugs: ["G"], voltage: "230 V", frequency: "50 Hz" },
    CYP: { country: "Cyprus", plugs: ["G"], voltage: "230 V", frequency: "50 Hz" },
    FRA: { country: "France", plugs: ["C", "E"], voltage: "230 V", frequency: "50 Hz" },
    DEU: { country: "Germany", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    ESP: { country: "Spain", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    ITA: { country: "Italy", plugs: ["C", "F", "L"], voltage: "230 V", frequency: "50 Hz" },
    NLD: { country: "Netherlands", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    BEL: { country: "Belgium", plugs: ["C", "E"], voltage: "230 V", frequency: "50 Hz" },
    CHE: { country: "Switzerland", plugs: ["C", "J"], voltage: "230 V", frequency: "50 Hz" },
    LIE: { country: "Liechtenstein", plugs: ["C", "J"], voltage: "230 V", frequency: "50 Hz" },
    AUT: { country: "Austria", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    PRT: { country: "Portugal", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    GRC: { country: "Greece", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    SWE: { country: "Sweden", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    NOR: { country: "Norway", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    DNK: { country: "Denmark", plugs: ["C", "E", "F", "K"], voltage: "230 V", frequency: "50 Hz" },
    FIN: { country: "Finland", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    POL: { country: "Poland", plugs: ["C", "E"], voltage: "230 V", frequency: "50 Hz" },
    CZE: { country: "Czechia", plugs: ["C", "E"], voltage: "230 V", frequency: "50 Hz" },
    SVK: { country: "Slovakia", plugs: ["C", "E"], voltage: "230 V", frequency: "50 Hz" },
    HUN: { country: "Hungary", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    ROU: { country: "Romania", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    BGR: { country: "Bulgaria", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    HRV: { country: "Croatia", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    SRB: { country: "Serbia", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    TUR: { country: "Turkey", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    RUS: { country: "Russia", plugs: ["C", "F"], voltage: "220 V", frequency: "50 Hz" },
    UKR: { country: "Ukraine", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
  
    JPN: { country: "Japan", plugs: ["A", "B"], voltage: "100 V", frequency: "50/60 Hz" },
    CHN: { country: "China", plugs: ["A", "C", "I"], voltage: "220 V", frequency: "50 Hz" },
    KOR: { country: "South Korea", plugs: ["C", "F"], voltage: "220 V", frequency: "60 Hz" },
    IND: { country: "India", plugs: ["C", "D", "M"], voltage: "230 V", frequency: "50 Hz" },
    PAK: { country: "Pakistan", plugs: ["C", "D", "G", "M"], voltage: "230 V", frequency: "50 Hz" },
    BGD: { country: "Bangladesh", plugs: ["C", "D", "G", "K"], voltage: "220 V", frequency: "50 Hz" },
    LKA: { country: "Sri Lanka", plugs: ["D", "G", "M"], voltage: "230 V", frequency: "50 Hz" },
    NPL: { country: "Nepal", plugs: ["C", "D", "M"], voltage: "230 V", frequency: "50 Hz" },
    THA: { country: "Thailand", plugs: ["A", "B", "C", "O"], voltage: "230 V", frequency: "50 Hz" },
    VNM: { country: "Vietnam", plugs: ["A", "C", "G"], voltage: "220 V", frequency: "50 Hz" },
    MYS: { country: "Malaysia", plugs: ["G"], voltage: "240 V", frequency: "50 Hz" },
    SGP: { country: "Singapore", plugs: ["G"], voltage: "230 V", frequency: "50 Hz" },
    IDN: { country: "Indonesia", plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz" },
    PHL: { country: "Philippines", plugs: ["A", "B", "C"], voltage: "220 V", frequency: "60 Hz" },
  
    AUS: { country: "Australia", plugs: ["I"], voltage: "230 V", frequency: "50 Hz" },
    NZL: { country: "New Zealand", plugs: ["I"], voltage: "230 V", frequency: "50 Hz" },
  
    BRA: { country: "Brazil", plugs: ["C", "N"], voltage: "127/220 V", frequency: "60 Hz" },
    ARG: { country: "Argentina", plugs: ["C", "I"], voltage: "220 V", frequency: "50 Hz" },
    CHL: { country: "Chile", plugs: ["C", "L"], voltage: "220 V", frequency: "50 Hz" },
    PER: { country: "Peru", plugs: ["A", "B", "C"], voltage: "220 V", frequency: "60 Hz" },
    COL: { country: "Colombia", plugs: ["A", "B"], voltage: "110 V", frequency: "60 Hz" },
    BOL: { country: "Bolivia", plugs: ["A", "C"], voltage: "230 V", frequency: "50 Hz" },
    ECU: { country: "Ecuador", plugs: ["A", "B"], voltage: "120 V", frequency: "60 Hz" },
    VEN: { country: "Venezuela", plugs: ["A", "B"], voltage: "120 V", frequency: "60 Hz" },
    PRY: { country: "Paraguay", plugs: ["C", "N"], voltage: "220 V", frequency: "50 Hz" },
    URY: { country: "Uruguay", plugs: ["C", "F", "I", "L"], voltage: "230 V", frequency: "50 Hz" },
  
    ZAF: { country: "South Africa", plugs: ["C", "M", "N"], voltage: "230 V", frequency: "50 Hz" },
    EGY: { country: "Egypt", plugs: ["C", "F"], voltage: "220 V", frequency: "50 Hz" },
    MAR: { country: "Morocco", plugs: ["C", "E"], voltage: "220 V", frequency: "50 Hz" },
    NGA: { country: "Nigeria", plugs: ["D", "G"], voltage: "230 V", frequency: "50 Hz" },
    KEN: { country: "Kenya", plugs: ["G"], voltage: "240 V", frequency: "50 Hz" },
    GHA: { country: "Ghana", plugs: ["D", "G"], voltage: "230 V", frequency: "50 Hz" },
  
    SAU: { country: "Saudi Arabia", plugs: ["A", "B", "C", "G"], voltage: "230 V", frequency: "60 Hz" },
    ARE: { country: "United Arab Emirates", plugs: ["G"], voltage: "230 V", frequency: "50 Hz" },
    ISR: { country: "Israel", plugs: ["C", "H"], voltage: "230 V", frequency: "50 Hz" }
  };
  
  function getCountryCode(feature) {
    return feature.id || feature.properties?.iso_a3 || feature.properties?.ISO_A3;
  }
  
  function getKnownRegionalPlugData(code, name) {
    const europeCodes = "ISL EST LVA LTU LUX SVN BIH MKD MNE ALB MDA BLR AND SMR VAT MCO".split(" ");
    const britishCodes = "HKG OMN QAT KWT BHR UGA MWI BRN GMB SYC SLE".split(" ");
    const americasCodes = "BHS TTO GUY SUR BRB ATG DMA GRD KNA LCA VCT".split(" ");
    const asiaRoundCodes = "BTN MMR LAO KHM MNG KAZ KGZ TJK TKM UZB AFG IRN IRQ JOR LBN SYR ARM AZE GEO".split(" ");
    const africaRoundCodes = "DZA TUN LBY SDN ETH SOM DJI ERI TZA RWA BDI COD COG AGO ZMB ZWE MOZ BWA NAM LSO SWZ MDG MUS SEN CIV CMR MLI NER BFA BEN TGO GIN GNB LBR CAF GNQ".split(" ");
    const pacificCodes = "PNG FJI SLB VUT TON WSM KIR".split(" ");
  
    if (europeCodes.includes(code)) return { country: name, plugs: ["C", "F"], voltage: "230 V", frequency: "50 Hz", estimated: true };
    if (britishCodes.includes(code)) return { country: name, plugs: ["G"], voltage: "230–240 V", frequency: "50 Hz", estimated: true };
    if (americasCodes.includes(code)) return { country: name, plugs: ["A", "B"], voltage: "110–120 V", frequency: "60 Hz", estimated: true };
    if (asiaRoundCodes.includes(code)) return { country: name, plugs: ["C", "F"], voltage: "220–230 V", frequency: "50 Hz", estimated: true };
    if (africaRoundCodes.includes(code)) return { country: name, plugs: ["C", "E", "F"], voltage: "220–240 V", frequency: "50 Hz", estimated: true };
    if (pacificCodes.includes(code)) return { country: name, plugs: ["I"], voltage: "230–240 V", frequency: "50 Hz", estimated: true };
  
    return {
      country: name,
      plugs: ["C", "F"],
      voltage: "220–240 V",
      frequency: "50 Hz",
      estimated: true
    };
  }
  
  function getPlugData(feature) {
    const code = getCountryCode(feature);
    const name = feature.properties?.name || feature.properties?.NAME || "Country";
    return COUNTRY_PLUG_DATA[code] || getKnownRegionalPlugData(code, name);
  }
  
  function getMainPlug(data) {
    return data.plugs[0] || "C";
  }
  
  const PLUG_USAGE_COUNTS = Object.values(COUNTRY_PLUG_DATA).reduce((counts, item) => {
    const uniquePlugs = new Set(item.plugs || []);

    uniquePlugs.forEach(plug => {
      counts[plug] = (counts[plug] || 0) + 1;
    });

    return counts;
  }, {});

  function getMapColorPlug(data) {
    const plugs = data.plugs || [];

    if (!plugs.length) return "C";
    if (plugs.length === 1) return plugs[0];

    return plugs.reduce((mostCommonPlug, plug) => {
      const currentCount = PLUG_USAGE_COUNTS[plug] ?? 0;
      const mostCount = PLUG_USAGE_COUNTS[mostCommonPlug] ?? 0;

      return currentCount > mostCount ? plug : mostCommonPlug;
    }, plugs[0]);
  }
  
  function getPlugColor(plugCode) {
    return PLUG_COLORS[plugCode] || PLUG_COLORS.C;
  }
  
  function getPlugPhotoUrl(plugCode) {
    return PLUG_PHOTO_URLS[plugCode] || PLUG_PHOTO_URLS.C;
  }
  
  function getPlugSvgFallback(plugCode) {
    const color = getPlugColor(plugCode);
    const label = plugCode || "C";
  
    return `
      <svg viewBox="0 0 80 80" role="img" aria-label="Type ${label} plug icon">
        <rect x="16" y="24" width="48" height="44" rx="13" fill="${color}" />
        <rect x="27" y="9" width="8" height="23" rx="3" fill="#111827" />
        <rect x="45" y="9" width="8" height="23" rx="3" fill="#111827" />
        <text x="40" y="55" text-anchor="middle" font-size="28" font-weight="900" fill="white">${label}</text>
      </svg>
    `;
  }
  
  window.getPlugSvgFallback = getPlugSvgFallback;
  
  function getPlugPhotoHtml(plugCode, className = "plug-photo-img") {
    const url = getPlugPhotoUrl(plugCode);
  
    return `
      <img
        class="${className}"
        src="${url}"
        alt="Type ${plugCode} plug"
        loading="lazy"
        onerror="this.outerHTML = window.getPlugSvgFallback('${plugCode}')"
      >
    `;
  }
  
  function renderPlugImageContainers() {
    document.querySelectorAll("[data-plug-image]").forEach(element => {
      const plugCode = element.dataset.plugImage;
      element.innerHTML = getPlugPhotoHtml(plugCode, "top-plug-photo");

      const topCard = element.closest(".plug-card");
      if (topCard && !topCard.querySelector(".plug-hover-bubble")) {
        const bubble = document.createElement("div");
        bubble.className = "plug-hover-bubble";
        bubble.setAttribute("aria-hidden", "true");
        bubble.innerHTML = getPlugPhotoHtml(plugCode, "reference-plug-photo");
        element.after(bubble);
      }
    });
  }
  
  function renderPlugPills(plugs) {
    return plugs
      .map(plug => `
        <span class="plug-pill" style="background:${getPlugColor(plug)}">Type ${plug}</span>
      `)
      .join("");
  }
  
  function styleCountry(feature) {
    const data = getPlugData(feature);
    const mapColorPlug = getMapColorPlug(data);
  
    return {
      fillColor: getPlugColor(mapColorPlug),
      weight: 0.8,
      opacity: 1,
      color: "rgba(255,255,255,0.86)",
      fillOpacity: 0.72
    };
  }
  
  function resetHoverInfo() {
    plugInfoElement.innerHTML = `<p>Hover over a country to review its principal plug standard, voltage, and frequency.</p>`;
  }
  
  function resetCountryInfo() {
    countryTitleElement.classList.add("hidden");
    countryInfoElement.innerHTML = `<p>Select a country to examine its outlet standards, electrical specifications, and adapter guidance.</p>`;
  }
  
  function updateHoverPanel(data) {
    if (!data) {
      resetHoverInfo();
      return;
    }
  
    const mainPlug = getMainPlug(data);
  
    plugInfoElement.innerHTML = `
      <p class="info-label">Selected country</p>
      <p class="info-value">${data.country}</p>
  
      <p class="info-label">Primary plug standard</p>
      <div class="main-plug-row">
        <div class="large-plug-photo">
          ${getPlugPhotoHtml(mainPlug)}
        </div>
        <div class="main-plug-text">Type ${mainPlug}</div>
      </div>
  
      <p class="info-label">Recognised plug types</p>
      <div class="plug-pill-row">
        ${renderPlugPills(data.plugs)}
      </div>
  
      <p class="info-label">Nominal voltage</p>
      <p class="info-value">${data.voltage}</p>
  
      <p class="info-label">Grid frequency</p>
      <p class="info-value">${data.frequency}</p>
    `;
  }
  
  function renderClickedCountry(data) {
    countryTitleElement.classList.remove("hidden");
  
    const mainPlug = getMainPlug(data);
    const mainDetail = PLUG_DETAILS[mainPlug];
  
    const extraHistory = data.plugs
      .map(plug => PLUG_DETAILS[plug])
      .filter(Boolean)
      .map(detail => `<p><strong>${detail.name}:</strong> ${detail.why}</p>`)
      .join("");
  
    countryInfoElement.innerHTML = `
      <article class="plug-detail-card">
        <div class="plug-detail-header">
          <div class="plug-detail-hero">
            <div class="plug-detail-main-photo">
              ${getPlugPhotoHtml(mainPlug)}
            </div>
  
            <div class="plug-detail-title-wrap">
              <h3>${data.country}</h3>
              <p>${data.estimated ? "Best available regional standard estimate" : "Established outlet and electrical standards"}</p>
              <div class="plug-pill-row compact-plug-pills">
                ${renderPlugPills(data.plugs)}
              </div>
            </div>
          </div>
        </div>
  
        <div class="plug-detail-body">
          <div class="fact-grid">
            <div class="fact-box">
              <div class="fact-label">Outlet types</div>
              <div class="fact-value">${data.plugs.map(plug => `Type ${plug}`).join(", ")}</div>
            </div>
  
            <div class="fact-box">
              <div class="fact-label">Nominal voltage</div>
              <div class="fact-value">${data.voltage}</div>
            </div>
  
            <div class="fact-box">
              <div class="fact-label">Grid frequency</div>
              <div class="fact-value">${data.frequency}</div>
            </div>
  
            <div class="fact-box">
              <div class="fact-label">Earthing</div>
              <div class="fact-value">${mainDetail.grounded}</div>
            </div>
  
            <div class="fact-box">
              <div class="fact-label">Connector format</div>
              <div class="fact-value">${mainDetail.pins}</div>
            </div>
  
            <div class="fact-box">
              <div class="fact-label">Standard introduced</div>
              <div class="fact-value">${mainDetail.introduced}</div>
            </div>
          </div>
  
          <div class="history-box">
            <strong>Standardisation context</strong>
            ${extraHistory}
          </div>
  
          <div class="history-box">
            <strong>Traveller guidance</strong>
            <p>
              A travel adapter is required when the device plug does not match the local outlet shape.
              A voltage converter may also be necessary if the device is not rated for ${data.voltage}.
              Always verify the rating printed on the charger or power supply before use.
            </p>
          </div>
        </div>
      </article>
    `;
  }
  
  function cancelPanelReset() {
    if (resetPanelTimeout) {
      clearTimeout(resetPanelTimeout);
      resetPanelTimeout = null;
    }
  }

  function cancelClickedSelectionTimer() {
    if (clickedSelectionTimeout) {
      clearTimeout(clickedSelectionTimeout);
      clickedSelectionTimeout = null;
    }
  }

  function clearClickedSelection() {
    cancelClickedSelectionTimer();
    clearDiagonalEffect();

    if (clickedLayer && countryLayer) {
      countryLayer.resetStyle(clickedLayer);
    }

    clickedLayer = null;
    resetCountryInfo();

    if (hoveredLayer) {
      highlightLayer(hoveredLayer);
    } else {
      resetHoverInfo();
    }
  }

  function scheduleClickedSelectionClear() {
    cancelClickedSelectionTimer();

    clickedSelectionTimeout = setTimeout(() => {
      if (!isMouseOnInfoPanel) {
        clearClickedSelection();
      }
    }, CLICK_SELECTION_DURATION);
  }
  
  function schedulePanelReset() {
    cancelPanelReset();
  
    resetPanelTimeout = setTimeout(() => {
      if (!hoveredLayer && !isMouseOnInfoPanel) {
        resetHoverInfo();
      }
    }, PANEL_RESET_DELAY);
  }
  
  function highlightLayer(layer) {
    layer.setStyle({
      weight: 2.2,
      color: "#111827",
      fillOpacity: 0.9
    });
  
    layer.bringToFront();
  }
  
  function resetLayer(layer) {
    if (!countryLayer || !layer) return;
  
    if (layer !== clickedLayer) {
      countryLayer.resetStyle(layer);
    }
  }
  
  function hexToRgb(hex) {
    const cleanHex = String(hex || "").replace("#", "");
    const fullHex = cleanHex.length === 3
      ? cleanHex.split("").map(char => char + char).join("")
      : cleanHex;

    const value = Number.parseInt(fullHex, 16);

    if (!Number.isFinite(value)) {
      return { r: 37, g: 99, b: 235 };
    }

    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255
    };
  }

  function rgbToHex({ r, g, b }) {
    return `#${[r, g, b]
      .map(value => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
      .join("")}`;
  }

  function lightenHexColor(hex, amount = 0.42) {
    const rgb = hexToRgb(hex);

    return rgbToHex({
      r: rgb.r + (255 - rgb.r) * amount,
      g: rgb.g + (255 - rgb.g) * amount,
      b: rgb.b + (255 - rgb.b) * amount
    });
  }

  function makePatternId(color) {
    return `clicked-country-diagonal-${String(color).replace("#", "")}`;
  }

  function ensureDiagonalPattern(color) {
    const svg = document.querySelector("#map svg");
    if (!svg) return null;

    const patternId = makePatternId(color);
    if (svg.querySelector(`#${patternId}`)) return patternId;

    let defs = svg.querySelector("defs");

    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      svg.insertBefore(defs, svg.firstChild);
    }

    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    pattern.setAttribute("id", patternId);
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("width", "12");
    pattern.setAttribute("height", "12");
    pattern.setAttribute("patternTransform", "rotate(45)");

    const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    background.setAttribute("width", "12");
    background.setAttribute("height", "12");
    background.setAttribute("fill", color);
    background.setAttribute("fill-opacity", "0.96");

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "0");
    line.setAttribute("x2", "0");
    line.setAttribute("y2", "12");
    line.setAttribute("stroke", lightenHexColor(color));
    line.setAttribute("stroke-width", "4");
    line.setAttribute("stroke-opacity", "0.95");

    pattern.appendChild(background);
    pattern.appendChild(line);
    defs.appendChild(pattern);

    return patternId;
  }

  function clearDiagonalEffect() {
    if (diagonalEffectLayer) {
      const element = diagonalEffectLayer.getElement();

      if (element) {
        element.removeAttribute("fill");
        element.style.fill = "";
      }

      diagonalEffectLayer = null;
    }
  }

  function applyDiagonalEffect(layer, data) {
    clearDiagonalEffect();
    diagonalEffectLayer = layer;

    setTimeout(() => {
      const originalColor = getPlugColor(getMapColorPlug(data));
      const patternId = ensureDiagonalPattern(originalColor);
      const element = layer.getElement();

      if (element && patternId) {
        element.setAttribute("fill", `url(#${patternId})`);
        element.style.fill = `url(#${patternId})`;
      }
    }, 0);
  }

  function showClickedEffect(layer, data) {
    cancelClickedSelectionTimer();

    if (clickedLayer && clickedLayer !== layer && countryLayer) {
      countryLayer.resetStyle(clickedLayer);
    }
  
    clickedLayer = layer;
  
    layer.setStyle({
      fillColor: getPlugColor(getMapColorPlug(data)),
      fillOpacity: 0.96,
      color: "#111827",
      weight: 3,
      opacity: 1
    });
  
    layer.bringToFront();
    applyDiagonalEffect(layer, data);
    scheduleClickedSelectionClear();
  }
  
  function clearActiveSelection() {
    cancelPanelReset();
    cancelClickedSelectionTimer();
    clearDiagonalEffect();
  
    if (countryLayer) {
      countryLayer.eachLayer(layer => {
        countryLayer.resetStyle(layer);
      });
    }
  
    hoveredLayer = null;
    clickedLayer = null;
  
    resetHoverInfo();
    resetCountryInfo();
  }
  
  function onEachCountry(feature, layer) {
    const data = getPlugData(feature);
  
    layer.on("mouseover", function () {
      cancelPanelReset();
      hoveredLayer = layer;
      updateHoverPanel(data);
  
      if (layer !== clickedLayer) {
        highlightLayer(layer);
      }
    });
  
    layer.on("mouseout", function () {
      if (layer !== clickedLayer) {
        resetLayer(layer);
      }
  
      hoveredLayer = null;
      schedulePanelReset();
    });
  
    layer.on("click", function (event) {
      if (event.originalEvent) {
        event.originalEvent._countryClicked = true;
      }
  
      cancelPanelReset();
      showClickedEffect(layer, data);
      updateHoverPanel(data);
      renderClickedCountry(data);
    });
  }
  
  if (infoPanel) {
    infoPanel.addEventListener("mouseenter", function () {
      isMouseOnInfoPanel = true;
      cancelPanelReset();
      cancelClickedSelectionTimer();
    });
  
    infoPanel.addEventListener("mouseleave", function () {
      isMouseOnInfoPanel = false;

      if (clickedLayer) {
        clearClickedSelection();
      } else {
        schedulePanelReset();
      }
    });
  }
  
  map.on("click", function (event) {
    if (event.originalEvent && event.originalEvent._countryClicked) {
      return;
    }
  
    clearActiveSelection();
  });
  
  function renderAllPlugTypesList() {
    const orderedTypes = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];
  
    allPlugTypesListElement.innerHTML = orderedTypes
      .map(type => {
        const detail = PLUG_DETAILS[type];
  
        return `
          <article class="type-reference-card">
            <div class="plug-image">
              ${getPlugPhotoHtml(type, "reference-plug-photo")}
            </div>
  
            <div class="plug-hover-bubble" aria-hidden="true">
              ${getPlugPhotoHtml(type, "reference-plug-photo")}
            </div>
  
            <div>
              <h3>${detail.name}</h3>
              <p>${detail.used}</p>
  
              <div class="type-reference-meta">
                <div><strong>Shape:</strong> ${detail.pins}</div>
                <div><strong>Grounded:</strong> ${detail.grounded}</div>
                <div><strong>Introduced:</strong> ${detail.introduced}</div>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }
  
  function setupPlugHoverBubbles() {
    document.querySelectorAll(".type-reference-card, .plug-card").forEach(card => {
      const image = card.querySelector(".plug-image");
      const bubble = card.querySelector(".plug-hover-bubble");

      if (!image || !bubble) return;

      function showBubble() {
        card.classList.add("bubble-visible");
      }

      function hideBubbleIfOutside() {
        requestAnimationFrame(() => {
          if (!image.matches(":hover") && !bubble.matches(":hover")) {
            card.classList.remove("bubble-visible");
          }
        });
      }

      image.addEventListener("mouseenter", showBubble);
      image.addEventListener("mouseleave", hideBubbleIfOutside);
      bubble.addEventListener("mouseenter", showBubble);
      bubble.addEventListener("mouseleave", hideBubbleIfOutside);
    });
  }

  const CAPITALS_ZOOM_THRESHOLD = 5;
  let capitalsLayer = L.layerGroup();
  let capitalsLoaded = false;
  let capitalsLoading = false;
  
  function makeCapitalIcon(capitalName) {
    return L.divIcon({
      className: "capital-marker",
      html: `<span class="capital-dot"></span><span class="capital-label">${capitalName}</span>`,
      iconSize: [120, 22],
      iconAnchor: [6, 11]
    });
  }
  
  function normaliseCoordinate(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
  
  function addCapitalMarkers(capitals) {
    capitalsLayer.clearLayers();
  
    capitals.forEach(item => {
      const capitalName =
        item.capitalName ||
        item.capital ||
        item.city ||
        item.name;
  
      const latValue =
        item.capitalLatitude ||
        item.latitude ||
        item.lat;
  
      const lngValue =
        item.capitalLongitude ||
        item.longitude ||
        item.lng ||
        item.lon;
  
      const lat = normaliseCoordinate(latValue);
      const lng = normaliseCoordinate(lngValue);
  
      if (!capitalName || lat === null || lng === null) return;
  
      L.marker([lat, lng], {
        icon: makeCapitalIcon(capitalName),
        interactive: false,
        keyboard: false,
        zIndexOffset: 900
      }).addTo(capitalsLayer);
    });
  }
  
  function loadCapitals() {
    if (capitalsLoaded || capitalsLoading) return;
  
    capitalsLoading = true;
  
    fetch("https://raw.githubusercontent.com/icyrockcom/country-capitals/master/data/country-list.json")
      .then(response => {
        if (!response.ok) {
          throw new Error("Could not load capital city data.");
        }
  
        return response.json();
      })
      .then(capitals => {
        addCapitalMarkers(capitals);
        capitalsLoaded = true;
        updateCapitalVisibility();
      })
      .catch(() => {
        capitalsLoaded = false;
      })
      .finally(() => {
        capitalsLoading = false;
      });
  }
  
  function updateCapitalVisibility() {
    const shouldShowCapitals = map.getZoom() >= CAPITALS_ZOOM_THRESHOLD;
  
    if (shouldShowCapitals) {
      loadCapitals();
  
      if (!map.hasLayer(capitalsLayer)) {
        capitalsLayer.addTo(map);
      }
    } else if (map.hasLayer(capitalsLayer)) {
      map.removeLayer(capitalsLayer);
    }
  }
  
  map.on("zoomend", updateCapitalVisibility);
  
  function loadCountryMap() {
    fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
      .then(response => {
        if (!response.ok) {
          throw new Error("Could not load country map GeoJSON.");
        }
  
        return response.json();
      })
      .then(data => {
        countryLayer = L.geoJSON(data, {
          style: styleCountry,
          onEachFeature: onEachCountry
        }).addTo(map);
      })
      .catch(error => {
        plugInfoElement.innerHTML = `
          <p><strong>Map data could not load.</strong></p>
          <p>${error.message}</p>
          <p>Check your internet connection or host a local countries GeoJSON file.</p>
        `;
      });
  }
  
  function initApp() {
    renderPlugImageContainers();
    renderAllPlugTypesList();
    setupPlugHoverBubbles();
    resetHoverInfo();
    resetCountryInfo();
    loadCountryMap();
  
    setTimeout(() => {
      map.invalidateSize();
      resetMapView();
    }, 0);
  }
  
  initApp();