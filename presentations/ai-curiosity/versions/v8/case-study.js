(function (global) {
  'use strict';

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function assetPath(filename) {
    var path = String(filename || '').trim().replace(/^assets\//, '');
    if (!path || /^(?:[a-z]+:|\/)/i.test(path) || path.split('/').indexOf('..') !== -1) return '';
    return escapeHTML('assets/' + path);
  }

  // Static markup only: the presentation owns media playback and navigation.
  function render(slide) {
    slide = slide || {};
    var video = assetPath(slide.video);
    var poster = assetPath(slide.poster);
    var image = assetPath(slide.image) || poster;
    var label = escapeHTML(slide.label || slide.demonstrationTitle || slide.caseName || '공개 프로그램 기능 시연');
    var comparisons = (Array.isArray(slide.comparison) ? slide.comparison : []).slice(0, 3);
    var steps = (Array.isArray(slide.demonstrationSteps) ? slide.demonstrationSteps : []).slice(0, 3);
    var proof = slide.proofStatus || '';
    var media;

    if (video) {
      media = '<video controls playsinline preload="metadata"' +
        (poster ? ' poster="' + poster + '"' : '') +
        ' src="' + video + '" aria-label="' + label + '"></video>' +
        '<button class="video-play cs-play" data-play>' + escapeHTML(slide.playLabel || '실제 기능 시연 보기 ▶') + '</button>';
    } else if (image) {
      media = '<img src="' + image + '" alt="' + label + '">' +
        '<span class="cs-still-label">공개 화면 · 정지 이미지</span>';
    } else {
      media = '<p class="cs-media-unavailable">시연 자료가 없습니다.</p>';
    }

    return '<section class="case-study" aria-label="' + label + '">' +
      '<header class="cs-context">' +
        '<div class="cs-lineage"><span class="cs-reference">' + escapeHTML(slide.referenceName) + '</span>' +
        '<span class="cs-context-arrow" aria-hidden="true">→</span>' +
        '<strong>' + escapeHTML(slide.caseName) + '</strong></div>' +
        '<p>' + escapeHTML(slide.referenceTask) + '</p>' +
      '</header>' +
      '<div class="cs-body">' +
        '<div class="cs-media">' + media + '</div>' +
        '<aside class="cs-explanation">' +
          '<h2>원래 하던 일 <span aria-hidden="true">→</span> 구현된 기능</h2>' +
          '<dl class="cs-comparisons">' + comparisons.map(function (row) {
            return '<div class="cs-comparison"><dt>' + escapeHTML(row.original) + '</dt>' +
              '<dd><span aria-hidden="true">→</span>' + escapeHTML(row.implemented) + '</dd></div>';
          }).join('') + '</dl>' +
          '<div class="cs-demonstration"><h3>' + escapeHTML(slide.demonstrationTitle || '영상에서 확인할 순서') + '</h3>' +
            '<ol>' + steps.map(function (step) { return '<li>' + escapeHTML(step) + '</li>'; }).join('') + '</ol>' +
          '</div>' +
        '</aside>' +
      '</div>' +
      '<p class="cs-takeaway">' + escapeHTML(proof) + '</p>' +
    '</section>';
  }

  global.CaseStudy = Object.freeze({ render: render, version: '1.0.0' });
})(window);
