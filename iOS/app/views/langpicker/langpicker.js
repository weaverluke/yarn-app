'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	PickerIOS
} = React;

var PickerItemIOS = PickerIOS.Item;

var config = require('../../config');
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

	componentWillReceiveProps: function (props) {
		this.setState({lang: props.lang});
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

LangPicker.getLanguageName = function (shortcut) {
	for (var i = 0; i < languages.length; i++) {
		if (languages[i].language === shortcut) {
			return languages[i].name;
		}
	}
	return shortcut;
};

var styles = StyleSheet.create({

	langPicker: {
		// it's impossible to center PickerIOS (https://github.com/facebook/react-native/issues/3228)
		// so we compute left margin manually
		//marginLeft: width/2 - PICKER_WIDTH/2
	},

	spacer: {
		flex: 1
	}

});

module.exports = LangPicker;