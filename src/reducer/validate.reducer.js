import {MODEL_COMPONENT_DEFAULT_STATE, MODEL_INPUT_VALIDATION, MODEL_FORM_VALIDATION} from '../actions/types/validate.types';

const initialState = {};

export default function validation(state = initialState, action) {
  let newState = Object.assign({}, state);

  switch (action.type) {
  case MODEL_INPUT_VALIDATION:
    let inputState = newState[action.component][action.model][action.inputName] || {};
    newState[action.component][action.model][action.inputName] = {
      ...inputState,
      ...action.state,
    };
    return newState;


  case MODEL_COMPONENT_DEFAULT_STATE:
    return {
      ...state,
      [action.component]: {
        [action.model]: {},
      },
    };

  case MODEL_FORM_VALIDATION:
    let modelState = newState[action.component][action.model];
    newState[action.component][action.model] = {
      ...modelState,
      ...action.state,
    }
    return newState;

  default:
    return state;
  }
}

/*
validation = {
  login : {
    user: {
      url:{
        validate: true,
        message: "This field is required"
      }
    }
  }
}
*/
