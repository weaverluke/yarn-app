'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	PickerIOS,
	PickerItemIOS
} = React;

// see https://github.com/facebook/react-native/issues/3228
var PICKER_WIDTH = 320;

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');

var uiConfig = require('../../uiconfig');
var languages = require('./googlelanguages');

var LangPicker = React.createClass({

	getInitialState: function () {
		return {
			lang: this.props.lang
		}
	},

	render: function () {
		return (
			<View style={styles.spacer}>
				<View style={styles.spacer}/>
				<View style={styles.langPicker}>
					<PickerIOS
						selectedValue={this.state.lang}
						onValueChange={this.onLanguageChange}
					>
							{this.renderLangs()}
					</PickerIOS>
				</View>
				<View style={styles.spacer}/>
			</View>
		);
	},

	onLanguageChange: function (lang) {
		this.setState({
			lang: lang
		});
		this.props.onLanguageChange && this.props.onLanguageChange(lang);
	},

	renderLangs: function () {
		var items = languages.map(function (lang) {
			var langName = lang.name;
			var langCode = lang.language;
			return (
				<PickerItemIOS
					key={langCode}
					value={langCode}
					label={langName}
				/>
			);
		});
		return items;
	}

});

var styles = StyleSheet.create({

	langPicker: {
		// it's impossible to center PickerIOS (https://github.com/facebook/react-native/issues/3228)
		// so we compute left margin manually
		marginLeft: width/2 - PICKER_WIDTH/2
	},

	spacer: {
		flex: 1
	}

});

module.exports = LangPicker;