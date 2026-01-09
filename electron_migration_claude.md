# Electron Migration Plan

## Recommendation: Start Fresh or Migrate?

**Recommendation: Start a fresh Electron + React project**

### Why Fresh is Better for This Project:

1. **Clean architecture** — No legacy React Native patterns to untangle
2. **Modern tooling** — Get Vite/Webpack configured correctly from the start
3. **Faster overall** — Converting RN StyleSheet to CSS is tedious; easier to rebuild UI with proper CSS
4. **Your source is small** — Only ~8,000-10,000 lines of actual code to port
5. **Types are portable** — Copy `src/types/index.ts` directly (100% reusable)
6. **Logic is portable** — State management, data handling all transfer directly

### Migration Approach:

```
1. Create fresh Electron + React + TypeScript project
2. Copy over: src/types/, src/data/ (unchanged)
3. Rebuild components one-by-one using the RN code as reference
4. Port state management from App.tsx (minimal changes)
5. Delete old react-native project when complete
```

---

## What is Cross-Platform Support?

**React Native Windows:** Runs ONLY on Windows (uses Windows-specific C++ native code)

**Electron:** Runs on Windows, macOS, AND Linux from a single codebase

| Platform | React Native Windows | Electron |
|----------|---------------------|----------|
| Windows 10/11 | Yes | Yes |
| macOS | No | Yes |
| Linux | No | Yes |
| Web browser | No | No (but code is web-compatible) |

With Electron, you build once and can distribute to all three desktop platforms. Your current React Native Windows app would require a completely separate codebase (React Native macOS) to run on Mac.

---

## Electron + React vs React Native Windows: Full Comparison

### Electron + React

#### Pros

| Category | Benefit |
|----------|---------|
| **Cross-platform** | Single codebase runs on Windows, macOS, Linux |
| **Web technologies** | Use standard HTML, CSS, JavaScript — massive ecosystem |
| **Developer pool** | Any web developer can contribute (lower hiring bar) |
| **Tooling maturity** | Webpack, Vite, Chrome DevTools, vast npm ecosystem |
| **UI flexibility** | Full CSS power — animations, grid, flexbox, any CSS framework |
| **Component libraries** | Use any React library (MUI, Chakra, Radix, Headless UI, etc.) |
| **Debugging** | Chrome DevTools built-in — industry standard |
| **Hot reload** | Fast, reliable hot module replacement |
| **Documentation** | Extensive docs, tutorials, Stack Overflow answers |
| **File system access** | Full Node.js APIs for file operations |
| **Native menus** | Easy native menu bar, system tray, notifications |
| **Auto-updates** | Built-in auto-updater (electron-updater) |
| **Packaging** | Mature tools (electron-builder, electron-forge) |
| **Proven at scale** | VS Code, Slack, Discord, Figma, Notion all use Electron |

#### Cons

| Category | Drawback |
|----------|----------|
| **Bundle size** | 150-200 MB minimum (ships Chromium + Node.js) |
| **Memory usage** | Higher RAM consumption (~200-500 MB baseline) |
| **Startup time** | Slower cold start (2-5 seconds typical) |
| **Native feel** | Doesn't look 100% native (web-based UI) |
| **Security surface** | Chromium vulnerabilities require updates |
| **No mobile** | Desktop only — can't share code with mobile apps |

---

### React Native Windows

#### Pros

| Category | Benefit |
|----------|---------|
| **Native performance** | Truly native UI components, lower memory |
| **Smaller bundle** | ~50-100 MB typical app size |
| **Native look** | Uses actual Windows UI controls |
| **Mobile code sharing** | Share code with React Native iOS/Android apps |
| **Startup time** | Faster cold start than Electron |
| **Microsoft backing** | Actively maintained by Microsoft |
| **WinUI integration** | Access to modern Windows UI features |

#### Cons

| Category | Drawback |
|----------|----------|
| **Windows only** | No macOS or Linux support |
| **Smaller ecosystem** | Fewer compatible libraries than web |
| **Platform bugs** | Issues like pager-view touch bug you experienced |
| **Styling limitations** | No CSS — only StyleSheet with subset of properties |
| **Debugging** | Less mature than Chrome DevTools |
| **Developer pool** | Smaller talent pool (RN + Windows expertise needed) |
| **Documentation** | Less comprehensive than Electron |
| **Component libraries** | Limited options compared to web React |
| **Complex setup** | Requires Visual Studio, Windows SDK, C++ toolchain |
| **New Architecture** | Fabric/TurboModules still maturing on Windows |
| **Breaking changes** | RN upgrades can break Windows compatibility |

---

## Decision Matrix

| Factor | Winner | Notes |
|--------|--------|-------|
| Cross-platform | **Electron** | Win/Mac/Linux vs Windows-only |
| Bundle size | **RN Windows** | 50-100 MB vs 150-200 MB |
| Memory usage | **RN Windows** | Lower RAM footprint |
| Developer experience | **Electron** | Better tooling, debugging |
| UI flexibility | **Electron** | Full CSS vs limited StyleSheet |
| Ecosystem | **Electron** | Vastly more libraries available |
| Native feel | **RN Windows** | True native controls |
| Mobile code sharing | **RN Windows** | If you need iOS/Android |
| Stability | **Electron** | More mature, fewer platform bugs |
| Hiring/team | **Electron** | Any web dev can contribute |
| Long-term maintenance | **Electron** | Larger community, more resources |

---

## Recommendation for Your Project

**Go with Electron + React** because:

1. **You already hit platform bugs** — The pager-view touch issue required workarounds
2. **No mobile requirement** — This is a desktop-only energy planning tool
3. **Complex UI** — SettingsPage and CandidatesPage would benefit from full CSS
4. **Future flexibility** — macOS/Linux support if needed later
5. **Better component libraries** — Can use AG Grid, TanStack Table, etc. for your data tables
6. **Team scalability** — Any React web developer can work on it

---

## Migration Plan

### Executive Summary

| Aspect | Current (React Native Windows) | Target (Electron) |
|--------|-------------------------------|-------------------|
| UI Framework | React Native components | React + HTML/CSS |
| Native Layer | C++ Windows bindings | Node.js + Chromium |
| Bundler | Metro | Webpack/Vite |
| Platform | Windows only | Cross-platform (Win/Mac/Linux) |

**Estimated Total Effort:** 40-60 hours (1-2 weeks for a single developer)

---

### Phase 1: Project Setup (4-6 hours)

**Tasks:**
1. Initialize new Electron project with React + TypeScript template
2. Configure build tooling (Vite or Webpack)
3. Set up Electron main/renderer process structure
4. Configure hot reload for development
5. Set up ESLint, Prettier with existing configs

**Key Decisions:**
- Use `electron-vite` or `electron-forge` as scaffolding
- Keep React 19 (compatible with Electron)
- Use IPC for main/renderer communication

**Recommended starter:**
```bash
npm create @quick-start/electron@latest my-app -- --template react-ts
```

---

### Phase 2: Type System Migration (2-3 hours)

**What transfers directly:**
- All interfaces in `src/types/index.ts` (~380 lines) — **100% reusable**
- Type unions (Region, SolverType, etc.)
- Constants (DEFAULT_SETTINGS, REGIONS, STUDIES)
- Sample data files in `src/data/`

**Changes needed:**
- None for types — TypeScript types are framework-agnostic

---

### Phase 3: Component Migration (15-20 hours)

This is the bulk of the work. Each React Native component needs conversion:

| RN Component | HTML/React Equivalent | Notes |
|--------------|----------------------|-------|
| `View` | `div` | Direct replacement |
| `Text` | `span`, `p`, `h1-h6` | Add semantic HTML |
| `TouchableOpacity` | `button` | Add CSS hover/active states |
| `TextInput` | `input`, `textarea` | Standard HTML inputs |
| `ScrollView` | `div` with `overflow: auto` | Native scrolling |
| `FlatList` | Map + virtualization lib | Use `react-window` |
| `StyleSheet.create()` | CSS Modules or Tailwind | Major refactor |
| `Dimensions.get()` | CSS media queries / `ResizeObserver` | Simpler in web |

**Component-by-component estimate:**

| Component | Complexity | Est. Hours |
|-----------|------------|------------|
| `TopTabNavigator.tsx` | Medium | 2-3 |
| `HomePage.tsx` | Low | 1-2 |
| `SettingsPage.tsx` | **High** | 4-5 |
| `CandidatesPage.tsx` | **High** | 4-5 |
| `RunPage.tsx` | Low | 1 |
| `SolverStatusPage.tsx` | Low | 1 |
| `SolverResultsPage.tsx` | Medium | 1-2 |
| `NPVResultsPage.tsx` | Medium | 1-2 |
| `UnitAdditionResultsPage.tsx` | Medium | 1 |
| `UnitRetirementResultsPage.tsx` | Medium | 1 |
| Common components (6 files) | Low-Medium | 2-3 |

---

### Phase 4: Styling Migration (8-12 hours)

**Current approach:** Inline `StyleSheet.create()` objects (~2000+ lines of styles across files)

**Recommended approach for Electron:**

**Option A: CSS Modules (Recommended)**
- Create `.module.css` files per component
- Convert RN style objects to CSS classes
- Preserves component-scoped styling

**Option B: Tailwind CSS**
- Faster development after initial setup
- Larger bundle size
- Learning curve if unfamiliar

**Key conversions:**
```javascript
// React Native
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: 16,
  }
});

// CSS Module equivalent
.container {
  display: flex;
  flex: 1;
  background-color: rgba(15, 23, 42, 0.95);
  padding: 16px;
}
```

**Differences to handle:**
- RN uses `flexDirection: 'column'` by default; CSS uses `row`
- RN padding/margin are unitless; CSS needs `px`/`rem`
- RN `borderRadius` → CSS `border-radius`
- RN shadow properties → CSS `box-shadow`

---

### Phase 5: Navigation Migration (3-4 hours)

**Current:** Custom tab navigator with conditional rendering

**Target:** React Router v6

```typescript
// Current pattern (keeps working in Electron!)
{activeTab === 'Home' && <HomePage {...props} />}

// Alternative: React Router
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/settings" element={<SettingsPage />} />
  <Route path="/candidates" element={<CandidatesPage />} />
  {/* ... */}
</Routes>
```

**Good news:** The custom tab implementation actually translates well to web. You could keep the conditional rendering pattern initially and migrate to React Router later.

---

### Phase 6: Storage Migration (2-3 hours)

**Current:** `@react-native-async-storage/async-storage`

**Electron options:**

| Option | Pros | Cons |
|--------|------|------|
| `localStorage` | Simple, no deps | 5MB limit |
| `electron-store` | JSON files, no limit, encrypted option | Requires IPC |
| SQLite (`better-sqlite3`) | Structured queries, fast | More complex |

**Recommended:** `electron-store` for JSON persistence (matches current pattern)

```typescript
// Current (AsyncStorage)
await AsyncStorage.setItem('expansion_planning_data', JSON.stringify(data));

// Electron (electron-store via IPC)
// Main process
const store = new Store();
ipcMain.handle('save-data', (_, data) => store.set('data', data));

// Renderer process
await window.electronAPI.saveData(data);
```

---

### Phase 7: Native Code Removal (1-2 hours)

**Delete entirely:**
- `windows/` directory (~50 files)
- `react-native.config.js`
- `metro.config.js`
- React Native-specific babel config

**Keep:**
- All `src/` TypeScript code (after conversion)
- `tsconfig.json` (minor adjustments)
- Test files

---

### Phase 8: Electron-Specific Features (4-6 hours)

**New code needed:**

1. **Main process** (`electron/main.ts`):
   - Window creation and management
   - IPC handlers for file system/storage
   - Menu bar configuration
   - Auto-updater setup (optional)

2. **Preload script** (`electron/preload.ts`):
   - Expose safe APIs to renderer
   - Context bridge for IPC

3. **Build configuration**:
   - `electron-builder.yml` for packaging
   - Code signing setup
   - Installer configuration

---

### Phase 9: Testing & QA (4-6 hours)

**Tasks:**
- Update Jest config for Electron/React
- Fix any test imports
- Manual testing of all 9 pages
- Test window resize, minimize, maximize
- Test data persistence across restarts
- Test on multiple Windows versions

---

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Style conversion bugs | High | Medium | Incremental testing per component |
| Performance regression | Medium | Low | Virtualize large tables |
| Storage migration data loss | Low | High | Export/import migration utility |
| Missing RN-specific features | Low | Low | None identified in codebase |

---

### What Makes This Migration Easier

1. **No complex native modules** — Pure JavaScript/TypeScript logic
2. **State management is portable** — React hooks work identically
3. **Types are 100% reusable** — No RN-specific types
4. **Custom navigation** — Already avoids RN-specific pager-view
5. **No platform-specific APIs** — Just AsyncStorage (easily replaced)

---

### What Requires Most Attention

1. **SettingsPage.tsx** — Complex forms, multiple modals, keyboard handling
2. **CandidatesPage.tsx** — Resizable columns, drag interactions
3. **Style conversion** — ~2000+ lines of inline styles to convert
4. **Modal system** — Custom overlay pattern needs CSS positioning

---

### Summary Timeline

| Phase | Hours | Dependencies |
|-------|-------|--------------|
| 1. Project Setup | 4-6 | None |
| 2. Types Migration | 2-3 | Phase 1 |
| 3. Component Migration | 15-20 | Phase 1, 2 |
| 4. Styling Migration | 8-12 | Phase 3 |
| 5. Navigation | 3-4 | Phase 3 |
| 6. Storage | 2-3 | Phase 1 |
| 7. Native Removal | 1-2 | Phase 6 |
| 8. Electron Features | 4-6 | Phase 1 |
| 9. Testing | 4-6 | All |
| **Total** | **40-60** | |

---

## Quick Start Commands

When ready to begin:

```bash
# Create new Electron + React + TypeScript project
npm create @quick-start/electron@latest expansion-planning-electron -- --template react-ts

# Navigate to new project
cd expansion-planning-electron

# Install additional dependencies
npm install electron-store react-router-dom

# Copy types from old project
cp ../react-app/src/types/index.ts src/types/
cp -r ../react-app/src/data src/

# Start development
npm run dev
```

---

## Files to Copy Directly (No Changes Needed)

```
src/types/index.ts          # All TypeScript interfaces
src/data/npvResults.ts      # Sample data
src/data/runCases.ts        # Sample data
src/data/solverResults.ts   # Sample data
src/data/unitAdditionResults.ts
src/data/unitRetirementResults.ts
src/styles/colors.ts        # Color constants (minor syntax changes)
```

---

## Conclusion

Migrating to Electron is a solid choice for this project. The estimated 40-60 hours of work will give you:

- Cross-platform support (Windows, macOS, Linux)
- Better developer experience and tooling
- Access to the full web ecosystem
- Easier long-term maintenance
- No more React Native Windows platform bugs

The codebase is well-structured and the types/logic are highly portable, making this a straightforward migration.
