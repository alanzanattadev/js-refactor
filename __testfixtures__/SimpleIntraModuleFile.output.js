import React from 'react';
import style from "../__testfixtures__/style";
import Radium from 'radium';
import StateProxy from 'react-forms-state/lib/StateProxy';

class TextAreaInputField extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {isFocused: false};
  }

  render() {
    return (
      <span style={[style.inputWrapper, {height: '320px'}]} key={this.props.statePath}>
        <textarea
          onFocus={() => this.setState({isFocused: true})}
          name={this.props.name}
          ref={elem => {this.input = elem}}
          style={[style.input.text]}
          id={this.props.statePath}
          value={this.props.value}
          onChange={e => this.props.onChange(e.target.value)}
          placeholder={this.props.placeholder}
          autoComplete={this.props.autocomplete}
        />
        <label htmlFor={this.props.statePath}
          style={[
            style.input.text.label,
            {bottom: '250px', right: null, left: '0', backgroundColor: 'white'},
            (style.input.text.label.hasNoAnimation),
            {animationPlayState: (this.state.isFocused ? 'running' : 'paused')}
          ]}>
          {this.props.label}
        </label>
      </span>
    )
  }
}

TextAreaInputField.propTypes = {
  statePath: React.PropTypes.string,
  value: React.PropTypes.string,
  onChange: React.PropTypes.func,
  label: React.PropTypes.string,
  name: React.PropTypes.string,
  placeholder: React.PropTypes.string,
};

TextAreaInputField.defaultProps = {
  onChange: () => {},
  autocomplete: 'off',
};

export default StateProxy({debounceTime: 0}, {
  getValue: (child) => child.input.value,
  setValue: (child, value) => {child.input.value = value},
})(Radium(TextAreaInputField));
