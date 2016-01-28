'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Image
} = React;

var NavigatedView = require('../navigatedview/navigatedview');

var Guardian = React.createClass({

	render: function () {

		var content = (
			<View style={styles.flex}>
				<View style={styles.topImageBox}>
					<Image source={{uri: 'guardian-top.png'}} style={styles.wideImage} />
				</View>

				<View style={styles.flex}>
					<Image source={{uri: 'guardian-content.png'}} style={styles.wideImage} />
				</View>
			</View>

		);

		return (
			<NavigatedView
				content={content}
				backText={'Back'}
				titleText={'Got The Guardian app?'}
				onBackPressed={this.props.onClose}
				animateOpacity={false}
			/>
		)

	}

});

var styles = StyleSheet.create({

	wideImage: {
		flex: 1,
		resizeMode: Image.resizeMode.contain
	},

	topImageBox: {
		justifyContent: 'flex-start',
		height: 100
	},

	flex: {
		flex: 1
	}

});

module.exports = Guardian;
