const initialState = {};

export default function validation(state = initialState, action) {
  switch (action.type) {
  case 'MODEL_INPUT_VALIDATION':
    let inputState = Object.assign({}, state);
    inputState[action.component][action.model][action.inputName] = action.state;
    return inputState;

  case 'MODEL_COMPONENT_DEFAULT_STATE':
    return {
      ...state,
      [action.component]: {
        [action.model]: {},
      },
    };

  case 'MODEL_FORM_VALIDATION':
    let formState = Object.assign({}, state);
    formState[action.component][action.model].valid = action.state.valid;
    formState[action.component][action.model].message = action.state.message;
    return formState;

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
