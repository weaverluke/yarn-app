var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	WebView,
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
						<Text style={styles.header}>{this.props.title}</Text>
						<WebView html={this.props.content} />
						<TouchableWithoutFeedback onPress={this.props.onSubmit}>
							<Text style={styles.nextButton}>Next</Text>
						</TouchableWithoutFeedback>
					</View>
					<View style={styles.arrow}>
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
		borderColor: '#777777',
		backgroundColor: '#FFFFFF',
		width: 340,
		height: 300,
		padding: 10
	},

	header: {
		fontWeight: '700'
	},

	nextButton: {
		paddingTop: 10,
		textAlign: 'right'
	},
	arrow: {
		position: 'absolute',
		bottom: 0,
		left: 30,
		width: 0,
		borderTopColor: '#0000FF',
		borderTopWidth: 10,
		borderLeftColor: 'rgba(0,0,0,0)',
		borderRightColor: 'rgba(0,0,0,0)'
	}

});

module.exports = Popup;
