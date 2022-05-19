import _, { random } from 'lodash';
import './styles.scss';

import {
  _scope,
  _element,
  getScope,
  getElement
} from './controller'

import {
  app
} from './app'

// import 'jquery.tabbable/jquery.tabbable.min'
import {nextFocusable, prevFocusable, setTabIndex} from './lib'

export const component = ($element, layout, isHot) => {

  _.set(window, 'fs.element', $element)
  _.set(window, 'fs.layout', layout)

  var scope = $element.scope()
  var objectScope = scope.$$childHead.$$childTail
  var checkboxesId = "checkboxes" + Math.floor((Math.random()*100)+1);
  var multiselectId = "multiselect" + Math.floor((Math.random()*100)+1);
  var scrollListId = "scroll-list" + Math.floor((Math.random()*100)+1);

  var searchText = "";
  var selectAllCheck = false;

  var multi = document.getElementById("multiselectId");
  var check = document.getElementById("checkboxesId");
  var scroll = document.getElementById("scroll-list");

  multi.id = multiselectId;
  check.id = checkboxesId;
  scroll.id = scrollListId;

  objectScope.selectedArray = [];

  var initialData = [];

  if (layout.properties.showCondition == '0') return

  var tabHandler = function (e) {

    switch (e.key) {
      case 'Tab':
        if ($(e.target).hasClass('lui-checkbox__input') && !e.shiftKey) {
          e.preventDefault()
          e.stopPropagation()
          if (e.shiftKey) jQuery.focusPrev()
          else jQuery.focusNext()
        }
        break;

      case 'Escape':
        $element.closest('.qv-gridcell.qv-gridcell-acc-focus').focus()
        break;

      case 'ArrowDown':
        jQuery.focusNext()
        break;

      case 'ArrowUp':
        jQuery.focusPrev()
        break;
    }

  }

  var enterHandler = function (e) {
    // 9 tab
    // 37 left 39 rogjt

    if (e.key == 'Enter') {

      if ($(e.target).hasClass('cell')) {
        nextFocusable($element.find('form')).focus()
      }
      if ($(e.target).is('input.lui-checkbox__input')) {
        $(e.target).click()
      }
    }

    if (e.key == 'Escape') {
      $element.closest('.qv-gridcell.qv-gridcell-acc-focus').focus()
    }
  }

  $element.unbind('.keyboardControlFieldSelect')
  $element.bind('keydown.keyboardControlFieldSelect', tabHandler)
  $element.closest('.qv-gridcell.qv-gridcell-acc-focus').unbind('.keyboardControlFieldSelect')
  $element.closest('.qv-gridcell.qv-gridcell-acc-focus').bind('keydown.keyboardControlFieldSelect', enterHandler)

  var fieldType = _.get(layout, 'properties.fieldType')
  var alwaysOneSelectedValue = _.get(layout, 'properties.alwaysOneSelectedValue', false)

  objectScope.toggleSelectionMenu = ($event) => {
    var element = $event.currentTarget
    var popover = leonardoui.popover({
      content: $(`#${layout.qInfo.qId} .list-actions-menu`)[0].outerHTML,
      closeOnEscape: true,
      dock: "bottom",
      alignTo: element
    });
  }

  objectScope.select = (item, event) => {
    var substring = '';
    var checkboxes = document.getElementById(checkboxesId);
    var list = document.getElementById(scrollListId);
    var multiselect = document.getElementById(multiselectId);
    var coords = getPos(multiselect);

    item.isChecked = !item.isChecked;

    if (event) event.preventDefault()
    // console.log(alwaysOneSelectedValue, item)
    //$scope.layout.qListObject.qDimensionInfo.qStateCounts.qSelected
    if (fieldType !== 'variable') {

      if (item.qState == 'S') {
        
        item.qState = 'O';
        item.isChecked = false;
        objectScope.selectedArray = objectScope.selectedArray.filter(x => x != item.qText.substring(0,15));
        
        console.log('FILTERED ITEMS', objectScope.selectedArray);

        //TODO: Check logic
        objectScope.data.sort((a,b) => {
          if (a.qState === 'S' && b.qState !== 'S') {
            return -1;
          }
          if (a.qState !== 'S' && b.qState === 'S') {
            return 1;
          }
          return 0;
        });
        
        scope.model.selectListObjectValues(`/qListObjectDef`, [item.qElemNumber], (alwaysOneSelectedValue ? false : true), true);

        // if(objectScope.selectedArray.length == 3)
        // checkboxes.style.top = (coords.y - 88) + 'px';

        // if(objectScope.selectedArray.length < 3)
        //   checkboxes.style.top = (coords.y - 98) + 'px';

        return
      }

      item.qState = 'S';
      item.isChecked = true;
      scope.model.selectListObjectValues(`/qListObjectDef`, [item.qElemNumber], (alwaysOneSelectedValue ? false : true), true);

      substring = item.qText.substring(0,15)
      objectScope.selectedArray.push(substring);

      // if(objectScope.selectedArray.length == 3)
      //   checkboxes.style.top = (coords.y - 88) + 'px';

      // if(objectScope.selectedArray.length < 3)
      //   checkboxes.style.top = (coords.y - 98) + 'px';

    }
    //Sort elements by selected state
    console.log("SELECTED ELEMENTS",objectScope.selectedArray);
    objectScope.data.sort((a,b) => {
      if (a.qState === 'S' && b.qState !== 'S') {
        return -1;
      }
      if (a.qState !== 'S' && b.qState === 'S') {
        return 1;
      }
      return 0;
    });
  };

  objectScope.selectAll = () => {
    scope.model.selectListObjectAll('/qListObjectDef')
  };

  objectScope.data = _.map(layout.qListObject.qDataPages[0].qMatrix, (e) => {
    var item = e[0];
    item.isChecked = (item.qState == 'S')

    //Insert color property
    switch(item.qState) {
      case 'A':
        item.color = '#ddd'
        break;
      case 'X':
        item.color = '#a9a9a9'
        break;
    }
    item.isOptional = (item.qState == 'O')
    item.isAlternative = (item.qState == 'A')
    item.isOut = (item.qState == 'X')
    item.ariaLabel = `${item.qText} - is ${!item.isChecked ? 'not' : ''} selected`
    initialData.push(item);
    return item
  });

  var qStateCounts = layout.qListObject.qDimensionInfo.qStateCounts;

  if (_.get(layout,'properties.defaultSelection','').length && _.sum(_.values(qStateCounts)) && qStateCounts.qSelected == 0){
    var defaultItem = _.find(objectScope.data,{qText:_.get(layout,'properties.defaultSelection')})
    objectScope.select(defaultItem)
  }

  var hasState = (states) => {
    var result;
    states.forEach((e, i) => {
      result = (i == 0) ? qStateCounts[e] : (result || qStateCounts[e])
    })
    return result
  }

  objectScope.clearSelections = () => {
    //TODO Check logic
    objectScope.data = initialData;

    objectScope.data.forEach(element => {
      element.isChecked = false;
      element.qState = 'O';
    });
    scope.model.clearSelections('/qListObjectDef');

    objectScope.selectedArray = [];
  };

  objectScope.selectAllData = () => {
    objectScope.data.forEach(element => {
      element.isChecked = true;
    });
    scope.model.selectListObjectAll('/qListObjectDef')
  };

  objectScope.selectAllDeselectAll = () => {
    if(!selectAllCheck){
      objectScope.data.forEach(element => {
        element.isChecked = true;
        element.qState = 'S';
      });
      scope.model.selectListObjectAll('/qListObjectDef');
      selectAllCheck = true;
    }
    else{
      objectScope.data.forEach(element => {
        element.isChecked = false;
        element.qState = 'O';
      });
      scope.model.clearSelections('/qListObjectDef');
      selectAllCheck = false;
    }
  }

  objectScope.selectOptions = [
    // {
    //   label: 'Select all',
    //   icon: 'lui-icon--select-all',
    //   disabled: !hasState(["qOption", "qAlternative", "qExcluded", "qDeselected"]),
    //   click: function () {
    //     console.log(this)
    //     scope.model.selectListObjectAll('/qListObjectDef')
    //   }
    // },
    // {
    //   label: 'Select possible',
    //   icon: 'lui-icon--select-possible',
    //   disabled: !hasState(["qOption"]),
    //   click: () => {
    //     scope.model.selectListObjectPossible('/qListObjectDef')
    //   }
    // },
    // {
    //   label: 'Select alternative',
    //   icon: 'lui-icon--select-alternative',
    //   disabled: !hasState(["qAlternative"]),
    //   click: () => {
    //     scope.model.selectListObjectAlternative('/qListObjectDef')
    //   }
    // },
    // {
    //   label: 'Select excluded',
    //   icon: 'lui-icon--select-excluded',
    //   disabled: !hasState(["qExcluded", "qAlternative"]),
    //   click: () => {
    //     scope.model.selectListObjectExcluded('/qListObjectDef')
    //   }
    // },
    // {
    //   label: 'Clear Selections',
    //   icon: ['lui-icon', 'lui-icon--clear-selections'],
    //   disabled: !hasState(["qSelected"]),
    //   click: () => {
    //     scope.model.clearSelections('/qListObjectDef')
    //   }
    // }
  ]


  setTabIndex()
  var topElem = $element.closest('.qv-gridcell.qv-gridcell-acc-focus')
  topElem.addClass('extension')
  topElem.bind('focus.keyboardControl',function(e){
    console.log(nextFocusable($(e.target),'input'))
    if (!jQuery.contains($element[0],e.relatedTarget)) nextFocusable($(e.target),'input').focus()
    else {
      prevFocusable($('.qv-panel-wrap')).focus()
    }
  })

  var expanded = false;

  objectScope.showCheckboxes = () => {

    var checkboxes = document.getElementById(checkboxesId);
    var list = document.getElementById(scrollListId);
    var multiselect = document.getElementById(multiselectId);
    var coords = getPos(multiselect);

    if (!expanded) {
      checkboxes.style.display = "block";
      try {
        document.getElementById("grid").append(checkboxes);
        list.style.width = (multiselect.clientWidth - 13) + 'px';
        checkboxes.style.top = (coords.y - 98) + 'px';
        checkboxes.style.left = coords.x + 'px';
      } catch (error) {
        try{
          document.getElementById("grid-embed").append(checkboxes);
          list.style.width = (multiselect.clientWidth) + 'px';
          checkboxes.style.top = (coords.y - 160) + 'px';
          checkboxes.style.left = (coords.x - 68) + 'px';
        }
        catch(error){
          console.log(error);
        }
      }

      expanded = true;
    } else {
      checkboxes.style.display = "none";
      expanded = false;
    }
  };

  function getPos(el) {
    // yay readability
    for (var lx=0, ly=0;
         el != null;
         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return {x: lx,y: ly};
}


}
// if (!$element.hasClass('qv-object-modalpanel-extension')) $element.addClass('qv-object-modalpanel-extension')