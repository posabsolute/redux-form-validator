/*!
 * Redux-form-validation
 * Messages
 * Default validation messages, input error messages can be overriden in the model
 */
export default {
  required: () => `This field is required`,
  acceptance: () => `You must be accept the terms`,
  min: (messages) => `Must be greater than or equal to ${messages.rule}`,
  max: (messages) => `Must be less than or equal to ${messages.rule}`,
  range: (messages) => `Must be between ${messages.rule[0]} and ${messages.rule[1]}`,
  length: (messages) => `Must be ${messages.rule} characters`,
  minLength: (messages) => `Must be at least ${messages.rule} characters`,
  maxLength: (messages) => `Must be at most ${messages.rule} characters`,
  minChecked: (messages) => `Choose at least ${messages.rule} options`,
  maxChecked: (messages) => `Choose a maximum of ${messages.rule} options`,
  rangeLength: (messages) => `Must be between ${messages.rule[0]} and ${messages.rule[1]} characters`,
  oneOf: (messages) => `Must be one of: ${messages.rule}`,
  equalTo: (messages) => `Must be the same as ${messages.rule}`,
  digits: () => `Must only contain digits`,
  number: () => `Must be a number`,
  email: () => `Must be a valid email`,
  url: () => `Must be a valid url`,
  inlinePattern: () => `Is invalid`,
};

