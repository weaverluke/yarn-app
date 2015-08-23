'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	PickerIOS,
	PickerItemIOS,
	TouchableWithoutFeedback
} = React;

var actions = require('../../actions/actions');

var languages = {
	pl: {
		name: 'Polish'
	},
	de: {
		name: 'German'
	},
	es: {
		name: 'Spanish'
	},
	ja: {
		name: 'Japanese'
	}
};

var Settings = React.createClass({

	getDefaultProps: function () {
		return {
			onClose: function () {}
		};
	},

	getInitialState: function () {
		return {
			lang: this.props.initialLang
		}
	},

	render: function () {
		return (
			<View style={styles.overlay}>
				<View style={styles.content}>
					<Text>Settings View</Text>

					<PickerIOS
						selectedValue={this.state.lang}
						onValueChange={this.onLanguageChange}
					>
						{this.renderLangs()}
					</PickerIOS>

					<TouchableWithoutFeedback onPress={this.onClose}>
						<Text>Tap here to close</Text>
					</TouchableWithoutFeedback>
				</View>
			</View>
		);
	},

	onLanguageChange: function (lang) {
		console.log('Chosen lang: ', lang);
		this.setState({
			lang: lang
		});
	},

	renderLangs: function () {
		var items = Object.keys(languages).map(function (langCode) {
			var lang = languages[langCode];
			return (
				<PickerItemIOS
					key={langCode}
					value={langCode}
					label={lang.name}
				/>
			);
		});
		return items;
	},

	onClose: function () {
		if (this.props.lang !== this.state.lang) {
			actions.emit(actions.CHANGE_LANG, this.state.lang);
		}
		this.props.onClose();
	}
});

var styles = StyleSheet.create({

	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		backgroundColor: 'rgba(0,0,0,0.75)',
		flex: 1
	},

	content: {
		backgroundColor: '#FFFFFF',
		margin: 10,
		padding: 10,
		borderRadius: 3
	}
});


module.exports = Settings;
