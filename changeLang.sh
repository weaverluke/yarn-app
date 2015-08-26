#!/bin/bash
if [ -f ./words-full.js ]; then
    mv words.js words-tmp.js
    mv words-full.js words.js
else 
    mv words.js words-full.js
    mv words-tmp.js words.js
fi
