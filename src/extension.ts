import * as vscode from "vscode";
import { parse, ParseError } from "jsonc-parser";

export function activate(context: vscode.ExtensionContext) {
  // 注册自定义粘贴并转 TS 类型命令
  const pasteAndConvertDisposable = vscode.commands.registerCommand(
    "json2ts-type.pasteAndConvert",
    async () => {
      const clipboardText = await vscode.env.clipboard.readText();
      // 直接调用分析函数，让它内部处理错误
      analyzePastedCode(clipboardText);
    }
  );
  context.subscriptions.push(pasteAndConvertDisposable);
}

// 解析代码
async function analyzePastedCode(code: string) {
  const trimmedCode = code.trim();
  // 使用 jsonc-parser 解析带注释的 JSON
  let json: any;
  let errors: ParseError[] = [];
  json = parse(trimmedCode, errors, {
    allowTrailingComma: true,
    disallowComments: false,
  });
  if (errors.length > 0) {
    vscode.window.showWarningMessage("JSON 解析失败，请粘贴 JSON 格式的内容");
    // 如果解析失败，执行原生粘贴
    await vscode.commands.executeCommand("editor.action.clipboardPasteAction");
    return;
  }

  // 提取注释信息
  const commentMap = new Map<string, string>();
  const lines = trimmedCode.split("\n");
  lines.forEach((line) => {
    const match = line.match(/"([^"]+)"\s*:\s*[^,}]+,?\s*\/\/(.+)/);
    if (match) {
      const key = match[1];
      const comment = match[2].trim();
      commentMap.set(key, comment);
    }
  });
  // 根据结构自动设置 typeName 和提取目标数据
  let typeName = "TypeParams";
  let targetData = json;

  if (
    json &&
    typeof json === "object" &&
    json !== null &&
    "code" in json &&
    "msg" in json &&
    "data" in json
  ) {
    typeName = "TypeResponse";
    // 提取 data.records 作为主要类型
    if (json.data && json.data.records && Array.isArray(json.data.records)) {
      targetData = json.data.records[0]; // 取数组第一个元素的结构
    } else {
      targetData = json.data;
    }
  }
  // 递归推断类型
  function inferType(
    value: any,
    keyPath: string = "",
    indent: number = 0
  ): string {
    const spaces = "  ".repeat(indent);
    const nextSpaces = "  ".repeat(indent + 1);

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return "any[]";
      }
      return `${inferType(value[0], keyPath, indent)}[]`;
    } else if (typeof value === "object" && value !== null) {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return "{}";
      }
      return `{
${entries
  .map(([k, v]) => {
    const fullPath = keyPath ? `${keyPath}.${k}` : k;
    const comment = commentMap.get(k);
    const commentSuffix = comment ? ` // ${comment}` : "";
    return `${nextSpaces}${k}: ${inferType(
      v,
      fullPath,
      indent + 1
    )};${commentSuffix}`;
  })
  .join("\n")}
${spaces}}`;
    } else if (typeof value === "string") {
      return "string";
    } else if (typeof value === "number") {
      return "number";
    } else if (typeof value === "boolean") {
      return "boolean";
    } else {
      return "string";
    }
  }
  const typeCode = `export type ${typeName} = ${inferType(targetData)}`;

  // 如果最终结果是数组类型，移除 [] 后缀
  let finalTypeCode = typeCode;
  if (Array.isArray(targetData) && targetData.length > 0) {
    // 如果目标数据是数组，直接用第一个元素的类型
    finalTypeCode = `export type ${typeName} = ${inferType(targetData[0])}`;
  }

  // 在类型定义末尾添加分号
  if (!finalTypeCode.endsWith(";")) {
    finalTypeCode = finalTypeCode.replace(/}$/, "};");
  }

  const editor = vscode.window.activeTextEditor;
  if (editor) {
    editor.edit((editBuilder) => {
      editBuilder.insert(editor.selection.active, finalTypeCode);
    });
  }
}

export function deactivate() {}
