"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  MESSAGE_KEY_MAP: () => MESSAGE_KEY_MAP,
  activate: () => activate,
  applyTemplateVariables: () => applyTemplateVariables,
  buildFileName: () => buildFileName,
  buildTemplateFileName: () => buildTemplateFileName,
  confirmTemplateDeletion: () => confirmTemplateDeletion,
  deactivate: () => deactivate,
  ensureUniqueFileName: () => ensureUniqueFileName,
  sanitizeExtension: () => sanitizeExtension,
  sanitizeTitle: () => sanitizeTitle,
  slugify: () => slugify,
  validateTemplateCreation: () => validateTemplateCreation
});
module.exports = __toCommonJS(extension_exports);
var path = __toESM(require("path"));
var vscode2 = __toESM(require("vscode"));
var import_util = require("util");

// package.nls.json
var package_nls_default = {
  "cmd.createNote.title": "Quiq Notes: Create New Note",
  "cmd.createTemplate.title": "Quiq Notes: Create New Template",
  "cmd.openTemplate.title": "Quiq Notes: Open Template",
  "cmd.deleteTemplate.title": "Quiq Notes: Delete Template",
  "configuration.title": "Quiq Notes",
  "configuration.fileName.description": "Default title used when no title is entered.",
  "configuration.fileExtensions.description": "List of file extensions (e.g., md,txt). If not specified, .md is used and the extension selection UI is hidden.",
  "configuration.fileFormat.description": "File name format. Available placeholders: {date} (YYYY-MM-DD), {date_mdy} (MM-DD-YYYY), {date_dmy} (DD-MM-YYYY), {datetime} (HHmmss), {title}, {ext}.",
  "configuration.templateFolder.description": "Path to the template folder (absolute or workspace-relative).",
  "msg.selectFolder": "Please select a folder in Explorer.",
  "msg.createFailed": "Failed to process the request. Please try again.",
  "msg.fileExists": "A note with the same name already exists.",
  "msg.noteWriteFailed": "Failed to create the note. Confirm the target folder exists and you have write access.",
  "msg.fsAccessDenied": "The operation failed due to insufficient permissions or a locked file. Please check folder access.",
  "msg.enterTitle": "Enter a title for your note. Leave blank to use the default title.",
  "msg.selectExtension": "Select an extension for the note.",
  "msg.selectTemplate": "Select a template to apply.",
  "msg.templateNone": "Not applicable",
  "msg.templateReadFailed": "Failed to read the selected template. Check the template folder path and permissions.",
  "msg.templateFolderRequired": "In the extension settings, please specify the template folder.",
  "msg.templateFolderInvalid": "The template folder cannot be accessed. Review the configured path and permissions.",
  "msg.templateExists": "A template with the same name already exists.",
  "msg.noTemplates": "There are no templates available.",
  "msg.noTemplatesDelete": "No deletable templates exist.",
  "msg.confirmDelete": 'Are you sure you want to delete "{0}"?',
  "msg.enterTemplateName": "Enter a template name. If no extension is provided, .txt will be used.",
  "msg.templateDeleteFailed": "Failed to delete the selected template. Check the template folder path and permissions.",
  "msg.templateWriteFailed": "Failed to create the template. Confirm the template folder path and write access."
};

// package.nls.ja.json
var package_nls_ja_default = {
  "cmd.createNote.title": "Quiq Notes: \u65B0\u3057\u3044\u30CE\u30FC\u30C8\u3092\u4F5C\u6210",
  "cmd.createTemplate.title": "Quiq Notes: \u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u4F5C\u6210",
  "cmd.openTemplate.title": "Quiq Notes: \u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u958B\u304F",
  "cmd.deleteTemplate.title": "Quiq Notes: \u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u524A\u9664",
  "configuration.title": "Quiq Notes",
  "configuration.fileName.description": "\u30BF\u30A4\u30C8\u30EB\u672A\u5165\u529B\u6642\u306B\u4F7F\u7528\u3055\u308C\u308B\u65E2\u5B9A\u30BF\u30A4\u30C8\u30EB\u3002",
  "configuration.fileExtensions.description": "\u4F7F\u7528\u3059\u308B\u62E1\u5F35\u5B50\u4E00\u89A7\uFF08\u4F8B: md,txt\uFF09\u3002\u672A\u6307\u5B9A\u6642\u306F .md \u3092\u4F7F\u7528\u3002",
  "configuration.fileFormat.description": "\u30D5\u30A1\u30A4\u30EB\u540D\u30D5\u30A9\u30FC\u30DE\u30C3\u30C8\u3002\u4F7F\u7528\u53EF\u80FD\u306A\u7F6E\u63DB\u5B50\uFF1A{date}\uFF08YYYY-MM-DD\uFF09\u3001{date_mdy}\uFF08MM-DD-YYYY\uFF09\u3001{date_dmy}\uFF08DD-MM-YYYY\uFF09\u3001{datetime}\uFF08HHmmss\uFF09\u3001{title}\u3001{ext}\u3002",
  "configuration.templateFolder.description": "\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u30D5\u30A9\u30EB\u30C0\u30FC\u306E\u30D1\u30B9\uFF08\u7D76\u5BFE\u30D1\u30B9\uFF0F\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u76F8\u5BFE\u30D1\u30B9\uFF09\u3002",
  "msg.selectFolder": "\u30A8\u30AF\u30B9\u30D7\u30ED\u30FC\u30E9\u30FC\u3067\u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  "msg.createFailed": "\u51E6\u7406\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002",
  "msg.fileExists": "\u540C\u540D\u306E\u30CE\u30FC\u30C8\u304C\u65E2\u306B\u5B58\u5728\u3057\u307E\u3059\u3002",
  "msg.noteWriteFailed": "\u30CE\u30FC\u30C8\u306E\u4F5C\u6210\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u4FDD\u5B58\u5148\u30D5\u30A9\u30EB\u30C0\u30FC\u306E\u5B58\u5728\u3068\u66F8\u304D\u8FBC\u307F\u6A29\u9650\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  "msg.fsAccessDenied": "\u6A29\u9650\u4E0D\u8DB3\u307E\u305F\u306F\u30D5\u30A1\u30A4\u30EB\u304C\u30ED\u30C3\u30AF\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u30D5\u30A9\u30EB\u30C0\u30FC\u306E\u30A2\u30AF\u30BB\u30B9\u6A29\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  "msg.enterTitle": "\u30CE\u30FC\u30C8\u306E\u30BF\u30A4\u30C8\u30EB\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u7A7A\u6B04\u306E\u5834\u5408\u306F\u65E2\u5B9A\u306E\u30BF\u30A4\u30C8\u30EB\u304C\u4F7F\u7528\u3055\u308C\u307E\u3059\u3002",
  "msg.selectExtension": "\u30CE\u30FC\u30C8\u306E\u62E1\u5F35\u5B50\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  "msg.selectTemplate": "\u9069\u7528\u3059\u308B\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  "msg.templateNone": "\u9069\u7528\u3057\u306A\u3044",
  "msg.templateReadFailed": "\u9078\u629E\u3057\u305F\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u306E\u8AAD\u307F\u53D6\u308A\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u30D1\u30B9\u3068\u6A29\u9650\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  "msg.templateFolderRequired": "\u62E1\u5F35\u6A5F\u80FD\u306E\u8A2D\u5B9A\u3067\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u30D5\u30A9\u30EB\u30C0\u30FC\u3092\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  "msg.templateFolderInvalid": "\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u30D5\u30A9\u30EB\u30C0\u30FC\u304C\u5B58\u5728\u3057\u306A\u3044\u304B\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u305B\u3093\u3002\u8A2D\u5B9A\u306E\u30D1\u30B9\u3068\u6A29\u9650\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  "msg.templateExists": "\u540C\u540D\u306E\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u304C\u65E2\u306B\u5B58\u5728\u3057\u307E\u3059\u3002",
  "msg.noTemplates": "\u5229\u7528\u53EF\u80FD\u306A\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
  "msg.noTemplatesDelete": "\u524A\u9664\u53EF\u80FD\u306A\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
  "msg.confirmDelete": "\u672C\u5F53\u306B\u300C{0}\u300D\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F",
  "msg.enterTemplateName": "\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u62E1\u5F35\u5B50\u672A\u6307\u5B9A\u306E\u5834\u5408\u306F .txt \u304C\u4F7F\u7528\u3055\u308C\u307E\u3059\u3002",
  "msg.templateDeleteFailed": "\u9078\u629E\u3057\u305F\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u306E\u524A\u9664\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u30D1\u30B9\u3068\u6A29\u9650\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  "msg.templateWriteFailed": "\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u306E\u4F5C\u6210\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u30D5\u30A9\u30EB\u30C0\u30FC\u306E\u30D1\u30B9\u3068\u66F8\u304D\u8FBC\u307F\u6A29\u9650\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
};

// src/settings.ts
var vscode = __toESM(require("vscode"));
var DEFAULT_SETTINGS = {
  fileName: "NewNote",
  fileExtensions: [],
  fileFormat: "{date}_{datetime}_{title}.{ext}",
  templateFolder: ""
};
var SettingsService = class {
  constructor(configuration) {
    this.configuration = configuration;
  }
  getSettings() {
    const config = this.configuration ?? vscode.workspace.getConfiguration("quiqNotes");
    return {
      fileName: normalizeString(config.get("fileName"), DEFAULT_SETTINGS.fileName),
      fileExtensions: parseFileExtensions(config.get("fileExtensions")),
      fileFormat: normalizeString(config.get("fileFormat"), DEFAULT_SETTINGS.fileFormat),
      templateFolder: normalizeOptionalString(config.get("templateFolder"))
    };
  }
};
function parseFileExtensions(value) {
  if (typeof value === "string") {
    return normalizeExtensionList(value.split(","));
  }
  if (Array.isArray(value)) {
    return normalizeExtensionList(value);
  }
  return [];
}
function normalizeExtensionList(values) {
  return values.map((item) => typeof item === "string" ? item : "").map(normalizeExtension).filter((item) => item.length > 0);
}
function normalizeExtension(ext) {
  const trimmed = ext.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.startsWith(".") ? trimmed.slice(1) : trimmed;
}
function normalizeString(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}
function normalizeOptionalString(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

// src/extension.ts
var MESSAGE_KEY_MAP = {
  selectFolder: "msg.selectFolder",
  createFailed: "msg.createFailed",
  fileExists: "msg.fileExists",
  noteWriteFailed: "msg.noteWriteFailed",
  fsAccessDenied: "msg.fsAccessDenied",
  enterTitle: "msg.enterTitle",
  selectExtension: "msg.selectExtension",
  selectTemplate: "msg.selectTemplate",
  templateNone: "msg.templateNone",
  templateReadFailed: "msg.templateReadFailed",
  templateFolderRequired: "msg.templateFolderRequired",
  templateFolderInvalid: "msg.templateFolderInvalid",
  templateExists: "msg.templateExists",
  noTemplates: "msg.noTemplates",
  noTemplatesDelete: "msg.noTemplatesDelete",
  confirmDelete: "msg.confirmDelete",
  enterTemplateName: "msg.enterTemplateName",
  templateDeleteFailed: "msg.templateDeleteFailed",
  templateWriteFailed: "msg.templateWriteFailed"
};
function activate(context) {
  const settingsService = new SettingsService();
  const disposable = vscode2.commands.registerCommand("quiqnotes.cmd.createNote", async (resource) => {
    await createNote(settingsService, resource);
  });
  const createTemplateCmd = vscode2.commands.registerCommand("quiqnotes.cmd.createTemplate", async () => {
    await createTemplate(settingsService);
  });
  const openTemplateCmd = vscode2.commands.registerCommand("quiqnotes.cmd.openTemplate", async () => {
    await openTemplate(settingsService);
  });
  const deleteTemplateCmd = vscode2.commands.registerCommand("quiqnotes.cmd.deleteTemplate", async () => {
    await deleteTemplate(settingsService);
  });
  context.subscriptions.push(disposable, createTemplateCmd, openTemplateCmd, deleteTemplateCmd);
}
function deactivate() {
}
async function createNote(settingsService, resource) {
  const targetFolder = await resolveTargetFolder(resource);
  if (!targetFolder) {
    vscode2.window.showErrorMessage(getMessage("selectFolder"));
    return;
  }
  const settings = settingsService.getSettings();
  const titleInput = await promptTitle(settings);
  if (titleInput === void 0) {
    return;
  }
  const resolvedTitle = titleInput.trim().length > 0 ? titleInput : settings.fileName;
  const extension = await pickExtension(settings);
  if (!extension) {
    return;
  }
  const now = /* @__PURE__ */ new Date();
  const baseFileName = buildFileName(now, resolvedTitle, extension, settings);
  const uniqueFileName = await ensureUniqueFileName(
    baseFileName,
    async (candidate) => pathExists(vscode2.Uri.joinPath(targetFolder, candidate))
  );
  const fileUri = vscode2.Uri.joinPath(targetFolder, uniqueFileName);
  const templateContent = await loadTemplateContent(settings, { now, title: resolvedTitle, extension });
  try {
    if (await pathExists(fileUri)) {
      vscode2.window.showErrorMessage(getMessage("fileExists"));
      return;
    }
    await vscode2.workspace.fs.writeFile(fileUri, new import_util.TextEncoder().encode(templateContent));
    const document = await vscode2.workspace.openTextDocument(fileUri);
    await vscode2.window.showTextDocument(document);
  } catch (error) {
    console.error("Failed to create note", error);
    const messageKey = mapFsErrorToMessageKey(error, "noteWriteFailed");
    vscode2.window.showErrorMessage(getMessage(messageKey));
  }
}
async function resolveTargetFolder(resource) {
  if (resource) {
    return ensureDirectory(resource);
  }
  const explorerSelection = await getExplorerSelectionUri();
  if (explorerSelection) {
    return ensureDirectory(explorerSelection);
  }
  return void 0;
}
async function ensureDirectory(resource) {
  if (resource.scheme !== "file") {
    return void 0;
  }
  try {
    const stat = await vscode2.workspace.fs.stat(resource);
    if ((stat.type & vscode2.FileType.Directory) === vscode2.FileType.Directory) {
      return resource;
    }
    if ((stat.type & vscode2.FileType.File) === vscode2.FileType.File) {
      return vscode2.Uri.file(path.dirname(resource.fsPath));
    }
  } catch {
  }
  return void 0;
}
async function pathExists(uri) {
  try {
    await vscode2.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}
async function createTemplate(settingsService) {
  const settings = settingsService.getSettings();
  const folder = await resolveTemplateFolderWithNotification(settings.templateFolder, "templateFolderRequired");
  if (!folder) {
    return;
  }
  const nameInput = await vscode2.window.showInputBox({
    prompt: getMessage("enterTemplateName"),
    ignoreFocusOut: true
  });
  if (nameInput === void 0) {
    return;
  }
  const validation = await validateTemplateCreation(folder, nameInput, (uri) => pathExists(uri));
  if (validation.error === "invalidName") {
    vscode2.window.showErrorMessage(getMessage("createFailed"));
    return;
  }
  if (validation.error === "exists") {
    vscode2.window.showErrorMessage(getMessage("templateExists"));
    return;
  }
  try {
    await vscode2.workspace.fs.writeFile(validation.uri, new import_util.TextEncoder().encode(""));
    const document = await vscode2.workspace.openTextDocument(validation.uri);
    await vscode2.window.showTextDocument(document);
  } catch (error) {
    console.error("Failed to create template", error);
    const messageKey = mapFsErrorToMessageKey(error, "templateWriteFailed");
    vscode2.window.showErrorMessage(getMessage(messageKey));
  }
}
async function openTemplate(settingsService) {
  const folder = await resolveTemplateFolderWithNotification(settingsService.getSettings().templateFolder, "noTemplates");
  if (!folder) {
    return;
  }
  const templates = await listTemplates(folder, handleTemplateFolderError);
  if (templates.length === 0) {
    vscode2.window.showErrorMessage(getMessage("noTemplates"));
    return;
  }
  const picked = await pickTemplate(templates, { includeNone: false });
  if (!picked) {
    return;
  }
  try {
    const document = await vscode2.workspace.openTextDocument(picked);
    await vscode2.window.showTextDocument(document);
  } catch (error) {
    console.error("Failed to open template", error);
    vscode2.window.showErrorMessage(getMessage("createFailed"));
  }
}
async function deleteTemplate(settingsService) {
  const folder = await resolveTemplateFolderWithNotification(
    settingsService.getSettings().templateFolder,
    "noTemplatesDelete"
  );
  if (!folder) {
    return;
  }
  const templates = await listTemplates(folder, handleTemplateFolderError);
  if (templates.length === 0) {
    vscode2.window.showErrorMessage(getMessage("noTemplatesDelete"));
    return;
  }
  const picked = await pickTemplate(templates, { includeNone: false });
  if (!picked) {
    return;
  }
  const shouldDelete = await confirmTemplateDeletion(path.parse(picked.fsPath).name, async (message) => {
    const result = await vscode2.window.showWarningMessage(message, { modal: true }, { title: "OK" }, { title: "Cancel", isCloseAffordance: true });
    return result?.title === "OK";
  });
  if (!shouldDelete) {
    return;
  }
  try {
    await vscode2.workspace.fs.delete(picked);
  } catch (error) {
    console.error("Failed to delete template", error);
    const messageKey = mapFsErrorToMessageKey(error, "templateDeleteFailed");
    vscode2.window.showErrorMessage(getMessage(messageKey));
  }
}
async function promptTitle(settings) {
  return vscode2.window.showInputBox({
    prompt: getMessage("enterTitle"),
    placeHolder: settings.fileName,
    ignoreFocusOut: true
  });
}
function buildFileName(now, titleInput, extension, settings) {
  const date = formatDate(now);
  const dateMdy = formatDateMdy(now);
  const dateDmy = formatDateDmy(now);
  const time = formatTime(now);
  const title = buildTitleSegment(now, titleInput, settings);
  const ext = buildExtensionSegment(extension);
  const template = settings.fileFormat.trim().length > 0 ? settings.fileFormat.trim() : DEFAULT_SETTINGS.fileFormat;
  const replacements = {
    "{date}": date,
    "{date_mdy}": dateMdy,
    "{date_dmy}": dateDmy,
    "{datetime}": time,
    "{title}": title,
    "{ext}": ext
  };
  return Object.entries(replacements).reduce((result, [key, value]) => result.replaceAll(key, value), template);
}
function buildTitleSegment(now, rawTitle, settings) {
  const hasInput = rawTitle.trim().length > 0;
  const baseTitle = hasInput ? rawTitle : settings.fileName;
  const expandedTitle = hasInput ? expandTitlePlaceholders(now, baseTitle) : baseTitle;
  const sanitizedTitle = sanitizeTitle(expandedTitle);
  const fallbackTitle = sanitizeTitle(settings.fileName) || DEFAULT_SETTINGS.fileName;
  const slugged = slugify(sanitizedTitle);
  return slugged.length > 0 ? slugged : slugify(fallbackTitle);
}
function expandTitlePlaceholders(now, value) {
  return value.replaceAll("{date}", formatDate(now)).replaceAll("{date_mdy}", formatDateMdy(now)).replaceAll("{date_dmy}", formatDateDmy(now)).replaceAll("{datetime}", formatTime(now));
}
function formatDate(date) {
  const { year, month, day } = formatDateParts(date);
  return `${year}-${month}-${day}`;
}
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}${minutes}${seconds}`;
}
function formatDateParts(date) {
  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1).padStart(2, "0"),
    day: String(date.getDate()).padStart(2, "0")
  };
}
function formatDateMdy(date) {
  const { year, month, day } = formatDateParts(date);
  return `${month}-${day}-${year}`;
}
function formatDateDmy(date) {
  const { year, month, day } = formatDateParts(date);
  return `${day}-${month}-${year}`;
}
function sanitizeTitle(value) {
  const withoutLineBreaks = value.replace(/[\r\n]+/g, " ");
  const withoutForbidden = withoutLineBreaks.replace(/[\\/:*?"<>|]/g, "");
  const collapsedWhitespace = withoutForbidden.replace(/\s+/g, " ").trim();
  return collapsedWhitespace;
}
function slugify(title) {
  const hyphenated = title.replace(/\s+/g, "-");
  const collapsed = hyphenated.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  return collapsed.length > 0 ? collapsed : "note";
}
function sanitizeExtension(extension) {
  const trimmed = extension.trim();
  if (trimmed.length === 0) {
    return "";
  }
  return trimmed.startsWith(".") ? trimmed.slice(1) : trimmed;
}
function buildExtensionSegment(extension) {
  return sanitizeExtension(extension) || "md";
}
async function pickExtension(settings) {
  const normalized = settings.fileExtensions.map(sanitizeExtension).filter((ext) => ext.length > 0);
  if (normalized.length === 0) {
    return "md";
  }
  if (normalized.length === 1) {
    return normalized[0];
  }
  const items = normalized.map((ext) => ({
    label: `.${ext}`,
    ext
  }));
  const picked = await vscode2.window.showQuickPick(items, {
    placeHolder: getMessage("selectExtension"),
    ignoreFocusOut: true
  });
  return picked?.ext;
}
async function ensureUniqueFileName(fileName, exists) {
  if (!await exists(fileName)) {
    return fileName;
  }
  const { name, ext } = splitFileName(fileName);
  let counter = 1;
  while (await exists(`${name}-${counter}${ext}`)) {
    counter += 1;
  }
  return `${name}-${counter}${ext}`;
}
function splitFileName(fileName) {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot > 0) {
    return { name: fileName.slice(0, lastDot), ext: fileName.slice(lastDot) };
  }
  return { name: fileName, ext: "" };
}
async function loadTemplateContent(settings, context) {
  const resolution = await resolveTemplateFolderDetailed(settings.templateFolder);
  if (!resolution.uri) {
    if (resolution.reason === "invalid" || resolution.reason === "noAccess") {
      const messageKey = resolution.reason === "noAccess" ? "fsAccessDenied" : "templateFolderInvalid";
      vscode2.window.showErrorMessage(getMessage(messageKey));
    }
    return "";
  }
  const templates = await listTemplates(resolution.uri, (error) => handleTemplateFolderError(error));
  if (templates.length === 0) {
    return "";
  }
  const picked = await pickTemplate(templates);
  if (!picked) {
    return "";
  }
  try {
    const contentBytes = await vscode2.workspace.fs.readFile(picked);
    const content = new import_util.TextDecoder().decode(contentBytes);
    const ctx = buildTemplateContext(context.now, context.title, context.extension, settings);
    return applyTemplateVariables(content, ctx);
  } catch (error) {
    console.error("Failed to read template", error);
    const messageKey = mapFsErrorToMessageKey(error, "templateReadFailed");
    vscode2.window.showErrorMessage(getMessage(messageKey));
    return "";
  }
}
function buildTemplateContext(now, rawTitle, extension, settings) {
  const date = formatDate(now);
  const dateMdy = formatDateMdy(now);
  const dateDmy = formatDateDmy(now);
  const time = formatTime(now);
  const title = buildTitleSegment(now, rawTitle, settings);
  const ext = buildExtensionSegment(extension);
  return { date, dateMdy, dateDmy, datetime: time, title, ext };
}
function isFsNoPermissions(error) {
  return error instanceof vscode2.FileSystemError && error.code === "NoPermissions";
}
function mapFsErrorToMessageKey(error, fallback) {
  if (isFsNoPermissions(error)) {
    return "fsAccessDenied";
  }
  return fallback;
}
async function resolveTemplateFolderDetailed(templateFolder) {
  if (!templateFolder || templateFolder.trim().length === 0) {
    return { reason: "notConfigured" };
  }
  const folderPath = templateFolder.trim();
  const folderUri = path.isAbsolute(folderPath) ? vscode2.Uri.file(folderPath) : resolveRelativeToWorkspace(folderPath);
  if (!folderUri) {
    return { reason: "invalid" };
  }
  try {
    const stat = await vscode2.workspace.fs.stat(folderUri);
    if ((stat.type & vscode2.FileType.Directory) === vscode2.FileType.Directory) {
      return { uri: folderUri, reason: "ok" };
    }
    return { reason: "invalid" };
  } catch (error) {
    if (isFsNoPermissions(error)) {
      return { reason: "noAccess" };
    }
    return { reason: "invalid" };
  }
}
function resolveRelativeToWorkspace(relativePath) {
  const workspace3 = vscode2.workspace.workspaceFolders?.[0];
  if (!workspace3) {
    return void 0;
  }
  return vscode2.Uri.joinPath(workspace3.uri, relativePath);
}
function handleTemplateFolderError(error) {
  const messageKey = mapFsErrorToMessageKey(error, "templateFolderInvalid");
  vscode2.window.showErrorMessage(getMessage(messageKey));
}
async function listTemplates(folder, onError) {
  try {
    const entries = await vscode2.workspace.fs.readDirectory(folder);
    return entries.filter(([, type]) => (type & vscode2.FileType.File) === vscode2.FileType.File).map(([name]) => vscode2.Uri.joinPath(folder, name));
  } catch (error) {
    console.error("Failed to list templates", error);
    onError?.(error);
    return [];
  }
}
async function pickTemplate(templates, options) {
  if (templates.length === 0) {
    return void 0;
  }
  const items = options?.includeNone === false ? [] : [{ label: getMessage("templateNone"), uri: void 0 }];
  items.push(
    ...templates.map((uri) => ({
      label: path.parse(uri.fsPath).name,
      uri
    }))
  );
  const picked = await vscode2.window.showQuickPick(items, {
    placeHolder: getMessage("selectTemplate"),
    ignoreFocusOut: true
  });
  return picked?.uri;
}
function applyTemplateVariables(content, context) {
  return content.replaceAll("{date}", context.date).replaceAll("{date_mdy}", context.dateMdy).replaceAll("{date_dmy}", context.dateDmy).replaceAll("{datetime}", context.datetime).replaceAll("{title}", context.title).replaceAll("{ext}", context.ext);
}
async function resolveTemplateFolderWithNotification(templateFolder, errorMessageKey) {
  const result = await resolveTemplateFolderDetailed(templateFolder);
  if (result.uri) {
    return result.uri;
  }
  if (result.reason === "notConfigured") {
    vscode2.window.showErrorMessage(getMessage(errorMessageKey));
    return void 0;
  }
  const messageKey = result.reason === "noAccess" ? "fsAccessDenied" : "templateFolderInvalid";
  vscode2.window.showErrorMessage(getMessage(messageKey));
  return void 0;
}
function buildTemplateFileName(input) {
  const sanitized = sanitizeTitle(input);
  if (sanitized.length === 0) {
    return "";
  }
  const withoutExt = sanitized.replace(/\.[^./\\]+$/, "");
  return `${withoutExt}.txt`;
}
async function confirmTemplateDeletion(name, confirm) {
  return confirm(getMessage("confirmDelete", name));
}
async function validateTemplateCreation(folder, inputName, exists) {
  const fileName = buildTemplateFileName(inputName);
  if (!fileName) {
    return { error: "invalidName" };
  }
  const targetUri = vscode2.Uri.joinPath(folder, fileName);
  if (await exists(targetUri)) {
    return { error: "exists" };
  }
  return { uri: targetUri };
}
function getMessage(key, ...args) {
  const bundleKey = MESSAGE_KEY_MAP[key];
  const locale = vscode2.env.language.toLowerCase().startsWith("ja") ? "ja" : "en";
  const bundle = locale === "ja" ? package_nls_ja_default : package_nls_default;
  const template = bundle[bundleKey] ?? bundleKey;
  return formatMessage(template, args);
}
function formatMessage(template, args) {
  return args.reduce((message, value, index) => {
    const placeholder = `{${index}}`;
    return message.replace(placeholder, String(value));
  }, template);
}
async function getExplorerSelectionUri() {
  const previousClipboard = await vscode2.env.clipboard.readText();
  try {
    await vscode2.commands.executeCommand("copyFilePath");
    const copied = await vscode2.env.clipboard.readText();
    if (!copied || copied === previousClipboard) {
      return void 0;
    }
    const firstPath = copied.split(/\r?\n/).find((line) => line.trim().length > 0);
    if (!firstPath) {
      return void 0;
    }
    const candidate = vscode2.Uri.file(firstPath);
    const activeEditorUri = vscode2.window.activeTextEditor?.document.uri;
    if (activeEditorUri?.fsPath === candidate.fsPath) {
      return void 0;
    }
    try {
      await vscode2.workspace.fs.stat(candidate);
      return candidate;
    } catch {
      return void 0;
    }
  } catch {
    return void 0;
  } finally {
    await vscode2.env.clipboard.writeText(previousClipboard);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MESSAGE_KEY_MAP,
  activate,
  applyTemplateVariables,
  buildFileName,
  buildTemplateFileName,
  confirmTemplateDeletion,
  deactivate,
  ensureUniqueFileName,
  sanitizeExtension,
  sanitizeTitle,
  slugify,
  validateTemplateCreation
});
//# sourceMappingURL=extension.js.map
