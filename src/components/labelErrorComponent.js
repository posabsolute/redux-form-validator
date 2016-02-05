/*!
 * Redux-form-validation
 * Error Label Component
 * You can use this component to display error messages in your app. Also support hidden classes
 */
import React from 'react';
import classNames from 'classnames/bind';
/**
 * Error Label Component
 * return a stateless react component
 * @param {Object} classes - Default css classes always added to the component
 * @param {Object} field - Input store current values, inbluding if the input is valid
 * @return {React Component} Return the component.
 */
export default ({classes, field}) => {
  const labelClass = classNames({
    [classes]: true,
    'label-error': true,
    'label-error--hidden': field.valid === false ? false : true,
  });

  return (
    <div className={labelClass}>
      { field.message }
    </div>
  );
};
