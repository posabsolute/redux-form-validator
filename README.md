# Redux Form Validation
An es6 redux form validator middleware that helps you manage inputs. This middleware is not about keeping your global form state; it's about keeping your form validation state.

If you are looking for a fully controlled input approach, you should head to redux-form.

About controlled inputs:  [My controlled input dilemma with react & redux](http://www.position-absolute.com/?p=5264) 

Demo: [Live Example](http://posabsolute.github.io/redux-form-validator-example/) | [Source](https://github.com/posabsolute/redux-form-validator-example)

Documentation: [http://posabsolute.github.io/redux-form-validator](http://posabsolute.github.io/redux-form-validator)


## Integration


1 npm install 'redux-form-validation' --save


2 Add the reducer to your root reducer

```javascript

import {validateReducer} from 'redux-form-validation';

const rootReducer = combineReducers({
  validate: validateReducer,
});

export default rootReducer;
```

3 Add the validate middleware
```javascript
import {validateMiddleware} from 'redux-form-validation';

const createStoreWithMiddleware = compose(
    validateMiddleware,
  ),
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore);

```

4 Connect Validate store, actions & specify the component & model to validate. It is important this be available throughout every component that uses validation, you can trickle them down through props.

In your componentWillMount init the validation component:

```javascript
import {validate, validateActions} from 'redux-form-validation';

const mapStateToProps = (state) => {
  return {
    validationStore: state.validation,
  };
};

const mapDispatchToProps = (
  dispatch,
) => {
  return {
    ...bindActionCreators(validateActions, dispatch),
  };
};


@connect(mapStateToProps, mapDispatchToProps)
export default class LoginComponent extends React.Component {
  componentWillMount() {
    this.validate = validate(this, userModel);
  }
  render() {
    return <LoginForm {...this.props} validate={this.validate} />;
  }
}
```

5. Add validation to your inputs, there is also an error label component for your convenience.

  a. add {...validate} to your input
  b. add a name to your input (the middleware use the html5 form.elements)
  c. To get the error class on your input, use className={validate.classes('input-line', 'url')}

It should look like:
```javascript
<input type="text" className={validate.classes('input-line', 'url')} ref="url" name="url" placeholder="Your Url" {...validate} />
<LabelError field={validate.fieldStore('url')} />
```

```javascript
import React from 'react';
import LabelError from 'components/validation/labelErrorComponent';

class LoginFormComponent extends React.Component {
  render() {
    const {validate, onSubmit} = this.props;
    return (
      <form className="col-sm-6 col-lg-12 login-bottom-container" onSubmit={ (evt) => { evt.preventDefault(); onSubmit.call(this, validate);} }>
        <div className="form-group">
          <input type="text" className={validate.classes('input-line', 'url')} ref="url" name="url" placeholder="Jira Url (http://company.jira.net)" {...validate} />
          <LabelError field={validate.fieldStore('url')} />
        </div>
        <div className="form-group">
          <input type="text" className={validate.classes('input-line', 'username')} ref="username" name="username"  placeholder="Username" {...validate} />
          <LabelError field={validate.fieldStore('username')} />
        </div>
        <div className="form-group">
          <input type="password"  ref="password"  name="password" className={validate.classes('input-line', 'password')} placeholder="Password" {...validate} />
        </div>
        <div className="relative"><button type="submit" className="btn btn-default btn-full" >Sign in</button></div>
      </form>
    );
  }
}
```

6. Create a model

Anatomy of a model

```javascript
const userModel = {
  name:'userModel',
  data: {
    'url': {
      validate: {
        required: true,
        func: (value) => {
          return true;
        },
        message: 'This is a test',
      },
    },
  },
}
```

7 Using webpack? include jsx/es6
```javascript
  module: {
    loaders: [{
      test:[/\.jsx$/,  /\.js$/],
      loaders: ['react-hot', 'babel?stage=0&loose[]=es6.modules'],
      include: [
        path.resolve(__dirname, "src"),
        path.resolve(__dirname, "node_modules/redux-form-validator")
      ],
    }, {
      test: [/\.scss$/, /\.css$/],
      loader: 'css?localIdentName=[path]!postcss-loader!sass',
    }],
  },
};
```

8 You're done.


## Using actions

You can use validation actions to execute code depending if the form or input is valid. It's a good way to control side effects like calling an api action once the field if valid.

### Validate Sync Form
```javascript
onSubmit: function(validateProps) {
  const inputs = this.refs;
  if (validateProps.form(form)) {
    // form is valid, redirect to nre page
  }else{
    // form is not valid
  }
}
```
### Validate Async Form
If you validate asyncly 1 input or form, you must use a promise instead of just using a bool.
```javascript
onSubmit: function submit(validateProps) {
  const inputs = this.refs;
  validateProps.form(inputs).then(() =>{
    console.log('form is valid');
  }).catch(() => { 
    console.log("form is not valid"); 
  });
}
```

### Validate Sync input

```javascript
if(this.validate.input(value, field)){
  // input is valid
}else{
  // input is not valid
}
```


### Validate Async input

```javascript
this.validate.input(value, field).then(() => {
  // input is valid
})
.catch(function(errorMessage) {
  // input is not valid
});
```


## Validation model

### data

A Model must have a data object that describe fields to validate. Under the validate object list all the validators you want to use.

### Global Validate functions

The model can also have global validation functions that are executed once all inputs are valid.

#### validate(form, dispatch)

Used to do sync validations after all your inputs are valid. Must return true or false

```javascript
const userModel = {
  name:'userModel',
  data: {
    'url': {
      validate: {
        required: true,
        func: (value) => {
          return true;
        },
        message: 'This is a test',
      },
    },
  },
  validate: (form, dispatch) => {
    // form
    let validate = false;
    if (!form.url.value) {
      dispatch({
        type: 'GROWLER__SHOW',
        growler: {
          text: 'Please enter your url',
          type: 'growler--error',
        },
      });
      validate = false;
    }

    return true;
  },
};
```

## Built-in validators

### func validator

Lets you implement a custom function used for validation.

```js
const userModel = {
  name:'userModel',
  data: {
    'username': {
      validate: {
        required: true,
        pattern: 'email',
        async: function() {
          setTimeout( () => {
              this.resolve("yes");
          }, 5000);
        },
      },
    },
```




### async validator

Lets you implement a custom async function used for validation using a Promise. Must return this.resolve or this.reject. You can reject with a custom message passed as a string.

```js
const userModel = {
  name:'userModel',
  data: {
    'username': {
      validate: {
        required: true,
        pattern: 'email',
        async: function() {
          setTimeout( () => {
              this.reject("Sorry, this username is already used.");
          }, 5000);
        },
      },
    },
```

### required

Validates if the attribute is required or not.
This can be specified as either a boolean value or a function that returns a boolean value.

```js
const userModel = {
  name:'userModel',
  data: {
    'username': {
      validate: {
        required: true,
        pattern: 'email',
      },
    },
  },
};
```

### acceptance

Validates that something has to be accepted, e.g. terms of use. `true` or 'true' are valid.

```js
const userModel = {
  name:'userModel',
  data: {
    'username': {
      validate: {
        required: true,
      acceptance: true
    }
  }
};
```

### min

Validates that the value has to be a number and equal to or more than the min value specified.

```js
const userModel = {
  name:'userModel',
  data: {
    'age': {
      validate: {
        min: 1,
      }
    }
  }
});
```

### max

Validates that the value has to be a number and equal to or less than the max value specified.

```js
const userModel = {
  name:'userModel',
  data: {
    'age': {
      validate: {
        max: 100,
      }
    }
  }
};
```

### range

Validates that the value has to be a number and equal to or between the two numbers specified.

```js
const userModel = {
  name:'userModel',
  data: {
    'age': {
      validate: {
        range: [1, 10],
      }
    }
  }
};
```

### length

Validates that the value has to be a string with length equal to the length value specified.

```js
const userModel = {
  name:'userModel',
  data: {
    'postalCode': {
      validate: {
        length: 4,
      }
    }
  }
};
```

### minLength

Validates that the value has to be a string with length equal to or greater than the min length value specified.

```js
const userModel = {
  name:'userModel',
  data: {
    'password': {
      validate: {
         minLength: 8
      }
    }
  }
};
```


### maxLength

Validates that the value has to be a string with length equal to or less than the max length value specified.

```js
const userModel = {
  name:'userModel',
  data: {
    'password': {
      validate: {
        maxLength: 100
      }
    }
  }
};
```

### rangeLength

Validates that the value has to be a string and equal to or between the two numbers specified.

```js
const userModel = {
  name:'userModel',
  data: {
    'password': {
      validate: {
        rangeLength: [6, 100]
      }
    }
  }
};
```

### oneOf

Validates that the value has to be equal to one of the elements in the specified array. Case sensitive matching.

```js
const userModel = {
  name:'userModel',
  data: {
    'country': {
      validate: {
        oneOf: ['Norway', 'Sweeden']
      }
    }
  }
};
```

### equalTo

Validates that the value has to be equal to the value of the attribute with the name specified.

```js
const userModel = {
  name:'userModel',
  data: {
    'password': {
      validate: {
        equalTo: 'password'
      }
    }
  }
};
```


### pattern

Validates that the value has to match the pattern specified. Can be a regular expression or the name of one of the built in patterns.

```js
const userModel = {
  name:'userModel',
  data: {
    'email': {
      validate: {
        pattern: 'email'
      }
    }
  }
};
```

The built-in patterns are:

* number - Matches any number (e.g. -100.000,00)
* email - Matches a valid email address (e.g. mail@example.com)
* url - Matches any valid url (e.g. http://www.example.com)
* digits - Matches any digit(s) (i.e. 0-9)

Specify any regular expression you like:

```js
const userModel = {
  name:'userModel',
  data: {
    'email': {
      validate: {
        pattern: /^sample/
      }
    }
  }
};
```

## Contributions

There is plenty to do in the issue tracker, look at the 1.1 milestone


## Limitations

This component is based on the use of redux, react, es6 & es7 (decorators) and webpack for loading the css as an import module.
