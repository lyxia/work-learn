import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from '../../store/modules/task';
import { useSettingsStore } from '../../store/modules/settings';

describe('Task Store', () => {
  beforeEach(() => {
    // 重置 Settings store
    useSettingsStore.setState({
      settings: {
        taskOptions: [10, 20, 30, 40],
        restDuration: 300,
        timerOverride: 0,
      },
      isOpen: false,
      timerOptions: [],
    });
    useSettingsStore.getState().updateSettings({
      taskOptions: [10, 20, 30, 40],
      restDuration: 300,
      timerOverride: 0,
    });

    // 重置 Task store
    useTaskStore.setState({
      name: '',
      selectedTimeId: '',
    });
  });

  describe('初始状态', () => {
    it('应该有默认值', () => {
      const state = useTaskStore.getState();
      expect(state.name).toBe('');
      expect(state.selectedTimeId).toBe('');
    });
  });

  describe('setTaskName', () => {
    it('应该设置任务名称', () => {
      const { setTaskName } = useTaskStore.getState();
      setTaskName('数学作业');
      expect(useTaskStore.getState().name).toBe('数学作业');
    });

    it('应该更新任务名称', () => {
      const { setTaskName } = useTaskStore.getState();
      setTaskName('数学作业');
      setTaskName('英语阅读');
      expect(useTaskStore.getState().name).toBe('英语阅读');
    });

    it('应该允许空字符串', () => {
      const { setTaskName } = useTaskStore.getState();
      setTaskName('数学作业');
      setTaskName('');
      expect(useTaskStore.getState().name).toBe('');
    });
  });

  describe('setSelectedTimeId', () => {
    it('应该设置选中的时间ID', () => {
      const { setSelectedTimeId } = useTaskStore.getState();
      setSelectedTimeId('10m');
      expect(useTaskStore.getState().selectedTimeId).toBe('10m');
    });

    it('应该更新选中的时间ID', () => {
      const { setSelectedTimeId } = useTaskStore.getState();
      setSelectedTimeId('10m');
      setSelectedTimeId('20m');
      expect(useTaskStore.getState().selectedTimeId).toBe('20m');
    });
  });

  describe('getSelectedTimerOption (computed)', () => {
    it('应该返回对应的 TimerOption', () => {
      const { setSelectedTimeId, getSelectedTimerOption } = useTaskStore.getState();
      setSelectedTimeId('10m');
      const option = getSelectedTimerOption();
      expect(option).toBeDefined();
      expect(option?.id).toBe('10m');
      expect(option?.minutes).toBe(10);
    });

    it('如果没有选中，应该返回 undefined', () => {
      const { getSelectedTimerOption } = useTaskStore.getState();
      const option = getSelectedTimerOption();
      expect(option).toBeUndefined();
    });

    it('如果选中的ID不存在，应该返回 undefined', () => {
      const { setSelectedTimeId, getSelectedTimerOption } = useTaskStore.getState();
      setSelectedTimeId('999m');
      const option = getSelectedTimerOption();
      expect(option).toBeUndefined();
    });

    it('应该从 Settings store 获取 timerOptions', () => {
      const { setSelectedTimeId, getSelectedTimerOption } = useTaskStore.getState();
      setSelectedTimeId('20m');
      const option = getSelectedTimerOption();
      expect(option?.minutes).toBe(20);
      expect(option?.color).toBe('pink');
    });
  });

  describe('resetTask', () => {
    it('应该重置所有任务状态', () => {
      const { setTaskName, setSelectedTimeId, resetTask } = useTaskStore.getState();
      setTaskName('数学作业');
      setSelectedTimeId('10m');
      resetTask();
      
      const state = useTaskStore.getState();
      expect(state.name).toBe('');
      expect(state.selectedTimeId).toBe('');
    });
  });
});

describe('Task Store 集成测试 (Task + Settings)', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      settings: {
        taskOptions: [10, 20, 30, 40],
        restDuration: 300,
        timerOverride: 0,
      },
      isOpen: false,
      timerOptions: [],
    });
    useTaskStore.setState({
      name: '',
      selectedTimeId: '',
    });
  });

  it('应该响应 Settings 的变化', () => {
    // 初始化 Settings
    useSettingsStore.getState().updateSettings({
      taskOptions: [10, 20, 30, 40],
      restDuration: 300,
      timerOverride: 0,
    });

    // 选择时间
    useTaskStore.getState().setSelectedTimeId('10m');
    let option = useTaskStore.getState().getSelectedTimerOption();
    expect(option?.minutes).toBe(10);

    // 更新 Settings
    useSettingsStore.getState().updateSettings({
      taskOptions: [5, 15, 25],
      restDuration: 300,
      timerOverride: 0,
    });

    // 之前选中的 ID 不存在了，应该返回 undefined
    option = useTaskStore.getState().getSelectedTimerOption();
    expect(option).toBeUndefined();

    // 选择新的时间
    useTaskStore.getState().setSelectedTimeId('5m');
    option = useTaskStore.getState().getSelectedTimerOption();
    expect(option?.minutes).toBe(5);
  });

  it('应该正确获取 timerOptions 的颜色', () => {
    useSettingsStore.getState().updateSettings({
      taskOptions: [10, 20, 30],
      restDuration: 300,
      timerOverride: 0,
    });

    useTaskStore.getState().setSelectedTimeId('10m');
    expect(useTaskStore.getState().getSelectedTimerOption()?.color).toBe('blue');

    useTaskStore.getState().setSelectedTimeId('20m');
    expect(useTaskStore.getState().getSelectedTimerOption()?.color).toBe('pink');

    useTaskStore.getState().setSelectedTimeId('30m');
    expect(useTaskStore.getState().getSelectedTimerOption()?.color).toBe('blue');
  });
});

