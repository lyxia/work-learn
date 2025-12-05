# 修复：休息页面金币显示异常

## 问题描述
- 第一轮 1 分钟完成后应该显示 5 金币
- 休息页面却显示 10 金币（翻倍）
- 进入第二轮开始时又变回 5 金币

## 核心原则

**金币只跟实际专注时间有关**，`multiSession.ts` 与金币完全无关。

---

## 修复方案

### 1. `multiSession.ts`：只管时间和轮数

```typescript
// 新增
totalFocusedSeconds: number;
addFocusedSecond: () => void;

// 删除（与金币完全无关）
accumulatedCoins: number;           // ❌ 删除
updateAccumulatedCoins: () => void; // ❌ 删除

// completeCurrentRound 不再处理金币，移除 roundCoins 参数
completeCurrentRound: () => void;   // 修改签名

// createSession 和 reset 需要初始化/重置 totalFocusedSeconds
createSession: () => {
  totalFocusedSeconds: 0,
  ...
  // 同时重置 sessionRewards，确保干净状态
  useSessionRewardsStore.getState().resetSession();
}
reset: () => {
  totalFocusedSeconds: 0,
  ...
  // 已有 sessionRewardsStore.resetSession() ✅
}
```

### 2. `sessionRewards.ts`：统一管理金币

```typescript
// 修复 getTotalDuration：直接读取累计时间
getTotalDuration: () => {
  const { totalFocusedSeconds } = useMultiSessionStore.getState();
  return totalFocusedSeconds / 60;
}

// 修改 calculateRewards：只计算 baseCoins（移除随机奖励）
calculateRewards: (duration: number) => {
  const baseReward = Math.ceil(duration * 5);
  set({ baseCoins: baseReward > 0 ? baseReward : 1 });
}

// 新增：单独计算随机奖励（结束时调用）
calculateBonusCoins: (duration?: number) => {
  const d = duration ?? get().getTotalDuration();
  const randomBonus = Math.floor(Math.random() * (d / 2)) + 1;
  set({ bonusCoins: randomBonus > 0 ? randomBonus : 0 });
}

// calculateRewardsFromCurrentState：实时调用，只更新 baseCoins
```

### 3. `App.tsx`：调用逻辑

```typescript
// 删除
const multiSessionAccumulatedCoins = useMultiSessionStore(...);
const updateAccumulatedCoins = useMultiSessionStore(...);

// 新增
const addFocusedSecond = useMultiSessionStore((state) => state.addFocusedSecond);
const totalFocusedSeconds = useMultiSessionStore((state) => state.totalFocusedSeconds);
const calculateRewardsFromCurrentState = useSessionRewardsStore(...);

// handleTimerTick 修改：
// - 删除 updateAccumulatedCoins(timePassed, currentTotalTime);
// - 新增：
addFocusedSecond();
calculateRewardsFromCurrentState();  // 实时更新 baseCoins

// 计时结束时：
// - 删除 const roundCoins = Math.ceil(roundDuration * 5);
// - 修改 completeCurrentRound(); // 无参数

// 结束时（最后一轮/提前完成）：
calculateBonusCoins();  // 只在这时计算随机奖励

// handleSettlementClose 修改：
// - 删除 const totalDuration = multiSessionCompletedRounds * (settings.timerOverride || 1);
// - 改为 const totalDuration = totalFocusedSeconds / 60;

// SettlementModal duration prop 修改：
// - 删除 duration={multiSessionIsActive ? multiSessionCompletedRounds * (settings.timerOverride || 1) : Math.ceil(totalTime / 60)}
// - 改为 duration={totalFocusedSeconds / 60}
```

### 4. 组件改用 `baseCoins`

**TimerModal.tsx**
```typescript
// 修改 props
interface TimerModalProps {
  // accumulatedCoins: number;  // ❌ 删除
  baseCoins: number;            // ✅ 新增
}

// 显示改用 baseCoins
<span>+{baseCoins}</span>
```

**RestModal.tsx**
```typescript
// 修改 props
interface RestModalProps {
  // accumulatedCoins: number;  // ❌ 删除
  baseCoins: number;            // ✅ 新增
}

// 显示改用 baseCoins
已赚 {baseCoins} 金币
```

**App.tsx 传参**
```typescript
<TimerModal
  baseCoins={baseCoins}  // 替换 accumulatedCoins
  ...
/>

<RestModal
  baseCoins={baseCoins}  // 替换 accumulatedCoins
  ...
/>
```

---

### 5. `multiSession.ts` 其他方法修改

**finishEarly（提前完成）**
```typescript
finishEarly: () => {
  const timerStore = useTimerStore.getState();
  timerStore.stopTimer();
  // 计算最终奖励（包含随机奖励）
  useSessionRewardsStore.getState().calculateRewardsFromCurrentState();
  useSessionRewardsStore.getState().calculateBonusCoins();  // ✅ 新增
  useUIStore.getState().openSettlementModal();
}
```

**completeCurrentRound（完成当前轮）**
```typescript
completeCurrentRound: () => {  // 移除 roundCoins 参数
  const { currentRound, totalRounds } = get();
  const newCompletedRounds = get().completedRounds + 1;

  set({ completedRounds: newCompletedRounds });

  if (currentRound === totalRounds) {
    // 最后一轮：计算随机奖励并打开结算弹窗
    useSessionRewardsStore.getState().calculateBonusCoins();  // ✅ 只在最后一轮
    useUIStore.getState().openSettlementModal();
  } else {
    // 不是最后一轮：进入休息页面（baseCoins 已通过 tick 实时更新）
    useUIStore.getState().openRestModal();
  }
}
```

---

## 涉及文件完整清单

| 文件 | 修改内容 |
|------|----------|
| `store/modules/multiSession.ts` | 添加 `totalFocusedSeconds` + `addFocusedSecond`，删除 `accumulatedCoins` + `updateAccumulatedCoins`，修改 `completeCurrentRound` 签名和逻辑，修改 `finishEarly` 添加 `calculateBonusCoins`，修改 `createSession` 调用 `resetSession` |
| `store/modules/sessionRewards.ts` | 修复 `getTotalDuration`（读 totalFocusedSeconds），新增 `calculateBonusCoins`，修改 `calculateRewards` 只算 baseCoins |
| `App.tsx` | 删除 accumulatedCoins 相关，改用 addFocusedSecond + calculateRewardsFromCurrentState，修改 handleSettlementClose 的 totalDuration 计算 |
| `components/TimerModal.tsx` | props 改 `accumulatedCoins` → `baseCoins` |
| `components/RestModal.tsx` | props 改 `accumulatedCoins` → `baseCoins` |
| `tests/store/multiSession.test.ts` | 删除 `accumulatedCoins`/`updateAccumulatedCoins` 测试，新增 `totalFocusedSeconds`/`addFocusedSecond` 测试，修改 `completeCurrentRound` 测试 |
| `tests/store/sessionRewards.test.ts` | 修改 `calculateRewards` 测试（不再测 bonusCoins），新增 `calculateBonusCoins` 测试，修改 `getTotalDuration` 测试（改用 totalFocusedSeconds） |

---

## 验证方式

1. 运行单元测试：`npm run test`
2. 运行 E2E 测试：`npm run test:e2e`
3. 手动验证场景：
   - 第一轮 1 分钟完成 → 休息页显示 5 金币
   - 第二轮开始 → TimerModal 显示 5 金币（继续累加）
   - 最后一轮结束 → 结算页显示 baseCoins + bonusCoins
