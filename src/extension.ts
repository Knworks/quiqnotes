import * as path from 'path';
import * as vscode from 'vscode';
import { TextEncoder, TextDecoder } from 'util';
import enMessages from '../package.nls.json';
import jaMessages from '../package.nls.ja.json';
import { DEFAULT_SETTINGS, QuiqNotesSettings, SettingsService } from './settings';

export const MESSAGE_KEY_MAP = {
	selectFolder: 'msg.selectFolder',
	createFailed: 'msg.createFailed',
	fileExists: 'msg.fileExists',
	noteWriteFailed: 'msg.noteWriteFailed',
	fsAccessDenied: 'msg.fsAccessDenied',
	enterTitle: 'msg.enterTitle',
	selectExtension: 'msg.selectExtension',
	selectTemplate: 'msg.selectTemplate',
	templateNone: 'msg.templateNone',
	templateReadFailed: 'msg.templateReadFailed',
	templateFolderRequired: 'msg.templateFolderRequired',
	templateFolderInvalid: 'msg.templateFolderInvalid',
	templateExists: 'msg.templateExists',
	noTemplates: 'msg.noTemplates',
	noTemplatesDelete: 'msg.noTemplatesDelete',
	confirmDelete: 'msg.confirmDelete',
	enterTemplateName: 'msg.enterTemplateName',
	templateDeleteFailed: 'msg.templateDeleteFailed',
	templateWriteFailed: 'msg.templateWriteFailed',
} as const;
type MessageKey = keyof typeof MESSAGE_KEY_MAP;

export function activate(context: vscode.ExtensionContext) {
	const settingsService = new SettingsService();
	const disposable = vscode.commands.registerCommand('quiqnotes.cmd.createNote', async (resource?: vscode.Uri) => {
		await createNote(settingsService, resource);
	});

	const createTemplateCmd = vscode.commands.registerCommand('quiqnotes.cmd.createTemplate', async () => {
		await createTemplate(settingsService);
	});

	const openTemplateCmd = vscode.commands.registerCommand('quiqnotes.cmd.openTemplate', async () => {
		await openTemplate(settingsService);
	});

	const deleteTemplateCmd = vscode.commands.registerCommand('quiqnotes.cmd.deleteTemplate', async () => {
		await deleteTemplate(settingsService);
	});

	context.subscriptions.push(disposable, createTemplateCmd, openTemplateCmd, deleteTemplateCmd);
}

export function deactivate() {}

async function createNote(settingsService: SettingsService, resource?: vscode.Uri): Promise<void> {
	const targetFolder = await resolveTargetFolder(resource);

	if (!targetFolder) {
		vscode.window.showErrorMessage(getMessage('selectFolder'));
		return;
	}

	const settings = settingsService.getSettings();
	const titleInput = await promptTitle(settings);

	if (titleInput === undefined) {
		return;
	}

	const resolvedTitle = titleInput.trim().length > 0 ? titleInput : settings.fileName;
	const extension = await pickExtension(settings);

	if (!extension) {
		return;
	}

	const now = new Date();
	const baseFileName = buildFileName(now, resolvedTitle, extension, settings);

	const uniqueFileName = await ensureUniqueFileName(baseFileName, async (candidate) =>
		pathExists(vscode.Uri.joinPath(targetFolder, candidate)),
	);

	const fileUri = vscode.Uri.joinPath(targetFolder, uniqueFileName);
	const templateContent = await loadTemplateContent(settings, { now, title: resolvedTitle, extension });

	try {
		if (await pathExists(fileUri)) {
			vscode.window.showErrorMessage(getMessage('fileExists'));
			return;
		}

		await vscode.workspace.fs.writeFile(fileUri, new TextEncoder().encode(templateContent));
		const document = await vscode.workspace.openTextDocument(fileUri);
		await vscode.window.showTextDocument(document);
	} catch (error) {
		console.error('Failed to create note', error);
		const messageKey = mapFsErrorToMessageKey(error, 'noteWriteFailed');
		vscode.window.showErrorMessage(getMessage(messageKey));
	}
}

async function resolveTargetFolder(resource?: vscode.Uri): Promise<vscode.Uri | undefined> {
	if (resource) {
		return ensureDirectory(resource);
	}

	const explorerSelection = await getExplorerSelectionUri();
	if (explorerSelection) {
		return ensureDirectory(explorerSelection);
	}

	return undefined;
}

async function ensureDirectory(resource: vscode.Uri): Promise<vscode.Uri | undefined> {
	if (resource.scheme !== 'file') {
		return undefined;
	}

	try {
		const stat = await vscode.workspace.fs.stat(resource);
		if ((stat.type & vscode.FileType.Directory) === vscode.FileType.Directory) {
			return resource;
		}

		if ((stat.type & vscode.FileType.File) === vscode.FileType.File) {
			return vscode.Uri.file(path.dirname(resource.fsPath));
		}
	} catch {
		// ignore error and continue evaluating other candidates
	}

	return undefined;
}

async function pathExists(uri: vscode.Uri): Promise<boolean> {
	try {
		await vscode.workspace.fs.stat(uri);
		return true;
	} catch {
		return false;
	}
}

async function createTemplate(settingsService: SettingsService): Promise<void> {
	const settings = settingsService.getSettings();
	const folder = await resolveTemplateFolderWithNotification(settings.templateFolder, 'templateFolderRequired');

	if (!folder) {
		return;
	}

	const nameInput = await vscode.window.showInputBox({
		prompt: getMessage('enterTemplateName'),
		ignoreFocusOut: true,
	});

	if (nameInput === undefined) {
		return;
	}

	const validation = await validateTemplateCreation(folder, nameInput, (uri) => pathExists(uri));

	if (validation.error === 'invalidName') {
		vscode.window.showErrorMessage(getMessage('createFailed'));
		return;
	}

	if (validation.error === 'exists') {
		vscode.window.showErrorMessage(getMessage('templateExists'));
		return;
	}

	try {
		await vscode.workspace.fs.writeFile(validation.uri, new TextEncoder().encode(''));
		const document = await vscode.workspace.openTextDocument(validation.uri);
		await vscode.window.showTextDocument(document);
	} catch (error) {
		console.error('Failed to create template', error);
		const messageKey = mapFsErrorToMessageKey(error, 'templateWriteFailed');
		vscode.window.showErrorMessage(getMessage(messageKey));
	}
}

async function openTemplate(settingsService: SettingsService): Promise<void> {
	const folder = await resolveTemplateFolderWithNotification(settingsService.getSettings().templateFolder, 'noTemplates');
	if (!folder) {
		return;
	}

	const templates = await listTemplates(folder, handleTemplateFolderError);
	if (templates.length === 0) {
		vscode.window.showErrorMessage(getMessage('noTemplates'));
		return;
	}

	const picked = await pickTemplate(templates, { includeNone: false });
	if (!picked) {
		return;
	}

	try {
		const document = await vscode.workspace.openTextDocument(picked);
		await vscode.window.showTextDocument(document);
	} catch (error) {
		console.error('Failed to open template', error);
		vscode.window.showErrorMessage(getMessage('createFailed'));
	}
}

async function deleteTemplate(settingsService: SettingsService): Promise<void> {
	const folder = await resolveTemplateFolderWithNotification(
		settingsService.getSettings().templateFolder,
		'noTemplatesDelete',
	);
	if (!folder) {
		return;
	}

	const templates = await listTemplates(folder, handleTemplateFolderError);
	if (templates.length === 0) {
		vscode.window.showErrorMessage(getMessage('noTemplatesDelete'));
		return;
	}

	const picked = await pickTemplate(templates, { includeNone: false });
	if (!picked) {
		return;
	}

	const shouldDelete = await confirmTemplateDeletion(path.parse(picked.fsPath).name, async (message) => {
		const result = await vscode.window.showWarningMessage(message, { modal: true }, { title: 'OK' }, { title: 'Cancel', isCloseAffordance: true });
		return result?.title === 'OK';
	});

	if (!shouldDelete) {
		return;
	}

	try {
		await vscode.workspace.fs.delete(picked);
	} catch (error) {
		console.error('Failed to delete template', error);
		const messageKey = mapFsErrorToMessageKey(error, 'templateDeleteFailed');
		vscode.window.showErrorMessage(getMessage(messageKey));
	}
}

async function promptTitle(settings: QuiqNotesSettings): Promise<string | undefined> {
	return vscode.window.showInputBox({
		prompt: getMessage('enterTitle'),
		placeHolder: settings.fileName,
		ignoreFocusOut: true,
	});
}

export function buildFileName(now: Date, titleInput: string, extension: string, settings: QuiqNotesSettings): string {
	const date = formatDate(now);
	const dateMdy = formatDateMdy(now);
	const dateDmy = formatDateDmy(now);
	const time = formatTime(now);
	const title = buildTitleSegment(now, titleInput, settings);
	const ext = buildExtensionSegment(extension);
	const template = settings.fileFormat.trim().length > 0 ? settings.fileFormat.trim() : DEFAULT_SETTINGS.fileFormat;

	const replacements: Record<string, string> = {
		'{date}': date,
		'{date_mdy}': dateMdy,
		'{date_dmy}': dateDmy,
		'{datetime}': time,
		'{title}': title,
		'{ext}': ext,
	};

	return Object.entries(replacements).reduce((result, [key, value]) => result.replaceAll(key, value), template);
}

function buildTitleSegment(now: Date, rawTitle: string, settings: QuiqNotesSettings): string {
	const hasInput = rawTitle.trim().length > 0;
	const baseTitle = hasInput ? rawTitle : settings.fileName;
	const expandedTitle = hasInput ? expandTitlePlaceholders(now, baseTitle) : baseTitle;
	const sanitizedTitle = sanitizeTitle(expandedTitle);
	const fallbackTitle = sanitizeTitle(settings.fileName) || DEFAULT_SETTINGS.fileName;

	const slugged = slugify(sanitizedTitle);
	return slugged.length > 0 ? slugged : slugify(fallbackTitle);
}

function expandTitlePlaceholders(now: Date, value: string): string {
	return value
		.replaceAll('{date}', formatDate(now))
		.replaceAll('{date_mdy}', formatDateMdy(now))
		.replaceAll('{date_dmy}', formatDateDmy(now))
		.replaceAll('{datetime}', formatTime(now));
}

function formatDate(date: Date): string {
	const { year, month, day } = formatDateParts(date);
	return `${year}-${month}-${day}`;
}

function formatTime(date: Date): string {
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');

	return `${hours}${minutes}${seconds}`;
}

function formatDateParts(date: Date): { year: string; month: string; day: string } {
	return {
		year: String(date.getFullYear()),
		month: String(date.getMonth() + 1).padStart(2, '0'),
		day: String(date.getDate()).padStart(2, '0'),
	};
}

function formatDateMdy(date: Date): string {
	const { year, month, day } = formatDateParts(date);
	return `${month}-${day}-${year}`;
}

function formatDateDmy(date: Date): string {
	const { year, month, day } = formatDateParts(date);
	return `${day}-${month}-${year}`;
}

export function sanitizeTitle(value: string): string {
	const withoutLineBreaks = value.replace(/[\r\n]+/g, ' ');
	const withoutForbidden = withoutLineBreaks.replace(/[\\/:*?"<>|]/g, '');
	const collapsedWhitespace = withoutForbidden.replace(/\s+/g, ' ').trim();

	return collapsedWhitespace;
}

export function slugify(title: string): string {
	const hyphenated = title.replace(/\s+/g, '-');
	const collapsed = hyphenated.replace(/-+/g, '-').replace(/^-+|-+$/g, '');

	return collapsed.length > 0 ? collapsed : 'note';
}

export function sanitizeExtension(extension: string): string {
	const trimmed = extension.trim();
	if (trimmed.length === 0) {
		return '';
	}

	return trimmed.startsWith('.') ? trimmed.slice(1) : trimmed;
}

function buildExtensionSegment(extension: string): string {
	return sanitizeExtension(extension) || 'md';
}

async function pickExtension(settings: QuiqNotesSettings): Promise<string | undefined> {
	const normalized = settings.fileExtensions.map(sanitizeExtension).filter((ext) => ext.length > 0);

	if (normalized.length === 0) {
		return 'md';
	}

	if (normalized.length === 1) {
		return normalized[0];
	}

	const items = normalized.map((ext) => ({
		label: `.${ext}`,
		ext,
	}));

	const picked = await vscode.window.showQuickPick(items, {
		placeHolder: getMessage('selectExtension'),
		ignoreFocusOut: true,
	});

	return picked?.ext;
}

export async function ensureUniqueFileName(
	fileName: string,
	exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
	if (!(await exists(fileName))) {
		return fileName;
	}

	const { name, ext } = splitFileName(fileName);
	let counter = 1;

	// 最低でも1回は重複しているので連番を開始
	// 無限ループ防止は不要（必ずどこかで空きが見つかる前提）
	while (await exists(`${name}-${counter}${ext}`)) {
		counter += 1;
	}

	return `${name}-${counter}${ext}`;
}

function splitFileName(fileName: string): { name: string; ext: string } {
	const lastDot = fileName.lastIndexOf('.');

	if (lastDot > 0) {
		return { name: fileName.slice(0, lastDot), ext: fileName.slice(lastDot) };
	}

	return { name: fileName, ext: '' };
}

async function loadTemplateContent(
	settings: QuiqNotesSettings,
	context: { now: Date; title: string; extension: string },
): Promise<string> {
	const resolution = await resolveTemplateFolderDetailed(settings.templateFolder);
	if (!resolution.uri) {
		if (resolution.reason === 'invalid' || resolution.reason === 'noAccess') {
			const messageKey = resolution.reason === 'noAccess' ? 'fsAccessDenied' : 'templateFolderInvalid';
			vscode.window.showErrorMessage(getMessage(messageKey));
		}

		return '';
	}

	const templates = await listTemplates(resolution.uri, (error) => handleTemplateFolderError(error));
	if (templates.length === 0) {
		return '';
	}

	const picked = await pickTemplate(templates);
	if (!picked) {
		return '';
	}

	try {
		const contentBytes = await vscode.workspace.fs.readFile(picked);
		const content = new TextDecoder().decode(contentBytes);
		const ctx = buildTemplateContext(context.now, context.title, context.extension, settings);
		return applyTemplateVariables(content, ctx);
	} catch (error) {
		console.error('Failed to read template', error);
		const messageKey = mapFsErrorToMessageKey(error, 'templateReadFailed');
		vscode.window.showErrorMessage(getMessage(messageKey));
		return '';
	}
}

function buildTemplateContext(
	now: Date,
	rawTitle: string,
	extension: string,
	settings: QuiqNotesSettings,
): TemplateContext {
	const date = formatDate(now);
	const dateMdy = formatDateMdy(now);
	const dateDmy = formatDateDmy(now);
	const time = formatTime(now);
	const title = buildTitleSegment(now, rawTitle, settings);
	const ext = buildExtensionSegment(extension);

	return { date, dateMdy, dateDmy, datetime: time, title, ext };
}

function isFsNoPermissions(error: unknown): boolean {
	return error instanceof vscode.FileSystemError && error.code === 'NoPermissions';
}

function mapFsErrorToMessageKey(error: unknown, fallback: MessageKey): MessageKey {
	if (isFsNoPermissions(error)) {
		return 'fsAccessDenied';
	}

	return fallback;
}

type TemplateFolderResolution =
	| { uri: vscode.Uri; reason: 'ok' }
	| { uri?: undefined; reason: 'notConfigured' | 'invalid' | 'noAccess' };

async function resolveTemplateFolderDetailed(templateFolder: string): Promise<TemplateFolderResolution> {
	if (!templateFolder || templateFolder.trim().length === 0) {
		return { reason: 'notConfigured' };
	}

	const folderPath = templateFolder.trim();
	const folderUri = path.isAbsolute(folderPath)
		? vscode.Uri.file(folderPath)
		: resolveRelativeToWorkspace(folderPath);

	if (!folderUri) {
		return { reason: 'invalid' };
	}

	try {
		const stat = await vscode.workspace.fs.stat(folderUri);
		if ((stat.type & vscode.FileType.Directory) === vscode.FileType.Directory) {
			return { uri: folderUri, reason: 'ok' };
		}

		return { reason: 'invalid' };
	} catch (error) {
		if (isFsNoPermissions(error)) {
			return { reason: 'noAccess' };
		}

		return { reason: 'invalid' };
	}
}

async function resolveTemplateFolder(templateFolder: string): Promise<vscode.Uri | undefined> {
	const result = await resolveTemplateFolderDetailed(templateFolder);
	return result.uri;
}

function resolveRelativeToWorkspace(relativePath: string): vscode.Uri | undefined {
	const workspace = vscode.workspace.workspaceFolders?.[0];
	if (!workspace) {
		return undefined;
	}

	return vscode.Uri.joinPath(workspace.uri, relativePath);
}

function handleTemplateFolderError(error: unknown): void {
	const messageKey = mapFsErrorToMessageKey(error, 'templateFolderInvalid');
	vscode.window.showErrorMessage(getMessage(messageKey));
}

async function listTemplates(folder: vscode.Uri, onError?: (error: unknown) => void): Promise<vscode.Uri[]> {
	try {
		const entries = await vscode.workspace.fs.readDirectory(folder);
		return entries
			.filter(([, type]) => (type & vscode.FileType.File) === vscode.FileType.File)
			.map(([name]) => vscode.Uri.joinPath(folder, name));
	} catch (error) {
		console.error('Failed to list templates', error);
		onError?.(error);
		return [];
	}
}

async function pickTemplate(templates: vscode.Uri[], options?: { includeNone?: boolean }): Promise<vscode.Uri | undefined> {
	if (templates.length === 0) {
		return undefined;
	}

	const items =
		options?.includeNone === false
			? []
			: [{ label: getMessage('templateNone'), uri: undefined as vscode.Uri | undefined }];

	items.push(
		...templates.map((uri) => ({
			label: path.parse(uri.fsPath).name,
			uri,
		})),
	);

	const picked = await vscode.window.showQuickPick(items, {
		placeHolder: getMessage('selectTemplate'),
		ignoreFocusOut: true,
	});

	return picked?.uri;
}

export interface TemplateContext {
	date: string;
	dateMdy: string;
	dateDmy: string;
	datetime: string;
	title: string;
	ext: string;
}

export function applyTemplateVariables(content: string, context: TemplateContext): string {
	return content
		.replaceAll('{date}', context.date)
		.replaceAll('{date_mdy}', context.dateMdy)
		.replaceAll('{date_dmy}', context.dateDmy)
		.replaceAll('{datetime}', context.datetime)
		.replaceAll('{title}', context.title)
		.replaceAll('{ext}', context.ext);
}

async function resolveTemplateFolderWithNotification(
	templateFolder: string,
	errorMessageKey: Extract<MessageKey, 'templateFolderRequired' | 'noTemplates' | 'noTemplatesDelete'>,
): Promise<vscode.Uri | undefined> {
	const result = await resolveTemplateFolderDetailed(templateFolder);

	if (result.uri) {
		return result.uri;
	}

	if (result.reason === 'notConfigured') {
		vscode.window.showErrorMessage(getMessage(errorMessageKey));
		return undefined;
	}

	const messageKey = result.reason === 'noAccess' ? 'fsAccessDenied' : 'templateFolderInvalid';
	vscode.window.showErrorMessage(getMessage(messageKey));
	return undefined;
}

export function buildTemplateFileName(input: string): string {
	const sanitized = sanitizeTitle(input);

	if (sanitized.length === 0) {
		return '';
	}

	const withoutExt = sanitized.replace(/\.[^./\\]+$/, '');
	return `${withoutExt}.txt`;
}

export async function confirmTemplateDeletion(
	name: string,
	confirm: (message: string) => Promise<boolean>,
): Promise<boolean> {
	return confirm(getMessage('confirmDelete', name));
}

export type TemplateCreationValidation =
	| { error: 'invalidName' }
	| { error: 'exists' }
	| { uri: vscode.Uri; error?: undefined };

export async function validateTemplateCreation(
	folder: vscode.Uri,
	inputName: string,
	exists: (uri: vscode.Uri) => Promise<boolean>,
): Promise<TemplateCreationValidation> {
	const fileName = buildTemplateFileName(inputName);
	if (!fileName) {
		return { error: 'invalidName' };
	}

	const targetUri = vscode.Uri.joinPath(folder, fileName);
	if (await exists(targetUri)) {
		return { error: 'exists' };
	}

	return { uri: targetUri };
}

function getMessage(key: MessageKey, ...args: Array<string | number>): string {
	const bundleKey = MESSAGE_KEY_MAP[key];
	const locale = vscode.env.language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
	const bundle = locale === 'ja' ? (jaMessages as Record<string, string>) : (enMessages as Record<string, string>);
	const template = bundle[bundleKey] ?? bundleKey;

	return formatMessage(template, args);
}

function formatMessage(template: string, args: Array<string | number>): string {
	return args.reduce<string>((message, value, index) => {
		const placeholder = `{${index}}`;
		return message.replace(placeholder, String(value));
	}, template);
}

async function getExplorerSelectionUri(): Promise<vscode.Uri | undefined> {
	const previousClipboard = await vscode.env.clipboard.readText();

	try {
		await vscode.commands.executeCommand('copyFilePath');
		const copied = await vscode.env.clipboard.readText();

		if (!copied || copied === previousClipboard) {
			return undefined;
		}

		const firstPath = copied.split(/\r?\n/).find((line) => line.trim().length > 0);
		if (!firstPath) {
			return undefined;
		}

		const candidate = vscode.Uri.file(firstPath);
		const activeEditorUri = vscode.window.activeTextEditor?.document.uri;

		if (activeEditorUri?.fsPath === candidate.fsPath) {
			return undefined;
		}

		try {
			await vscode.workspace.fs.stat(candidate);
			return candidate;
		} catch {
			return undefined;
		}
	} catch {
		return undefined;
	} finally {
		await vscode.env.clipboard.writeText(previousClipboard);
	}
}
