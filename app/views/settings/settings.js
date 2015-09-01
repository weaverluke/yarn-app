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
var languages = require('./googlelanguages');

//var languages = {
//	pl: {
//		name: 'Polish'
//	},
//	de: {
//		name: 'German'
//	},
//	es: {
//		name: 'Spanish'
//	},
//	ja: {
//		name: 'Japanese'
//	}
//};

var Settings = React.createClass({

	getDefaultProps: function () {
		return {
			onClose: function () {}
		};
	},

	getInitialState: function () {
		return {
			lang: this.props.initialLang,
			level: this.props.initialLevel
		}
	},

	render: function () {
		return (
			<View style={styles.overlay}>
				<View style={styles.content}>
					<Text>Language:</Text>
					<PickerIOS
						selectedValue={this.state.lang}
						onValueChange={this.onLanguageChange}
					>
						{this.renderLangs()}
					</PickerIOS>

					<View style={styles.level}>
						<Text style={styles.levelLabel}>User level:</Text>
						<Text style={styles.levelValue}>
							{this.state.level}
						</Text>
						<TouchableWithoutFeedback onPress={this.incrementLevel}>
							<Text style={styles.levelChangeButton}> + </Text>
						</TouchableWithoutFeedback>
						<TouchableWithoutFeedback onPress={this.decrementLevel}>
							<Text style={styles.levelChangeButton}> - </Text>
						</TouchableWithoutFeedback>
					</View>

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

	incrementLevel: function () {
		this.setState({
			level: Math.min(this.state.level + 1, 100)
		});
	},
	decrementLevel: function () {
		this.setState({
			level: Math.max(this.state.level - 1, 1)
		});
	},

	renderLangs: function () {
		var items = languages.map(function (lang) {
			var langName = lang.name;
			var langCode = lang.language;
			return (
				<PickerItemIOS
					type={1}
					key={langCode}
					value={langCode}
					label={langName}
				/>
			);
		});
		return items;
	},

	onClose: function () {
		if (this.props.initialLang !== this.state.lang) {
			actions.emit(actions.CHANGE_LANG, this.state.lang);
		}
		if (this.props.initialLevel !== this.state.level) {
			actions.emit(actions.CHANGE_LEVEL, this.state.level);
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
	},

	level: {
		flex: 1,
		flexDirection: 'row'
	},

	levelLabel: {
		flex: 4
	},

	levelValue: {
		flex: 3
	},

	levelChangeButton: {
		flex: 1,
		fontSize: 20,
		textAlign: 'center'
	}

});


module.exports = Settings;
