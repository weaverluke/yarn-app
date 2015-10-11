#import "NativeDictionaryProxy.h"
#import "RCTEventDispatcher.h"


@implementation NativeDictionaryProxy

- (void)viewDidDisappear:(BOOL)animated
{
  [super viewDidDisappear:(BOOL)animated];
  [self.bridge.eventDispatcher sendAppEventWithName:@"DictionaryHidden" body:@{}];
}

- (void)registerBridge:(RCTBridge *)dp
{
  self.bridge = dp;
}

@end