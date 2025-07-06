# JSON to TypeScript Type

一个强大的 VS Code 插件，用于将 JSON 快速转换为 TypeScript 类型定义。

## 功能特性

- 🚀 快速将 JSON 转换为 TypeScript 类型
- 💬 支持 JSON 注释保留
- 🎯 智能类型推断（数组、对象、基础类型）
- 🔄 自动识别常见接口模式（Response、Params）
- ⌨️ 便捷的快捷键操作

## 使用方法

1. 复制包含 JSON 数据的文本到剪贴板
2. 在 TypeScript 文件中按 `Ctrl+1`
3. 插件会自动解析 JSON 并生成对应的 TypeScript 类型定义

## 支持的 JSON 格式

### 标准接口响应格式

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": "1",
    "name": "张三"
  }
}
```

转换后

```typescript
export type TypeResponse = {
  id: string;
  name: string;
};
```

### 标准接口请求格式

```json
{
  "name": "张三"
}
```

转换后

```typescript
export type TypeParams = {
  name: string;
};
```

### 接口带注释的 JSON

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": "1", // 用户ID
    "name": "张三" // 用户名称
  }
}
```

转换后

```typescript
export type TypeResponse = {
  id: string; // 用户ID
  name: string; // 用户名称
};
```

### 接口带有数组数据的 JSON

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": "1", // 用户ID
    "name": "张三", // 用户名称
    "skill": [
      {
        "name": "TypeScript", // 语言
        "percent": "70%" // 水平百分比
      }
    ] // 技能
  }
}
```

转换后

```typescript
export type TypeResponse = {
  id: string; // 用户ID
  name: string; // 语言
  skill: {
    name: string; // 语言
    percent: string; // 水平百分比
  }[];
};
```

## 快捷键

- `Ctrl+1`: 粘贴并转换为 TypeScript 类型

## 安装

在 VS Code 扩展商店中搜索 "JSON to TypeScript Type" 并安装。

## 发布日志

### 1.0.0

- 首次发布
- 支持基础 JSON 到 TypeScript 类型转换
- 支持注释保留
- 智能类型推断

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT
