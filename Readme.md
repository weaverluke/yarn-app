##Release notes

v0.2.29
- in-page test mode
- use the guardian api to fetch urls of initial and random pages
- design updates according to design files

v0.2.28
- network checks around each network call added - that fixes crashes during word search and scrolling after word search
- searching bar covering settings view fixed

v0.2.27
- network error handlers improved
- re-try scenario when network fails fixed

v0.2.26
- bugfixes for "Test me" button - improved error handling
- onboarding view fixed

v0.2.25
- bugfixes

v0.2.24
- bugfixes 

v0.2.23
- update of react-native
- bugfixes related to network problems
- update of onboarding and settings views according to the newest design
- update of 'X words' bar - it's clickable now
- vocab level algorithm changed (it goes up slowly now)
- iOS status bar added

v0.2.22
- various bugfixes
- added "Random" buttons across the app
- initial vocab level changed to 30

v0.2.21
- various bugfixes

v0.2.20
- settings view
- new data structure - storing stats for each language separately
- limit vocab level to 60
- network error view connected to web view errors as well as quiz logic (e.g. when translations can't be fetched)

v0.2.19
- added onboarding screen
- improved buttons design
- added lock for "Test me" button so it doesn't work until translations for first word are downloaded
- fixed bugs with popups (e.g. close some popups when view changes)

v0.2.18
- splash screen changed
- checking for dictionary definition disabled
- "Test me!" button changed
- animations on result screen improved

v0.2.17
- disable dictionary icon for words that have no definition in dictionary
- animate user level (both background and numerals) only when it has changed

v0.2.16
- landing page changed to theguardian.com/uk-news
- add shadow above quiz view
- remove home icon from main toolbar
- "Test yourself any time" prompt added

v0.2.15
- bugfixes for quiz flow
- read-only browser bar
- "buy Web Browsing" popup added for tap on read-only browser bar
- "Browse on..." toast
- highlight feedback added to word buttons on quiz view
- timeout after response for quiz question changed to 5s
- landing page changed to UK