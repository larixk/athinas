// Larixk's text rotation thing
(function() {
  'use strict';

  function switchText() {
    texts[textIndex].classList.remove('shown');

    textIndex++;
    textIndex %= texts.length;

    texts[textIndex].classList.add('shown');

    setTimeout(switchText, intervalTime);
  }

  var texts = document.getElementsByTagName('li'),
    textIndex = 0,
    intervalTime = 4000;

  setTimeout(switchText, intervalTime);
}());
