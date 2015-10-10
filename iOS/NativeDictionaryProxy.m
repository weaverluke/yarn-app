#import "NativeDictionaryProxy.h"

//#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
//#import "RCTBridgeModule.h"


@implementation NativeDictionaryProxy

//@synthesize bridge = _bridge;

- (void)viewDidDisappear:(BOOL)animated
{
  [super viewDidDisappear:(BOOL)animated];
  [self.proxy call];
}

- (void)registerDictProxy:(DictionaryProxy*)dp
{
  self.proxy = dp;
}

@end