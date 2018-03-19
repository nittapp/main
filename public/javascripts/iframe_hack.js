window.onload = function() {
  try {
      if (window.self == window.top) return;
  } catch (e) {
      return true;
  }
  window.parent.postMessage({ "loaded": window.location.href, "title": document.title }, "*");
}

window.onbeforeunload = function() {
  try {
      if (window.self == window.top) return;
  } catch (e) {
      return true;
  }
  window.parent.postMessage({ "leaving": window.location.href, "title": document.title }, "*");
}
