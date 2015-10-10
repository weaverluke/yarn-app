#import <UIKit/UIKit.h>

//#import "RCTBridge.h"
//#import "RCTBridgeModule.h"
//@class RCTBridge;
# import "DictionaryProxy.h"
//#import "RCTEventDispatcher.h"

@interface NativeDictionaryProxy : UIReferenceLibraryViewController
@property DictionaryProxy *proxy;
//@property RCTResponseSenderBlock callback;
//@property (nonatomic, weak) RCTEventDispatcher *bridge;
- (void)registerDictProxy:(DictionaryProxy*)dp;

@end

