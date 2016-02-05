/*!
 * Redux-form-validation
 * Component props
 * props are added to an input
 * must be init in componentDidMount.  this.validate = validate(this, myModelToValidate);
 */

import classNames from 'classnames/bind';

const validate = (component, model, validatorName) => {

  function getComponentName() {
    return validatorName || component.constructor.name;
  }
  /**
   * init()
   * Check you have everything you need to validate form & inputs
   * Set default component/model state in the store
   */
  function init() {
    if (!model.name) {
      console.warn('Model has no name, validation will not work');
    }
    if (!model.data) {
      console.warn('Your model has no validation rules under data');
    }
    if (!getComponentName()) {
      console.warn('Your form name is undefined, it should be passed as 3rd argument');
    }
    // Call actions set default component/model state in the store
    component.props.setDefaultValidatorState(getComponentName(), model.name);
  }
  init();
  /**
   * return helpers that can be used by the component
   */
  return {
    /**
     * onBlur()
     * Input onBlur Event is overriden to validate input
     * you can easily override this function & do the validation yourself with component.validate.input(evt.target.value, evt.target.name);
     * @param {Object} evt - input blur react event
     */
    onBlur: (evt) => {
      component.validate.input(evt.target.value, evt.target.name, evt.target.form.elements[evt.target.name], evt.target.form.elements);
    },
    /**
     * fieldStore()
     * get the input store state back
     * @param {String} field - Name of the input
     * @return {Object} fieldStore - The store values for this input (including if it is valid)
     */
    fieldStore: (field) => {
      let fieldStore = {};
      const store = component.props.validationStore;
      if(!store){ console.warn('validation store is undefined'); }
      
      if (store && store[getComponentName()] && store[getComponentName()][model.name] && store[getComponentName()][model.name][field]) {
        fieldStore = store[getComponentName()][model.name][field];
      }
      return fieldStore;
    },

    /**
     * formStore()
     * get the form store state back
     * @return {Object} formStore - The store values for this form (including if it is valid)
     */
    formStore: () => {
      let formStore = {};
      const store = component.props.validationStore;
      if(!store){ console.warn('validation store is undefined'); }
      if (store && store[getComponentName()] && store[getComponentName()][model.name] && store[getComponentName()][model.name]) {
        formStore = store[getComponentName()][model.name];
      }
      return formStore;
    },
    /**
     * classes()
     * return the css classes for an input, validating agains the input storex
     * @param {Object} classes - Passed at the component level, classes always added to the input component
     * @param {String} el - Name of the input
     * @return {String} inputClasses - Return all the classes in 1 string for this input
     */
    classes: (classes, el) => {
      if (!el) {
        console.warn('You must pass the inputname when using validate.classes');
      }
      let inputClasses;
      if (typeof classes === 'object') {
        inputClasses = {
          ...classes,
          'input-validation-error': !component.validate.isInputValid(el),
        };
      } else {
        inputClasses = {
          [classes]: true,
          'input-validation-error': !component.validate.isInputValid(el),
        };
      }
      return classNames(inputClasses);
    },
    /**
     * isInputValid()
     * return if the input is valid from the value in the store
     * @param {String} el - Name of the input
     * @return {Bool} isValid - Return is the input is valid
     */
    isInputValid: (el) => {
      let isValid = true;
      if (component.validate.fieldStore(el).valid === false) {
        isValid = false;
      }
      return isValid;
    },
    /**
     * input()
     * Call the input validation action
     * @param {String} value - Value of the input
     * @param {String} name - Name of the input
     * Default:
     *   @return {Bool} isValid - input validation state
     * if validation incluse an async validation rule, we return a promise
     *   @return {Promise} inputState.promise.promise - Return a promise that will trigger a resolved or reject state depending on input validity.
     */
    input: (value, name, inputObject, form) => {
      return component.props.validateInput(value, name, getComponentName(), model, inputObject, form);
    },
    /**
     * form()
     * Call the input validation action
     * @param {String} value - Value of the input
     * @param {String} name - Name of the input
     * Default:
     *   @return {Bool} isValid - input validation state
     * if validation incluse an async validation rule, we return a promise
     *   @return {Promise} inputState.promise.promise - Return a promise that will trigger a resolved or reject state depending on input validity.
     */
    formValidate: (inputs) => {
      return component.props.validateForm(inputs, getComponentName(), model);
    },
  };
};

export default validate;
