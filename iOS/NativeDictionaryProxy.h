#import <UIKit/UIKit.h>

#import "RCTBridge.h"

@interface NativeDictionaryProxy : UIReferenceLibraryViewController

@property (nonatomic, weak) RCTBridge *bridge;

- (void)registerBridge:(RCTBridge*)dp;

@end

