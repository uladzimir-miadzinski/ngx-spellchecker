export function getCaretCharacterOffsetWithin(element) {
  var caretOffset = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  if (typeof win.getSelection !== 'undefined') {
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      var range = win.getSelection().getRangeAt(0);
      var preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
  } else if ((sel = doc.selection) && sel.type != 'Control') {
    var textRange = sel.createRange();
    var preCaretTextRange = doc.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint('EndToEnd', textRange);
    caretOffset = preCaretTextRange.text.length;
  }
  return caretOffset;
}

export function getCaretPosition() {
  if (window.getSelection && window.getSelection().getRangeAt) {
    var range = window.getSelection().getRangeAt(0);
    var selectedObj = window.getSelection();
    var rangeCount = 0;
    var childNodes = selectedObj.anchorNode.parentNode.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      if (childNodes[i] === selectedObj.anchorNode) {
        break;
      }
      if ((childNodes[i] as HTMLInputElement).outerHTML) {
        rangeCount += (childNodes[i] as HTMLInputElement).outerHTML.length;
      } else if (childNodes[i].nodeType === 3) {
        rangeCount += childNodes[i].textContent.length;
      }
    }
    return range.startOffset + rangeCount;
  }
  return -1;
}

export function setCaretPos(el, sPos)
{
  /*range = document.createRange();
  range.setStart(el.firstChild, sPos);
  range.setEnd  (el.firstChild, sPos);*/
  var charIndex = 0, range = document.createRange();
  range.setStart(el, 0);
  range.collapse(true);
  var nodeStack = [el], node, foundStart = false, stop = false;
  
  while (!stop && (node = nodeStack.pop())) {
    if (node.nodeType == 3) {
      var nextCharIndex = charIndex + node.length;
      if (!foundStart && sPos >= charIndex && sPos <= nextCharIndex) {
        range.setStart(node, sPos - charIndex);
        foundStart = true;
      }
      if (foundStart && sPos >= charIndex && sPos <= nextCharIndex) {
        range.setEnd(node, sPos - charIndex);
        stop = true;
      }
      charIndex = nextCharIndex;
    } else {
      var i = node.childNodes.length;
      while (i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }
  }
  let selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}
