
import {backendApi, setBackendApi} from './app'
export var element = null;
export const mounted = ($element, layout) => {
    element = $element
    setBackendApi($element.scope().object.backendApi)
}
