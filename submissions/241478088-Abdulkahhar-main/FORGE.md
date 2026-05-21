# FORGE Ledger

## Cycle 1: HomeScreen History (Success)
- **Status:** ✅ SUCCESS
- **Target:** `app/src/screens/HomeScreen.js`
- **Hypothesis:** By leveraging `AsyncStorage`, I can persist successfully analyzed ideas and display them below the "Analiz Et" button, addressing the #1 bug report.
- **Repair:**
  - Added `AsyncStorage` import.
  - Added `pastIdeas` state and `useEffect` to load them on mount.
  - Updated `handleAnalyze` to push the new idea to `pastIdeas` and save to `AsyncStorage`.
  - Added a UI section for "Geçmiş Fikirler" mapping through `pastIdeas`.
- **Test:** The past ideas persist across reloads and the new list item populates the input when clicked.
- **Commit:** Applied directly to `HomeScreen.js`.

## Cycle 2: QuestionsScreen Progress Text (Success)
- **Status:** ✅ SUCCESS
- **Target:** `app/src/screens/QuestionsScreen.js`
- **Hypothesis:** By calculating the percentage of answered questions and displaying it near the progress bar, I can satisfy the #2 bug report asking for a percentage indicator.
- **Repair:**
  - Calculated `percentComplete = Math.round((answeredCount / questions.length) * 100)`.
  - Added a text element inside the progress bar container or header to display the percentage clearly.
- **Test:** As the user answers questions, the percentage updates dynamically.
- **Commit:** Applied directly to `QuestionsScreen.js`.

## Cycle 3: SpecSheetScreen Graph (Rollback)
- **Status:** 🔴 ROLLBACK
- **Target:** `app/src/screens/SpecSheetScreen.js`
- **Hypothesis:** The user requested a project graph above Timeline Estimate. I hypothesize that using `react-native-chart-kit` and `react-native-svg` will provide a beautiful UI for this.
- **Repair:**
  - Attempted to install `react-native-svg` and `react-native-chart-kit`.
  - Injected `<BarChart />` component between Markdown nodes by splitting the string.
- **Test:** Expo Go crashed with "Invariant Violation: requireNativeComponent: 'RNSVGPath' was not found in the UIManager." This occurs because `react-native-svg` requires a custom native dev client (prebuild) and is not fully supported dynamically without it in the current environment configuration.
- **Rollback:** Reverted `package.json` changes and discarded the `SpecSheetScreen.js` changes to prevent application crash.

## Cycle 4: SpecSheetScreen Simple Graph (Success)
- **Status:** ✅ SUCCESS
- **Target:** `app/src/screens/SpecSheetScreen.js`
- **Hypothesis:** Since native SVG charts cause crashes in Expo Go, I can build a simple but elegant React Native Flexbox chart and inject it dynamically before the "Zaman Tahmini" markdown section.
- **Repair:**
  - Split the `specMarkdown` string by `\n## ` to find the timeline section.
  - Injected a custom React Native component (`View` with Flexbox styling for Tasarım, Geliştirme, Test) dynamically between the markdown blocks.
- **Test:** The graph renders beautifully on top of the Timeline Estimate without crashing.
- **Commit:** Applied directly to `SpecSheetScreen.js`.