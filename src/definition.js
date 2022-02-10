import {
  round,
  split,
  get as _get,
  isEmpty
} from 'lodash';
import {
  getMasterItems
} from './getMasterItems'
import {
  app,
  dimensionList,
  backendApi,
  variableList
} from './app'

var contrast = require('get-contrast')
require('spectrum-colorpicker')
import 'spectrum-colorpicker/spectrum.css'


function addColorPicker(item, property) {
  var _label = _get(item, 'label')

  item.label = (data, obj) => {
      var isExp = !isEmpty(_get(data, item.ref, ''))
      var activeColor = isExp ? _get(obj.layout, item.ref) : _get(data, item.ref)

      if ($(`[tid="${property}"] input.spectrum-color-picker`).length == 0) {
        $(`[tid="${property}"] input`).after('<input type="text" maxlength="255" class="lui-input lui-input-group__item lui-input-group__input spectrum-color-picker"></input>')
        var config = {
          color: activeColor,
          change: function (color) {
            var scope = $(`[tid="${property}"] input`).scope()
            scope.value = color.toHexString()
            scope.change()
          }
        }

        $(`[tid="${property}"] input.spectrum-color-picker`).spectrum(config)

      }

      return _label
    },

    item.change = (data, obj, c) => {

      var sItem = $(`[tid="${property}"] input.spectrum-color-picker`)
      var isExp = !isEmpty(_get(data, item.ref, ''))

      setTimeout(() => {
        var activeColor = isExp ? _get(obj.layout, item.ref) : _get(data, item.ref)
        // && tinycolor(activeColor).isValid()
        if (sItem.spectrum('get').toHexString().toUpperCase() !== activeColor.toUpperCase()) {

          sItem.spectrum('set', activeColor)
        }
      }, isExp ? 500 : 0)
    }

  return item
}

export const definition = {
  type: 'items',
  component: 'accordion',
  items: {
    field: {
      label: 'Field',
      items: {
        fieldType: {
          type: "string",
          component: "dropdown",
          label: "Select field type",
          ref: "properties.fieldType",
          defaultValue: 'field',
          options: [{
              label: 'Field',
              value: 'field'
            },
            {
              label: 'Dimension',
              value: 'dimension'
            },
            // {
            //   label: 'Variable',
            //   value: 'variable'
            // }
          ]
        },
        masterDims: {
          type: "string",
          component: "dropdown",
          label: "Select a master dimension",
          translation: "Common.Dimension",
          ref: "qListObjectDef.qLibraryId",
          options: function (e) {
            return dimensionList
          },
          show: function (data) {
            return data.properties.fieldType == 'dimension'
          }

        },
        field: {
          type: "string",
          component: "expression",
          expression: "optional",
          expressionType: "dimension",
          ref: "qListObjectDef.qDef.qFieldDefs.0",
          translation: "Common.Field",
          show: function (data) {
            return data.properties.fieldType == 'field'
          }
        },
        variable: {
          type: "string",
          expression: "optional",
          ref: "properties.variableName",
          label: 'Variable Name',
          show: function (data) {
            return data.properties.fieldType == 'variable'
          }
        },
        "variableOptions": {
          type: "string",
          expression: "optional",
          ref: "properties.variableOptions",
          label: 'Variable Options (comma seperated list)',
          show: function (data) {
            return data.properties.fieldType == 'variable'
          }
        },
        // label: {
        //   type: "string",
        //   expression: "optional",
        //   ref: "title",
        //   label: "Label"
        // },
        showCondition: {
          type: "string",
          expression: "optional",
          ref: "properties.showCondition",
          label: "Show Condition"
        },
        alwaysOneSelectedValue: {
          ref: "properties.alwaysOneSelectedValue",
          type: "boolean",
          label: "Always One Selected Value",
          defaultValue: false,
          show: function (data) {
            return data.properties.fieldType !== 'variable'
          }
        },
        defaultSelection: {
          type: "string",
          expression: "optional",
          ref: "properties.defaultSelection",
          label: "Default Selection"
        },
        selectAllOptions: {
          ref: "properties.includeSelectAllOption",
          type: "boolean",
          label: 'Include "Select All" Option',
          defaultValue: true,
          show: function (data) {
            return data.properties.alwaysOneSelectedValue !== true && data.properties.fieldType !== 'variable'
          }
        },
        cId: {
          ref: "qListObjectDef.qDef.cId",
          type: "string",
          show: false
        },
        styling: {
          type: "items",
          component: "expandable-items",
          label: 'Styling',
          items: {
            _styling: {
              type: 'items',
              label: 'Styling',
              items: {
                checkboxSelectedBackgroundColor: addColorPicker({
                  ref: "properties.checkBackgroundColor",
                  label: "Checkbox - Selected Background Color",
                  type: "string",
                  expression: "optional",
                  defaultValue: "#fab761"
                }, 'checkboxSelectedBackgroundColor'),

                checkboxBackgroundColorContrastRatio: {
                  label: '',
                  component: "text",
                  show: function(data){
                    var label = $('[tid="checkboxBackgroundColorContrastRatio"] .pp-text-component div')
                    var contrastRatio = 0
                    try { contrastRatio = round(contrast.ratio(data.properties.checkBackgroundColor, '#333'),3)} 
                    catch(e){}
                    var meetsAA = contrastRatio >= 4.5
                    if (!meetsAA){
                      $('[tid="checkboxSelectedBackgroundColor"]').css('color','red')
                      label.css('color','red').text(`Contrast Ratio: ${contrastRatio}. NOTE: To meet AA compliance, ratio of button font and background color must be >4.5`)
                    } else {
                      $('[tid="checkboxSelectedBackgroundColor"]').css('color','initial')
                      label.css('color','initial').text('')
                    }
                    return !meetsAA
                  },
                },

              }
            }
          }
        },
        sorting: {
          type: "items",
          component: "expandable-items",
          show: function (data) {
            return data.properties.fieldType !== 'variable'
          },
          items: {
            _sorting: {
              type: 'items',
              label: 'Sorting',

              items: {
                autoSort: {
                  type: "boolean",
                  component: "switch",
                  label: "Sorting",
                  ref: "qListObjectDef.qDef.autoSort",
                  options: [{
                    value: true,
                    label: "Auto"
                  }, {
                    value: false,
                    label: "Custom"
                  }],
                  defaultValue: true,
                  "show": function (data) {
                    return data.properties.fieldType !== 'variable'
                  }
                },
                qSortByFrequency: {
                  type: "numeric",
                  component: "dropdown",
                  label: "Sort by Frequency",
                  ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByFrequency",
                  options: [{
                    value: -1,
                    label: "Ascending"
                  }, {
                    value: 0,
                    label: "No"
                  }, {
                    value: 1,
                    label: "Descending"
                  }],
                  defaultValue: 0,
                  show: function (data) {
                    return data.properties.fieldType !== 'variable' &&
                      !data.qListObjectDef.qDef.autoSort
                  }
                },
                qSortByLoadOrder: {
                  type: "numeric",
                  component: "dropdown",
                  label: "Sort by Load Order",
                  ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByLoadOrder",
                  options: [{
                    value: 1,
                    label: "Ascending"
                  }, {
                    value: 0,
                    label: "No"
                  }, {
                    value: -1,
                    label: "Descending"
                  }],
                  defaultValue: 1,
                  show: function (data) {
                    return data.properties.fieldType !== 'variable' && !data.qListObjectDef.qDef.autoSort
                  }
                },
                qSortByState: {
                  type: "numeric",
                  component: "dropdown",
                  label: "Sort by State",
                  ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByState",
                  options: [{
                    value: 1,
                    label: "Ascending"
                  }, {
                    value: 0,
                    label: "No"
                  }, {
                    value: -1,
                    label: "Descending"
                  }],
                  defaultValue: 1,
                  show: function (data) {
                    return data.properties.fieldType !== 'variable' && !data.qListObjectDef.qDef.autoSort
                  }
                },
                qSortByNumeric: {
                  type: "numeric",
                  component: "dropdown",
                  label: "Sort by Numeric",
                  ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByNumeric",
                  options: [{
                    value: 1,
                    label: "Ascending"
                  }, {
                    value: 0,
                    label: "No"
                  }, {
                    value: -1,
                    label: "Descending"
                  }],
                  defaultValue: 1,
                  show: function (data) {
                    return data.properties.fieldType !== 'variable' && !data.qListObjectDef.qDef.autoSort
                  }
                },
                qSortByAscii: {
                  type: "numeric",
                  component: "dropdown",
                  label: "Sort by Alphabetical",
                  ref: "qListObjectDef.qDef.qSortCriterias.0.qSortByAscii",
                  options: [{
                    value: 1,
                    label: "Ascending"
                  }, {
                    value: 0,
                    label: "No"
                  }, {
                    value: -1,
                    label: "Descending"
                  }],
                  defaultValue: 1,
                  show: function (data) {
                    return data.properties.fieldType !== 'variable' && !data.qListObjectDef.qDef.autoSort
                  },
                },
              }
            },
          }
        },

      }
    },
    appearance: {
      uses: 'settings'
    },
  },

};