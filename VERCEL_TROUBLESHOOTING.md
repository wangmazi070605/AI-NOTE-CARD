# Vercel 部署问题排查指南

## 🔍 常见错误：Server Components 渲染错误

如果看到这个错误：
```
An error occurred in the Server Components render. 
The specific message is omitted in production builds...
```

这通常表示 Server Action 执行时出错了，但生产环境隐藏了具体错误信息。

---

## ✅ 排查步骤

### 1. 检查环境变量（最重要！）

**在 Vercel Dashboard 中：**

1. 进入你的项目
2. 点击 **Settings** → **Environment Variables**
3. 检查是否有 `DEEPSEEK_API_KEY`
4. 确认：
   - ✅ Key 名称：`DEEPSEEK_API_KEY`（完全一致，区分大小写）
   - ✅ Value：你的 API Key（格式：`sk-xxxxx`）
   - ✅ 环境：勾选了 **Production**、**Preview**、**Development**

**如果环境变量未设置或错误：**
- 添加或更新环境变量
- **必须重新部署**才能生效！

---

### 2. 查看 Vercel 日志

**查看实时日志：**

1. 进入 Vercel Dashboard
2. 选择你的项目
3. 点击 **Deployments**
4. 点击最新的部署
5. 点击 **Runtime Logs** 或 **Function Logs**
6. 查看错误信息

**日志中会显示：**
- `=== DeepSeek API 调用信息 ===`
- `DeepSeek API 错误详情`
- 具体的错误原因

---

### 3. 检查 API Key 是否有效

**使用 curl 测试：**

```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**预期结果：**
- ✅ 返回 JSON：API Key 有效
- ❌ 返回 401：API Key 无效
- ❌ 返回 404：端点错误
- ❌ 返回余额不足：需要充值

---

### 4. 检查网络连接

**可能的问题：**
- Vercel 服务器无法访问 DeepSeek API
- 防火墙或网络限制
- API 服务暂时不可用

**解决方案：**
- 检查 DeepSeek API 服务状态
- 等待一段时间后重试
- 查看 Vercel 日志中的网络错误

---

### 5. 检查代码错误

**常见错误：**
- JSON 解析失败
- 数据验证失败（Zod Schema）
- 超时错误（超过 30 秒）

**查看日志中的具体错误：**
```
DeepSeek API 错误详情: {
  "message": "...",
  "status": ...,
  ...
}
```

---

## 🛠️ 解决方案

### 方案 1：环境变量未设置

**症状：**
- 日志显示：`DEEPSEEK_API_KEY 环境变量未设置`

**解决：**
1. 在 Vercel Dashboard 添加环境变量
2. 确保勾选了所有环境（Production、Preview、Development）
3. 重新部署项目

---

### 方案 2：API Key 无效

**症状：**
- 日志显示：`401` 或 `API Key 认证失败`

**解决：**
1. 访问 [DeepSeek Platform](https://platform.deepseek.com/api_keys)
2. 检查 API Key 是否有效
3. 如果无效，创建新的 API Key
4. 更新 Vercel 环境变量
5. 重新部署

---

### 方案 3：账户余额不足

**症状：**
- 日志显示：`Insufficient Balance` 或 `余额不足`

**解决：**
1. 访问 [DeepSeek Platform](https://platform.deepseek.com/)
2. 充值账户余额
3. 重新测试

---

### 方案 4：请求超时

**症状：**
- 日志显示：`请求超时` 或 `AbortError`

**解决：**
- 当前超时设置为 30 秒
- 如果经常超时，可能是：
  - DeepSeek API 响应慢
  - 网络问题
  - 可以尝试增加超时时间（修改代码中的 30000）

---

### 方案 5：JSON 解析失败

**症状：**
- 日志显示：`JSON 解析失败`

**解决：**
- AI 返回的数据格式不正确
- 代码会自动尝试清理 markdown 代码块
- 如果仍然失败，查看日志中的 `原始响应文本`
- 可能需要调整 prompt 让 AI 返回更标准的 JSON

---

## 📋 检查清单

部署前确认：

- [ ] 环境变量 `DEEPSEEK_API_KEY` 已在 Vercel 中配置
- [ ] 环境变量值正确（格式：`sk-xxxxx`）
- [ ] 环境变量已应用到所有环境（Production、Preview、Development）
- [ ] API Key 在 DeepSeek 平台有效
- [ ] 账户有足够余额
- [ ] 代码已推送到 GitHub
- [ ] Vercel 已成功构建和部署

---

## 🔍 如何查看详细错误

### 方法 1：Vercel Dashboard 日志

1. 进入项目 → **Deployments**
2. 点击最新的部署
3. 查看 **Runtime Logs** 或 **Function Logs**
4. 查找 `=== DeepSeek API 错误详情 ===`

### 方法 2：本地测试

```bash
# 在本地运行
npm run dev

# 测试功能
# 查看终端中的详细日志
```

### 方法 3：临时启用详细错误（开发用）

如果需要看到更详细的错误，可以临时修改代码：

```typescript
// 在 app/actions.ts 中
catch (error: any) {
  // 临时：在生产环境也显示详细错误（仅用于调试）
  if (process.env.NODE_ENV === 'production') {
    console.error("生产环境详细错误:", error);
  }
  // ...
}
```

---

## 🚨 紧急排查步骤

如果部署后立即报错：

1. **立即检查环境变量**
   - 这是最常见的原因（90%）

2. **查看 Vercel 日志**
   - 找到具体的错误信息

3. **测试 API Key**
   - 使用 curl 命令测试

4. **检查账户余额**
   - 确保有足够余额

5. **重新部署**
   - 修改环境变量后必须重新部署

---

## 💡 最佳实践

1. **环境变量管理**
   - 使用 Vercel Dashboard 管理
   - 不要提交到 Git
   - 确保所有环境都配置

2. **错误处理**
   - 代码已添加详细的错误处理
   - 日志会记录到 Vercel
   - 用户会看到友好的错误提示

3. **监控**
   - 定期检查 Vercel 日志
   - 监控 API 调用成功率
   - 关注错误频率

---

## 📞 如果仍然无法解决

1. **提供以下信息：**
   - Vercel 日志中的完整错误信息
   - 环境变量是否已配置（不提供具体值）
   - API Key 是否有效（不提供具体值）
   - 账户余额状态

2. **检查 DeepSeek API 状态**
   - 访问 DeepSeek 官方状态页面
   - 确认服务是否正常

3. **联系支持**
   - Vercel 支持：查看 Vercel 文档
   - DeepSeek 支持：查看 DeepSeek 文档

