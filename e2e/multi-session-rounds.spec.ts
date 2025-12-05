import { test, expect } from '@playwright/test';

test.describe('多轮会话不整除轮次修复验证', () => {
  test.setTimeout(180000); // 3 分钟超时

  test('总时长不能被每轮时长整除时，应该向上取整并正确分配时间', async ({ page }) => {
    await page.goto('/');

    // 1. 打开设置 - 点击包含 Settings 图标的按钮
    await page.locator('button:has(svg.lucide-settings)').first().click();
    await expect(page.locator('text=开发者设置')).toBeVisible();

    // 2. 设置每轮时长为 0.4 分钟 (24秒)
    // 使用时间档位 1 分钟: 1 / 0.4 = 2.5 → Math.ceil = 3 轮
    // 第一轮 24 秒，第二轮 24 秒，第三轮 12 秒
    const settingsModal = page.locator('.fixed.inset-0.z-\\[100\\]');

    // 使用标签定位输入框
    const timerInput = settingsModal.locator('text=每个时段时长').locator('..').locator('input[type="number"]');
    await timerInput.fill('0.4'); // 24 秒每轮

    // 3. 设置休息时长为 3 秒
    const restInput = settingsModal.locator('text=休息时长').locator('..').locator('input[type="number"]');
    await restInput.fill('3');

    // 4. 设置时间档位为 1 分钟
    const taskOptionsInput = settingsModal.locator('text=时间档位预设').locator('..').locator('input[type="text"]');
    await taskOptionsInput.fill('1');

    // 5. 保存设置
    await page.click('text=保存设置');
    await expect(page.locator('text=开发者设置')).not.toBeVisible();

    // 等待页面更新
    await page.waitForTimeout(500);

    // 6. 输入任务名 - 使用更灵活的选择器
    await page.locator('input[type="text"][placeholder]').first().fill('测试不整除轮次');

    // 7. 选择 1 分钟选项（设置后只有一个选项，应该已被选中）
    // 如果有多个选项，点击包含 "1" 的时间选择按钮
    const timeButton = page.locator('button:has-text("1")').first();
    if (await timeButton.isVisible()) {
      await timeButton.click();
    }

    // 8. 点击 "启动金币生产线!" 按钮开始
    await page.click('text=启动金币生产线！');

    // 8. 验证进入计时页面，显示轮次信息
    // 1 / 0.4 = 2.5 → 3 轮
    const roundInfo = page.locator('text=/第1轮\\/共3轮/');
    await expect(roundInfo).toBeVisible({ timeout: 10000 });

    console.log('验证通过: 显示第1轮/共3轮');

    // 9. 等待第一轮完成 (约 24 秒)
    await page.waitForTimeout(26000);

    // 10. 应该看到休息页面
    const restPage = page.locator('text=已完成');
    await expect(restPage).toBeVisible({ timeout: 5000 });
    console.log('第一轮完成，进入休息页面');

    // 11. 等待休息结束并点击继续（休息时间 3 秒）
    const continueBtn = page.locator('button:has-text("休息结束，继续加油！")');
    await expect(continueBtn).toBeVisible({ timeout: 10000 }); // 等待休息结束
    await continueBtn.click();

    // 12. 验证进入第二轮
    await expect(page.locator('text=第2轮/共3轮')).toBeVisible({ timeout: 5000 });
    console.log('验证通过: 进入第2轮');

    // 13. 等待第二轮完成 (约 24 秒)
    await page.waitForTimeout(26000);

    // 14. 休息后继续第三轮
    const continueBtn2 = page.locator('button:has-text("休息结束，继续加油！")');
    await expect(continueBtn2).toBeVisible({ timeout: 10000 }); // 等待休息结束
    await continueBtn2.click();

    // 15. 验证进入第三轮（最后一轮，只有 12 秒）
    await expect(page.locator('text=第3轮/共3轮')).toBeVisible({ timeout: 5000 });
    console.log('验证通过: 进入第3轮（最后一轮）');

    // 16. 验证第三轮时间约为 12 秒
    // 计时器显示应该是 00:11 左右
    const timerDisplay = page.locator('.text-5xl');
    const timerText = await timerDisplay.textContent();
    console.log('第三轮计时器显示:', timerText);

    // 验证时间是 12 秒左右（00:10, 00:11 或 00:12）
    expect(timerText).toMatch(/00:1[012]/);

    // 17. 等待第三轮完成（约 12 秒）
    await page.waitForTimeout(15000);

    // 18. 应该打开结算弹窗
    await expect(page.locator('text=点击开启惊喜宝箱')).toBeVisible({ timeout: 10000 });

    console.log('测试通过: bugfix 验证成功！');
    console.log('1分钟 / 0.4分钟 = 2.5 → 向上取整为 3 轮');
    console.log('第一轮 24秒, 第二轮 24秒, 第三轮 12秒');
  });
});
