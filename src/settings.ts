import * as vscode from 'vscode';

export interface QuiqNotesSettings {
	fileName: string;
	fileExtensions: string[];
	fileFormat: string;
	templateFolder: string;
}

export const DEFAULT_SETTINGS: QuiqNotesSettings = {
	fileName: 'NewNote',
	fileExtensions: [],
	fileFormat: '{date}_{datetime}_{title}.{ext}',
	templateFolder: '',
};

export class SettingsService {
	constructor(private readonly configuration?: vscode.WorkspaceConfiguration) {}

	getSettings(): QuiqNotesSettings {
		const config = this.configuration ?? vscode.workspace.getConfiguration('quiqNotes');

		return {
			fileName: normalizeString(config.get<string>('fileName'), DEFAULT_SETTINGS.fileName),
			fileExtensions: parseFileExtensions(config.get<string | string[]>('fileExtensions')),
			fileFormat: normalizeString(config.get<string>('fileFormat'), DEFAULT_SETTINGS.fileFormat),
			templateFolder: normalizeOptionalString(config.get<string>('templateFolder')),
		};
	}
}

function parseFileExtensions(value: unknown): string[] {
	if (typeof value === 'string') {
		return normalizeExtensionList(value.split(','));
	}

	if (Array.isArray(value)) {
		return normalizeExtensionList(value);
	}

	return [];
}

function normalizeExtensionList(values: unknown[]): string[] {
	return values
		.map((item) => (typeof item === 'string' ? item : ''))
		.map(normalizeExtension)
		.filter((item) => item.length > 0);
}

function normalizeExtension(ext: string): string {
	const trimmed = ext.trim();

	if (!trimmed) {
		return '';
	}

	return trimmed.startsWith('.') ? trimmed.slice(1) : trimmed;
}

function normalizeString(value: unknown, fallback: string): string {
	if (typeof value !== 'string') {
		return fallback;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeOptionalString(value: unknown): string {
	if (typeof value !== 'string') {
		return '';
	}

	return value.trim();
}
