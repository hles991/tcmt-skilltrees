(() => {
  // Rotate-by-ID only (grandpa perks)
  const ROTATED_PERK_IDS = new Set([
    600, 601, 602, 603, 604, 605, 606, 607,
    608, 609, 610, 611, 612, 613
  ]);

  // Utility: get/create our managed <img>
  function ensurePerkImg(iconEl) {
    let img = iconEl.querySelector('img[data-perkimg="1"]');
    if (!img) {
      img = document.createElement("img");
      img.setAttribute("data-perkimg", "1");
      img.style.position        = "absolute";
      img.style.top             = "0";
      img.style.left            = "0";
      img.style.width           = "100%";
      img.style.height          = "100%";
      img.style.objectFit       = "contain";
      img.style.pointerEvents   = "none";
      img.style.zIndex          = "1";
      img.style.transformOrigin = "center center";
      iconEl.style.position     = "relative";
      iconEl.appendChild(img);
    }
    return img;
  }

  function renderIcon(iconEl) {
    const perkId = Number(iconEl.dataset.id);
    if (isNaN(perkId)) return;

    const perkObj = tcm__getPerkObject(perkId);
    if (!perkObj) return;

    const name = String(perkObj[1]).trim();
    const type = String(perkObj[2] || "").trim().toLowerCase();
    if (!name) return;

    const img = ensurePerkImg(iconEl);

    // Path/fork icons: choose path2/path3 based on .double/.triple
    if (type === "fork" || name.toLowerCase() === "path") {
      let imgFile = "path.webp";
      if (iconEl.classList.contains("triple")) imgFile = "path3.webp";
      else if (iconEl.classList.contains("double")) imgFile = "path2.webp";

      img.src = "perkimages/" + imgFile;
      img.alt = name;
      img.style.transform = "scale(0.8)"; // display smaller
      return;
    }

    // Regular perks by filename
    const fileName = encodeURIComponent(name) + ".webp";
    img.src = "perkimages/" + fileName;
    img.alt = name;

    const transforms = ["scale(1.6)"];
    if (ROTATED_PERK_IDS.has(perkId)) {
      transforms.push("rotate(45deg)");
    }
    img.style.transform = transforms.join(" ");
  }

  function applyIcons(root) {
    root.querySelectorAll(".icon[data-id]").forEach(renderIcon);
  }

function applyEverywhere() {
  const nodeMap       = document.getElementById("node-map");
  const characterLoad = document.getElementById("character-loadout"); // left sidebar
  const perkSlots     = document.getElementById("perk-slots");
  const loadoutWindow = document.getElementById("loadout-window");    // the drawer
  const available     = document.getElementById("available-perks");
  const perkList      = document.getElementById("perk-list");         // <li class="icon" ...>

  if (nodeMap)       applyIcons(nodeMap);
  if (characterLoad) applyIcons(characterLoad);
  if (perkSlots)     applyIcons(perkSlots);

  // NEW: make sure the list gets processed too
  if (loadoutWindow) applyIcons(loadoutWindow);
  if (available)     applyIcons(available);
  if (perkList)      applyIcons(perkList);
}

  // Debounce to avoid thrashing during big DOM ops
  let rafPending = false;
  function scheduleApply() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      applyEverywhere();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyEverywhere();

    // Observe the whole document for:
    // - added nodes (lists rebuilt)
    // - attribute changes on .icon elements (data-id swaps without node replacement)
    const mo = new MutationObserver(muts => {
      let needsApply = false;

      for (const m of muts) {
        if (m.type === "childList" && (m.addedNodes.length || m.removedNodes.length)) {
          needsApply = true; // lists cleared/rebuilt (e.g., click path / route change)
          continue;
        }
        if (m.type === "attributes" &&
            m.target instanceof Element &&
            m.target.matches(".icon[data-id]") &&
            m.attributeName === "data-id") {
          // Update this one immediately (fast path), then schedule a sweep
          renderIcon(m.target);
          needsApply = true;
        }
      }

      if (needsApply) scheduleApply();
    });

    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-id"]
    });

    // Also re-apply when the character changes (UI rebuilds)
    const charSelect = document.getElementById("character-select");
    if (charSelect) {
      charSelect.addEventListener("change", () => {
        // let the app update, then re-apply
        setTimeout(scheduleApply, 0);
      });
    }
  });
})();
