(function () {
  /**
   * Category hierarchy: Division → Department → BMC.
   * Values mirror Docs/CreationFilter.md (GAP SCANNER CONFIGURATION).
   */
  const GAP_SCANNER_NAMES = ["Vincent", "Santhya", "Ayanda", "Asif"];

  const FILTER_HIERARCHY = {
    Food: {
      Beverages: ["Soft Drinks", "Juices", "Water"],
      "Canned Food": ["Canned Vegetables", "Canned Meat", "Canned Fish"],
      Confectionery: ["Chocolates", "Sweets", "Chewing Gum"],
      Chilled: ["Dairy", "Ready Meals", "Chilled Juices"],
    },
    GM: {
      Multimedia: ["TVs", "Audio", "Accessories"],
      Toys: ["Educational Toys", "Outdoor Toys", "Electronic Toys"],
      DIY: ["Tools", "Paint", "Hardware"],
      Sport: ["Fitness Equipment", "Sportwear", "Accessories"],
    },
    Liquor: {
      Wine: ["Red Wine", "White Wine", "Sparkling Wine"],
      Spirits: ["Whisky", "Vodka", "Gin"],
      Beer: ["Lager", "Craft Beer", "Ciders"],
    },
  };

  /** Docs/ReplenishedCodes.md — Code options per Replenished value */
  const REPLENISHED_YES_CODES = ["In Full", "Limited Stock"];
  const REPLENISHED_NO_CODES = [
    "Stock Not Found",
    "Damaged Stock",
    "Displayed Article",
  ];

  /** Full gap-scan grid only on Create New (landing). */
  const createNewDetail = {
    articles: 13,
    noStock: 4,
    gaps12h: 2,
    lines: [
      {
        docId: "00000008",
        time: "15/08 | 08:15",
        name: "FANTA GRAPE 2LT : Each",
        article: "234234",
        gtin: "60017600235429",
        loc: "501 | Z1-A1-M1-B1\n203 | S001",
        error: false,
        selectable: true,
        articleModal: {
          productTitle: "FANTA GRAPE 2L : EACH",
          articleNumber: "234234",
          gtin: "60017600235429",
          stockOnHandLines: ["S001: 203", "Z1-A1-M1-B1 : 501"],
          lastOrderDate: "07 / 07 / 2026",
          quantity: "5000",
          expectedDeliveryDate: "",
        },
      },
      {
        docId: "00000008",
        time: "15/08 | 08:15",
        name: "COCA COLA 2L : Each",
        article: "234222",
        gtin: "60017600233456",
        loc: "5012 | S001",
        error: false,
        selectable: true,
        articleModal: {
          productTitle: "COCA COLA 2L : EACH",
          articleNumber: "234222",
          gtin: "60017600233456",
          stockOnHandLines: ["S001: 5012"],
          lastOrderDate: "",
          quantity: "",
          expectedDeliveryDate: "",
        },
      },
      {
        docId: "00000011",
        time: "15/08 | 12:20",
        name: "OMO REGULAR : Each",
        article: "344439",
        gtin: "600176002342361",
        loc: "0 |",
        createdAt: "15/08/2026",
        error: true,
        selectable: false,
        articleModal: {
          productTitle: "OMO REGULAR : EACH",
          articleNumber: "344439",
          gtin: "600176002342361",
          stockOnHandLines: [],
          lastOrderDate: "",
          quantity: "",
          expectedDeliveryDate: "",
        },
      },
      {
        docId: "00000014",
        time: "15/08 | 08:15",
        name: "SPRITE 300ML : SW",
        article: "123232",
        gtin: "60017604548232",
        loc: "300 | Z1-A3-M4-B2\n259 | S001",
        error: false,
        selectable: true,
        articleModal: {
          productTitle: "SPRITE 300ML : SW",
          articleNumber: "123232",
          gtin: "60017604548232",
          stockOnHandLines: ["Z1-A3-M4-B2 : 300", "S001: 259"],
          lastOrderDate: "",
          quantity: "",
          expectedDeliveryDate: "",
        },
      },
    ],
  };

  const documents = [
    {
      id: "create",
      label: "Create New",
      isLanding: true,
      articles: createNewDetail.articles,
      noStock: createNewDetail.noStock,
      gaps12h: createNewDetail.gaps12h,
      lines: createNewDetail.lines,
    },
    {
      id: "WO00000012",
      date: "15/08/2026",
      closedLabel: "Task Complete",
      status: "Completed",
      statusType: "success",
      replenishmentImmutable: true,
      taskStartedAtMs: 0,
      taskCompletedAtMs: 0,
      loeDisplay: "4h 12m",
      replenishment: buildWo12LockedReplenishment(),
      /** Same shape as active Close Gap table — shown on completed WO detail (read-only). */
      closeGapRows: [
        {
          article: "60017343398453",
          articleName: "Simba Chips Mexican : Box",
          quantity: 100,
          from: "S001-BR",
          to: "Aisle 1 | Shelf 1",
          status: "Filled in full",
        },
        {
          article: "60017600343430",
          articleName: "Allsorts Original mini : SW",
          quantity: 100,
          from: "S001-BR",
          to: "Aisle 1 | Shelf 1",
          status: "Limited stock",
        },
      ],
    },
  ];

  const els = {
    masterList: document.getElementById("master-list"),
    docSearch: document.getElementById("doc-search"),
    articleSearch: document.getElementById("article-search"),
    detailTitle: document.getElementById("detail-title"),
    detailSummary: document.getElementById("detail-summary"),
    articleList: document.getElementById("article-list"),
    btnSelectAll: document.getElementById("btn-select-all"),
    btnSave: document.getElementById("btn-save"),
    footerCreate: document.getElementById("footer-actions-create"),
    footerReplenish: document.getElementById("footer-actions-replenish"),
    btnCloseTask: document.getElementById("btn-close-task"),
    toast: document.getElementById("toast"),
    btnRefreshDocs: document.getElementById("btn-refresh-docs"),
    btnRefreshArticles: document.getElementById("btn-refresh-articles"),
    modalBackdrop: document.getElementById("article-modal-backdrop"),
    modalProduct: document.getElementById("modal-product"),
    modalArticleNum: document.getElementById("modal-article-num"),
    modalGtin: document.getElementById("modal-gtin"),
    modalStockHand: document.getElementById("modal-stock-hand"),
    modalOrderDate: document.getElementById("modal-order-date"),
    modalOrderQty: document.getElementById("modal-order-qty"),
    modalOrderEdd: document.getElementById("modal-order-edd"),
    modalClose: document.getElementById("modal-close"),
    fillBackdrop: document.getElementById("fill-modal-backdrop"),
    fillModalArticleName: document.getElementById("fill-modal-article-name"),
    fillCancel: document.getElementById("fill-cancel"),
    fillSave: document.getElementById("fill-save"),
    filterBackdrop: document.getElementById("filter-modal-backdrop"),
    filterScanner: document.getElementById("filter-scanner"),
    filterDivision: document.getElementById("filter-division"),
    filterDepartment: document.getElementById("filter-department"),
    filterBmc: document.getElementById("filter-bmc"),
    filterExecute: document.getElementById("filter-execute"),
    filterCancel: document.getElementById("filter-cancel"),
    replSelectBackdrop: document.getElementById("repl-select-backdrop"),
    replModalProduct: document.getElementById("repl-modal-product"),
    replModalArticleNum: document.getElementById("repl-modal-article-num"),
    replModalGtin: document.getElementById("repl-modal-gtin"),
    replModalLocation: document.getElementById("repl-modal-location"),
    replValue: document.getElementById("repl-value"),
    replCode: document.getElementById("repl-code"),
    replSelectCancel: document.getElementById("repl-select-cancel"),
    replSelectSave: document.getElementById("repl-select-save"),
    removeBackdrop: document.getElementById("remove-article-backdrop"),
    removeLocation: document.getElementById("remove-location"),
    removeGtin: document.getElementById("remove-gtin"),
    removeQty: document.getElementById("remove-qty"),
    removeExp: document.getElementById("remove-exp"),
    removeCancel: document.getElementById("remove-cancel"),
    removeConfirm: document.getElementById("remove-confirm"),
    removeBin: document.getElementById("remove-bin"),
    anfBackdrop: document.getElementById("article-not-found-backdrop"),
    anfLocationField: document.getElementById("anf-location-field"),
    anfLocation: document.getElementById("anf-location"),
    anfCancel: document.getElementById("anf-cancel"),
    anfSave: document.getElementById("anf-save"),
    errorBackdrop: document.getElementById("error-backdrop"),
    errorClose: document.getElementById("error-close"),
    closeGapScanErrorBackdrop: document.getElementById("close-gap-scan-error-backdrop"),
    closeGapScanErrorClose: document.getElementById("close-gap-scan-error-close"),
    taskCompleteBackdrop: document.getElementById("task-complete-backdrop"),
    taskCompleteClose: document.getElementById("task-complete-close"),
  };

  let selectedId = "create";
  let visibleLines = [];
  let replSelectLineKey = null;
  let removeLineKey = null;
  let pendingMerchGtin = "";
  let pendingMerchName = "";

  /** Last applied Articles Filter (Create New detail). */
  let appliedArticleFilter = {
    scanner: "",
    division: "",
    department: "",
    bmc: "",
  };
  let hasAppliedArticleFilter = false;

  function getSelectedEntry() {
    return documents.find((d) => d.id === selectedId);
  }

  function getDetailPayload(entry) {
    if (!entry) return null;
    if (entry.isLanding && entry.lines) return entry;
    return null;
  }

  function getReplenishmentPayload(entry) {
    if (!entry || !entry.replenishment) return null;
    return entry.replenishment;
  }

  function getMerchandisingPayload(entry) {
    if (!entry || !entry.merchandising) return null;
    return entry.merchandising;
  }

  function buildReplenishmentDetail() {
    return {
      articles: 13,
      min30Assigned: 2,
      readOnly: false,
      lines: [
        {
          key: "fanta",
          name: "FANTA GRAPE 2LT : Each",
          articleLine: "ARTICLE : 234234",
          gtin: "60017600235429",
          location: "Aisle:1 | Shelf:2",
          stockOnHandLines: ["S001: 203", "Z1-A1-M1-B1 : 501"],
          bestBeforeByIndex: ["14/05", "20/05"],
          articleNum: "234234",
          productTitle: "FANTA GRAPE 2L : EACH",
          replenished: null,
          code: null,
        },
        {
          key: "coca",
          name: "COCA COLA 2L : Each",
          articleLine: "ARTICLE : 234222",
          gtin: "60017600233456",
          location: "Aisle:1 | Shelf:2",
          stockOnHandLines: ["S001: 5012"],
          bestBeforeByIndex: ["30/06"],
          articleNum: "234222",
          productTitle: "COCA COLA 2L : EACH",
          replenished: null,
          code: null,
        },
        {
          key: "sprite",
          name: "SPRITE 300ML : SW",
          articleLine: "ARTICLE : 123232",
          gtin: "60017604548232",
          location: "Aisle:1 | Shelf:17",
          stockOnHandLines: ["Z1-A3-M4-B2 : 300", "S001: 259"],
          bestBeforeByIndex: ["12/05", "18/05"],
          articleNum: "123232",
          productTitle: "SPRITE 300ML : SW",
          replenished: null,
          code: null,
        },
      ],
    };
  }

  function buildWo13Document() {
    return {
      id: "WO00000013",
      date: "15/08/2026",
      closedLabel: "Replenish Articles",
      status: "In Progress",
      statusType: "progress",
      taskStartedAtMs: Date.now(),
      replenishment: buildReplenishmentDetail(),
    };
  }

  /** Locked completed replenishment for WO00000012 (reference UI). */
  function buildWo12LockedReplenishment() {
    return {
      articles: 3,
      completedAt: "14 / 06 / 2026",
      articlesNoStock: 1,
      loe: "4 Hours",
      workflowClosed: "Yes",
      readOnly: true,
      min30Assigned: 0,
      lines: [
        {
          key: "simba",
          name: "Simba Chips Mexican : Box",
          articleLine: "ARTICLE: 345231",
          location: "Aisle: 6 | Shelf: 5",
          articleNum: "345231",
          gtin: "60017343398453",
          stockOnHandLines: ["S001: 45"],
          bestBeforeByIndex: ["05/06"],
          productTitle: "SIMBA CHIPS MEXICAN : BOX",
          replenished: "Yes",
          code: "In Full",
          codeDisplay: "Full",
        },
        {
          key: "allsorts",
          name: "Allsorts Original mini : SW",
          articleLine: "ARTICLE: 343493",
          location: "Aisle: 6 | Shelf: 9",
          articleNum: "343493",
          gtin: "60017600343430",
          stockOnHandLines: ["S001: 12"],
          bestBeforeByIndex: ["10/06"],
          productTitle: "ALLSORTS ORIGINAL MINI : SW",
          replenished: "Yes",
          code: "In Full",
          codeDisplay: "Full",
        },
        {
          key: "pringles",
          name: "Pringles 200g : Each",
          articleLine: "ARTICLE: 232845",
          location: "Aisle: 6 | Shelf: 17",
          articleNum: "232845",
          gtin: "60017343865975",
          stockOnHandLines: ["S001: 0"],
          bestBeforeByIndex: ["01/07"],
          productTitle: "PRINGLES 200G : EACH",
          exception: true,
          exceptionMeta: { reason: "Stock not found", location: "" },
        },
      ],
    };
  }

  function updateFooter(entry) {
    const isCreate = Boolean(entry && entry.isLanding);
    const repl = entry && entry.replenishment;
    const isReplenish = Boolean(repl && !repl.readOnly);
    els.footerCreate.hidden = !isCreate;
    els.footerReplenish.hidden = !isReplenish;
  }

  function deepCloneReplenishment(r) {
    return JSON.parse(JSON.stringify(r));
  }

  /** After Close on WO00000013: complete WO13; copy to WO12 if not immutable. */
  function finalizeWo13Close() {
    const wo13 = documents.find((d) => d.id === "WO00000013");
    if (!wo13 || !wo13.replenishment || wo13.replenishment.readOnly) return;

    const r = wo13.replenishment;
    r.lines.forEach((line) => {
      if (!line.replenished || !line.code) {
        line.replenished = "Yes";
        line.code = "In Full";
      }
    });
    r.readOnly = true;

    wo13.closedLabel = "Task Complete";
    wo13.status = "Completed";
    wo13.statusType = "success";
    wo13.taskCompletedAtMs = Date.now();

    const wo12 = documents.find((d) => d.id === "WO00000012");
    if (wo12 && !wo12.replenishmentImmutable) {
      const copy = deepCloneReplenishment(r);
      copy.readOnly = true;
      copy.lines.forEach((line) => {
        line.replenished = "Yes";
        line.code = "In Full";
      });
      wo12.replenishment = copy;
    }

    renderMaster(els.docSearch.value);
    renderDetail();
    showToast("WO00000013 completed");
  }

  function replenishmentProgressPct(r) {
    const total = r.lines.length;
    if (!total) return 0;
    const done = r.lines.filter(
      (l) => (l.replenished && l.code) || l.removed === true || l.exception === true
    ).length;
    return Math.round((done / total) * 100);
  }

  function countRemovedInReplenishment(r) {
    if (!r || !r.lines) return 0;
    return r.lines.filter((l) => l.removed === true).length;
  }

  function countExceptionsInReplenishment(r) {
    if (!r || !r.lines) return 0;
    return r.lines.filter((l) => l.exception === true).length;
  }

  function getDocumentListClosedLabel(doc) {
    if (!doc || doc.isLanding) return "";
    if (doc.status === "Completed") return "Task Complete";
    if (doc.merchandising) return "Close gap";
    if (doc.replenishment && !doc.replenishment.readOnly) return "Replenish Articles";
    return doc.closedLabel || "—";
  }

  function formatLoeFromMs(entry) {
    if (!entry) return "—";
    if (entry.loeDisplay) return entry.loeDisplay;
    const start = entry.taskStartedAtMs;
    const end = entry.taskCompletedAtMs;
    if (!start || !end || end < start) return "—";
    const ms = end - start;
    const m = Math.floor(ms / 60000);
    const h = Math.floor(m / 60);
    const min = m % 60;
    if (h > 0) return `${h}h ${min}m`;
    return `${Math.max(1, m)} min`;
  }

  function buildCompletedDetailTable(entry) {
    const out = JSON.parse(JSON.stringify(entry.closeGapRows || []));
    const r = entry.replenishment;
    if (r && r.lines) {
      r.lines
        .filter((l) => l.exception === true)
        .forEach((line) => {
          out.push({
            article: line.gtin || "",
            articleName: line.name || "",
            isException: true,
            quantity: "",
            from: "",
            to: "",
            status: "Exception",
          });
        });
    }
    return out;
  }

  function setSummaryReplenishArticles(r, entry) {
    const pct = replenishmentProgressPct(r);
    const nArticles = r.lines ? r.lines.length : 0;
    const nRemoved = countRemovedInReplenishment(r);
    const nExc = countExceptionsInReplenishment(r);
    const woId = entry && entry.id ? entry.id : "—";
    els.detailSummary.innerHTML = `
      <div class="detail__summary-head">Info</div>
      <div class="detail__summary-grid detail__summary-grid--replenish">
        <ul class="detail__summary-col">
          <li class="detail__summary-woid">${escapeHtml(woId)}</li>
          <li>Number of Articles : <span>${escapeHtml(String(nArticles))}</span></li>
          <li>Progress : <span>${escapeHtml(String(pct))}%</span></li>
        </ul>
        <ul class="detail__summary-col detail__summary-col--right">
          <li>#Articles Replenished : <span>${escapeHtml(String(nRemoved))}</span></li>
          <li>Exceptions : <span>${escapeHtml(String(nExc))}</span></li>
        </ul>
      </div>
    `;
  }

  function setSummaryTaskCompletePhase(entry) {
    const r = entry.replenishment;
    const total = r && r.lines ? r.lines.length : 0;
    const gapsFilled = (entry.closeGapRows && entry.closeGapRows.length) || 0;
    const exceptions = countExceptionsInReplenishment(r);
    const loe = formatLoeFromMs(entry);
    els.detailSummary.innerHTML = `
      <div class="detail__summary-grid">
        <ul class="detail__summary-col">
          <li>Total articles: <span>${escapeHtml(String(total))}</span></li>
          <li>LOE: <span>${escapeHtml(loe)}</span></li>
        </ul>
        <ul class="detail__summary-col">
          <li>Gaps filled: <span>${escapeHtml(String(gapsFilled))}</span></li>
          <li>Exceptions: <span>${escapeHtml(String(exceptions))}</span></li>
        </ul>
      </div>
    `;
  }

  function setSummaryCreate(doc) {
    els.detailSummary.innerHTML = `
      <li>Number of Articles : <span>${escapeHtml(String(doc.articles))}</span></li>
      <li>Articles with no stock : <span>${escapeHtml(String(doc.noStock))}</span></li>
      <li>+12 Hours Gaps : <span>${escapeHtml(String(doc.gaps12h))}</span></li>
    `;
  }

  function setSummaryPlaceholder() {
    els.detailSummary.innerHTML = `
      <li>Number of Articles : <span>—</span></li>
      <li>Articles with no stock : <span>—</span></li>
      <li>+12 Hours Gaps : <span>—</span></li>
    `;
  }

  function renderMaster(filter) {
    const q = (filter || "").trim().toLowerCase();
    els.masterList.innerHTML = "";
    documents.forEach((doc) => {
      if (doc.isLanding) {
        if (q && !doc.label.toLowerCase().includes(q)) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "doc-item doc-item--action" + (doc.id === selectedId ? " is-selected" : "");
        btn.textContent = doc.label;
        btn.addEventListener("click", () => {
          selectedId = doc.id;
          renderMaster(els.docSearch.value);
          renderDetail();
        });
        els.masterList.appendChild(btn);
        return;
      }
      if (q && !doc.id.toLowerCase().includes(q)) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "doc-item" + (doc.id === selectedId ? " is-selected" : "");
      let statusClass = "badge-muted";
      if (doc.statusType === "success") statusClass = "badge-success";
      else if (doc.statusType === "progress") statusClass = "badge-progress";

      btn.innerHTML = `
        <div class="doc-item__row1">
          <span class="doc-item__id">${escapeHtml(doc.id)}</span>
          <div class="doc-item__badges">
            <span class="badge-muted">${escapeHtml(getDocumentListClosedLabel(doc))}</span>
            <span class="${statusClass}">${escapeHtml(doc.status)}</span>
          </div>
        </div>
        <div class="doc-item__meta">${escapeHtml(doc.date)}</div>
      `;
      btn.addEventListener("click", () => {
        selectedId = doc.id;
        renderMaster(els.docSearch.value);
        renderDetail();
      });
      els.masterList.appendChild(btn);
    });
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function parseSohFromLoc(loc) {
    if (!loc) return 0;
    const rows = String(loc)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const s001 = rows.find((row) => row.includes("|") && row.split("|")[1].includes("S001"));
    if (s001) {
      const qty = parseInt(s001.split("|")[0].trim(), 10);
      return Number.isFinite(qty) ? qty : 0;
    }

    const first = rows[0] || "";
    const qty = parseInt(first.split("|")[0].trim(), 10);
    return Number.isFinite(qty) ? qty : 0;
  }

  function formatDdMmYyyy(input) {
    const s = String(input || "").trim();
    if (!s) return "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
    const m = s.match(/^(\d{2})\/(\d{2})/);
    if (m) return `${m[1]}/${m[2]}/2026`;
    return s;
  }

  function openArticleModal(line) {
    const m = line.articleModal;
    if (!m) return;

    els.modalProduct.textContent = m.productTitle;
    els.modalArticleNum.textContent = m.articleNumber;
    els.modalGtin.textContent = m.gtin;

    els.modalStockHand.innerHTML = "";
    if (m.stockOnHandLines && m.stockOnHandLines.length) {
      m.stockOnHandLines.forEach((text) => {
        const p = document.createElement("p");
        p.className = "modal__stock-line";
        p.textContent = text;
        els.modalStockHand.appendChild(p);
      });
    }

    els.modalOrderDate.textContent = m.lastOrderDate || "";
    els.modalOrderQty.textContent = m.quantity || "";
    els.modalOrderEdd.textContent = m.expectedDeliveryDate || "";

    els.modalBackdrop.hidden = false;
    els.modalBackdrop.setAttribute("aria-hidden", "false");
    els.modalClose.focus();
  }

  function normalizeDdMm(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const digits = raw.replace(/[^\d]/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function openRemoveArticleModal(line) {
    if (!line) return;
    removeLineKey = line.key || null;
    els.removeLocation.value = "";
    els.removeGtin.value = "";
    els.removeQty.value = "";
    els.removeExp.value = "";
    els.removeBackdrop.hidden = false;
    els.removeBackdrop.setAttribute("aria-hidden", "false");
    els.removeLocation.focus();
  }

  function closeRemoveArticleModal() {
    removeLineKey = null;
    els.removeBackdrop.hidden = true;
    els.removeBackdrop.setAttribute("aria-hidden", "true");
  }

  function hideRemoveArticleModalKeepKey() {
    els.removeBackdrop.hidden = true;
    els.removeBackdrop.setAttribute("aria-hidden", "true");
  }

  function getSelectedReasonValue() {
    const checked = document.querySelector('input[name="anf-reason"]:checked');
    return checked ? checked.value : "";
  }

  function clearSelectedReason() {
    document
      .querySelectorAll('input[name="anf-reason"]')
      .forEach((el) => (el.checked = false));
  }

  function syncAnfLocationVisibility() {
    const reason = getSelectedReasonValue();
    const needsLocation = reason === "Damaged Stock" || reason === "Exp Stock";
    els.anfLocationField.hidden = !needsLocation;
  }

  function openArticleNotFoundModal() {
    els.anfLocation.value = "";
    clearSelectedReason();
    syncAnfLocationVisibility();
    els.anfBackdrop.hidden = false;
    els.anfBackdrop.setAttribute("aria-hidden", "false");
    const first = document.querySelector('input[name="anf-reason"]');
    if (first) first.focus();
  }

  function closeArticleNotFoundModal() {
    els.anfBackdrop.hidden = true;
    els.anfBackdrop.setAttribute("aria-hidden", "true");
  }

  function openErrorModal(title, message) {
    const titleEl = document.getElementById("error-title");
    const msgEl = document.getElementById("error-message");
    if (titleEl) titleEl.textContent = title != null ? title : "Error";
    if (msgEl) msgEl.textContent = message != null ? message : "Task not finished";
    els.errorBackdrop.hidden = false;
    els.errorBackdrop.setAttribute("aria-hidden", "false");
    els.errorClose.focus();
  }

  function closeErrorModal() {
    const titleEl = document.getElementById("error-title");
    const msgEl = document.getElementById("error-message");
    if (titleEl) titleEl.textContent = "Error";
    if (msgEl) msgEl.textContent = "Task not finished";
    els.errorBackdrop.hidden = true;
    els.errorBackdrop.setAttribute("aria-hidden", "true");
  }

  function formatStockLineWithBestBefore(text, bestBefore) {
    const bb = normalizeDdMm(bestBefore);
    if (!bb) return text;
    return `${text} • BB: ${bb}`;
  }

  function openReplViewModal(line) {
    if (!line) return;
    const withBb = (line.stockOnHandLines || []).map((t, i) =>
      formatStockLineWithBestBefore(t, (line.bestBeforeByIndex || [])[i])
    );
    openArticleModal({
      articleModal: {
        productTitle: line.productTitle || line.name || "",
        articleNumber: line.articleNum || "",
        gtin: line.gtin || "",
        stockOnHandLines: withBb,
        lastOrderDate: "",
        quantity: "",
        expectedDeliveryDate: "",
      },
    });
  }

  function closeArticleModal() {
    els.modalBackdrop.hidden = true;
    els.modalBackdrop.setAttribute("aria-hidden", "true");
  }

  const CLOSE_GAP_FROM_FALLBACK = "Storage";
  const CLOSE_GAP_TO = "Aisle 1 | Shelf 1";

  /**
   * Close Gap may only scan GTINs that were removed via Remove Article (removed + removedMeta with quantity flow).
   * Value = number of Close Gap rows still required for that GTIN (supports duplicate GTINs on multiple lines).
   */
  function getCloseGapQuotaByGtin(entry) {
    const map = new Map();
    const r = entry ? getReplenishmentPayload(entry) : null;
    if (!r || !r.lines) return map;
    r.lines.forEach((l) => {
      if (l.removed === true && l.removedMeta && l.gtin) {
        const g = l.gtin;
        map.set(g, (map.get(g) || 0) + 1);
      }
    });
    return map;
  }

  function countCloseGapSavedForGtin(merch, gtin) {
    if (!merch || !merch.rows || !gtin) return 0;
    return merch.rows.filter((row) => row.article === gtin).length;
  }

  /** @returns {"not_in_task"|"already_done"|null} */
  function closeGapScanRejectedReason(entry, merch, gtin) {
    const g = String(gtin || "").trim();
    if (!g) return "not_in_task";
    const quota = getCloseGapQuotaByGtin(entry);
    if (!quota.has(g)) return "not_in_task";
    const need = quota.get(g);
    const have = countCloseGapSavedForGtin(merch, g);
    if (have >= need) return "already_done";
    return null;
  }

  function isCloseGapTaskComplete(entry, merch) {
    const quota = getCloseGapQuotaByGtin(entry);
    if (!quota.size) return false;
    for (const [g, need] of quota.entries()) {
      if (countCloseGapSavedForGtin(merch, g) < need) return false;
    }
    return true;
  }

  function getCloseGapRequiredTotal(entry) {
    const map = getCloseGapQuotaByGtin(entry);
    let t = 0;
    map.forEach((v) => {
      t += v;
    });
    return t;
  }

  function setSummaryCloseGapPhase(entry, merch) {
    const r = entry.replenishment;
    const taskTotal = r && r.lines && r.lines.length ? r.lines.length : 1;
    const required = getCloseGapRequiredTotal(entry);
    const rows = (merch && merch.rows) || [];
    const scanned = rows.length;
    const filled = rows.filter((x) => x.status === "Filled in full").length;
    const limited = rows.filter((x) => x.status === "Limited stock").length;
    const pctFilled = taskTotal ? Math.round((filled / taskTotal) * 100) : 0;
    const pctLimited = taskTotal ? Math.round((limited / taskTotal) * 100) : 0;
    els.detailSummary.innerHTML = `
      <div class="detail__summary-grid detail__summary-grid--closegap">
        <ul class="detail__summary-col detail__summary-col--full">
          <li>Gaps closed: <span>${escapeHtml(String(scanned))}</span> OF <span>${escapeHtml(
      String(required)
    )}</span></li>
          <li>Filled in full: <span>${escapeHtml(String(filled))}</span> (<span>${escapeHtml(
      String(pctFilled)
    )}</span>%)</li>
          <li>Limited stock: <span>${escapeHtml(String(limited))}</span> (<span>${escapeHtml(
      String(pctLimited)
    )}</span>%)</li>
        </ul>
      </div>
    `;
  }

  function openCloseGapScanErrorModal() {
    els.closeGapScanErrorBackdrop.hidden = false;
    els.closeGapScanErrorBackdrop.setAttribute("aria-hidden", "false");
    els.closeGapScanErrorClose.focus();
  }

  function closeCloseGapScanErrorModal() {
    els.closeGapScanErrorBackdrop.hidden = true;
    els.closeGapScanErrorBackdrop.setAttribute("aria-hidden", "true");
  }

  function openTaskCompleteModal() {
    els.taskCompleteBackdrop.hidden = false;
    els.taskCompleteBackdrop.setAttribute("aria-hidden", "false");
    els.taskCompleteClose.focus();
  }

  function closeTaskCompleteModal() {
    els.taskCompleteBackdrop.hidden = true;
    els.taskCompleteBackdrop.setAttribute("aria-hidden", "true");
  }

  function validateAndOpenCloseGapFillModal(entry, merch, gtin) {
    const g = String(gtin || "").trim();
    if (!g) return false;
    const reason = closeGapScanRejectedReason(entry, merch, g);
    if (reason === "not_in_task") {
      openCloseGapScanErrorModal();
      return false;
    }
    if (reason === "already_done") {
      showToast("Already scanned for this task");
      return false;
    }
    openFillModal(g);
    return true;
  }

  /** "From" on Close Gap = location scanned/entered on Remove Article for that GTIN, when available. */
  function getCloseGapFromLocation(entry, gtin) {
    const r = entry ? getReplenishmentPayload(entry) : null;
    if (!r || !r.lines || !gtin) return CLOSE_GAP_FROM_FALLBACK;
    const line = r.lines.find(
      (l) =>
        l.gtin === gtin &&
        l.removed === true &&
        l.removedMeta &&
        String(l.removedMeta.location || "").trim()
    );
    if (line) return String(line.removedMeta.location).trim();
    return CLOSE_GAP_FROM_FALLBACK;
  }

  function clearFillGapRadios() {
    document.querySelectorAll('input[name="fill-gap-status"]').forEach((el) => {
      el.checked = false;
    });
  }

  function getFillGapStatus() {
    const checked = document.querySelector('input[name="fill-gap-status"]:checked');
    return checked ? checked.value : "";
  }

  function openFillModal(gtin) {
    pendingMerchGtin = String(gtin || "").trim();
    if (!pendingMerchGtin) return;
    pendingMerchName = "";
    const entry = getSelectedEntry();
    const repl = entry ? getReplenishmentPayload(entry) : null;
    const match = repl ? repl.lines.find((l) => l.gtin === pendingMerchGtin) : null;
    if (match && match.name) pendingMerchName = match.name;
    const displayArticle = pendingMerchName || pendingMerchGtin;
    if (els.fillModalArticleName) els.fillModalArticleName.textContent = displayArticle;
    clearFillGapRadios();
    els.fillBackdrop.hidden = false;
    els.fillBackdrop.setAttribute("aria-hidden", "false");
    const firstRadio = document.querySelector('input[name="fill-gap-status"]');
    if (firstRadio) firstRadio.focus();
  }

  function closeFillModal() {
    pendingMerchGtin = "";
    pendingMerchName = "";
    clearFillGapRadios();
    els.fillBackdrop.hidden = true;
    els.fillBackdrop.setAttribute("aria-hidden", "true");
  }

  function isCodeAllowedForReplenished(rep, code) {
    if (!rep || !code) return false;
    if (rep === "Yes") return REPLENISHED_YES_CODES.includes(code);
    if (rep === "No") return REPLENISHED_NO_CODES.includes(code);
    return false;
  }

  function syncReplCodeOptions() {
    const rep = els.replValue.value;
    if (!rep) {
      els.replCode.disabled = true;
      fillSelect(els.replCode, [], "Select…");
      return;
    }
    const opts = rep === "Yes" ? REPLENISHED_YES_CODES : REPLENISHED_NO_CODES;
    els.replCode.disabled = false;
    fillSelect(els.replCode, opts, "Select…");
  }

  function closeReplSelectModal() {
    replSelectLineKey = null;
    els.replSelectBackdrop.hidden = true;
    els.replSelectBackdrop.setAttribute("aria-hidden", "true");
  }

  function openReplSelectModal(lineKey) {
    const entry = getSelectedEntry();
    const r = getReplenishmentPayload(entry);
    if (r && r.readOnly) return;
    const line = r && r.lines.find((l) => l.key === lineKey);
    if (!line) return;

    replSelectLineKey = lineKey;

    els.replModalProduct.textContent = line.productTitle || line.name;
    els.replModalArticleNum.textContent = line.articleNum || "";
    els.replModalGtin.textContent = line.gtin || "";
    els.replModalLocation.textContent = line.location || "";

    els.replValue.value = line.replenished || "";
    syncReplCodeOptions();
    if (line.code && isCodeAllowedForReplenished(line.replenished, line.code)) {
      els.replCode.value = line.code;
    }

    els.replSelectBackdrop.hidden = false;
    els.replSelectBackdrop.setAttribute("aria-hidden", "false");
    els.replValue.focus();
  }

  function saveReplSelection() {
    const entry = getSelectedEntry();
    const rNow = getReplenishmentPayload(entry);
    if (rNow && rNow.readOnly) {
      closeReplSelectModal();
      return;
    }

    const rep = els.replValue.value;
    const code = els.replCode.value;
    if (!rep) {
      showToast("Select Replenished (Yes or No)");
      return;
    }
    if (!code) {
      showToast("Select a Code");
      return;
    }
    if (!isCodeAllowedForReplenished(rep, code)) {
      showToast("Code does not match Replenished — check ReplenishedCodes");
      return;
    }

    const r = getReplenishmentPayload(entry);
    const line = r && r.lines.find((l) => l.key === replSelectLineKey);
    if (!line) {
      closeReplSelectModal();
      return;
    }

    line.replenished = rep;
    line.code = code;
    closeReplSelectModal();
    renderDetail();
    showToast("Replenishment saved");
  }

  function fillSelect(select, valueList, placeholder) {
    select.innerHTML = "";
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = placeholder;
    select.appendChild(ph);
    valueList.forEach((v) => {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = v;
      select.appendChild(o);
    });
  }

  function syncDepartmentOptions() {
    const div = els.filterDivision.value;
    const depts =
      div && FILTER_HIERARCHY[div] ? Object.keys(FILTER_HIERARCHY[div]) : [];
    fillSelect(els.filterDepartment, depts, "Select…");
  }

  function syncBmcOptions() {
    const div = els.filterDivision.value;
    const dep = els.filterDepartment.value;
    const bmcs =
      div && dep && FILTER_HIERARCHY[div] && FILTER_HIERARCHY[div][dep]
        ? FILTER_HIERARCHY[div][dep]
        : [];
    fillSelect(els.filterBmc, bmcs, "Select…");
  }

  function optionExists(select, value) {
    if (!value) return false;
    return Array.from(select.options).some((o) => o.value === value);
  }

  function openFilterModal() {
    const f = appliedArticleFilter;

    fillSelect(els.filterScanner, GAP_SCANNER_NAMES, "Select…");
    if (f.scanner && GAP_SCANNER_NAMES.includes(f.scanner)) {
      els.filterScanner.value = f.scanner;
    }

    fillSelect(els.filterDivision, Object.keys(FILTER_HIERARCHY), "Select…");
    if (f.division && FILTER_HIERARCHY[f.division]) {
      els.filterDivision.value = f.division;
    }

    syncDepartmentOptions();
    if (f.department && optionExists(els.filterDepartment, f.department)) {
      els.filterDepartment.value = f.department;
    }

    syncBmcOptions();
    if (f.bmc && optionExists(els.filterBmc, f.bmc)) {
      els.filterBmc.value = f.bmc;
    }

    els.filterBackdrop.hidden = false;
    els.filterBackdrop.setAttribute("aria-hidden", "false");
    els.filterExecute.focus();
  }

  function closeFilterModal() {
    els.filterBackdrop.hidden = true;
    els.filterBackdrop.setAttribute("aria-hidden", "true");
  }

  function renderCreateDetail(doc) {
    els.detailTitle.textContent = "Create New";
    setSummaryCreate(doc);

    const allowSelection = hasAppliedArticleFilter;
    const aq = (els.articleSearch.value || "").trim().toLowerCase();
    visibleLines = doc.lines.filter(
      (l) =>
        !aq ||
        l.name.toLowerCase().includes(aq) ||
        l.article.includes(aq) ||
        l.gtin.includes(aq)
    );

    els.articleList.classList.remove("article-list--replenishment");
    els.articleList.innerHTML = "";
    visibleLines.forEach((line, idx) => {
      const row = document.createElement("div");
      row.className = "article-row" + (line.error ? " is-error" : "");
      const selectable = line.selectable !== false;
      const checkCol = selectable
        ? allowSelection
          ? `<input type="checkbox" class="row-check js-row-check" data-idx="${idx}" aria-label="Select ${escapeHtml(line.name)}" />`
          : `<span class="article-row__check-spacer" aria-hidden="true"></span>`
        : `<span class="article-row__check-spacer" aria-hidden="true"></span>`;

      const soh = parseSohFromLoc(line.loc);
      const showSoo = soh === 0;
      const createdAt = showSoo ? formatDdMmYyyy(line.createdAt || line.time) : "";

      row.innerHTML = `
        <div class="article-row__id">
          <strong>${escapeHtml(line.docId)}</strong>
          <div class="article-row__time">${escapeHtml(line.time)}</div>
        </div>
        <div class="article-row__mid">
          <div class="article-row__name">${escapeHtml(line.name)}</div>
          <div class="article-row__sub-lines">
            <div class="article-row__sub">GTIN: ${escapeHtml(line.gtin)}</div>
          </div>
        </div>
        <div class="article-row__loc">
          <div class="article-row__sub">SOH: ${escapeHtml(String(soh))}</div>
          ${
            showSoo
              ? `<div class="article-row__sub">SOO: 200</div>
                 <div class="article-row__sub">Created at: ${escapeHtml(createdAt)}</div>`
              : ""
          }
        </div>
        ${checkCol}
      `;
      els.articleList.appendChild(row);
    });

    if (!allowSelection) {
      showToast("Apply a filter to enable selection");
    }
  }

  function renderReplenishmentDetail(r, entry) {
    setSummaryReplenishArticles(r, entry);

    const aq = (els.articleSearch.value || "").trim().toLowerCase();
    const lines = r.lines.filter(
      (l) =>
        !aq ||
        l.name.toLowerCase().includes(aq) ||
        (l.articleLine && l.articleLine.toLowerCase().includes(aq))
    );

    els.articleList.classList.add("article-list--replenishment");
    els.articleList.innerHTML = "";

    const header = document.createElement("div");
    header.className = "repl-header";
    header.innerHTML = `
      <div class="repl-header__cell">Article</div>
      <div class="repl-header__cell">Location:SOH</div>
      <div class="repl-header__cell"></div>
    `;
    els.articleList.appendChild(header);

    const sorted = [...lines].sort((a, b) => {
      const ar = a.removed === true ? 1 : 0;
      const br = b.removed === true ? 1 : 0;
      const ae = a.exception === true ? 1 : 0;
      const be = b.exception === true ? 1 : 0;
      const aScore = ar + ae;
      const bScore = br + be;
      return aScore - bScore;
    });

    sorted.forEach((line) => {
      const row = document.createElement("div");
      row.className =
        "repl-row" +
        (line.removed === true ? " is-removed" : "") +
        (line.exception === true ? " is-exception" : "");

      const stockLines =
        line.stockOnHandLines && line.stockOnHandLines.length
          ? line.stockOnHandLines
          : [];
      const stockHtml = stockLines.length
        ? stockLines
            .map((s) => `<div class="repl-row__stock-line">${escapeHtml(s)}</div>`)
            .join("")
        : ``;

      row.innerHTML = `
        <div class="repl-row__name">
          ${escapeHtml(line.name)}
          <div class="repl-row__gtin">GTIN: ${escapeHtml(line.gtin || "")}</div>
        </div>
        <div class="repl-row__location">
          <div class="repl-row__stock">${stockHtml}</div>
        </div>
        <div class="repl-row__status">
          ${
            line.removed === true
              ? `<span class="repl-row__status-removed">Removed</span>`
              : line.exception === true
                ? `<span class="repl-row__status-exception">Exception</span>`
              : `<button type="button" class="link-like js-repl-view" data-line-key="${escapeHtml(
                  line.key
                )}">View</button>`
          }
        </div>
      `;
      row.addEventListener("click", (e) => {
        if (line.removed === true || line.exception === true) return;
        const target = e.target;
        if (target && target.closest && target.closest(".js-repl-view")) return;
        openRemoveArticleModal(line);
      });
      els.articleList.appendChild(row);
    });

    els.articleList.querySelectorAll(".js-repl-view").forEach((b) => {
      b.addEventListener("click", () => {
        b.blur();
        const key = b.getAttribute("data-line-key");
        const line = key ? sorted.find((l) => l.key === key) : null;
        if (line && line.removed !== true && line.exception !== true) openReplViewModal(line);
      });
    });
  }

  function renderMerchTableRows(body, rows) {
    if (!body) return;
    body.innerHTML = "";
    (rows || []).forEach((row) => {
      const tr = document.createElement("tr");
      if (row.isException === true) {
        tr.className = "merch__row-exception";
        tr.innerHTML = `
          <td>${escapeHtml(row.articleName || row.article || "")}</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td><span class="merch__status-exception">${escapeHtml(row.status || "Exception")}</span></td>
        `;
        body.appendChild(tr);
        return;
      }
      const statusClass =
        row.status === "Filled in full" ? "merch__status-full" : "merch__status-limited";
      tr.innerHTML = `
        <td>${escapeHtml(row.articleName || row.article || "")}</td>
        <td>${escapeHtml(String(row.quantity))}</td>
        <td>${escapeHtml(row.from)}</td>
        <td>${escapeHtml(row.to)}</td>
        <td><span class="${statusClass}">${escapeHtml(row.status)}</span></td>
      `;
      body.appendChild(tr);
    });
  }

  function merchTableShell(tbodyId) {
    return `
      <table class="merch__table">
        <thead>
          <tr>
            <th>Article:</th>
            <th>Quantity:</th>
            <th>From:</th>
            <th>To :</th>
            <th>Status:</th>
          </tr>
        </thead>
        <tbody id="${tbodyId}"></tbody>
      </table>
    `;
  }

  /** Completed WO — same Close Gap table as active step; no scan or other actions. */
  function renderCloseGapReadOnly(entry) {
    els.detailTitle.textContent = "Task Complete";
    setSummaryTaskCompletePhase(entry);
    const tableRows = buildCompletedDetailTable(entry);
    els.articleList.classList.remove("article-list--replenishment");
    els.articleList.innerHTML = `
      <div class="merch merch--readonly">
        ${merchTableShell("merch-body-readonly")}
      </div>
    `;
    const body = document.getElementById("merch-body-readonly");
    renderMerchTableRows(body, tableRows);
  }

  function renderMerchandising(entry, merch) {
    els.detailTitle.textContent = "Close Gap";
    setSummaryCloseGapPhase(entry, merch);

    els.articleList.classList.remove("article-list--replenishment");
    els.articleList.innerHTML = `
      <div class="merch">
        <div class="merch__toolbar">
          <span class="merch__toolbar-label">Scan GTIN</span>
          <input id="merch-scan" class="merch__scan" type="text" autocomplete="off" placeholder="Scan GTIN" />
        </div>
        ${merchTableShell("merch-body")}
      </div>
    `;

    const scan = document.getElementById("merch-scan");
    const body = document.getElementById("merch-body");

    function renderRows() {
      renderMerchTableRows(body, merch.rows);
      setSummaryCloseGapPhase(entry, merch);
    }

    scan.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const gtin = (scan.value || "").trim();
      if (!gtin) return;
      scan.value = "";
      const opened = validateAndOpenCloseGapFillModal(entry, merch, gtin);
      if (!opened) scan.focus();
    });

    renderRows();
    scan.focus();

    // Expose a callback for the fill modal to append rows.
    merch._renderRows = renderRows;
  }

  function renderDetail() {
    const entry = getSelectedEntry();
    updateFooter(entry);

    const merch = getMerchandisingPayload(entry);
    if (merch) {
      renderMerchandising(entry, merch);
      return;
    }

    const createDoc = getDetailPayload(entry);
    if (createDoc) {
      renderCreateDetail(createDoc);
      return;
    }

    if (
      entry &&
      entry.status === "Completed" &&
      Array.isArray(entry.closeGapRows)
    ) {
      renderCloseGapReadOnly(entry);
      return;
    }

    const repl = getReplenishmentPayload(entry);
    if (repl) {
      els.detailTitle.textContent = "Replenish Articles";
      renderReplenishmentDetail(repl, entry);
      return;
    }

    els.detailTitle.textContent = entry ? entry.id : "Detail Page";
    setSummaryPlaceholder();
    els.articleList.classList.remove("article-list--replenishment");
    els.articleList.innerHTML =
      '<p class="detail-placeholder">Article lines are available on <strong>Create New</strong>.</p>';
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => els.toast.classList.remove("is-visible"), 2200);
  }

  els.modalClose.addEventListener("click", closeArticleModal);
  els.modalBackdrop.addEventListener("click", (e) => {
    if (e.target === els.modalBackdrop) closeArticleModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (els.taskCompleteBackdrop && !els.taskCompleteBackdrop.hidden) {
      closeTaskCompleteModal();
      const scan = document.getElementById("merch-scan");
      if (scan) scan.focus();
      return;
    }
    if (els.closeGapScanErrorBackdrop && !els.closeGapScanErrorBackdrop.hidden) {
      closeCloseGapScanErrorModal();
      const scan = document.getElementById("merch-scan");
      if (scan) scan.focus();
      return;
    }
    if (els.errorBackdrop && !els.errorBackdrop.hidden) {
      closeErrorModal();
      return;
    }
    if (els.fillBackdrop && !els.fillBackdrop.hidden) {
      closeFillModal();
      const scan = document.getElementById("merch-scan");
      if (scan) scan.focus();
      return;
    }
    if (els.anfBackdrop && !els.anfBackdrop.hidden) {
      closeArticleNotFoundModal();
      return;
    }
    if (els.removeBackdrop && !els.removeBackdrop.hidden) {
      closeRemoveArticleModal();
      return;
    }
    if (!els.replSelectBackdrop.hidden) {
      closeReplSelectModal();
      return;
    }
    if (!els.filterBackdrop.hidden) {
      closeFilterModal();
      return;
    }
    if (!els.modalBackdrop.hidden) closeArticleModal();
  });

  els.docSearch.addEventListener("input", () => renderMaster(els.docSearch.value));
  els.articleSearch.addEventListener("input", renderDetail);

  els.btnSelectAll.addEventListener("click", () => {
    const entry = getSelectedEntry();
    if (getDetailPayload(entry) && !hasAppliedArticleFilter) {
      showToast("Filter articles first to enable selection");
      return;
    }
    const checks = els.articleList.querySelectorAll(".js-row-check");
    if (!checks.length) {
      showToast("No rows to select");
      return;
    }
    const allOn = Array.from(checks).every((c) => c.checked);
    checks.forEach((c) => {
      c.checked = !allOn;
    });
    showToast(allOn ? "Cleared selection" : "Selected all visible rows");
  });

  els.btnSave.addEventListener("click", () => {
    const createDoc = getDetailPayload(getSelectedEntry());
    if (!createDoc) return;
    if (!hasAppliedArticleFilter) {
      showToast("Filter articles first to enable selection");
      return;
    }

    const n = els.articleList.querySelectorAll(".js-row-check:checked").length;
    if (n === 0) {
      showToast("Select at least one article to save");
      return;
    }

    if (documents.some((d) => d.id === "WO00000013")) {
      showToast("WO00000013 already exists — open it from Documents List");
      return;
    }

    documents.splice(1, 0, buildWo13Document());
    selectedId = "WO00000013";
    els.articleSearch.value = "";
    renderMaster(els.docSearch.value);
    renderDetail();
    showToast(`Saved — ${n} article(s) — WO00000013 In Progress`);
  });

  els.btnCloseTask.addEventListener("click", () => {
    const entry = getSelectedEntry();
    if (
      !entry ||
      entry.id !== "WO00000013" ||
      !entry.replenishment ||
      entry.replenishment.readOnly
    ) {
      showToast("Close — prototype");
      return;
    }

    // Close Gap step: footer Close requires every removed (quantity) article scanned.
    if (entry.merchandising) {
      if (!isCloseGapTaskComplete(entry, entry.merchandising)) {
        openErrorModal("ERROR", "Task not finished");
        return;
      }
      entry.closeGapRows = JSON.parse(JSON.stringify(entry.merchandising.rows || []));
      delete entry.merchandising;
      finalizeWo13Close();
      return;
    }

    const pct = replenishmentProgressPct(entry.replenishment);
    if (pct !== 100) {
      openErrorModal();
      return;
    }
    entry.merchandising = { rows: [] };
    renderDetail();
  });

  els.btnRefreshDocs.addEventListener("click", () => showToast("Documents refreshed (prototype)"));
  els.btnRefreshArticles.addEventListener("click", () => showToast("Articles refreshed (prototype)"));

  document.getElementById("btn-filter-docs").addEventListener("click", () =>
    showToast("Filter documents (prototype)")
  );

  els.filterDivision.addEventListener("change", () => {
    syncDepartmentOptions();
    syncBmcOptions();
  });
  els.filterDepartment.addEventListener("change", () => {
    syncBmcOptions();
  });

  els.filterCancel.addEventListener("click", closeFilterModal);
  els.filterBackdrop.addEventListener("click", (e) => {
    if (e.target === els.filterBackdrop) closeFilterModal();
  });
  els.filterExecute.addEventListener("click", () => {
    appliedArticleFilter = {
      scanner: els.filterScanner.value,
      division: els.filterDivision.value,
      department: els.filterDepartment.value,
      bmc: els.filterBmc.value,
    };
    hasAppliedArticleFilter = true;
    closeFilterModal();
    const parts = [
      appliedArticleFilter.scanner && `Scanner: ${appliedArticleFilter.scanner}`,
      appliedArticleFilter.division && `Division: ${appliedArticleFilter.division}`,
      appliedArticleFilter.department &&
        `Department: ${appliedArticleFilter.department}`,
      appliedArticleFilter.bmc && `BMC: ${appliedArticleFilter.bmc}`,
    ].filter(Boolean);
    showToast(
      parts.length
        ? `Filter applied — ${parts.join(" · ")}`
        : "Filter applied (no criteria selected)"
    );
    renderDetail();
  });

  document.getElementById("btn-filter-articles").addEventListener("click", () => {
    const entry = getSelectedEntry();
    if (!entry) return;
    const repl = getReplenishmentPayload(entry);
    if (repl && repl.readOnly) {
      showToast("Filter is not available for completed replenishment");
      return;
    }
    if (getDetailPayload(entry) || repl) {
      openFilterModal();
      return;
    }
    showToast("Filter is only available on Create New or an active replenishment task");
  });

  els.replValue.addEventListener("change", () => {
    syncReplCodeOptions();
  });
  els.replSelectCancel.addEventListener("click", closeReplSelectModal);
  els.replSelectBackdrop.addEventListener("click", (e) => {
    if (e.target === els.replSelectBackdrop) closeReplSelectModal();
  });
  els.replSelectSave.addEventListener("click", saveReplSelection);

  els.removeExp.addEventListener("input", () => {
    const next = normalizeDdMm(els.removeExp.value);
    if (next !== els.removeExp.value) els.removeExp.value = next;
  });
  els.removeCancel.addEventListener("click", closeRemoveArticleModal);
  els.removeBackdrop.addEventListener("click", (e) => {
    if (e.target === els.removeBackdrop) closeRemoveArticleModal();
  });
  els.removeConfirm.addEventListener("click", () => {
    const loc = (els.removeLocation.value || "").trim();
    const gtin = (els.removeGtin.value || "").trim();
    const qty = (els.removeQty.value || "").trim();
    const bb = normalizeDdMm(els.removeExp.value);
    if (!loc) {
      showToast("Enter location");
      return;
    }
    if (!gtin) {
      showToast("Scan GTIN");
      return;
    }
    if (!qty) {
      showToast("Enter quantity");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(bb)) {
      showToast("Enter Exp/Best before as DD/MM");
      return;
    }
    const entry = getSelectedEntry();
    const r = entry ? getReplenishmentPayload(entry) : null;
    const line = r && removeLineKey ? r.lines.find((l) => l.key === removeLineKey) : null;
    if (!line) {
      showToast("Line not found");
      return;
    }
    const lineGtin = String(line.gtin || "").trim();
    if (!lineGtin) {
      showToast("This line has no GTIN");
      return;
    }
    if (gtin !== lineGtin) {
      showToast("GTIN does not match this article");
      return;
    }
    line.removed = true;
    line.removedMeta = { location: loc, gtin: lineGtin, qty, bestBefore: bb };
    closeRemoveArticleModal();
    renderDetail();
    showToast("Removed");
  });

  els.removeBin.addEventListener("click", () => {
    // Keep the current row key so "Article Not Found" can mark the same row as Exception.
    hideRemoveArticleModalKeepKey();
    openArticleNotFoundModal();
  });

  document.querySelectorAll('input[name="anf-reason"]').forEach((el) => {
    el.addEventListener("change", () => {
      syncAnfLocationVisibility();
      if (!els.anfLocationField.hidden) els.anfLocation.focus();
    });
  });
  els.anfCancel.addEventListener("click", closeArticleNotFoundModal);
  els.anfBackdrop.addEventListener("click", (e) => {
    if (e.target === els.anfBackdrop) closeArticleNotFoundModal();
  });
  els.anfSave.addEventListener("click", () => {
    const reason = getSelectedReasonValue();
    if (!reason) {
      showToast("Select a reason");
      return;
    }
    const needsLocation = reason === "Damaged Stock" || reason === "Exp Stock";
    const loc = (els.anfLocation.value || "").trim();
    if (needsLocation && !loc) {
      showToast("Enter location");
      return;
    }
    const entry = getSelectedEntry();
    const r = entry ? getReplenishmentPayload(entry) : null;
    const line = r && removeLineKey ? r.lines.find((l) => l.key === removeLineKey) : null;
    if (line) {
      line.exception = true;
      line.exceptionMeta = { reason, location: needsLocation ? loc : "" };
    }
    closeArticleNotFoundModal();
    renderDetail();
    showToast("Saved");
  });

  els.errorClose.addEventListener("click", closeErrorModal);
  els.errorBackdrop.addEventListener("click", (e) => {
    if (e.target === els.errorBackdrop) closeErrorModal();
  });

  els.closeGapScanErrorClose.addEventListener("click", () => {
    closeCloseGapScanErrorModal();
    const scan = document.getElementById("merch-scan");
    if (scan) scan.focus();
  });
  els.closeGapScanErrorBackdrop.addEventListener("click", (e) => {
    if (e.target === els.closeGapScanErrorBackdrop) {
      closeCloseGapScanErrorModal();
      const scan = document.getElementById("merch-scan");
      if (scan) scan.focus();
    }
  });

  els.taskCompleteClose.addEventListener("click", () => {
    closeTaskCompleteModal();
    const scan = document.getElementById("merch-scan");
    if (scan) scan.focus();
  });
  els.taskCompleteBackdrop.addEventListener("click", (e) => {
    if (e.target === els.taskCompleteBackdrop) {
      closeTaskCompleteModal();
      const scan = document.getElementById("merch-scan");
      if (scan) scan.focus();
    }
  });

  els.fillCancel.addEventListener("click", () => {
    closeFillModal();
    const scan = document.getElementById("merch-scan");
    if (scan) scan.focus();
  });
  els.fillSave.addEventListener("click", () => {
    const status = getFillGapStatus();
    if (!status) {
      showToast("Select Filled in full or Limited stock");
      return;
    }
    const entry = getSelectedEntry();
    const merch = getMerchandisingPayload(entry);
    const gtin = pendingMerchGtin;
    const articleName = pendingMerchName || gtin;
    if (merch && gtin) {
      const block = closeGapScanRejectedReason(entry, merch, gtin);
      if (block === "not_in_task") {
        closeFillModal();
        openCloseGapScanErrorModal();
        return;
      }
      if (block === "already_done") {
        closeFillModal();
        showToast("Already scanned for this task");
        return;
      }
      merch.rows.push({
        article: gtin,
        articleName,
        quantity: 100,
        from: getCloseGapFromLocation(entry, gtin),
        to: CLOSE_GAP_TO,
        status,
      });
      if (typeof merch._renderRows === "function") merch._renderRows();
      if (isCloseGapTaskComplete(entry, merch)) {
        openTaskCompleteModal();
      }
    }
    closeFillModal();
    const scan = document.getElementById("merch-scan");
    if (scan) scan.focus();
  });
  els.fillBackdrop.addEventListener("click", (e) => {
    if (e.target === els.fillBackdrop) {
      closeFillModal();
      const scan = document.getElementById("merch-scan");
      if (scan) scan.focus();
    }
  });

  renderMaster("");
  renderDetail();
})();
