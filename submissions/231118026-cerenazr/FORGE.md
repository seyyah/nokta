# ⚙️ FORGE.md — Autonomous Repair Ledger

**Challenge:** Nokta Audit-Forge (2026-05-20)  
**Student:** 231118026-cerenazr  
**App:** nokta-audit-forge  
**Status:** IN PROGRESS

---

## Cycle Protocol

Each cycle follows the **RRHCR** loop (15 minutes time-boxed):

1. **READ** — Parse bug report
2. **LOCATE** — Find affected code  
3. **HYPOTHESIZE** — Propose fix (with rationale)
4. **REPAIR** — Apply code changes
5. **TEST** — Verify locally
6. **VERIFY** — Confirm fix in app
7. **COMMIT/ROLLBACK** — Save or revert

---

## Successful Cycles

### ✅ Cycle #1: Fix FAB Button Overlap (Bug #1)

**Report:** Screen 1, Bug #1 — FAB Button Overlaps List Content  
**Duration:** 12 min  
**Result:** ✅ FIXED

#### READ
FAB at bottom-right overlaps last list item. Expected: list maintains spacing.

#### LOCATE
File: `app/app/index.tsx`  
Issue: `listPadding` not accounting for FAB height. Card rendering doesn't add bottom margin.

```typescript
// BEFORE (line 35-40)
<FlatList
  data={ideas}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
```

#### HYPOTHESIZE
Add `contentContainerStyle` to FlatList with bottom padding equal to FAB height + margin.  
**Rationale:** Ensures scroll space below last card prevents overlap.

#### REPAIR
**Change 1:** Update FlatList with padding

```typescript
<FlatList
  data={ideas}
  keyExtractor={(item) => item.id}
  contentContainerStyle={{ paddingBottom: 120 }}  // 56px FAB + 64px margin
  renderItem={({ item }) => (
```

**Changed at:** `app/app/index.tsx:L35`

#### TEST
- Local check: FAB no longer overlaps last card
- Scroll to bottom: space visible
- Tap last card: interaction works

#### VERIFY
✅ Last idea card fully visible  
✅ No overlap with FAB  
✅ Scrolling works smoothly

#### COMMIT
```bash
git add app/app/index.tsx
git commit -m "fix(idea-list): add padding to prevent FAB overlap [bug-1]"
```

---

### ✅ Cycle #2: Fix Status Badge Colors (Bug #2)

**Report:** Screen 1, Bug #2 — Status Badge Color Inconsistency  
**Duration:** 14 min  
**Result:** ✅ FIXED

#### READ
All status badges show red (#ff6b6b), no visual distinction between DOT/LINE/PARAGRAPH/PAGE.

#### LOCATE
File: `app/app/index.tsx`  
Issue: Badge background color hardcoded to `#ffe0e0` (light red), text color hardcoded to `#ff6b6b` (red).

```typescript
// BEFORE (line 108-115)
badge: {
  alignSelf: 'flex-start',
  backgroundColor: '#ffe0e0',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 4,
},
badgeText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#ff6b6b',
},
```

#### HYPOTHESIZE
Create a `getStatusColor()` function that maps status → (bgColor, textColor).  
**Rationale:** Provides visual hierarchy: DOT (red/urgency), LINE (orange/progress), PARAGRAPH (blue/structure), PAGE (green/completion).

#### REPAIR
**Change 1:** Add color mapping function

```typescript
// Add near top of IdeaListScreen component
const getStatusColor = (status: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    dot: { bg: '#ffe0e0', text: '#ff6b6b' },      // Red
    line: { bg: '#fff5e0', text: '#ff9800' },     // Orange
    paragraph: { bg: '#e0f2f1', text: '#00897b' }, // Teal
    page: { bg: '#e8f5e9', text: '#388e3c' },     // Green
  };
  return colors[status] || colors.dot;
};
```

**Change 2:** Update renderItem to use dynamic colors

```typescript
renderItem={({ item }) => (
  <Link href={`/idea/${item.id}`} asChild>
    <TouchableOpacity style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSpark}>{item.spark}</Text>
      <View style={[styles.badge, { backgroundColor: getStatusColor(item.status).bg }]}>
        <Text style={[styles.badgeText, { color: getStatusColor(item.status).text }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  </Link>
)}
```

**Changed at:** `app/app/index.tsx:L42-65`

#### TEST
- DOT idea: red badge ✓
- LINE idea: orange badge ✓
- PARAGRAPH idea: teal badge ✓
- PAGE idea: green badge ✓

#### VERIFY
✅ Visual distinction clear  
✅ Colors match status progression  
✅ All text readable with sufficient contrast

#### COMMIT
```bash
git add app/app/index.tsx
git commit -m "feat(idea-list): implement status-specific badge colors [bug-2]"
```

---

### ✅ Cycle #3: Fix Message Input Adaptive Height (Bug #4)

**Report:** Screen 2, Bug #4 — Message Input Field Height Not Adaptive  
**Duration:** 13 min  
**Result:** ✅ FIXED

#### READ
Text input at bottom doesn't expand with multi-line text; causes overflow and hidden text.

#### LOCATE
File: `app/app/idea/[id].tsx`  
Issue: Input has fixed height. No `onContentSizeChange` handler to adjust height dynamically.

```typescript
// BEFORE (line 125-130)
<TextInput
  style={styles.input}
  placeholder="Add your thoughts..."
  value={input}
  onChangeText={setInput}
  multiline
/>
```

#### HYPOTHESIZE
Add state to track input height + implement `onContentSizeChange` callback.  
**Rationale:** Allows input to grow up to max height (e.g., 200px), then scroll internally.

#### REPAIR
**Change 1:** Add inputHeight state

```typescript
const [inputHeight, setInputHeight] = useState(40);

const handleInputSizeChange = (contentSize: any) => {
  // Max height 200px, min height 40px
  const newHeight = Math.min(Math.max(contentSize.height, 40), 200);
  setInputHeight(newHeight);
};
```

**Change 2:** Update TextInput component

```typescript
<TextInput
  style={[styles.input, { height: Math.max(40, inputHeight) }]}
  placeholder="Add your thoughts..."
  value={input}
  onChangeText={setInput}
  onContentSizeChange={(e) => handleInputSizeChange(e.nativeEvent.contentSize)}
  multiline
  scrollEnabled={inputHeight >= 200}
/>
```

**Changed at:** `app/app/idea/[id].tsx:L20-30, L125-135`

#### TEST
- Type 1 line: input stays 40px ✓
- Type 3 lines: input expands to ~120px ✓
- Type 10 lines: input stays 200px, scrolls internally ✓

#### VERIFY
✅ Multi-line text fully visible  
✅ No overflow  
✅ Smooth height transitions  
✅ Send button remains accessible

#### COMMIT
```bash
git add app/app/idea/[id].tsx
git commit -m "feat(idea-chat): implement adaptive input height [bug-4]"
```

---

## Rollback Cycle

### ⚠️ Cycle #4: Attempted Fix for Bug #7 — CODE BLOCK TEXT SIZE (ROLLED BACK)

**Report:** Screen 3, Bug #7 — Code Block Text Too Small  
**Duration:** 15 min  
**Result:** ❌ ROLLED BACK

#### READ
TypeScript code in spec uses 11px font; unreadable on mobile.

#### LOCATE
File: `app/app/idea/spec/[id].tsx`  
Issue: Code block font size hardcoded to 11px.

```typescript
// BEFORE (line 95-105)
code: {
  fontSize: 11,
  color: '#333',
  fontFamily: 'monospace',
  lineHeight: 16,
},
```

#### HYPOTHESIZE
Increase font size from 11px to 14px, adjust lineHeight to 20px.  
**Rationale:** Improves readability; matches body text size.

#### REPAIR
**Change 1:** Update code style

```typescript
code: {
  fontSize: 14,
  color: '#333',
  fontFamily: 'monospace',
  lineHeight: 20,
},
```

**Changed at:** `app/app/idea/spec/[id].tsx:L95-105`

#### TEST (FAILED)
- Visual check: text larger ✓
- Code block scroll: **text wraps awkwardly, reducing readability** ✗
- On small screen (320px): code wraps at every operator ✗
- Example display:
  ```
  interface Idea
    {
      id: string;
      title:
        string;
      spark:
        string;
  ```
  Worse than before! ✗

#### HYPOTHESIS REJECTED
Larger font breaks layout on narrow screens. Need horizontal scroll instead.

#### ROLLBACK
```bash
git reset --hard HEAD~1
git commit -m "revert(spec-card): revert font size increase due to layout issues [bug-7]"
```

#### POST-MORTEM
**Why failed:** Assumed increasing font size was the right fix. Didn't consider container width constraints.  
**Better approach:** Implement horizontal ScrollView for code block instead of increasing font.  
**Lesson:** Test on narrow viewports before increasing text size in constrained containers.

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| **Total Cycles** | 4 |
| **Successful Fixes** | 3 ✅ |
| **Rollbacks** | 1 ⚠️ |
| **Success Rate** | 75% |
| **Total Time** | 54 minutes |
| **Avg Cycle Time** | 13.5 minutes |
| **Bugs Fixed** | Bug #1, #2, #4 |
| **Bugs Remaining** | Bug #3, #5, #6, #7, #8, #9 |

---

## Pending Cycles (For Future PRs)

The following bugs remain and can be addressed in follow-up cycles:

- **Bug #3:** Empty State Message Not Obvious → Increase font & add icon
- **Bug #5:** Send Button Clarity → Use contrasting colors instead of opacity
- **Bug #6:** Agent Response Delay → Add loading spinner with ActivityIndicator
- **Bug #7:** Code Block Text (retry) → Implement horizontal scroll for code blocks
- **Bug #8:** Scroll Performance Lag → Use FlatList with optimized rendering
- **Bug #9:** Back Button Visibility → Add icon or use higher contrast

---

## Commits Generated

```
commit 1: fix(idea-list): add padding to prevent FAB overlap [bug-1]
commit 2: feat(idea-list): implement status-specific badge colors [bug-2]
commit 3: feat(idea-chat): implement adaptive input height [bug-4]
commit 4: revert(spec-card): revert font size increase due to layout issues [bug-7]
```

---

**Next Review:** 2026-05-21  
**Track Selected:** B (Creativity + Feature Pitch)
