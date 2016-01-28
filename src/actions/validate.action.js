import { VALIDATE } from '../middleware/validate';
import {MODEL_COMPONENT_DEFAULT_STATE} from './types/validate.types';

export function setDefaultValidatorState(component, model) {
  return {
    type: 'MODEL_COMPONENT_DEFAULT_STATE',
    component,
    model,
  };
}

export function validateInput(inputValue, inputName, component, model, inputObject, form) {
  return {
    [VALIDATE]: {
      inputName,
      inputValue,
      component,
      model,
      inputObject,
      form
    },
  };
}

export function validateForm(form, component, model) {
  return {
    [VALIDATE]: {
      form,
      component,
      model,
    },
  };
}
