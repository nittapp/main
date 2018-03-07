window.onload = function() {
  window.parent.postMessage({ "loaded": window.location.href }, "*");
}
