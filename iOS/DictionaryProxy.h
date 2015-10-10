//
//  DictionaryProxy.h
//  yarn
//
//  Created by Mateusz Wozniak on 25.08.2015.
//  Copyright (c) 2015 weaverdigital. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RCTBridge.h"


@interface DictionaryProxy : NSObject <RCTBridgeModule>
-(void)call;
@end
