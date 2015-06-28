/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  WebView
} = React;

var HEADER = '#F9FAFB';
var BORDER = '#E7EAEA';
var BGWASH = 'rgba(255,255,255,0.8)';
var DISABLED_WASH = 'rgba(255,255,255,0.25)';

var TEXT_INPUT_REF = 'urlInput';
var WEBVIEW_REF = 'webview';
var DEFAULT_URL = 'http://webngn.pl';

var yarn = React.createClass({

  getInitialState: function() {
    return {
      url: DEFAULT_URL,
      status: 'No Page Loaded',
      backButtonEnabled: false,
      forwardButtonEnabled: false,
      loading: true,
      popupVisible: false,
      words: []
      // words: ['foo','bar','baz']
    };
  },

  inputText: '',

  handleTextInputChange: function(event) {
    this.inputText = event.nativeEvent.text;
  },

  render: function() {
    this.inputText = this.state.url;

    console.log('app', this.showPopup);

    return (
      <View style={[styles.container]}>
        <View style={[styles.addressBarRow]}>
          <TouchableOpacity onPress={this.goBack}>
            <View style={this.state.backButtonEnabled ? styles.navButton : styles.disabledButton}>
              <Text>
                 {'<'}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.goForward}>
            <View style={this.state.forwardButtonEnabled ? styles.navButton : styles.disabledButton}>
              <Text>
                {'>'}
              </Text>
            </View>
          </TouchableOpacity>
          <TextInput
            ref={TEXT_INPUT_REF}
            autoCapitalize="none"
            value={this.state.url}
            onSubmitEditing={this.onSubmitEditing}
            onChange={this.handleTextInputChange}
            clearButtonMode="while-editing"
            style={styles.addressBarTextInput}
          />
          <TouchableOpacity onPress={this.pressGoButton}>
            <View style={styles.goButton}>
              <Text>
                 Go!
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <WebView
          ref={WEBVIEW_REF}
          automaticallyAdjustContentInsets={false}
          style={styles.webView}
          url={this.state.url}
          javaScriptEnabledAndroid={true}
          onNavigationStateChange={this.onNavigationStateChange}
          startInLoadingState={false}
        />
      </View>
    );
  },

  componentDidMount: function () {
    // rnfs.readFile('./yarnHighlight.js').then(function (c) {
    //   console.log(this.highlighterSource);
    // });

    // this.highlighterSource = fs.readFile('./yarnHighlight.js', 'utf-8', function (err, content) {
    //   console.log(this.highlighterSource);
    // }.bind(this));

    // this.refs[WEBVIEW_REF].onMessage(this.onBridgeMessage.bind(this));
  },

  scheduleParsing: function () {
    if (this.parseTimeout) {
      clearTimeout(this.parseTimeout);
    }
    this.parseTimeout = setTimeout(function () {
      this.parseTimeout = undefined;
      // debugger;
      // this.refs[WEBVIEW_REF].evaluateJavaScript('document.documentElement.outerHTML', function (err, result) {
      //   console.log('website content:', result);
      //   this.parseWebsiteContent(result);
      // }.bind(this));
    }.bind(this), 500);
  },

  parseWebsiteContent: function (html) {
    readability(html, function (error, article, meta) {

      var textContent = article.content.replace(/  +/g, ' '); // if there are multiple spaces, replace them into single one
      var words = splitGluedTogetherWords(textContent);
      console.log('parsed words,', words);
      var w = [];

      for (var i = 4; i-- >=0;) {
        w.push(words[~~(Math.random() * words.length)]);
      }
      this.setState({
        words: w
      });
    }.bind(this));
  },

  onBridgeMessage: function () {

  },

  showPopup: function (rect) {
    this.setState({
      popupVisible: true,
      buttonRect: rect
    });
  },

  closePopup: function () {
    this.setState({
      popupVisible: false
    });
  },

  goBack: function() {
    this.refs[WEBVIEW_REF].goBack();
  },

  goForward: function() {
    this.refs[WEBVIEW_REF].goForward();
  },

  reload: function() {
    this.refs[WEBVIEW_REF].reload();
  },

  onNavigationStateChange: function(navState) {
    console.log('onNavigationStateChange', navState);
    this.setState({
      backButtonEnabled: navState.canGoBack,
      forwardButtonEnabled: navState.canGoForward,
      url: navState.url,
      status: navState.title,
      loading: navState.loading,
    });
    if (!navState.loading) {
      this.scheduleParsing();
    }

    // if (!navState.loading) {
    //   this.setState({
    //     words: ['one', 'two', 'three']
    //   });
    // }
    // var html = this.refs[WEBVIEW_REF].html;



    // var html = '<html><head></head><body><div>' + navState.title + '</div></body></html>';

    // if (navState.title) {
    //   console.log('reading page content');
    //   readability(html, {
    //     considerDIVs: true,
    //     nodesToRemove: 'meta,iframe,noscript,style,aside,object,script'
    //   }, function (error, article, meta) {

    //     // var words = splitGluedTogetherWords(article);

    //     // var article = extractor(this.refs[WEBVIEW_REF].html);
    //     var article = 'foo bar baz';
    //     var words = article.split(' ');
    //     var w = [];
    //     for (var i = 4; i-- >=0;) {
    //       w.push(words[~~(Math.random() * words.length)]);
    //     }
    // //     // words.sort();
    //     this.setState({
    //       words: w//words.slice(0, 4);
    //     });
    //   }.bind(this));
    // }
  },

  onSubmitEditing: function(event) {
    this.pressGoButton();
  },

  pressGoButton: function() {
    var url = this.inputText.toLowerCase();
    if (url === this.state.url) {
      this.reload();
    } else {
      this.setState({
        url: url,
      });
    }
    // dismiss keyoard
    this.refs[TEXT_INPUT_REF].blur();
  },

});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEADER,
  },
  addressBarRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER
  },
  webView: {
    backgroundColor: BGWASH,
    height: 350,
  },
  addressBarTextInput: {
    backgroundColor: BGWASH,
    borderColor: BORDER,
    borderRadius: 3,
    borderWidth: 1,
    height: 24,
    paddingLeft: 10,
    paddingTop: 3,
    paddingBottom: 3,
    flex: 1,
    fontSize: 14,
  },
  navButton: {
    width: 20,
    padding: 3,
    marginRight: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BGWASH,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 3,
  },
  disabledButton: {
    width: 20,
    padding: 3,
    marginRight: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DISABLED_WASH,
    borderColor: 'transparent',
    borderRadius: 3,
    color: '#AAAAAA'
  },
  goButton: {
    height: 24,
    padding: 3,
    marginLeft: 8,
    alignItems: 'center',
    backgroundColor: BGWASH,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 3,
    alignSelf: 'stretch',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    height: 22,
  },
  statusBarText: {
    color: 'white',
    fontSize: 13,
  },
  spinner: {
    width: 20,
    marginRight: 6,
  },

  popup: {
    width: 100,
    height: 100,
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'red'
  }
});


AppRegistry.registerComponent('yarn', () => yarn);
