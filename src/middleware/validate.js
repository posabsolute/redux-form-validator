/*!
 * Redux-form-validation
 * Validate Middleware
 * Do the calidation heavy-lifting
 */
import validateFuncs from './validate-validators';
import defaultMessages from './validate-default-messages';
import {Deferred} from './validate-utils';

export const VALIDATE = Symbol('Validate');


export default store => next => action => {
  const validator = action[VALIDATE];
  // Check if the middleware is directly called in a action
  if (typeof validator === 'undefined') {
    return next(action);
  }
  // get data from the action call
  const { form, inputName, inputValue, model, component, inputObject } = validator;
  // init is done at the end
  /**
   * validateRules()
   * Take each validation rule from an input and validates.
   *
   * @param {Object} rules - all the validation rules defined for an input
   * @param {String} inputValue - input value to validate
   * @return {Object} input - input status added to the validation state.
   */
  function validateRules(rules, value, inputData, inputType) {
    // default store value for an input
    let input = {
      valid: true,
      rules: [],
    };
    // Take each validation rules & validate
    Object.keys(rules).forEach( rule => {
      // if validator exist
      if (validateFuncs[rule]) {
        // return validation status
        const validation = validateFuncs[rule](value, rules[rule], inputData, inputType, form);

        // Do we have an async validation with promise
        if (rule === 'async') {
          input.isPromise = true;
          input.promise = validation;
        }

        // if we have an error
        // validation can either be false
        // or an error message string
        if (validation !== true) {
          input.valid = false;
          // add the errored rule to store
          input.rules.push(rule);
          // Define Message used
          const messages = {
            rule: rules[rule],
          };
          input.message = rules.message ||
                          (defaultMessages[rule] && defaultMessages[rule](messages)) ||
                          (defaultMessages[rules[rule]] && defaultMessages[rules[rule]](messages)) ||
                          validation;
        }
      }
    });
    return input;
  }

  /**
   * dispatchAction()
   * Dispatch action to store
   *
   * @param {Object} state - input state
   */
  function dispatchInputAction(state, name) {
    next({
      type: 'MODEL_INPUT_VALIDATION',
      model: model.name,
      component,
      inputName: name,
      state,
    });
  }

  function dispatchFormAction(formState) {
    next({
      type: 'MODEL_FORM_VALIDATION',
      model: model.name,
      component,
      state: formState,
    });
  }

  function dispatchErrorFormAction(formState, message) {
    formState.valid = false;
    if (typeof message === 'string') {
      formState.message = message;
    }
    dispatchFormAction(formState);
  }
  /**
   * validateInput()
   * Validate one input (multiple rules)
   *
   * Default:
   *   @return {Bool} isValid - input validation state
   * if validation incluse an async validation rule, we return a promise
   *   @return {Promise} inputState.promise.promise - Return a promise that will trigger a resolved or reject state depending on input validity.
   */
  function validateInput(name = inputName, value = inputValue, inputData = inputObject) {
    // get validation rules
    const modelData = model.data[name];
    const inputType = inputData.toString();
    // get input state
    if(!modelData || !modelData.validate){
      console.warn('undefined validation rules for ' + name);
      return {
        isValid : true,
        value: value,
      };
    }
    
    let inputState = validateRules(modelData.validate, value, inputData, inputType);
    // we save the value for the store
    inputState.currentValue = value;

    // is the input has an async validation rule;
    if (inputState.isPromise) {
      dispatchInputAction({state:'isValidating'}, name);
      // in case any other rules state the input is not valid, reject promise
      if (!inputState.valid) { inputState.promise.reject(inputState); }

      // if validation function resolve promise, dispatch a valid action on the input
      inputState.promise.promise.then(() =>{
        inputState.state = 'done';
        inputState.valid = true;
        inputState.message = '';
        dispatchInputAction(inputState, name);
      })
      // if validation fails because of another validation rule or
      // any other rules state the input is not valid, reject promise
      .catch((state) => {
        inputState.state = 'done';
        inputState.valid = false;
        // other rules pass back an object
        if (typeof state === 'object') {
          inputState = state;
        // in case the async validation rule pass down an error message when it reject it.
        }else if (typeof state === 'string') {
          inputState.message = state;
        }
        // dispatch input error status to the store
        dispatchInputAction(inputState, name);
      });
      // return promise so it can be used in component code. this.validateInput('username').then()
      return inputState.promise.promise;
    }
    // in case we are not in a promise, dispatch input state
    // & return input validity, so it can be used in component code. if(this.validateInput('username')){}
    if(inputState.valid){
      inputState.message = '';
    }
    dispatchInputAction(inputState, name);
    return {
      isValid : inputState.valid,
      value: value,
    };
  }

/**
   * getFormValues(form.elements)
   * return form values
   * 
   * @param {form} form.elements -html5 form elements
   * @return {object} formValues - all form values
   */
  function getFormValues(formElements = form) {
    let formValues = {};

    for (let i=0; i<formElements.length; i++){
      if(formElements[i].name){
        formValues[formElements[i].name] = formElements[i].value;
      }
    }
    return formValues;
  }
  /**
   * validateForm()
   * Validate form with multiple inputs
   *
   * Default:
   *   @return {Bool} isValid - form validation state
   * if validation incluse an async validation rule, we return a promise
   *   @return {Promise} form.promise.promise - Return a promise that will trigger a resolved or reject state depending on form validity.
   */
  function validateForm() {
    // Default form state
    let formState = {
      valid: true,
      isPromise: false,
      async: new Deferred(),
    };
    // promises are added in validateInputs() & used in handleInputsPromises()
    let promises = [];

    // validate all inputs, send a validity action for all inputs
    validateInputs();
    // async validators? That change the flow
    const promiseInputs = handleInputsPromises();
    if (promiseInputs) {
      return promiseInputs;
    }

    // do we need to go a global async validation in sync mode
    const validateAsync = handleFormAsyncValidation();
    if (validateAsync) {
      return validateAsync;
    }

    // validate sync function, already validated in case of async validators & handled in handleInputsPromises.
    if (model.validate) {
      const validateState = model.validate(form, store.dispatch)
      formState.valid = validateState.valid;
      formState.message = validateState.errorMessage || model.validateErrorMessage || '';
    }
    dispatchFormAction(formState);
    // not async return a bool to the component
    return {
      isValid: formState.valid,
      inputs: getFormValues(),
    }
    /**
     * validateInputs()
     * iterate on form.elements & validate all inputs
     */
    function validateInputs() {
      const elements = getFormValues();
      // validate for each input
      Object.keys(elements).forEach( input => {
        // form.elements contain both a numeric and named object for the same input
        // use the named only
        if(!isNaN(input)){return;}
        const inputState = validateInput( input, form[input].value, form[input]);
        // if return a bool false
        if (!inputState.isValid && !inputState.then) {
          formState.valid = false;
        }
        // if return a promise we add the promise to array for later use of promise.all()
        if (inputState.then) {
          formState.isPromise = true;
          promises.push(inputState);
        }
      });
    }
    /**
     * rejectPromise()
     * Small utils used by handleInputsPromises() & handleFormAsyncValidation
     * Used to reject early when in async mode
     *
     * @return {Promise} formState.async.promise
     */
    function rejectPromise() {
      formState.async.reject();
      formState.valid = false;
      dispatchFormAction(formState);
      return formState.async.promise;
    }
    /**
     * handleInputsPromises()
     * Used to validate all input promises
     * Also contain workflow to finish validation
     *
     * @return {Promise} formState.async.promise || formState.asyncAll
     */
    function handleInputsPromises() {
      if (formState.isPromise) {
        // is we already know the form is not valid form sync input validation, reject
        // we also validate the global model sync validation
        // we must reject an empty promise, you cannot reject Promise.all manually
        if (!formState.valid || (model.validate && !model.validate(form, store.dispatch).valid)) {
          return rejectPromise();
        }
        // we need to return the final promise
        // in the case of a inputAsync & a formAsync we must add the form async
        // to the inputs promise array 
        if(model.validateAsync){
          promises.push(handleFormAsyncValidation());
        }
        // add all promises together
        formState.asyncAll = Promise.all(promises);
        // all the promise resolve, move ahead!
        formState.asyncAll.then(() =>{
          dispatchFormAction(formState);
        })
        // if validation fails because one of the promise does not resolve
        .catch((message) => {
          dispatchErrorFormAction(formState, message);
        });
        // when in promise mode we return a promise to the component
        return formState.asyncAll;
      }
    }
    /**
     * handleFormAsyncValidation()
     * Used to validate global model async validation
     *
     * @return {Promise} model.validateAsync.promise
     */
    function handleFormAsyncValidation() {
      // model has an async function
      if (model.validateAsync) {
        dispatchFormAction({state:'isValidating'});
        // reject early of form is already not valid
        if (!formState.valid || (model.validate && !model.validate(form, store.dispatch))) {
          return rejectPromise();
        }
        // call validate async function & return the promise
        model.validateAsync.call(formState.async, form, store.dispatch);
        formState.async.promise.then(() => {
          formState.state = 'done';
          dispatchFormAction(formState);
        }).catch((message) => {
          formState.state = 'done';
          dispatchErrorFormAction(formState, message);
        });
        return formState.async.promise;
      }
    }

  }
  /**
   * init the validation middleware
   * Are we validating a form or an input
   */
  if (inputName) {
    return validateInput();
  }
  if (form) {
    return validateForm();
  }
};
