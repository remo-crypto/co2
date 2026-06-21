// This shim is provided for backwards compatibility with the deployed HTML.
// It loads the current application logic from script.js.
(function () {
  'use strict';

  var script = document.createElement('script');
  script.src = 'script.js';
  script.async = false;
  script.onload = function () {
    console.log('Loaded application script: script.js');
  };
  script.onerror = function () {
    console.error('Failed to load script.js from script-improved.js');
    var errorMessage = document.createElement('div');
    errorMessage.style.padding = '20px';
    errorMessage.style.background = '#ffebeb';
    errorMessage.style.color = '#8a1f11';
    errorMessage.style.border = '1px solid #e0b4b4';
    errorMessage.style.borderRadius = '12px';
    errorMessage.style.margin = '16px';
    errorMessage.textContent = 'Application failed to load. Please check the deployment and ensure script.js is available.';
    document.body.insertBefore(errorMessage, document.body.firstChild);
  };

  document.head.appendChild(script);
})();