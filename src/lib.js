import $ from 'jquery';
import _ from 'lodash';
import 'jquery.tabbable/jquery.tabbable.min'

// var qvAccessibilityGridService = qvangularGlobal.getService('qvAccessibilityGridService')

export const nextFocusable = function (elem, selector) {
  selector = _.isUndefined(selector) ? '' : selector
  if (selector.length) var selectables = elem.find(`${selector} :focusable,${selector}:focusable`);
  else var selectables = elem.find(`:focusable`);

  var current = $(':focus');
  var nextIndex = 0;
  var next;
  var last = false
  if (current.length === 1) {
    var currentIndex = selectables.index(current);
    if (currentIndex + 1 < selectables.length) {
      nextIndex = currentIndex + 1;
      next = selectables.eq(nextIndex)
    } else {
      last = true
      next = $('.qv-gridcell.qvt-gridcell.qv-gridcell-acc-focus:not(.extension)').first()

      console.log('last', next)

    }
  } else {
    next = selectables.eq(nextIndex)
  }
  next.last = last
  // console.log({current,currentIndex,nextIndex, last})
  return next
}

export const prevFocusable = function (elem, selector) {
  selector = _.isUndefined(selector) ? '' : selector
  if (selector.length) var selectables = elem.find(`${selector} :focusable,${selector}:focusable`);
  else var selectables = elem.find(`:focusable`);
  var current = $(':focus');
  var prevIndex = selectables.length - 1;
  if (current.length === 1) {
    var currentIndex = selectables.index(current);
    if (currentIndex > 0) {
      prevIndex = currentIndex - 1;
    }
  }
  return selectables.eq(prevIndex)
}

export const focusNextQlikObject = function (e) {
  e.code = 'ArrowRight'
  e.key = 'ArrowRight'
  e.which = 39
  // qvAccessibilityGridService.key(e, "GenericObject");
}

export const getStylesheet = function (id) {
  // https://davidwalsh.name/add-rules-stylesheets
  var existingSheet = $(`style#css-${id}`)
  if (existingSheet.length > 0) existingSheet.remove()

  var style = document.createElement("style");

  // WebKit hack :(
  style.appendChild(document.createTextNode(""));

  // Add the <style> element to the page
  document.head.appendChild(style);
  $(style).attr('id', `css-${id}`)
  return style.sheet;
}

export const list_to_tree = function (list) {
  var map = {},
    node, roots = [],
    i;
  for (i = 0; i < list.length; i += 1) {
    map[list[i].cId] = i; // initialize the map
    list[i].children = []; // initialize the children
  }
  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    if (_.get(node, 'parentMenuItemId', '').length > 0) {
      // if you have dangling branches check that map[node.parentId] exists
      list[map[node.parentMenuItemId]].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export const setTabIndex = function () {

  var sheetTitle = $('#sheet-title .sheet-title-text').text()
  var screenReaderText = `${sheetTitle.length ? `${sheetTitle} sheet. ` : ''}Navigate between the objects with the tab key. Press Enter to view the data. Press Shift + Enter to enter full screen mode.`

  $('div.cell.qv-gridcell.qvt-gridcell.ng-scope.qv-gridcell-acc-focus').unbind('.screenReaderLabel')
  $('div.cell.qv-gridcell.qvt-gridcell.ng-scope.qv-gridcell-acc-focus').attr('tabindex', '0')
  $('div.cell.qv-gridcell.qvt-gridcell.ng-scope.qv-gridcell-acc-focus').bind('focus.screenReaderLabel', (e) => {
    // $(e.target).find
    $('div.hidden-screen-reader-label').attr('aria-label', screenReaderText)
  })
}


export const handlers = {
  keyHandler: (e) => {
    switch (e.key) {
      case 'Space':
        e.preventDefault()
        $(e.target).click()
        break;
    }

  },
  enterHandler: (e) => {
    // 9 tab
    // 37 left 39 right
    if (e.key == 'Enter') {

      if ($(e.target).hasClass('cell')) {
        $($element.find('.menu-item a')[0]).focus()
      }
      if ($(e.target).is('a')) {
        $(e.target).click()
      }
    }

    if (e.key == 'Escape') {
      $element.closest('.qv-gridcell.qv-gridcell-acc-focus').focus()
    }
  },
  tabHandler: (e) => {
    var grid = $('#grid')

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
      case 'Tab':
        var gridItem = nextFocusable(grid, '.qv-gridcell-acc-focus.extension')
        if (_.get(gridItem, 'last')) {
          focusNextQlikObject(e)
        }

        break;

    }
  }
}