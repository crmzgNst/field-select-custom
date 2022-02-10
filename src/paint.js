import {component} from './component';
import qlik from 'qlik';

var _component = component

export const paint = ($element, layout) => {
  _component($element, layout);

  if (module.hot) {
    module.hot.accept('./component',()=> {
      _component = require('./component').component
      _component($element, layout, true);
    });
  }
  return qlik.Promise.resolve();
}


