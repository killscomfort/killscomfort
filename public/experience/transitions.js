/**
 * KillsComfort TransitionController
 * GPU-friendly scene/panel transitions for the warehouse experience.
 *
 * Assign presets via KC_TRANSITION_ROUTES in game.js, or call:
 *   KCTransitions.play(config, swapFn, onComplete)
 *
 * Debug: localStorage.setItem('kc_transition_debug','1')
 * Reduced motion: respects prefers-reduced-motion (instant swap).
 */
(function (global) {
  "use strict";

  var DEFAULT_CONFIG = {
    type: "slide",
    duration: 600,
    direction: "forward",
    intensity: 0.7,
    blur: 10,
    flash: 0.2,
    sound: null,
  };

  /** @type {Record<string, typeof DEFAULT_CONFIG>} */
  var PRESETS = {
    homeToBikePicker: {
      type: "zoom",
      duration: 650,
      direction: "in",
      intensity: 1,
      blur: 8,
      flash: 0.22,
      sound: null,
    },
    bikePickerToRide: {
      type: "whipPan",
      duration: 560,
      direction: "left",
      intensity: 1,
      blur: 16,
      flash: 0.12,
      sound: null,
    },
    rideToSection: {
      type: "freezeReveal",
      duration: 820,
      direction: "forward",
      intensity: 0.9,
      blur: 0,
      flash: 0.28,
      sound: null,
    },
  };

  var active = false;
  var reduce =
    global.matchMedia &&
    global.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(id) {
    return document.getElementById(id);
  }

  function mergeConfig(cfg) {
    var out = {};
    var k;
    for (k in DEFAULT_CONFIG) out[k] = DEFAULT_CONFIG[k];
    if (cfg) for (k in cfg) if (cfg[k] != null) out[k] = cfg[k];
    out.duration = Math.max(400, Math.min(900, out.duration));
    return out;
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function ensureOverlay() {
    var el = $("kcTransition");
    if (el) return el;
    var root = $("kc");
    if (!root) return null;
    el = document.createElement("div");
    el.id = "kcTransition";
    el.className = "kc-transition";
    el.innerHTML =
      '<div class="kc-t-vhs"></div>' +
      '<div class="kc-t-chroma"></div>' +
      '<div class="kc-t-burn"></div>' +
      '<div class="kc-t-flash"></div>' +
      '<div class="kc-t-mask"></div>';
    root.appendChild(el);
    return el;
  }

  function applyVars(root, cfg) {
    root.style.setProperty("--t-dur", cfg.duration + "ms");
    root.style.setProperty("--t-blur", String(cfg.blur));
    root.style.setProperty("--t-intensity", String(cfg.intensity));
    root.style.setProperty("--t-flash", String(cfg.flash));
    root.style.setProperty(
      "--t-dir",
      cfg.direction === "left" || cfg.direction === "right"
        ? cfg.direction
        : "forward"
    );
    root.dataset.tDir =
      cfg.direction === "right" ? "right" : cfg.direction === "left" ? "left" : "forward";
  }

  function clearClasses(root) {
    root.classList.remove(
      "kc-t-active",
      "kc-t-lock",
      "kc-t-zoom-out",
      "kc-t-zoom-in",
      "kc-t-whipPan-out",
      "kc-t-whipPan-in",
      "kc-t-freezeReveal-out",
      "kc-t-freezeReveal-in",
      "kc-t-slide-out",
      "kc-t-slide-in"
    );
  }

  function playSound(cfg) {
    if (!cfg.sound || typeof global.getCtx !== "function") return;
    var c = global.getCtx();
    if (!c || typeof global.blip !== "function") return;
    var freqs = { push: 520, whip: 920, reveal: 280, flash: 680 };
    global.blip(c.currentTime, freqs[cfg.sound] || 440);
  }

  function play(config, swapFn, onComplete, opts) {
    opts = opts || {};
    var cfg = mergeConfig(config);
    if (active) return Promise.reject(new Error("transition_active"));
    active = true;

    var root = $("kc");
    if (!root || reduce || cfg.type === "none") {
      try {
        if (swapFn) swapFn(function () {});
      } catch (e) {
        active = false;
        throw e;
      }
      active = false;
      if (onComplete) onComplete();
      return Promise.resolve();
    }

    ensureOverlay();
    applyVars(root, cfg);
    root.classList.add("kc-t-active", "kc-t-lock");
    playSound(cfg);

    var outClass = "kc-t-" + cfg.type + "-out";
    var inClass = "kc-t-" + cfg.type + "-in";
    var outMs = Math.round(cfg.duration * 0.45);
    var inMs = cfg.duration - outMs;

    root.classList.add(outClass);

    return wait(outMs)
      .then(function () {
        return new Promise(function (resolve) {
          var done = false;
          function finishSwap() {
            if (done) return;
            done = true;
            resolve();
          }
          try {
            if (swapFn) swapFn(finishSwap);
            else finishSwap();
          } catch (e) {
            active = false;
            clearClasses(root);
            throw e;
          }
          setTimeout(finishSwap, 120);
        });
      })
      .then(function () {
        if (opts.outOnly) {
          clearClasses(root);
          active = false;
          if (onComplete) onComplete();
          return;
        }
        root.classList.remove(outClass);
        root.classList.add(inClass);
        return wait(inMs);
      })
      .then(function () {
        if (opts.outOnly) return;
        clearClasses(root);
        active = false;
        if (onComplete) onComplete();
      })
      .catch(function (err) {
        clearClasses(root);
        active = false;
        throw err;
      });
  }

  function navigateExternal(href, config, beforeNavigate) {
    return play(
      config,
      function (next) {
        if (beforeNavigate) beforeNavigate();
        next();
      },
      null,
      { outOnly: true }
    ).then(function () {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(
          {
            type: "kc:navigate",
            href: href,
            transition: mergeConfig(config),
          },
          "*"
        );
      } else {
        global.location.href = href;
      }
    });
  }

  global.KCTransitions = {
    DEFAULT_CONFIG: DEFAULT_CONFIG,
    transitionConfig: DEFAULT_CONFIG,
    PRESETS: PRESETS,
    mergeConfig: mergeConfig,
    play: play,
    navigateExternal: navigateExternal,
    isActive: function () {
      return active;
    },
    setSoundEnabled: function (on) {
      var k;
      for (k in PRESETS) {
        if (on && !PRESETS[k].sound) {
          PRESETS[k].sound =
            k === "homeToBikePicker"
              ? "push"
              : k === "bikePickerToRide"
                ? "whip"
                : "reveal";
        }
        if (!on) PRESETS[k].sound = null;
      }
    },
  };
})(window);
