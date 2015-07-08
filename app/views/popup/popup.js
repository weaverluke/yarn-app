var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback
} = React;

var Popup = React.createClass({

	render: function () {
		if (!this.props.visible) {
			return (<View />);
		}

		return (
			<TouchableWithoutFeedback onPress={this.props.onClose}>
				<View style={styles.overlay} >
					<View style={styles.popup}>
						<TouchableWithoutFeedback onPress={this.props.onSubmit}>
							<Text>Next</Text>
						</TouchableWithoutFeedback>
					</View>
				</View>
			</TouchableWithoutFeedback>
		);
	}

});


var styles = StyleSheet.create({

	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		backgroundColor: 'rgba(0,0,0,0)',
		flex: 1
	},

	popup: {
		position: 'absolute',
		left: 10,
		bottom: 40,
		flex: 1,
		borderWidth: 1,
		borderColor: '#000000',
		backgroundColor: '#FFFFFF',
		width: 360,
		height: 300
	}

});

module.exports = Popup;
