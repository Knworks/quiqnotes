import * as assert from 'assert';
import type * as vscode from 'vscode';
import { DEFAULT_SETTINGS, SettingsService } from '../settings';

function createConfiguration(values: Record<string, unknown>): vscode.WorkspaceConfiguration {
	return {
		get: <T>(section: string): T | undefined => values[section] as T | undefined,
	} as vscode.WorkspaceConfiguration;
}

suite('SettingsService', () => {
	test('既定値が設定されていない場合でも既定値を返す', () => {
		const service = new SettingsService(createConfiguration({}));

		const settings = service.getSettings();

		assert.deepStrictEqual(settings, DEFAULT_SETTINGS);
	});

	test('設定値をトリムし、拡張子リストを正しく解析する', () => {
		const service = new SettingsService(
			createConfiguration({
				fileName: '  Custom Title  ',
				fileExtensions: ' md , txt , .log ',
				fileFormat: ' {title}.ext ',
				templateFolder: ' templates ',
			}),
		);

		const settings = service.getSettings();

		assert.strictEqual(settings.fileName, 'Custom Title');
		assert.deepStrictEqual(settings.fileExtensions, ['md', 'txt', 'log']);
		assert.strictEqual(settings.fileFormat, '{title}.ext');
		assert.strictEqual(settings.templateFolder, 'templates');
	});

	test('無効または空の値は既定値にフォールバックする', () => {
		const service = new SettingsService(
			createConfiguration({
				fileName: '   ',
				fileExtensions: [' ', 123],
				fileFormat: '',
				templateFolder: 10
			}),
		);

		const settings = service.getSettings();

		assert.strictEqual(settings.fileName, DEFAULT_SETTINGS.fileName);
		assert.deepStrictEqual(settings.fileExtensions, []);
		assert.strictEqual(settings.fileFormat, DEFAULT_SETTINGS.fileFormat);
		assert.strictEqual(settings.templateFolder, '');
	});
});
