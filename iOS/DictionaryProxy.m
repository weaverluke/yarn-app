//
//  DictionaryProxy.m
//  yarn
//
//  Created by Mateusz Wozniak on 25.08.2015.
//  Copyright (c) 2015 weaverdigital. All rights reserved.
//

#import "DictionaryProxy.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
#import "NativeDictionaryProxy.h"


@implementation DictionaryProxy
  @synthesize bridge = _bridge;

  RCT_EXPORT_MODULE()

  RCT_EXPORT_METHOD(showDefinition:(NSString *)word) {
  
	UIWindow *keyWindow = [[UIApplication sharedApplication] keyWindow];
	UIViewController *rootViewController = keyWindow.rootViewController;
  
	NativeDictionaryProxy *referenceLibraryViewController =
	[[NativeDictionaryProxy alloc] initWithTerm:word];
	
	// send reference to bridge to NativeDictionary Proxy so it can notify react-native app that it has been closed
	[referenceLibraryViewController registerBridge:self.bridge];
  
	[rootViewController presentViewController:referenceLibraryViewController animated:YES completion:nil];
  }

//RCT_EXPORT_METHOD((BOOL)dictionaryHasDefinitionForTerm:(NSString *)word) {
//  return [UIReferenceLibraryViewController dictionaryHasDefinitionForTerm:word];
//}

//RCT_EXPORT_METHOD(dictionaryHasDefinitionForTerm:(NSString *)word callback:(RCTResponseSenderBlock)callback)
//{
//  callback(@[@([UIReferenceLibraryViewController dictionaryHasDefinitionForTerm:word])]);
//}


@end
