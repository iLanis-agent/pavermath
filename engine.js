/* PaverMath engine - honest paver math. UMD: browser global + Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PaverMath = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var up = function (x) { return Math.ceil(x - 1e-9); };

  // Running bond wastes 10% in edge cuts; herringbone 15%.
  function wastePct(pattern) {
    return pattern === 'herringbone' ? 0.15 : 0.10;
  }

  function paversNeeded(areaSqFt, paverWIn, paverLIn, pattern) {
    var perSqFt = 144 / (paverWIn * paverLIn);
    return up(areaSqFt * perSqFt * (1 + wastePct(pattern)));
  }

  // Bedding sand: a screeded 1 inch, never compacted before the pavers land.
  function beddingTons(areaSqFt) {
    var tons = areaSqFt / 324 * 1.4;
    return Math.max(0.5, Math.ceil((tons - 1e-9) * 2) / 2);
  }

  // Polymeric joint sand: a 50 lb bag covers about 75 sq ft of narrow joints.
  function polySandBags(areaSqFt) {
    return up(areaSqFt / 75);
  }

  // Edge restraint in 6 ft sections, spikes included - skip it and the field walks.
  function edgeSections(perimeterFt) {
    return up((perimeterFt || 0) / 6);
  }

  function estimate(opts) {
    var area = opts.areaSqFt;
    var w = opts.paverWIn, l = opts.paverLIn;
    var pattern = opts.pattern || 'running';
    var priceSqFt = opts.pricePerSqFt != null ? opts.pricePerSqFt : 4;
    var perim = opts.perimeterFt || 0;

    var pavers = paversNeeded(area, w, l, pattern);
    var bedding = beddingTons(area);
    var sand = polySandBags(area);
    var edge = edgeSections(perim);
    var paverCost = Math.round(area * (1 + wastePct(pattern)) * priceSqFt * 100) / 100;
    var total = Math.round((paverCost + bedding * 40 + sand * 28 + edge * 12) * 100) / 100;
    return {
      pavers: pavers, wastePct: wastePct(pattern),
      beddingTons: bedding, polySandBags: sand, edgeSections: edge,
      paverCost: paverCost, total: total
    };
  }

  function advice(est, pattern) {
    if (pattern === 'herringbone') {
      return 'Herringbone is the only pattern that locks against tire loads - that is why driveways use it. The 15% waste is real: every edge cut is diagonal, so order it and dry-lay the borders first.';
    }
    if (est.polySandBags >= 4) {
      return 'This much polymeric sand means the watering step matters: mist, wait ten, mist again - flood it once and the polymer washes out of the joints forever. Sweep every grain off the surface before the first mist.';
    }
    if (est.edgeSections === 0) {
      return 'No perimeter given, so no edge restraint priced - but an unrestrained field walks outward within two seasons. Measure the open edges; only walls count as restraint.';
    }
    return 'Screed the bedding sand and do not compact it before the pavers land - the plate compactor comes after, with the pavers down, and it does the real seating.';
  }

  return {
    wastePct: wastePct, paversNeeded: paversNeeded, beddingTons: beddingTons,
    polySandBags: polySandBags, edgeSections: edgeSections,
    estimate: estimate, advice: advice
  };
});
