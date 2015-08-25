//
//  DictionaryProxy.m
//  yarn
//
//  Created by Mateusz Wozniak on 25.08.2015.
//  Copyright (c) 2015 weaverdigital. All rights reserved.
//

#import "DictionaryProxy.h"
#import "RCTBridge.h"

@implementation DictionaryProxy
  RCT_EXPORT_MODULE()

  RCT_EXPORT_METHOD(showDefinition:(NSString *)word) {
  
	UIWindow *keyWindow = [[UIApplication sharedApplication] keyWindow];
	UIViewController *rootViewController = keyWindow.rootViewController;
  
	UIReferenceLibraryViewController *referenceLibraryViewController =
	[[UIReferenceLibraryViewController alloc] initWithTerm:word];
  
	[rootViewController presentViewController:referenceLibraryViewController animated:YES completion:nil];
  }
@end
